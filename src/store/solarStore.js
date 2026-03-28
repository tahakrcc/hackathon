import { create } from 'zustand';
import { 
  fetchHelioviewerImage, 
  fetchXRayFlux, 
  fetchSolarWindPlasma, 
  fetchSolarWindMag, 
  fetchKpIndex, 
  fetchAuroraData, 
  fetchCMEEvents 
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
  loading: false,
  error: null,
  lastUpdate: null,

  updateData: async () => {
    set({ loading: true });
    try {
      // Fetch data in parallel
      const results = await Promise.allSettled([
        fetchHelioviewerImage(),
        fetchXRayFlux(),
        fetchSolarWindPlasma(),
        fetchSolarWindMag(),
        fetchKpIndex(),
        fetchAuroraData(),
        fetchCMEEvents()
      ]);

      const [sunImage, xrayFlux, solarWind, solarMag, kpIndex, auroraData, cmeEvents] = results.map(r => r.status === 'fulfilled' ? r.value : []);

      const riskScore = get().calculateRiskScore(xrayFlux, solarWind, solarMag, kpIndex, cmeEvents);

      set({ 
        sunImage: typeof sunImage === 'string' ? sunImage : get().sunImage, 
        xrayFlux, 
        solarWind, 
        solarMag, 
        kpIndex, 
        auroraData, 
        cmeEvents, 
        riskScore,
        lastUpdate: new Date(),
        loading: false 
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  calculateRiskScore: (xray, wind, mag, kp, cme) => {
    let score = 5; // Base score (Quiet background)

    // X-Ray Flux impact (Solar Flares)
    if (xray.length > 0) {
      const latestFlux = parseFloat(xray[xray.length - 1].flux);
      if (latestFlux > 1e-4) score += 40; // X-class
      else if (latestFlux > 1e-5) score += 25; // M-class
      else if (latestFlux > 1e-6) score += 10; // C-class
    }

    // Solar Wind speed impact
    if (wind.length > 0) {
      const latestWind = wind[wind.length - 1];
      const speed = parseFloat(latestWind.speed);
      if (speed > 800) score += 25;
      else if (speed > 600) score += 15;
      else if (speed > 450) score += 5;
    }

    // Magnetic field Bz impact (Southward Bz is the primary driver of geomagnetic storms)
    if (mag.length > 0) {
      const latestMag = mag[mag.length - 1];
      const bz = parseFloat(latestMag.bz_gsm);
      if (bz < -20) score += 20;
      else if (bz < -10) score += 10;
      else if (bz < -5) score += 5;
    }

    // Kp Index impact
    if (kp.length > 0) {
      const latestKp = parseFloat(kp[kp.length - 1].kp_index);
      if (latestKp >= 8) score += 20;
      else if (latestKp >= 5) score += 10;
    }

    // CME impact
    if (cme.length > 0) {
      // Impact score based on number of active events
      score += Math.min(cme.length * 5, 20);
    }

    return Math.min(score, 100);
  }
}));
