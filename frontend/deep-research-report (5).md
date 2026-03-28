# Güneş Fırtınaları Erken Uyarı Sistemi için Tam Mimari Tasarım ve MVP Planı

## Tehdit modeli ve erken uyarının zaman ufukları

Bu sistemin doğru çalışması için “güneş fırtınası” kavramını operasyonel olarak üç ana olaya ayırmak gerekir: **güneş patlamaları (solar flare)**, **güneş enerjili parçacık olayları (SEP / solar radiation storms)** ve **Dünya’ya yönlü koronal kütle atımları (CME) ile bunların tetiklediği geomanyetik fırtınalar**. citeturn8view2turn5view2turn7view2turn11view0

Erken uyarı penceresi olay tipine göre dramatik şekilde değişir:

- **Solar flare (R-ölçeği / “Radio Blackouts”)**: Etki (özellikle Güneş aydınlık yüzündeki HF haberleşme ve bazı navigasyon bileşenleri) çok hızlı başlayabilir; operasyonel izleme için temel ölçüt GOES X-ray akısıdır. citeturn7view2turn5view2turn8view2  
- **SEP / Proton olayı (S-ölçeği / “Solar Radiation Storms”)**: Uydu elektronikleri ve kutup bölgelerinden geçen uçuşlar için kritik olabilir; SWPC, GOES ölçümleri üzerinden ≥10 MeV ve ≥100 MeV eşiklerine dayalı uyarı/alert üretir ve bu eşikler NOAA S-ölçeği ile hizalanır. citeturn11view0turn5view2turn8view2  
- **CME → Geomanyetik fırtına (G-ölçeği)**: Önceden uyarı iki katmandır:  
  - **1–4 gün** ölçeğinde, fizik tabanlı **WSA–Enlil** benzeri modellerle “Earth-directed CME” senaryolarına erken bakış. citeturn7view4  
  - **15–60 dakika** ölçeğinde, L1 noktasındaki gerçek-zamanlı güneş rüzgârı ölçümlerinin Dünya’ya ulaşmadan önce verdiği kısa “son dakika” penceresi. citeturn7view3turn0search11turn5view3

Bu nedenle “tek bir ML modeli” yerine, farklı ufuklarda çalışan **çok-katmanlı (multi-horizon) tahmin** ve **nowcasting** yapısı mimarinin merkezinde olmalıdır. NOAA’nın aurora nowcast ürünü de açıkça bu mantıkla, L1→Dünya taşınım süresine dayalı **30–90 dakikalık** kısa vadeli bir uyarı penceresi sunduğunu belirtir. citeturn7view5turn3search0

## Veri kaynakları ve veri sözleşmeleri

Bu bölüm, sistemin “gerçek zamanlı” iddiasını taşıyabilmesi için gerekli **resmî veri ürünlerini**, erişim yöntemlerini ve 2026 itibarıyla kritik **format/deprecations** risklerini tanımlar.

### Operasyonel birincil kaynak

Operasyonel (kamuya açık) ürünler için temel omurga, entity["organization","National Oceanic and Atmospheric Administration","us oceanic-atmospheric"] bünyesindeki entity["organization","Space Weather Prediction Center","noaa space weather"] veri servisleridir. SWPC; `services.swpc.noaa.gov` altında **Products/Text/Images/JSON** erişimi tanımlar ve uzun dönem arşiv için NCEI’yi işaret eder. citeturn7view1  
SWPC’nin JSON yayını 2018’den beri resmî olarak genişletilmiştir; kök dizin `services.swpc.noaa.gov/json` olarak duyurulmuştur. citeturn8view4

Sistemde pratikte iki SWPC katmanı kullanılır:

- **/products**: Özet ürünler (ör. planetary Kp, Dst, alerts/watches/warnings gibi). Dizin örneği: `noaa-planetary-k-index.json`, `noaa-planetary-k-index-forecast.json`, `alerts.json`, `kyoto-dst.json`. citeturn10view1turn8view1  
- **/json**: Daha geniş ve “paylaşılabilir veri” odaklı ürünler (ör. `ovation_aurora_latest.json`, `planetary_k_index_1m.json`, `enlil_time_series.json`, `icao-space-weather-advisories.json`). citeturn10view0

