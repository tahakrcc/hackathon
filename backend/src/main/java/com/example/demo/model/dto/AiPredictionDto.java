package com.example.demo.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiPredictionDto {
    @JsonProperty("predicted_symh")
    private Double predictedSymh;
    
    private Double confidence;
    private String level;
}
