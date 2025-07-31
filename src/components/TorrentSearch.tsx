import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, TrendingUp, Clock, Loader2 } from "lucide-react";
import { TorrentCard } from "./TorrentCard";
import { SiteStatus } from "./SiteStatus";
import { TorrentApiService, TorrentResult } from "@/services/torrentApi";

interface TorrentSearchProps {
  initialQuery?: string;
}

export const TorrentSearch = ({ initialQuery }: TorrentSearchProps) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery || "");
  const [selectedSite, setSelectedSite] = useState<string>("piratebay");
  const [searchResults, setSearchResults] = useState<TorrentResult[]>([]);
  const [supportedSites, setSupportedSites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const result = await TorrentApiService.searchTorrents(query, selectedSite);

      if (result.success && result.data?.data) {
        setSearchResults(result.data.data);

      } else {
        setSearchResults([]);

      }
    } catch (error) {
      setSearchResults([]);

    } finally {
      setIsLoading(false);
      setSearchQuery("");
    }
  };

  useEffect(() => {
    const loadSupportedSites = async () => {
      const sites = TorrentApiService.getWorkingSites();
      setSupportedSites(sites);
    };
    loadSupportedSites();
  }, []);

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      runSearch(initialQuery);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(searchQuery);
  };



  return (
    <div className="space-y-4">
      {/* Site Status */}
      <SiteStatus />
      
      {/* Search Form */}
      <div className="bg-card border border-border rounded-lg p-4">
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for torrents..."
                className="h-10"
                disabled={isLoading}
              />
            </div>
            
            <div className="md:w-48">
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  {supportedSites.map((site) => (
                    <SelectItem key={site} value={site}>
                      {site} ✅
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:w-48">

            </div>
            
            <Button 
              type="submit" 
              className="h-10 px-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Search className="w-5 h-5 mr-2" />
              )}
              SEARCH
            </Button>
          </div>
        </form>
      </div>

      {/* Results Tabs */}
      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Search Results
          </TabsTrigger>

        </TabsList>

        <TabsContent value="search" className="space-y-3">
          {searchResults.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Search Results</h2>
                <p className="text-sm text-muted-foreground">
                  {searchResults.length} torrents
                </p>
              </div>
              <div className="space-y-3">
                {searchResults.map((torrent, index) => (
                  <TorrentCard key={index} {...torrent} />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-foreground mb-1">No search results</h3>
              <p className="text-sm text-muted-foreground">
                Enter a search query above to find torrents
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};