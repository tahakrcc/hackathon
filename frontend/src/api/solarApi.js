import axios from 'axios';
import { format } from 'date-fns';

const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY';

// Utility to parse NOAA Array-of-Arrays format
const parseNoaaArray = (data) => {
  if (!data || data.length < 2) return [];
  const [headers, ...rows] = data;
  return rows.map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  });
};

export const fetchHelioviewerImage = async () => {
  try {
    const utcNow = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss'Z'");
    // Use takeScreenshot (v2) for browser-ready PNG/JPG
    // sourceId 14 is SDO/AIA 171 (User suggested)
    const url = `https://api.helioviewer.org/v2/takeScreenshot/?date=${utcNow}&sourceId=14&imageScale=2.4&x0=0&y0=0&width=1000&height=1000`;
    return url; // This returns the direct image stream
  } catch (error) {
    console.error('Error fetching Helioviewer image:', error);
    return 'https://api.helioviewer.org/v2/takeScreenshot/?date=2024-01-01T00:00:00Z&sourceId=14&imageScale=2.4&x0=0&y0=0&width=1000&height=1000';
  }
};

export const fetchXRayFlux = async () => {
  try {
    const response = await axios.get('https://services.swpc.noaa.gov/json/goes/primary/xrays-7-day.json');
    return response.data.filter(item => item.energy === '0.1-0.8nm').slice(-100); 
  } catch (error) {
    console.error('Error fetching X-Ray flux:', error);
    return [];
  }
};

export const fetchSolarWindPlasma = async () => {
  try {
    const response = await axios.get('https://services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json');
    return parseNoaaArray(response.data).slice(-100);
  } catch (error) {
    console.error('Error fetching Solar Wind Plasma:', error);
    return [];
  }
};

export const fetchSolarWindMag = async () => {
  try {
    const response = await axios.get('https://services.swpc.noaa.gov/products/solar-wind/mag-1-day.json');
    return parseNoaaArray(response.data).slice(-100);
  } catch (error) {
    console.error('Error fetching Solar Wind Mag:', error);
    return [];
  }
};

export const fetchKpIndex = async () => {
  try {
    const response = await axios.get('https://services.swpc.noaa.gov/json/planetary_k_index_1m.json');
    return response.data.slice(-20);
  } catch (error) {
    console.error('Error fetching Kp Index:', error);
    return [];
  }
};

export const fetchAuroraData = async () => {
  try {
    const response = await axios.get('https://services.swpc.noaa.gov/json/ovation_aurora_latest.json');
    return response.data;
  } catch (error) {
    console.error('Error fetching Aurora data:', error);
    return null;
  }
};

export const fetchCMEEvents = async () => {
  try {
    // DONKI CME endpoint with date range (last 7 days)
    const startDate = format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
    const endDate = format(new Date(), 'yyyy-MM-dd');
    const response = await axios.get(`https://api.nasa.gov/DONKI/CME?startDate=${startDate}&endDate=${endDate}&api_key=${NASA_API_KEY}`);
    return Array.isArray(response.data) ? response.data.slice(-10) : [];
  } catch (error) {
    console.error('Error fetching CME Events:', error);
    return [];
  }
};
