package com.example.demo.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDto {
    private List<XRayFluxDto> xrayFlux;
    private List<SolarWindDto> solarWind;
    private List<SolarMagDto> solarMag;
    private List<KpIndexDto> kpIndex;
    private Object auroraData;
    private List<CmeEventDto> cmeEvents;
    private String sunImage;
    private RiskScoreDto riskScore;
    private LocalDateTime lastUpdate;
}
