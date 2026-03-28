package com.example.demo.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
public class HelioviewerService {

    @Value("${helioviewer.base.url}")
    private String helioviewerBaseUrl;

    /**
     * Helioviewer SDO/AIA 171Å screenshot URL'i oluştur
     * Frontend'teki fetchHelioviewerImage() ile aynı mantık
     */
    @Cacheable("sunImage")
    public String getImageUrl() {
        try {
            String utcNow = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'")
                    .withZone(ZoneOffset.UTC)
                    .format(Instant.now());

            return String.format(
                    "%s/v2/takeScreenshot/?date=%s&sourceId=14&imageScale=2.4&x0=0&y0=0&width=1000&height=1000",
                    helioviewerBaseUrl, utcNow
            );
        } catch (Exception e) {
            log.error("Helioviewer URL oluşturulamadı: {}", e.getMessage());
            return helioviewerBaseUrl + "/v2/takeScreenshot/?date=2024-01-01T00:00:00Z&sourceId=14&imageScale=2.4&x0=0&y0=0&width=1000&height=1000";
        }
    }
}
