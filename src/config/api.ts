// API Configuration
export const API_CONFIG = {
  // Backend API URL (deployed on Vercel - lightning fast!)
  BACKEND_URL: 'https://woztorrentz-47aqsv64x-beekorns-projects.vercel.app',
  
  // Torrent API URL (using Render for heavy scraping operations)
  TORRENT_API_URL: 'https://woztorrentz-backend.onrender.com',
  
  // Netlify site URL for fallback functions
  NETLIFY_URL: 'https://woztorrentz.netlify.app',
  
  // Local development URLs (for when developing locally)
  DEV: {
    BACKEND_URL: 'http://localhost:3002',
    TORRENT_API_URL: 'http://localhost:8011',
    NETLIFY_URL: 'http://localhost:8888'
  }
};

// Helper to get the correct API URL based on environment
export const getApiUrl = (type: 'backend' | 'torrent' | 'netlify' = 'backend'): string => {
  const isDev = import.meta.env.DEV;
  
  if (type === 'torrent') {
    return isDev ? API_CONFIG.DEV.TORRENT_API_URL : API_CONFIG.TORRENT_API_URL;
  }
  
  if (type === 'netlify') {
    return isDev ? API_CONFIG.DEV.NETLIFY_URL : API_CONFIG.NETLIFY_URL;
  }
  
  return isDev ? API_CONFIG.DEV.BACKEND_URL : API_CONFIG.BACKEND_URL;
};
