import fetch from 'node-fetch';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const TMDB_ENDPOINTS = {
    'popular': '/tv/popular',
    'top-rated': '/tv/top_rated',
};

const fetchTVDetails = async (tmdbId, apiKey) => {
    const url = `${TMDB_BASE_URL}/tv/${tmdbId}?api_key=${apiKey}&append_to_response=external_ids`;
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

const fetchTMDBTVList = async (listType, apiKey) => {
    const tvListType = `tv-${listType}`;
    const endpoint = TMDB_ENDPOINTS[listType];
    if (!endpoint) {
        throw new Error(`Invalid TV list type: ${listType}`);
    }

    let allShows = [];
    for (let page = 1; page <= 3; page++) {
        const url = `${TMDB_BASE_URL}${endpoint}?api_key=${apiKey}&language=en-US&page=${page}`;
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch from TMDB: ${response.statusText}`);
            }
            const data = await response.json();
            allShows = allShows.concat(data.results);
        } catch (error) {
            console.error(`Network or fetch error for URL: ${url}`, error);
            throw error;
        }
    }

    // Sort shows if the list type is 'top-rated'
    if (listType === 'top-rated') {
        allShows.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    }

    const uniqueShows = Array.from(new Map(allShows.map(show => [show.id, show])).values());

    // Process TV shows in parallel to get IMDB IDs
    const showsWithDetails = await Promise.all(
        uniqueShows.slice(0, 50).map(async (show) => {
            const details = await fetchTVDetails(show.id, apiKey);
            return {
                ...show,
                imdb_id: details.external_ids ? details.external_ids.imdb_id : null
            };
        })
    );
    
    return showsWithDetails.map((show, index) => ({
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
        const pathParts = event.path.split('/');
        const listType = pathParts[pathParts.length - 1];
        
        const TMDB_API_KEY = process.env.TMDB_API_KEY;
        if (!TMDB_API_KEY) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ error: 'TMDB API key not configured' }),
            };
        }

        const shows = await fetchTMDBTVList(listType, TMDB_API_KEY);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                data: shows,
                lastUpdated: new Date().toISOString(),
                source: 'TMDB',
                error: null
            }),
        };
    } catch (error) {
        console.error('Error in TV function:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                data: [],
                lastUpdated: null,
                source: 'TMDB',
                error: error.message
            }),
        };
    }
};
