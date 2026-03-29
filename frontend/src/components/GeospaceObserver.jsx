import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, Radio, Shield, AlertTriangle, Activity, 
  ChevronRight, Cpu, Layers, Crosshair, Zap, Search, Target
} from 'lucide-react';

/**
 * Geospace Observer V2.0 - Mission Control (Strategic Hub).
 * Sol Kolon: Uydu Listesi & Filtreleme
 * Merkez: NASA Eyes 3D (Ana Görsel)
 * Sağ Kolon: Seçili Uydu Detaylı Telemetri Panelí
 */
const GeospaceObserver = ({ satellites = [] }) => {
  const [selectedID, setSelectedID] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [reportData, setReportData] = useState(null);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);

  // İlk açılışta ilk uyduyu seçili getir
  useEffect(() => {
    if (satellites.length > 0 && !selectedID) {
      setSelectedID(satellites[0].noradCatId);
    }
  }, [satellites, selectedID]);

  const selectedSat = satellites.find(s => (s.NORAD_CAT_ID || s.noradCatId) === selectedID) || satellites[0];
  const filteredSats = satellites
    .filter(s => 
      (s.OBJECT_NAME || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
      (s.NORAD_CAT_ID || "").toString().includes(searchTerm)
    )
    .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0));

  const getRiskColor = (score) => {
    if (score < 30) return 'text-emerald-400';
    if (score < 70) return 'text-yellow-400';
    return 'text-red-500 font-bold';
  };

  const handleGenerateReport = async () => {
    if (!selectedID) return;
    setIsReportLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/satellite/report/${selectedID}`);
      const data = await response.json();
      setReportData(data);
      setShowReport(true);
    } catch (error) {
      console.error("Rapor oluşturma hatası:", error);
    } finally {
      setIsReportLoading(false);
    }
  };

  return (
    <div className="w-full h-[800px] bg-black/40 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      
      {/* ÜST HEADER - MISSION STATUS */}
      <div className="h-16 border-b border-white/10 bg-white/5 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h2 className="text-sm font-black text-cyan-400 tracking-[0.3em] uppercase leading-none mb-1">
              Geospace_Mission_Control_Center
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[8px] text-gray-500 font-mono tracking-widest uppercase">ID: SENTINEL-HUB-01</span>
              <div className="w-1 h-1 bg-cyan-500 rounded-full animate-pulse" />
              <span className="text-[8px] text-emerald-500 font-mono tracking-widest uppercase">SİSTEM: ÇEVRİMİÇİ</span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8">
           <StatusMetric label="TARAMALI_BİRİM" value={satellites.length} />
           <StatusMetric label="KÜRESEL_TEHDİT" value={`%${Math.max(0, ...satellites.map(s => s.riskScore || 0)).toFixed(1)}`} warning />
           <div className="w-[1px] h-8 bg-white/10" />
           <div className="flex items-center gap-2">
              <div className="text-[9px] text-gray-500 font-mono uppercase text-right leading-tight">
                 STRATEJİK_HABERLEŞME_AĞI<br/>GÜVENLİ_ERİŞİM
              </div>
              <Shield className="w-5 h-5 text-cyan-400 opacity-50" />
           </div>
        </div>
      </div>

      {/* ANA 3-SÜTUNLU DİZEN */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SOL KOLON: UYDU LİSTESİ */}
        <div className="w-72 md:w-80 border-r border-white/10 bg-black/20 flex flex-col shrink-0">
          <div className="p-4 border-b border-white/10">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-hover:text-cyan-400 transition-colors" />
              <input 
                type="text" 
                placeholder="UYDU_ARA..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-xs font-mono text-white focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-gray-700"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
            {filteredSats.map((sat, idx) => (
              <motion.div
                key={sat.NORAD_CAT_ID || idx}
                onClick={() => setSelectedID(sat.NORAD_CAT_ID)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all duration-300 ${
                  selectedID === sat.NORAD_CAT_ID 
                  ? 'bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                  : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    sat.riskScore > 70 ? 'bg-red-500' : 'bg-emerald-500'
                  }`} />
                  <div className="truncate">
                    <div className="text-[11px] font-bold text-white tracking-widest uppercase truncate">{sat.OBJECT_NAME}</div>
                    <div className="text-[9px] text-gray-500 font-mono">ID: {sat.NORAD_CAT_ID}</div>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <div className={`text-[10px] font-bold font-mono ${getRiskColor(sat.riskScore)}`}>
                    %{sat.riskScore.toFixed(2)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* MERKEZ: NASA EYES 3D */}
        <div className="flex-1 bg-black relative flex flex-col overflow-hidden">
           <iframe 
              src="https://eyes.nasa.gov/apps/solar-system/#/earth?embed=true" 
              className="w-full h-full border-none opacity-80" 
              title="NASA Geospace Center"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
           />
           
           {/* HUD OVERLAY - KÖŞE VURGULARI */}
           <div className="absolute inset-0 pointer-events-none border-[16px] border-black/20" />
           <div className="absolute top-4 left-4 p-3 bg-black/60 border border-white/10 rounded-lg backdrop-blur-md">
              <div className="flex items-center gap-2 mb-1">
                 <Target className="w-3 h-3 text-red-500 animate-pulse" />
                 <span className="text-[9px] font-black text-white tracking-[0.2em]">O-SCAN_AKTİF</span>
              </div>
              <div className="text-[8px] text-gray-500 font-mono">JEOMANYETİK_ALAN_KATMANI_V4</div>
           </div>
        </div>

        {/* SAĞ KOLON: SEÇİLİ UYDU TELEMETRİSİ */}
        <div className="w-80 md:w-96 border-l border-white/10 bg-black/20 flex flex-col shrink-0">
          <AnimatePresence mode='wait'>
            {selectedSat ? (
              <motion.div 
                key={selectedSat.NORAD_CAT_ID}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar"
              >
                <div className="mb-8">
                  <div className="text-[10px] text-cyan-400 font-mono tracking-[0.3em] uppercase mb-4 border-b border-cyan-500/20 pb-2 flex items-center justify-between">
                    <span>Telemetri_Verileri</span>
                    <Activity className="w-3 h-3" />
                  </div>
                  <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2 leading-tight">
                    {selectedSat.OBJECT_NAME}
                  </h3>
                  <div className="flex items-center gap-3 p-2 bg-white/5 border border-white/10 rounded-lg">
                    <div className="p-2 bg-black/40 rounded border border-white/5">
                       <Radio className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-[9px] text-gray-500 uppercase">Görüldüğü_Zaman</div>
                      <div className="text-xs font-mono text-white">{new Date(selectedSat.EPOCH).toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                   <MetricBox label="Eğim (INC)" value={`${selectedSat.INCLINATION?.toFixed(3)}°`} color="cyan" />
                   <MetricBox label="Hareket (M_MOT)" value={`${selectedSat.MEAN_MOTION?.toFixed(2)}`} color="emerald" />
                   <MetricBox label="Dış_Merkezlik" value={`${selectedSat.ECCENTRICITY?.toFixed(6)}`} color="yellow" />
                   <MetricBox label="Çıkış_Düğümü" value={`${selectedSat.RA_OF_ASC_NODE?.toFixed(3)}°`} color="purple" />
                </div>

                <div className="mt-auto space-y-6">
                   <div className="bg-black/40 border border-white/10 p-4 rounded-xl relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-2 opacity-20 group-hover:opacity-100 transition-opacity">
                         <Shield className={`w-4 h-4 ${selectedSat.riskScore > 70 ? 'text-red-500' : 'text-emerald-500'}`} />
                      </div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest mb-3">RİSK_ANALİZ_SKORU</div>
                      <div className="flex items-end justify-between mb-2">
                         <span className={`text-4xl font-black font-mono leading-none ${getRiskColor(selectedSat.riskScore)}`}>
                            %{selectedSat.riskScore.toFixed(2)}
                         </span>
                         <span className="text-[9px] text-gray-500 uppercase font-mono">SEVİYE: {selectedSat.riskScore > 70 ? 'KRİTİK' : 'NORMAL'}</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-900 rounded-full border border-white/5 overflow-hidden">
                         <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${selectedSat.riskScore}%` }}
                            className={`h-full ${selectedSat.riskScore > 70 ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`}
                         />
                      </div>
                   </div>

                   <button 
                      onClick={handleGenerateReport}
                      disabled={isReportLoading}
                      className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white text-[10px] font-black uppercase tracking-[0.4em] rounded-xl transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)] hover:shadow-[0_0_30px_rgba(8,145,178,0.5)] active:scale-95 disabled:opacity-50"
                   >
                      {isReportLoading ? 'HESAPLANIYOR...' : 'Detaylı_Rapor_Oluştur'}
                   </button>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-10 text-center">
                 <div className="space-y-4">
                    <div className="w-12 h-12 border-2 border-dashed border-white/10 rounded-full mx-auto animate-spin-slow" />
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">Veri Bekleniyor...</span>
                 </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* STRATEJİK RİSK RAPORU MODALI (MISSION BRIEFING) */}
      <AnimatePresence>
        {showReport && reportData && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-2xl bg-slate-900 border-2 border-cyan-500/30 rounded-3xl shadow-[0_0_100px_rgba(6,182,212,0.2)] overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* MODAL HEADER */}
              <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-cyan-500/20 rounded-xl">
                      <Shield className="w-6 h-6 text-cyan-400" />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-white tracking-widest uppercase mb-1">Stratejik_Risk_Analizi</h3>
                      <div className="text-[9px] text-cyan-500/60 font-mono uppercase tracking-[0.3em]">MISSION_BRIEFING_DOC_{reportData.noradId}</div>
                   </div>
                </div>
                <button 
                  onClick={() => setShowReport(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400"
                >
                  <Zap className="w-6 h-6 rotate-45" />
                </button>
              </div>

              {/* MODAL CONTENT */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                
                {/* İKAZ SEVİYESİ */}
                <div className="flex items-center justify-between p-4 bg-black/40 border border-white/10 rounded-2xl">
                   <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">MEVCUT_İKAZ_SEVİYESİ</span>
                      <span className={`text-2xl font-black font-mono tracking-tighter ${
                        reportData.overallRiskScore > 70 ? 'text-red-500' : 'text-emerald-500'
                      }`}>
                        {reportData.alertLevel}
                      </span>
                   </div>
                   <div className="text-right">
                      <span className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">RİSK_SKORU</span>
                      <div className={`text-3xl font-black font-mono ${getRiskColor(reportData.overallRiskScore)}`}>
                        %{reportData.overallRiskScore.toFixed(1)}
                      </div>
                   </div>
                </div>

                {/* 2 KOLON: KONUM VE GÜNEŞ BAĞLAMI */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-4">
                      <h4 className="text-[11px] font-bold text-cyan-400 uppercase tracking-[0.2em] border-l-2 border-cyan-500 pl-3">Konum_Analizi</h4>
                      <div className="space-y-2">
                         <ReportItem label="Enlem" value={`${reportData.locationAnalysis.LAT.toFixed(2)}°`} />
                         <ReportItem label="İrtifa" value={`${reportData.locationAnalysis.ALT.toFixed(0)} km`} />
                         <ReportItem label="Kutup Bölgesi" value={reportData.locationAnalysis.IS_POLAR ? 'EVET (KRİTİK)' : 'HAYIR'} warning={reportData.locationAnalysis.IS_POLAR} />
                         <ReportItem label="Radyasyon Kuşağı" value={reportData.locationAnalysis.IN_RADIATION_BELT ? 'İÇİNDE' : 'DIŞINDA'} warning={reportData.locationAnalysis.IN_RADIATION_BELT} />
                      </div>
                   </div>
                   <div className="space-y-4">
                      <h4 className="text-[11px] font-bold text-yellow-400 uppercase tracking-[0.2em] border-l-2 border-yellow-500 pl-3">Güneş_Havası_Bağlamı</h4>
                      <div className="space-y-2">
                         <ReportItem label="KP İndeksi" value={reportData.solarContext.KP_INDEX} />
                         <ReportItem label="Aktif Patlama (CME)" value={reportData.solarContext.CME_ACTIVITY} warning={reportData.solarContext.CME_ACTIVITY > 0} />
                         <ReportItem label="X-Ray Akış" value={reportData.solarContext.XRAY_FLUX} />
                      </div>
                   </div>
                </div>

                {/* STRATEJİK ÖNERİ - EN ÖNEMLİ KISIM */}
                <div className={`p-6 border-l-4 rounded-r-2xl ${
                  reportData.overallRiskScore > 70 ? 'bg-red-500/10 border-red-500' : 'bg-cyan-500/10 border-cyan-500'
                }`}>
                   <div className="flex items-center gap-3 mb-3 text-white uppercase font-black tracking-widest text-xs">
                      <Activity className="w-5 h-5 shrink-0" />
                      STRATEJİK_OPERASYON_DİREKTİFİ
                   </div>
                   <p className="text-sm font-mono leading-relaxed text-gray-200">
                      {reportData.strategicRecommendation}
                   </p>
                </div>

              </div>

              {/* MODAL FOOTER */}
              <div className="p-6 bg-black/40 border-t border-white/10 flex justify-between items-center text-[9px] tech-header text-slate-500 italic">
                 <span>VERİ_KAYNAĞI: STRATEJİK_RİSK_MOTORU_V2.1</span>
                 <span>TIMESTAMP: {reportData.timestamp}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ReportItem = ({ label, value, warning }) => (
  <div className="flex justify-between items-center p-2 bg-white/5 rounded-lg border border-white/5">
     <span className="text-[9px] text-gray-500 uppercase tracking-widest">{label}</span>
     <span className={`text-[10px] font-mono font-bold ${warning ? 'text-red-500' : 'text-white'}`}>{value}</span>
  </div>
);

const StatusMetric = ({ label, value, warning }) => (
  <div className="flex flex-col items-end">
    <span className="text-[8px] text-gray-600 uppercase tracking-widest mb-1">{label}</span>
    <span className={`text-base font-black font-mono leading-none ${warning ? 'text-red-500' : 'text-white'}`}>{value}</span>
  </div>
);

const MetricBox = ({ label, value, color }) => {
  const colorMap = {
    cyan: 'text-cyan-400 border-cyan-500/20',
    emerald: 'text-emerald-400 border-emerald-500/20',
    yellow: 'text-yellow-400 border-yellow-500/20',
    purple: 'text-purple-400 border-purple-500/20'
  };
  
  return (
    <div className={`p-3 border rounded-xl bg-white/5 ${colorMap[color]}`}>
       <div className="text-[8px] text-gray-500 uppercase mb-1">{label}</div>
       <div className={`text-sm font-bold font-mono tracking-tight leading-none`}>{value}</div>
    </div>
  );
};

export default GeospaceObserver;
