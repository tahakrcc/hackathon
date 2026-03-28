import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Info, Zap, Settings, HelpCircle } from 'lucide-react';

const RiskAnalysis = ({ score = 0, cmeEvents = [] }) => {
  const getRiskStatus = (s) => {
    if (s >= 75) return { label: 'CRITICAL', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/50' };
    if (s >= 50) return { label: 'HIGH RISK', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/50' };
    if (s >= 25) return { label: 'MODERATE', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/50' };
    return { label: 'NOMINAL', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/50' };
  };

  const status = getRiskStatus(score);

  return (
    <div className="flex flex-col gap-6">
      <div className={`p-6 rounded-2xl glass ${status.border} ${status.bg} border-t-4`}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Risk Assessment</h3>
            <p className={`text-2xl font-black ${status.color}`}>{status.label}</p>
          </div>
          <div className={`${status.bg} p-2 rounded-lg`}>
            {score >= 50 ? <AlertTriangle className={status.color} /> : <Shield className={status.color} />}
          </div>
        </div>

        {/* Gauge Visualization */}
        <div className="relative h-4 w-full bg-slate-800 rounded-full overflow-hidden mb-4">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            className={`absolute top-0 left-0 h-full ${score >= 75 ? 'bg-red-500' : score >= 50 ? 'bg-orange-500' : 'bg-green-500'}`}
          />
        </div>
        
        <div className="flex justify-between text-[10px] font-bold text-slate-500">
          <span>0 (QUIET)</span>
          <span>100 (STORM)</span>
        </div>
      </div>

      {/* AI AI Insights */}
      <div className="glass p-6 rounded-2xl border border-slate-800/50">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Zap size={14} className="text-orange-500" />
          AI Analysis Engine
        </h3>
        
        <div className="space-y-4">
          <div className="flex gap-4 p-3 rounded-xl bg-slate-900/50 border border-slate-800/30">
            <Info size={16} className="text-blue-400 mt-1" />
            <p className="text-xs text-slate-400 leading-relaxed">
              {score > 60 
                ? "Geomagnetic disturbance confirmed at L1. Magnetosphere compression expected within 4-8 hours."
                : "Solar wind parameters remain stable. No immediate threat of Carrington-class events detected."}
            </p>
          </div>

          {cmeEvents.length > 0 && (
            <div className="border-l-2 border-orange-500 pl-4 py-1">
              <p className="text-[10px] font-bold text-orange-500 mb-1">EARLY WARNING: CME DETECTED</p>
              <p className="text-[11px] text-slate-300">
                Latest event ID: {cmeEvents[0].activityID}. ETA: ~2.5 days.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Systems Status */}
      <div className="grid grid-cols-2 gap-4">
        <SystemIndicator label="Power Grid" status={score > 80 ? "Critical" : score > 50 ? "Caution" : "Stable"} color={score > 80 ? "red" : score > 50 ? "orange" : "green"} />
        <SystemIndicator label="GPS/GNSS" status={score > 70 ? "Unreliable" : "Operational"} color={score > 70 ? "red" : "green"} />
      </div>
    </div>
  );
};

const SystemIndicator = ({ label, status, color }) => (
  <div className="p-4 rounded-xl glass border border-slate-800/50">
    <p className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">{label}</p>
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full bg-${color}-500 animate-pulse`} />
      <span className="text-xs font-bold">{status}</span>
    </div>
  </div>
);

export default RiskAnalysis;
