# Woztorrentz

🌐 **[LIVE DEMO - woztorrentz.netlify.app](https://woztorrentz.netlify.app)** 🌐

A comprehensive web-based platform for searching torrents and discovering movies/TV shows. The application combines TMDB movie/TV data with torrent scraping from multiple sources, plus a Top 100 section powered by Pirate Bay data. Features real-time movie data, intelligent IMDB linking, and multi-source torrent search.

---

## 🔗 Quick Links

- 🚀 **[Live Application](https://woztorrentz.netlify.app)** - Try it now!
- 🔥 **[Fast Backend (Vercel)](https://woztorrentz-bkscsnkqh-beekorns-projects.vercel.app)** - Lightning-fast movie & TV browsing!
- 📖 **[API Documentation](#-api-endpoints)** - Complete endpoint reference
- ⚡ **[Quick Setup](#setup-and-installation-windows)** - Get started in minutes
- 🚀 **[Deploy Your Own](#-deployment)** - Netlify deployment guide

## 🚀 Key Features

### 🎬 Movie & TV Discovery
- **TMDB Integration**: Live trending movies, popular content, and top-rated lists from Vercel backend
- **Fast Performance**: Near-instant loading via Vercel Edge configuration
- **TV Shows Support**: Browse popular and top-rated TV series
- **Real-time Updates**: Auto-refreshing content with live data from TMDB
- **Detailed Information**: Full movie/show details with posters, ratings, and descriptions

### 🏴‍☠️ Torrent Integration
- **Top 100 Lists**: Browse top torrents by category
- **TMDB Integration**: Movie and TV show data with instant loading
- **Magnet Links**: Direct download and copy functionality
- **Fast Performance**: Powered by Vercel's edge infrastructure

### 🎨 User Experience
- **Enhanced Top100 Layout**: Clean list-style design with prominent ranking badges
- **Color-coded Health**: Green/yellow/red indicators for seeder/leecher counts
- **Professional Cards**: Streamlined torrent cards with better metadata organization
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark Theme**: Modern dark UI with intuitive navigation
- **Quick Actions**: One-click download, copy magnet, source links, and IMDB search
- **Smart Ranking**: Numbered rankings (#1, #2, #3...) with visual prominence
- **Intelligent IMDB Integration**: Automatic IMDB search when direct links aren't available
- **Fast Loading**: All data served through Vercel's global edge network
- **Reliable Architecture**: Built on modern serverless infrastructure
- **Fast Performance**: Optimized API calls with timeout handling and error recovery

### 🆕 Recent Improvements
- **📊 Enhanced Top100 Layout**: Redesigned with better visual hierarchy, cleaner cards, and improved metadata display
- **🔧 Fixed Movie Database**: TMDB integration now works perfectly via Netlify functions
- **🏷️ Better Branding**: Page title updated to "Woztorrentz" for proper bookmarking
- **🎯 Improved UX**: List-style layout with ranking badges, color-coded seeders/leechers
- **🚀 Full Top100 Feature**: Live Top100 torrent lists with real seed/leech data
- **⚡ Vercel Deployment**: Ultra-fast backend deployed to Vercel for lightning-quick responses
- **📈 Enhanced Movie Data**: Now fetches 50 movies from TMDB with better error handling
- **🔗 Fixed IMDB Links**: Movie Database section now properly searches IMDB instead of redirecting to TMDB
- **⚡ Improved API Performance**: Optimized Netlify functions with proper timeout handling
- **🛡️ Better Error Recovery**: Robust error handling and fallback mechanisms

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

#### Additional Endpoints
Additional functionality:

- `GET /api/moviemeter` - Get popular movies (TMDB-based movie meter)
- Various TMDB integration endpoints for real-time movie and TV data

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

This project requires API keys from The Movie Database (TMDB) for the Vercel backend. You must create a `.env` file in the root of the project directory for local development.

### `.env` File Setup

Create a file named `.env` in the project root and add the following keys:

```
TMDB_API_KEY=your_tmdb_api_key_here
```

-   **`TMDB_API_KEY`**: Used by the **backend** to get lists of popular and trending movies, as well as detailed movie information. This populates all the movie sections of the application. Get your key from [The Movie Database (TMDB) API](https://www.themoviedb.org/settings/api).

---

### 🏗️ Architecture

### Data Sources

- **Vercel Edge Backend**: Powers the fast, scalable movie/TV browsing experience
- **TMDB (The Movie Database)**: Provides the movie/show metadata, ratings, and images
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

2. **Vercel Edge Functions** (`/api`) - **Fast Backend API**:
   - Powers movie & TV data with near-instant response time
   - Fast integration with TMDB for real-time content

3. **Netlify Functions** (`/netlify/functions`) - **Serverless Fallback**:
   - TMDB API integration and data formatting
   - IMDB MovieMeter integration
   - Top100 categories (static data)
   - Graceful error messages when backend is down

#### Development Architecture:

3. **Node.js Backend** (`/server`) - **Local Development Only**:
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

#### 2. Fast Backend (Vercel)
**URL**: https://woztorrentz-bkscsnkqh-beekorns-projects.vercel.app

1. **Connect to GitHub**: Link your Vercel account to this repository
2. **Environment Variables**: Set the following in Vercel dashboard:
   - `TMDB_API_KEY`: Your TMDB API key
3. **Deploy**: Use Vercel CLI or auto-deploy from GitHub
   - `npm install -g vercel`
   - `vercel --prod`
4. **Performance**: Near-instant API responses (100-500ms vs 30+ seconds on Render)

#### Simplified Architecture

The application now uses a streamlined two-service architecture:
1. **Primary**: Vercel handles all backend API calls with lightning-fast response times
2. **Fallback**: Netlify functions provide backup functionality if needed

🌟 **[Live Demo: woztorrentz.netlify.app](https://woztorrentz.netlify.app)** 🌟

**Current Features:**
- ⚡ **Ultra-Fast Movie/TV Data**: TMDB integration via Vercel Edge Functions (100-500ms response time)
- ✅ **Top100 Categories**: Built-in category browsing
- ✅ **IMDB Integration**: MovieMeter and search functionality
- ✅ **Reliable Performance**: Powered by Vercel's global edge network
- 🚀 **Lightning Speed**: Dramatically improved loading speeds for all content

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

## 📄 License

This project is for educational purposes only. Users are responsible for complying with their local laws regarding torrenting and copyright.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

---

**Note**: This application is designed for educational and research purposes. Please ensure you comply with your local laws and the terms of service of the APIs and torrent sites used.
