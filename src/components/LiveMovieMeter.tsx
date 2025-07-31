import { useLiveMovies } from '@/hooks/useLiveMovies';
import { MovieCard } from './MovieCard';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useToast } from './ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { RefreshCw, Play, Pause, Clock, List } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useEffect, useRef, useState } from 'react';

interface LiveMovieMeterProps {
  onTorrentSearch: (query: string) => void;
}

interface Movie {
  title: string;
  year: string;
  voteAverage: number;
  overview: string;
  posterUrl: string | null;
  imdbId: string;
  rank: number;
}

const movieListOptions = [
  { value: 'trending-daily', label: 'Trending Movies Today', description: 'Movies trending today' },
  { value: 'popular', label: 'Most Popular Movies', description: 'Most popular movies right now' },
  { value: 'top-rated', label: 'Top Rated Movies', description: 'Highest rated movies of all time' },
  { value: 'tv-popular', label: 'Popular TV Shows', description: 'Most popular TV shows right now' },
  { value: 'tv-top-rated', label: 'Top Rated TV Shows', description: 'Highest rated TV shows of all time' }
];

export const LiveMovieMeter = ({ onTorrentSearch }: LiveMovieMeterProps) => {
  const { toast } = useToast();
  const previousUpdateRef = useRef<Date | null>(null);
  const [selectedList, setSelectedList] = useState<string>('trending-daily');
  
  const {
    movies,
    isLoading,
    error,
    lastUpdated,
    refreshMovies,
    dataSource
  } = useLiveMovies(selectedList);

  // Show toast notification when movies are updated
  useEffect(() => {
    if (lastUpdated && previousUpdateRef.current && lastUpdated > previousUpdateRef.current) {
      const listName = movieListOptions.find(opt => opt.value === selectedList)?.label || selectedList;
      toast({
        title: "Movies Updated",
        description: `${listName} refreshed with ${movies.length} movies`,
      });
    }
    previousUpdateRef.current = lastUpdated;
  }, [lastUpdated, movies.length, toast, selectedList]);



  const formattedMovies: Movie[] = movies;

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">

          
          {/* Control buttons */}
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
                </div>
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={refreshMovies}
              disabled={isLoading}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Badge variant="outline">Ratings from TMDB</Badge> 
          </div>
        </div>

        {/* Movie List Selector - Better positioned */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <List className="w-5 h-5 text-muted-foreground" />
            <Select value={selectedList} onValueChange={setSelectedList}>
              <SelectTrigger className="w-64 h-10">
                <SelectValue placeholder="Select content list" />
              </SelectTrigger>
              <SelectContent>
                {movieListOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex flex-col py-1">
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground">{option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {movieListOptions.find(opt => opt.value === selectedList)?.label}: {formattedMovies.length} items
          </div>
        </div>
      </div>
      
      {/* Error display */}
      {error && (
        <div className="flex items-center justify-center p-4">
          <Badge variant="destructive" className="text-sm">
            {error}
          </Badge>
        </div>
      )}

      {/* Loading state */}
      {isLoading && formattedMovies.length === 0 && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading live movie data...</p>
        </div>
      )}

      {/* Movies list */}
      <div className="space-y-4">
        {formattedMovies.map((movie, index) => {
          // Use the actual rank from the server if available, otherwise use index
          const displayRank = movie.rank || (index + 1);
          return (
            <div key={movie.imdbId} className="relative pl-12">
              <div className="absolute left-0 top-6 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold z-10 shadow-lg">
                {displayRank}
              </div>
              <MovieCard {...movie} onTorrentSearch={onTorrentSearch} />
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {!isLoading && formattedMovies.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No movies found. Try refreshing.</p>
        </div>
      )}
    </div>
  );
};