### 2026 format değişiklikleri ve deprecations (kritik)

Bugünün tarihine (2026-03-28, İstanbul) çok yakın olan iki değişiklik, mimaride “sözleşme dayanıklılığı” (contract resilience) gerektiriyor:

- **31 Mart 2026 civarı**: Bazı SWPC JSON ürünleri yeniden yapılandırılacak; “ilk satır anahtarlar + sonraki satırlar değerler” formatından **standart JSON object** formatına geçiş ve numeric alanların “string” olmaktan çıkarılması gibi değişiklikler var. Listelenen ürünler arasında `kyoto-dst.json`, `noaa-planetary-k-index.json`, `noaa-planetary-k-index-forecast.json` ve bazı özet “solar-wind” JSON’ları bulunuyor. citeturn5view0turn5view1  
- **30 Nisan 2026 civarı**: Bazı eski `products/solar-wind/*` RTSW dosyaları kaldırılacak; yerine `json/rtsw/` altında **1 dakikalık** yeni uç noktalar ve ayrıca “source/active” metadata alanları sunulacak. citeturn5view0turn5view1  

Bu, veri toplama servisinde iki zorunlu tasarım kararına yol açar:
1) **Schema versioning + backward compatibility**: Her ingest edilen ürün için `schema_version`, `producer`, `observed_at`, `valid_time` alanlarını saklamak. citeturn5view0turn5view1  
2) **Endpoint abstraction**: Kod içinde “tek URL” bağımlılığı yerine “product registry” (konfigürasyon + healthcheck). Deprecation halinde otomatik failover. citeturn5view1  

Ayrıca SWPC geçmişte de Kp ürününün “resmî forecast penceresi” ile uyumu için JSON kapsamını **3 güne indirmiştir**; bu da tahmin ufku tasarımında “resmî ürün sınırı” kavramını gerektirir. citeturn8view5

### Olay-tipi bazında önerilen ana sinyaller

- **R (radio blackout / flare)**: `GOES X-ray Flux` ile flare takibi, SWPC’nin M5 seviyesinde alarm üretmesi ve X-ray olay başlangıç/bitiş tanımları. citeturn7view2turn5view2  
  GOES flare sınıflandırması, 1 dakikalık ortalama pik irradiansın log10 ölçeğine göre (X=10⁻⁴, M=10⁻⁵, C=10⁻⁶…) tanımlanır; bu, model etiketleme (labeling) ve eşik kurgusunu doğrudan etkiler. citeturn5view5turn4view4  
- **S (radiation / proton)**: GOES proton flux eşikleri (≥10 MeV için 10/100/1000/… pfu) S-ölçeği ile eşleştirilir; SWPC bunun için warning/alert/summary ürünleri üretir. citeturn11view0turn5view2  
- **G (geomanyetik)**: Planetary Kp; SWPC Kp’yi uyarı/ikaz kararlarında ana gösterge olarak kullanır ve Kp’nin 0–9 aralığında, 3 saatlik aralıklardan türeyen bir indeks olduğunu açıklar. citeturn7view0turn8view2turn5view2  
- **Aurora ve lokasyon nowcast**: OVATION tabanlı aurora ürünü 30–90 dakika ufukta nowcast üretir; hem bireysel kullanıcı (aurora görünürlüğü) hem HF/GNSS etkisi için lokasyon bazlı sinyal sağlar. citeturn7view5turn8view3turn10view0  
- **CME / 1–4 gün ufuk**: WSA–Enlil, SWPC’nin 1–4 gün “advance warning” için kullandığı fizik tabanlı modeldir ve model bileşenlerini/driver’larını (ör. WSA + Enlil, manyetik alan gözlemleri vb.) açıklar. citeturn7view4turn10view0  

### Havacılık için resmî advisory kanalı

