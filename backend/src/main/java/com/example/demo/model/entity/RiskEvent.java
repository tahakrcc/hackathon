package com.example.demo.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "risk_events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime triggeredAt;

    private Integer riskScore;
    private String riskLevel;

    @Column(length = 500)
    private String description;

    // What triggered the risk
    private String triggerSource; // XRAY, SOLAR_WIND, BZ, KP, CME

    @PrePersist
    protected void onCreate() {
        if (triggeredAt == null) {
            triggeredAt = LocalDateTime.now();
        }
    }
}
