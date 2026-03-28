package com.example.demo.service;

import com.example.demo.model.dto.*;
import com.example.demo.model.entity.RiskEvent;
import com.example.demo.model.entity.SolarDataSnapshot;
import com.example.demo.repository.RiskEventRepository;
import com.example.demo.repository.SolarDataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RiskCalculationService {

    private final SwpcDataService swpcDataService;
    private final NasaDonkiService nasaDonkiService;
    private final SolarDataRepository solarDataRepository;
    private final RiskEventRepository riskEventRepository;

    /**
     * Frontend'teki calculateRiskScore() algoritmasının birebir Java karşılığı.
     * 
     * Base: 5 puan
     * X-Ray: X-class → +40, M-class → +25, C-class → +10
     * Wind Speed: >800 → +25, >600 → +15, >450 → +5
     * Bz (Southward): <-20 → +20, <-10 → +10, <-5 → +5
     * Kp: ≥8 → +20, ≥5 → +10
     * CME: event sayısı × 5 (max +20)
     * Maximum: 100
     */
    public RiskScoreDto calculateCurrentRisk() {
        List<XRayFluxDto> xray = swpcDataService.getXRayFlux();
        List<SolarWindDto> wind = swpcDataService.getSolarWindPlasma();
        List<SolarMagDto> mag = swpcDataService.getSolarWindMag();
        List<KpIndexDto> kp = swpcDataService.getKpIndex();
        List<CmeEventDto> cme = nasaDonkiService.getCmeEvents();

        int score = 5; // Base score (Quiet background)
        String triggerSource = "NONE";

        // X-Ray Flux impact (Solar Flares)
        if (!xray.isEmpty()) {
            try {
                double latestFlux = Double.parseDouble(xray.get(xray.size() - 1).getFlux());
                if (latestFlux > 1e-4) { score += 40; triggerSource = "XRAY_X_CLASS"; }
                else if (latestFlux > 1e-5) { score += 25; triggerSource = "XRAY_M_CLASS"; }
                else if (latestFlux > 1e-6) { score += 10; triggerSource = "XRAY_C_CLASS"; }
            } catch (NumberFormatException ignored) {}
        }

        // Solar Wind speed impact
        if (!wind.isEmpty()) {
            try {
                double speed = Double.parseDouble(wind.get(wind.size() - 1).getSpeed());
                if (speed > 800) score += 25;
                else if (speed > 600) score += 15;
                else if (speed > 450) score += 5;
            } catch (NumberFormatException ignored) {}
        }

        // Magnetic field Bz impact (Southward Bz = geomagnetic storm driver)
        if (!mag.isEmpty()) {
            try {
                double bz = Double.parseDouble(mag.get(mag.size() - 1).getBz_gsm());
                if (bz < -20) { score += 20; triggerSource = "BZ_EXTREME"; }
                else if (bz < -10) { score += 10; triggerSource = "BZ_SEVERE"; }
                else if (bz < -5) score += 5;
            } catch (NumberFormatException ignored) {}
        }

        // Kp Index impact
        if (!kp.isEmpty()) {
            try {
                double latestKp = kp.get(kp.size() - 1).getKp_index();
                if (latestKp >= 8) { score += 20; triggerSource = "KP_STORM"; }
                else if (latestKp >= 5) score += 10;
            } catch (Exception ignored) {}
        }

        // CME impact
        if (!cme.isEmpty()) {
            score += Math.min(cme.size() * 5, 20);
            if (triggerSource.equals("NONE")) triggerSource = "CME";
        }

        score = Math.min(score, 100);

        // Risk seviyesini belirle
        String level;
        String description;
        if (score >= 75) {
            level = "CRITICAL";
            description = "Kritik jeomanyetik bozulma tespit edildi. Manyetosfer sıkışması 4-8 saat içinde bekleniyor.";
        } else if (score >= 50) {
            level = "HIGH_RISK";
            description = "L1 noktasında jeomanyetik bozulma doğrulandı. Durumu izlemeye devam ediyoruz.";
        } else if (score >= 25) {
            level = "MODERATE";
            description = "Güneş rüzgarı parametrelerinde artış gözlemleniyor.";
        } else {
            level = "NOMINAL";
            description = "Güneş rüzgarı parametreleri kararlı. Tehdit tespit edilmedi.";
        }

        // Yüksek risk varsa veritabanına kaydet
        if (score >= 50) {
            saveRiskEvent(score, level, description, triggerSource);
            saveSnapshot(xray, wind, mag, kp, cme, score, level);
        }

        return RiskScoreDto.builder()
                .score(score)
                .level(level)
                .description(description)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Risk eşiği aşıldığında event kaydı oluştur
     */
    private void saveRiskEvent(int score, String level, String description, String triggerSource) {
        try {
            RiskEvent event = RiskEvent.builder()
                    .riskScore(score)
                    .riskLevel(level)
                    .description(description)
                    .triggerSource(triggerSource)
                    .build();
            riskEventRepository.save(event);
        } catch (Exception e) {
            log.error("Risk event kaydedilemedi: {}", e.getMessage());
        }
    }

    /**
     * Anlık veri snapshot'ı kaydet (geçmiş analiz için)
     */
    private void saveSnapshot(List<XRayFluxDto> xray, List<SolarWindDto> wind,
                              List<SolarMagDto> mag, List<KpIndexDto> kp,
                              List<CmeEventDto> cme, int score, String level) {
        try {
            SolarDataSnapshot snapshot = SolarDataSnapshot.builder()
                    .riskScore(score)
                    .riskLevel(level)
                    .activeCmeCount(cme.size())
                    .build();

            if (!xray.isEmpty()) {
                try {
                    snapshot.setXrayFlux(Double.parseDouble(xray.get(xray.size() - 1).getFlux()));
                } catch (NumberFormatException ignored) {}
            }
            if (!wind.isEmpty()) {
                try {
                    snapshot.setWindSpeed(Double.parseDouble(wind.get(wind.size() - 1).getSpeed()));
                    snapshot.setWindDensity(Double.parseDouble(wind.get(wind.size() - 1).getDensity()));
                } catch (NumberFormatException ignored) {}
            }
            if (!mag.isEmpty()) {
                try {
                    snapshot.setBzGsm(Double.parseDouble(mag.get(mag.size() - 1).getBz_gsm()));
                    snapshot.setBt(Double.parseDouble(mag.get(mag.size() - 1).getBt()));
                } catch (NumberFormatException ignored) {}
            }
            if (!kp.isEmpty()) {
                snapshot.setKpIndex(kp.get(kp.size() - 1).getKp_index());
            }

            solarDataRepository.save(snapshot);
        } catch (Exception e) {
            log.error("Data snapshot kaydedilemedi: {}", e.getMessage());
        }
    }
}
