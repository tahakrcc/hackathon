import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import {
  Zap, Bell, Settings, ChevronDown, Globe, Shield, Activity,
  Cpu, Radio, BarChart3, Wind, Thermometer, Droplets
} from 'lucide-react';
import { useSolarStore } from './store/solarStore';
import Sun3D from './components/Sun3D';
import Earth3D from './components/Earth3D';
import DataCharts from './components/DataCharts';
import RiskAnalysis from './components/RiskAnalysis';
import StarfieldBackground from './components/StarfieldBackground';
import BootSequence from './components/BootSequence';
import CyberCard from './components/CyberCard';
import WebGLErrorBoundary from './components/WebGLErrorBoundary';
import NotificationPanel from './components/NotificationPanel';
import SettingsPanel from './components/SettingsPanel';
import GeospaceObserver from './components/GeospaceObserver';
import EmergencyAlert from './components/EmergencyAlert';
import { fetchHelioviewerImage } from './api/solarApi';

// Fallback constant for sun image
const sunImage = 'https://api.helioviewer.org/v2/takeScreenshot/?date=2024-01-01T00:00:00Z&sourceId=14&imageScale=2.4&x0=0&y0=0&width=1000&height=1000';

function App() {
  const {
    updateData, connectWebSocket, wsConnected, xrayFlux, solarWind, solarMag, kpIndex,
    cmeEvents, riskScore, riskData, aiAnalysis, satelliteData, loading: dataLoading, lastUpdate,
    alertState, fetchRecipients
  } = useSolarStore();

  // === GERÇEK VERİ HESAPLAMALARI ===
  const safeCmeEvents = cmeEvents || [];
  const safeKpIndex = kpIndex || [];
  const safeSolarWind = solarWind || [];
  const safeSolarMag = solarMag || [];
  const safeXray = xrayFlux || [];

  const [activeSection, setActiveSection] = useState(0);
  const [isBooting, setIsBooting] = useState(true);
  const [lastSeenCount, setLastSeenCount] = useState(0);
  const [selectedEventIndex, setSelectedEventIndex] = useState(0);
  const [selectedEventImage, setSelectedEventImage] = useState(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  
  // İlk veri geldiğinde lastSeenCount'u eşitle (10 sayısını başlangıçta göstermemek için)
  useEffect(() => {
    if (safeCmeEvents.length > 0 && lastSeenCount === 0) {
      setLastSeenCount(safeCmeEvents.length);
    }
  }, [safeCmeEvents, lastSeenCount]);

  // Arşiv olayı değiştiğinde resim çek
  useEffect(() => {
    const fetchSnapshot = async () => {
      if (safeCmeEvents.length > 0 && selectedEventIndex < safeCmeEvents.length) {
        setIsImageLoading(true);
        const event = safeCmeEvents[selectedEventIndex];
        const dateStr = event.startTime;
        try {
          const imgUrl = await fetchHelioviewerImage(dateStr);
          setSelectedEventImage(imgUrl);
        } catch (err) {
          console.error("Snapshot hatası:", err);
          setSelectedEventImage(sunImage); // Fallback to current sun
        } finally {
          setIsImageLoading(false);
        }
      }
    };
    fetchSnapshot();
  }, [selectedEventIndex, safeCmeEvents, sunImage]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const containerRef = useRef(null);

  const { scrollYProgress: rawScrollProgress } = useScroll({ container: containerRef });
  const scrollYProgress = useSpring(rawScrollProgress, { stiffness: 80, damping: 40, restDelta: 0.0001 });

  // WebSocket Live Feed & Initial Fetch
  useEffect(() => {
    // 1. Sayfa ilk açıldığında HTTP üzerinden güncel veriyi bir kereliğine çek
    updateData();

    // 2. Ardından "Gerçek Zamanlı" WebSocket tüneline bağlan
    connectWebSocket();

    // 3. (Fallback) WebSocket çöker diye 5 dakikada bir (300sn) güvenli yedekleme yapsın
    const fallbackInterval = setInterval(() => {
      // Sadece ws bağlantısı koptuysa yedek çağrı at
      if (!useSolarStore.getState().wsConnected) updateData();
    }, 300000);

    return () => clearInterval(fallbackInterval);
  }, [updateData, connectWebSocket]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const h = containerRef.current.offsetHeight;
    if (h === 0) return;
    // CSS Snap %50'den sonra tetiklendiği için round kullanmak senkronu korur
    const s = Math.round(containerRef.current.scrollTop / h);
    if (s !== activeSection) setActiveSection(s);
  };

  const scrollToSection = (index) => {
    if (!containerRef.current) return;
    const h = containerRef.current.offsetHeight;
    containerRef.current.scrollTo({
      top: index * h,
      behavior: 'smooth'
    });
  };

  // Son güneş rüzgarı verileri
  const latestWind = safeSolarWind.length > 0 ? safeSolarWind[safeSolarWind.length - 1] : null;
  const windSpeed = latestWind?.speed ? parseFloat(latestWind.speed) : null;
  const windDensity = latestWind?.density ? parseFloat(latestWind.density) : null;
  const windTemp = latestWind?.temperature ? parseFloat(latestWind.temperature) : null;

  // Son manyetik alan verileri
  const latestMag = safeSolarMag.length > 0 ? safeSolarMag[safeSolarMag.length - 1] : null;
  const magBt = latestMag?.bt ? parseFloat(latestMag.bt) : null;
  const magBz = latestMag?.bz_gsm ? parseFloat(latestMag.bz_gsm) : null;

  // Son Kp indeksi
  const latestKp = safeKpIndex.length > 0 ? safeKpIndex[safeKpIndex.length - 1]?.kp_index : null;
  const kpValue = latestKp != null ? parseFloat(latestKp) : null;

  // Son X-Ray
  const latestXray = safeXray.length > 0 ? safeXray[safeXray.length - 1] : null;
  const xrayValue = latestXray?.flux ? parseFloat(latestXray.flux) : null;
  const xrayClass = useMemo(() => {
    if (!xrayValue) return '--';
    if (xrayValue >= 1e-4) return 'X';
    if (xrayValue >= 1e-5) return 'M';
    if (xrayValue >= 1e-6) return 'C';
    if (xrayValue >= 1e-7) return 'B';
    return 'A';
  }, [xrayValue]);

  // Manyetopoz mesafesi hesaplama (gerçek formül: basınç dengeleme)
  const magnetopauseDistance = useMemo(() => {
    if (!windDensity || !windSpeed) return 10.4;
    const mp = 1.67e-27;
    const dynamicPressure = 0.5 * windDensity * 1e6 * mp * (windSpeed * 1000) ** 2;
    const nPa = dynamicPressure * 1e9;
    // Shue et al. (1998) model: R = 11.4 * Dp^(-1/6.6)
    const distance = 11.4 * Math.pow(Math.max(nPa, 0.5), -1 / 6.6);
    return Math.max(5, Math.min(15, distance));
  }, [windDensity, windSpeed]);

  // Dinamik basınç (nPa)
  const dynamicPressure = useMemo(() => {
    if (!windDensity || !windSpeed) return null;
    const mp = 1.67e-27;
    const dp = 0.5 * windDensity * 1e6 * mp * (windSpeed * 1000) ** 2;
    return (dp * 1e9).toFixed(1);
  }, [windDensity, windSpeed]);

  // Kalkan bütünlüğü (Kp bazlı)
  const shieldIntegrity = useMemo(() => {
    if (kpValue == null) return 99.9;
    if (kpValue >= 8) return 65.0;
    if (kpValue >= 6) return 78.0;
    if (kpValue >= 4) return 88.0;
    return 99.9 - (kpValue * 1.2);
  }, [kpValue]);

  // Bölge etkileri (gerçek Kp bazlı)
  const getRegionImpacts = () => {
    const kpVal = kpValue || 0;
    if (kpVal >= 7) return [
      { label: 'Kuzey Kutup', risk: 'KRİTİK', color: 'magenta' },
      { label: 'Yüksek Enlem', risk: 'ŞİDDETLİ', color: 'magenta' },
      { label: 'Orta Enlem', risk: 'AKTİF', color: 'yellow' }
    ];
    if (kpVal >= 5) return [
      { label: 'Kuzey Kutup', risk: 'AKTİF', color: 'yellow' },
      { label: 'Yüksek Enlem', risk: 'YÜKSEK', color: 'yellow' },
      { label: 'Orta Enlem', risk: 'İZLENİYOR', color: 'cyan' }
    ];
    return [
      { label: 'Kuzey Kutup', risk: 'STABİL', color: 'cyan' },
      { label: 'Yüksek Enlem', risk: 'SAKİN', color: 'cyan' },
      { label: 'Orta Enlem', risk: 'NORMAL', color: 'cyan' }
    ];
  };

  // Risk seviyesi Türkçe
  const riskLevelTr = useMemo(() => {
    const lvl = riskData?.level;
    if (lvl === 'CRITICAL') return 'KRİTİK';
    if (lvl === 'HIGH_RISK') return 'YÜKSEK';
    if (lvl === 'MODERATE') return 'ORTA';
    return 'NORMAL';
  }, [riskData]);

  // Format sayı
  const fmt = (val, decimals = 1) => val != null ? Number(val).toFixed(decimals) : '--';

  // Ortak font sınıfları
  const labelClass = "text-[9px] tech-header text-slate-500 font-black tracking-widest";
  const valueClass = "font-black tabular-nums tracking-tighter";

  return (
    <div className="h-screen bg-cyber-bg text-slate-100 font-sans selection:bg-neon-cyan/30 overflow-hidden relative">
      <div className="cyber-vignette" />
      <div id="cyber-scanlines" />
      <React.Suspense fallback={null}><StarfieldBackground /></React.Suspense>

      <AnimatePresence mode="wait">
        {isBooting && <BootSequence key="boot" onComplete={() => setIsBooting(false)} />}
      </AnimatePresence>

      {!isBooting && (
        <>
          {/* BAŞLIK ÇUBUĞU */}
          <nav className="cyber-header-dock">
            <div className="flex flex-row items-center gap-6">
              <div className="p-2 border border-neon-cyan bg-neon-cyan/5 shadow-lg">
                <Zap size={22} className="neon-text-cyan" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl tech-header neon-text-cyan tracking-[4px]">Solar Sentinel</h1>
                <p className="text-[9px] tech-header text-neon-cyan/60 uppercase tracking-[2px]">SİBER_OS v1.0 // ÇEVRİMİÇİ</p>
              </div>
            </div>
            <div className="hidden lg:flex flex-row gap-16">
              <NavOption label="SİSTEM_ÇEKİRDEĞİ" icon={Activity} active={activeSection === 0} onClick={() => scrollToSection(0)} />
              <NavOption label="DÜNYA_KALKANI" icon={Globe} active={activeSection === 1} onClick={() => scrollToSection(1)} />
              <NavOption label="VERİ_ARŞİVİ" icon={Shield} active={activeSection === 2} onClick={() => scrollToSection(2)} />
              <NavOption label="YÖRÜNGE_GÖZLEMCİ" icon={Zap} active={activeSection === 3} onClick={() => scrollToSection(3)} />
            </div>
            <div className="flex flex-row items-center gap-6">
              <div className="hidden md:flex flex-col items-end border-r border-white/5 pr-6">
                <span className="text-[10px] tech-header neon-text-cyan animate-pulse">AĞ: GÜVENLİ</span>
                <span className="text-[8px] mono-info text-slate-400">DÜĞÜM: #CX-029</span>
              </div>
               <IconButton 
                 icon={Bell} 
                 badge={Math.max(0, safeCmeEvents.length - lastSeenCount)} 
                 onClick={() => {
                   setShowNotifications(true);
                   setLastSeenCount(safeCmeEvents.length);
                 }} 
               />
              <IconButton icon={Settings} onClick={() => setShowSettings(true)} />
            </div>
          </nav>

          {/* HUD DİKEY SAYFALAMA */}
          <div className="fixed left-6 top-1/2 -translate-y-1/2 flex flex-col gap-8 z-[2000]">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                onClick={() => scrollToSection(i)}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <span className={`text-[10px] font-black ${activeSection === i ? 'neon-text-cyan' : 'text-slate-600'}`}>0{i + 1}</span>
                <div className={`w-[1px] rounded-full transition-all duration-500 ${activeSection === i ? 'h-16 bg-neon-cyan' : 'h-6 bg-white/10 group-hover:bg-white/30'}`} />
              </div>
            ))}
          </div>

          <main ref={containerRef} onScroll={handleScroll} className="snap-container no-scrollbar pb-10">

            {/* ═══════════════ BÖLÜM 0: SİSTEM ÇEKİRDEĞİ ═══════════════ */}
            <section className="snap-section">
              <div className="section-content">
                <motion.div
                  initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1.2 }}
                  className="grid grid-cols-12 gap-6 lg:gap-8 h-full w-full items-start pt-8"
                >

                  {/* SOL SÜTUN */}
                  <div className="col-span-12 lg:col-span-3 flex flex-col gap-5 z-30">
                    <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                      <CyberCard title="X-Işını Akısı" sensorId="GOES-16" status="CANLI" color="cyan" icon={Radio}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[9px] tech-header text-slate-500">SINIF</span>
                          <span className={`text-lg font-black tabular-nums ${xrayClass === 'X' ? 'neon-text-magenta' : (xrayClass === 'M' ? 'neon-text-yellow' : 'neon-text-cyan')}`}>{xrayClass}</span>
                        </div>
                        <div className="h-[100px]">
                          <DataCharts data={xrayFlux} dataKey="flux" color="#00a3ad" unit="W/m²" />
                        </div>
                      </CyberCard>
                    </motion.div>

                    <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                      <CyberCard title="Güneş Rüzgarı" sensorId="DSCOVR" status={windSpeed ? 'AKTİF' : 'BEKLENİYOR'} color="yellow" icon={Wind}>
                        <div className="grid grid-cols-2 gap-3 py-2">
                          <div className="flex flex-col items-center p-3 bg-black/40 border border-white/5">
                            <span className="text-[8px] tech-header text-slate-500 mb-1">HIZ</span>
                            <span className="text-2xl font-black neon-text-yellow tabular-nums">{fmt(windSpeed, 0)}</span>
                            <span className="text-[8px] text-slate-500">km/s</span>
                          </div>
                          <div className="flex flex-col items-center p-3 bg-black/40 border border-white/5">
                            <span className="text-[8px] tech-header text-slate-500 mb-1">YOĞUNLUK</span>
                            <span className="text-2xl font-black text-white tabular-nums">{fmt(windDensity)}</span>
                            <span className="text-[8px] text-slate-500">p/cm³</span>
                          </div>
                        </div>
                        {windTemp && (
                          <div className="flex items-center justify-between mt-2 px-3 py-2 bg-black/30 border border-white/5">
                            <div className="flex items-center gap-2">
                              <Thermometer size={12} className="text-slate-500" />
                              <span className="text-[9px] tech-header text-slate-400">SICAKLIK</span>
                            </div>
                            <span className="text-[11px] font-black text-slate-200 tabular-nums">{(windTemp / 1000).toFixed(0)}K</span>
                          </div>
                        )}
                      </CyberCard>
                    </motion.div>

                    <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                      <CyberCard title="Manyetik Alan" sensorId="ACE-MAG" status={latestMag ? 'ÇEVRİMİÇİ' : 'BEKLENİYOR'} color="magenta" icon={BarChart3}>
                        <div className="grid grid-cols-2 gap-3 mb-2">
                          <div className="flex flex-col items-center p-2 bg-black/40 border border-white/5">
                            <span className="text-[8px] tech-header text-slate-500">Bt</span>
                            <span className="text-xl font-black text-white tabular-nums">{fmt(magBt)}</span>
                            <span className="text-[8px] text-slate-500">nT</span>
                          </div>
                          <div className="flex flex-col items-center p-2 bg-black/40 border border-white/5">
                            <span className="text-[8px] tech-header text-slate-500">Bz</span>
                            <span className={`text-xl font-black tabular-nums ${magBz != null && magBz < 0 ? 'neon-text-magenta' : 'neon-text-cyan'}`}>{fmt(magBz)}</span>
                            <span className="text-[8px] text-slate-500">nT</span>
                          </div>
                        </div>
                        <div className="h-[80px]">
                          <DataCharts data={solarMag} dataKeys={['bt', 'bz_gsm']} color="#b8103c" unit="nT" />
                        </div>
                      </CyberCard>
                    </motion.div>
                  </div>

                  {/* ORTA SÜTUN: GÜNEŞ */}
                  <div className="col-span-12 lg:col-span-6 relative flex flex-col items-center justify-center pointer-events-none">
                    <div className="w-[120%] lg:w-[150%] h-[70vh] min-h-[450px] mix-blend-screen pointer-events-auto relative z-20">
                      <WebGLErrorBoundary>
                        <React.Suspense fallback={null}>
                          <Sun3D riskScore={riskScore} xray={xrayClass} windSpeed={fmt(windSpeed, 0)} />
                        </React.Suspense>
                      </WebGLErrorBoundary>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] border-[0.5px] border-neon-cyan/10 rounded-full z-0" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border-[0.5px] border-neon-cyan/5 rounded-full z-0 border-dashed" />
                    <div className="flex flex-col items-center gap-2 mt-4 z-30">
                      <p className="text-[10px] tech-header text-neon-cyan tracking-[10px]">GÜNEŞ_HOLOGRAM // L1</p>
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-[1px] bg-neon-cyan/20" />
                        <div className="w-2 h-2 bg-neon-cyan shadow-[0_0_5px_rgba(0,163,173,0.5)]" />
                        <div className="w-12 h-[1px] bg-neon-cyan/20" />
                      </div>
                    </div>
                  </div>

                  {/* SAĞ SÜTUN */}
                  <div className="col-span-12 lg:col-span-3 flex flex-col gap-5 z-30">
                    <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                      <CyberCard title="YZ Teşhis" sensorId="SİNİR-AĞI" status="HESAPLAMA" color="yellow" icon={Cpu}>
                        <div className="min-h-[140px] py-1">
                          <RiskAnalysis score={riskScore} cmeEvents={cmeEvents} aiAnalysis={aiAnalysis} />
                        </div>
                      </CyberCard>
                    </motion.div>

                    <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                      <CyberCard title="Coğrafi Etki" sensorId="DÜNYA-TARAMA" status="CANLI" color="cyan" icon={Globe}>
                        <div className="space-y-3 pt-2">
                          {getRegionImpacts().map((reg, i) => (
                            <div key={i} className="flex justify-between items-center bg-black/40 p-3 border border-white/5 group hover:border-neon-cyan/40 transition-colors">
                              <div className="flex flex-col gap-1">
                                <span className="text-[10px] tech-header text-slate-300 uppercase">{reg.label}</span>
                                <span className="text-[8px] mono-info text-slate-500">Kp: {kpValue != null ? fmt(kpValue) : '--'}</span>
                              </div>
                              <span className={`text-[11px] font-black tech-header uppercase ${reg.color === 'magenta' ? 'neon-text-magenta' : (reg.color === 'yellow' ? 'neon-text-yellow' : 'neon-text-cyan')}`}>
                                {reg.risk}
                              </span>
                            </div>
                          ))}
                        </div>
                      </CyberCard>
                    </motion.div>

                  </div>

                </motion.div>
              </div>
              <ScrollHint label="DÜNYA_KALKANI" color="cyan" onClick={() => scrollToSection(1)} />
            </section>

            {/* ═══════════════ BÖLÜM 1: DÜNYA KALKANI ═══════════════ */}
            <section className="snap-section pt-10">
              <div className="section-content">

                <div className="flex items-center justify-between border-b border-neon-cyan/20 pb-4 mb-2">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-4 bg-neon-cyan" />
                    <h2 className="text-3xl font-black neon-text-cyan uppercase tracking-widest leading-none">Dünya Manyetosferi</h2>
                  </div>
                  <div className="flex gap-10">
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] tech-header text-slate-500">KALKAN_BÜTÜNLÜĞÜ</span>
                      <span className={`text-[11px] font-bold ${shieldIntegrity > 90 ? 'neon-text-cyan' : (shieldIntegrity > 75 ? 'neon-text-yellow' : 'neon-text-magenta')}`}>%{shieldIntegrity.toFixed(1)}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] tech-header text-slate-500">RİSK_SEVİYESİ</span>
                      <span className={`text-[11px] font-bold ${riskScore >= 50 ? 'neon-text-magenta' : (riskScore >= 25 ? 'neon-text-yellow' : 'text-slate-300')}`}>{riskLevelTr}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-8 items-start">
                  {/* Sol Sütun */}
                  <div className="col-span-12 lg:col-span-3 flex flex-col gap-5">
                    <CyberCard title="Manyetopoz" sensorId="DÜNYA-L1" status={dynamicPressure ? 'AKTİF' : 'BEKLENİYOR'} color="cyan" icon={Shield}>
                      <div className="space-y-6 py-3">
                        <div className="flex justify-between items-end">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] tech-header text-slate-400">Sınır Mesafesi</span>
                            <span className="text-[8px] mono-info text-slate-600">Shue modeli</span>
                          </div>
                          <span className="text-2xl font-black neon-text-cyan tabular-nums tracking-tighter">{magnetopauseDistance.toFixed(1)} <span className="text-[10px] text-slate-500">Re</span></span>
                        </div>

                        <div className="w-full h-[4px] bg-black border border-neon-cyan/20 overflow-hidden relative">
                          <div className="absolute top-0 left-0 h-full bg-neon-cyan shadow-[0_0_10px_#00f3ff]" style={{ width: `${Math.min(100, (magnetopauseDistance / 15) * 100)}%` }} />
                        </div>

                        <div className="flex justify-between items-end">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] tech-header text-slate-400">Dinamik Basınç</span>
                            <span className="text-[8px] mono-info text-slate-600">Hız: {windSpeed ? fmt(windSpeed, 0) : '--'} km/s</span>
                          </div>
                          <span className="text-2xl font-black text-white tabular-nums tracking-tighter">{dynamicPressure || '--'} <span className="text-[10px] text-slate-500">nPa</span></span>
                        </div>
                      </div>
                    </CyberCard>

                    <CyberCard title="Güneş Rüzgarı" sensorId="DSCOVR" status="CANLI" color="yellow" icon={Wind}>
                      <div className="h-[130px] pt-2">
                        <DataCharts data={safeSolarWind} dataKeys={['speed', 'density']} color="#c49b00" unit="" />
                      </div>
                    </CyberCard>
                  </div>

                  {/* Orta Sütun: Dünya */}
                  <div className="col-span-12 lg:col-span-6 h-[65vh] min-h-[550px] relative flex flex-col items-center justify-center">
                    <div className="w-[120%] lg:w-[150%] h-[70vh] min-h-[450px] mix-blend-screen pointer-events-auto relative z-20 flex justify-center items-center">
                      <WebGLErrorBoundary>
                        <React.Suspense fallback={null}>
                          <Earth3D riskScore={riskScore} bz={magBz} bt={magBt} />
                        </React.Suspense>
                      </WebGLErrorBoundary>
                    </div>
                    <div className="absolute bottom-10 right-10 flex flex-col items-end gap-2 px-4 py-2 border-r border-neon-cyan bg-black/40">
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] tech-header text-slate-400">Bz:</span>
                        <span className={`text-[10px] font-black tabular-nums tracking-wider ${magBz != null && magBz < 0 ? 'neon-text-magenta' : 'neon-text-cyan'}`}>{magBz != null ? fmt(magBz) : '--'} nT</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] tech-header text-slate-400">Bt:</span>
                        <span className="text-[10px] font-black neon-text-cyan tabular-nums tracking-wider">{magBt != null ? fmt(magBt) : '--'} nT</span>
                      </div>
                    </div>
                  </div>

                  {/* Sağ Sütun */}
                  <div className="col-span-12 lg:col-span-3 flex flex-col gap-5">
                    <CyberCard title="Jeomanyetik Trend" sensorId="KÜRESEL_MAG" status="CANLI" color="magenta" icon={Activity}>
                      <div className="py-4 text-center border-b border-white/5 bg-black/30 mb-4">
                        <p className="text-[10px] tech-header text-slate-400 mb-2">KP_İNDEKS</p>
                        <p className={`text-5xl font-black tabular-nums tracking-tighter ${kpValue != null && kpValue >= 5 ? 'neon-text-magenta' : 'neon-text-cyan'}`}>{kpValue != null ? fmt(kpValue) : '--'}</p>
                      </div>
                      <div className="h-[130px]">
                        <DataCharts data={safeKpIndex} dataKey="kp_index" color="#b8103c" unit="Kp" />
                      </div>
                    </CyberCard>

                    <CyberCard title="Manyetik Alan" sensorId="ACE-MAG" status="CANLI" color="cyan" icon={BarChart3}>
                      <div className="h-[130px] pt-2">
                        <DataCharts data={safeSolarMag} dataKeys={['bz_gsm', 'bt']} color="#00a3ad" unit="nT" />
                      </div>
                    </CyberCard>
                  </div>
                </div>
              </div>
              <ScrollHint label="VERİ_ARŞİVİ" color="magenta" onClick={() => scrollToSection(2)} />
            </section>

            {/* ═══════════════ BÖLÜM 2: VERİ ARŞİVİ ═══════════════ */}
            <section className="snap-section pt-10">
               <div className="section-content">
                  
                  <div className="flex justify-between items-end mb-8 border-b border-neon-magenta/20 pb-4">
                     <div className="flex items-center gap-4">
                        <div className="w-4 h-4 bg-neon-magenta" />
                        <h2 className="text-4xl font-black neon-text-magenta uppercase tracking-widest leading-none">Veri Arşivi</h2>
                     </div>
                     <div className="flex gap-8">
                        <div className="flex flex-col items-end">
                           <span className="text-[9px] tech-header text-slate-500">OLAY_SAYISI</span>
                           <span className="text-[11px] font-black text-slate-200">{safeCmeEvents.length} KKA</span>
                        </div>
                        <div className="flex flex-col items-end">
                           <span className="text-[9px] tech-header text-slate-500">RİSK_PUANI</span>
                           <span className={`text-[11px] font-black ${riskScore >= 50 ? 'neon-text-magenta' : 'neon-text-yellow'}`}>{riskScore}/100</span>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-12 gap-10 flex-1 min-h-[500px]">
                     {/* Sol: Olay Listesi */}
                     <div className="col-span-12 lg:col-span-5 flex flex-col h-full overflow-hidden bg-black/40 border border-white/5 p-4 rounded-xl">
                        <div className="text-[10px] tech-header text-slate-400 mb-4 border-b border-white/10 pb-2">KRONOLOJİK OLAY KAYDI</div>
                        <div className="flex-1 overflow-y-auto space-y-3 no-scrollbar pr-2">
                           {safeCmeEvents.length === 0 && (
                             <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-4">
                               <Activity size={40} />
                               <p className="text-xs">KKA olayı tespit edilmedi</p>
                             </div>
                           )}
                           {safeCmeEvents.slice(0, 20).map((evt, i) => {
                              const isSelected = selectedEventIndex === i;
                              const hasEarthImpact = evt.cmeAnalyses?.some(a => a.isMostAccurate);
                              const riskColor = hasEarthImpact ? 'magenta' : (i % 3 === 0 ? 'yellow' : 'cyan');
                              
                              return (
                                 <div key={i} onClick={() => setSelectedEventIndex(i)}
                                    className={`flex items-center p-4 cursor-pointer transition-all border-l-4 ${isSelected ? `bg-white/5 border-neon-${riskColor}` : 'bg-transparent border-transparent hover:bg-white/[0.02]'}`}>
                                    <div className="flex-1 flex flex-col gap-1">
                                       <div className="flex items-center gap-3">
                                          <span className="text-[10px] font-bold text-slate-200">{evt.activityID}</span>
                                          <div className={`px-2 py-[2px] text-[7px] font-black uppercase ${riskColor === 'magenta' ? 'bg-[#ff003c]/20 text-[#ff003c]' : (riskColor === 'yellow' ? 'bg-[#fcee0a]/20 text-[#fcee0a]' : 'bg-[#00f3ff]/20 text-[#00f3ff]')}`}>
                                            {riskColor === 'magenta' ? 'KRİTİK' : (riskColor === 'yellow' ? 'YÜKSEK' : 'ARTMIŞ')}
                                          </div>
                                       </div>
                                       <span className="text-[9px] mono-info text-slate-500">{evt.startTime?.replace('T', ' // ').replace('Z', '')}</span>
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     </div>

                     {/* Sağ: Derin İnceleme */}
                     <div className="col-span-12 lg:col-span-7 flex flex-col h-full">
                        <CyberCard title="Derin İnceleme" sensorId="SİNİR-AĞI" status={isImageLoading ? "YÜKLENİYOR" : "ANALİZ"} color="sky">
                           <div className="flex flex-col flex-1 h-full min-h-[350px]">
                              
                              <div className="flex gap-6 mt-4">
                                 <div className="flex-1 border-l-4 border-neon-cyan pl-6 mb-6">
                                   <p className={labelClass}>BİRİNCİL_VEKTÖR</p>
                                   <p className="text-3xl font-black text-white hover:neon-text-cyan transition-all uppercase leading-none">
                                      {safeCmeEvents[selectedEventIndex]?.activityID || 'VERİ BEKLENİYOR'}
                                   </p>
                                 </div>
                                 {selectedEventImage && (
                                    <div className="w-24 h-24 rounded border border-white/10 overflow-hidden relative group">
                                       <img src={selectedEventImage} alt="Event Snapshot" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                                       {isImageLoading && <div className="absolute inset-0 bg-black/60 flex items-center justify-center"><Activity size={16} className="animate-spin text-neon-cyan" /></div>}
                                       <div className="absolute bottom-0 right-0 bg-black/80 px-1 text-[6px] font-black text-white uppercase tracking-tighter">Snap_T+{selectedEventIndex}</div>
                                    </div>
                                 )}
                              </div>

                              <div className="grid grid-cols-2 gap-4 mb-4">
                                 <div className="bg-black/50 p-4 border border-white/5">
                                    <p className={labelClass}>BAŞLANGIÇ_ZAMANI</p>
                                    <p className="text-sm font-black text-white tabular-nums">
                                      {safeCmeEvents[selectedEventIndex]?.startTime?.replace('T', ' ').replace('Z', '') || '--'}
                                    </p>
                                 </div>
                                 <div className="bg-black/50 p-4 border border-white/5">
                                    <p className={labelClass}>KAYNAK_KONUMU</p>
                                    <p className="text-sm font-black text-neon-cyan">
                                      {safeCmeEvents[selectedEventIndex]?.sourceLocation || 'Bilinmiyor'}
                                    </p>
                                 </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4 mb-6">
                                 <div className="bg-slate-900/40 p-4 border border-white/5">
                                    <p className={labelClass}>ANLIK_HIZ</p>
                                    <p className="text-xl font-black text-white tabular-nums">
                                      {safeCmeEvents[selectedEventIndex]?.cmeAnalyses?.[0]?.speed || '---'} <span className="text-[10px] text-slate-500">km/s</span>
                                    </p>
                                 </div>
                                 <div className="bg-slate-900/40 p-4 border border-white/5">
                                    <p className={labelClass}>AÇISAL_GENİŞLİK</p>
                                    <p className="text-xl font-black text-white tabular-nums">
                                      {safeCmeEvents[selectedEventIndex]?.cmeAnalyses?.[0]?.halfAngle || '---'}°
                                    </p>
                                 </div>
                              </div>

                              <div className="mt-auto bg-white/[0.03] p-5 border-l-2 border-slate-500/50">
                                 <p className="text-[11px] font-black text-slate-200 mb-2 tracking-widest uppercase">YZ_Sentinel_Raporu</p>
                                 <p className="text-xs font-bold text-slate-400 leading-relaxed font-sans italic opacity-80">
                                    {safeCmeEvents[selectedEventIndex]?.note || riskData?.description || 'Olay verileri analiz ediliyor. Jeomanyetik etki beklentisi normal seyrinde.'}
                                 </p>
                              </div>
                           </div>
                        </CyberCard>
                     </div>
                  </div>
               </div>
               <ScrollHint label="YÖRÜNGE_GÖZLEMCİ" color="cyan" onClick={() => scrollToSection(3)} />
            </section>

            {/* ═══════════════ BÖLÜM 3: GEOSPACE OBSERVER ═══════════════ */}
            <section id="geospace" className="snap-start min-h-screen relative flex items-center justify-center p-4 md:p-8 overflow-hidden bg-black/80">
                <div className="w-full max-w-[1700px] h-[86vh] relative z-20">
                   <GeospaceObserver satellites={satelliteData} />
                </div>
                
                {/* ARKA PLAN DEKORATİF ÖĞELER */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
                   <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
                   <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
                </div>
            </section>
          </main>

          <NotificationPanel isOpen={showNotifications} onClose={() => setShowNotifications(false)} cmeEvents={safeCmeEvents} riskScore={riskScore} lastUpdate={lastUpdate} />
          <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} onRefreshData={updateData} />
          <EmergencyAlert />
        </>
      )}
    </div>
  );
}

