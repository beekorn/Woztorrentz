import fetch from 'node-fetch';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

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

const fetchTMDBList = async (listType) => {
    console.log(`Fetching TMDB list for type: ${listType}`);
    const endpoint = '/movie/popular';

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

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    console.log('Received request for /api/moviemeter');
    
    if (!TMDB_API_KEY) {
        console.error('CRITICAL: TMDB API key is not configured on the server for /api/moviemeter. Check environment variables.');
        return res.status(500).json({ error: 'TMDB API key is not configured on the server.' });
    }
    
    try {
        const movies = await fetchTMDBList('popular');
        res.json(movies);
    } catch (error) {
        console.error('Error fetching IMDB Movie Meter (TMDB popular):', error);
        res.status(500).json({ error: error.message });
    }
}
