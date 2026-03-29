import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Monitor, Volume2, RefreshCw, Eye, Info, AlertOctagon, Download, Zap, Mail, Trash2 } from 'lucide-react';
import { useSolarStore } from '../store/solarStore';

const SettingsPanel = ({ isOpen, onClose, onRefreshData }) => {
  // 1. TÜM HOOKLAR EN ÜSTTE VE KOŞULSUZ
  const [newMail, setNewMail] = useState('');
  const [scanlines, setScanlines] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(60);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  // Store Hook'u
  const recipientMails = useSolarStore(state => state.recipientMails);
  const addRecipientMail = useSolarStore(state => state.addRecipientMail);
  const removeRecipientMail = useSolarStore(state => state.removeRecipientMail);
  const triggerAlertSimulation = useSolarStore(state => state.triggerAlertSimulation);
  const downloadSystemData = useSolarStore(state => state.downloadSystemData);

  // Handlers
  const handleAddMail = () => {
    if (newMail && newMail.includes('@')) {
      addRecipientMail(newMail.trim());
      setNewMail('');
    }
  };

  const handleScanlinesToggle = () => {
    setScanlines(!scanlines);
    const el = document.getElementById('cyber-scanlines');
    if (el) el.style.display = scanlines ? 'none' : 'block';
  };

  const handleHighContrastToggle = () => {
    setHighContrast(!highContrast);
    document.body.classList.toggle('high-contrast');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[3000] backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="fixed top-0 right-0 w-[420px] max-w-[90vw] h-full bg-[#0c0c0c] border-l border-cyan-500/20 z-[3001] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-cyan-500/10 bg-black/40">
              <div className="flex items-center gap-3">
                <Settings size={18} className="text-yellow-400" />
                <h2 className="text-xs font-black tracking-[4px] uppercase text-yellow-400">Sistem Ayarları</h2>
              </div>
              <button onClick={onClose} className="p-2 text-slate-500 hover:text-red-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">

              {/* Bildirim Ayarları */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <Mail size={14} className="text-cyan-400" />
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Bildirim İstasyonu</span>
                </div>

                <div className="p-4 bg-white/5 border border-white/5 rounded space-y-4">
                  <div className="flex flex-wrap gap-2 min-h-[30px]">
                    {recipientMails.map((m, idx) => (
                      <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/30 rounded text-[10px] text-cyan-400 font-mono">
                        {m}
                        <button onClick={() => removeRecipientMail(m)} className="hover:text-red-500">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={newMail}
                      onChange={(e) => setNewMail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddMail()}
                      placeholder="Yeni mail ekle..."
                      className="flex-1 bg-black border border-white/10 rounded p-3 text-[10px] text-white focus:outline-none focus:border-cyan-500/50"
                    />
                    <button onClick={handleAddMail} className="px-4 bg-cyan-500/20 border border-cyan-500 text-cyan-400 text-[10px] font-bold hover:bg-cyan-500 hover:text-black transition-all">
                      EKLE
                    </button>
                  </div>
                </div>
              </div>

              {/* Ekran Ayarları */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <Monitor size={14} className="text-cyan-400" />
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Ekran & HUD</span>
                </div>
                <ToggleOption label="Tarama Çizgileri" enabled={scanlines} onToggle={handleScanlinesToggle} />
                <ToggleOption label="Yüksek Kontrast" enabled={highContrast} onToggle={handleHighContrastToggle} />
              </div>

              {/* Güvenlik & Test */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <AlertOctagon size={14} className="text-red-500" />
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Sistem Testi</span>
                </div>
                <button
                  onClick={() => { onClose(); triggerAlertSimulation(); }}
                  className="w-full p-4 bg-red-600/10 border border-red-600/40 text-red-500 text-[10px] font-black tracking-[4px] hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3"
                >
                  <Zap size={14} className="fill-current" />
                  KIRMIZI ALARM SİMÜLASYONU
                </button>
                <button
                  onClick={downloadSystemData}
                  className="w-full p-4 bg-white/5 border border-white/10 text-slate-400 text-[10px] font-black tracking-[4px] hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                >
                  <Download size={14} />
                  SİSTEM VERİLERİNİ AKTAR (JSON)
                </button>
              </div>
            </div>

            <div className="p-6 border-t border-white/5 bg-black/40 text-center">
              <span className="text-[8px] font-mono text-slate-600 uppercase tracking-[4px]">Solar Observer // Siber_OS v1.0.1</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Yardımcı Bileşenler
const ToggleOption = ({ label, enabled, onToggle }) => (
  <div onClick={onToggle} className="flex items-center justify-between p-4 bg-black/40 border border-white/5 cursor-pointer hover:border-cyan-500/20 transition-all">
    <span className="text-[11px] font-bold text-slate-200 uppercase">{label}</span>
    <div className={`w-10 h-5 rounded-full relative ${enabled ? 'bg-cyan-500/30' : 'bg-white/10'}`}>
      <motion.div animate={{ x: enabled ? 20 : 2 }} className={`absolute top-1 w-3 h-3 rounded-full ${enabled ? 'bg-cyan-400 shadow-[0_0_10px_#00f3ff]' : 'bg-slate-600'}`} />
    </div>
  </div>
);

export default SettingsPanel;