Havacılıkta kritik olan, entity["organization","Uluslararası Sivil Havacılık Örgütü","icao"] için üretilen **Space Weather Advisory** formatıdır. SWPC bu advisories’i kamuya açık bir arayüzle yayımlar ve JSON olarak da sunar. citeturn8view0turn10view0  
2018’de ICAO’nun NWS SWPC’yi küresel uzay hava durumu merkezlerinden biri olarak seçtiğini ve advisories’in 2019’da operasyonelleştiğini belirten resmî NWS duyurusu; sisteminizde “havacılık modülü”nün SWPC/ICAO çıkışını **birincil gerçek** (source of truth) olarak kullanması gerektiğini destekler. citeturn5view6  

### Araştırma/ek bağlam kaynağı

entity["organization","National Aeronautics and Space Administration","us space agency"] tarafındaki entity["organization","Community Coordinated Modeling Center","nasa ccmc"] ürünü DONKI, olay arşivi ve webservice API sunar; ancak kendisi “official forecast” değildir ve “as-is” disclaimer içerir. Bu nedenle DONKI, **eğitim/etiketleme/retrospektif analiz** için idealdir; operasyonda ise SWPC öncelikli olmalıdır. citeturn6view0turn6view1  

### Görüntü kaynağı (SDO gibi) için pratik erişim

SDO benzeri güneş görüntülerini API ile almak için Helioviewer `getJP2Image` uç noktası, ISO 8601 zaman parametresi ve sourceId/observatory-instrument parametreleri ile JP2 görüntü indirimi tanımlar. Bu, MVP’de SDO görüntü pipeline’ını hızlı kurmak açısından pratiktir. citeturn9view0turn9view1  

image_group{"layout":"carousel","aspect_ratio":"16:9","query":["NOAA SWPC aurora 30 minute forecast map OVATION","NOAA SWPC GOES X-ray flux plot","SDO AIA solar flare image","SOHO LASCO coronagraph CME image"],"num_per_query":1}

## Mimari blokları ve uçtan uca veri akışı

Tasarladığınız şema doğru yönde; ancak “tam teşekkürlü” hale gelmesi için aşağıdaki eksikler tamamlanmalı: **çok-ufuklu tahmin**, **veri sözleşmesi yönetimi**, **yüksek kullanılabilirlik (HA) ve failover**, **model doğrulama/uncertainty**, **sektöre göre etki haritalama**, **güvenlik ve yanlış alarm yönetimi**.

### Hedef mimari (önerilen referans akış)

Aşağıdaki akış, hem hackathon MVP’ye indirgenebilir hem de üretime büyütülebilir:

```text
[External Feeds: SWPC / Helioviewer / DONKI(Optional)]
          |
          v
  Ingestion Layer (polling + caching + contract tests)
          |
          v
Kafka Topics (raw.*) --> Stream Processor --> Kafka Topics (features.*)
          |                                  |
          v                                  v
   Raw Data Lake (object storage)      Timeseries DB (TimescaleDB)
          |                                  |
          v                                  v
   Training Datasets (batch)            Online Feature Store (redis/cache)
          |                                  |
          v                                  v
 Model Training (offline)               Model Serving (online, GPU/CPU)
          |                                  |
          v                                  v
   Model Registry + Eval                  Risk Engine (domain rules + ML)
          |                                  |
          v                                  v
     Governance                         Alerting + Dashboard + Chatbot
```

Bu akışın “gerçek zamanlı” olabilmesi için SWPC gibi kaynaklarda tercih edilen yöntem genellikle **düşük gecikmeli periyodik çekim (polling)** + `If-Modified-Since/ETag` optimizasyonudur (SWPC JSON’ları statik dosya olarak güncellenir). SWPC ayrıca hızlı güncellenen, dakikalık indeksler ve nowcast ürünleri yayınlar (ör. planetary_k_index_1m, ovation_aurora). citeturn10view0turn7view1turn8view4  

### Ingestion katmanı tasarımı (kritik noktalar)

1) **Ürün kayıt defteri (Product Registry)**  
Her veri ürünü için şu metadata tutulmalı: `product_id`, `endpoint`, `update_cadence`, `schema_version`, `parser`, `SLA_expectation`, `deprecation_date`. 2026 RTSW ve JSON değişiklikleri gibi durumlarda registry hızlı güncellenir. citeturn5view0turn5view1  

