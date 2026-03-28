import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Monitor, Volume2, VolumeX, RefreshCw, Eye, EyeOff, Gauge, Palette, Info } from 'lucide-react';

const SettingsPanel = ({ isOpen, onClose, onRefreshData }) => {
  const [scanlines, setScanlines] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(60);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  const handleScanlinesToggle = () => {
    setScanlines(!scanlines);
    const el = document.getElementById('cyber-scanlines');
    if (el) {
      el.style.display = scanlines ? 'none' : 'block';
    }
  };

  const handleHighContrastToggle = () => {
    setHighContrast(!highContrast);
    document.body.classList.toggle('high-contrast');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Arka plan overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[3000] backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 w-[420px] max-w-[90vw] h-full bg-cyber-bg border-l border-neon-cyan/20 z-[3001] flex flex-col overflow-hidden"
          >
            {/* Panel Başlığı */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neon-cyan/20 bg-black/40">
              <div className="flex items-center gap-3">
                <div className="p-2 border border-neon-yellow bg-neon-yellow/5">
                  <Settings size={18} className="neon-text-yellow" />
                </div>
                <div>
                  <h2 className="text-sm font-black tracking-[3px] uppercase neon-text-yellow">Ayarlar</h2>
                  <p className="text-[8px] tech-header text-slate-500 mt-1">SİSTEM KONFİGÜRASYONU</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-neon-magenta transition-colors border border-white/5 hover:border-neon-magenta/30"
              >
                <X size={18} />
              </button>
            </div>

            {/* Ayar Grupları */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
              
              {/* GÖRÜNTÜ AYARLARI */}
              <SettingsGroup title="Görüntü" icon={Monitor}>
                <ToggleOption 
                  label="Tarama Çizgileri" 
                  description="HUD tarama çizgileri efektini aç/kapat"
                  enabled={scanlines}
                  onToggle={handleScanlinesToggle}
                  color="cyan"
                />
                <ToggleOption 
                  label="Yüksek Kontrast" 
                  description="Okunabilirliği artırmak için kontrastı yükselt"
                  enabled={highContrast}
                  onToggle={handleHighContrastToggle}
                  color="yellow"
                />
              </SettingsGroup>

              {/* VERİ AYARLARI */}
              <SettingsGroup title="Veri Akışı" icon={RefreshCw}>
                <ToggleOption 
                  label="Otomatik Yenileme" 
                  description="Verileri belirli aralıklarla otomatik güncelle"
                  enabled={autoRefresh}
                  onToggle={() => setAutoRefresh(!autoRefresh)}
                  color="cyan"
                />
                <div className="px-4 py-4 bg-black/30 border border-white/5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold text-slate-300">Yenileme Aralığı</span>
                    <span className="text-[11px] font-black neon-text-cyan tabular-nums">{refreshInterval}sn</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="300"
                    step="15"
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-none appearance-none cursor-pointer accent-[#00f3ff]"
                  />
                  <div className="flex justify-between mt-2">
                    <span className="text-[8px] text-slate-600">15sn</span>
                    <span className="text-[8px] text-slate-600">5dk</span>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    if (onRefreshData) onRefreshData();
                  }}
                  className="w-full mt-3 px-4 py-3 text-[11px] font-black uppercase tracking-[3px] border border-neon-cyan text-neon-cyan hover:bg-neon-cyan/10 transition-all flex items-center justify-center gap-3 group"
                >
                  <RefreshCw size={14} className="group-hover:animate-spin" />
                  Verileri Şimdi Yenile
                </button>
              </SettingsGroup>

              {/* SES AYARLARI */}
              <SettingsGroup title="Ses & Uyarılar" icon={Volume2}>
                <ToggleOption 
                  label="Ses Bildirimleri" 
                  description="Kritik uyarılarda ses çal"
                  enabled={soundEnabled}
                  onToggle={() => setSoundEnabled(!soundEnabled)}
                  color="magenta"
                />
              </SettingsGroup>

              {/* SİSTEM BİLGİSİ */}
              <SettingsGroup title="Sistem Bilgisi" icon={Info}>
                <div className="space-y-3 px-4 py-4 bg-black/30 border border-white/5">
                  <InfoRow label="Sürüm" value="v1.0.0" />
                  <InfoRow label="Veri Kaynağı" value="NOAA / NASA DONKI" />
                  <InfoRow label="Yapay Zeka" value="Sentinel YZ Motoru" />
                  <InfoRow label="Sensör Ağı" value="GOES-16, DSCOVR, ACE" />
                  <InfoRow label="Güncelleme Frekansı" value={`${refreshInterval} saniye`} />
                  <InfoRow label="Protokol" value="HTTPS / WSS" />
                </div>
              </SettingsGroup>
            </div>

            {/* Alt Bilgi */}
            <div className="px-6 py-3 border-t border-white/5 bg-black/40 flex justify-between items-center">
              <span className="text-[8px] tech-header text-slate-500">SOLAR SENTINEL // SİBER_OS v1.0</span>
              <div className="flex gap-1">
                {[1,2,3].map(i => (
                  <div key={i} className="w-1.5 h-1.5 bg-neon-yellow/60" />
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Ayar Grubu
const SettingsGroup = ({ title, icon: Icon, children }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-3 border-b border-white/10 pb-2">
      <Icon size={14} className="neon-text-cyan" />
      <span className="text-[11px] font-bold text-slate-200 uppercase tracking-[2px]">{title}</span>
    </div>
    {children}
  </div>
);

// Toggle Seçeneği
const ToggleOption = ({ label, description, enabled, onToggle, color = 'cyan' }) => {
  const hexColor = color === 'magenta' ? '#ff003c' : (color === 'yellow' ? '#fcee0a' : '#00f3ff');
  
  return (
    <div 
      onClick={onToggle}
      className="flex items-center justify-between px-4 py-4 bg-black/30 border border-white/5 cursor-pointer hover:border-neon-cyan/20 transition-all group"
    >
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-bold text-slate-200">{label}</span>
        <span className="text-[9px] text-slate-500">{description}</span>
      </div>
      <div className={`w-11 h-6 rounded-full relative transition-all ${enabled ? '' : 'bg-white/10'}`} style={enabled ? { background: `${hexColor}30`, boxShadow: `0 0 10px ${hexColor}40` } : {}}>
        <motion.div 
          animate={{ x: enabled ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="absolute top-1 w-4 h-4 rounded-full"
          style={{ background: enabled ? hexColor : '#475569' }}
        />
      </div>
    </div>
  );
};

// Bilgi Satırı
const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-[10px] text-slate-500">{label}</span>
    <span className="text-[10px] font-bold text-slate-300">{value}</span>
  </div>
);

export default SettingsPanel;
