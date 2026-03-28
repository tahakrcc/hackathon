import React from 'react';
import { motion } from 'framer-motion';

const CyberCard = ({ 
  children, 
  title, 
  icon: Icon, 
  sensorId = "SİBER_L1", 
  status = "ÇEVRİMİÇİ", 
  color = "cyan", 
  latency = "12ms" 
}) => {
  // Cyberpunk renk eşlemeleri
  const neonColorClass = color === 'magenta' ? 'neon-text-magenta' : 
                         (color === 'yellow' ? 'neon-text-yellow' : 'neon-text-cyan');
  
  const borderColorClass = color === 'magenta' ? 'border-[#ff003c]' : 
                           (color === 'yellow' ? 'border-[#fcee0a]' : 'border-[#00f3ff]');

  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`cyber-panel group flex flex-col`}
    >
      {/* PARLAYAN ÜST KENAR AKSAN */}
      <div className={`w-full h-[2px] ${color === 'magenta' ? 'bg-[#ff003c]' : (color === 'yellow' ? 'bg-[#fcee0a]' : 'bg-[#00f3ff]')} opacity-80 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_currentColor]`} style={{ color: color === 'magenta' ? '#ff003c' : (color === 'yellow' ? '#fcee0a' : '#00f3ff') }} />
      
      {/* BAŞLIK ÇUBUĞU */}
      <div className="flex justify-between items-center px-5 py-3 border-b border-white/5 bg-black/40">
        <div className="flex items-center gap-3">
          {Icon && <Icon size={16} className={neonColorClass} />}
          {title && <h3 className={`text-sm tracking-[3px] font-bold uppercase ${neonColorClass}`}>{title}</h3>}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[9px] tech-header text-slate-400">{sensorId}</span>
          <div className={`px-2 py-0.5 border ${borderColorClass} bg-black/50 text-[8px] font-black uppercase ${neonColorClass}`}>
            {status}
          </div>
        </div>
      </div>

      {/* İÇERİK ALANI */}
      <div className="flex-1 p-5 relative z-10 flex flex-col">
        {children}
      </div>

      {/* ALT TELEMETRİ */}
      <div className="px-5 pb-3 pt-2 border-t border-white/5 flex justify-between items-end opacity-60">
        <div className="flex gap-4">
           <div className="flex flex-col">
             <span className="text-[7px] tech-header text-slate-500">GECİKME</span>
             <span className="text-[10px] mono-info text-slate-300">{latency}</span>
           </div>
           <div className="flex flex-col border-l border-white/10 pl-4">
             <span className="text-[7px] tech-header text-slate-500">AĞ</span>
             <span className="text-[10px] mono-info text-slate-300">GÜVENLİ</span>
           </div>
        </div>
        <div className="flex gap-1 mb-1">
          {[1,2,3,4,5].map(i => (
              <div key={i} className={`w-1.5 h-1.5 ${i <= 4 ? (color === 'magenta' ? 'bg-[#ff003c]/80' : (color === 'yellow' ? 'bg-[#fcee0a]/80' : 'bg-[#00f3ff]/80')) : 'bg-slate-800'}`} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default CyberCard;
