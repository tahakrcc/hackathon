import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldAlert, Cpu, Activity, Zap, XCircle, Terminal } from 'lucide-react';
import { useSolarStore } from '../store/solarStore';

const EmergencyAlert = () => {
  const { alertState, clearAlert } = useSolarStore();

  if (!alertState.active && alertState.countdown === 0) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-auto overflow-hidden">
      
      {/* 1. GERİ SAYIM EKRANI (COUNTDOWN) */}
      <AnimatePresence>
        {alertState.active === false && alertState.countdown > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center"
          >
            <motion.div 
              key={alertState.countdown}
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 12 }}
              className="text-[180px] font-black neon-text-magenta tracking-tighter"
            >
              {alertState.countdown}
            </motion.div>
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-neon-magenta animate-ping" />
                <span className="text-xl font-black text-white tracking-[10px] uppercase">Alarm_Tetikleniyor</span>
              </div>
              <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">Sistem Hazırlanıyor // Kritik Veri Enjeksiyonu</p>
            </div>
            
            {/* Alt Süslemeler */}
            <div className="absolute bottom-10 left-10 right-10 flex justify-between border-t border-white/10 pt-4">
              <span className="text-[10px] font-mono text-slate-600">ID: SIM-ERR-091</span>
              <span className="text-[10px] font-mono text-slate-600">KERNEL_BOOT_PHASE: 03</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. KIRMIZI ALARM EKRANI (ACTIVE ALERT) */}
      <AnimatePresence>
        {alertState.active && alertState.data && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-red-950/20 backdrop-blur-md flex items-center justify-center p-6"
          >
            {/* Yanıp Sönen Kırmızı Katman */}
            <motion.div 
               animate={{ opacity: [0.1, 0.4, 0.1] }}
               transition={{ duration: 1, repeat: Infinity }}
               className="absolute inset-0 bg-gradient-to-tr from-red-600/30 via-transparent to-red-600/30"
            />
            
            {/* Cyber Scanlines (Alarm Sürümü) */}
            <div className="absolute inset-0 pointer-events-none opacity-40 bg-[linear-gradient(rgba(255,0,0,0.1)_50%,transparent_50%)] bg-[length:100%_4px]" />

            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-4xl bg-black border-2 border-neon-magenta shadow-[0_0_80px_rgba(255,0,60,0.4)] relative overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="h-20 bg-neon-magenta flex items-center justify-between px-8 shrink-0">
                <div className="flex items-center gap-6">
                   <ShieldAlert size={32} className="text-white animate-pulse" />
                   <div className="flex flex-col">
                      <h2 className="text-2xl font-black text-white tracking-[8px] uppercase leading-none">Kırmızı_Alarm</h2>
                      <span className="text-[10px] font-bold text-black/60 uppercase tracking-wider">Hiyerarşi_Seviyesi: 01 (KRİTİK_TEHLİKE)</span>
                   </div>
                </div>
                <div className="flex flex-col items-end text-black font-black">
                   <span className="text-xl tabular-nums leading-none">{new Date(alertState.data.timestamp).toLocaleTimeString()}</span>
                   <span className="text-[10px] uppercase tracking-tighter">Sistem_Zamanı</span>
                </div>
              </div>

              {/* Content Grid */}
              <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar relative z-10">
                 
                 {/* 1. Üst Panel: Şiddet ve AI Yorumu */}
                 <div className="grid grid-cols-12 gap-10">
                    <div className="col-span-12 lg:col-span-4 flex flex-col gap-2">
                       <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest border-l-2 border-neon-magenta pl-3">Şiddet_Endeksi</label>
                       <div className="p-6 bg-white/5 border border-white/10 rounded">
                          <span className="text-4xl font-black neon-text-magenta tabular-nums">{alertState.data.intensity}</span>
                          <div className="w-full h-1 bg-white/5 mt-4 rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: '92%' }}
                               className="h-full bg-neon-magenta shadow-[0_0_10px_#ff003c]" 
                             />
                          </div>
                       </div>
                    </div>
                    <div className="col-span-12 lg:col-span-8 flex flex-col gap-2">
                       <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest border-l-2 border-neon-magenta pl-3">YZ_Stratejik_Analiz</label>
                       <div className="p-6 bg-neon-magenta/5 border border-neon-magenta/20 italic font-medium leading-relaxed text-slate-200">
                          "{alertState.data.aiComment}"
                       </div>
                    </div>
                 </div>

                 {/* 2. Detay Grid */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                       <h4 className="flex items-center gap-3 text-[12px] font-black text-white uppercase tracking-widest border-b border-white/10 pb-2">
                          <Activity size={16} className="text-neon-magenta" />
                          Zaman_Projeksiyonu
                       </h4>
                       <div className="flex justify-between items-center p-4 bg-white/5 border border-white/5">
                          <span className="text-[10px] text-slate-500 uppercase">Tahmini_Etki_Süresi</span>
                          <span className="text-lg font-black text-white tabular-nums">{alertState.data.impactTime}</span>
                       </div>
                       <div className="flex justify-between items-center p-4 bg-white/5 border border-white/5">
                          <span className="text-[10px] text-slate-500 uppercase">Veri_Kesinliği</span>
                          <span className="text-lg font-black text-emerald-400 tabular-nums">%98.4</span>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <h4 className="flex items-center gap-3 text-[12px] font-black text-white uppercase tracking-widest border-b border-white/10 pb-2">
                          <Zap size={16} className="text-neon-magenta" />
                          Etkilenen_Sistemler_Ağı
                       </h4>
                       <div className="p-4 bg-white/5 border border-white/5 flex flex-wrap gap-2 text-white">
                          {alertState.data.affectedSystems.split(', ').map((sys, i) => (
                             <span key={i} className="px-3 py-1 bg-neon-magenta/10 border border-neon-magenta/30 text-[10px] font-bold uppercase tracking-widest">
                                {sys}
                             </span>
                          ))}
                       </div>
                       <p className="text-[9px] text-slate-500 italic font-mono uppercase tracking-tighter">NOT: Yedek güç üniteleri devreye alınmalı, hassas yörünge manevraları durdurulmalıdır.</p>
                    </div>
                 </div>

                 {/* 3. Operasyonel Protokol */}
                 <div className="p-8 border-l-4 border-neon-magenta bg-white/5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-100 transition-opacity">
                       <Terminal size={40} className="text-white" />
                    </div>
                    <h5 className="text-[12px] font-black text-neon-magenta uppercase tracking-[4px] mb-4">ACİL_PROTOKOL_SENTINEL_v9</h5>
                    <div className="space-y-2 text-xs font-mono text-slate-400">
                       <p>1. Tüm sivil havacılık ve uydu operatörleri uyarılıyor...</p>
                       <p>2. Grid-Delta-4 frekansı üzerinden acil yayın başlatıldı.</p>
                       <p>3. Polar bölge uyduları 'Safe Mode' konumuna alınıyor.</p>
                    </div>
                 </div>
              </div>

              {/* Footer / Actions */}
              <div className="h-24 border-t border-white/10 bg-black/80 flex items-center justify-center gap-8 px-10 shrink-0">
                 <button 
                  onClick={clearAlert}
                  className="flex items-center gap-3 px-10 py-4 bg-white text-black text-xs font-black uppercase tracking-[5px] hover:bg-neon-magenta hover:text-white transition-all group scale-110 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                 >
                    <XCircle size={18} />
                    Sistemi_Sıfırla
                 </button>
                 <div className="w-[1px] h-10 bg-white/10" />
                 <div className="flex flex-col">
                    <span className="text-[8px] text-slate-600 uppercase font-mono">Status: MONITORING</span>
                    <span className="text-[8px] text-neon-magenta uppercase font-mono animate-pulse">Alert: SIMULATED_ACTIVE</span>
                 </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmergencyAlert;
