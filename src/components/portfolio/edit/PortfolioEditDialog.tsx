import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Pencil, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useUpdatePortfolio, useUpdatePortfolioHoldings, useDeletePortfolioHolding } from '@/api/portfolio/portfolio';
import type { Portfolio, PortfolioHolding } from '@/api/portfolio/portfolio';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PortfolioDetailsForm } from './PortfolioDetailsForm';
import { HoldingsList } from './HoldingsList';
import { AddHoldingForm } from './AddHoldingForm';

interface PortfolioEditDialogProps {
  portfolio: Portfolio;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}

export const PortfolioEditDialog = ({ 
  portfolio, 
  isOpen, 
  onOpenChange,
  onSaved
}: PortfolioEditDialogProps) => {
  const { toast } = useToast();
  const { mutateAsync: updatePortfolio } = useUpdatePortfolio();
  const [activeTab, setActiveTab] = useState<'details' | 'holdings'>('details');
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [isAddingHolding, setIsAddingHolding] = useState(false);
  
  const queryClient = useQueryClient();
  const { mutateAsync: updateHolding } = useUpdatePortfolioHoldings();
  const { mutateAsync: deleteHolding } = useDeletePortfolioHolding();

  // Initialize holdings when portfolio changes
  useEffect(() => {
    if (portfolio?.holdings) {
      setHoldings(portfolio.holdings);
    }
  }, [portfolio]);

  const handleSave = async (updatedData: Partial<Portfolio>) => {
    try {
      await updatePortfolio({
        portfolioId: portfolio.id,
        portfolioData: updatedData
      });
      
      toast({
        title: 'Portfolio updated',
        description: 'Your portfolio has been successfully updated.',
      });
      
      onOpenChange(false);
      onSaved?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update portfolio. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleAddHolding = async (newHolding: Omit<PortfolioHolding, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await updateHolding({
        portfolioId: portfolio.id,
        holding: newHolding
      });
      // Invalidate the portfolio query to refresh the data
      queryClient.invalidateQueries({ queryKey: ['portfolio', portfolio.id] });
      setIsAddingHolding(false);
    } catch (error) {
      // Error is handled by the mutation
      throw error;
    }
  };

  const handleUpdateHolding = async (updatedHolding: PortfolioHolding) => {
    try {
      await updateHolding({
        portfolioId: portfolio.id,
        holding: updatedHolding
      });
    } catch (error) {
      // Error is handled by the mutation
      throw error;
    }
  };

  const handleDeleteHolding = async (ticker: string) => {
    try {
      await deleteHolding({
        portfolioId: portfolio.id,
        ticker
      });
    } catch (error) {
      // Error is handled by the mutation
      throw error;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Pencil className="h-4 w-4" />
          Edit Portfolio
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Portfolio</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'details' | 'holdings')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="mt-6">
            <PortfolioDetailsForm 
              portfolio={portfolio} 
              onSave={handleSave} 
              onCancel={() => onOpenChange(false)}
            />
          </TabsContent>
          
          <TabsContent value="holdings" className="mt-6 space-y-6">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Portfolio Holdings</h3>
                <Button 
                  size="sm" 
                  onClick={() => setIsAddingHolding(true)}
                  disabled={isAddingHolding}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Holding
                </Button>
              </div>
              
              {isAddingHolding && (
                <div className="p-4 border rounded-lg bg-card">
                  <AddHoldingForm 
                    onSave={handleAddHolding}
                    onCancel={() => setIsAddingHolding(false)}
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">CURRENT HOLDINGS</h4>
              {holdings.length > 0 ? (
                <HoldingsList 
                  holdings={holdings} 
                  onUpdateHolding={handleUpdateHolding}
                  onDeleteHolding={handleDeleteHolding}
                  className="border rounded-lg overflow-hidden"
                />
              ) : (
                <div className="text-center py-8 border rounded-lg">
                  <p className="text-muted-foreground">No holdings yet. Add your first holding to get started.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
