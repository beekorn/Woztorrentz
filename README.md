# Woztorrentz - IMDB Torrent Stream

A comprehensive web-based platform for searching torrents and streaming movies/TV shows. The application combines TMDB movie/TV data with torrent scraping from multiple sources, plus a Top 100 section powered by Pirate Bay data.

## 🚀 Key Features

### 🎬 Movie & TV Discovery
- **TMDB Integration**: Live trending movies, popular content, and top-rated lists
- **TV Shows Support**: Browse popular and top-rated TV series
- **Real-time Updates**: Auto-refreshing content with live data from TMDB
- **Detailed Information**: Full movie/show details with posters, ratings, and descriptions

### 🏴‍☠️ Torrent Integration
- **Multi-Source Search**: Search torrents across LimeTorrents, Pirate Bay, and KickAss
- **Top 100 Lists**: Popular torrents by category from Pirate Bay (Movies, Music, Games, etc.)
- **Magnet Links**: Direct download and copy functionality
- **Seeder/Leecher Info**: Real-time torrent health data

### 🎨 User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Dark Theme**: Modern dark UI with intuitive navigation
- **Quick Actions**: One-click torrent search, IMDB lookup, and streaming
- **Smart Ranking**: Properly numbered lists with ranking badges

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

This project requires an API key from The Movie Database (TMDB) to function correctly. You must create a `.env` file in the root of the project directory.

### `.env` File Setup

Create a file named `.env` in the project root and add the following key:

```
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_API_KEY=94786bb06526502c891f050958db76e5 # This is a demo key for anyone to try```

-   **`TMDB_API_KEY`**: Used by the **backend** to get lists of popular and trending movies, as well as detailed movie information. This populates all the movie sections of the application. Get your key from [The Movie Database (TMDB) API](https://www.themoviedb.org/settings/api).

---

## 🏗️ Architecture

### Data Sources

- **TMDB (The Movie Database)**: Powers the trending movies, popular content, and TV show lists with official movie/show metadata, ratings, and images
- **Pirate Bay**: Provides the Top 100 torrent lists with real seeder/leecher data and magnet links
- **Multiple Torrent Sites**: LimeTorrents, KickAss, and Pirate Bay for comprehensive torrent search

### Components

1. **React Frontend** (`/src`): Modern single-page application with:
   - Live movie/TV browsing with auto-refresh
   - Top 100 torrent lists by category
   - Torrent search across multiple sites
   - Responsive dark theme UI

2. **Node.js Backend** (`/server`): Express API server handling:
   - TMDB API integration and data formatting
   - CORS configuration for frontend communication
   - Movie/TV show data with IMDB ID resolution

3. **Python Torrent Backend** (`/backend`): FastAPI server providing:
   - Multi-site torrent scraping (LimeTorrents, Pirate Bay, KickAss)
   - Top 100 lists from Pirate Bay
   - Torrent health data (seeders/leechers)

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