2) **RTSW kaynak değişimi ve veri kalitesi**  
DSCOVR düşük yoğunluk durumlarında hatalı değerler üretebilir; SWPC, sorun fark edildiğinde ACE’e geçebildiğini belirtir. Bu yüzden ingestion katmanı **source-aware** olmalı ve downstream taraf “kaynak değişti” olayını feature setine yansıtmalıdır. citeturn7view3turn0search7  

3) **Yeni RTSW uç noktalarındaki metadata**  
Nisan 2026 sonrası “replacement RTSW products” `source` ve `active` alanlarını içerecek. Bu alanlar hem veri kalitesi/izlenebilirlik hem de model performans analizi açısından altın değerindedir (ör. hangi uydu varken hata arttı?). citeturn5view1turn5view0  

4) **Arşiv stratejisi**  
- Kısa vadeli operasyon: TimescaleDB (1 dk–3 saat cadence).  
- Ham veri: obje depolama (S3/GCS) + partition (yıl/ay/gün/product).  
- Uzun dönem doğrulama: NCEI arşivlerine referans vererek “backfill” işleri. citeturn7view1turn1search16  

### Depolama şeması (önerilen minimal çekirdek)

Timeseries tablolarını “olay tipine göre” ayırmak yerine “sinyal tipine göre” ayırmak genelde daha sürdürülebilir:

- `ts_solar_wind_1m` (speed, density, temperature, Bt, Bz, source, active)  
- `ts_goes_xray_1m` (0.1–0.8 nm flux, class, event_state)  
- `ts_goes_proton_5m` (>=10MeV, >=100MeV, thresholds)  
- `ts_geomag_kp_3h` ve `ts_geomag_kp_1m` (observed/predicted/estimated ayrımı) citeturn7view0turn10view0  
- `grid_ovation_aurora` (lat/lon grid + probability) citeturn7view5turn8view3turn10view0  
- `events_alerts` (SWPC alerts/watches/warnings JSON’dan türetilmiş normalleştirilmiş olaylar) citeturn8view1turn10view1  
- `events_icao_advisories` (ICAO advisory JSON + metin) citeturn8view0turn5view6  

## AI tahmin katmanı ve hibrit yaklaşım

Sisteminizin en güçlü yönü “Hybrid AI Model” hedefi. Bunu “pazarlama” değil, gerçek bir mühendislik avantajına çevirmek için hibriti şu şekilde tanımlamak gerekir: **(A) fizik tabanlı/operasyonel model çıktıları + (B) veri güdümlü ML modelleri + (C) kural/uzman sistem** birlikte çalışır.

### Çok görevli tahmin problemi

Üç ayrı çıktı ailesi aynı anda hedeflenmeli:

- **Flare / Radio blackout olasılığı ve şiddeti (R-scale proxy)**: GOES X-ray akısı ve/veya görüntü tabanlı aktif bölge özellikleriyle. SWPC’nin flare tanımları ve M5 eşik pratikleri, hem label hem eşik kalibrasyonu için temel alınabilir. citeturn7view2turn5view5turn5view2  
- **Kp / geomanyetik aktivite tahmini (G-scale proxy)**: Zaman serisi + solar wind (özellikle Bz). Kp’nin tanımı ve uyarılardaki rolü net olduğu için hedef değişken olarak çok uygundur. citeturn7view0turn8view2  
- **CME varış zamanı ve jeo-etkililik**: WSA–Enlil çıktısını (veya SWPC’nin Enlil time series’ini) “prior” olarak alıp ML ile kalibrasyon/enhancement yapmak. SWPC’nin WSA–Enlil’i 1–4 gün uyarı amacıyla kullandığını belirtmesi bu yaklaşımı operasyonel olarak da anlamlı kılar. citeturn7view4turn10view0  

### Neden LSTM/Transformer?

Kp tahmini için literatürde güçlü bir baseline vardır: solar wind + IMF parametreleri + geçmiş Kp değerlerini girdi alıp Kp tahmini yapan LSTM yaklaşımı (Tan ve ark., 2018). Bu, MVP’den üretime geçerken “başlangıç modeli” olarak değerlidir. citeturn13search1  
Dst gibi indekslerde Transformer tabanlı, kısa vadeli (1–6 saat) tahmin ve ayrıca belirsizlik (aleatoric/epistemic) nicemleme öneren çalışmalar da vardır; bu, “Güven Skoru”nu bilimsel zemine oturtmak için iyi bir referanstır. citeturn13search6  

