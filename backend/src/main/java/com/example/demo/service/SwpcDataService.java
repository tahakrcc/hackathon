package com.example.demo.service;

import com.example.demo.model.dto.KpIndexDto;
import com.example.demo.model.dto.SolarMagDto;
import com.example.demo.model.dto.SolarWindDto;
import com.example.demo.model.dto.XRayFluxDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SwpcDataService {

    private final RestClient restClient;

    @Value("${swpc.base.url}")
    private String swpcBaseUrl;

    /**
     * GOES X-Ray Flux (7 gün) — 0.1-0.8nm bandı, son 100 kayıt
     */
    @Cacheable("xrayFlux")
    public List<XRayFluxDto> getXRayFlux() {
        try {
            List<XRayFluxDto> data = restClient.get()
                    .uri(swpcBaseUrl + "/json/goes/primary/xrays-7-day.json")
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<XRayFluxDto>>() {});

            if (data == null) return List.of();

            List<XRayFluxDto> filtered = data.stream()
                    .filter(item -> "0.1-0.8nm".equals(item.getEnergy()))
                    .collect(Collectors.toList());
            
            int size = filtered.size();
            return filtered.subList(Math.max(0, size - 100), size);
        } catch (Exception e) {
            log.error("SWPC X-Ray Flux verisi çekilemedi: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Solar Wind Plasma (1 dakika) — Yeni RTSW API + Eski format fallback
     * 29a/29c: Önce yeni RTSW endpoint, başarısız olursa eski array-of-arrays endpoint
     */
    @Cacheable("solarWind")
    public List<SolarWindDto> getSolarWindPlasma() {
        // Yeni RTSW endpoint (object format)
        try {
            List<Map<String, Object>> rawData = restClient.get()
                    .uri(swpcBaseUrl + "/json/rtsw/rtsw_wind_1m.json")
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<Map<String, Object>>>() {});
            log.debug("[RTSW] Solar Wind yeni format başarılı");
            return parseRtswWind(rawData);
        } catch (Exception e) {
            log.warn("[RTSW] Yeni Solar Wind endpoint başarısız, eski formata geçiliyor: {}", e.getMessage());
        }

        // Fallback: Eski array-of-arrays endpoint
        try {
            List<List<String>> rawData = restClient.get()
                    .uri(swpcBaseUrl + "/products/solar-wind/plasma-1-day.json")
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<List<String>>>() {});
            log.debug("[FALLBACK] Solar Wind eski format kullanıldı");
            return parseLegacyWind(rawData);
        } catch (Exception e2) {
            log.error("SWPC Solar Wind Plasma verisi çekilemedi (her iki endpoint): {}", e2.getMessage());
            return List.of();
        }
    }

    /**
     * Solar Wind Mag / IMF (1 dakika) — Yeni RTSW API + Eski format fallback
     * 29a/29c: Önce yeni RTSW endpoint, başarısız olursa eski array-of-arrays endpoint
     */
    @Cacheable("solarMag")
    public List<SolarMagDto> getSolarWindMag() {
        // Yeni RTSW endpoint (object format)
        try {
            List<Map<String, Object>> rawData = restClient.get()
                    .uri(swpcBaseUrl + "/json/rtsw/rtsw_mag_1m.json")
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<Map<String, Object>>>() {});
            log.debug("[RTSW] Solar Mag yeni format başarılı");
            return parseRtswMag(rawData);
        } catch (Exception e) {
            log.warn("[RTSW] Yeni Solar Mag endpoint başarısız, eski formata geçiliyor: {}", e.getMessage());
        }

        // Fallback: Eski array-of-arrays endpoint
        try {
            List<List<String>> rawData = restClient.get()
                    .uri(swpcBaseUrl + "/products/solar-wind/mag-1-day.json")
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<List<String>>>() {});
            log.debug("[FALLBACK] Solar Mag eski format kullanıldı");
            return parseLegacyMag(rawData);
        } catch (Exception e2) {
            log.error("SWPC Solar Wind Mag verisi çekilemedi (her iki endpoint): {}", e2.getMessage());
            return List.of();
        }
    }

    /**
     * Planetary Kp Index (1 dakika) — son 20 kayıt
     * 29b/29c: Yeni noaa-planetary-k-index.json format desteği + eski format fallback
     */
    @Cacheable("kpIndex")
    public List<KpIndexDto> getKpIndex() {
        // Birincil endpoint
        try {
            List<KpIndexDto> data = restClient.get()
                    .uri(swpcBaseUrl + "/json/planetary_k_index_1m.json")
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<KpIndexDto>>() {});

            if (data == null) return List.of();

            int size = data.size();
            return data.subList(Math.max(0, size - 20), size);
        } catch (Exception e) {
            log.warn("[KP] Birincil Kp endpoint başarısız, alternatif deneniyor: {}", e.getMessage());
        }

        // Fallback: noaa-planetary-k-index.json
        try {
            List<Map<String, Object>> rawData = restClient.get()
                    .uri(swpcBaseUrl + "/json/noaa-planetary-k-index.json")
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<Map<String, Object>>>() {});
            log.debug("[FALLBACK] Kp noaa format kullanıldı");
            return parseNoaaKpIndex(rawData);
        } catch (Exception e2) {
            log.error("SWPC Kp Index verisi çekilemedi (her iki endpoint): {}", e2.getMessage());
            return List.of();
        }
    }

    /**
     * Aurora Nowcast (OVATION latest)
     */
    @Cacheable("auroraData")
    public Object getAuroraData() {
        try {
            return restClient.get()
                    .uri(swpcBaseUrl + "/json/ovation_aurora_latest.json")
                    .retrieve()
                    .body(Object.class);
        } catch (Exception e) {
            log.error("SWPC Aurora verisi çekilemedi: {}", e.getMessage());
            return null;
        }
    }

    // =============================================
    // RTSW Object Parser (1-minute JSON)
    // =============================================

    private List<SolarWindDto> parseRtswWind(List<Map<String, Object>> rawData) {
        if (rawData == null || rawData.isEmpty()) return List.of();

        List<SolarWindDto> result = new ArrayList<>();
        int startIdx = Math.max(0, rawData.size() - 100);

        for (int i = startIdx; i < rawData.size(); i++) {
            Map<String, Object> row = rawData.get(i);
            result.add(SolarWindDto.builder()
                    .time_tag(safeString(row.get("time_tag")))
                    .density(safeString(row.get("proton_density")))
                    .speed(safeString(row.get("proton_speed")))
                    .temperature(safeString(row.get("proton_temperature")))
                    .build());
        }
        return result;
    }

    private List<SolarMagDto> parseRtswMag(List<Map<String, Object>> rawData) {
        if (rawData == null || rawData.isEmpty()) return List.of();

        List<SolarMagDto> result = new ArrayList<>();
        int startIdx = Math.max(0, rawData.size() - 100);

        for (int i = startIdx; i < rawData.size(); i++) {
            Map<String, Object> row = rawData.get(i);
            result.add(SolarMagDto.builder()
                    .time_tag(safeString(row.get("time_tag")))
                    .bx_gsm(safeString(row.get("bx_gsm")))
                    .by_gsm(safeString(row.get("by_gsm")))
                    .bz_gsm(safeString(row.get("bz_gsm")))
                    .lon_gsm(safeString(row.get("phi_gsm")))
                    .lat_gsm(safeString(row.get("theta_gsm")))
                    .bt(safeString(row.get("bt")))
                    .build());
        }
        return result;
    }

    private String safeString(Object value) {
        if (value == null) return null;
        return value.toString();
    }

    // =============================================
    // Legacy Array-of-Arrays Parser (Fallback)
    // =============================================

    /**
     * Eski NOAA array-of-arrays formatı: [[header], [val1, val2, ...], ...]
     * Sütunlar: time_tag, density, speed, temperature
     */
    private List<SolarWindDto> parseLegacyWind(List<List<String>> rawData) {
        if (rawData == null || rawData.size() < 2) return List.of();

        List<SolarWindDto> result = new ArrayList<>();
        int startIdx = Math.max(1, rawData.size() - 100); // İlk satır header

        for (int i = startIdx; i < rawData.size(); i++) {
            List<String> row = rawData.get(i);
            if (row.size() < 4) continue;
            result.add(SolarWindDto.builder()
                    .time_tag(row.get(0))
                    .density(row.get(1))
                    .speed(row.get(2))
                    .temperature(row.get(3))
                    .build());
        }
        return result;
    }

    /**
     * Eski NOAA array-of-arrays formatı: [[header], [val1, val2, ...], ...]
     * Sütunlar: time_tag, bx_gsm, by_gsm, bz_gsm, lon_gsm, lat_gsm, bt
     */
    private List<SolarMagDto> parseLegacyMag(List<List<String>> rawData) {
        if (rawData == null || rawData.size() < 2) return List.of();

        List<SolarMagDto> result = new ArrayList<>();
        int startIdx = Math.max(1, rawData.size() - 100);

        for (int i = startIdx; i < rawData.size(); i++) {
            List<String> row = rawData.get(i);
            if (row.size() < 7) continue;
            result.add(SolarMagDto.builder()
                    .time_tag(row.get(0))
                    .bx_gsm(row.get(1))
                    .by_gsm(row.get(2))
                    .bz_gsm(row.get(3))
                    .lon_gsm(row.get(4))
                    .lat_gsm(row.get(5))
                    .bt(row.get(6))
                    .build());
        }
        return result;
    }

    /**
     * NOAA Planetary K-Index (noaa-planetary-k-index.json) formatı
     * Her kayıt bir JSON object: { "time_tag": "...", "kp_index": 2.33, ... }
     */
    private List<KpIndexDto> parseNoaaKpIndex(List<Map<String, Object>> rawData) {
        if (rawData == null || rawData.isEmpty()) return List.of();

        List<KpIndexDto> result = new ArrayList<>();
        int startIdx = Math.max(0, rawData.size() - 20);

        for (int i = startIdx; i < rawData.size(); i++) {
            Map<String, Object> row = rawData.get(i);
            try {
                KpIndexDto dto = KpIndexDto.builder()
                        .time_tag(safeString(row.get("time_tag")))
                        .kp_index(Double.parseDouble(safeString(row.get("kp_index"))))
                        .build();
                result.add(dto);
            } catch (Exception ignored) {}
        }
        return result;
    }
}
