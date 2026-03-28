package com.example.demo.service;

import com.example.demo.model.dto.CmeEventDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NasaDonkiService {

    private final RestClient restClient;

    @Value("${nasa.api.key}")
    private String nasaApiKey;

    /**
     * NASA DONKI CME Events — son 7 gün, max 10 olay
     */
    @Cacheable("cmeEvents")
    public List<CmeEventDto> getCmeEvents() {
        try {
            String endDate = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);
            String startDate = LocalDate.now().minusDays(7).format(DateTimeFormatter.ISO_LOCAL_DATE);

            String url = String.format(
                    "https://api.nasa.gov/DONKI/CME?startDate=%s&endDate=%s&api_key=%s",
                    startDate, endDate, nasaApiKey
            );

            List<CmeEventDto> data = restClient.get()
                    .uri(url)
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<CmeEventDto>>() {});

            if (data == null) return List.of();

            int size = data.size();
            return data.subList(Math.max(0, size - 10), size);
        } catch (Exception e) {
            log.error("NASA DONKI CME verisi çekilemedi: {}", e.getMessage());
            return List.of();
        }
    }
}
