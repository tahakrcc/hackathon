package com.example.demo.model.dto;

import lombok.Builder;
import lombok.Data;
import java.util.Map;

/**
 * Detaylı uydu risk raporu veri modeli.
 */
@Data
@Builder
public class SatelliteRiskReportDto {
    private long noradId;
    private String objectName;
    private double overallRiskScore;
    private String status;
    private String timestamp;
    
    // Konum Analizi
    private Map<String, Object> locationAnalysis;
    
    // Uzay Havası Bağlamı
    private Map<String, Object> solarContext;
    
    // Risk Dağılımı ve Faktörler
    private Map<String, Double> riskFactors;
    
    // Stratejik Öneri
    private String strategicRecommendation;
    private String alertLevel; // NORMAL, STAGE_1, STAGE_2, RED_ALERT
}
