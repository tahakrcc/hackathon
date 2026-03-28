import React from 'react';
import { motion } from 'framer-motion';

const CommandWidget = ({ children, title, icon: Icon, sensorId = "NOAA-16", latency = "12ms", status = "STABLE" }) => {
  const isAlert = status === 'CRITICAL' || status === 'HIGH' || status === 'ANALYZING';
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="glass group relative overflow-hidden border border-white/10 bg-black/40 flex flex-row"
    >
      {/* TACTICAL SIDE ACCENT BAR */}
      <div className={`w-1.5 self-stretch ${isAlert ? 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]' : 'bg-blue-500/30'} transition-all duration-700`} />
      
      <div className="flex-1 p-5 relative">
        {/* TOP METADATA BAR */}
        <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-2">
          <div className="flex items-center gap-3">
            <div className={`w-1.5 h-1.5 ${isAlert ? 'bg-orange-500 animate-pulse' : 'bg-blue-400'} shadow-sm`} />
            <span className="text-[7px] tech-header text-slate-500 tracking-[2px]">SYS_MOD_V4.4 // {sensorId}</span>
          </div>
          <div className="text-[6px] mono-info text-slate-700 uppercase tracking-widest whitespace-nowrap">
            LATENCY: {latency} // CH_LINK: ACTIVE
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="relative z-10">
          {title && (
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[10px] tech-header text-white flex items-center gap-2 tracking-[3px]">
                {Icon && <Icon size={12} className="text-orange-500" />}
                {title}
              </h3>
              <div className="px-2 py-0.5 border border-white/10 bg-white/5">
                <span className="text-[7px] tech-header text-slate-400">{status}</span>
              </div>
            </div>
          )}
          <div className="content-area min-h-[100px]">
            {children}
          </div>
        </div>

        {/* BOTTOM METADATA / COORD AXIS */}
        <div className="mt-6 pt-2 border-t border-white/5 flex justify-between items-center opacity-20 group-hover:opacity-40 transition-opacity">
           <span className="text-[6px] tech-header text-slate-500">REF_TK_SNTL_CMD_HUB</span>
           <div className="flex gap-4">
             <span className="text-[6px] mono-info text-slate-500">X: 124.992</span>
             <span className="text-[6px] mono-info text-slate-500">Y: 882.001</span>
           </div>
        </div>
      </div>

      {/* HARDWARE BRACES (SHARP L-SHAPES) */}
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white/5 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white/5 pointer-events-none" />
      
      {/* SCAN EFFECT Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/[0.03] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[3000ms] pointer-events-none" />
    </motion.div>
  );
};

export default CommandWidget;
