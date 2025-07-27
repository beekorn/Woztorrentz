import { useState } from "react";
import { Header } from "@/components/Header";
import { SearchSection } from "@/components/SearchSection";
import { CategoryGrid } from "@/components/CategoryGrid";
import { MovieCard } from "@/components/MovieCard";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const [currentView, setCurrentView] = useState("home");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Sample movie data for demonstration
  const sampleMovies = [
    {
      title: "The Shawshank Redemption",
      year: "1994",
      rating: "9.3/10",
      director: "Frank Darabont",
      actors: "Tim Robbins, Morgan Freeman, Bob Gunton",
      plot: "Chronicles the experiences of a formerly successful banker as a prisoner in the gloomy jailhouse of Shawshank after being found guilty of a crime he did not commit. The film portrays the man's unique way of dealing with his new, torturous life; along the way he befriends a number of fellow prisoners, most notably a wise long-term inmate named Red.",
      poster: "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg",
      imdbID: "tt0111161"
    },
    {
      title: "The Godfather",
      year: "1972",
      rating: "9.2/10",
      director: "Francis Ford Coppola",
      actors: "Marlon Brando, Al Pacino, James Caan",
      plot: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
      poster: "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzUwNjQ4Nzg@._V1_SX300.jpg",
      imdbID: "tt0068646"
    }
  ];

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    try {
      // In a real implementation, this would call the OMDB API
      // For now, we'll simulate a search
      setTimeout(() => {
        setSearchResults(sampleMovies.filter(movie => 
          movie.title.toLowerCase().includes(query.toLowerCase())
        ));
        setIsLoading(false);
        toast({
          title: "Search completed",
          description: `Found results for "${query}"`,
        });
      }, 1000);
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Search failed",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  const handleCategorySelect = (category: string) => {
    toast({
      title: "Category selected",
      description: `Browsing ${category} content`,
    });
    setCurrentView(category);
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    if (view === "imdb") {
      setSearchResults(sampleMovies);
    } else if (view === "home") {
      setSearchResults([]);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onSearch={handleSearch}
        currentView={currentView}
        onViewChange={handleViewChange}
      />
      
      <main className="container mx-auto px-4 py-8">
        {currentView === "home" && (
          <>
            <SearchSection 
              title="WOZTORRENTZ"
              placeholder="Search for torrents..."
              onSearch={handleSearch}
            />
            <CategoryGrid onCategorySelect={handleCategorySelect} />
          </>
        )}
        
        {currentView === "imdb" && (
          <>
            <SearchSection 
              title="IMDB TOP MOVIES"
              placeholder="Search for a movie..."
              onSearch={handleSearch}
            />
            
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">IMDB Top Movies</h2>
                <p className="text-muted-foreground">
                  Found {searchResults.length} movies for "IMDB Top Movies"
                </p>
              </div>
              
              <div className="space-y-4">
                {searchResults.map((movie, index) => (
                  <MovieCard key={index} {...movie} />
                ))}
              </div>
            </div>
          </>
        )}
        
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">Searching...</p>
          </div>
        )}
      </main>
      
      <footer className="mt-16 py-8 text-center text-muted-foreground border-t border-border">
        <p>© 2024 Woz Torrentz. Educational purposes only.</p>
      </footer>
    </div>
  );
};

export default Index;