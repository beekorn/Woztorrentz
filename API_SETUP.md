# API Setup Guide

## 🚀 Simplified Architecture: TMDB-Powered Backend

This project has been refactored to use a simpler, more robust architecture for fetching movie data. All live movie information, including trending lists, popular movies, and movie details, is now sourced exclusively from **The Movie Database (TMDB) API**.

### How It Works

1.  **Frontend Request**: The React frontend requests a list of movies (e.g., "Trending Today") from our own backend server.
2.  **Backend Proxy**: The Node.js backend server receives the request and validates the requested list type.
3.  **TMDB API Call**: The backend uses the `TMDB_API_KEY` to make a request to the official TMDB API.
4.  **Data Processing**: The backend processes the response from TMDB, standardizes the data format (e.g., creating full poster URLs), and ensures all required fields are present.
5.  **Structured Response**: The backend sends a standardized JSON response with the following structure:
    ```json
    {
      "success": true,
      "data": [/* array of movie objects */],
      "lastUpdated": "ISO timestamp",
      "source": "TMDB",
      "error": null
    }
    ```

This proxy approach keeps the TMDB API key secure on the backend and simplifies the frontend's data fetching logic.

---

## 🔑 Required API Key

To run this application, you only need **one** API key.

### 1. **TMDB API**
- **Purpose**: Provides all movie data for the application.
- **Cost**: Free (with generous rate limits).
- **Setup**:
  1.  Go to [The Movie Database (TMDB) API](https://www.themoviedb.org/settings/api).
  2.  Create a free account and request an API key.
  3.  Add the key to your `.env` file in the project root.

---

## 🔧 Environment Variables Setup

Create a `.env` file in the project root with the following content:

```env
# TMDB API Key (Required for all movie data)
TMDB_API_KEY=your_tmdb_api_key_here

# Server port (Optional, defaults to 3002 if not set)
PORT=3002
```

---

##  obsolete Architectures (For Historical Context)

The project previously used a complex system involving multiple data sources, which has now been **completely removed**. This included:

-   **OMDB API**: Was used for fetching detailed movie information. **This is no longer used.**
-   **Direct IMDB Scraping**: An attempt was made to scrape the IMDB Movie Meter chart directly. This was unreliable due to anti-bot measures and **is no longer used.**

The current TMDB-only approach is faster, more reliable, and much easier to maintain.