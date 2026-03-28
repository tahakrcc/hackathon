import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  Wind, 
  Zap, 
  Plane, 
  Satellite, 
  Shield, 
  AlertCircle,
  Menu,
  Bell,
  Settings,
  Globe
} from 'lucide-react';
import SolarSphere from './components/SolarSphere';
import DataCharts from './components/DataCharts';
import AlertPanel from './components/AlertPanel';

function App() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [riskLevel, setRiskLevel] = useState('Medium');

  // Simulate risk level changes
  useEffect(() => {
    const timer = setTimeout(() => setRiskLevel('High'), 5000);
    return () => clearTimeout(timer);
  }, []);

  const navItems = ['Overview', 'Analytics', 'Aviation', 'Power Grid', 'Satellites'];

  return (
    <div className="min-h-screen bg-deep p-4 md:p-8 flex flex-col gap-8">
      {/* Navigation Bar */}
      <nav className="glass p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500/20 p-2 rounded-lg glow-orange">
            <Zap size={24} className="text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">SOLAR SENTINEL</h1>
            <p className="text-[10px] text-slate-500 font-bold tracking-[2px]">EARLY WARNING SYSTEM</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map(item => (
            <button 
              key={item}
              onClick={() => setActiveTab(item)}
              className={`text-sm font-semibold transition-all hover:text-white ${activeTab === item ? 'text-white' : 'text-slate-500'}`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Bell size={20} className="text-slate-400 cursor-pointer hover:text-white" />
          <Settings size={20} className="text-slate-400 cursor-pointer hover:text-white" />
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
            <span className="text-xs font-bold">TK</span>
          </div>
        </div>
      </nav>

      {/* Main Grid Layout */}
      <main className="grid grid-cols-1 md:grid-cols-12 gap-8 flex-1">
        
        {/* Left Column: Metrics & Spheres */}
        <div className="md:col-span-4 flex flex-col gap-8">
          <section className="glass p-8 flex flex-col items-center justify-center min-h-[400px]">
            <SolarSphere level={riskLevel} />
            <div className="mt-8 grid grid-cols-2 gap-4 w-full">
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                <p className="text-[10px] text-slate-500 font-bold mb-1">DATA FRESHNESS</p>
                <p className="text-sm font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  0.8ms LAG
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800">
                <p className="text-[10px] text-slate-500 font-bold mb-1">MODEL CONFIDENCE</p>
                <p className="text-sm font-bold">98.4%</p>
              </div>
            </div>
          </section>

          <AlertPanel />
        </div>

        {/* Center/Right Column: Charts & Sector Insights */}
        <div className="md:col-span-8 flex flex-col gap-8">
          
          {/* Top Row: Analytics Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <DataCharts title="GOES X-Ray Flux" dataKey="flux" color="var(--accent-orange)" />
            <DataCharts title="IMF Magnetic Strength" dataKey="mag" color="var(--accent-purple)" />
          </div>

          {/* Sector Sensitivity Grid */}
          <div className="glass p-8 flex-1">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold">Sector-Specific Sensitivity</h2>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Globe size={14} />
                Global Analysis v4.2
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <SectorCard icon={Plane} label="Aviation" value="Moderate Risk" color="var(--accent-green)" />
              <SectorCard icon={Zap} label="Power Grid" value="Warning" color="var(--accent-orange)" />
              <SectorCard icon={Satellite} label="Satellites" value="Nominal" color="var(--accent-green)" />
            </div>

            <div className="mt-12 p-6 rounded-2xl bg-slate-900/40 border border-slate-800/50 flex items-start gap-4">
              <div className="bg-red-500/10 p-3 rounded-xl">
                <Shield size={24} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-red-500 mb-1">Shield Protocal Delta Active</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Magnetic field compression detected at L1. Recommendation: Ensure redundancy in HF communication channels for trans-polar flights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="glass p-4 flex items-center justify-between text-[10px] text-slate-500 font-bold tracking-[1px]">
        <div className="flex gap-4">
          <span>SOURCE: NOAA SPWC</span>
          <span>NASA DONKI API v2</span>
          <span>SOHO/LASCO C3</span>
        </div>
        <div>
          SYSTEM STATUS: ONLINE
        </div>
      </footer>
    </div>
  );
}

const SectorCard = ({ icon: Icon, label, value, color }) => (
  <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-800/40 hover:border-slate-700 transition-all cursor-pointer group">
    <Icon className="mb-4 text-slate-500 group-hover:scale-110 transition-transform" size={24} />
    <h4 className="text-xs text-slate-500 font-bold mb-1 uppercase letter-spacing-[1px]">{label}</h4>
    <p className="font-bold" style={{ color }}>{value}</p>
  </div>
);

export default App;
