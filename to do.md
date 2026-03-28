# ☀️ Solar Sentinel — Proje Görev Listesi

> **Kural:** Her güncellemede ilgili kutuya `[x]` işareti atılacak.  
> **Katmanlı Mimari:** Frontend → Controller → Service → Repository (Controller asla doğrudan Repository'ye erişmez)  
> **Son Güncelleme:** 2026-03-28

---

## PHASE 1: Backend Temel Altyapı (Spring Boot)

> Spring Boot 4.0.5 / Java 21 / Maven / PostgreSQL

- [x] 1- `pom.xml` güncelle
  - [x] `spring-boot-starter-cache` bağımlılığı ekle
  - [x] `com.github.ben-manes.caffeine:caffeine` bağımlılığı ekle
  - [x] `org.postgresql:postgresql` (runtime scope) bağımlılığı ekle
  - [x] H2 bağımlılığını kaldır, PostgreSQL ile değiştir
- [x] 2- `application.properties` yapılandır
  - [x] PostgreSQL bağlantısı: `jdbc:postgresql://localhost:5432/hackathon`
  - [x] Kullanıcı adı/şifre: `postgres` / `123`
  - [x] `spring.jpa.hibernate.ddl-auto=update` (tabloları otomatik oluştur)
  - [x] NASA API Key güvenli şekilde backend'de sakla
  - [x] SWPC ve Helioviewer base URL'lerini tanımla
  - [x] Caffeine cache: `maximumSize=100, expireAfterWrite=60s`
- [x] 3- `CorsConfig.java` oluştur
  - [x] `http://localhost:5173` (Vite dev server) için GET/POST/PUT/DELETE izni
  - [x] `allowCredentials(true)`, `maxAge(3600)`
- [x] 4- `SecurityConfig.java` oluştur
  - [x] Tüm `/api/**` endpoint'lerini `permitAll()` ile aç
  - [x] CSRF devre dışı bırak (REST API)
  - [x] Session: STATELESS
  - [x] H2 Console frame options (geliştirme için)
- [x] 5- `RestClientConfig.java` oluştur
  - [x] `RestClient` bean tanımı (Spring 4.x için)
- [x] 6- DTO'ları (Data Transfer Objects) oluştur
  - [x] `XRayFluxDto.java` — GOES X-ray akısı (time_tag, flux, energy, current_class)
  - [x] `SolarWindDto.java` — Güneş rüzgârı (time_tag, speed, density, temperature)
  - [x] `SolarMagDto.java` — IMF manyetik alan (time_tag, bz_gsm, bt, bx_gsm, by_gsm)
  - [x] `KpIndexDto.java` — Planetary Kp indeksi (time_tag, kp_index, source)
  - [x] `CmeEventDto.java` — CME olayları (activityID, startTime, sourceLocation, cmeAnalyses)
  - [x] `RiskScoreDto.java` — Risk skoru (score, level, description, timestamp)
  - [x] `DashboardDto.java` — Tüm verileri birleştiren wrapper
- [x] 7- Entity'leri (Veritabanı Tabloları) oluştur
  - [x] `SolarDataSnapshot.java` — Periyodik veri snapshot'ları (xrayFlux, windSpeed, bzGsm, kpIndex, riskScore...)
  - [x] `RiskEvent.java` — Risk eşiği aşılınca kaydedilen olaylar (riskScore, riskLevel, triggerSource...)
- [x] 8- Repository'leri oluştur
  - [x] `SolarDataRepository.java` — `JpaRepository<SolarDataSnapshot, Long>`, tarih aralığı sorguları
  - [x] `RiskEventRepository.java` — `JpaRepository<RiskEvent, Long>`, son risk olayları sorguları
- [x] 9- `SwpcDataService.java` oluştur
  - [x] `getXRayFlux()` — GOES X-ray 7 gün, 0.1-0.8nm filtresi, son 100 kayıt, @Cacheable
  - [x] `getSolarWindPlasma()` — Solar Wind plasma 1 gün, NOAA array-of-arrays parser, @Cacheable
  - [x] `getSolarWindMag()` — IMF Bz/Bt 1 gün, NOAA array-of-arrays parser, @Cacheable
  - [x] `getKpIndex()` — Planetary Kp 1 dakika, son 20 kayıt, @Cacheable
  - [x] `getAuroraData()` — OVATION aurora nowcast, @Cacheable
  - [x] NOAA array-of-arrays formatını parse eden yardımcı metotlar (frontend'ten taşındı)
- [x] 10- `NasaDonkiService.java` oluştur
  - [x] `getCmeEvents()` — NASA DONKI CME API, son 7 gün, max 10 olay, @Cacheable
  - [x] NASA API key `application.properties`'den okunuyor
- [x] 11- `HelioviewerService.java` oluştur
  - [x] `getImageUrl()` — SDO/AIA 171Å screenshot URL oluştur, @Cacheable
  - [x] UTC zaman damgası ile güncel görüntü URL'i
- [x] 12- `RiskCalculationService.java` oluştur
  - [x] `calculateCurrentRisk()` — Frontend'teki `calculateRiskScore()` algoritmasının birebir Java portu
  - [x] Base: 5 | X-Ray: +10/+25/+40 | Wind: +5/+15/+25 | Bz: +5/+10/+20 | Kp: +10/+20 | CME: +5×n (max 20)
  - [x] Risk ≥50 olduğunda `RiskEvent` ve `SolarDataSnapshot` veritabanına otomatik kayıt
  - [x] SwpcDataService ve NasaDonkiService üzerinden veri çekiyor (Service→Service)
  - [x] Repository'lere sadece Service katmanı üzerinden erişiliyor ✅
- [x] 13- `SolarDataController.java` oluştur
  - [x] `GET /api/solar/xray` — X-Ray flux verisi
  - [x] `GET /api/solar/wind` — Solar wind plasma verisi
  - [x] `GET /api/solar/mag` — IMF manyetik alan verisi
  - [x] `GET /api/solar/kp` — Kp index verisi
  - [x] `GET /api/solar/aurora` — Aurora nowcast verisi
  - [x] `GET /api/solar/cme` — CME olayları
  - [x] `GET /api/solar/image` — Helioviewer SDO görüntü URL'i
  - [x] `GET /api/solar/dashboard` — Tüm verileri tek çağrıda birleştiren endpoint
  - [x] Controller SADECE Service çağırıyor, Repository'ye asla doğrudan erişmiyor ✅
- [x] 14- `RiskController.java` oluştur
  - [x] `GET /api/risk/current` — Güncel risk skoru hesapla ve döndür
  - [x] Sadece `RiskCalculationService` çağırıyor ✅
- [x] 15- `DemoApplication.java` güncelle
  - [x] `@EnableCaching` annotation ekle
  - [x] `@EnableScheduling` annotation ekle
- [x] 16- Backend derleme testi (`mvn compile`) ✅ Başarılı
- [x] 17- Backend çalışma testi (`mvn spring-boot:run`) ✅ Port 8080'de çalışıyor
  - [x] `/api/solar/dashboard` → JSON verisi döndü
  - [x] `/api/risk/current` → `{"score":25, "level":"MODERATE"}` döndü
  - [x] `/api/solar/wind` → Solar wind ölçümleri döndü
- [x] 18- PostgreSQL `hackathon` veritabanı oluştur
  - [x] `psql -U postgres -c "CREATE DATABASE hackathon;"` komutu çalıştırıldı
  - [x] Veritabanı başarıyla oluşturuldu

---

## PHASE 2: Frontend ↔ Backend Entegrasyonu

> Frontend şu an 7 harici API'ye doğrudan bağlanıyor. Hepsini backend proxy'sine yönlendireceğiz.

- [x] 19- `frontend/src/api/solarApi.js` → Backend endpoint'lerine yönlendir
  - [x] 19a- `fetchXRayFlux()`: `swpc.noaa.gov/json/goes/primary/xrays-7-day.json` → `GET /api/solar/xray`
  - [x] 19b- `fetchSolarWindPlasma()`: `swpc.noaa.gov/products/solar-wind/plasma-1-day.json` → `GET /api/solar/wind`
  - [x] 19c- `fetchSolarWindMag()`: `swpc.noaa.gov/products/solar-wind/mag-1-day.json` → `GET /api/solar/mag`
  - [x] 19d- `fetchKpIndex()`: `swpc.noaa.gov/json/planetary_k_index_1m.json` → `GET /api/solar/kp`
  - [x] 19e- `fetchAuroraData()`: `swpc.noaa.gov/json/ovation_aurora_latest.json` → `GET /api/solar/aurora`
  - [x] 19f- `fetchCMEEvents()`: `api.nasa.gov/DONKI/CME` → `GET /api/solar/cme`
  - [x] 19g- `fetchHelioviewerImage()`: `api.helioviewer.org/v2/takeScreenshot/` → `GET /api/solar/image`
  - [x] 19h- `parseNoaaArray()` fonksiyonunu kaldır (artık backend'de parse ediliyor)
- [x] 20- `frontend/src/store/solarStore.js` güncelle
  - [x] 20a- `calculateRiskScore()` fonksiyonunu kaldır (artık backend hesaplıyor)
  - [x] 20b- `riskScore` değerini backend'den gelen `RiskScoreDto`'dan oku
  - [x] 20c- Alternatif: Tek `/api/solar/dashboard` endpoint'i ile tüm veriyi tek çağrıda çek
- [x] 21- `frontend/vite.config.js` → Proxy ayarı ekle
  - [x] `/api` path'ini `http://localhost:8080` adresine proxy'le
  - [x] Frontend'de `http://localhost:8080` yazmak yerine doğrudan `/api/solar/*` kullan
- [x] 22- `frontend/.env` → NASA API key kaldır (artık backend'de güvenli şekilde saklanıyor)
- [x] 23- Frontend-Backend entegrasyon testi
  - [x] Dashboard verisi backend'den doğru geldiğini doğrula
  - [x] Section 0 (MISSION CORE): `solarWind[0]?.speed` backend'den geliyor mu?
  - [x] Section 1 (HELYO_DATA): X-Ray flux ve Bt grafikleri çalışıyor mu?
  - [x] Section 2 (TERRA_SHIELD): Kp index ve Earth3D riskScore ile tetikleniyor mu?
  - [x] Section 3 (EVENT_LOGS): CME olayları backend'den `GET /api/solar/cme` ile geliyor mu?
  - [x] RiskAnalysis bileşeni: Skor backend'deki `calculateCurrentRisk()` ile uyumlu mu?

---

## PHASE 3: ML/AI Model Entegrasyonu (models/ klasörü)

> Açıklama: LSTM tabanlı Sym/H (Güneş Fırtınası Şiddeti) modeli başarıyla oluşturuldu ve eğitildi. Model şu an `models/` dizininde Keras formatında bulunmaktadır.

- [x] 24- **Sym/H Index Tahmin Modeli (LSTM Baseline)**
  - [x] 24a- OMNI geçmiş 5-dakikalık veri dataset'i hazırlandı (`omni_5min_Vr6D6lEveS.lst`)
  - [x] 24b- Eğitim pipeline: solar wind (speed, density) + IMF (Bz, Bt) → Sym/H tahmini
  - [x] 24c- Python LSTM modeli eğitildi (`train_model.py`, `solar_storm_model.keras`)
  - [x] 24d- Model değerlendirmesi ve grafiği (`firtina_tahmin_basarisi.png`)
  - [x] 24e- Tahmin scripti hazırlandı (`predict_model.py`)
- [ ] 25- **Flare Sınıflandırma Modeli (Opsiyonel - Phase 2+)**
  - [ ] 25a- GOES X-ray flux geçmiş verisi ile eğitim dataset'i
  - [ ] 25b- C/M/X sınıfı flare tahmini: "Sonraki 24 saatte M sınıfı flare olasılığı"
  - [ ] 25c- Modeli kaydet: `models/flare_classification/model.onnx`
- [x] 26- **Backend ML Model Serving**
  - [x] 26a- Python micro-service (FastAPI) → `models/serve.py`
  - [x] 26b- `AiPredictionService.java` oluştur (Service katmanı)
  - [x] 26c- `AiController.java` oluştur
    - [x] `GET /api/ai/predict` → Sym/H tahmini ve Confidence Score
- [x] 27- **Frontend AI Paneli**
  - [x] 27a- RiskAnalysis bileşeninde "AI Analiz Motoru" kısmını gerçek model çıktısıyla değiştir
  - [x] 27b- Ekranda Canlı "SENTINEL_AI_CONFIDENCE" güven skorunun gösterimi

---

## PHASE 4: SWPC Nisan 2026 Format Değişikliği Uyumu

> ⚠️ KRİTİK: Deep research raporuna göre 31 Mart 2026'da (3 gün sonra!) bazı JSON formatları değişecek.
> 30 Nisan 2026'da eski solar-wind endpoint'leri kaldırılacak.

- [x] 28- **Backend RTSW Endpoint Geçişi**
  - [x] 28a- `SwpcDataService` → `plasma-1-day.json` yerine `json/rtsw/rtsw_wind_1m.json` desteği ekle
  - [x] 28b- `SwpcDataService` → `mag-1-day.json` yerine `json/rtsw/rtsw_mag_1m.json` desteği ekle
  - [x] 28c- Yeni RTSW formatında `source` ve `active` alanlarını parse et
- [ ] 29- **Schema Versioning & Adapter Pattern**
  - [ ] 29a- `SwpcDataService`'e format algılama mantığı ekle (eski string format vs yeni object format)
  - [ ] 29b- `noaa-planetary-k-index.json` ve `kyoto-dst.json` için yeni format parse desteği
  - [ ] 29c- Dual endpoint desteği: Eski endpoint çalışıyorsa onu kullan, inaccessible ise yenisine geç
- [ ] 30- **Product Registry**
  - [ ] 30a- `ProductRegistry.java` oluştur: her veri ürünü için `endpoint`, `schema_version`, `deprecation_date`, `fallback_endpoint` metadata
  - [ ] 30b- Deprecation uyarı logu: kaldırılacak endpoint kullanılıyorsa log bas

---

## PHASE 5: Zamanlanmış Veri Toplama & Veritabanı Geçmişi

> Şu an backend sadece istek geldiğinde veri çekiyor. Periyodik polling ile sürekli veri toplama ve saklama eklenecek.

- [/] 31- **`DataPollingScheduler.java` oluştur**
  - [x] 31a- `@Scheduled(fixedRate = 60000)` ile 60 saniyede bir tüm SWPC/NASA verilerini çek
  - [ ] 31b- Her polling'de `SolarDataSnapshot` entity'sine anlık veri kaydet
  - [ ] 31c- Risk skoru hesapla ve ≥50 ise `RiskEvent` tablosuna kayıt yaz
  - [x] 31d- Cache'i polling sonrası otomatik temizle/yenile (`@CacheEvict`)
- [ ] 32- **Geçmiş Veri Endpoint'leri**
  - [ ] 32a- `GET /api/solar/history?hours=24` → Son 24 saatlik snapshot verileri
  - [ ] 32b- `GET /api/solar/history?hours=72` → Son 72 saatlik snapshot verileri
  - [ ] 32c- `GET /api/risk/history` → Son risk olayları listesi
- [ ] 33- **Frontend Geçmiş Entegrasyonu**
  - [ ] 33a- Section 3 (EVENT_LOGS / Mission Archive) → DB'den gerçek geçmiş olayları çek
  - [ ] 33b- DataCharts bileşeninde "72 saat trend" grafik modu ekle
  - [ ] 33c- RiskAnalysis bileşeninde "Son 24 saat risk trendi" mini grafik

---

## PHASE 6: Bildirim & Gerçek Zamanlı İletişim (WebSocket)

> Frontend şu an 60 saniyede bir polling yapıyor. WebSocket ile anlık güncelleme sağlanacak.

- [ ] 34- **WebSocket Altyapısı**
  - [ ] 34a- `pom.xml` → `spring-boot-starter-websocket` bağımlılığı ekle
  - [ ] 34b- `WebSocketConfig.java` oluştur (STOMP over WebSocket, `/ws/solar-feed` endpoint)
  - [ ] 34c- `SolarDataWebSocketHandler.java` oluştur
  - [ ] 34d- Risk değiştiğinde frontend'e otomatik push mesajı gönder
- [ ] 35- **Frontend WebSocket Client**
  - [ ] 35a- `solarApi.js` → WebSocket bağlantısı ekle (`ws://localhost:8080/ws/solar-feed`)
  - [ ] 35b- `solarStore.js` → WebSocket mesajını Zustand store'a bağla
  - [ ] 35c- 60sn polling'i WebSocket ile değiştir (veya fallback olarak koru)
- [ ] 36- **E-posta Bildirim Sistemi (Opsiyonel)**
  - [ ] 36a- `pom.xml` → `spring-boot-starter-mail` bağımlılığı ekle
  - [ ] 36b- `NotificationService.java` oluştur
  - [ ] 36c- Risk ≥75 (CRITICAL) → otomatik e-posta gönder
  - [ ] 36d- Kullanıcı entity & bildirim tercihleri (kullanıcı hangi seviyede uyarılmak istiyor?)

---

## PHASE 7: Üretim Hazırlığı & Ek Özellikler

- [ ] 37- **SWPC Resmî Uyarı Entegrasyonu**
  - [ ] 37a- `/products/alerts.json` → SWPC aktif uyarıları (watches/warnings/alerts) backend'e çek
  - [ ] 37b- `AlertDto.java` ve `AlertService.java` oluştur
  - [ ] 37c- `GET /api/alerts/active` endpoint'i
  - [ ] 37d- Frontend bildirim panelinde gerçek SWPC uyarıları göster
- [ ] 38- **ICAO Havacılık Advisory (Opsiyonel)**
  - [ ] 38a- `json/icao-space-weather-advisories.json` endpoint desteği
  - [ ] 38b- Havacılık modülü için ayrı bir "Aviation View" sayfası
- [ ] 39- **Backend Operasyonel Ek Özellikler**
  - [ ] 39a- Spring Boot Actuator → `/actuator/health`, `/actuator/info`
  - [ ] 39b- API rate limiting (opsiyonel)
  - [ ] 39c- Structured logging (JSON format)
  - [ ] 39d- Docker Compose dosyası (backend + PostgreSQL + frontend)
- [ ] 40- **Frontend Son Dokunuşlar**
  - [ ] 40a- BootSequence bileşeninde gerçek backend sağlık kontrolü ("BACKEND_HEALTH: OK")
  - [ ] 40b- Ayarlar modalında backend bağlantı durumu göster
  - [ ] 40c- Hata durumunda kullanıcıya bilgi veren fallback UI
  - [x] 40d- `index.html` → JetBrains Mono font import (CSS'te kullanılıyor ama import yok)
- [x] 41- **V4.0 Elite Command Hub UI Güncellemesi**
  - [x] 41a- `App.jsx` V4.0 Cinematic Parallax & Snap Layout tasarımı
  - [x] 41b- `Earth3D.jsx` dinamik kalkan ve Pulse efektleri
  - [x] 41c- `index.css` Glassmorphism V4.0 ve HUD scanline entegrasyonu

---

## 📊 İlerleme Tablosu

| Faz | Açıklama | Toplam | Tamamlanan | Durum |
|:---:|----------|:------:|:----------:|:-----:|
| 1 | Backend Temel Altyapı | 18 | 18 | ✅ |
| 2 | Frontend ↔ Backend Entegrasyonu | 5 | 5 | ✅ |
| 3 | ML/AI Model (models/ klasörü) | 4 | 3 | 🔄 |
| 4 | SWPC Format Değişikliği Uyumu | 3 | 0 | ⬜ |
| 5 | Zamanlanmış Veri Toplama & DB | 3 | 0 | ⬜ |
| 6 | WebSocket & Bildirim | 3 | 0 | ⬜ |
| 7 | Üretim Hazırlığı & Ek Özellikler | 5 | 1 | 🔄 |

---

## 🗂️ Mevcut Dosya Yapısı

```
hackathon/
├── to do.md                          ← BU DOSYA
├── frontend/
│   ├── .env                          ← NASA API key (Phase 2'de kaldırılacak)
│   ├── index.html                    ← Outfit font import (JetBrains Mono eksik!)
│   ├── package.json                  ← React 19 + Vite 8 + Three.js + Zustand
│   ├── vite.config.js                ← Tailwind v4 plugin (proxy eklenecek)
│   ├── public/textures/              ← earthmap.jpg, earthbump.jpg, earthspec.jpg, sunmap.jpg
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                   ← 4 section snap scroll dashboard (V4.0)
│       ├── index.css                 ← Glass, HUD, snap system, tech-header, mono-info
│       ├── api/solarApi.js           ← 7 harici API çağrısı (Phase 2'de backend'e yönlenecek)
│       ├── store/solarStore.js       ← Zustand + risk hesaplama (Phase 2'de backend'e taşınacak)
│       └── components/
│           ├── Sun3D.jsx             ← GLSL shader güneş (simplex noise + FBM plasma)
│           ├── Earth3D.jsx           ← Texture-mapped dünya + atmosphere + HUD overlay
│           ├── DataCharts.jsx        ← Recharts AreaChart (flux, Bt, speed, Kp)
│           ├── RiskAnalysis.jsx      ← Risk gauge + AI analiz metni + sistem göstergeleri
│           ├── SolarOverlay.jsx      ← SDO görüntü + aktif bölge overlay
│           ├── CommandWidget.jsx     ← HUD tarzı kart bileşeni (sensor ID, latency, status)
│           ├── BootSequence.jsx      ← Sistem açılış animasyonu
│           └── StarfieldBackground.jsx ← Three.js 5000 yıldız particle background
├── backend/
│   ├── pom.xml                       ← Spring Boot 4.0.5, PostgreSQL, Caffeine, Lombok
│   ├── mvnw / mvnw.cmd
│   └── src/main/
│       ├── resources/application.properties
│       └── java/com/example/demo/
│           ├── DemoApplication.java  ← @EnableCaching @EnableScheduling
│           ├── config/
│           │   ├── CorsConfig.java
│           │   ├── SecurityConfig.java
│           │   └── RestClientConfig.java
│           ├── controller/
│           │   ├── SolarDataController.java   ← 8 endpoint
│           │   └── RiskController.java        ← 1 endpoint
│           ├── service/
│           │   ├── SwpcDataService.java        ← 5 SWPC API + cache + parser
│           │   ├── NasaDonkiService.java       ← NASA CME API + cache
│           │   ├── HelioviewerService.java     ← SDO görüntü URL
│           │   └── RiskCalculationService.java ← Risk motoru + DB kayıt
│           ├── model/
│           │   ├── dto/   (7 dosya)
│           │   └── entity/ (2 dosya)
│           └── repository/
│               ├── SolarDataRepository.java
│               └── RiskEventRepository.java
└── models/                           ← ML modelleri (LSTM tabanlı Güneş Fırtınası Tahmin modeli eklendi)
```
