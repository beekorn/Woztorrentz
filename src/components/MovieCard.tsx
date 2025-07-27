import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Calendar, User, ExternalLink } from "lucide-react";

interface MovieCardProps {
  title: string;
  year: string;
  rating: string;
  director: string;
  actors: string;
  plot: string;
  poster: string;
  imdbID: string;
}

export const MovieCard = ({ 
  title, 
  year, 
  rating, 
  director, 
  actors, 
  plot, 
  poster,
  imdbID 
}: MovieCardProps) => {
  const handleSearchTorrents = () => {
    // This would integrate with torrent search in a real implementation
    console.log(`Searching torrents for: ${title}`);
  };

  const handleViewIMDB = () => {
    window.open(`https://www.imdb.com/title/${imdbID}`, '_blank');
  };

  return (
    <Card className="overflow-hidden hover:shadow-card transition-all duration-300 hover:scale-[1.02]">
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-48 flex-shrink-0">
            <img 
              src={poster !== "N/A" ? poster : "/placeholder.svg"} 
              alt={title}
              className="w-full h-64 md:h-full object-cover"
            />
          </div>
          
          <div className="flex-1 p-6 space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer">
                {title} ({year})
              </h3>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{rating}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{year}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{director}</span>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <strong>Cast:</strong> {actors}
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {plot}
            </p>
            
            <div className="flex space-x-3 pt-4">
              <Button 
                variant="default" 
                onClick={handleSearchTorrents}
                className="flex-1"
              >
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