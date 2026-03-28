import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BootSequence = ({ onComplete }) => {
  const [logs, setLogs] = useState([]);
  const [percent, setPercent] = useState(0);
  
  const fullLogs = [
    "LOG: ÇEKİRDEK_BAŞLATILDI",
    "AĞ: YUKARI_BAĞLANTI_KURULDU",
    "AĞ: NOAA_VERİ_AKIŞI_AKTİF",
    "GRF: HOLOGRAM_PROJEKSİYON_HAZIR",
    "SİS: GÜNEŞ_OS_SİBER_DEVREDE",
    "GÜV: SİNİRSEL_KORUMA_AKTİF",
    "YTK: ERİŞİM_VERİLDİ"
  ];

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      if (current < fullLogs.length) {
        setLogs(prev => [...prev, fullLogs[current]]);
        setPercent(Math.round(((current + 1) / fullLogs.length) * 100));
        current++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 1000);
      }
    }, 250);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-cyber-bg flex flex-col items-center justify-center font-sans overflow-hidden"
    >
      <div className="w-96 relative pt-12">
        {/* ÜST DURUM */}
        <div className="flex items-center justify-between mb-8 border-b border-neon-cyan/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-4 rounded-none bg-neon-cyan shadow-[0_0_10px_#00f3ff]" />
            <h2 className="neon-text-cyan text-sm font-black tracking-[6px] uppercase">SİSTEM_YÜKLEYICI</h2>
          </div>
          <span className="text-[12px] font-black neon-text-cyan tabular-nums">{percent}%</span>
        </div>
        
        {/* KAYIT AKIŞI */}
        <div className="space-y-3 min-h-[180px]">
          <AnimatePresence mode="popLayout">
            {logs.map((log, i) => (
              <motion.div 
                key={log}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="flex items-center gap-4"
              >
                <div className="w-[2px] h-3 bg-neon-cyan/80 shadow-[0_0_5px_#00f3ff]" />
                <p className="text-[10px] tech-header text-slate-200 tracking-[3px] uppercase">
                  {log}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* İLERLEME ÇUBUĞU */}
        <div className="relative h-[4px] w-full bg-black border border-neon-cyan/20 mt-10 overflow-hidden">
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: percent / 100 }}
            className="absolute inset-0 bg-neon-cyan shadow-[0_0_15px_#00f3ff] origin-left"
          />
        </div>
        
        {/* ALT BİLGİ */}
        <div className="mt-6 flex justify-between items-center opacity-40">
           <span className="text-[8px] tech-header text-neon-cyan uppercase tracking-[5px]">SİBER_OS_v1.0</span>
           <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">YÜKLEME_KAYIT_DÜĞÜM_029</span>
        </div>
      </div>
    </motion.div>
  );
};

export default BootSequence;
