import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Info, Zap } from 'lucide-react';

const RiskAnalysis = ({ score = 0, cmeEvents = [], aiAnalysis = null }) => {
  const getRiskStatus = (s) => {
    if (s >= 75) return { label: 'KRİTİK', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/50' };
    if (s >= 50) return { label: 'YÜKSEK RİSK', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/50' };
    if (s >= 25) return { label: 'ORTA', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/50' };
    return { label: 'NORMAL', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/50' };
  };

  const getAIAnalysisText = (ai) => {
    if (!ai) return "Yapay Zeka modülü veri topluyor. Keras LSTM modeli uyanış sürecinde...";
    if (ai.level === "CRITICAL") return `Kritik jeomanyetik fırtına uyarısı! Beklenen Sym/H: ${ai.predicted_symh.toFixed(1)} nT. Manyetosfer çökme riski yüksek, şebekeleri korumaya alın.`;
    if (ai.level === "WARNING") return `Orta ölçekli fırtına (Sym/H: ${ai.predicted_symh.toFixed(1)} nT) tahmin ediliyor. Kutup altı bölgelerde iletişim kopuklukları yaşanabilir.`;
    return `Güneş faaliyetleri stabil. Tahmini Sym/H: ${ai.predicted_symh.toFixed(1)} nT. Herhangi bir plazma tehlikesi saptanmadı.`;
  };

  const status = getRiskStatus(score);

  return (
    <div className="flex flex-col gap-6">
      <div className={`p-6 glass ${status.border} ${status.bg} border-t-4`}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Risk Değerlendirmesi</h3>
            <p className={`text-2xl font-black ${status.color}`}>{status.label}</p>
          </div>
          <div className={`${status.bg} p-2 flex items-center justify-center`}>
            {score >= 50 ? <AlertTriangle className={status.color} /> : <Shield className={status.color} />}
          </div>
        </div>

        {/* Gösterge Çubuğu */}
        <div className="relative h-4 w-full bg-slate-800 rounded-full overflow-hidden mb-4">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            className={`absolute top-0 left-0 h-full ${score >= 75 ? 'bg-red-500' : score >= 50 ? 'bg-orange-500' : 'bg-green-500'}`}
          />
        </div>
        
        <div className="flex justify-between text-[10px] font-bold text-slate-500">
          <span>0 (SAKİN)</span>
          <span>100 (FIRTINA)</span>
        </div>
      </div>

      {/* AI Analiz Motoru */}
      <div className="glass p-6 border border-slate-800/50">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Zap size={14} className="text-orange-500" />
          AI Analiz Motoru
        </h3>
        
        <div className="space-y-4">
          <div className="flex gap-4 p-3 bg-slate-900/50 border border-slate-800/30">
            <Info size={16} className="text-blue-400 mt-1 shrink-0" />
            <p className="text-xs text-slate-400 leading-relaxed">
              {getAIAnalysisText(aiAnalysis)}
            </p>
          </div>

          {aiAnalysis && (
            <div className="flex justify-between items-center px-4 py-2 bg-slate-900/40 rounded-sm">
              <span className="text-[10px] text-slate-400 tracking-widest uppercase">Sentinel_AI_Confidence</span>
              <span className="text-xs font-mono text-blue-400">{aiAnalysis.confidence}%</span>
            </div>
          )}

          {cmeEvents.length > 0 && (
            <div className="border-l-2 border-orange-500 pl-4 py-1">
              <p className="text-[10px] font-bold text-orange-500 mb-1">ERKEN UYARI: CME TESPİT EDİLDİ</p>
              <p className="text-[11px] text-slate-300">
                Son olay: {cmeEvents[0].activityID}. Tahmini varış: ~2.5 gün.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sistem Durumu */}
      <div className="grid grid-cols-2 gap-4">
        <SystemIndicator label="Elektrik Şebekesi" status={score > 80 ? "Kritik" : score > 50 ? "Dikkat" : "Kararlı"} color={score > 80 ? "red" : score > 50 ? "orange" : "green"} />
        <SystemIndicator label="GPS/GNSS" status={score > 70 ? "Güvenilmez" : "Çalışıyor"} color={score > 70 ? "red" : "green"} />
      </div>
    </div>
  );
};

const SystemIndicator = ({ label, status, color }) => (
  <div className="p-4 glass border border-slate-800/50">
    <p className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-tighter">{label}</p>
    <div className="flex items-center gap-2">
      <div className={`w-1.5 h-1.5 rounded-full bg-${color}-500 animate-pulse`} />
      <span className="text-xs font-bold">{status}</span>
    </div>
  </div>
);

export default RiskAnalysis;
