import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, Activity, Brain } from 'lucide-react';

const RiskAnalysis = ({ score, cmeEvents, aiAnalysis }) => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  
  const reports = React.useMemo(() => [
    {
      title: 'JEOMANYETİK_ANALİZ',
      content: aiAnalysis ? `Tahmini SYM-H sapması: ${aiAnalysis.predicted_symh || '-'} nT. Güven aralığı: %${aiAnalysis.confidence || '90'}. Uyarı Seviyesi: ${aiAnalysis.level || 'STABİL'}.` : 'L1 derin uydu yörünge taraması devam ediyor. Olası jeomanyetik geçişler izleniyor.',
      stat: `GÜVEN: %${aiAnalysis?.confidence || '92'}`
    },
    {
      title: 'GÜNEŞ_AKTİVİTESİ',
      content: cmeEvents?.length > 0 ? `Son 24 saatte ${cmeEvents.length} KKA olayı tespit edildi. Kaynak bölge: ${cmeEvents[0].sourceLocation || 'Aktif Bölge'}. Etki bekleniyor.` : 'Güneş lekesi aktivitesi düşük seyrediyor. Kritik bir patlama kaydedilmedi.',
      stat: `OLAY: ${cmeEvents?.length || 0} KKA`
    },
    {
      title: 'SİSTEM_SAĞLIĞI',
      content: 'DSCOVR ve ACE uyduları tam kapasite çalışıyor. Veri gecikmesi: 12ms. Yapay zeka çekirdeği optimize edildi ve tarama modunda.',
      stat: 'DURUM: AKTİF'
    }
  ], [aiAnalysis, cmeEvents]);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % reports.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [reports.length]);

  const getRiskLevel = (s) => {
    if (s >= 75) return { label: 'KRİTİK', color: 'magenta', icon: AlertTriangle };
    if (s >= 50) return { label: 'YÜKSEK', color: 'yellow', icon: AlertTriangle };
    if (s >= 25) return { label: 'ORTA', color: 'yellow', icon: Activity };
    return { label: 'STABİL', color: 'cyan', icon: CheckCircle };
  };

  const risk = getRiskLevel(score);
  const neonColor = risk.color === 'magenta' ? 'neon-text-magenta' : (risk.color === 'yellow' ? 'neon-text-yellow' : 'neon-text-cyan');
  // Mat Renkler (Tactical Palette)
  const hexColor = risk.color === 'magenta' ? '#e11d48' : (risk.color === 'yellow' ? '#fbbf24' : '#38bdf8');

  return (
    <div className="flex flex-col gap-6 h-full text-slate-200">
      
      {/* GÖSTERGE ALET */}
      <div className="flex flex-col items-center gap-4 relative py-2">
        <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" style={{ color: hexColor }}>
                <circle cx="56" cy="56" r="50" stroke="rgba(255,255,255,0.03)" strokeWidth="4" fill="transparent" />
                <motion.circle 
                    cx="56" cy="56" r="50" 
                    stroke={`currentColor`} 
                    strokeWidth="4" 
                    fill="transparent" 
                    initial={{ strokeDasharray: "0 314" }}
                    animate={{ strokeDasharray: `${(score / 100) * 314} 314` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-black tabular-nums tracking-tighter ${neonColor}`}>{score}</span>
                <span className={`text-[7px] tech-header text-slate-500 tracking-[4px] uppercase font-black`}>RİSK_SVY</span>
            </div>
        </div>

        <div className={`px-4 py-2 border border-white/5 bg-black/50 flex flex-col items-center gap-1 w-full max-w-[160px]`}>
            <div className="flex items-center gap-2">
               <risk.icon size={12} className={`${neonColor} ${score > 50 ? 'animate-pulse' : ''}`} />
               <span className={`text-[12px] font-black uppercase tracking-widest ${neonColor}`}>{risk.label}</span>
            </div>
            <span className="text-[7px] tech-header text-slate-500 uppercase font-black">TEHDİT SEVİYESİ</span>
        </div>
      </div>

      {/* YAPAY ZEKA TEŞHİS TERMİNALİ */}
      <div className="flex-1 flex flex-col gap-3">
        <div className="flex items-center gap-3 border-b border-white/10 pb-2">
            <Brain size={14} className="neon-text-cyan opacity-40" />
            <span className="text-[10px] font-black text-neon-cyan uppercase tracking-widest">{reports[activeIndex].title}</span>
        </div>
        
        <div className="flex-1 bg-black/40 p-5 relative group overflow-hidden border-l-2 border-neon-cyan/40">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeIndex}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col gap-3"
              >
                  <p className="text-[12px] mono-info text-slate-300 leading-relaxed font-sans font-black min-h-[60px] opacity-80">
                     "{reports[activeIndex].content}"
                  </p>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                     <div className="flex gap-1.5">
                        {reports.map((_, i) => (
                          <div 
                            key={i} 
                            onClick={() => setActiveIndex(i)}
                            className={`h-1 transition-all duration-300 cursor-pointer ${activeIndex === i ? 'w-6 bg-neon-cyan' : 'w-2 bg-white/10 hover:bg-white/30'}`} 
                          />
                        ))}
                     </div>
                     <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{reports[activeIndex].stat}</span>
                  </div>
              </motion.div>
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default RiskAnalysis;
