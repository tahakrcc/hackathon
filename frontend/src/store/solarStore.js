import { create } from 'zustand';
import { 
  fetchHelioviewerImage, 
  fetchXRayFlux, 
  fetchSolarWindPlasma, 
  fetchSolarWindMag, 
  fetchKpIndex, 
  fetchAuroraData, 
  fetchCMEEvents,
  fetchRiskScore,
  fetchAiPrediction
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
  riskData: null,   // Full risk object: { score, level, description, timestamp }
  aiAnalysis: null,
  loading: false,
  error: null,
  lastUpdate: null,
  wsConnected: false,

  connectWebSocket: () => {
    const ws = new WebSocket('ws://localhost:8080/ws/solar-feed');
    
    ws.onopen = () => {
      console.log('[WS] Connected to Solar Sentinel Live Feed');
      set({ wsConnected: true, error: null });
    };

    ws.onmessage = (event) => {
      try {
        const dashboard = JSON.parse(event.data);
        const riskScore = dashboard.riskScore?.score || get().riskScore;

        set((state) => ({ 
          // Update data only if new array has items, otherwise keep old
          xrayFlux: dashboard.xrayFlux?.length ? dashboard.xrayFlux : state.xrayFlux, 
          solarWind: dashboard.solarWind?.length ? dashboard.solarWind : state.solarWind, 
          solarMag: dashboard.solarMag?.length ? dashboard.solarMag : state.solarMag, 
          kpIndex: dashboard.kpIndex?.length ? dashboard.kpIndex : state.kpIndex, 
          auroraData: dashboard.auroraData || state.auroraData, 
          cmeEvents: dashboard.cmeEvents?.length ? dashboard.cmeEvents : state.cmeEvents, 
          riskScore,
          riskData: dashboard.riskScore || state.riskData,
          lastUpdate: new Date(),
          error: null
        }));
        console.log('[WS] Live Update Received', dashboard);
      } catch (err) {
        console.error('[WS] Hata (Parse): ', err);
      }
    };

    ws.onclose = () => {
      console.log('[WS] Disconnected. Fallback to HTTP Polling is recommended.');
      set({ wsConnected: false });
      // Reconnect after 10s if desired
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
        fetchAiPrediction()
      ]);

      const [
        sunImage, 
        xrayFlux, 
        solarWind, 
        solarMag, 
        kpIndex, 
        auroraData, 
        cmeEvents,
        riskScoreData,
        aiAnalysisData
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
        lastUpdate: new Date(),
        loading: false 
      });
    } catch (err) {
      set({ error: err.message, loading: false });
      console.error("Store güncelleme başarısız:", err);
    }
  }
}));
