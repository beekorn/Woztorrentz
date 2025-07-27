import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

interface SearchSectionProps {
  title: string;
  placeholder: string;
  onSearch: (query: string) => void;
}

export const SearchSection = ({ title, placeholder, onSearch }: SearchSectionProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  return (
    <div className="text-center space-y-8 py-16">
      <h1 className="text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent tracking-wider">
        {title}
      </h1>
      
      <form onSubmit={handleSearch} className="flex items-center max-w-2xl mx-auto">
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="h-12 text-lg bg-input border-border rounded-l-lg rounded-r-none focus:ring-primary"
        />
        <Button 
          type="submit" 
          variant="search"
          className="h-12 px-8 rounded-l-none rounded-r-lg"
        >
          <Search className="w-5 h-5 mr-2" />
          SEARCH
        </Button>
      </form>
    </div>
  );
};