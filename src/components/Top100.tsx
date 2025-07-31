import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Copy, ExternalLink, Calendar, User, HardDrive, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TorrentResult {
  name: string;
  size?: string;
  seeders?: number;
  leechers?: number;
  uploader?: string;
  url?: string;
  date?: string;
  language?: string;
  hash?: string;
  magnet?: string;
  // TMDB data fields
  title?: string;
  year?: string;
  posterUrl?: string;
  backdropUrl?: string;
  voteAverage?: number;
  overview?: string;
  imdbId?: string;
}

interface Top100Props {
  onImdbSearch: (query: string) => void;
  onTorrentSearch: (query: string) => void;
}

interface Top100Response {
  data: TorrentResult[];
  total?: number;
  page?: number;
  limit?: number;
  source?: string;
  time?: number;
  success?: boolean;
  lastUpdated?: string;
  error?: string | null;
}

const cleanTitleForImdb = (torrentName: string): string => {
  let cleanedTitle = torrentName;

  // Check if it's a TV series (look for season/episode patterns)
  const isTvSeries = /\b(S\d{1,2}E\d{1,2}|Season\s*\d+|Episode\s*\d+|\d{1,2}x\d{1,2})\b/i.test(torrentName);
  
  if (isTvSeries) {
    // For TV series, remove season/episode info and everything after it
    cleanedTitle = cleanedTitle
      .replace(/\b(S\d{1,2}E\d{1,2}|Season\s*\d+.*|Episode\s*\d+.*|\d{1,2}x\d{1,2}.*)\b.*/i, '')
      .replace(/\b(Complete.*|Collection.*|Series.*|Season.*)/i, '')
      .trim();
  } else {
    // For movies, handle year extraction
    const yearRegex = /(19\d{2}|20\d{2})/;
    const match = torrentName.match(yearRegex);

    if (match) {
      const titleEndIndex = match.index || 0;
      cleanedTitle = torrentName.substring(0, titleEndIndex);
    }
  }

  // Common cleaning for both movies and TV series
  cleanedTitle = cleanedTitle
    .replace(/[._]/g, ' ')
    .replace(/\b(1080p|720p|480p|2160p|4K|BluRay|WEBRip|WEB-DL|DVDRip|BRRip|x264|x265|H264|H265|HEVC|AAC|DTS|AC3|DD5\.1|HD|UHD|HDR|HDR10|DV|EXTENDED|REMASTERED|PROPER|REPACK|iNTERNAL|LIMITED|COMPLETE|UNCUT|DIRECTORS?\s*CUT|FRENCH|SPANISH|GERMAN|ITALIAN|RUSSIAN|SUBBED|DUAL\s*AUDIO|YTS|YIFY|RARBG|EZTV|TGx|PSA|ION10|AMZN|NF|HULU|DSNP|HBO|MAX)\b/gi, '')
    .replace(/\b(mkv|avi|mp4|mov|wmv|flv|webm)\b/gi, '') // Remove file extensions
    .replace(/\[.*?\]/g, '') // Remove content in square brackets
    .replace(/\(.*?\)/g, '') // Remove content in parentheses that might contain group names
    .replace(/\s+/g, ' ')
    .trim();

  // For movies, add year back if we found one
  if (!isTvSeries) {
    const yearRegex = /(19\d{2}|20\d{2})/;
    const match = torrentName.match(yearRegex);
    if (match && cleanedTitle) {
      cleanedTitle = `${cleanedTitle} ${match[0]}`;
    }
  }

  return cleanedTitle || torrentName;
};

