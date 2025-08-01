# Woztorrentz

🌐 **[LIVE DEMO - woztorrentz.netlify.app](https://woztorrentz.netlify.app)** 🌐

A comprehensive web-based platform for searching torrents and discovering movies/TV shows. The application combines TMDB movie/TV data with torrent scraping from multiple sources, plus a Top 100 section powered by Pirate Bay data. Features real-time movie data, intelligent IMDB linking, and multi-source torrent search.

---

## 🔗 Quick Links

- 🚀 **[Live Application](https://woztorrentz.netlify.app)** - Try it now!
- 📖 **[API Documentation](#-api-endpoints)** - Complete endpoint reference
- ⚡ **[Quick Setup](#setup-and-installation-windows)** - Get started in minutes
- 🚀 **[Deploy Your Own](#-deployment)** - Netlify deployment guide

## 🚀 Key Features

### 🎬 Movie & TV Discovery
- **TMDB Integration**: Live trending movies, popular content, and top-rated lists
- **TV Shows Support**: Browse popular and top-rated TV series
- **Real-time Updates**: Auto-refreshing content with live data from TMDB
- **Detailed Information**: Full movie/show details with posters, ratings, and descriptions

### 🏴‍☠️ Torrent Integration
- **Multi-Source Search**: Search torrents across LimeTorrents, Pirate Bay, and KickAss
- **Top 100 Real-Time**: Fetches top torrents from Pirate Bay via Render backend
- **Backup Solution**: Uses Netlify functions if backend is down
- **Magnet Links**: Direct download and copy functionality
- **Seeder/Leecher Info**: Real-time torrent health data

### 🎨 User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark Theme**: Modern dark UI with intuitive navigation
- **Quick Actions**: One-click torrent search, IMDB lookup, and streaming
- **Smart Ranking**: Properly numbered lists with ranking badges
- **Intelligent IMDB Integration**: Automatic IMDB search when direct links aren't available
- **Real-time Top100**: Fetches top torrents instantly from Pirate Bay via Render backend
- **Fallback System**: Uses Netlify functions when backend is unavailable
- **Fast Performance**: Optimized API calls with timeout handling and error recovery

### 🆕 Recent Improvements
- **Full Top100 Feature**: Live Top100 torrent lists with real seed/leech data
- **Render Deployment**: Backend deployed to Render for reliable data fetching
- **Enhanced Movie Data**: Now fetches 50 movies from TMDB with better error handling
- **Fixed IMDB Links**: Movie Database section now properly searches IMDB instead of redirecting to TMDB
- **Improved API Performance**: Optimized Netlify functions with proper timeout handling
- **Better Error Recovery**: Robust error handling and fallback mechanisms
- **Environment Variable Support**: Proper configuration for both local and production environments

## 🌐 API Endpoints

### Frontend Dropdown Options

The following movie lists are available in the frontend dropdown menu:

- **Trending Today** (`trending-daily`) - Movies currently trending today
- **Most Popular** (`popular`) - Most popular movies right now
- **Top Rated** (`top-rated`) - Highest rated movies of all time

### Complete Backend Endpoints

#### Movie Endpoints (TMDB)
The backend provides these movie endpoints:

- `GET /api/movies/trending-daily` - Get daily trending movies from TMDB
- `GET /api/movies/trending-weekly` - Get weekly trending movies from TMDB
- `GET /api/movies/popular` - Get currently popular movies from TMDB
- `GET /api/movies/top-rated` - Get top rated movies from TMDB
- `GET /api/movies/now-playing` - Get movies currently in theaters from TMDB
- `GET /api/movies/upcoming` - Get upcoming movies from TMDB

#### TV Show Endpoints (TMDB)
TV show data is also available:

- `GET /api/tv/popular` - Get currently popular TV shows from TMDB
- `GET /api/tv/top-rated` - Get top rated TV shows from TMDB

#### Torrent Search Endpoints (Python Backend)
Torrent search functionality:

- `GET /api/v1/search?site={site}&query={query}` - Search torrents on specific sites
  - Available sites: `limetorrents`, `piratebay`, `kickass`
- `GET /api/v1/top100/movies` - Get top 100 movies from Pirate Bay
- `GET /api/v1/top100/category/{category}` - Get top 100 by category (music, games, etc.)
- `GET /api/v1/top100/categories` - Get available categories

### Response Format

All movie endpoints return data in the following format:

```json
{
  "success": true,
  "data": [
    {
      "id": 12345,
      "title": "Movie Title",
      "overview": "Movie overview...",
      "posterUrl": "https://image.tmdb.org/...",
      "backdropUrl": "https://image.tmdb.org/...",
      "releaseDate": "2023-01-01",
      "voteAverage": 7.5,
      "voteCount": 1000,
      "genreIds": [12, 28, 53]
    }
  ],
  "lastUpdated": "2025-07-30T03:00:00.000Z",
  "source": "TMDB",
  "error": null
}
```

---

## Configuration

This project requires API keys from both The Movie Database (TMDB) and Render for server operation. You must create a `.env` file in the root of the project directory.

### `.env` File Setup

Create a file named `.env` in the project root and add the following keys:

```
TMDB_API_KEY=your_tmdb_api_key_here
PORT=8000  # Port used by backend server on Render
TMDB_API_KEY=94786bb06526502c891f050958db76e5 # This is a demo key for anyone to try```

-   **`TMDB_API_KEY`**: Used by the **backend** to get lists of popular and trending movies, as well as detailed movie information. This populates all the movie sections of the application. Get your key from [The Movie Database (TMDB) API](https://www.themoviedb.org/settings/api).

---

## 🏗️ Architecture

### Data Sources

- **TMDB (The Movie Database)**: Powers the trending movies, popular content, and TV show lists with official movie/show metadata, ratings, and images
- **Pirate Bay**: Provides the Top 100 torrent lists with real seeder/leecher data and magnet links
- **Multiple Torrent Sites**: LimeTorrents, KickAss, and Pirate Bay for comprehensive torrent search

### Components

#### Production Architecture:

1. **React Frontend** (`/src`) - **Deployed on Netlify**:
   - Live movie/TV browsing with auto-refresh
   - Top 100 torrent lists by category with smart fallback
   - Torrent search across multiple sites
   - Responsive dark theme UI
   - API failover logic (backend → fallback)

2. **Netlify Functions** (`/netlify/functions`) - **Serverless Fallback**:
   - TMDB API integration and data formatting
   - IMDB MovieMeter integration
   - Top100 categories (static data)
   - Graceful error messages when backend is down

3. **Python FastAPI Backend** (`/backend`) - **Deployed on Render**:
   - **Primary Data Source** for Top100 torrents
   - Multi-site torrent scraping (LimeTorrents, Pirate Bay, KickAss)
   - Real-time torrent health data (seeders/leechers)
   - CORS configured for Netlify frontend

#### Development Architecture:

4. **Node.js Backend** (`/server`) - **Local Development Only**:
   - TMDB API integration for local testing
   - CORS configuration for local frontend
   - Movie/TV show data with IMDB ID resolution

### Project Structure

---

## Setup and Installation (Windows)

This project includes a comprehensive setup script to prepare your entire development environment.

### Prerequisites

-   [Node.js and npm](https://nodejs.org/en/)
-   [Python](https://www.python.org/downloads/) (version 3.7+ recommended, must be in your PATH)

### One-Time Setup

From the project root, run the `setup.bat` script. This will:

1.  Install all Node.js dependencies for both the frontend and backend.
2.  Create a Python virtual environment (`venv`).
3.  Install all required Python packages for the torrent API.

```sh
.\setup.bat
```

After the setup is complete, you are ready to run the application.

---

## Automated Startup (Windows)

For a convenient one-click start on Windows, you can use the `start.bat` script located in the project root.

```sh
.\start.bat
```

This script automates the entire startup process:
1.  **Cleans Up:** Stops any old processes to prevent port conflicts.
2.  **Checks Dependencies:** Ensures all server dependencies are installed.
3.  **Launches Servers:** Starts the Node.js backend, the Python torrent backend, and the React frontend concurrently.
4.  **Opens Browser:** Automatically opens the application in a new Chrome window.

This is the recommended way to run the application for development.

---

## 🚀 Deployment

### Production Deployment Architecture

The application uses a **dual-deployment** strategy for maximum reliability:

#### 1. Frontend + Fallback Functions (Netlify)
**URL**: https://woztorrentz.netlify.app

1. **Connect to GitHub**: Link your Netlify account to this repository
2. **Environment Variables**: Set the following in Netlify dashboard:
   - `TMDB_API_KEY`: Your TMDB API key
3. **Build Settings**: 
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
4. **Deploy**: Netlify will automatically deploy on every push to main branch

#### 2. Python Backend (Render)
**URL**: https://woztorrentz-backend.onrender.com

1. **Connect to GitHub**: Link your Render account to this repository
2. **Service Configuration**:
   - **Name**: `woztorrentz-backend`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Environment Variables**: `PYTHON_VERSION=3.11.0`

#### Smart Fallback System

The frontend automatically:
1. **First**: Tries to fetch data from Render backend (real torrent data)
2. **Fallback**: Uses Netlify functions if backend is unavailable
3. **User Experience**: Shows helpful messages about backend status

🌟 **[Live Demo: woztorrentz.netlify.app](https://woztorrentz.netlify.app)** 🌟

**Current Features:**
- ✅ **Movie/TV Data**: TMDB integration via Netlify Functions
- ✅ **Top100 Categories**: Dynamic loading from backend/fallback
- ✅ **Real Torrent Data**: Live scraping from Pirate Bay (when backend is available)
- ✅ **IMDB Integration**: MovieMeter and search functionality
- ✅ **Graceful Degradation**: Works even if backend is down

### Local Development Setup

#### Option 1: Automated Setup (Windows)
Use the provided batch scripts for easy setup:
```sh
.\setup.bat    # One-time setup
.\start.bat    # Start all services
```

#### Option 2: Manual Setup

**Frontend Setup:**
```sh
npm install
npm run dev          # Starts Vite dev server on port 8080
```

**Node.js Backend Setup:**
```sh
cd server
npm install
npm start           # Starts Express server on port 3002
```

**Python Backend Setup:**
```sh
cd backend
pip install -r requirements.txt
python main.py      # Starts FastAPI server on port 8011
```

**Access Points:**
- Frontend: `http://localhost:8080`
- Node.js API: `http://localhost:3002`
- Python Torrent API: `http://localhost:8011`

---

## 🔧 Development

### API Configuration

The application uses different API endpoints for different environments:

- **Production (Netlify)**: Uses Netlify Functions at `/api/*`
- **Local Development**: Uses local servers with proxy configuration

### Vite Proxy Configuration

For local development, Vite proxies API requests:
```javascript
// vite.config.ts
proxy: {
  '/api/v1': 'http://127.0.0.1:8011',     // Python torrent API
  '/api/movies': 'http://localhost:8888',  // Netlify functions (local)
  '/api/tv': 'http://localhost:8888',      // Netlify functions (local)
}
```

### Environment Variables

**Local Development (`.env`):**
```
TMDB_API_KEY=your_tmdb_api_key_here
```

**Production (Netlify Environment Variables):**
- Set `TMDB_API_KEY` in Netlify dashboard under Site Settings → Environment Variables

---

## 🛠️ Troubleshooting

### Common Issues

**TMDB API 500 Errors:**
- Ensure `TMDB_API_KEY` is properly set in environment variables
- For Netlify: Redeploy after setting environment variables
- Check if API key is valid at [TMDB Settings](https://www.themoviedb.org/settings/api)

**Torrent Search Not Working:**
- Ensure Python backend is running on port 8011
- Check if torrent sites are accessible (some may be blocked)
- Verify FastAPI server logs for errors

**IMDB Links Redirecting to TMDB:**
- This has been fixed in recent updates
- Clear browser cache and refresh
- Links now search IMDB when direct IMDB IDs aren't available

**Port Conflicts:**
- Frontend: Port 8080 (Vite)
- Node.js Backend: Port 3002 (Express)
- Python Backend: Port 8011 (FastAPI)
- Use `netstat -an | findstr "8080"` to check port usage

### Performance Optimization

- **Movie Data**: Now fetches 50 movies with optimized API calls
- **Timeout Handling**: 5-second timeouts prevent hanging requests
- **Error Recovery**: Robust fallback mechanisms for API failures
- **Caching**: Browser caching for movie posters and data

---

## 📝 Recent Changelog

### v3.0.0 (Latest) - Full Top100 Implementation
- 🎉 **MAJOR**: Fully functional Top100 feature with real torrent data
- 🚀 **Backend Deployment**: Python FastAPI backend deployed to Render
- 🔄 **Smart Fallback**: Frontend tries backend first, falls back to Netlify functions
- 📊 **Real Data**: Live Top100 torrents from Pirate Bay with seed/leech counts
- 🏗️ **Production Architecture**: Dual deployment (Netlify + Render) for reliability
- 📱 **Better UX**: User-friendly error messages and loading states
- 🔧 **Environment Config**: Production-ready configuration for both platforms

### v2.1.0
- ✅ Fixed IMDB links in Movie Database section
- ✅ Enhanced Netlify Functions with proper error handling
- ✅ Increased movie results from 20 to 50
- ✅ Improved API performance with timeout handling
- ✅ Added environment variable support for deployment
- ✅ Optimized proxy configuration for local development

### v2.0.0
- 🎬 Added TMDB integration for live movie data
- 🏴‍☠️ Multi-source torrent search functionality
- 📱 Responsive dark theme UI
- 🔗 Intelligent IMDB linking system
- 📊 Top 100 torrent lists by category

---

## 📄 License

This project is for educational purposes only. Users are responsible for complying with their local laws regarding torrenting and copyright.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

---

**Note**: This application is designed for educational and research purposes. Please ensure you comply with your local laws and the terms of service of the APIs and torrent sites used.
