import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Copy, ExternalLink, Calendar, HardDrive, Users, UserMinus } from "lucide-react";
import { TorrentResult, TorrentApiService } from "@/services/torrentApi";
import { useToast } from "@/components/ui/use-toast";

interface TorrentCardProps extends TorrentResult {
  category?: string;
}

export const TorrentCard = ({ 
  name, 
  size, 
  date, 
  seeders, 
  leechers, 
  magnet, 
  url, 
  category 
}: TorrentCardProps) => {
  const { toast } = useToast();

  const condenseDescription = (text: string, maxLength: number = 80): string => {
    if (text.length <= maxLength) return text;
    
    // Find a good breaking point (word boundary)
    const truncated = text.substring(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    
    if (lastSpaceIndex > maxLength * 0.7) {
      return text.substring(0, lastSpaceIndex) + '...';
    }
    
    return truncated + '...';
  };

  const getCategoryBadgeClass = (category?: string) => {
    if (!category) return "bg-gray-500 text-gray-100";
    const lowerCategory = category.toLowerCase();
    if (lowerCategory.includes("movie")) return "bg-blue-600 text-blue-100";
    if (lowerCategory.includes("tv")) return "bg-purple-600 text-purple-100";
    if (lowerCategory.includes("music")) return "bg-pink-600 text-pink-100";
    if (lowerCategory.includes("anime")) return "bg-red-600 text-red-100";
    if (lowerCategory.includes("game")) return "bg-green-600 text-green-100";
    if (lowerCategory.includes("app")) return "bg-yellow-600 text-yellow-100";
    return "bg-gray-500 text-gray-100";
  };

  const handleCopyMagnet = () => {
    TorrentApiService.copyMagnetLink(magnet);
    toast({
      title: "Magnet link copied!",
      description: "The magnet link has been copied to your clipboard.",
    });
  };

  const handleOpenMagnet = () => {
    window.open(magnet, 'imdb_tab');
  };

  const handleOpenSource = () => {
    window.open(url, 'imdb_tab');
  };

  const getSeedersColor = (seeders: string) => {
    const count = parseInt(seeders) || 0;
    if (count >= 100) return "text-green-500";
    if (count >= 10) return "text-yellow-500";
    return "text-red-500";
  };

  const getLeechersColor = (leechers: string) => {
    const count = parseInt(leechers) || 0;
    if (count >= 50) return "text-orange-500";
    if (count >= 10) return "text-yellow-500";
    return "text-gray-500";
  };

  return (
    <Card className="w-full hover:shadow-lg transition-shadow duration-200 border-border bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="text-lg font-semibold text-foreground leading-tight flex-1" title={name}>
            {condenseDescription(name, 80)}
          </CardTitle>
          {category && (
            <Badge variant="default" className={`shrink-0 border-none ${getCategoryBadgeClass(category)}`}>
              {category}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Size:</span>
            <span className="font-medium text-foreground">
              {TorrentApiService.formatFileSize(size)}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Date:</span>
            <span className="font-medium text-foreground">{date}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Seeders:</span>
            <span className={`font-medium ${getSeedersColor(seeders)}`}>
              {seeders}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <UserMinus className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Leechers:</span>
            <span className={`font-medium ${getLeechersColor(leechers)}`}>
              {leechers}
            </span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 pt-2">
          <Button 
            onClick={handleOpenMagnet}
            className="flex items-center gap-2"
            size="sm"
          >
            <Download className="w-4 h-4" />
            Download
          </Button>
          
          <Button 
            onClick={handleCopyMagnet}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Copy className="w-4 h-4" />
            Copy Magnet
          </Button>
          
          {url && (
            <Button 
              onClick={handleOpenSource}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Source
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};