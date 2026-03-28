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
     * Solar Wind Plasma (1 dakika) — Yeni RTSW API formatı
     */
    @Cacheable("solarWind")
    public List<SolarWindDto> getSolarWindPlasma() {
        try {
            List<Map<String, Object>> rawData = restClient.get()
                    .uri(swpcBaseUrl + "/json/rtsw/rtsw_wind_1m.json")
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<Map<String, Object>>>() {});

            return parseRtswWind(rawData);
        } catch (Exception e) {
            log.error("SWPC Solar Wind Plasma verisi çekilemedi: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Solar Wind Mag / IMF (1 dakika) — Yeni RTSW API formatı
     */
    @Cacheable("solarMag")
    public List<SolarMagDto> getSolarWindMag() {
        try {
            List<Map<String, Object>> rawData = restClient.get()
                    .uri(swpcBaseUrl + "/json/rtsw/rtsw_mag_1m.json")
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<Map<String, Object>>>() {});

            return parseRtswMag(rawData);
        } catch (Exception e) {
            log.error("SWPC Solar Wind Mag verisi çekilemedi: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Planetary Kp Index (1 dakika) — son 20 kayıt
     */
    @Cacheable("kpIndex")
    public List<KpIndexDto> getKpIndex() {
        try {
            List<KpIndexDto> data = restClient.get()
                    .uri(swpcBaseUrl + "/json/planetary_k_index_1m.json")
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<KpIndexDto>>() {});

            if (data == null) return List.of();

            int size = data.size();
            return data.subList(Math.max(0, size - 20), size);
        } catch (Exception e) {
            log.error("SWPC Kp Index verisi çekilemedi: {}", e.getMessage());
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
}
