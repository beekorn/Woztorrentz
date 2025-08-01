import fetch from 'node-fetch';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const TMDB_ENDPOINTS = {
    'tv-popular': '/tv/popular',
    'tv-top-rated': '/tv/top_rated',
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

    const { listType } = req.query;
    
    console.log(`Received request for /api/tv with listType: ${listType}`);
    
    if (!TMDB_API_KEY) {
        console.error('CRITICAL: TMDB API key is not configured on the server for /api/tv. Check environment variables.');
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
}
