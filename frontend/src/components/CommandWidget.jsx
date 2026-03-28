import React from 'react';
import { motion } from 'framer-motion';

const CommandWidget = ({ children, title, icon: Icon, sensorId = "SENTINEL_L1", latency = "8ms", status = "STABİL", color = "amber" }) => {
  const isAlert = status === 'KRİTİK' || status === 'YÜKSEK' || status === 'ANALİZ_EDİLİYOR';
  
  const accentColor = color === 'red' ? 'plasma-red' : (color === 'blue' ? 'ion-blue' : 'solar-amber');
  const glowClass = color === 'red' ? 'shadow-[0_0_15px_rgba(239,68,68,0.3)]' : (color === 'blue' ? 'shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'shadow-amber');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`glass group relative overflow-hidden border border-white/10 flex flex-col tactical-border ${glowClass}`}
    >
      {/* INDUSTRIAL HARDWARE MASK */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      
      {/* TACTICAL CORNERS */}
      <div className={`tactical-corner corner-tl opacity-40 group-hover:opacity-100 transition-opacity border-${accentColor}`} />
      <div className={`tactical-corner corner-tr opacity-20 group-hover:opacity-100 transition-opacity border-${accentColor}`} />
      <div className="tactical-corner corner-bl opacity-0 group-hover:opacity-40 transition-opacity border-white/20" />
      <div className="tactical-corner corner-br opacity-0 group-hover:opacity-40 transition-opacity border-white/20" />

      {/* TOP METADATA HUD */}
      <div className="flex justify-between items-center px-4 py-2 border-b border-white/5 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className={`w-1 h-1 rounded-full ${isAlert ? `bg-${accentColor} animate-pulse shadow-amber` : 'bg-slate-500'}`} />
          <span className="text-[8px] tech-header text-slate-300 tracking-[2px] uppercase truncate max-w-[140px]">
            {sensorId} // VERİ_AKIŞI
          </span>
        </div>
        <div className="flex gap-2">
            <div className="w-1 h-1 bg-white/10" />
            <div className="w-1 h-1 bg-white/20" />
            <div className="w-1 h-1 bg-white/10" />
        </div>
      </div>
      
      <div className="flex-1 p-4 relative flex flex-col">
        {/* HEADER AREA */}
        {title && (
          <div className={`flex items-center justify-between mb-3 border-b border-white/5 pb-2`}>
            <div className="flex flex-col gap-1">
              <h3 className="text-xs tech-header text-white tracking-[4px] flex items-center gap-3">
                {Icon && <Icon size={14} className={`text-${accentColor}`} />}
                {title}
              </h3>
              <p className="text-[7px] mono-info text-slate-400 uppercase tracking-widest">Sistem_Operasyon_Protokolü: 0.1</p>
            </div>
            <div className={`px-3 py-1 border border-white/5 bg-slate-900 tactical-border`}>
              <span className={`text-[8px] tech-header ${isAlert ? `text-${accentColor} glow-amber` : 'text-slate-300'}`}>{status}</span>
            </div>
          </div>
        )}

        {/* CONTENT AREA */}
        <div className="relative z-10 flex-1">
          {children}
        </div>

        {/* BOTTOM TELEMETRY DOCK */}
        <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-end opacity-60 group-hover:opacity-100 transition-all duration-500">
           <div className="flex gap-6">
             <div className="flex flex-col gap-1">
               <span className="text-[6px] tech-header text-slate-400 tracking-tighter">LATENCY</span>
               <span className="text-[9px] mono-info text-slate-300 tabular-nums">{latency}</span>
             </div>
             <div className="flex flex-col gap-1 border-l border-white/5 pl-4">
               <span className="text-[6px] tech-header text-slate-400 tracking-tighter">PROTOKOL</span>
               <span className={`text-[8px] tech-header text-${accentColor}`}>TLS_SEC</span>
             </div>
           </div>
           <div className="flex items-center gap-2">
              <div className="flex gap-1">
                  {[1,2,3,4].map(i => (
                      <div key={i} className={`w-1.5 h-[2px] ${i <= 3 ? `bg-${accentColor}/80` : 'bg-white/20'}`} />
                  ))}
              </div>
              <span className="text-[6px] tech-header text-slate-400">SIG_STR</span>
           </div>
        </div>
      </div>

      {/* SCAN EFFECT V5 */}
      <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-${accentColor}/[0.02] to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-[5000ms] pointer-events-none`} />
    </motion.div>
  );
};

export default CommandWidget;