export const Top100 = ({ onImdbSearch, onTorrentSearch }: Top100Props) => {
  const { toast } = useToast();
  const [items, setItems] = useState<TorrentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [contentType, setContentType] = useState('hd_movies'); // 'hd_movies' or other category name
  const [availableCategories, setAvailableCategories] = useState<{value: string, label: string, id: number}[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const fetchTop100 = async (type: string, page: number = 1) => {
    setLoading(true);
    setError(null);
    
    let url = '';
    if (type === 'movies') {
      url = `http://127.0.0.1:8011/api/v1/top100/movies?page=${page}&limit=100`;
    } else {
      url = `http://127.0.0.1:8011/api/v1/top100/category/${type}?page=${page}&limit=100`;
    }

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: Top100Response = await response.json();
      
      if (data.data && data.data.length > 0) {
        setItems(data.data);

      } else {
        setError(`No ${contentType.replace('-', ' ')} found`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to fetch top ${contentType.replace('-', ' ')}`;
      setError(errorMessage);

    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8011/api/v1/top100/categories');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.categories) {
        setAvailableCategories(data.categories);
      }
    } catch (err) {
      // Handle error silently, the default dropdown will be used
      console.error("Failed to fetch categories:", err);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTop100(contentType, currentPage);
  }, [contentType, currentPage]);

  const handleDownload = (magnet: string, name: string) => {
    window.open(magnet, 'imdb_tab');
    toast({
      title: "Magnet link opened",
      description: `Opening magnet link for "${name.substring(0, 50)}..."`,
    });
  };

    const handleCopyMagnet = (magnet: string, name: string) => {
    navigator.clipboard.writeText(magnet);
    toast({
      title: "Magnet link copied",
      description: `Copied magnet for "${name.substring(0, 50)}..." to clipboard.`,
    });
    window.open(magnet, 'imdb_tab');
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleContentTypeChange = (value: string) => {
    setContentType(value);
    setCurrentPage(1);
  };

  // Function to get the Pirate Bay browse URL for the current category
  const getPirateBaySourceUrl = () => {
    // Find the current category in availableCategories to get its ID
    const currentCategory = availableCategories.find(cat => cat.value === contentType);
    
    if (currentCategory && currentCategory.id) {
      // Use the category ID from the API response
      return `https://thehiddenbay.com/browse/${currentCategory.id}/1/7/0`;
    }
    
    // Fallback mapping for default categories when API categories aren't loaded
    const categoryMap: { [key: string]: number } = {
      'hd_movies': 207,
      'movies': 201,
      'music': 100,
      'games': 400,
      'tv': 205,
      'apps': 300,
      'porn': 500,
      'other': 600
    };
    
    const categoryId = categoryMap[contentType] || 207; // Default to HD Movies
    return `https://thehiddenbay.com/browse/${categoryId}/1/7/0`;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-4">Loading Top 100 {contentType.replace('-', ' ')}...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive mb-4">Error: {error}</p>
        <Button onClick={() => fetchTop100(contentType, currentPage)} variant="outline">
          Try Again
        </Button>
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
              {availableCategories.length > 0 ? (
                availableCategories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))
              ) : (
                <>
                  <SelectItem value="hd_movies">HD Movies</SelectItem>
                  <SelectItem value="movies">Movies</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="games">Games</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
          <Button
            onClick={() => window.open(getPirateBaySourceUrl(), 'piratebay_source')}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            Source
          </Button>
          <Badge variant="outline">Data from Pirate Bay</Badge>
        </div>
        <p className="text-muted-foreground">
          Most popular {contentType === 'movies' ? 'movies' : contentType.replace('_', ' ')} sorted by seeders from Pirate Bay
        </p>
      </div>

      <div className="grid gap-4">
        {items.map((item, index) => {
          // Determine if this is a torrent result or TMDB result based on available fields
          const isTorrentResult = Boolean(item.hash && item.magnet && item.seeders !== undefined);
          const displayTitle = item.title || item.name;
          const keyProp = isTorrentResult ? `${item.hash}-${index}` : `${item.imdbId || index}-${index}`;
          
          return (
            <Card key={keyProp} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle 
                    className="text-lg font-semibold leading-tight flex-1 mr-4 min-w-0"
                    style={{ 
                      wordWrap: 'break-word', 
                      wordBreak: 'break-all', 
                      overflowWrap: 'anywhere',
                      whiteSpace: 'normal'
                    }}
                  >
                    #{currentPage === 1 ? index + 1 : (currentPage - 1) * 100 + index + 1}. {displayTitle}
                  </CardTitle>
                  <div className="flex gap-2 flex-shrink-0">
                    {isTorrentResult ? (
                      <>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          ↑ {item.seeders}
                        </Badge>
                        <Badge variant="outline" className="text-red-600">
                          ↓ {item.leechers}
                        </Badge>
                      </>
                    ) : (
                      <>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          ⭐ {item.voteAverage?.toFixed(1) || 'N/A'}
                        </Badge>
                        <Badge variant="outline" className="text-blue-600">
                          {item.year || 'N/A'}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {isTorrentResult ? (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <HardDrive className="h-4 w-4" />
                      <span>{item.size}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{item.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{item.uploader}</span>
                    </div>
                    <Badge variant="outline" className="ml-auto">
                      {item.language}
                    </Badge>
                  </div>
                ) : (
                  <div className="mb-4">
                    {item.overview && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-3">
                        {item.overview}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">TMDB</Badge>
                      {item.imdbId && (
                        <Badge variant="outline" className="text-blue-600">
                          IMDb: {item.imdbId}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {isTorrentResult && (
                    <>
                      <Button
                        onClick={() => handleDownload(item.magnet!, item.name)}
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                      
                      <Button
                        onClick={() => handleCopyMagnet(item.magnet!, item.name)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Copy className="w-4 h-4" />
                        Copy Magnet
                      </Button>
                      
                      <Button
                        onClick={() => window.open(item.url!, 'imdb_tab')}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Source
                      </Button>
                    </>
                  )}

                  <Button
                    onClick={() => onTorrentSearch(cleanTitleForImdb(displayTitle))}
                    size="sm"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                  >
                    <Search className="w-4 h-4" />
                    Search Torrent
                  </Button>
                  <Button
                    onClick={() => window.open(`https://www.imdb.com/find?q=${encodeURIComponent(cleanTitleForImdb(displayTitle))}`, 'imdb_tab')}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Search IMDB
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-8">
        <Button
          variant="outline"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          Previous
        </Button>
        <span className="flex items-center px-4 text-sm text-muted-foreground">
          Page {currentPage}
        </span>
        <Button
          variant="outline"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={items.length < 100}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
