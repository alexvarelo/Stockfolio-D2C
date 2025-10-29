import { useState, useEffect } from 'react';
import { useWatchlists } from '@/api/watchlist/useWatchlists';
import { useAddToWatchlist } from '@/api/watchlist/useWatchlistItems';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, Plus, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

type AddToWatchlistProps = {
  ticker: string;
  watchlistId?: string; // If provided, add directly to this watchlist
  buttonVariant?: 'default' | 'outline' | 'ghost' | 'link';
  buttonSize?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  onAdded?: () => void;
};

export function AddToWatchlist({ 
  ticker, 
  watchlistId,
  buttonVariant = 'outline',
  buttonSize = 'default',
  className = '',
  onAdded
}: AddToWatchlistProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedWatchlistId, setSelectedWatchlistId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  
  const { data: watchlists, isLoading, refetch } = useWatchlists();
  const { mutateAsync: addToWatchlist, isPending } = useAddToWatchlist(watchlistId || '');

  // If watchlistId is provided, add directly without showing popover
  const handleDirectAdd = async () => {
    if (!watchlistId) return;
    
    try {
      await addToWatchlist(
        {
          ticker,
          notes: null
        },
        {
          onSuccess: () => {
            toast({
              title: 'Added to watchlist',
              description: `${ticker} has been added to your watchlist.`,
            });
            if (onAdded) {
              onAdded();
            }
          },
          onError: (error) => {
            console.error('Error adding to watchlist:', error);
            toast({
              title: 'Error',
              description: error instanceof Error ? error.message : 'Failed to add to watchlist. Please try again.',
              variant: 'destructive',
            });
          }
        }
      );
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedWatchlistId(null);
      setIsCreatingNew(false);
    }
  }, [isOpen]);
  
  const handleAddToWatchlist = async (watchlistId: string) => {
    if (!watchlistId) return;
    
    try {
      await addToWatchlist(
        {
          ticker,
          notes: null

        },
        {
          onSuccess: () => {
            toast({
              title: 'Added to watchlist',
              description: `${ticker} has been added to your watchlist.`,
            });
            if (onAdded) {
              onAdded();
            }
            setIsOpen(false);
          },
          onError: (error) => {
            console.error('Error adding to watchlist:', error);
            toast({
              title: 'Error',
              description: error instanceof Error ? error.message : 'Failed to add to watchlist. Please try again.',
              variant: 'destructive',
            });
          }
        }
      );
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const handleCreateNew = () => {
    setIsCreatingNew(true);
    console.log('Navigate to create watchlist with ticker:', ticker);
  };

  // If watchlistId is provided, add directly without popover
  if (watchlistId) {
    return (
      <Button 
        variant={buttonVariant} 
        size={buttonSize}
        className={`gap-2 ${className}`}
        onClick={handleDirectAdd}
        disabled={isPending}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        <span>Add to Watchlist</span>
      </Button>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant={buttonVariant} 
          size={buttonSize}
          className={`gap-2 ${className}`}
          onClick={() => refetch()}
        >
          <Plus className="h-4 w-4" />
          <span>Add to Watchlist</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="end">
        {isLoading ? (
          <div className="p-4 flex justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : isCreatingNew ? (
          <div className="p-4">
            <p className="text-sm text-center mb-4">
              Create a new watchlist for {ticker}
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                // In a real app, this would navigate to the create watchlist page
                // with a callback to add the ticker after creation
                window.location.href = `/watchlists/new?ticker=${ticker}`;
              }}
            >
              Create New Watchlist
            </Button>
            <Button 
              variant="ghost" 
              className="w-full mt-2"
              onClick={() => setIsCreatingNew(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <>
            <div className="p-2 border-b">
              <p className="text-sm font-medium text-center">Add {ticker} to...</p>
            </div>
            
            <ScrollArea className="max-h-60 overflow-y-auto">
              {watchlists?.length === 0 ? (
                <div className="p-4 text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    No watchlists yet
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleCreateNew}
                  >
                    Create Watchlist
                  </Button>
                </div>
              ) : (
                <div className="py-1">
                  {watchlists?.map((watchlist) => (
                    <button
                      key={watchlist.id}
                      className={`w-full px-4 py-2 text-sm text-left hover:bg-muted/50 flex items-center justify-between ${
                        selectedWatchlistId === watchlist.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => setSelectedWatchlistId(watchlist.id)}
                    >
                      <span className="truncate">{watchlist.name}</span>
                      {selectedWatchlistId === watchlist.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
            
            <div className="p-2 border-t flex flex-col space-y-1">
              {selectedWatchlistId && (
                <Button
                  size="sm"
                  className={`w-full ${isPending ? 'opacity-50' : ''}`}
                  onClick={() => handleAddToWatchlist(selectedWatchlistId || '')}
                  disabled={isPending || !selectedWatchlistId}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Add to Selected Watchlist
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleCreateNew}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Watchlist
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
