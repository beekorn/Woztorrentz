import fetch from 'node-fetch';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

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

const fetchTMDBPopular = async (apiKey) => {
    let allMovies = [];
    for (let page = 1; page <= 3; page++) {
        const url = `${TMDB_BASE_URL}/movie/popular?api_key=${apiKey}&language=en-US&page=${page}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
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
            const details = await fetchMovieDetails(movie.id, apiKey);
            return {
                ...movie,
                imdb_id: details.imdb_id
            };
        })
    );

    return moviesWithDetails.map((movie, index) => ({
        imdbId: movie.imdb_id || `tmdb-${movie.id}`,
        title: movie.title,
        year: movie.release_date ? movie.release_date.substring(0, 4) : 'N/A',
        posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        backdropUrl: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null,
        voteAverage: movie.vote_average || 0,
        overview: movie.overview,
        rank: index + 1,
        popularity: movie.popularity || 0
    }));
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
        const TMDB_API_KEY = process.env.TMDB_API_KEY;
        if (!TMDB_API_KEY) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'TMDB API key not configured' }),
            };
        }

        const movies = await fetchTMDBPopular(TMDB_API_KEY);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(movies),
        };
    } catch (error) {
        console.error('Error in moviemeter function:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
