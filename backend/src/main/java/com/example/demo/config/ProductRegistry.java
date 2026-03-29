package com.example.demo.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Product Registry
 * 
 * SWPC veri ürünleri için metadata kaydı.
 * Her ürün için: endpoint, schema_version, deprecation_date, fallback_endpoint bilgisi tutulur.
 * Deprecation tarihi yaklaştığında log uyarısı basılır.
 */
@Component
@Slf4j
public class ProductRegistry {

    private final Map<String, ProductInfo> products = new LinkedHashMap<>();

    @PostConstruct
    public void init() {
        // Solar Wind Plasma
        products.put("SOLAR_WIND_PLASMA", ProductInfo.builder()
                .name("Solar Wind Plasma")
                .primaryEndpoint("/json/rtsw/rtsw_wind_1m.json")
                .fallbackEndpoint("/products/solar-wind/plasma-1-day.json")
                .schemaVersion("RTSW_1M_V2")
                .deprecationDate(LocalDate.of(2026, 4, 30))
                .build());

        // Solar Wind Mag / IMF
        products.put("SOLAR_WIND_MAG", ProductInfo.builder()
                .name("Solar Wind Mag / IMF")
                .primaryEndpoint("/json/rtsw/rtsw_mag_1m.json")
                .fallbackEndpoint("/products/solar-wind/mag-1-day.json")
                .schemaVersion("RTSW_1M_V2")
                .deprecationDate(LocalDate.of(2026, 4, 30))
                .build());

        // Kp Index
        products.put("KP_INDEX", ProductInfo.builder()
                .name("Planetary Kp Index")
                .primaryEndpoint("/json/planetary_k_index_1m.json")
                .fallbackEndpoint("/json/noaa-planetary-k-index.json")
                .schemaVersion("KP_1M_V1")
                .deprecationDate(null)
                .build());

        // X-Ray Flux
        products.put("XRAY_FLUX", ProductInfo.builder()
                .name("GOES X-Ray Flux")
                .primaryEndpoint("/json/goes/primary/xrays-7-day.json")
                .fallbackEndpoint(null)
                .schemaVersion("GOES_V1")
                .deprecationDate(null)
                .build());

        // Aurora Nowcast
        products.put("AURORA", ProductInfo.builder()
                .name("OVATION Aurora Nowcast")
                .primaryEndpoint("/json/ovation_aurora_latest.json")
                .fallbackEndpoint(null)
                .schemaVersion("OVATION_V1")
                .deprecationDate(null)
                .build());

        log.info("[REGISTRY] {} veri ürünü kaydedildi", products.size());
    }

    /**
     * Her 6 saatte bir deprecation kontrolü yap
     */
    @Scheduled(fixedRate = 6 * 60 * 60 * 1000)
    public void checkDeprecations() {
        LocalDate today = LocalDate.now();

        products.forEach((key, product) -> {
            if (product.deprecationDate != null) {
                long daysUntil = ChronoUnit.DAYS.between(today, product.deprecationDate);

                if (daysUntil < 0) {
                    log.error("[REGISTRY] ⚠️ {} ürünü KALDIRILDI! Fallback endpoint kullanılıyor: {}",
                            product.name, product.fallbackEndpoint);
                } else if (daysUntil <= 7) {
                    log.warn("[REGISTRY] ⚠️ {} ürünü {} gün içinde kaldırılacak! ({})",
                            product.name, daysUntil, product.deprecationDate);
                } else if (daysUntil <= 30) {
                    log.info("[REGISTRY] {} ürünü {} gün sonra kaldırılacak ({})",
                            product.name, daysUntil, product.deprecationDate);
                }
            }
        });
    }

    public Map<String, ProductInfo> getAllProducts() {
        return products;
    }

    @lombok.Builder
    @lombok.Data
    @lombok.AllArgsConstructor
    public static class ProductInfo {
        private String name;
        private String primaryEndpoint;
        private String fallbackEndpoint;
        private String schemaVersion;
        private LocalDate deprecationDate;
    }
}
