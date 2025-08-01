import { useState, useEffect, useCallback } from 'react';
import { getApiUrl } from '../config/api';


interface Movie {
  title: string;
  year: string;
  voteAverage: number;
  overview: string;
  posterUrl: string | null;
  imdbId: string;
  rank: number;
  popularity?: number;
}

interface UseLiveMoviesReturn {
  movies: Movie[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshMovies: () => Promise<void>;
  dataSource: string | null;
}

export const useLiveMovies = (listType: string = 'popular'): UseLiveMoviesReturn => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [dataSource, setDataSource] = useState<string | null>(null);

  const fetchMovies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setMovies([]); // Clear previous data when fetching new list
    
    try {
      const isTv = listType.startsWith('tv-');
      const apiPath = isTv ? `/api/tv/${listType.replace('tv-', '')}` : `/api/movies/${listType}`;
      // Use Netlify functions for movie/TV data instead of backend
      const fullUrl = `${getApiUrl('netlify')}${apiPath}`;
      
      const response = await fetch(fullUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }
      const result = await response.json();

      if (result.success && result.data) {
        setMovies(result.data);
        setLastUpdated(new Date(result.lastUpdated));
        setDataSource(result.source);
      } else {
        setError(result.error || `Failed to parse ${isTv ? 'TV' : 'movie'} data`);
      }
    } catch (err) {
      const isTv = listType.startsWith('tv-');
      setError('Network error occurred');
      console.error(`Error fetching live ${isTv ? 'TV' : 'movie'} data:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [listType]);

  const refreshMovies = useCallback(async () => {
    await fetchMovies();
  }, [fetchMovies]);

  // Initial fetch and refetch when listType changes
  useEffect(() => {
    fetchMovies();
  }, [fetchMovies, listType]);

  return {
    movies,
    isLoading,
    error,
    lastUpdated,
    refreshMovies,
    dataSource
  };
};