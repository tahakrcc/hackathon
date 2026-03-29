package com.example.demo.controller;

import com.example.demo.model.dto.SatelliteGpDto;
import com.example.demo.model.dto.SatelliteRiskReportDto;
import com.example.demo.service.core.OrbitCalculator;
import com.example.demo.service.core.RiskEngine;
import com.example.demo.service.datalayer.CelesTrakService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Uydu risklerini dış dünyaya açan REST kontrolcü.
 */
@RestController
@RequestMapping("/api/satellite")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin
public class SatelliteRiskController {

    private final CelesTrakService celesTrakService;
    private final OrbitCalculator orbitCalculator;
    private final RiskEngine riskEngine;

    @GetMapping("/risk")
    public List<SatelliteGpDto> getSatelliteRisks() {
        List<SatelliteGpDto> satellites = celesTrakService.getSatelliteOrbits();
        if (satellites == null || satellites.isEmpty()) {
            log.warn("[CONTROLLER] Uydu listesi boş döndü.");
            return List.of();
        }

        Instant now = Instant.now();
        
        // KRİTİK: Hava durumu bağlamını döngü DIŞINDA bir kez oluştur (Performans)
        RiskEngine.SpaceWeatherContext weatherContext = riskEngine.createWeatherContext();
        
        log.info("[CONTROLLER] {} adet uydu için toplu risk hesaplaması başlatıldı. Context: {}", 
            satellites.size(), weatherContext);

        return satellites.stream()
                .map(s -> {
                    // 1. Uydunun anlık yörünge konumunu hesapla
                    OrbitCalculator.SatellitePosition pos = orbitCalculator.calculatePosition(s, now);
                    
                    // 2. Konum + Uzay havası verileriyle risk puanla (CONTEXT İLE)
                    double risk = riskEngine.calculateSatelliteRisk(pos, s.getNoradCatId(), weatherContext);
                    
                    // 3. DTO'yu güncelle
                    s.setRiskScore(risk);
                    
                    return s;
                })
                .collect(Collectors.toList());
    }

    @GetMapping("/report/{id}")
    public SatelliteRiskReportDto getSatelliteReport(@PathVariable long id) {
        List<SatelliteGpDto> satellites = celesTrakService.getSatelliteOrbits();
        if (satellites == null) return null;

        SatelliteGpDto target = satellites.stream()
                .filter(s -> s.getNoradCatId() == id)
                .findFirst()
                .orElse(null);
        
        if (target == null) {
            log.warn("[CONTROLLER] Rapor için hedef uydu bulunamadı: {}", id);
            return null;
        }
        
        return riskEngine.generateDetailedReport(target);
    }
}
