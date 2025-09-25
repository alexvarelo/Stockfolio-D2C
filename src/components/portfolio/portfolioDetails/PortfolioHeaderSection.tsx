import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PortfolioHeader } from "./PortfolioHeader";

interface PortfolioHeaderSectionProps {
  onBack: () => void;
  name: string;
  description: string;
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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 sm:mb-4">
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full sm:w-auto" 
        onClick={onBack}
      >
        <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
        {/* <span className="hidden sm:inline">Back to Portfolios</span>
        <span className="sm:hidden">Back</span> */}
      </Button>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        {actions}
      </div>

      <div className="w-full px-1 sm:px-0">
        <div className="flex items-center gap-2">
          <PortfolioHeader
            name={name}
            description={description}
            isPublic={isPublic}
            followersCount={followersCount}
            createdAt={createdAt}
          />
        </div>
      </div>
    </div>
  );
};