### Hibrit mimariyi somutlaştırma

Hibritin pratik uygulaması:

- **Fizik tabanlı katman**:  
  - WSA–Enlil (1–4 gün): CME ve solar wind yapıları için. citeturn7view4  
  - OVATION (30–90 dk): aurora nowcast; ayrıca “solar wind yoksa Kp ile sürme” fallback’ı var. Bu fallback, sisteminizde “data outage” durumunda otomatik degrade stratejisine örnek olmalı. citeturn7view5turn5view0  
- **ML katmanı**:  
  - Kp nowcast/short-term: LSTM/Transformer. citeturn13search1turn13search6  
  - Flare: görüntü + zaman serisi (GOES + SDO/HMI/AIA). (Bu kısım MVP’de opsiyonel bırakılabilir; Phase-2). citeturn9view0turn5view5  
- **Kural/uzman katmanı**:  
  - NOAA R/S/G ölçek eşikleri (ör. G1=Kp5, G2=Kp6 … haritalaması NOAA ölçeğinde verilir). citeturn5view2turn8view2  
  - “Sektöre göre aksiyon” (grid operator, havacılık, uydu) için deterministic kurallar.

### Model doğrulama ve metrikler

Uzay hava durumu tahminleri “nadir olay” problemidir; bu yüzden tek başına accuracy yanıltıcı olur. SWPC’nin forecast verification sözlüğü; POD, FAR, CSI, TSS gibi metrikleri tanımlar ve özellikle kategorik olay tahminlerinde kullanıldığını gösterir. citeturn4view3turn5view4  
Bu sistemde pratik olarak:

- **Olay tahmini** (örn. “önümüzdeki 24 saatte ≥M sınıfı flare var mı?”): TSS/CSI + calibration (Brier). citeturn4view3  
- **Sürekli değişken** (örn. Kp zaman serisi): MAE/RMSE + probabilistic coverage (P10/P50/P90).  
- **Operasyonel KPI**: “kaç dakika önce uyardım?”, “yanlış alarm maliyeti”, “kaçırma maliyeti”.

## Risk skorlama, lokasyon bazlı etki ve güven skoru

Sizin taslağınızda “Risk Skorlama” var, ancak “hangi sinyal hangi sektöre nasıl çevrilecek?” kısmı eksik. Burada hedef; **tek bir skor** yerine, kullanıcı segmentine göre **eyleme dönük** (actionable) çıktı üretmektir.

### Çekirdek risk modeli

Risk motoru, minimumda şu üç “resmî ölçek” üzerinden normalize edilmelidir:

- **R-ölçeği (flare / radio blackouts)**: HF ve bazı navigasyon etkileri. citeturn5view2turn8view2  
- **S-ölçeği (solar radiation storms)**: parçacık radyasyonu; GOES proton eşikleriyle hizalıdır. citeturn11view0turn5view2  
- **G-ölçeği (geomanyetik storms)**: Kp’ye bağlanır; güç sistemleri, uydu operasyonları, HF yayılımı ve GNSS etkileri gibi geniş bir etki listesi vardır. citeturn5view2turn8view2  

Kp’nin nasıl üretildiği ve SWPC’nin uyarı kararındaki rolü; risk motorunda Kp’yi “ana latent değişken” yapmayı mantıklı kılar. citeturn7view0

### Lokasyon bazlı risk yaklaşımı

Lokasyon bazlı risk için önerilen 3 katman:

1) **Geomanyetik enlem duyarlılığı (global, düşük maliyetli)**  
Kp, 44–60° geomanyetik enlem bandındaki gözlemevlerinden türetilen planetary bir ortalamadır; bu yüzden “kutup bölgeleri daha hassas” genellemesi doğrudan veriye dayanır. citeturn7view0turn5view2  
Bu katman, ör. entity["country","Türkiye","country"] gibi orta enlemler için “genel” risk sınıflandırması üretir; Kuzey Avrupa gibi daha yüksek enlemler için eşik daha agresif olur (özellikle G ve HF/GNSS etkilerinde). citeturn5view2turn7view0  

