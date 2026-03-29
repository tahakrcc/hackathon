import { create } from 'zustand';
import axios from 'axios';
import { 
  fetchHelioviewerImage, 
  fetchXRayFlux, 
  fetchSolarWindPlasma, 
  fetchSolarWindMag, 
  fetchKpIndex, 
  fetchAuroraData, 
  fetchCMEEvents,
  fetchRiskScore,
  fetchAiPrediction,
  fetchSatelliteRisks
} from '../api/solarApi';

export const useSolarStore = create((set, get) => ({
  xrayFlux: [],
  solarWind: [],
  solarMag: [],
  kpIndex: [],
  auroraData: null,
  cmeEvents: [],
  sunImage: '',
  riskScore: 0,
  riskData: null, 
  aiAnalysis: null,
  satelliteData: [],
  loading: false,
  error: null,
  lastUpdate: null,
  wsConnected: false,

  // Mail & Alıcı Yönetimi (DB Senkronize)
  recipientMails: [], 

  // Alarm Simülasyon Durumu
  alertState: { active: false, countdown: 0, data: null },

  fetchRecipients: async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/mail/recipients');
      set({ recipientMails: response.data || [] });
    } catch (err) {
      console.error('[MAIL_DB] Alıcılar çekilemedi:', err);
    }
  },

  addRecipientMail: async (mail) => {
    const current = get().recipientMails;
    if (mail && !current.includes(mail) && mail.includes('@')) {
      try {
        await axios.post('http://localhost:8080/api/mail/recipients', mail, {
          headers: { 'Content-Type': 'text/plain' }
        });
        set({ recipientMails: [...current, mail] });
      } catch (err) {
        console.error('[MAIL_DB] Alıcı eklenemedi:', err);
      }
    }
  },

  removeRecipientMail: async (mail) => {
    try {
      await axios.delete(`http://localhost:8080/api/mail/recipients?email=${mail}`);
      set({ recipientMails: get().recipientMails.filter(m => m !== mail) });
    } catch (err) {
      console.error('[MAIL_DB] Alıcı silinemedi:', err);
    }
  },

  triggerAlertSimulation: () => {
    set({ alertState: { active: false, countdown: 3, data: null } });
    
    const timer = setInterval(() => {
      set((state) => {
        const current = state.alertState.countdown;
        if (current > 1) {
          return { alertState: { ...state.alertState, countdown: current - 1 } };
        } else {
          clearInterval(timer);
          const alertData = {
            intensity: "X8.9 (Extremely High)",
            timestamp: new Date().toISOString(),
            aiComment: "Kritik radyasyon sızıntısı tespit edildi. Manyetosfer çökme riski %94. Operasyon güvenliği tehlikede.",
            impactTime: "T+15:42 Dakika",
            affectedSystems: "GPS, Iridium, Global Power Grids"
          };

          get().sendAlertMail(alertData);

          return { 
            alertState: { 
              active: true, 
              countdown: 0, 
              data: alertData
            } 
          };
        }
      });
    }, 1000);
  },

  sendAlertMail: async (alertData) => {
    const mails = get().recipientMails;
    if (mails.length === 0) return;

    try {
      await axios.post('http://localhost:8080/api/mail/send-alert', {
        recipients: mails,
        intensity: alertData.intensity,
        aiComment: alertData.aiComment,
        impactTime: alertData.impactTime
      });
      console.log('[MAIL] Alert mail sent successfully to:', mails);
    } catch (err) {
      console.error('[MAIL] Failed to send alert email:', err);
    }
  },

  clearAlert: () => set({ alertState: { active: false, countdown: 0, data: null } }),

  downloadSystemData: () => {
    const data = {
      timestamp: new Date().toISOString(),
      xrayFlux: get().xrayFlux,
      solarWind: get().solarWind,
      solarMag: get().solarMag,
      kpIndex: get().kpIndex,
      satelliteData: get().satelliteData,
      riskScore: get().riskScore,
      aiAnalysis: get().aiAnalysis
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SolarSentinel_Export_${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  connectWebSocket: () => {
    const ws = new WebSocket('ws://localhost:8080/ws/solar-feed');
    
    ws.onopen = () => {
      console.log('[WS] Connected to Solar Observer Live Feed');
      set({ wsConnected: true, error: null });
    };

    ws.onmessage = (event) => {
      try {
        const dashboard = JSON.parse(event.data);
        const riskScore = dashboard.riskScore?.score || get().riskScore;

        set((state) => ({ 
          xrayFlux: dashboard.xrayFlux?.length ? dashboard.xrayFlux : state.xrayFlux, 
          solarWind: dashboard.solarWind?.length ? dashboard.solarWind : state.solarWind, 
          solarMag: dashboard.solarMag?.length ? dashboard.solarMag : state.solarMag, 
          kpIndex: dashboard.kpIndex?.length ? dashboard.kpIndex : state.kpIndex, 
          auroraData: dashboard.auroraData || state.auroraData, 
          cmeEvents: dashboard.cmeEvents?.length ? dashboard.cmeEvents : state.cmeEvents, 
          riskScore,
          riskData: dashboard.riskScore || state.riskData,
          satelliteData: dashboard.type === 'SATELLITE_ALERT' ? [...state.satelliteData] : (dashboard.satelliteData || state.satelliteData),
          lastUpdate: new Date(),
          error: null
        }));
      } catch (err) {
        console.error('[WS] Hata (Parse): ', err);
      }
    };

    ws.onclose = () => {
      console.log('[WS] Disconnected.');
      set({ wsConnected: false });
      setTimeout(() => get().connectWebSocket(), 10000);
    };

    ws.onerror = (err) => {
      console.error('[WS] Error: ', err);
      set({ wsConnected: false });
    };
  },

  updateData: async () => {
    set({ loading: true });
    try {
      const results = await Promise.allSettled([
        fetchHelioviewerImage(),
        fetchXRayFlux(),
        fetchSolarWindPlasma(),
        fetchSolarWindMag(),
        fetchKpIndex(),
        fetchAuroraData(),
        fetchCMEEvents(),
        fetchRiskScore(),
        fetchAiPrediction(),
        fetchSatelliteRisks()
      ]);

      const [
        sunImage, xrayFlux, solarWind, solarMag, kpIndex, 
        auroraData, cmeEvents, riskScoreData, aiAnalysisData, satelliteData
      ] = results.map(r => r.status === 'fulfilled' ? r.value : null);

      const riskScore = riskScoreData?.score || 10;

      set({ 
        sunImage: typeof sunImage === 'string' ? sunImage : get().sunImage, 
        xrayFlux: xrayFlux || [], 
        solarWind: solarWind || [], 
        solarMag: solarMag || [], 
        kpIndex: kpIndex || [], 
        auroraData, 
        cmeEvents: cmeEvents || [], 
        riskScore,
        riskData: riskScoreData || null,
        aiAnalysis: aiAnalysisData,
        satelliteData: satelliteData || [],
        lastUpdate: new Date(),
        loading: false 
      });
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Store güncelleme başarısız:", err);
    }
  }
}));
