package com.example.demo.controller;

import com.example.demo.model.dto.*;
import com.example.demo.model.entity.RiskEvent;
import com.example.demo.model.entity.SolarDataSnapshot;
import com.example.demo.repository.RiskEventRepository;
import com.example.demo.repository.SolarDataRepository;
import com.example.demo.service.HelioviewerService;
import com.example.demo.service.NasaDonkiService;
import com.example.demo.service.RiskCalculationService;
import com.example.demo.service.SwpcDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Solar Data Controller
 * 
 * Frontend'den gelen tüm istekler bu controller'a gelir.
 * Controller SADECE Service katmanını çağırır — asla doğrudan Repository'ye erişmez.
 * 
 * Akış: Frontend → Controller → Service → Repository (gerekirse)
 */
@RestController
@RequestMapping("/api/solar")
@RequiredArgsConstructor
public class SolarDataController {

    private final SwpcDataService swpcDataService;
    private final NasaDonkiService nasaDonkiService;
    private final HelioviewerService helioviewerService;
    private final RiskCalculationService riskCalculationService;
    private final SolarDataRepository solarDataRepository;
    private final RiskEventRepository riskEventRepository;

    /**
     * X-Ray Flux verisi (GOES-16, 0.1-0.8nm)
     */
    @GetMapping("/xray")
    public ResponseEntity<List<XRayFluxDto>> getXRayFlux() {
        return ResponseEntity.ok(swpcDataService.getXRayFlux());
    }

    /**
     * Solar Wind Plasma verisi (hız, yoğunluk, sıcaklık)
     */
    @GetMapping("/wind")
    public ResponseEntity<List<SolarWindDto>> getSolarWindPlasma() {
        return ResponseEntity.ok(swpcDataService.getSolarWindPlasma());
    }

    /**
     * IMF Manyetik Alan verisi (Bz, Bt)
     */
    @GetMapping("/mag")
    public ResponseEntity<List<SolarMagDto>> getSolarWindMag() {
        return ResponseEntity.ok(swpcDataService.getSolarWindMag());
    }

    /**
     * Planetary Kp Index
     */
    @GetMapping("/kp")
    public ResponseEntity<List<KpIndexDto>> getKpIndex() {
        return ResponseEntity.ok(swpcDataService.getKpIndex());
    }

    /**
     * Aurora Nowcast (OVATION)
     */
    @GetMapping("/aurora")
    public ResponseEntity<Object> getAuroraData() {
        Object data = swpcDataService.getAuroraData();
        return data != null ? ResponseEntity.ok(data) : ResponseEntity.noContent().build();
    }

    /**
     * CME Events (NASA DONKI)
     */
    @GetMapping("/cme")
    public ResponseEntity<List<CmeEventDto>> getCmeEvents() {
        return ResponseEntity.ok(nasaDonkiService.getCmeEvents());
    }

    /**
     * Helioviewer SDO Görüntü URL'i
     */
    @GetMapping("/image")
    public ResponseEntity<String> getSunImage() {
        return ResponseEntity.ok(helioviewerService.getImageUrl());
    }

    /**
     * Dashboard — Tüm veriler tek bir çağrıda
     * Frontend'in her 60 saniyede bir tek endpoint'e istek atmasını sağlar
     */
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDto> getDashboard() {
        RiskScoreDto risk = riskCalculationService.calculateCurrentRisk();

        DashboardDto dashboard = DashboardDto.builder()
                .xrayFlux(swpcDataService.getXRayFlux())
                .solarWind(swpcDataService.getSolarWindPlasma())
                .solarMag(swpcDataService.getSolarWindMag())
                .kpIndex(swpcDataService.getKpIndex())
                .auroraData(swpcDataService.getAuroraData())
                .cmeEvents(nasaDonkiService.getCmeEvents())
                .sunImage(helioviewerService.getImageUrl())
                .riskScore(risk)
                .lastUpdate(LocalDateTime.now())
                .build();

        return ResponseEntity.ok(dashboard);
    }

    // ================================================================
    // GEÇMİŞ VERİ ENDPOİNT'LERİ (Phase 5 - DB Snapshots & Events)
    // ================================================================

    /**
     * Son X saatlik snapshot geçmişi
     * Kullanım: GET /api/solar/history?hours=24
     */
    @GetMapping("/history")
    public ResponseEntity<List<SolarDataSnapshot>> getHistory(
            @RequestParam(defaultValue = "24") int hours) {
        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        List<SolarDataSnapshot> snapshots = solarDataRepository
                .findByCapturedAtBetweenOrderByCapturedAtDesc(since, LocalDateTime.now());
        return ResponseEntity.ok(snapshots);
    }

    /**
     * Son risk olayları (Alarm Logları)
     * Kullanım: GET /api/solar/risk-events
     */
    @GetMapping("/risk-events")
    public ResponseEntity<List<RiskEvent>> getRiskEvents() {
        return ResponseEntity.ok(riskEventRepository.findTop20ByOrderByTriggeredAtDesc());
    }
}
