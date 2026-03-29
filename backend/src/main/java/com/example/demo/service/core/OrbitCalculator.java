package com.example.demo.service.core;

import com.example.demo.model.dto.SatelliteGpDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

/**
 * Bağımsız yörünge hesaplama motoru.
 * CelesTrak verilerini (TLE/GP) kullanarak uydunun gerçek zamanlı LLA (Lat, Lon, Alt) konumunu hesaplar.
 */
@Component
@Slf4j
public class OrbitCalculator {

    private static final double EARTH_RADIUS = 6371.0; // km
    private static final double MU = 3.986004418e5;    // Dünya Gravitasyonel Sabiti (km^3/s^2)

    public SatellitePosition calculatePosition(SatelliteGpDto gp, Instant targetTime) {
        try {
            String epochStr = gp.getEpoch();
            if (epochStr == null) return new SatellitePosition(0.0, 0.0, 0.0);
            
            // ISO formatına uydurmak için mikrosaniye kısmını garantiye alıyoruz
            ZonedDateTime epoch = ZonedDateTime.parse(epochStr + (epochStr.contains("Z") ? "" : "Z"), 
                DateTimeFormatter.ISO_DATE_TIME.withZone(java.time.ZoneOffset.UTC));
            
            long secondsSinceEpoch = ChronoUnit.SECONDS.between(epoch.toInstant(), targetTime);
            
            // 1. Ortalama hareket (Mean Motion) rev/day -> rad/sec
            double n = (gp.getMeanMotion() * 2.0 * Math.PI) / 86400.0;
            
            // 2. Yörünge yarı-büyük ekseni (Semi-major axis) - Kepler 3. Yasası
            double a = Math.pow(MU / Math.pow(n, 2), 1.0/3.0);
            
            // 3. Ortalama anomali (Mean Anomaly) rad
            double m = Math.toRadians(gp.getMeanAnomaly()) + n * secondsSinceEpoch;
            
            // 4. Diğer yörünge parametreleri (rad)
            double inclination = Math.toRadians(gp.getInclination());
            double raan = Math.toRadians(gp.getRaOfAscNode());
            double argPericenter = Math.toRadians(gp.getArgOfPericenter());
            
            // 5. Basitleştirilmiş dairesel yörünge yaklaşımı
            double u = m + argPericenter;
            
            // 6. Geocentric coordinates (Earth-centered)
            double x = Math.cos(u) * Math.cos(raan) - Math.sin(u) * Math.cos(inclination) * Math.sin(raan);
            double y = Math.cos(u) * Math.sin(raan) + Math.sin(u) * Math.cos(inclination) * Math.cos(raan);
            double z = Math.sin(u) * Math.sin(inclination);
            
            // 7. Enlem / Boylam dönüşümü
            double lat = Math.toDegrees(Math.asin(z));
            double lon = Math.toDegrees(Math.atan2(y, x));
            
            // 8. Dünya dönüşü düzeltmesi
            double earthRotOffset = (secondsSinceEpoch / 86400.0) * 360.0;
            lon = (lon - earthRotOffset + 180.0) % 360.0;
            if (lon < 0) lon += 360.0;
            lon -= 180.0;
            
            double altitude = a - EARTH_RADIUS;

            return new SatellitePosition(lat, lon, altitude);
        } catch (Exception e) {
            log.error("[ORBIT_CALC] HATA ({}): {}", gp.getObjectName(), e.getMessage());
            return new SatellitePosition(0.0, 0.0, 0.0);
        }
    }

    // Helper for generateReport
    public SatellitePosition calculatePosition(SatelliteGpDto gp) {
        return calculatePosition(gp, Instant.now());
    }

    public record SatellitePosition(double lat, double lon, double alt) {}
}
