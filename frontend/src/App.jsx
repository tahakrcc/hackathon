import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { 
  Zap, 
  Bell, 
  Settings, 
  ChevronDown,
  Globe,
  Database,
  Shield,
  Activity,
  Target
} from 'lucide-react';
import { useSolarStore } from './store/solarStore';
import Sun3D from './components/Sun3D';
import Earth3D from './components/Earth3D';
import DataCharts from './components/DataCharts';
import RiskAnalysis from './components/RiskAnalysis';
import StarfieldBackground from './components/StarfieldBackground';
import BootSequence from './components/BootSequence';
import CommandWidget from './components/CommandWidget';

function App() {
  const { 
    updateData, 
    xrayFlux, 
    solarWind, 
    solarMag,
    kpIndex, 
    cmeEvents, 
    riskScore, 
    aiAnalysis,
    loading: dataLoading, 
    lastUpdate 
  } = useSolarStore();

  const [activeSection, setActiveSection] = useState(0);
  const [isBooting, setIsBooting] = useState(true);
  const [selectedEventIndex, setSelectedEventIndex] = useState(0);
  const containerRef = useRef(null);

  const { scrollYProgress: rawScrollProgress } = useScroll({ container: containerRef });
  
  // Ultra-Smooth Physics config for Elite V4.2
  const scrollYProgress = useSpring(rawScrollProgress, {
    stiffness: 60,
    damping: 35,
    restDelta: 0.0001
  });

  // V4.0 Cinematic Parallax
  const sunScale = useTransform(scrollYProgress, [0, 0.2, 0.5, 0.8, 1], [1.7, 0.8, 0.5, 0.35, 0.3]);
  const sunX = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], ["0%", "30%", "-25%", "20%", "0%"]);
  const sunY = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75, 1], ["5%", "0%", "-5%", "10%", "35%"]);
  const sunOpacity = useTransform(scrollYProgress, [0, 0.4, 0.7, 1], [1, 0.9, 0.5, 0.25]);

  useEffect(() => {
    updateData();
    const interval = setInterval(updateData, 60000);
    return () => clearInterval(interval);
  }, [updateData]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const h = containerRef.current.offsetHeight;
    const s = Math.round(containerRef.current.scrollTop / h);
    if (s !== activeSection) setActiveSection(s);
  };

  const getRegionImpacts = () => {
    const latestKp = kpIndex.length > 0 ? parseFloat(kpIndex[kpIndex.length - 1].kp_index) : 0;
    if (latestKp >= 7) return [{ label: 'Kuzey Kutup', risk: 'Şiddetli', color: 'text-red-400' }, { label: 'Yüksek Enlem', risk: 'Yoğun', color: 'text-orange-400' }];
    if (latestKp >= 5) return [{ label: 'Kuzey Kutup', risk: 'Aktif', color: 'text-orange-400' }, { label: 'Yüksek Enlem', risk: 'Hareketli', color: 'text-yellow-400' }];
    return [{ label: 'Kuzey Kutup', risk: 'Normal', color: 'text-green-400' }, { label: 'Yüksek Enlem', risk: 'Sakin', color: 'text-slate-500' }];
  };

  return (
    <div className="h-screen bg-[#05070a] text-slate-200 font-sans selection:bg-orange-500/30 overflow-hidden relative">
      
      {/* Background VFX */}
      <div id="hud-vignette" />
      <div id="hud-scanlines" />
      <StarfieldBackground />

      <AnimatePresence mode="wait">
        {isBooting && <BootSequence key="boot" onComplete={() => setIsBooting(false)} />}
      </AnimatePresence>

      {!isBooting && (
        <>
          {/* PERSISTENT 3D SUN LAYER */}
          <motion.div 
            style={{ scale: sunScale, x: sunX, y: sunY, opacity: sunOpacity }}
            className="background-canvas"
          >
            <Sun3D riskScore={riskScore} />
          </motion.div>

          {/* V4.0 ELITE NAVIGATION */}
          <nav className="fixed top-0 left-0 w-full glass-header z-[2000] px-10 h-20 flex flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-4">
              <div className="bg-orange-500/10 p-2 border border-orange-500/30 glow-orange">
                <Zap size={20} className="text-orange-500" />
              </div>
              <div>
                <h1 className="text-base tech-header text-white glow-text tracking-widest pl-2">SOLAR SENTINEL</h1>
                <p className="text-[8px] mono-info text-slate-500 uppercase pl-2">Elite Command Hub V4.0</p>
              </div>
            </div>

            <div className="hidden lg:flex flex-row gap-12">
              <NavOption label="MISSION_CORE" icon={Activity} active={activeSection === 0} />
              <NavOption label="HELYO_DATA" icon={Database} active={activeSection === 1} />
              <NavOption label="TERRA_SHIELD" icon={Globe} active={activeSection === 2} />
              <NavOption label="EVENT_LOGS" icon={Shield} active={activeSection === 3} />
            </div>

            <div className="flex flex-row items-center gap-6">
               <div className="hidden md:flex flex-col items-end border-r border-white/5 pr-6">
                 <span className="text-[10px] tech-header text-green-500 animate-pulse">L1_LINK: ACTIVE</span>
                 <span className="text-[7px] mono-info text-slate-600">SYNC: {lastUpdate ? lastUpdate.toLocaleTimeString() : '---'}</span>
               </div>
               <IconButton icon={Bell} badge={cmeEvents.length} />
               <IconButton icon={Settings} />
            </div>
          </nav>

          {/* HUD SIDEBAR INDICATOR */}
          <div className="fixed left-6 top-1/2 -translate-y-1/2 flex flex-col gap-8 z-[2000]">
             {[0, 1, 2, 3].map(i => (
               <div key={i} className={`w-1 h-3 rounded-full transition-all duration-700 ${activeSection === i ? 'bg-orange-500 h-10 glow-orange' : 'bg-slate-800'}`} />
             ))}
          </div>

          <main ref={containerRef} onScroll={handleScroll} className="snap-container relative z-10 w-full h-full no-scrollbar">
            
            {/* SECTION 0: MISSION CORE (Majestic Hero) */}
            <section className="snap-section flex flex-col items-center justify-center">
               <div className="hud-scanner" />
               <div className="section-content flex flex-col items-center justify-center pt-20">
                  <motion.div 
                    initial={{ opacity: 0, y: 40 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  >
                    <p className="text-[10px] tech-header text-orange-500 mb-4 tracking-[12px] animate-pulse uppercase">Mission Status: Nominal</p>
                    <h2 className="text-8xl lg:text-9xl tech-header text-white glow-text tracking-[40px] opacity-90 pl-[40px] mb-12">CORE</h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full max-w-6xl mx-auto">
                      <CommandWidget title="SURFACE_TEMP" sensorId="CORE_PROBE_01" status="NOMINAL">
                        <div className="py-6 text-center group">
                          <p className="text-5xl font-black text-white glow-text group-hover:text-orange-500 transition-colors">15.7M K</p>
                          <p className="text-[8px] tech-header text-slate-600 mt-2">THERMAL_EQUILIBRIUM_ACTIVE</p>
                        </div>
                      </CommandWidget>

                      <CommandWidget title="SOLAR_WIND_VEL" sensorId="DSCOVR_L1_STREAM" status="LIVE">
                        <div className="py-6 text-center group">
                          <p className="text-5xl font-black text-white glow-text group-hover:text-blue-400 transition-colors">{solarWind[0]?.speed || '---'} km/s</p>
                          <p className="text-[8px] tech-header text-slate-600 mt-2">PARTICLE_FLUX_STABLE</p>
                        </div>
                      </CommandWidget>

                      <CommandWidget title="THREAT_VEC_ANALYSIS" sensorId="SENTINEL_AI_V4" status={riskScore > 50 ? 'CRITICAL' : 'STABLE'}>
                        <div className="py-6 text-center group">
                          <p className={`text-5xl font-black glow-text group-hover:scale-110 transition-transform ${riskScore > 50 ? 'text-orange-500' : 'text-blue-400'}`}>
                            {riskScore > 50 ? 'HIGH' : 'LOW'}
                          </p>
                          <p className="text-[8px] tech-header text-slate-600 mt-2">SENTINEL_AI_CONFIDENCE: 98.4%</p>
                        </div>
                      </CommandWidget>
                    </div>

                    <ScrollHint label="ANALYZE_HELYOSPHERE" />
                  </motion.div>
               </div>
            </section>

            {/* SECTION 1: HELYO-DATA (3-Column Command Hub) - Balanced V4.2 */}
            <section className="snap-section flex items-center justify-center h-full">
               <div className="section-content flex flex-col justify-center gap-4 lg:gap-12">
                 <div className="grid grid-cols-12 gap-6 lg:gap-10 items-stretch h-full py-4">
                  {/* Left Column: Charts */}
                  <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                     <motion.div initial={{ scale: 0.95, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, duration: 1 }}>
                        <CommandWidget title="X-Ray Radiance Flux" sensorId="GOES_R_16" status="LIVE">
                           <div className="h-[160px] lg:h-[220px]">
                            <DataCharts title="" data={xrayFlux} dataKey="flux" color="#fbbf24" unit="W/m²" />
                           </div>
                        </CommandWidget>
                     </motion.div>
                     <motion.div initial={{ scale: 0.95, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ delay: 0.4, duration: 1 }}>
                        <CommandWidget title="Magnetic Field Intensity" sensorId="DSCOVR_L1" status="SYNCED">
                           <div className="h-[160px] lg:h-[220px]">
                            <DataCharts title="" data={solarMag} dataKey="bt" color="#a855f7" unit="nT" />
                           </div>
                        </CommandWidget>
                     </motion.div>
                  </div>

                  {/* Middle Column: Data Stream VFX */}
                  <div className="hidden lg:flex col-span-4 flex-col items-center justify-center h-full min-h-[400px]">
                     <div className="h-full w-[1px] bg-gradient-to-b from-transparent via-orange-500/20 to-transparent relative">
                        <motion.div animate={{ top: ["0%", "100%"] }} transition={{ repeat: Infinity, duration: 5, ease: "linear" }} className="absolute w-1 h-32 bg-orange-500 glow-orange -left-[1.5px]" />
                     </div>
                     <div className="text-[10px] tech-header text-orange-500/30 vertical-text py-10 tracking-[15px] animate-pulse">L1_DATA_BUFFER</div>
                     <div className="w-full flex flex-col gap-1 px-12 opacity-5">
                        {[1, 2, 3, 4, 5].map(i => (
                          <div key={i} className="text-[7px] mono-info truncate leading-none">0x{Math.random().toString(16).substr(2, 32).toUpperCase()}</div>
                        ))}
                     </div>
                  </div>

                  {/* Right Column: AI Analysis */}
                  <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
                     <motion.div initial={{ scale: 0.95, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3, duration: 1 }} className="flex-1">
                        <CommandWidget title="Sentinel-AI Risk Evaluation" sensorId="SENTINEL_V4_AI" status="ANALYZING">
                           <div className="min-h-[220px] lg:min-h-[280px]">
                              <RiskAnalysis score={riskScore} cmeEvents={cmeEvents} aiAnalysis={aiAnalysis} />
                           </div>
                        </CommandWidget>
                     </motion.div>
                     <div className="flex-1">
                        <CommandWidget title="Geographic Response Analysis" sensorId="TK_IMPACT_A" status="READY">
                           <p className="text-[10px] tech-header text-slate-600 mb-6 flex justify-between items-center group uppercase tracking-widest">
                              <span>Regional Impact Matrix</span>
                              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                           </p>
                           <div className="space-y-4">
                              {getRegionImpacts().map((reg, i) => (
                                <div key={i} className="flex justify-between items-center bg-white/[0.02] p-3 border border-white/5 group hover:bg-white/[0.05] transition-colors">
                                   <span className="text-[10px] tech-header text-slate-500 group-hover:text-slate-300">{reg.label}</span>
                                   <span className={`text-[10px] tech-header ${reg.color} glow-text`}>{reg.risk}</span>
                                </div>
                              ))}
                           </div>
                        </CommandWidget>
                     </div>
                  </div>
                 </div>
               </div>
            </section>

            {/* SECTION 2: TERRA-SHIELD (Shield Situation Room) - Symmetrical V4.5 */}
            <section className="snap-section flex items-center justify-center h-full">
               <div className="section-content flex flex-col justify-center gap-12">
                 
                 {/* Sector Header Strip */}
                 <div className="flex items-center justify-between border-b border-blue-500/20 pb-4 mb-4">
                    <div className="flex items-center gap-4">
                       <Globe size={20} className="text-blue-500 animate-pulse" />
                       <h2 className="text-2xl tech-header text-white tracking-[8px]">TERRA-SHIELD_02</h2>
                    </div>
                    <div className="text-[8px] tech-header text-blue-500/60 tracking-[4px]">
                       MAGNETOSPHERE_ARRAY // PHASE: ACTIVE
                    </div>
                 </div>

                 <div className="grid grid-cols-12 gap-8 items-center h-full">
                  {/* Left Column: Shield Metrics */}
                  <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
                     <CommandWidget title="Magnetopause Status" sensorId="DSCOVR_EPIC_02" status="STABLE">
                        <div className="space-y-6 py-4">
                           <div className="flex justify-between items-end">
                              <span className="text-[9px] tech-header text-slate-600">DIST_TO_SUN</span>
                              <span className="text-lg tech-header text-blue-400">10.4 Re</span>
                           </div>
                           <div className="w-full h-1 bg-slate-900 overflow-hidden relative">
                              <motion.div animate={{ width: ["70%", "85%", "70%"] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute h-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                           </div>
                           <div className="flex justify-between items-end">
                              <span className="text-[9px] tech-header text-slate-600">BOW_SHOCK_P</span>
                              <span className="text-lg tech-header text-blue-400">2.1 nPa</span>
                           </div>
                           <div className="p-3 bg-blue-500/5 border border-blue-500/10">
                              <p className="text-[7px] tech-header text-blue-500/60 mb-1 tracking-widest">DEFENSE_STRAT</p>
                              <p className="text-[9px] font-bold text-slate-300">POLAR_CAP_CLOSED</p>
                           </div>
                        </div>
                     </CommandWidget>
                  </div>

                  {/* Center Column: Earth Hub */}
                  <div className="col-span-12 lg:col-span-6 h-[60vh] min-h-[500px] relative flex items-center justify-center group overflow-visible">
                     <div className="absolute inset-0 pointer-events-none z-0 overflow-visible">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] border border-blue-500/5 rounded-full" />
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 25, ease: "linear" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[115%] h-[115%] border-t border-blue-500/10 rounded-full" />
                     </div>
                     <div className="w-full h-full relative z-10 overflow-visible flex items-center justify-center">
                       <Earth3D riskScore={riskScore} />
                     </div>
                     
                     {/* Floating Coordinate Labels */}
                     <div className="absolute top-0 left-0 opacity-20 group-hover:opacity-60 transition-opacity">
                        <p className="text-[8px] tech-header text-slate-500 tracking-[5px]">LAT: 0.0000</p>
                        <p className="text-[8px] tech-header text-slate-500 tracking-[5px]">LNG: 0.0000</p>
                     </div>
                  </div>

                  {/* Right Column: K-Index Evolution */}
                  <div className="col-span-12 lg:col-span-3 flex flex-col gap-6">
                     <CommandWidget title="Geomagnetic K-Index" sensorId="NOAA_KP_STREAM" status="LIVE">
                        <div className="p-4 bg-black/60 border border-white/5 text-center mb-6 relative group overflow-hidden">
                           <p className="text-[8px] tech-header text-slate-600 mb-2 tracking-[5px]">CURRENT_KP</p>
                           <p className="text-6xl tech-header text-orange-500 glow-text">{kpIndex.length > 0 ? kpIndex[kpIndex.length-1].kp_index : '--'}</p>
                        </div>
                        <div className="h-[140px]">
                          <DataCharts title="" data={kpIndex} dataKey="kp_index" color="#f97316" unit="Kp" />
                        </div>
                     </CommandWidget>
                  </div>
                 </div>
               </div>
            </section>

            {/* SECTION 3: MISSION ARCHIVE (Timeline & Inspector) - Cinematic V4.6 */}
            <section className="snap-section flex flex-col h-full pt-20 pb-8">
               <div className="section-content flex flex-col h-full">
                  
                  {/* Archive Header */}
                  <div className="flex justify-between items-end mb-10 border-b border-orange-500/20 pb-6">
                     <div>
                        <div className="flex items-center gap-4 mb-2">
                           <Shield size={20} className="text-orange-500 animate-pulse" />
                           <h2 className="text-4xl tech-header text-white glow-text uppercase tracking-tighter">Mission <span className="text-slate-600">Archive</span></h2>
                        </div>
                        <p className="text-[9px] mono-info text-orange-500/60 uppercase tracking-[8px]">Archive Access: LEVEL_01_SECURE // SYSTEM_STABLE</p>
                     </div>
                     <div className="hidden md:flex gap-12 text-right">
                        <div>
                           <p className="text-[7px] tech-header text-slate-700">DB_CAPACITY</p>
                           <p className="text-[10px] font-black text-slate-400">98.4 PB</p>
                        </div>
                        <div>
                           <p className="text-[7px] tech-header text-slate-700">LOG_RETENTION</p>
                           <p className="text-[10px] font-black text-slate-400">SYNCED_L1</p>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-12 gap-10 flex-1 min-h-0">
                     {/* Left Column: Vertical Chronology Feed */}
                     <div className="col-span-12 lg:col-span-5 flex flex-col h-full overflow-hidden">
                        <div className="text-[8px] tech-header text-slate-600 mb-4 px-4 border-l-2 border-orange-500/30">CHRONOLOGICAL_SEQUENCE_FEED</div>
                        <div className="flex-1 overflow-y-auto pr-4 space-y-4 no-scrollbar pb-8">
                           {cmeEvents.slice(0, 20).map((evt, i) => {
                              const severity = i % 5 === 0 ? 'SEVERE' : (i % 3 === 0 ? 'MODERATE' : 'NORMAL');
                              const gScale = i % 5 === 0 ? 'G3+' : (i % 3 === 0 ? 'G2' : 'G1');
                              return (
                                 <motion.div 
                                    key={i} 
                                    initial={{ opacity: 0, x: -20 }} 
                                    whileInView={{ opacity: 1, x: 0 }} 
                                    transition={{ delay: i * 0.03 }}
                                    onClick={() => setSelectedEventIndex(i)}
                                    className={`flex group cursor-pointer transition-all ${selectedEventIndex === i ? 'scale-[1.02]' : ''}`}
                                 >
                                    {/* Timeline Marker */}
                                    <div className="flex flex-col items-center mr-4 w-6">
                                       <div className={`w-2 h-2 ${selectedEventIndex === i ? 'bg-orange-500 shadow-[0_0_10px_#f97316]' : (i % 5 === 0 ? 'bg-orange-500 animate-ping' : 'bg-slate-800')} border border-white/20`} />
                                       <div className="flex-1 w-[1px] bg-slate-800/50 group-hover:bg-orange-500/30 transition-colors" />
                                    </div>
                                    
                                    {/* Log Minimal Card */}
                                    <div className={`flex-1 glass p-4 border transition-all flex justify-between items-center ${selectedEventIndex === i ? 'border-orange-500/40 bg-orange-500/[0.05]' : 'border-white/5 bg-black/40 group-hover:border-orange-500/20 group-hover:bg-orange-500/[0.02]'}`}>
                                       <div>
                                          <div className="flex items-center gap-3 mb-1">
                                             <span className={`text-[6px] tech-header ${selectedEventIndex === i ? 'text-orange-500' : 'text-slate-700'}`}>LOG_{i+1024}</span>
                                             {selectedEventIndex === i && <span className="text-[6px] tech-header text-orange-500 animate-pulse">[ ACTIVE_SELECTION ]</span>}
                                             {selectedEventIndex !== i && <span className={`text-[7px] font-black ${severity === 'SEVERE' ? 'text-orange-500' : 'text-slate-500'}`}>{severity}</span>}
                                          </div>
                                          <p className={`text-[10px] font-black truncate w-48 ${selectedEventIndex === i ? 'text-white' : 'text-slate-300'}`}>{evt.activityID}</p>
                                          <p className="text-[7px] mono-info text-slate-600 mt-1">{evt.startTime?.split('T')[0]} // {evt.startTime?.split('T')[1]?.replace('Z','')}</p>
                                       </div>
                                       <div className="text-right">
                                          <p className={`text-lg tech-header transition-colors ${selectedEventIndex === i ? 'text-orange-500' : 'text-slate-700 group-hover:text-orange-500/40'}`}>{gScale}</p>
                                          <p className="text-[6px] mono-info text-slate-800">CLASS</p>
                                       </div>
                                    </div>
                                 </motion.div>
                              );
                           })}
                        </div>
                     </div>

                     {/* Right Column: Event Deep-Inspector */}
                     <div className="col-span-12 lg:col-span-7 flex flex-col h-full min-h-[500px]">
                        <CommandWidget title="Deep-Archive Event Analyst" sensorId="ANALYSIS_BOT_L1" status="EXTRACTION_READY">
                           <div className="p-8 bg-black/40 border border-white/5 relative group overflow-hidden h-full flex flex-col min-h-[450px]">
                              {/* Inspector Visuals */}
                              <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-8">
                                 <div className="space-y-10 flex-1 w-full overflow-hidden">
                                    <div className="overflow-hidden">
                                       <p className="text-[8px] tech-header text-orange-500/60 mb-2 tracking-[3px]">PRIMARY_VECTOR_ID</p>
                                       <p className="text-xl lg:text-3xl font-black text-white tracking-widest break-all">{cmeEvents[selectedEventIndex]?.activityID || 'LOADING...'}</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-10">
                                       <div>
                                          <p className="text-[7px] tech-header text-slate-700 uppercase mb-2">Extraction Speed</p>
                                          <p className="text-xl tech-header text-slate-300">882.4 km/s</p>
                                          <div className="w-full h-[2px] bg-slate-900 mt-2 overflow-hidden">
                                             <motion.div initial={{ width: 0 }} whileInView={{ width: "84%" }} className="h-full bg-orange-500/40" />
                                          </div>
                                       </div>
                                       <div>
                                          <p className="text-[7px] tech-header text-slate-700 uppercase mb-2">Impact Confidence</p>
                                          <p className="text-xl tech-header text-slate-300">92.1%</p>
                                          <div className="w-full h-[2px] bg-slate-900 mt-2 overflow-hidden">
                                             <motion.div initial={{ width: 0 }} whileInView={{ width: "92%" }} className="h-full bg-blue-500/40" />
                                          </div>
                                       </div>
                                    </div>

                                    <div className="p-5 bg-orange-500/5 border border-orange-500/20">
                                       <p className="text-[7px] tech-header text-orange-500/60 mb-2">SYSTEM_RESPONSE_CODES</p>
                                       <div className="flex gap-4">
                                          <span className="text-[8px] font-black text-orange-500">SHIELD_LVL_INC</span>
                                          <span className="text-[8px] font-black text-slate-600">SAT_LINK_REDUNDANT</span>
                                          <span className="text-[8px] font-black text-slate-600">GRID_PROTECT_V3</span>
                                       </div>
                                    </div>
                                 </div>

                                 {/* Circular Radar Placeholder Visual */}
                                 <div className="w-40 h-40 border border-white/10 rounded-full flex items-center justify-center relative">
                                    <div className="w-32 h-32 border border-orange-500/20 rounded-full animate-pulse" />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/5 to-transparent rounded-full animate-spin-slow" />
                                    <Target size={24} className="text-orange-500/40" />
                                 </div>
                              </div>
                              
                              <div className="mt-auto border-t border-white/5 pt-6 opacity-30">
                                 <p className="text-[8px] tech-header text-slate-700 italic">"Log extraction completed at L1 satellite link. All event parameters verified by Sentinel-AI V4. Security clearance active for deep archive read."</p>
                              </div>
                           </div>
                        </CommandWidget>
                     </div>
                  </div>

                  <footer className="mt-8 pt-6 border-t border-white/5 flex flex-row items-center justify-between opacity-30 group">
                     <p className="text-[7px] tech-header text-slate-800 tracking-[8px] group-hover:text-slate-600 transition-colors">Mission Control Command // TK Terminal Hub</p>
                     <div className="flex gap-8">
                        <FooterStat label="Ver" value="Sentinel-4.2-P" />
                        <FooterStat label="V" value="4.6" />
                     </div>
                  </footer>
               </div>
            </section>
          </main>
        </>
      )}
    </div>
  );
}

// Sub-components
const NavOption = ({ label, icon: Icon, active }) => (
  <div className={`flex flex-col items-center gap-1 group cursor-pointer transition-all ${active ? 'text-white' : 'text-slate-600 hover:text-slate-400'}`}>
    <div className="flex flex-row items-center gap-2">
       {active && <Icon size={12} className="text-orange-500 animate-pulse" />}
       <span className="text-[9px] tech-header tracking-widest">{label}</span>
    </div>
    <motion.div 
      initial={false}
      animate={{ scaleX: active ? 1 : 0 }}
      className="h-[1px] w-full bg-orange-500 glow-orange" 
    />
  </div>
);

const ScrollHint = ({ label }) => (
  <motion.div 
    animate={{ y: [0, 10, 0] }}
    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
    className="mt-20 flex flex-col items-center gap-4 opacity-40 group cursor-pointer"
  >
    <div className="text-[9px] tech-header tracking-[6px] group-hover:text-orange-500 transition-colors uppercase">{label}</div>
    <ChevronDown size={28} className="text-white group-hover:text-orange-500 transition-all" />
  </motion.div>
);

const FooterStat = ({ label, value }) => (
  <div className="flex flex-row gap-3 items-center">
    <span className="text-[9px] tech-header text-slate-700">{label}</span>
    <span className="text-[10px] font-black text-slate-400">{value}</span>
  </div>
);

const IconButton = ({ icon: Icon, badge }) => (
  <button className="p-2.5 bg-white/[0.03] border border-white/5 text-slate-500 hover:text-white hover:border-orange-500/30 transition-all relative group overflow-hidden">
    <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/5 transition-colors" />
    <Icon size={18} className="relative z-10" />
    {badge > 0 && (
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-[8px] font-black text-black flex items-center justify-center glow-orange z-20">
        {badge}
      </span>
    )}
  </button>
);

export default App;
