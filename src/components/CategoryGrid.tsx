import { Button } from "@/components/ui/button";
import { 
  Film, 
  Tv, 
  Gamepad2, 
  Music, 
  Monitor, 
  Eye, 
  Video, 
  MoreHorizontal 
} from "lucide-react";

interface CategoryGridProps {
  onCategorySelect: (category: string) => void;
}

export const CategoryGrid = ({ onCategorySelect }: CategoryGridProps) => {
  const categories = [
    { id: "movies", label: "MOVIES", icon: Film },
    { id: "television", label: "TELEVISION", icon: Tv },
    { id: "games", label: "GAMES", icon: Gamepad2 },
    { id: "music", label: "MUSIC", icon: Music },
    { id: "applications", label: "APPLICATIONS", icon: Monitor },
    { id: "anime", label: "ANIME", icon: Eye },
    { id: "documentaries", label: "DOCUMENTARIES", icon: Video },
    { id: "other", label: "OTHER", icon: MoreHorizontal },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 max-w-6xl mx-auto px-6">
      {categories.map((category) => {
        const IconComponent = category.icon;
        return (
          <Button
            key={category.id}
            variant="category"
            onClick={() => onCategorySelect(category.id)}
            className="h-32 flex-col space-y-3 text-sm font-semibold tracking-wide"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center">
              <IconComponent className="w-6 h-6 text-primary-foreground" />
            </div>
            {category.label}
          </Button>
        );
      })}
    </div>
  );
};