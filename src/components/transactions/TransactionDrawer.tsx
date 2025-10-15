import { ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Plus } from 'lucide-react';
import { TransactionForm } from './TransactionForm';

import { PortfolioHolding } from '@/api/portfolio/portfolio';

interface TransactionDrawerProps {
  portfolioId?: string;
  onTransactionAdded?: () => void;
  children?: ReactNode;
  holdings?: PortfolioHolding[];
  showPortfolioSelector?: boolean;
  instrumentTicker?: string;
  instrumentName?: string;
  currentPrice?: number;
}

export function TransactionDrawer({
  portfolioId,
  onTransactionAdded,
  children,
  holdings = [],
  showPortfolioSelector = false,
  instrumentTicker,
  instrumentName,
  currentPrice
}: TransactionDrawerProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onTransactionAdded?.();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Transaction
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full max-w-4xl flex flex-col h-full">
        <SheetHeader className="text-left">
          <SheetTitle>Add New Transaction</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-hidden">
          <TransactionForm
            portfolioId={portfolioId}
            onSuccess={handleSuccess}
            onCancel={() => setOpen(false)}
            portfolioHoldings={holdings}
            showPortfolioSelector={showPortfolioSelector}
            instrumentTicker={instrumentTicker}
            instrumentName={instrumentName}
            currentPrice={currentPrice}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
