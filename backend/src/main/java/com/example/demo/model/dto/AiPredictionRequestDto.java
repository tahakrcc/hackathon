package com.example.demo.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class AiPredictionRequestDto {
    @JsonProperty("history_windows")
    private List<SolarDataWindow> historyWindows;

    @Data
    @Builder
    public static class SolarDataWindow {
        private double bt;
        private double bz;
        private double speed;
        private double density;
    }
}
