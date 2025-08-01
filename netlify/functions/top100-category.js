exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Extract category from path
    const pathParts = event.path.split('/');
    const category = pathParts[pathParts.length - 1];
    
    // Parse query parameters
    const queryParams = event.queryStringParameters || {};
    const page = parseInt(queryParams.page) || 1;
    const limit = parseInt(queryParams.limit) || 100;

    // For now, return a message that this feature is not fully implemented
    // In a real implementation, this would scrape torrent data
    return {
      statusCode: 503,
      headers,
      body: JSON.stringify({
        error: 'Top 100 torrent scraping temporarily unavailable',
        message: 'The backend torrent scraping service needs to be deployed. Please check back later.',
        category: category,
        page: page,
        limit: limit,
        suggestion: 'You can still use the main torrent search features in other sections.'
      })
    };
  } catch (error) {
    console.error('Error in top100-category function:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'An unexpected error occurred',
        message: error.message 
      })
    };
  }
};
