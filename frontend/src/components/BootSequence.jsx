import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BootSequence = ({ onComplete }) => {
  const [logs, setLogs] = useState([]);
  const fullLogs = [
    "LOG: KERNEL_INIT_SUCCESS",
    "NET: NASA_DONKI_SYNC_ESTABLISHED",
    "NET: NOAA_SWPC_STREAM_ESTABLISHED",
    "IMG: HELIO_V2_PROJECTION_READY",
    "SYS: SOLAR_SENTINEL_V2_ELITE_ONLINE",
  ];

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      if (current < fullLogs.length) {
        setLogs(prev => [...prev, fullLogs[current]]);
        current++;
      } else {
        clearInterval(interval);
        setTimeout(onComplete, 800);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[2000] bg-[#05070a] flex flex-col items-center justify-center font-mono"
    >
      <div className="w-80">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <h2 className="text-orange-500 text-xs font-black tracking-[4px] uppercase">Booting System</h2>
        </div>
        
        <div className="space-y-2">
          {logs.map((log, i) => (
            <motion.p 
              key={i}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-[10px] text-slate-500 font-bold"
            >
              {log}
            </motion.p>
          ))}
        </div>

        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="h-[1px] bg-orange-500/30 w-full mt-8 origin-left"
        />
      </div>
    </motion.div>
  );
};

export default BootSequence;
