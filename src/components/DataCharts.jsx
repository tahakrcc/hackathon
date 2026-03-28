import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { time: '00:00', flux: 1.2, mag: 4.5 },
  { time: '04:00', flux: 1.4, mag: 4.8 },
  { time: '08:00', flux: 2.1, mag: 5.2 },
  { time: '12:00', flux: 3.5, mag: 6.8 },
  { time: '16:00', flux: 2.8, mag: 6.2 },
  { time: '20:00', flux: 2.4, mag: 5.8 },
  { time: '23:59', flux: 2.2, mag: 5.5 },
];

const DataCharts = ({ title, dataKey, color }) => {
  return (
    <div className="glass p-6 h-64 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {title}
        </h3>
        <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: `${color}22`, color }}>
          LIVE
        </span>
      </div>
      
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={color} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff11" />
            <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
            <Tooltip 
              contentStyle={{ background: '#0f172a', border: '1px solid #ffffff11', borderRadius: '8px' }}
              itemStyle={{ color }}
            />
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={color} 
              fillOpacity={1} 
              fill={`url(#color${dataKey})`} 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DataCharts;
