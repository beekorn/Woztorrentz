import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Top100Props {
  onImdbSearch: (query: string) => void;
  onTorrentSearch: (query: string) => void;
}

export const Top100 = ({ onImdbSearch, onTorrentSearch }: Top100Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contentType, setContentType] = useState('hd_movies');

  useEffect(() => {
    // Simulate loading and show that this feature is not implemented yet
    setTimeout(() => {
      setError('Top 100 feature requires additional backend APIs that are not yet implemented.');
      setLoading(false);
    }, 1000);
  }, [contentType]);

  const handleContentTypeChange = (value: string) => {
    setContentType(value);
    setLoading(true);
    setTimeout(() => {
      setError('Top 100 feature requires additional backend APIs that are not yet implemented.');
      setLoading(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-4">Loading Top 100 {contentType.replace('-', ' ')}...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center py-6">
        <div className="flex items-center justify-center gap-4 mb-2">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            TOP 100
          </h1>
          <Select onValueChange={handleContentTypeChange} defaultValue={contentType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select content type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hd_movies">HD Movies</SelectItem>
              <SelectItem value="movies">Movies</SelectItem>
              <SelectItem value="music">Music</SelectItem>
              <SelectItem value="games">Games</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline">Feature Coming Soon</Badge>
        </div>
        <p className="text-muted-foreground mb-4">
          Top 100 lists will be available once the backend APIs are implemented.
        </p>
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
            <p className="text-yellow-800 text-sm">
              <strong>Notice:</strong> {error}
            </p>
            <p className="text-yellow-700 text-sm mt-2">
              You can still use the main movie/TV browsing and torrent search features available in other sections.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
