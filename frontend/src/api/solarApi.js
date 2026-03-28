import axios from 'axios';

// All endpoints now point to our Spring Boot backend proxy

export const fetchHelioviewerImage = async () => {
  try {
    const response = await axios.get('/api/solar/image');
    return response.data; // Expected to return the image URL string
  } catch (error) {
    console.error('Error fetching Helioviewer image from backend:', error);
    return 'https://api.helioviewer.org/v2/takeScreenshot/?date=2024-01-01T00:00:00Z&sourceId=14&imageScale=2.4&x0=0&y0=0&width=1000&height=1000';
  }
};

export const fetchXRayFlux = async () => {
  try {
    const response = await axios.get('/api/solar/xray');
    return response.data;
  } catch (error) {
    console.error('Error fetching X-Ray flux from backend:', error);
    return [];
  }
};

export const fetchSolarWindPlasma = async () => {
  try {
    const response = await axios.get('/api/solar/wind');
    return response.data;
  } catch (error) {
    console.error('Error fetching Solar Wind Plasma from backend:', error);
    return [];
  }
};

export const fetchSolarWindMag = async () => {
  try {
    const response = await axios.get('/api/solar/mag');
    return response.data;
  } catch (error) {
    console.error('Error fetching Solar Wind Mag from backend:', error);
    return [];
  }
};

export const fetchKpIndex = async () => {
  try {
    const response = await axios.get('/api/solar/kp');
    return response.data;
  } catch (error) {
    console.error('Error fetching Kp Index from backend:', error);
    return [];
  }
};

export const fetchAuroraData = async () => {
  try {
    const response = await axios.get('/api/solar/aurora');
    return response.data;
  } catch (error) {
    console.error('Error fetching Aurora data from backend:', error);
    return null;
  }
};

export const fetchCMEEvents = async () => {
  try {
    const response = await axios.get('/api/solar/cme');
    return response.data;
  } catch (error) {
    console.error('Error fetching CME Events from backend:', error);
    return [];
  }
};

export const fetchRiskScore = async () => {
  try {
    const response = await axios.get('/api/risk/current');
    return response.data; // Expected to return { score, level, description, timestamp }
  } catch (error) {
    console.error('Error fetching Risk Score from backend:', error);
    return { score: 10, level: 'NORMAL', description: 'Network issue fallback' };
  }
};

export const fetchAiPrediction = async () => {
  try {
    const response = await axios.get('/api/ai/predict');
    return response.data; // Expected { predicted_symh, confidence, level }
  } catch (error) {
    console.error('Error fetching AI Prediction from backend:', error);
    return null;
  }
};
