package com.example.demo.service;

import com.example.demo.config.SolarDataWebSocketHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Kritik uzay havası olayları ve uydu risk bildirimlerini yöneten sistem.
 * Üretilen risk verilerini WebSocket handler üzerinden anlık olarak fırlatır.
 * Bu sayede Dashboard'daki "Alert" sistemi anında tetiklenir.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AlertSystem {

    private final SolarDataWebSocketHandler webSocketHandler;

    /**
     * Kritik bir uydu risk seviyesi tespit edildiğinde tüm bağlı istemcilere WebSocket mesajı gönderir.
     */
    public void notifyCriticalSatelliteRisk(String satelliteName, double riskScore) {
        if (riskScore < 80.0) return; // Sadece gerçekten kritik olanları fırlat

        log.warn("[ALERT] KRİTİK UYDU RİSKİ: {} - Risk Puanı: {}", satelliteName, String.format("%.2f", riskScore));

        Map<String, Object> payload = Map.of(
            "type", "SATELLITE_ALERT",
            "name", satelliteName,
            "risk", riskScore,
            "timestamp", System.currentTimeMillis()
        );

        webSocketHandler.broadcast(payload);
    }
}
