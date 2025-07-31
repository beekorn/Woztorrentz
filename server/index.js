import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

console.log('Server script starting...');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '..', '.env');
console.log(`Attempting to load .env file from: ${envPath}`);
dotenv.config({ path: envPath });

const app = express();
const PORT = process.env.PORT || 3002;

console.log(`Server will run on port: ${PORT}`);

const corsOptions = {
  origin: [
    'http://localhost:8080',
    'https://woztorrentz.netlify.app',
    'https://localhost:5173'
  ],
  optionsSuccessStatus: 200 // For legacy browser support
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes
app.use(express.json());

// Health check endpoint for Render
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

const TMDB_API_KEY = process.env.TMDB_API_KEY;
console.log(`TMDB_API_KEY loaded: ${TMDB_API_KEY ? 'Yes, ends with ' + TMDB_API_KEY.slice(-4) : 'No, it is undefined!'}`);
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const TMDB_ENDPOINTS = {
    'trending-daily': '/trending/movie/day',
    'trending-weekly': '/trending/movie/week',
    'top-rated': '/movie/top_rated',
    'popular': '/movie/popular',
    'now-playing': '/movie/now_playing',
    'upcoming': '/movie/upcoming',
    'tv-popular': '/tv/popular',
    'tv-top-rated': '/tv/top_rated',
};

const fetchMovieDetails = async (tmdbId) => {
    const url = `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=external_ids`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to fetch details for movie ${tmdbId}: ${response.statusText}`);
            return { imdb_id: null };
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching details for movie ${tmdbId}:`, error);
        return { imdb_id: null };
    }
};

const fetchTVDetails = async (tmdbId) => {
    const url = `${TMDB_BASE_URL}/tv/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=external_ids`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(`Failed to fetch details for TV show ${tmdbId}: ${response.statusText}`);
            return { external_ids: { imdb_id: null } };
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching details for TV show ${tmdbId}:`, error);
        return { external_ids: { imdb_id: null } };
    }
};

const fetchTMDBList = async (listType) => {
    console.log(`Fetching TMDB list for type: ${listType}`);
    const endpoint = TMDB_ENDPOINTS[listType];
    if (!endpoint) {
        console.error(`Invalid list type received: ${listType}`);
        throw new Error(`Invalid list type: ${listType}`);
    }

    let allMovies = [];
    for (let page = 1; page <= 3; page++) {
        const url = `${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`;
        console.log(`Fetching URL: ${url}`);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`TMDB API Error for ${listType} on page ${page}. Status: ${response.status}. Body: ${errorBody}`);
                throw new Error(`Failed to fetch from TMDB: ${response.statusText}`);
            }
            const data = await response.json();
            allMovies = allMovies.concat(data.results);
        } catch (error) {
            console.error(`Network or fetch error for URL: ${url}`, error);
            throw error;
        }
    }

    const uniqueMovies = Array.from(new Map(allMovies.map(movie => [movie.id, movie])).values());

    // Process movies in parallel to get IMDB IDs
    const moviesWithDetails = await Promise.all(
        uniqueMovies.slice(0, 50).map(async (movie) => {
            const details = await fetchMovieDetails(movie.id);
            return {
                ...movie,
                imdb_id: details.imdb_id
            };
        })
    );

    return moviesWithDetails.map((movie, index) => ({
        imdbId: movie.imdb_id || `tmdb-${movie.id}`, // Use actual IMDB ID or fallback to TMDB ID
        title: movie.title,
        year: movie.release_date ? movie.release_date.substring(0, 4) : 'N/A',
        posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        backdropUrl: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null,
        voteAverage: movie.vote_average || 0,
        overview: movie.overview,
        rank: index + 1, // Add proper ranking based on TMDB order
        popularity: movie.popularity || 0 // Include popularity for potential sorting
    }));
};

const fetchTMDBTVList = async (listType) => {
    console.log(`Fetching TMDB TV list for type: ${listType}`);
    const tvListType = `tv-${listType}`; // Prefix with 'tv-' to match TMDB_ENDPOINTS keys
    const endpoint = TMDB_ENDPOINTS[tvListType];
    if (!endpoint) {
        console.error(`Invalid TV list type received: ${listType}`);
        throw new Error(`Invalid TV list type: ${listType}`);
    }

    let allShows = [];
    for (let page = 1; page <= 3; page++) {
        const url = `${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`;
        console.log(`Fetching URL: ${url}`);
        try {
            const response = await fetch(url);
            if (!response.ok) {
                const errorBody = await response.text();
                console.error(`TMDB API Error for ${listType} on page ${page}. Status: ${response.status}. Body: ${errorBody}`);
                throw new Error(`Failed to fetch from TMDB: ${response.statusText}`);
            }
            const data = await response.json();
            allShows = allShows.concat(data.results);
        } catch (error) {
            console.error(`Network or fetch error for URL: ${url}`, error);
            throw error;
        }
    }

    // Sort shows if the list type is 'tv-top-rated'
    if (listType === 'top-rated') {
        allShows.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    }

    const uniqueShows = Array.from(new Map(allShows.map(show => [show.id, show])).values());

    // Process TV shows in parallel to get IMDB IDs
    const showsWithDetails = await Promise.all(
        uniqueShows.slice(0, 50).map(async (show) => {
            const details = await fetchTVDetails(show.id);
            return {
                ...show,
                imdb_id: details.external_ids ? details.external_ids.imdb_id : null
            };
        })
    );
    
    const results = showsWithDetails.map((show, index) => ({
        imdbId: show.imdb_id || `tmdb-${show.id}`,
        title: show.name,
        year: show.first_air_date ? show.first_air_date.substring(0, 4) : 'N/A',
        posterUrl: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
        backdropUrl: show.backdrop_path ? `https://image.tmdb.org/t/p/w1280${show.backdrop_path}` : null,
        voteAverage: show.vote_average || 0,
        overview: show.overview,
        rank: index + 1,
        popularity: show.popularity || 0
    }));
    
    console.log(`TV ${listType} - First 3 shows:`, results.slice(0, 3).map(s => ({ title: s.title, year: s.year, rank: s.rank })));
    return results;
};

