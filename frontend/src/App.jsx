import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Bell, 
  Settings, 
  Globe, 
  Shield, 
  AlertTriangle,
  Activity,
  Wind,
  Layers,
  Database,
  Compass,
  CloudRain
} from 'lucide-react';
import { useSolarStore } from './store/solarStore';
import Sun3D from './components/Sun3D';
import Earth3D from './components/Earth3D';
import DataCharts from './components/DataCharts';
import RiskAnalysis from './components/RiskAnalysis';
import SolarOverlay from './components/SolarOverlay';

function App() {
  const { 
    updateData, 
    xrayFlux, 
    solarWind, 
    solarMag,
    kpIndex, 
    auroraData,
    cmeEvents, 
    riskScore, 
    sunImage, 
    loading, 
    lastUpdate 
  } = useSolarStore();

  useEffect(() => {
    updateData(); // İlk yükleme
    const interval = setInterval(updateData, 60000); // 60s yenileme
    return () => clearInterval(interval);
  }, [updateData]);

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 p-4 md:p-6 lg:p-8 flex flex-col gap-6 font-sans antialiased overflow-x-hidden">
      
      {/* Space Background Layer */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

      {/* Global Navigation Header */}
      <nav className="glass px-6 py-4 flex items-center justify-between border border-white/5 relative z-50">
        <div className="flex items-center gap-6">
          <div className="bg-orange-500/20 p-2.5 rounded-2xl border border-orange-500/30 glow-orange">
            <Zap size={28} className="text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-none text-white">
              MISSION CONTROL <span className="text-orange-500 ml-1">SOLAR SENTINEL</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-bold tracking-[4px] uppercase mt-1">
              Global CME Detection & Early Warning Network
            </p>
          </div>
        </div>

        <div className="hidden xl:flex items-center gap-10">
          <NavButton label="Telemetry" active />
          <NavButton label="Magnetosphere" />
          <NavButton label="Geomagnetic" />
          <NavButton label="Archive v2.4" />
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block border-r border-slate-800 pr-6 mr-6">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Network Status</p>
            <p className="text-[10px] font-black text-green-500 flex items-center gap-2 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              SWPC NOMINAL
            </p>
          </div>
          <div className="flex gap-3">
            <IconButton icon={Bell} />
            <IconButton icon={Settings} />
          </div>
        </div>
      </nav>

      {/* Primary Dashboard Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 flex-1">
        
        {/* Left Column: Telemetry & Feeds */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          <div className="grid grid-cols-1 gap-6">
            <DataCharts 
              title="X-Ray Flux (GOES-16)" 
              data={xrayFlux} 
              dataKey="flux" 
              color="#fbbf24" 
              unit="W/m²"
            />
            <DataCharts 
              title="Magnetic Strength (Bz)" 
              data={solarMag} 
              dataKey="bz_gsm" 
              color="#a855f7" 
              unit="nT"
            />
            <DataCharts 
              title="Solar Wind Speed" 
              data={solarWind} 
              dataKey="speed" 
              color="#22d3ee" 
              unit="km/s"
            />
          </div>

          {/* Realtime Event Stream */}
          <div className="glass p-6 rounded-3xl border border-white/5 flex-1 select-none">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[2px] mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database size={14} className="text-blue-500" />
                Latest Events
              </div>
              <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">72H WINDOW</span>
            </h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar no-scrollbar">
              {cmeEvents.length > 0 ? cmeEvents.map((evt, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/40 hover:bg-slate-900 transition-all border-l-4 border-l-orange-500">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-[10px] font-black text-orange-500 tracking-wider">CME DETECTED</p>
                    <span className="text-[9px] font-bold text-slate-600">{evt.startTime.split('T')[0]}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-300 truncate mb-2">{evt.activityID}</p>
                  <div className="flex items-center gap-4 text-[9px] font-bold text-slate-500">
                    <span className="flex items-center gap-1"><Compass size={10} /> POS: {evt.sourceLocation || '---'}</span>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-700 opacity-50">
                  <Activity size={32} className="animate-pulse mb-3" />
                  <p className="text-[10px] uppercase font-black tracking-widest">No Active Events</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center Column: Visualizations */}
        <div className="lg:col-span-6 flex flex-col gap-8">
          {/* Main Heliographic Monitor */}
          <div className="glass rounded-[32px] overflow-hidden border border-white/5 relative bg-black group min-h-[450px]">
            <Sun3D riskScore={riskScore} />
            <div className="absolute top-8 left-8 pointer-events-none">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[9px] font-black text-white uppercase tracking-widest">Heliographic Projection v4</span>
              </div>
              <h2 className="text-3xl font-black text-white drop-shadow-2xl">SOLAR SDO <span className="text-orange-500">LIVE</span></h2>
            </div>
            
            <div className="absolute bottom-8 right-8 flex gap-4 pointer-events-none">
              <MetricBox label="Rotation" value="2.02 km/s" />
              <MetricBox label="Mass" value="1.98e30 kg" />
              <MetricBox label="Core" value="15M °C" />
            </div>
          </div>

          {/* SDO Filter Overlay Panel */}
          <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">High Resolution SDO 171 Å Filter</h3>
                <span className="text-[10px] font-bold text-slate-600 mr-2">POLLING: 60S</span>
             </div>
             <SolarOverlay imageUrl={sunImage} riskScore={riskScore} />
          </div>
        </div>

        {/* Right Column: Analytics & Aurora */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          <RiskAnalysis score={riskScore} cmeEvents={cmeEvents} />
          
          <div className="flex flex-col gap-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[2px] mb-2 flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <CloudRain size={14} className="text-green-500" />
                Aurora Forecast
              </div>
              <span className="text-[9px] font-bold text-green-500/50">LATEST OVATION</span>
            </h3>
            <Earth3D riskScore={riskScore} />
            
            <div className="p-6 rounded-3xl glass border border-white/5 bg-slate-900/20 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Predicted Impact Area</p>
                  <Globe size={14} className="text-slate-600" />
                </div>
                <div className="space-y-3">
                  <RegionImpact label="Northern Polar Area" risk="Elevated Aurora" color="text-green-400" />
                  <RegionImpact label="High Latitudes" risk="Min HF Absorption" color="text-yellow-400" />
                  <RegionImpact label="Equatorial Grid" risk="Stable" color="text-slate-500" />
                </div>
            </div>
          </div>

          {/* Emergency Protocols if Critical */}
          {riskScore > 75 && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="p-6 rounded-3xl bg-red-600/20 border border-red-500/50 glow-red"
            >
              <div className="flex items-center gap-3 mb-3 text-red-500">
                <Shield size={22} className="animate-bounce" />
                <h3 className="font-black text-sm uppercase tracking-tighter">DELTA SHIELD PROTOCOL</h3>
              </div>
              <p className="text-[11px] text-red-100 font-bold leading-relaxed opacity-80">
                L1 Lagrange point magnetosonic speed threshold exceeded. Recommend immediate grounding of trans-polar flight altitudes.
              </p>
            </motion.div>
          )}
        </div>
      </main>

      {/* Global Meta Footer */}
      <footer className="glass p-5 border border-white/5 flex flex-wrap items-center justify-between gap-6 relative z-10 select-none">
        <div className="flex gap-10 overflow-x-auto no-scrollbar">
          <FooterStat label="Data Engine" value="SWPC JSON V1.02" />
          <FooterStat label="Observation" value={lastUpdate ? lastUpdate.toLocaleTimeString() : 'SYNCHRONIZING...'} />
          <FooterStat label="Latency" value={loading ? 'FETCHING...' : '0.12ms L1 LAG'} color={loading ? 'text-yellow-500' : 'text-blue-500'} />
          <FooterStat label="CME Logic" value="NASA DONKI API" />
        </div>
        <div className="text-[10px] font-black text-slate-700 tracking-[3px] uppercase ml-auto">
          &copy; 2026 MISSION CONTROL // SENTINEL-TK-NET
        </div>
      </footer>
    </div>
  );
}

// Sub-components
const NavButton = ({ label, active }) => (
  <button className={`text-[11px] font-black uppercase tracking-[3px] transition-all hover:text-white relative group ${active ? 'text-white' : 'text-slate-500'}`}>
    {label}
    <div className={`absolute -bottom-2 left-0 w-full h-[2px] bg-orange-500 transition-all scale-x-0 group-hover:scale-x-100 ${active ? 'scale-x-100' : ''}`} />
  </button>
);

const IconButton = ({ icon: Icon }) => (
  <button className="w-12 h-12 rounded-2xl bg-slate-900/50 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/10 hover:bg-slate-900 transition-all shadow-2xl">
    <Icon size={20} />
  </button>
);

const MetricBox = ({ label, value }) => (
  <div className="bg-black/40 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/5 text-center shadow-lg">
    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-xs font-black text-white">{value}</p>
  </div>
);

const FooterStat = ({ label, value, color = 'text-slate-400' }) => (
  <div className="flex items-center gap-3 whitespace-nowrap">
    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{label}</span>
    <span className={`text-[11px] font-black ${color}`}>{value}</span>
  </div>
);

const RegionImpact = ({ label, risk, color }) => (
  <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
    <span className="text-[10px] font-bold text-slate-500">{label}</span>
    <span className={`text-[10px] font-black ${color}`}>{risk}</span>
  </div>
);

export default App;
