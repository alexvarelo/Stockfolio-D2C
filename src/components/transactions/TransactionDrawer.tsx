import { ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Plus } from 'lucide-react';
import { TransactionForm } from './TransactionForm';

import { PortfolioHolding } from '@/api/portfolio/portfolio';

interface TransactionDrawerProps {
  portfolioId: string;
  onTransactionAdded?: () => void;
  children?: ReactNode;
  holdings?: PortfolioHolding[];
}

export function TransactionDrawer({ portfolioId, onTransactionAdded, children, holdings = [] }: TransactionDrawerProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onTransactionAdded?.();
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Transaction
          </Button>
        )}
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-2xl">
          <DrawerHeader className="text-left">
            <DrawerTitle>Add New Transaction</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            <TransactionForm 
              portfolioId={portfolioId} 
              onSuccess={handleSuccess}
              onCancel={() => setOpen(false)}
              portfolioHoldings={holdings}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
