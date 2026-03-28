import React from 'react';
import { motion } from 'framer-motion';
import { Crosshair, Target, Zap } from 'lucide-react';

const SolarOverlay = ({ imageUrl, riskScore }) => {
  return (
    <div className="relative w-full h-[500px] flex items-center justify-center rounded-2xl overflow-hidden glass border border-slate-800/50 group">
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt="Sun Live" 
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-1000 grayscale hover:grayscale-0"
        />
      ) : (
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <Zap className="animate-pulse" size={48} />
          <p className="text-xs font-bold tracking-[4px]">SYNCING WITH HELIOVIEWER...</p>
        </div>
      )}

      {/* Dynamic Overlays */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Scanning lines */}
        <div className="absolute inset-0 bg-scanline opacity-[0.05] pointer-events-none" />
        
        {/* Active Regions (Simulated spots) */}
        {riskScore > 40 && (
          <>
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute top-1/3 left-1/4"
            >
              <Target size={32} className="text-red-500" />
              <div className="absolute -top-6 -left-6 text-[8px] font-black text-red-500 bg-black/80 px-1 py-0.5 rounded border border-red-500/50">
                ACTIVE REGION 3590
              </div>
            </motion.div>

            <motion.div 
              animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="absolute bottom-1/4 right-1/3"
            >
              <Crosshair size={24} className="text-orange-500" />
              <div className="absolute -top-6 -left-6 text-[8px] font-black text-orange-500 bg-black/80 px-1 py-0.5 rounded border border-orange-500/50">
                FLARE ORIGIN: M-CLASS
              </div>
            </motion.div>
          </>
        )}

        {/* HUD Elements */}
        <div className="absolute top-6 left-6 flex flex-col gap-1">
          <p className="text-[10px] font-bold text-slate-400">IMAGING FREQUENCY: <span className="text-white">171 Å</span></p>
          <p className="text-[10px] font-bold text-slate-400">RESOLUTION: <span className="text-white">4096 x 4096</span></p>
        </div>

        <div className="absolute bottom-6 right-6 text-right">
          <p className="text-[10px] font-bold text-slate-500 mb-1">DATA SOURCE: NASA SDO / HELIOVIEWER</p>
          <div className="flex items-center gap-2 justify-end">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-black text-white">LIVE DATA FEED</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolarOverlay;
