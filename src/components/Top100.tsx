import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TorrentApiService, type TorrentResult } from "@/services/torrentApi";
import { TorrentCard } from "@/components/TorrentCard";
import { getApiUrl } from "@/config/api";

interface Top100Props {
  onImdbSearch: (query: string) => void;
  onTorrentSearch: (query: string) => void;
}

export const Top100 = ({ onImdbSearch, onTorrentSearch }: Top100Props) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contentType, setContentType] = useState('hd_movies');
  const [categories, setCategories] = useState<{ value: string; label: string; }[]>([]);
  const [torrents, setTorrents] = useState<TorrentResult[]>([]);

  useEffect(() => {
const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Try to fetch categories from backend first
        let categoryResponse;
        let categoryData;
        
        try {
          categoryResponse = await fetch(`${getApiUrl('torrent')}/api/v1/top100/categories`);
          if (categoryResponse.ok) {
            categoryData = await categoryResponse.json();
          } else {
            throw new Error('Backend unavailable');
          }
        } catch {
          // Fallback to Netlify function
          categoryResponse = await fetch(`${getApiUrl('netlify')}/api/v1/top100/categories`);
          categoryData = await categoryResponse.json();
        }
        
        setCategories(categoryData.categories || []);

        // Try to fetch torrents from backend first
        let torrentsResponse;
        let torrentData;
        
        try {
          torrentsResponse = await fetch(`${getApiUrl('torrent')}/api/v1/top100/category/${contentType}`);
          if (torrentsResponse.ok) {
            torrentData = await torrentsResponse.json();
            if (torrentData.data && torrentData.data.length > 0) {
              setTorrents(torrentData.data);
              return; // Success - exit early
            }
          }
          throw new Error('Backend data unavailable');
        } catch {
          // Fallback to Netlify function (which will show helpful message)
          torrentsResponse = await fetch(`${getApiUrl('netlify')}/api/v1/top100/category/${contentType}`);
          torrentData = await torrentsResponse.json();
          
          if (torrentData.error) {
            throw new Error(torrentData.message || 'Backend service temporarily unavailable');
          }
          setTorrents(torrentData.data || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setTorrents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [contentType]);

  const handleContentTypeChange = (value: string) => {
    setContentType(value);
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
              {categories.map(category => (
                <SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
        {!error && torrents.length > 0 && (
          <div className="mt-6">
            <h2 className="text-2xl font-semibold mb-4">Top 100 {contentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {torrents.map((torrent, index) => (
                <div key={torrent.hash || index} className="relative">
                  <div className="absolute -top-2 -left-2 bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold z-10">
                    {index + 1}
                  </div>
                  <TorrentCard 
                    {...torrent}
                    category={contentType.replace('_', ' ')}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
