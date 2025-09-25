import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { AISummaryContent } from "./AISummaryContent";

interface AISummaryDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
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
          <DrawerTitle className="mx-10">AI Portfolio Summary</DrawerTitle>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto p-4">
          <AISummaryContent portfolioId={portfolioId} open={isOpen} />
        </div>
      </DrawerContent>
    </Drawer>
  );
};
