package com.example.demo.controller;

import com.example.demo.model.dto.RiskScoreDto;
import com.example.demo.service.RiskCalculationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Risk Controller
 * 
 * Risk hesaplama endpoint'i.
 * Controller SADECE RiskCalculationService'i çağırır.
 * Repository'ye erişim Service katmanı üzerinden gerçekleşir.
 */
@RestController
@RequestMapping("/api/risk")
@RequiredArgsConstructor
public class RiskController {

    private final RiskCalculationService riskCalculationService;

    /**
     * Güncel risk skorunu hesapla ve döndür
     */
    @GetMapping("/current")
    public ResponseEntity<RiskScoreDto> getCurrentRisk() {
        return ResponseEntity.ok(riskCalculationService.calculateCurrentRisk());
    }
}
