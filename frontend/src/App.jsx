import React, { useEffect, useState } from 'react';
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
  CloudRain,
  X
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

  const [activeTab, setActiveTab] = useState('telemetry');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    updateData();
    const interval = setInterval(updateData, 60000);
    return () => clearInterval(interval);
  }, [updateData]);

  // Kp Index'e göre dinamik bölge etki hesaplaması
  const getRegionImpacts = () => {
    const latestKp = kpIndex.length > 0 ? parseFloat(kpIndex[kpIndex.length - 1].kp_index) : 0;
    
    if (latestKp >= 7) {
      return [
        { label: 'Kuzey Kutup Bölgesi', risk: 'Şiddetli Kutup Işığı', color: 'text-red-400' },
        { label: 'Yüksek Enlemler', risk: 'Yoğun HF Soğurma', color: 'text-orange-400' },
        { label: 'Ekvator Bölgesi', risk: 'Dikkat', color: 'text-yellow-400' },
      ];
    } else if (latestKp >= 4) {
      return [
        { label: 'Kuzey Kutup Bölgesi', risk: 'Yoğun Kutup Işığı', color: 'text-green-400' },
        { label: 'Yüksek Enlemler', risk: 'Düşük HF Soğurma', color: 'text-yellow-400' },
        { label: 'Ekvator Bölgesi', risk: 'Kararlı', color: 'text-slate-500' },
      ];
    } else {
      return [
        { label: 'Kuzey Kutup Bölgesi', risk: 'Normal Kutup Işığı', color: 'text-green-400' },
        { label: 'Yüksek Enlemler', risk: 'Soğurma Yok', color: 'text-slate-500' },
        { label: 'Ekvator Bölgesi', risk: 'Kararlı', color: 'text-slate-500' },
      ];
    }
  };

  const regionImpacts = getRegionImpacts();

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-200 p-4 md:p-6 lg:p-8 flex flex-col gap-6 font-sans antialiased overflow-x-hidden">
      
      {/* Uzay Arka Plan Katmanı */}
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />

      {/* Global Navigasyon Başlığı */}
      <nav className="glass px-6 py-4 flex items-center justify-between border border-white/5 relative z-50">
        <div className="flex items-center gap-6">
          <div className="bg-orange-500/20 p-2.5 rounded-2xl border border-orange-500/30 glow-orange">
            <Zap size={28} className="text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-none text-white">
              GÖREV MERKEZİ <span className="text-orange-500 ml-1">SOLAR SENTINEL</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-bold tracking-[4px] uppercase mt-1">
              Küresel CME Tespiti ve Erken Uyarı Ağı
            </p>
          </div>
        </div>

        <div className="hidden xl:flex items-center gap-10">
          <NavButton label="Telemetri" active={activeTab === 'telemetry'} onClick={() => setActiveTab('telemetry')} />
          <NavButton label="Manyetosfer" active={activeTab === 'magneto'} onClick={() => setActiveTab('magneto')} />
          <NavButton label="Jeomanyetik" active={activeTab === 'geo'} onClick={() => setActiveTab('geo')} />
          <NavButton label="Arşiv v2.4" active={activeTab === 'archive'} onClick={() => setActiveTab('archive')} />
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block border-r border-slate-800 pr-6 mr-6">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Ağ Durumu</p>
            <p className="text-[10px] font-black text-green-500 flex items-center gap-2 justify-end">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              SWPC AKTİF
            </p>
          </div>
          <div className="flex gap-3 relative">
            <IconButton icon={Bell} onClick={() => setShowNotifications(!showNotifications)} badge={cmeEvents.length} />
            <IconButton icon={Settings} onClick={() => setShowSettings(!showSettings)} />
          </div>
        </div>
      </nav>

      {/* Bildirim Paneli */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="fixed top-24 right-8 w-80 z-[100] glass rounded-2xl border border-white/10 p-4 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-black text-white">Bildirimler</h3>
              <button onClick={() => setShowNotifications(false)} className="text-slate-500 hover:text-white"><X size={16} /></button>
            </div>
            {cmeEvents.length > 0 ? cmeEvents.slice(0, 5).map((evt, i) => (
              <div key={i} className="p-3 mb-2 rounded-xl bg-slate-900/60 border border-slate-800/40 border-l-4 border-l-orange-500">
                <p className="text-[10px] font-black text-orange-500">CME TESPİT EDİLDİ</p>
                <p className="text-xs text-slate-300 truncate">{evt.activityID}</p>
                <p className="text-[9px] text-slate-600">{evt.startTime?.split('T')[0]}</p>
              </div>
            )) : (
              <p className="text-xs text-slate-600 text-center py-4">Yeni bildirim yok</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ayarlar Modalı */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          >
            <div className="w-96 glass rounded-2xl border border-white/10 p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-white">Ayarlar</h3>
                <button onClick={() => setShowSettings(false)} className="text-slate-500 hover:text-white"><X size={18} /></button>
              </div>
              <div className="space-y-4">
                <SettingRow label="Veri Yenileme Sıklığı" value="60 saniye" />
                <SettingRow label="Veri Kaynağı" value="NOAA SWPC + NASA DONKI" />
                <SettingRow label="NASA API Anahtarı" value="••••••••YEd (Aktif)" />
                <SettingRow label="Güneş Görüntüsü" value="SDO / Helioviewer" />
                <SettingRow label="Sürüm" value="Solar Sentinel v2.4" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Dashboard Grid */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 flex-1">
        
        {/* Left Column: Telemetry & Feeds (Shared or Tab-specific) */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          {activeTab === 'telemetry' ? (
            <div className="grid grid-cols-1 gap-6">
              <DataCharts title="X-Işını Akısı (GOES-16)" data={xrayFlux} dataKey="flux" color="#fbbf24" unit="W/m²" />
              <DataCharts title="Manyetik Alan Gücü (Bz)" data={solarMag} dataKey="bz_gsm" color="#a855f7" unit="nT" />
              <DataCharts title="Güneş Rüzgarı Hızı" data={solarWind} dataKey="speed" color="#22d3ee" unit="km/s" />
            </div>
          ) : activeTab === 'magneto' ? (
            <div className="grid grid-cols-1 gap-6">
              <DataCharts title="Manyetik Alan (Bt)" data={solarMag} dataKey="bt" color="#a855f7" unit="nT" />
              <DataCharts title="Proton Yoğunluğu" data={solarWind} dataKey="density" color="#ef4444" unit="p/cm³" />
              <div className="glass p-6 rounded-3xl border border-white/5 bg-purple-500/5">
                <h4 className="text-[10px] font-black text-purple-400 uppercase mb-2">Manyetosfer Durumu</h4>
                <p className="text-xs text-slate-400">Manyetopause konumu kararlı. IMF Bz yönü: {solarMag.length > 0 && parseFloat(solarMag[solarMag.length-1].bz_gsm) < 0 ? 'Güney (S)' : 'Kuzey (N)'}</p>
              </div>
            </div>
          ) : (
            <div className="glass p-6 rounded-3xl border border-white/5 h-full flex flex-col items-center justify-center opacity-40">
              <Activity size={32} className="mb-4" />
              <p className="text-[10px] uppercase font-black">Yan Panel Telemetrisi</p>
            </div>
          )}

          {/* Realtime Event Stream (Always visible or localized) */}
          <div className="glass p-6 rounded-3xl border border-white/5 flex-1 select-none">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[2px] mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database size={14} className="text-blue-500" />
                {activeTab === 'archive' ? 'Tarihsel Arşiv' : 'Son Olaylar'}
              </div>
              <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">
                {activeTab === 'archive' ? 'GEÇMİŞ 30 GÜN' : '72 SAAT PENCERESİ'}
              </span>
            </h3>
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar no-scrollbar">
              {cmeEvents.length > 0 ? cmeEvents.map((evt, i) => (
                <div key={i} className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/40 hover:bg-slate-900 transition-all border-l-4 border-l-orange-500">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-[10px] font-black text-orange-500 tracking-wider">CME TESPİT EDİLDİ</p>
                    <span className="text-[9px] font-bold text-slate-600">{evt.startTime?.split('T')[0]}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-300 truncate mb-2">{evt.activityID}</p>
                  <div className="flex items-center gap-4 text-[9px] font-bold text-slate-500">
                    <span className="flex items-center gap-1"><Compass size={10} /> KONUM: {evt.sourceLocation || '---'}</span>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-10 text-slate-700 opacity-50">
                  <Activity size={32} className="animate-pulse mb-3" />
                  <p className="text-[10px] uppercase font-black tracking-widest">Aktif Olay Yok</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center Column: Visualizations */}
        <div className="lg:col-span-6 flex flex-col gap-8">
          {activeTab === 'telemetry' || activeTab === 'archive' ? (
            <>
              {/* Main Heliographic Monitor */}
              <div className="glass rounded-[32px] overflow-hidden border border-white/5 relative bg-black group min-h-[450px]">
                <Sun3D riskScore={riskScore} />
                <div className="absolute top-8 left-8 pointer-events-none">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/10 backdrop-blur-md mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-[9px] font-black text-white uppercase tracking-widest">Helyografik Projeksiyon v4</span>
                  </div>
                  <h2 className="text-3xl font-black text-white drop-shadow-2xl">GÜNEŞ SDO <span className="text-orange-500">CANLI</span></h2>
                </div>
                
                <div className="absolute bottom-8 right-8 flex gap-4 pointer-events-none">
                  <MetricBox label="Dönüş" value="2,02 km/s" />
                  <MetricBox label="Kütle" value="1,98e30 kg" />
                  <MetricBox label="Çekirdek" value="15M °C" />
                </div>
              </div>

              {/* SDO Filter Overlay Panel */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-2">Yüksek Çözünürlük SDO 171 Å Filtresi</h3>
                    <span className="text-[10px] font-bold text-slate-600 mr-2">GÜNCELLEME: 60SN</span>
                </div>
                <SolarOverlay imageUrl={sunImage} riskScore={riskScore} cmeEvents={cmeEvents} />
              </div>
            </>
          ) : activeTab === 'magneto' ? (
             <div className="flex flex-col gap-8 flex-1">
                <div className="glass rounded-[32px] p-8 border border-white/5 bg-slate-900/20 flex-1 flex flex-col items-center justify-center">
                   <div className="w-full max-w-lg mb-10">
                      <Earth3D riskScore={riskScore} scale={1.5} />
                   </div>
                   <div className="text-center max-w-md">
                      <h2 className="text-2xl font-black text-white mb-4">MANYETİK KALKAN İZLEME</h2>
                      <p className="text-sm text-slate-400">Yeryüzü manyetosferindeki güneş rüzgarı baskısı ve şok dalgaları anlık olarak izleniyor. Şu anki manyetopause sıkışma riski: %{Math.max(0, riskScore - 20)}</p>
                   </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                   <MetricBox label="Şok Dalgası" value="Yok" />
                   <MetricBox label="IMF Durumu" value="Stabil" />
                   <MetricBox label="Basınç" value="1.5 nPa" />
                </div>
             </div>
          ) : activeTab === 'geo' ? (
            <div className="flex flex-col gap-8 flex-1">
               <div className="glass rounded-[32px] p-8 border border-white/5 bg-slate-900/20">
                  <h3 className="text-sm font-black text-white mb-6 uppercase tracking-widest">Jeomanyetik Fırtına Analizi (Kp)</h3>
                  <div className="grid grid-cols-2 gap-8">
                     <div className="flex flex-col gap-4">
                        <p className="text-xs text-slate-400">Kp İndeksi, yeryüzündeki manyetik bozulmanın küresel ölçeğidir. 5 ve üzeri fırtına olarak kabul edilir.</p>
                        <div className="p-6 rounded-2xl bg-black/40 border border-white/5">
                           <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Güncel Kp İndeksi</p>
                           <p className="text-5xl font-black text-orange-500">{kpIndex.length > 0 ? kpIndex[kpIndex.length-1].kp_index : '--'}</p>
                        </div>
                     </div>
                     <div className="space-y-4">
                        <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5">
                           <p className="text-[10px] font-black text-green-500 uppercase">G-Scale (Güneş Fırtınası)</p>
                           <p className="text-sm font-bold text-white">{riskScore > 50 ? 'G2 - Orta' : 'G0 - Sakin'}</p>
                        </div>
                        <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
                           <p className="text-[10px] font-black text-blue-500 uppercase">R-Scale (Radyo Kararma)</p>
                           <p className="text-sm font-bold text-white">R0 - Etki Yok</p>
                        </div>
                     </div>
                  </div>
               </div>
               <DataCharts title="Küresel Kp İndeksi (Tahmin)" data={kpIndex} dataKey="kp_index" color="#f97316" unit="" />
            </div>
          ) : null}
        </div>

        {/* Right Column: Analytics & Aurora */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          <RiskAnalysis score={riskScore} cmeEvents={cmeEvents} />
          
          <div className="flex flex-col gap-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[2px] mb-2 flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <CloudRain size={14} className="text-green-500" />
                Kutup Işığı Tahmini
              </div>
              <span className="text-[9px] font-bold text-green-500/50">SON OVATION</span>
            </h3>
            {activeTab !== 'magneto' && <Earth3D riskScore={riskScore} />}
            
            <div className="p-6 rounded-3xl glass border border-white/5 bg-slate-900/20 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tahmini Etki Alanı</p>
                  <Globe size={14} className="text-slate-600" />
                </div>
                <div className="space-y-3">
                  {regionImpacts.map((r, i) => (
                    <RegionImpact key={i} label={r.label} risk={r.risk} color={r.color} />
                  ))}
                </div>
            </div>
          </div>

          {/* Kritik Durum Acil Protokol */}
          {riskScore > 75 && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="p-6 rounded-3xl bg-red-600/20 border border-red-500/50 glow-red"
            >
              <div className="flex items-center gap-3 mb-3 text-red-500">
                <Shield size={22} className="animate-bounce" />
                <h3 className="font-black text-sm uppercase tracking-tighter">DELTA KALKAN PROTOKOLÜ</h3>
              </div>
              <p className="text-[11px] text-red-100 font-bold leading-relaxed opacity-80">
                L1 Lagrange noktası manyetosonik hız eşiği aşıldı. Trans-polar uçuş irtifalarının derhal yere indirilmesi önerilir.
              </p>
            </motion.div>
          )}
        </div>
      </main>

      {/* Global Alt Bilgi */}
      <footer className="glass p-5 border border-white/5 flex flex-wrap items-center justify-between gap-6 relative z-10 select-none">
        <div className="flex gap-10 overflow-x-auto no-scrollbar">
          <FooterStat label="Veri Motoru" value="SWPC JSON V1.02" />
          <FooterStat label="Gözlem" value={lastUpdate ? lastUpdate.toLocaleTimeString('tr-TR') : 'SENKRONİZE EDİLİYOR...'} />
          <FooterStat label="Gecikme" value={loading ? 'VERİ ÇEKİLİYOR...' : '0.12ms L1 GECİKME'} color={loading ? 'text-yellow-500' : 'text-blue-500'} />
          <FooterStat label="CME Mantığı" value="NASA DONKI API" />
        </div>
        <div className="text-[10px] font-black text-slate-700 tracking-[3px] uppercase ml-auto">
          &copy; 2026 GÖREV MERKEZİ // SENTINEL-TK-NET
        </div>
      </footer>
    </div>
  );
}

// Alt bileşenler
const NavButton = ({ label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`text-[11px] font-black uppercase tracking-[3px] transition-all hover:text-white relative group ${active ? 'text-white' : 'text-slate-500'}`}
  >
    {label}
    <div className={`absolute -bottom-2 left-0 w-full h-[2px] bg-orange-500 transition-all scale-x-0 group-hover:scale-x-100 ${active ? 'scale-x-100' : ''}`} />
  </button>
);

const IconButton = ({ icon: Icon, onClick, badge }) => (
  <button onClick={onClick} className="w-12 h-12 rounded-2xl bg-slate-900/50 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:border-white/10 hover:bg-slate-900 transition-all shadow-2xl relative">
    <Icon size={20} />
    {badge > 0 && (
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-[8px] font-black text-white flex items-center justify-center">{badge}</span>
    )}
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

const SettingRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-3 border-b border-white/5 last:border-0">
    <span className="text-xs text-slate-400">{label}</span>
    <span className="text-xs font-bold text-white">{value}</span>
  </div>
);

export default App;
