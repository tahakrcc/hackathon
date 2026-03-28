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
