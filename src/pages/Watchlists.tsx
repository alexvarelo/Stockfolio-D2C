import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, List, Eye, EyeOff, Trash2, Pencil, ChevronRight } from 'lucide-react';
import { useWatchlists, useDeleteWatchlist } from '@/api/watchlist/useWatchlists';
import { useAuth } from '@/lib/auth';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { DeleteConfirmationDialog } from '@/components/portfolio/delete/DeleteConfirmationDialog';

export default function Watchlists() {
  const { user } = useAuth();
  const { data: watchlists, isLoading } = useWatchlists();
  const deleteWatchlist = useDeleteWatchlist();
  const [watchlistToDelete, setWatchlistToDelete] = useState<string | null>(null);

  const handleDeleteWatchlist = async (id: string) => {
    try {
      await deleteWatchlist.mutateAsync(id);
      setWatchlistToDelete(null);
    } catch (error) {
      console.error('Failed to delete watchlist:', error);
    }
  };

  if (isLoading || !user) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Watchlists</h1>
            <p className="text-muted-foreground">Manage your stock watchlists</p>
          </div>
          <Button disabled>
            <Plus className="mr-2 h-4 w-4" />
            New Watchlist
          </Button>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Watchlists</h1>
          <p className="text-muted-foreground">Manage your stock watchlists</p>
        </div>
        <Link 
          to="/watchlists/new" 
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Watchlist
        </Link>
      </div>

      {watchlists?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <List className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-1">No watchlists yet</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Create your first watchlist to start tracking stocks
          </p>
          <Link 
            to="/watchlists/new" 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Watchlist
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {watchlists?.map((watchlist) => (
            <Card key={watchlist.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      <Link 
                        to={`/watchlists/${watchlist.id}`}
                        className="hover:underline"
                      >
                        {watchlist.name}
                      </Link>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {watchlist.items_count || 0} items • {format(new Date(watchlist.updated_at), 'MMM d, yyyy')}
                    </CardDescription>
                  </div>
                  <Badge variant={watchlist.is_public ? 'default' : 'secondary'} className="flex items-center gap-1">
                    {watchlist.is_public ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3" />
                    )}
                    {watchlist.is_public ? 'Public' : 'Private'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center pt-2">
                  <Link 
                    to={`/watchlists/${watchlist.id}`} 
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-3"
                  >
                    View <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                  <div className="flex space-x-1">
                    <Link 
                      to={`/watchlists/${watchlist.id}/edit`} 
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Link>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        setWatchlistToDelete(watchlist.id);
                      }}
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-destructive h-9 w-9 text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DeleteConfirmationDialog
        isOpen={!!watchlistToDelete}
        onOpenChange={(open) => !open && setWatchlistToDelete(null)}
        onConfirm={() => watchlistToDelete && handleDeleteWatchlist(watchlistToDelete)}
        title="Delete Watchlist"
        description="Are you sure you want to delete this watchlist? This action cannot be undone."
        confirmText="Delete Watchlist"
      />
    </div>
  );
}
