interface Movie {
  Title: string;
  Year: string;
  imdbRating: string;
  Director: string;
  Actors: string;
  Plot: string;
  Poster: string;
  imdbID: string;
  Type: string;
  Genre: string;
  Runtime: string;
  Released: string;
}

interface OMDBResponse {
  Search?: Movie[];
  totalResults?: string;
  Response: string;
  Error?: string;
}

export class OMDBService {
  private static API_KEY_STORAGE_KEY = 'omdb_api_key';
  private static BASE_URL = 'https://www.omdbapi.com/';

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    console.log('OMDB API key saved successfully');
  }

  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }

  static async testApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}?apikey=${apiKey}&t=inception`);
      const data = await response.json();
      return data.Response === "True";
    } catch (error) {
      console.error('Error testing API key:', error);
      return false;
    }
  }

  static async searchMovies(query: string, page: number = 1): Promise<{ success: boolean; data?: Movie[]; error?: string; totalResults?: number }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'API key not found. Please set your OMDB API key.' };
    }

    try {
      const response = await fetch(
        `${this.BASE_URL}?apikey=${apiKey}&s=${encodeURIComponent(query)}&page=${page}&type=movie`
      );
      const data: OMDBResponse = await response.json();

      if (data.Response === "True" && data.Search) {
        return { 
          success: true, 
          data: data.Search,
          totalResults: parseInt(data.totalResults || '0')
        };
      } else {
        return { 
          success: false, 
          error: data.Error || 'No results found' 
        };
      }
    } catch (error) {
      console.error('Error searching movies:', error);
      return { 
        success: false, 
        error: 'Failed to connect to OMDB API' 
      };
    }
  }

  static async getMovieDetails(imdbId: string): Promise<{ success: boolean; data?: Movie; error?: string }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'API key not found' };
    }

    try {
      const response = await fetch(
        `${this.BASE_URL}?apikey=${apiKey}&i=${imdbId}&plot=full`
      );
      const data: Movie = await response.json();

      if (data.Title) {
        return { success: true, data };
      } else {
        return { success: false, error: 'Movie not found' };
      }
    } catch (error) {
      console.error('Error getting movie details:', error);
      return { success: false, error: 'Failed to fetch movie details' };
    }
  }

  static async getTopMovies(): Promise<{ success: boolean; data?: Movie[]; error?: string }> {
    // Since OMDB doesn't have a "top movies" endpoint, we'll search for popular movies
    const popularMovies = [
      'The Shawshank Redemption',
      'The Godfather',
      'The Dark Knight',
      'Pulp Fiction',
      'Forrest Gump',
      'Inception',
      'The Matrix',
      'Goodfellas',
      'The Lord of the Rings',
      'Fight Club'
    ];

    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'API key not found' };
    }

    try {
      const moviePromises = popularMovies.map(title =>
        fetch(`${this.BASE_URL}?apikey=${apiKey}&t=${encodeURIComponent(title)}`)
          .then(response => response.json())
      );

      const results = await Promise.all(moviePromises);
      const validMovies = results.filter(movie => movie.Response === "True");

      return { success: true, data: validMovies };
    } catch (error) {
      console.error('Error getting top movies:', error);
      return { success: false, error: 'Failed to fetch top movies' };
    }
  }
}