import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { SearchSection } from "@/components/SearchSection";
import { MovieCard } from "@/components/MovieCard";
import { LiveMovieMeter } from "@/components/LiveMovieMeter";
import { TorrentSearch } from "@/components/TorrentSearch";
import { Top100 } from "@/components/Top100";



const Index = () => {
  const [currentView, setCurrentView] = useState("home");
  const [isLoading, setIsLoading] = useState(false);

  const [torrentQuery, setTorrentQuery] = useState("");

  // Ensure page starts at the top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSearch = async (query: string) => {
    const searchUrl = `https://www.imdb.com/find?q=${encodeURIComponent(query)}`;
    window.open(searchUrl, 'imdb_tab');
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    // Scroll to top when view changes
    window.scrollTo(0, 0);
  };

  const handleTorrentSearch = (query: string) => {
    setTorrentQuery(query);
    setCurrentView("home");
    window.scrollTo(0, 0);
  };



  return (
    <div className="min-h-screen bg-background">
      <Header 
        onSearch={handleSearch}
        currentView={currentView}
        onViewChange={handleViewChange}
      />
      
      <main className="container mx-auto px-4 py-4">
        {currentView === "home" && (
          <>
            <div className="text-center py-8">
              <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent tracking-wider mb-6">
                WOZTORRENTZ
              </h1>
            </div>
            <TorrentSearch initialQuery={torrentQuery} />
          </>
        )}
        
        {currentView === "top100" && (
          <Top100 onImdbSearch={handleSearch} onTorrentSearch={handleTorrentSearch} />
        )}

        
        
        {currentView === "imdb" && (
          <>
            <div className="text-center py-8">
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent tracking-wider">
                Movie Database (TMDB)
              </h1>
            </div>
            <LiveMovieMeter onTorrentSearch={handleTorrentSearch} />
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
        <p> 2024 Woz Torrentz. Educational purposes only.</p>
      </footer>
    </div>
  );
};

export default Index;