const NavOption = ({ label, icon: Icon, active, onClick }) => (
  <div onClick={onClick} className={`flex items-center gap-3 cursor-pointer group transition-colors ${active ? 'text-white' : 'text-slate-600 hover:text-neon-cyan'}`}>
    <Icon size={16} className={active ? 'neon-text-cyan' : ''} />
    <span className={`text-[11px] font-bold tracking-[2px] ${active ? 'neon-text-cyan' : ''}`}>{label}</span>
  </div>
);

const ScrollHint = ({ label, color, onClick }) => (
  <motion.div onClick={onClick} animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }} className="mt-4 flex flex-col items-center gap-2 opacity-50 cursor-pointer pb-4">
    <div className={`text-[10px] font-bold tracking-[6px] ${color === 'magenta' ? 'neon-text-magenta' : 'neon-text-cyan'}`}>{label}</div>
    <ChevronDown size={24} className={color === 'magenta' ? 'neon-text-magenta' : 'neon-text-cyan'} />
  </motion.div>
);

const IconButton = ({ icon: Icon, badge, onClick }) => (
  <button onClick={onClick} className="relative p-2 text-slate-400 hover:text-neon-cyan transition-colors">
    <Icon size={22} />
    {badge > 0 && (
      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-neon-magenta flex items-center justify-center text-[9px] font-black text-white">
        {badge}
      </span>
    )}
  </button>
);

export default App;
