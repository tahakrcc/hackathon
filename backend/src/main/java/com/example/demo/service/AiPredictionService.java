package com.example.demo.service;

import com.example.demo.model.dto.AiPredictionDto;
import com.example.demo.model.dto.AiPredictionRequestDto;
import com.example.demo.model.dto.SolarMagDto;
import com.example.demo.model.dto.SolarWindDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiPredictionService {

    private final SwpcDataService dataService;
    private final RestClient restClient;

    public AiPredictionDto getPrediction() {
        try {
            List<SolarMagDto> magList = dataService.getSolarWindMag();
            List<SolarWindDto> windList = dataService.getSolarWindPlasma();

            if (magList.size() < 60 || windList.size() < 60) {
                log.warn("AI TAHMİNİ İÇİN YETERSİZ VERİ: Mag: {}, Wind: {}", magList.size(), windList.size());
                return getDefaultPrediction("VERİ YETERSİZ");
            }

            // Son 60 dakikanın verisinden her 5 dakikada 1 örneklem alarak 12 pencere (window) çıkarıyoruz
            List<AiPredictionRequestDto.SolarDataWindow> windows = new ArrayList<>();
            
            int magStart = magList.size() - 60;
            int windStart = windList.size() - 60;

            for (int i = 0; i < 12; i++) {
                int offset = i * 5;
                SolarMagDto mag = magList.get(magStart + offset);
                SolarWindDto wind = windList.get(windStart + offset);

                windows.add(AiPredictionRequestDto.SolarDataWindow.builder()
                        .bt(parseDouble(mag.getBt(), 5.0))
                        .bz(parseDouble(mag.getBz_gsm(), 0.0))
                        .speed(parseDouble(wind.getSpeed(), 400.0))
                        .density(parseDouble(wind.getDensity(), 5.0))
                        .build());
            }

            AiPredictionRequestDto requestDto = AiPredictionRequestDto.builder()
                    .historyWindows(windows)
                    .build();

            // FastAPI sunucusuna POST isteği atılıyor
            return restClient.post()
                    .uri("http://localhost:8000/api/predict")
                    .body(requestDto)
                    .retrieve()
                    .body(AiPredictionDto.class);

        } catch (Exception e) {
            log.error("AI Mikroservisine erişilemedi: {}", e.getMessage());
            return getDefaultPrediction("SUNUCU HATASI");
        }
    }

    private double parseDouble(String val, double defaultVal) {
        if (val == null || val.trim().isEmpty() || val.equals("null") || val.contains("m")) return defaultVal;
        try {
            return Double.parseDouble(val);
        } catch (Exception e) {
            return defaultVal;
        }
    }

    private AiPredictionDto getDefaultPrediction(String fallbackLevel) {
        return AiPredictionDto.builder()
                .predictedSymh(0.0)
                .confidence(0.0)
                .level(fallbackLevel)
                .build();
    }
}
