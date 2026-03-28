import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DataCharts = ({ title, data, dataKey, color, unit = "" }) => {
  // Extract latest value, handling potential string numbers from NOAA
  const latestValue = data.length > 0 ? parseFloat(data[data.length - 1][dataKey]).toFixed(2) : "---";

  return (
    <div className="glass p-6 h-64 flex flex-col gap-4 border border-slate-800/20 backdrop-blur-xl relative group overflow-hidden">
      {/* Decorative Glow */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 blur-[80px] opacity-20 pointer-events-none transition-all duration-700 group-hover:opacity-40`} style={{ background: color }} />

      <div className="flex items-center justify-between relative z-10">
        <div>
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[2px] mb-1">
            {title}
          </h3>
          <p className="text-xl font-black flex items-center gap-2">
            {data.length > 0 ? (
              <>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color }} />
                {latestValue} <span className="text-[10px] font-bold text-slate-500 ml-1">{unit}</span>
              </>
            ) : (
              <span className="text-slate-700 text-sm animate-pulse italic">SYNCING...</span>
            )}
          </p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800/50 uppercase tracking-tighter">
            Realtime Stream
          </span>
        </div>
      </div>
      
      <div className="flex-1 min-h-0 relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff03" />
            <XAxis 
              dataKey="time_tag" 
              hide={true}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 9, fill: '#334155', fontWeight: 700 }}
              domain={['auto', 'auto']}
              width={35}
            />
            <Tooltip 
              contentStyle={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
              itemStyle={{ color, fontWeight: 700 }}
              labelStyle={{ display: 'none' }}
              cursor={{ stroke: '#1e293b', strokeWidth: 1 }}
            />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              fillOpacity={1} 
              fill={`url(#gradient-${dataKey})`} 
              strokeWidth={2}
              animationDuration={1500}
              baseValue="auto"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DataCharts;
