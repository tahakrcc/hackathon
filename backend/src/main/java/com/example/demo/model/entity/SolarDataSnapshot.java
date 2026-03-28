package com.example.demo.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "solar_data_snapshots")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolarDataSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime capturedAt;

    // X-Ray Flux (latest)
    private Double xrayFlux;
    private String xrayClass;

    // Solar Wind
    private Double windSpeed;
    private Double windDensity;

    // Magnetic Field
    private Double bzGsm;
    private Double bt;

    // Kp Index
    private Double kpIndex;

    // Risk Score
    private Integer riskScore;
    private String riskLevel;

    // CME count
    private Integer activeCmeCount;

    @PrePersist
    protected void onCreate() {
        if (capturedAt == null) {
            capturedAt = LocalDateTime.now();
        }
    }
}
