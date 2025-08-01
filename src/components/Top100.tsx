import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TorrentApiService, type TorrentResult } from "@/services/torrentApi";
import { getApiUrl } from "@/config/api";
import { Download, Copy, ExternalLink, Calendar, HardDrive, Users, UserMinus } from "lucide-react";

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
          <div className="mt-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Most popular {contentType.replace('_', ' ')} sorted by seeders from Pirate Bay</h2>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Source</Badge>
                <span className="text-sm text-muted-foreground">Data from Pirate Bay</span>
              </div>
            </div>
            <div className="space-y-4">
              {torrents.map((torrent, index) => {
                const formatFileSize = (size: string): string => {
                  if (!size || size === 'N/A') return 'Unknown';
                  return size;
                };

                const getSeedersColor = (seeders: number) => {
                  if (seeders >= 1000) return 'text-green-500';
                  if (seeders >= 100) return 'text-yellow-500';
                  return 'text-red-500';
                };

                const getLeechersColor = (leechers: number) => {
                  if (leechers >= 1000) return 'text-red-500';
                  if (leechers >= 100) return 'text-orange-500';
                  return 'text-gray-500';
                };

                return (
                  <div key={torrent.hash || index} className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-shadow">
                    <div className="flex flex-col space-y-4">
                      {/* Header with ranking and title */}
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-600 text-white rounded-lg px-3 py-2 font-bold text-lg min-w-[60px] text-center">
                          #{index + 1}.
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-foreground leading-tight mb-2">
                            {torrent.name}
                          </h3>
                          
                          {/* Metadata row */}
                          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <HardDrive className="w-4 h-4" />
                              <span>{formatFileSize(torrent.size)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{torrent.date}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span className={getSeedersColor(typeof torrent.seeders === 'string' ? parseInt(torrent.seeders) : torrent.seeders)}>
                                {torrent.seeders}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <UserMinus className="w-4 h-4" />
                              <span className={getLeechersColor(typeof torrent.leechers === 'string' ? parseInt(torrent.leechers) : torrent.leechers)}>
                                {torrent.leechers}
                              </span>
                            </div>
                            <div className="text-muted-foreground">
                              Uploaded by {torrent.uploader}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex flex-wrap gap-2">
                        <Button className="flex items-center gap-2" size="sm" onClick={() => onTorrentSearch(torrent.magnet)}>
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-2" 
                          onClick={() => {
                            navigator.clipboard.writeText(torrent.magnet);
                            toast({title: "Magnet link copied!", description: "The magnet link has been copied to your clipboard."});
                          }}
                        >
                          <Copy className="w-4 h-4" />
                          Copy Magnet
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-2" 
                          onClick={() => window.open(torrent.url, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                          Source
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-2 text-blue-600" 
                          onClick={() => onImdbSearch(torrent.name)}
                        >
                          Search Torrent
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center gap-2 text-orange-600" 
                          onClick={() => window.open(`https://www.imdb.com/find?q=${encodeURIComponent(torrent.name)}`, '_blank')}
                        >
                          Search IMDB
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
