package com.example.demo.service.datalayer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class SatelliteDataRefresher {

    private final CelesTrakService celesTrakService;
    private final CacheManager cacheManager;

    /**
     * Uyduların yörünge verilerini günde sadece bir kez sessizce günceller.
     * Bu sayede celestrak.org üzerinde IP engeli (403) oluşması engellenir.
     */
    @Scheduled(fixedRate = 86400000) // 24 saatte bir
    public void refreshSatelliteData() {
        log.info("[REFRESHER] Günlük uydu yörünge verileri tazeleniyor...");
        try {
            // Önce cache'i temizle
            if (cacheManager.getCache("satelliteOrbits") != null) {
                cacheManager.getCache("satelliteOrbits").clear();
            }
            // Verileri çek (CelesTrakService içindeki @Cacheable sayesinde cache'e yazılacak)
            celesTrakService.getSatelliteOrbits();
            log.info("[REFRESHER] Uydu verileri başarıyla güncellendi.");
        } catch (Exception e) {
            log.error("[REFRESHER] Otomatik güncelleme başarısız: {}", e.getMessage());
        }
    }
}
