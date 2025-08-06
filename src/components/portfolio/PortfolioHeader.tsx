import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Eye, Lock, Users } from "lucide-react";

interface PortfolioHeaderProps {
  name: string;
  description: string | null;
  isPublic: boolean;
  followersCount: number;
  createdAt: string;
}

export const PortfolioHeader = ({
  name,
  description,
  isPublic,
  followersCount,
  createdAt,
}: PortfolioHeaderProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
        <Badge variant={isPublic ? "default" : "secondary"} className="gap-1">
          {isPublic ? (
            <>
              <Eye className="h-3 w-3" /> Public
            </>
          ) : (
            <>
              <Lock className="h-3 w-3" /> Private
            </>
          )}
        </Badge>
      </div>
      
      {description && (
        <p className="text-muted-foreground">{description}</p>
      )}
      
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>Created {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
        {isPublic && (
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {followersCount} {followersCount === 1 ? 'follower' : 'followers'}
          </span>
        )}
      </div>
    </div>
  );
};
