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

    const { site, query } = req.query;
    
    if (!site || !query) {
        return res.status(400).json({ error: 'Missing site or query parameter' });
    }

    // For now, return a message that torrent search is not available on Vercel
    // Due to Vercel's execution time limits, we can't run the heavy scraping operations
    return res.status(503).json({ 
        error: 'Torrent search is temporarily unavailable',
        message: 'Torrent scraping requires longer execution times than Vercel serverless functions allow. Please use Pirate Bay search from the Top 100 section.',
        available_alternatives: [
            'Top 100 torrents by category',
            'TMDB movie and TV show browsing'
        ]
    });
}
