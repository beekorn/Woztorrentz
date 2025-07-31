import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

interface HeaderProps {
  onSearch: (query: string) => void;
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Header = ({ onSearch, currentView, onViewChange }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      setSearchQuery("");
    }
  };

  const navItems = [
    { id: "home", label: "Search" },
    { id: "top100", label: "Top 100" },
    { id: 'imdb', label: 'Movie Database (TMDB)' },
    { id: "moviemeter", label: "IMDB Movie Meter" },
    { id: "tvmeter", label: "IMDB TV Meter" },
  ];

  return (
    <header className="w-full bg-background border-b border-border">
      <nav className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-8">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => {
                if (item.id === 'moviemeter') {
                  window.open('https://www.imdb.com/chart/moviemeter', 'imdb_tab');
                } else if (item.id === 'tvmeter') {
                  window.open('https://www.imdb.com/chart/tvmeter', 'imdb_tab');
                } else {
                  onViewChange(item.id);
                }
              }}
              className={`text-sm font-medium transition-colors ${
                currentView === item.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </Button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex w-full max-w-md items-center space-x-2">
          <div className="relative flex-grow">
            <Input
              type="search"
              placeholder="Search IMDB..."
              className="w-full pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          <Button type="submit">Search</Button>
        </form>
      </nav>
    </header>
  );
};