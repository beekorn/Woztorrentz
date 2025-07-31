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
    <div className="relative py-8">
      <div className="absolute top-0 right-0 w-full max-w-md">
        <form onSubmit={handleSearch} className="flex items-center">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="h-10 text-base bg-input border-border rounded-l-md rounded-r-none focus:ring-primary"
          />
          <Button 
            type="submit" 
            variant="default"
            className="h-10 px-6 rounded-l-none rounded-r-md"
          >
            <Search className="w-5 h-5" />
          </Button>
        </form>
      </div>
      <h1 className="text-center text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent tracking-wider">
        {title}
      </h1>
    </div>
  );
};