package com.example.demo.service.core;

import com.example.demo.model.dto.*;
import com.example.demo.service.NasaDonkiService;
import com.example.demo.service.SwpcDataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

/**
 * Uydu bazlı risk hesaplama motoru (v13 - Seeded Deterministic).
 * Gerçek verileri arka planda toplar ancak uydular için benzersiz ve tutarlı (F5 ile değişmeyen) 
 * 7.00 - 29.00 arası skorlar üretir.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RiskEngine {

    private final SwpcDataService swpcDataService;
    private final NasaDonkiService nasaDonkiService;
    private final OrbitCalculator orbitCalculator;

    public record SpaceWeatherContext(double latestKp, double windSpeed, int cmeCount) {}

    public SpaceWeatherContext createWeatherContext() {
        double kp = 3.0;
        List<KpIndexDto> kpList = swpcDataService.getKpIndex();
        if (!kpList.isEmpty()) kp = kpList.get(kpList.size() - 1).getKp_index();

        double speed = 400.0;
        List<SolarWindDto> windList = swpcDataService.getSolarWindPlasma();
        if (!windList.isEmpty()) {
            try {
                String speedStr = windList.get(windList.size() - 1).getSpeed();
                if (speedStr != null) speed = Double.parseDouble(speedStr);
            } catch (Exception ignored) {}
        }

        int cmeCount = nasaDonkiService.getCmeEvents().size();
        return new SpaceWeatherContext(kp, speed, cmeCount);
    }

    /**
     * Uydular için deterministik (tutarlı) ve benzersiz risk skoru üretir.
     * Arka planda gerçek verileri de kullanarak baz skoru etkiler.
     */
    public double calculateSatelliteRisk(OrbitCalculator.SatellitePosition pos, long noradId, SpaceWeatherContext context) {
        // Arka planda gerçek risk faktörünü hesapla (Loglama için)
        double realBaseRisk = context.latestKp() * 2.0;
        
        // Kullanıcı talebi: 7 ile 29 arasında, benzersiz ve F5 ile değişmeyen (Seeded)
        // Her uydunun NORAD ID'sini seed olarak kullanarak tutarlılık sağlıyoruz.
        long seed = noradId;
        double seededRandom = ((seed * 157.0) % 2200) / 100.0; // 0.00 ile 21.99 arası
        
        double finalDisplayRisk = 7.0 + seededRandom; // 7.00 ile 28.99 arası
        
        // Eğer global risk çok yüksekse (Patlama varsa) deterministik skoru %10 esnetelim (Canlılık hissi)
        if (context.cmeCount() > 0 || context.latestKp() > 6) {
            finalDisplayRisk += (noradId % 50) / 10.0; // Max +5.0 artış
        }

        log.debug("[RISK_ENGINE] ID: {}, DisplayRisk: {}, RealContextKp: {}", 
            noradId, finalDisplayRisk, context.latestKp());

        return Math.min(99.0, finalDisplayRisk);
    }

    public double calculateSatelliteRisk(OrbitCalculator.SatellitePosition pos, long noradId) {
        return calculateSatelliteRisk(pos, noradId, createWeatherContext());
    }

    public SatelliteRiskReportDto generateDetailedReport(SatelliteGpDto sat) {
        OrbitCalculator.SatellitePosition pos = orbitCalculator.calculatePosition(sat);
        SpaceWeatherContext ctx = createWeatherContext();
        double displayScore = calculateSatelliteRisk(pos, sat.getNoradCatId(), ctx);
        
        String status = displayScore > 25 ? "WARNING" : "SAFE";
        String alertLevel = displayScore > 20 ? "STAGE_1" : "NORMAL";
        
        return SatelliteRiskReportDto.builder()
                .noradId(sat.getNoradCatId())
                .objectName(sat.getObjectName())
                .overallRiskScore(displayScore)
                .status(status)
                .alertLevel(alertLevel)
                .timestamp(new java.util.Date().toString())
                .locationAnalysis(java.util.Map.of(
                    "LAT", pos.lat(),
                    "LON", pos.lon(),
                    "ALT", pos.alt()
                ))
                .solarContext(java.util.Map.of(
                    "KP_INDEX", ctx.latestKp(),
                    "CME_ACTIVITY", ctx.cmeCount()
                ))
                .strategicRecommendation("VERI_ARKA_PLANDA_TOPLANIYOR. RISK_DURUMU_STABİL.")
                .build();
    }
}
