import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const DataCharts = ({ title, data, dataKey, dataKeys, color = "#00a3ad", unit = "" }) => {
  const keys = useMemo(() => dataKeys || [dataKey], [dataKey, dataKeys]);
  const [activeKeyIndex, setActiveKeyIndex] = useState(0);
  const [updateFlash, setUpdateFlash] = useState(false);

  // Otomatik Döngü (10 Saniye)
  useEffect(() => {
    if (keys.length <= 1) return;
    const timer = setInterval(() => {
      setActiveKeyIndex((prev) => (prev + 1) % keys.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [keys.length]);

  // Veri Güncelleme Efekti (Flash)
  useEffect(() => {
    if (data && data.length > 0) {
      setUpdateFlash(true);
      const timer = setTimeout(() => setUpdateFlash(false), 800);
      return () => clearTimeout(timer);
    }
  }, [data]);

  const currentKey = keys[activeKeyIndex];

  return (
    <div className="w-full h-full flex flex-col group/chart relative">
      {/* UPDATE FLASH OVERLAY */}
      <AnimatePresence>
        {updateFlash && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.05 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white pointer-events-none z-50 transition-opacity"
          />
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center mb-2 px-1">
        <div className="flex flex-col">
          <h4 className="text-[9px] tech-header text-slate-500 tracking-[3px] uppercase font-black">
            {title || 'SENSÖR_VERİSİ'}
          </h4>
          <span className="text-[7px] font-black text-neon-cyan opacity-60 uppercase tracking-widest">
            {currentKey.replace('_gsm', '').toUpperCase()} KATMANI
          </span>
        </div>
        
        {/* INTERACTIVE DOTS (PAGING) */}
        {keys.length > 1 && (
          <div className="flex gap-1.5 bg-black/40 px-2 py-1 border border-white/5">
            {keys.map((_, i) => (
              <button 
                key={i}
                onClick={() => setActiveKeyIndex(i)}
                className={`w-3 h-[2px] transition-all duration-300 ${activeKeyIndex === i ? 'bg-neon-cyan' : 'bg-white/10 hover:bg-white/30'}`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 relative min-h-0">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentKey}
            initial={{ x: 10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -10, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id={`grad-${currentKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.15}/>
                    <stop offset="95%" stopColor={color} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  vertical={false} 
                  stroke="rgba(255,255,255,0.01)" 
                />
                <XAxis dataKey="time_tag" hide={true} />
                <YAxis 
                  stroke="rgba(255,255,255,0.2)" 
                  fontSize={7} 
                  tickFormatter={(val) => `${val}${unit}`}
                  fontFamily="JetBrains Mono"
                  fontWeight="bold"
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0b0e14', 
                    border: `1px solid rgba(255,255,255,0.1)`,
                    borderRadius: '0px',
                    fontSize: '9px',
                    fontFamily: 'JetBrains Mono',
                    fontWeight: 'bold',
                    color: '#fff',
                    boxShadow: `0 10px 30px rgba(0,0,0,0.8)`
                  }}
                  itemStyle={{ color: color, fontWeight: 'bold' }}
                  labelStyle={{ display: 'none' }}
                  cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: "4 4", opacity: 0.3 }}
                />
                <Area 
                  type="monotone" 
                  dataKey={currentKey} 
                  stroke={color} 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill={`url(#grad-${currentKey})`} 
                  animationDuration={800}
                  dot={false}
                  activeDot={{ r: 3, stroke: color, strokeWidth: 1, fill: '#0b0e14' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </AnimatePresence>
        
        {/* CHART HUD OVERLAY */}
        <div className="absolute bottom-1 right-1 opacity-10 pointer-events-none">
           <div className="flex gap-1">
              <div className="w-1 h-2 bg-white/10" />
              <div className="w-1 h-3 bg-white/20" />
           </div>
        </div>
      </div>
    </div>
  );
};

export default DataCharts;
