package com.example.demo.scheduler;

import com.example.demo.model.dto.*;
import com.example.demo.model.entity.RiskEvent;
import com.example.demo.model.entity.SolarDataSnapshot;
import com.example.demo.repository.RiskEventRepository;
import com.example.demo.repository.SolarDataRepository;
import com.example.demo.service.NasaDonkiService;
import com.example.demo.service.SwpcDataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class SwpcDataPollingScheduler {

    private final SwpcDataService swpcDataService;
    private final NasaDonkiService nasaDonkiService;
    private final SolarDataRepository solarDataRepository;
    private final RiskEventRepository riskEventRepository;
    private final CacheManager cacheManager;

    private static final int RISK_THRESHOLD = 50;

    /**
     * Her 60 saniyede bir:
     * 1. Önbelleği temizle
     * 2. Tüm SWPC/NASA verilerini taze çek
     * 3. Anlık snapshot'ı PostgreSQL'e kaydet
     * 4. Risk skoru ≥50 ise RiskEvent alarm logu yaz
     */
    @Scheduled(fixedRate = 60000)
    public void pollSwpcData() {
        log.info("[POLLING] Uzay havası verileri güncelleniyor...");

        try {
            // 1. Cache temizle
            evictCache("xrayFlux");
            evictCache("solarWind");
            evictCache("solarMag");
            evictCache("kpIndex");
            evictCache("auroraData");

            // 2. Taze veriler çek (cache'e de otomatik yazılır)
            List<XRayFluxDto> xray = swpcDataService.getXRayFlux();
            List<SolarWindDto> wind = swpcDataService.getSolarWindPlasma();
            List<SolarMagDto> mag = swpcDataService.getSolarWindMag();
            List<KpIndexDto> kp = swpcDataService.getKpIndex();
            swpcDataService.getAuroraData();

            List<CmeEventDto> cme = List.of(); // CME cache ayrı, her dakika çekmek gereksiz
            try {
                cme = nasaDonkiService.getCmeEvents();
            } catch (Exception ignored) {}

            // 3. Risk skoru hesapla
            int score = calculateRiskScore(xray, wind, mag, kp, cme);
            String level = determineRiskLevel(score);

            // 4. Snapshot'ı DB'ye kaydet (her skor seviyesinde)
            saveSnapshot(xray, wind, mag, kp, cme, score, level);

            // 5. Eşik aşıldıysa RiskEvent alarm logu yaz
            if (score >= RISK_THRESHOLD) {
                String triggerSource = determineTriggerSource(xray, wind, mag, kp, cme);
                String description = generateDescription(level);
                saveRiskEvent(score, level, description, triggerSource);
                log.warn("[ALARM] Risk seviyesi {}: {} (Skor: {})", level, description, score);
            }

            log.info("[POLLING] Tamamlandı. Risk: {} ({})", score, level);
        } catch (Exception e) {
            log.error("[POLLING] Güncelleme başarısız: {}", e.getMessage());
        }
    }

    // ===================================================
    // Risk Hesaplama (RiskCalculationService ile aynı mantık)
    // ===================================================

    private int calculateRiskScore(List<XRayFluxDto> xray, List<SolarWindDto> wind,
                                   List<SolarMagDto> mag, List<KpIndexDto> kp,
                                   List<CmeEventDto> cme) {
        int score = 5;

        if (!xray.isEmpty()) {
            try {
                double flux = Double.parseDouble(xray.get(xray.size() - 1).getFlux());
                if (flux > 1e-4) score += 40;
                else if (flux > 1e-5) score += 25;
                else if (flux > 1e-6) score += 10;
            } catch (Exception ignored) {}
        }

        if (!wind.isEmpty()) {
            try {
                double speed = Double.parseDouble(wind.get(wind.size() - 1).getSpeed());
                if (speed > 800) score += 25;
                else if (speed > 600) score += 15;
                else if (speed > 450) score += 5;
            } catch (Exception ignored) {}
        }

        if (!mag.isEmpty()) {
            try {
                double bz = Double.parseDouble(mag.get(mag.size() - 1).getBz_gsm());
                if (bz < -20) score += 20;
                else if (bz < -10) score += 10;
                else if (bz < -5) score += 5;
            } catch (Exception ignored) {}
        }

        if (!kp.isEmpty()) {
            try {
                double kpVal = kp.get(kp.size() - 1).getKp_index();
                if (kpVal >= 8) score += 20;
                else if (kpVal >= 5) score += 10;
            } catch (Exception ignored) {}
        }

        if (!cme.isEmpty()) {
            score += Math.min(cme.size() * 5, 20);
        }

        return Math.min(score, 100);
    }

    private String determineRiskLevel(int score) {
        if (score >= 75) return "CRITICAL";
        if (score >= 50) return "HIGH_RISK";
        if (score >= 25) return "MODERATE";
        return "NOMINAL";
    }

    private String generateDescription(String level) {
        return switch (level) {
            case "CRITICAL" -> "Kritik jeomanyetik bozulma tespit edildi. Manyetosfer sıkışması 4-8 saat içinde bekleniyor.";
            case "HIGH_RISK" -> "L1 noktasında jeomanyetik bozulma doğrulandı. Durumu izlemeye devam ediyoruz.";
            case "MODERATE" -> "Güneş rüzgarı parametrelerinde artış gözlemleniyor.";
            default -> "Güneş rüzgarı parametreleri kararlı. Tehdit tespit edilmedi.";
        };
    }

    private String determineTriggerSource(List<XRayFluxDto> xray, List<SolarWindDto> wind,
                                          List<SolarMagDto> mag, List<KpIndexDto> kp,
                                          List<CmeEventDto> cme) {
        if (!xray.isEmpty()) {
            try {
                double flux = Double.parseDouble(xray.get(xray.size() - 1).getFlux());
                if (flux > 1e-4) return "XRAY_X_CLASS";
                if (flux > 1e-5) return "XRAY_M_CLASS";
            } catch (Exception ignored) {}
        }
        if (!mag.isEmpty()) {
            try {
                double bz = Double.parseDouble(mag.get(mag.size() - 1).getBz_gsm());
                if (bz < -10) return "BZ_SEVERE";
            } catch (Exception ignored) {}
        }
        if (!kp.isEmpty()) {
            try {
                double kpVal = kp.get(kp.size() - 1).getKp_index();
                if (kpVal >= 8) return "KP_STORM";
            } catch (Exception ignored) {}
        }
        if (!cme.isEmpty()) return "CME";
        return "MULTI_FACTOR";
    }

    // ===================================================
    // Veritabanı Kayıt İşlemleri
    // ===================================================

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
                try { snapshot.setXrayFlux(Double.parseDouble(xray.get(xray.size() - 1).getFlux())); }
                catch (Exception ignored) {}
            }
            if (!wind.isEmpty()) {
                try {
                    snapshot.setWindSpeed(Double.parseDouble(wind.get(wind.size() - 1).getSpeed()));
                    snapshot.setWindDensity(Double.parseDouble(wind.get(wind.size() - 1).getDensity()));
                } catch (Exception ignored) {}
            }
            if (!mag.isEmpty()) {
                try {
                    snapshot.setBzGsm(Double.parseDouble(mag.get(mag.size() - 1).getBz_gsm()));
                    snapshot.setBt(Double.parseDouble(mag.get(mag.size() - 1).getBt()));
                } catch (Exception ignored) {}
            }
            if (!kp.isEmpty()) {
                try { snapshot.setKpIndex(kp.get(kp.size() - 1).getKp_index()); }
                catch (Exception ignored) {}
            }

            solarDataRepository.save(snapshot);
            log.debug("[DB] Snapshot kaydedildi: Skor={}, Seviye={}", score, level);
        } catch (Exception e) {
            log.error("[DB] Snapshot kaydedilemedi: {}", e.getMessage());
        }
    }

    private void saveRiskEvent(int score, String level, String description, String triggerSource) {
        try {
            RiskEvent event = RiskEvent.builder()
                    .riskScore(score)
                    .riskLevel(level)
                    .description(description)
                    .triggerSource(triggerSource)
                    .build();
            riskEventRepository.save(event);
            log.warn("[DB] Risk olayı kaydedildi: {} - {}", level, triggerSource);
        } catch (Exception e) {
            log.error("[DB] Risk event kaydedilemedi: {}", e.getMessage());
        }
    }

    private void evictCache(String cacheName) {
        if (cacheManager.getCache(cacheName) != null) {
            cacheManager.getCache(cacheName).clear();
        }
    }
}
