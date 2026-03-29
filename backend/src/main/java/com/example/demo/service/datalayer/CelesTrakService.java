package com.example.demo.service.datalayer;

import com.example.demo.model.dto.SatelliteGpDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CelesTrakService {
    
    private final RestClient restClient;

    /**
     * CelesTrak GNSS (GPS, Galileo, Glonass, Beidou) uydularının yörünge verilerini çeker.
     * Bu uydular kritik altyapı olarak kabul edildiği için önceliklendirilmiştir.
     */
    // @Cacheable("satelliteOrbits")
    public List<SatelliteGpDto> getSatelliteOrbits() {
        try {
            // GNSS grubu tüm küresel navigasyon uydularını içerir.
            String url = "https://celestrak.org/NORAD/elements/gp.php?GROUP=gnss&FORMAT=json";
            
            log.info("[CELESTRAK] Yörünge verileri güncelleniyor: {}", url);

            List<SatelliteGpDto> data = restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<SatelliteGpDto>>() {});

            if (data == null) {
                log.warn("[CELESTRAK] Veri boş döndü.");
                return List.of();
            }

            log.info("[CELESTRAK] {} adet uydu verisi başarıyla çekildi.", data.size());
            
            // Performans için şimdilik ilk 100 kaydı döndürelim (Kritik takımlar)
            return data.subList(0, Math.min(100, data.size()));
        } catch (Exception e) {
            log.error("[CELESTRAK] Uydu verisi çekilemedi: {}", e.getMessage());
            return List.of();
        }
    }
}