2) **Aurora/ionosfer nowcast (global, operasyonel veriyle)**  
OVATION ürünü doğrudan “lokasyon ve şiddet” nowcast’idir ve HF/GNSS/ground currents ile ilişkilidir. Bu veri size **grid bazlı** (lat/lon) risk dağıtımı sağlar ve kullanıcıya “harita” şeklinde verilebilir. citeturn7view5turn8view3turn10view0  

3) **Sektör spesifik model entegrasyonu (bölgesel, yüksek doğruluk)**  
- **Elektrik şebekesi**: SWPC’nin geoelectric field modelleri, geoelectric alanı “induction hazard” olarak tanımlar ve iletken hatlarda indüklenen akımı (GIC) kestiriminde kullanılabileceğini belirtir. Ancak bu operasyonel ürün, kapsam olarak ABD alt 48 eyalet + Kanada (60° enleme kadar) ile sınırlıdır. citeturn12search0turn12search4  
  Bu yüzden Türkiye ve Avrupa ölçeğinde “aynı türden” bir operasyonel geoelectric field haritası yoksa, sizin sisteminizde şebeke riskinin global versiyonu Kp/aurora proxy ile sınırlı kalmalıdır (şeffaflık şart). citeturn12search0turn7view0turn7view5  
- **GNSS / haberleşme**: GloTEC, geomanyetik fırtınalarda GNSS gecikmesi ve zamanlama doğruluğu etkilerini analiz etmek için TEC haritalarının kullanılabileceğini açıklar; bu, lokasyon bazlı “GNSS risk” katmanı için doğrudan veri sağlar. citeturn12search11turn12search3  

### Güven skoru (Confidence) için önerilen formül

“Güven skoru”nun kullanıcıya dürüst olması gerekir; tek başına “model accuracy” diye yazmak yerine, skoru şu üç bileşenin birleşimi olarak üretin:

- **Data Freshness**: en kritik feed’in gecikmesi (örn. RTSW 1m: 0–2 dk iyi, 10 dk kötü). RTSW’de kaynak geçişi ve hata olasılığı bilindiği için “source/active” alanı freshness’e eklenebilir. citeturn7view3turn5view1  
- **Model Uncertainty**: probabilistic model (P50/P90 aralığı) veya ensemble spread; uzay hava durumu tahminlerinde TSS, FAR/POD gibi metriklerin raporlanması yaygındır. citeturn4view3turn13search6  
- **Model Agreement**: fizik tabanlı (WSA–Enlil/OVATION) ve ML çıktılarının uyumu.

Bu sayede “Low/Medium/High” gibi basit çıktıların yanında, **“High risk, düşük güven”** gibi kritik durumları da gösterebilirsiniz.

## MVP tasarımı ve üretime giden yol haritası

Hackathon MVP’si için hedef; bütün bileşenleri kurmak değil, **uçtan uca çalışan bir “uyarı döngüsü”** göstermek olmalı.

### Hackathon MVP kapsamı

MVP’de en yüksek ROI yaklaşımı:

1) **SWPC’den veri çek**  
   - `alerts.json` ile resmî uyarı/watches/warnings çekirdek akışı. citeturn8view1turn10view1  
   - `noaa-planetary-k-index-forecast.json` ile 3 günlük Kp tahmin penceresi (format değişikliklerine dikkat). citeturn10view1turn5view0turn8view5  
   - RTSW için yeni uç noktaları hedefle (Nisan 2026 uyumlu): `json/rtsw/rtsw_mag_1m.json` ve `json/rtsw/rtsw_wind_1m.json`. citeturn5view1turn10view0  
   - Lokasyon demo için `ovation_aurora_latest.json` (harita/heatmap). citeturn10view0turn7view5  

2) **Basit risk motoru (rule-based)**  
   - Kp forecast → G1–G5 mapleme (NOAA ölçeğindeki Kp eşikleri). citeturn5view2turn8view2  
   - Alerts JSON’daki event tipine göre “uydu/havacılık/şebeke/kişisel” etki metinleri.

