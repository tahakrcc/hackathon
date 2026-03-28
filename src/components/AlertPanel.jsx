import React from 'react';
import { AlertTriangle, Info, Wind, Radio } from 'lucide-react';
import { motion } from 'framer-motion';

const alerts = [
  { id: 1, type: 'G-Scale', level: 'G1', status: 'Moderate', time: '12:45', icon: Wind, color: 'var(--accent-green)' },
  { id: 2, type: 'R-Scale', level: 'R2', status: 'High', time: '10:20', icon: Radio, color: 'var(--accent-orange)' },
  { id: 3, type: 'S-Scale', level: 'S0', status: 'Normal', time: '09:15', icon: AlertTriangle, color: 'var(--text-secondary)' },
];

const AlertPanel = () => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <h3 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '2px' }}>
          REAL-TIME ALERTS
        </h3>
        <Info size={14} className="text-slate-500" />
      </div>

      {alerts.map((alert, idx) => (
        <motion.div 
          key={alert.id}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: idx * 0.1 }}
          className="glass p-4 flex items-center justify-between group cursor-pointer hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg" style={{ background: `${alert.color}22` }}>
              <alert.icon size={18} style={{ color: alert.color }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{alert.type}</span>
                <span style={{ fontSize: '0.7rem', color: alert.color, fontWeight: 800 }}>{alert.level}</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{alert.status}</p>
            </div>
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{alert.time}</span>
        </motion.div>
      ))}
    </div>
  );
};

export default AlertPanel;
