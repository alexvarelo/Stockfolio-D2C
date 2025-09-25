import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Lock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface PortfolioHeaderSectionProps {
  onBack: () => void;
  name: string;
  description: string | null;
  isPublic: boolean;
  followersCount: number;
  createdAt: string;
  actions: React.ReactNode;
}

export const PortfolioHeaderSection = ({
  onBack,
  name,
  description,
  isPublic,
  followersCount,
  createdAt,
  actions,
}: PortfolioHeaderSectionProps) => {
  return (
    <div className="flex flex-col gap-4 mb-6">
      {/* Back Button - Full width on mobile, left-aligned on desktop */}
      {/* <div className="w-full">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full sm:w-auto" 
          onClick={onBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Back to Portfolios</span>
          <span className="sm:hidden">Back</span>
        </Button>
      </div> */}

      {/* Header Content */}
      <div className="w-full">
        {/* Top row - Portfolio name and actions */}
        <div className="flex justify-between items-start gap-4 w-full mb-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{name}</h1>
            <div className="mt-1">
              <Badge variant={isPublic ? "default" : "secondary"} className="h-fit gap-1">
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
          </div>
          
          {/* Actions - Right side */}
          <div className="flex items-center gap-2">
            {actions}
          </div>
        </div>
        
        {/* Description - Full width */}
        {description && (
          <p className="text-muted-foreground text-sm sm:text-base mb-2">{description}</p>
        )}
        
        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-muted-foreground">
          <span>Created {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
          {isPublic && (
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {followersCount} {followersCount === 1 ? 'follower' : 'followers'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
