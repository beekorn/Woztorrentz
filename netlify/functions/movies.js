// Using native fetch (Node.js 18+)

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

const fetchMovieDetails = async (tmdbId, apiKey) => {
    const url = `${TMDB_BASE_URL}/movie/${tmdbId}?api_key=${apiKey}&append_to_response=external_ids`;
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

const fetchTMDBList = async (listType, apiKey) => {
    const endpoint = TMDB_ENDPOINTS[listType];
    if (!endpoint) {
        throw new Error(`Invalid list type: ${listType}`);
    }

    // Fetch only first page for speed
    const url = `${TMDB_BASE_URL}${endpoint}?api_key=${apiKey}&language=en-US&page=1`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
        const response = await fetch(url, { 
            signal: controller.signal,
            headers: {
                'User-Agent': 'Woztorrentz/1.0'
            }
        });
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch from TMDB: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Return first 20 movies for speed
        return data.results.slice(0, 20).map((movie, index) => ({
            imdbId: `tmdb-${movie.id}`,
            title: movie.title,
            year: movie.release_date ? movie.release_date.substring(0, 4) : 'N/A',
            posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
            backdropUrl: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null,
            voteAverage: movie.vote_average || 0,
            overview: movie.overview,
            rank: index + 1,
            popularity: movie.popularity || 0
        }));
    } catch (error) {
        clearTimeout(timeoutId);
        console.error(`Network or fetch error for URL: ${url}`, error);
        throw error;
    }
};

export const handler = async (event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    };

    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: '',
        };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }

    try {
        console.log('Movies function called with path:', event.path);
        const pathParts = event.path.split('/');
        const listType = pathParts[pathParts.length - 1];
        console.log('List type:', listType);
        
        const TMDB_API_KEY = process.env.TMDB_API_KEY;
        console.log('TMDB_API_KEY present:', !!TMDB_API_KEY);
        
        if (!TMDB_API_KEY) {
            console.error('TMDB API key not configured');
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    success: false,
                    error: 'TMDB API key not configured',
                    data: [],
                    lastUpdated: null,
                    source: 'TMDB'
                }),
            };
        }

        const movies = await fetchTMDBList(listType, TMDB_API_KEY);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: movies,
                lastUpdated: new Date().toISOString(),
                source: 'TMDB',
                error: null
            }),
        };
    } catch (error) {
        console.error('Error in movies function:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                data: [],
                lastUpdated: null,
                source: 'Error',
                error: error.message || 'Unknown error'
            }),
        };
    }
};