3) **Web dashboard**  
   - “Şu an” (observed) + “önümüzdeki 72 saat” (forecast) + “uyarı geçmişi”.  
   - Basit lokasyon seçici (ör. ülke/şehir) ve aurora/geomanyetik risk overlay.

4) **Bildirim sistemi**  
   - MVP’de e-posta/web-push yeterli; SMS opsiyonel.  
   - Alert tetik koşulları: (a) G1+ bekleniyor, (b) R2+ oluştu, (c) S1+ oluştu.

Aşağıdaki uç noktalar MVP’de “tek sayfa demo” için yeterli çekirdeği sağlar:

```text
SWPC Products:
- /products/alerts.json
- /products/noaa-planetary-k-index-forecast.json

SWPC JSON:
- /json/rtsw/rtsw_mag_1m.json
- /json/rtsw/rtsw_wind_1m.json
- /json/ovation_aurora_latest.json
- /json/icao-space-weather-advisories.json
```

(İstemci kodunda mutlaka schema v2/v3 uyumluluğu ve March–April 2026 değişiklikleri için parser switch tasarlanmalı.) citeturn5view0turn5view1turn8view0turn10view0  

### Üretime genişleme yol haritası

MVP sonrası “puan kazandıran” genişletmelerinizi üretim mantığıyla sıralarsak:

- **Havacılık modülü**: ICAO advisory feed’ini ayrı bir “Aviation View” olarak sunun; advisories’in global kapsama ve 6 saatlik update mantığı resmî dokümanda vurgulanır. citeturn5view6turn8view0  
- **Şebeke modülü**:  
  - Globalde Kp/aurora proxy + kullanıcıya açık belirsizlik beyanı. citeturn7view0turn7view5turn12search0  
  - Uygun coğrafyalarda geoelectric field model entegrasyonu; SWPC bunu induction hazard ölçütü olarak tanımlar. citeturn12search0turn12search2  
  - “GIC risk” anlatımı için güvenilir kaynak: entity["organization","North American Electric Reliability Corporation","power reliability org"], GMD/GIC’nin trafolarda saturasyon ve geniş ölçekli risk üretebildiğini ve 1989 Hydro-Québec kesintisini örnek verir. citeturn5view3turn4view2  
- **Uydu operatör API bağlantısı**: R/S/G çıktılarının “uydu yüzeyi şarjı, drag, SEU riski” gibi aksiyon kartlarına çevrilmesi; NOAA ölçekleri bu etkileri açıklar. citeturn8view2turn5view2  
- **AI katmanı**:  
  - Kp tahmini için LSTM baseline (Tan 2018) → Transformer/uncertainty. citeturn13search1turn13search6  
  - WSA–Enlil + ML kalibrasyon (hibrit). citeturn7view4turn13search7  

### Operasyon, güvenlik ve yanlış alarm yönetimi

Bu tür sistemlerde teknik borcun en hızlı büyüdüğü yer “ops”tur. Minimum üretim standartları:

- **SLO**: dashboard “freshness” (örn. RTSW < 2 dk), alert gecikmesi (örn. 30 sn içinde push).  
- **Observability**: her feed için lag, parse error, schema mismatch alarmı. 2026 JSON değişiklikleri gibi olaylar “sessiz kırılma” üretir; bunu erken yakalamak şarttır. citeturn5view0turn5view1  
- **Yanlış alarm**: kullanıcı segmentine göre eşik; havacılık/şebeke için “resmî advisory + doğrulama” önceliği. citeturn5view6turn8view0  
- **Kaynak hiyerarşisi**: DONKI gibi araştırma kaynaklarını operasyonda “secondary/enrichment” olarak işaretlemek; DONKI kendisini resmî forecast olarak konumlamaz. citeturn6view1turn6view0  

Cloud tarafında entity["company","Amazon Web Services","cloud platform"] veya entity["company","Google Cloud","cloud platform"] üzerinde Kubernetes + Docker dağıtımı uygundur; ancak hackathon MVP’sinde tek node + managed DB (veya local Timescale) ile de gösterim yapılabilir. citeturn7view1turn8view4