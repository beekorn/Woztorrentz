// API Configuration
export const API_CONFIG = {
  // Backend API URL (deployed on Render)
  BACKEND_URL: 'https://woztorrentz-backend.onrender.com',
  
  // Torrent API URL (if different)
  TORRENT_API_URL: 'https://woztorrentz-backend.onrender.com',
  
  // Local development URLs (for when developing locally)
  DEV: {
    BACKEND_URL: 'http://localhost:3002',
    TORRENT_API_URL: 'http://localhost:8011'
  }
};

// Helper to get the correct API URL based on environment
export const getApiUrl = (type: 'backend' | 'torrent' = 'backend'): string => {
  const isDev = import.meta.env.DEV;
  
  if (type === 'torrent') {
    return isDev ? API_CONFIG.DEV.TORRENT_API_URL : API_CONFIG.TORRENT_API_URL;
  }
  
  return isDev ? API_CONFIG.DEV.BACKEND_URL : API_CONFIG.BACKEND_URL;
};
