const https = require('https');
const fs = require('fs');

const options = {
  hostname: 'www.imdb.com',
  path: '/chart/moviemeter',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
  }
};

const req = https.request(options, (res) => {
  let data = '';
  console.log(`Fetching page, status code: ${res.statusCode}`);

  // Handle redirects
  if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
    console.log(`Redirecting to ${res.headers.location}`);
    // In a real app, you'd handle the redirect here. For this debug script, we'll just log it.
    req.destroy();
    return;
  }

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Finished fetching page.');
    fs.writeFileSync('imdb_moviemeter_page.html', data);
    console.log('Page content saved to imdb_moviemeter_page.html');
  });
});

req.setTimeout(15000, () => {
  console.error('Request timed out after 15 seconds.');
  req.destroy();
});

req.on('error', (err) => {
  console.error('Error fetching page:', err.message);
});

req.end();