app.get('/api/movies/:listType', async (req, res) => {
    const { listType } = req.params;
    console.log(`Received request for /api/movies/${listType}`);
    if (!TMDB_API_KEY) {
        console.error('CRITICAL: TMDB API key is not configured on the server for /api/movies. Check .env file path and content.');
        return res.status(500).json({ error: 'TMDB API key is not configured on the server.' });
    }
    try {
        const movies = await fetchTMDBList(listType);
        res.json({
            success: true,
            data: movies,
            lastUpdated: new Date().toISOString(),
            source: 'TMDB',
            error: null
        });
    } catch (error) {
        console.error(`Error fetching list ${listType}:`, error);
        res.status(500).json({
            success: false,
            data: [],
            lastUpdated: null,
            source: 'TMDB',
            error: error.message
        });
    }
});

app.get('/api/tv/:listType', async (req, res) => {
    const { listType } = req.params;
    console.log(`Received request for /api/tv/${listType}`);
    if (!TMDB_API_KEY) {
        console.error('CRITICAL: TMDB API key is not configured on the server for /api/tv. Check .env file path and content.');
        return res.status(500).json({ error: 'TMDB API key is not configured on the server.' });
    }
    try {
        const shows = await fetchTMDBTVList(listType);
        res.json({
            success: true,
            data: shows,
            lastUpdated: new Date().toISOString(),
            source: 'TMDB',
            error: null
        });
    } catch (error) {
        console.error(`Error fetching TV list ${listType}:`, error);
        res.status(500).json({
            success: false,
            data: [],
            lastUpdated: null,
            source: 'TMDB',
            error: error.message
        });
    }
});

app.get('/api/imdb/moviemeter', async (req, res) => {
    console.log('Received request for /api/imdb/moviemeter');
    if (!TMDB_API_KEY) {
        console.error('CRITICAL: TMDB API key is not configured on the server for /api/imdb/moviemeter. Check .env file path and content.');
        return res.status(500).json({ error: 'TMDB API key is not configured on the server.' });
    }
    try {
        const movies = await fetchTMDBList('popular');
        res.json(movies);
    } catch (error) {
        console.error('Error fetching IMDB Movie Meter (TMDB popular):', error);
        res.status(500).json({ error: error.message });
    }
});


const TORRENT_SCRAPERS = {
    'limetorrents': 'limetorrents.py',
    'piratebay': 'pirate_bay.py',
    'kickass': 'kickass.py',
};

app.get('/api/v1/search', (req, res) => {
    const { site, query } = req.query;
    const scraperScript = TORRENT_SCRAPERS[site];

    if (!scraperScript) {
        return res.status(400).json({ error: 'Invalid site specified' });
    }

    const scriptPath = path.resolve(__dirname, '..', 'backend', 'torrents', scraperScript);
    const pythonProcess = spawn('python', [scriptPath, query]);

    let dataToSend = '';
    pythonProcess.stdout.on('data', (data) => {
        dataToSend += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
        // Don't send error details to client for security reasons
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            return res.status(500).json({ error: 'Failed to execute scraper script.' });
        }
        try {
            const jsonData = JSON.parse(dataToSend);
            res.json(jsonData);
        } catch (e) {
            console.error('Error parsing JSON from Python script:', e);
            res.status(500).json({ error: 'Failed to parse scraper results.' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
