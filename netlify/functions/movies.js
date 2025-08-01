import fetch from 'node-fetch';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
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

exports.handler = async (event, context) => {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    const { listType } = event.queryStringParameters || {};
    
    console.log(`Received request for /api/movies with listType: ${listType}`);
    
    console.log('TMDB API Key:', TMDB_API_KEY ? 'Exists' : 'Not Defined');
    if (!TMDB_API_KEY) {
        console.error('CRITICAL: TMDB API key is not configured on the server for /api/movies. Check environment variables.');
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'TMDB API key is not configured on the server.' })
        };
    }
    
    try {
        const movies = await fetchTMDBList(listType);
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: movies,
                lastUpdated: new Date().toISOString(),
                source: 'TMDB',
                error: null
            })
        };
    } catch (error) {
        console.error(`Error fetching list ${listType}:`, error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                data: [],
                lastUpdated: null,
                source: 'TMDB',
                error: error.message
            })
        };
    }
}
