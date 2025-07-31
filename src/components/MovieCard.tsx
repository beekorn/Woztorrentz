import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Calendar, User, Search, ExternalLink } from "lucide-react";

interface MovieCardProps {
  onTorrentSearch: (query: string) => void;
  title: string;
  year: string;
  voteAverage: number;
  overview: string;
  posterUrl: string | null;
  imdbId: string;
}

export const MovieCard = ({ 
  title, 
  year, 
  voteAverage,
  overview,
  posterUrl,
  imdbId,
  onTorrentSearch
}: MovieCardProps) => {

  const handleViewIMDB = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    // Check if it's a fallback TMDB ID (starts with 'tmdb-')
    if (imdbId.startsWith('tmdb-')) {
      // If we only have a TMDB ID, link to TMDB instead
      const tmdbId = imdbId.replace('tmdb-', '');
      window.open(`https://www.themoviedb.org/movie/${tmdbId}`, 'imdb_tab');
    } else {
      // Use the actual IMDB ID
      window.open(`https://www.imdb.com/title/${imdbId}`, 'imdb_tab');
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-card transition-all duration-300 hover:scale-[1.02]">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-48 flex-shrink-0">
            <img 
              src={posterUrl || "/placeholder.svg"} 
              alt={title}
              className="w-full h-64 md:h-full object-cover"
            />
          </div>
          
          <div className="flex-1 p-6 space-y-4">
            <div className="space-y-2">
              <h3 
                onClick={handleViewIMDB}
                className="text-xl font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
              >
                {title} ({year})
              </h3>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{(voteAverage || 0).toFixed(1)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{year}</span>
                </div>
              </div>
              
              
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {overview}
            </p>
            
            <div className="flex space-x-3 pt-4">
              <Button 
                variant="default" 
                onClick={() => onTorrentSearch(title)}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Search className="w-4 h-4 mr-2" />
                Search Torrents
              </Button>
              <Button 
                variant="outline" 
                onClick={handleViewIMDB}
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on IMDB
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};