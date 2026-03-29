import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Activity, Zap, Clock, Bell, Database } from 'lucide-react';
import { fetchRiskEvents } from '../api/solarApi';

const NotificationPanel = ({ isOpen, onClose, cmeEvents = [], riskScore = 0, lastUpdate }) => {
  const [dbRiskEvents, setDbRiskEvents] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchRiskEvents().then(events => setDbRiskEvents(events || []));
    }
  }, [isOpen]);
  const getRiskColor = (i) => {
    if (i % 5 === 0) return 'magenta';
    if (i % 3 === 0) return 'yellow';
    return 'cyan';
  };

  const getRiskLabel = (color) => {
    if (color === 'magenta') return 'KRİTİK';
    if (color === 'yellow') return 'YÜKSEK';
    return 'ARTMIŞ';
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '--';
    try {
      const d = new Date(timeStr);
      return d.toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeStr;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Arka plan overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[3000] backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 w-[420px] max-w-[90vw] h-full bg-cyber-bg border-l border-neon-cyan/20 z-[3001] flex flex-col overflow-hidden"
          >
            {/* Panel Başlığı */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-neon-cyan/20 bg-black/40">
              <div className="flex items-center gap-3">
                <div className="p-2 border border-neon-cyan bg-neon-cyan/5">
                  <Bell size={18} className="neon-text-cyan" />
                </div>
                <div>
                  <h2 className="text-sm font-black tracking-[3px] uppercase neon-text-cyan">Bildirimler</h2>
                  <p className="text-[8px] tech-header text-slate-500 mt-1">{cmeEvents.length} AKTİF UYARI</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-neon-magenta transition-colors border border-white/5 hover:border-neon-magenta/30"
              >
                <X size={18} />
              </button>
            </div>

            {/* Durum Özeti */}
            <div className="px-6 py-4 border-b border-white/5 bg-black/20">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-3 bg-black/40 border border-white/5">
                  <span className="text-[8px] tech-header text-slate-500">RİSK</span>
                  <span className={`text-2xl font-black tabular-nums ${riskScore > 50 ? 'neon-text-magenta' : (riskScore > 25 ? 'neon-text-yellow' : 'neon-text-cyan')}`}>{riskScore}</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-black/40 border border-white/5">
                  <span className="text-[8px] tech-header text-slate-500">OLAY</span>
                  <span className="text-2xl font-black tabular-nums neon-text-cyan">{cmeEvents.length}</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-black/40 border border-white/5">
                  <span className="text-[8px] tech-header text-slate-500">DURUM</span>
                  <span className={`text-[11px] font-black ${riskScore > 50 ? 'neon-text-magenta' : 'neon-text-cyan'}`}>{riskScore > 50 ? 'ALARM' : 'İZLENİYOR'}</span>
                </div>
              </div>
            </div>

            {/* Bildirim Listesi */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {cmeEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4 px-8">
                  <Activity size={48} className="text-slate-700" />
                  <p className="text-sm text-center font-medium">Aktif bildirim bulunmuyor</p>
                  <p className="text-[10px] text-center text-slate-600">Güneş aktivitesi sakin. Sistem izlemeye devam ediyor.</p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {/* Live CME Events - Sorted by Time (Newest First) */}
                  {[...cmeEvents]
                    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
                    .slice(0, 15)
                    .map((evt, i) => {
                      const color = getRiskColor(i);
                      const hexColor = color === 'magenta' ? '#ff003c' : (color === 'yellow' ? '#fcee0a' : '#00f3ff');

                      return (
                        <motion.div
                          key={i}
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="p-4 bg-black/40 border border-white/5 hover:border-neon-cyan/30 transition-all group cursor-pointer"
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-1 p-1.5" style={{ border: `1px solid ${hexColor}30`, background: `${hexColor}10` }}>
                              {color === 'magenta' ? <AlertTriangle size={14} style={{ color: hexColor }} /> : <Zap size={14} style={{ color: hexColor }} />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-bold text-slate-200">{evt.activityID}</span>
                                <span
                                  className="text-[7px] font-black uppercase px-2 py-[2px]"
                                  style={{ background: `${hexColor}20`, color: hexColor }}
                                >
                                  {getRiskLabel(color)}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 leading-relaxed mb-2">
                                {evt.note ? evt.note.substring(0, 120) + '...' : 'Koronal kütle atımı tespit edildi. Jeomanyetik etki analizi devam ediyor.'}
                              </p>
                              <div className="flex items-center gap-2 text-slate-600">
                                <Clock size={10} />
                                <span className="text-[9px] mono-info">{formatTime(evt.startTime)}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* DB Risk Olayları */}
            {dbRiskEvents.length > 0 && (
              <div className="px-4 pb-4">
                <div className="flex items-center gap-2 mb-3 px-2">
                  <Database size={12} className="neon-text-yellow" />
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[2px]">Alarm Geçmişi (DB)</span>
                </div>
                <div className="space-y-2">
                  {dbRiskEvents.slice(0, 10).map((evt, i) => {
                    const evtColor = evt.riskLevel === 'CRITICAL' ? '#ff003c' : (evt.riskLevel === 'HIGH_RISK' ? '#fbbf24' : '#00f3ff');
                    const evtLabel = evt.riskLevel === 'CRITICAL' ? 'KRİTİK' : (evt.riskLevel === 'HIGH_RISK' ? 'YÜKSEK' : 'ORTA');
                    return (
                      <div key={i} className="p-3 bg-black/40 border border-white/5">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <AlertTriangle size={10} style={{ color: evtColor }} />
                            <span className="text-[9px] font-black" style={{ color: evtColor }}>{evtLabel}</span>
                            <span className="text-[10px] font-bold text-slate-300 tabular-nums">Skor: {evt.riskScore}</span>
                          </div>
                          <span className="text-[8px] text-slate-600">{evt.triggerSource}</span>
                        </div>
                        <p className="text-[9px] text-slate-500">{evt.description}</p>
                        <div className="flex items-center gap-1 mt-1 text-slate-600">
                          <Clock size={8} />
                          <span className="text-[8px] mono-info">
                            {evt.triggeredAt ? new Date(evt.triggeredAt).toLocaleString('tr-TR') : '--'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Alt Bilgi */}
            <div className="px-6 py-3 border-t border-white/5 bg-black/40 flex justify-between items-center">
              <span className="text-[8px] tech-header text-slate-500">
                SON GÜNCELLEME: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString('tr-TR') : '--:--'}
              </span>
              <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-1.5 h-1.5 bg-neon-cyan/60" />
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;
