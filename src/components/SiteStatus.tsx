import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { TorrentApiService } from "@/services/torrentApi";

export const SiteStatus = () => {
  const workingSites = TorrentApiService.getWorkingSites();

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <CheckCircle className="w-4 h-4 text-green-500" />
        <span className="text-sm font-medium text-green-700">
          {workingSites.length} Working Sites
        </span>
      </div>
      <div className="flex flex-wrap gap-1">
        {workingSites.map((site) => (
          <Badge key={site} variant="secondary" className="bg-green-100 text-green-800 text-xs">
            {site}
          </Badge>
        ))}
      </div>
    </div>
  );
};