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
    }
  };

  const navItems = [
    { id: "home", label: "FULL HOME PAGE" },
    { id: "top100", label: "TOP 100" },
    { id: "trending", label: "TRENDING" },
    { id: "contact", label: "CONTACT" },
    { id: "upload", label: "UPLOAD" },
    { id: "imdb", label: "IMDB TOP MOVIES" },
  ];

  return (
    <header className="w-full bg-background border-b border-border">
      <nav className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-8">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              onClick={() => onViewChange(item.id)}
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
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="text-sm font-medium">
            REGISTER
          </Button>
          <Button variant="ghost" className="text-sm font-medium text-primary">
            LOGIN
          </Button>
        </div>
      </nav>
    </header>
  );
};