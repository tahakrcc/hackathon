package com.example.demo.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskScoreDto {
    private int score;
    private String level;       // NOMINAL, MODERATE, HIGH_RISK, CRITICAL
    private String description;
    private LocalDateTime timestamp;
}
