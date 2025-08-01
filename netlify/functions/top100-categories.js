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
    // Return the categories data that matches the backend API format
    const categories = [
      { value: 'hd_movies', label: 'Hd Movies', id: 207 },
      { value: 'audio', label: 'Audio', id: 100 },
      { value: 'music', label: 'Music', id: 101 },
      { value: 'audio_books', label: 'Audio Books', id: 102 },
      { value: 'sound_clips', label: 'Sound Clips', id: 103 },
      { value: 'flac', label: 'Flac', id: 104 },
      { value: 'video', label: 'Video', id: 200 },
      { value: 'movies', label: 'Movies', id: 201 },
      { value: 'movies_dvdr', label: 'Movies Dvdr', id: 202 },
      { value: 'music_videos', label: 'Music Videos', id: 203 },
      { value: 'movie_clips', label: 'Movie Clips', id: 204 },
      { value: 'tv_shows', label: 'Tv Shows', id: 205 },
      { value: 'handheld', label: 'Handheld', id: 206 },
      { value: 'hd_tv_shows', label: 'Hd Tv Shows', id: 208 },
      { value: '3d', label: '3D', id: 209 },
      { value: 'applications', label: 'Applications', id: 300 },
      { value: 'windows', label: 'Windows', id: 301 },
      { value: 'mac', label: 'Mac', id: 302 },
      { value: 'unix', label: 'Unix', id: 303 },
      { value: 'handheld_apps', label: 'Handheld Apps', id: 304 },
      { value: 'ios_apps', label: 'Ios Apps', id: 305 },
      { value: 'android_apps', label: 'Android Apps', id: 306 },
      { value: 'games', label: 'Games', id: 400 },
      { value: 'pc_games', label: 'Pc Games', id: 401 },
      { value: 'mac_games', label: 'Mac Games', id: 402 },
      { value: 'psx_games', label: 'Psx Games', id: 403 },
      { value: 'xbox360_games', label: 'Xbox360 Games', id: 404 },
      { value: 'wii_games', label: 'Wii Games', id: 405 },
      { value: 'handheld_games', label: 'Handheld Games', id: 406 },
      { value: 'ios_games', label: 'Ios Games', id: 407 },
      { value: 'android_games', label: 'Android Games', id: 408 },
      { value: 'other', label: 'Other', id: 600 },
      { value: 'ebooks', label: 'Ebooks', id: 601 },
      { value: 'comics', label: 'Comics', id: 602 },
      { value: 'pictures', label: 'Pictures', id: 603 },
      { value: 'covers', label: 'Covers', id: 604 },
      { value: 'physibles', label: 'Physibles', id: 605 }
    ];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        categories: categories,
        source: 'Pirate Bay'
      })
    };
  } catch (error) {
    console.error('Error in top100-categories function:', error);
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
