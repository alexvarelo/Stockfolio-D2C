import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { StockyLogo } from "@/components/brand/StockyLogo";
import { AISummaryContent } from "./AISummaryContent";

interface AISummaryDrawerProps {
  isOpen: boolean;
  onOpenChange: (_open: boolean) => void;
  portfolioId: string;
}

export const AISummaryDrawer = ({
  isOpen,
  onOpenChange,
  portfolioId,
}: AISummaryDrawerProps) => {
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[80vh] my-auto">
        <DrawerHeader>
          <DrawerTitle className="mx-auto flex items-center gap-2">
            <StockyLogo variant="ink" size={22} />
            Portfolio read
          </DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto py-2">
          <AISummaryContent portfolioId={portfolioId} open={isOpen} />
        </div>
      </DrawerContent>
    </Drawer>
  );
};
