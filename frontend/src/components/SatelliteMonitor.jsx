import React from 'react';
import { motion } from 'framer-motion';
import { Radio, Shield, AlertTriangle, Activity } from 'lucide-react';
import CyberCard from './CyberCard';

/**
 * Uydu İzleme ve Sağlık Paneli.
 * Backend'den gelen risk puanlarına göre uyduların durumunu görselleştirir.
 */
const SatelliteMonitor = ({ satellites = [] }) => {
  const getRiskColor = (score) => {
    if (score < 30) return 'text-emerald-400';
    if (score < 70) return 'text-yellow-400';
    return 'text-red-500 font-bold animate-pulse';
  };

  const getStatusLabel = (score) => {
    if (score < 30) return 'NOMİNAL';
    if (score < 70) return 'RİSKLİ';
    return 'KRİTİK';
  };

  return (
    <CyberCard title="UYDU_STRATEJİK_HABERLEŞME_AĞI" icon={<Radio className="w-5 h-5" />}>
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {satellites.length === 0 ? (
          <div className="text-gray-500 text-center py-20 italic font-mono text-sm">
            [BAĞLANTI_KURULUYOR] <br/> CelesTrak yörünge verileri taranıyor...
          </div>
        ) : (
          satellites.map((sat, idx) => (
            <motion.div
              key={sat.objectName || idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="p-3 border border-white/5 bg-white/5 rounded-lg flex items-center justify-between hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full bg-black/40 border border-white/5 ${getRiskColor(sat.riskScore)}`}>
                  {sat.riskScore > 70 ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : (
                    <Shield className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
                <div>
                  <h4 className="text-[12px] font-bold text-white tracking-widest uppercase mb-0.5">
                    {sat.OBJECT_NAME || sat.objectName}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-gray-500 font-mono">
                      ID: {sat.OBJECT_ID || sat.objectId}
                    </span>
                    <span className="w-1 h-1 bg-gray-700 rounded-full" />
                    <span className="text-[9px] text-gray-500 font-mono">
                      CAT: {sat.NORAD_CAT_ID || sat.noradCatId}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-[9px] font-bold mb-1 tracking-tighter ${getRiskColor(sat.riskScore)}`}>
                  {getStatusLabel(sat.riskScore)}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-gray-900 rounded-full overflow-hidden border border-white/5 shadow-inner">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${sat.riskScore}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full ${
                        sat.riskScore > 70 ? 'bg-gradient-to-r from-red-600 to-red-400' : 
                        sat.riskScore > 30 ? 'bg-gradient-to-r from-yellow-600 to-yellow-400' : 
                        'bg-gradient-to-r from-emerald-600 to-emerald-400'
                      }`}
                    />
                  </div>
                  <span className="text-[11px] text-white font-mono font-bold w-10">
                    %{sat.riskScore.toFixed(1)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
      
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-mono uppercase tracking-[0.2em]">
        <div className="flex items-center gap-2">
          <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
          <span>Sistem Durumu: Çevrimiçi</span>
        </div>
        <div>
          İzlenen Birim: {satellites.length}
        </div>
      </div>
    </CyberCard>
  );
};

export default SatelliteMonitor;
