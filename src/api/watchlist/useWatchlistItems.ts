import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WatchlistItem, AddToWatchlistInput, UpdateWatchlistItemInput } from './types';

export function useWatchlistItems(watchlistId: string) {
  return useQuery({
    queryKey: ['watchlistItems', watchlistId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('watchlist_items')
        .select(`
          *,
          instrument:instruments!watchlist_items_ticker_fkey(name, current_price, price_change_percentage)
        `)
        .eq('watchlist_id', watchlistId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data as WatchlistItem[];
    },
    enabled: !!watchlistId,
  });
}

export function useAddToWatchlist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: AddToWatchlistInput) => {
      const { data, error } = await supabase
        .from('watchlist_items')
        .insert([
          {
            watchlist_id: input.watchlistId,
            ticker: input.ticker,
            notes: input.notes,
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      return data as WatchlistItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlistItems', watchlistId] });
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
    },
  });
}

export function useUpdateWatchlistItem(watchlistId: string, itemId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: UpdateWatchlistItemInput) => {
      const { data, error } = await supabase
        .from('watchlist_items')
        .update(updates)
        .eq('id', itemId)
        .select()
        .single();
      
      if (error) throw error;
      return data as WatchlistItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlistItems', watchlistId] });
    },
  });
}

export function useRemoveFromWatchlist(watchlistId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase
        .from('watchlist_items')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
      return itemId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlistItems', watchlistId] });
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
    },
  });
}

// Hook to check if a ticker is in any of the user's watchlists
export function useIsTickerInWatchlists(ticker: string) {
  const { data: watchlists } = useWatchlists();
  
  return useQuery({
    queryKey: ['isTickerInWatchlists', ticker],
    queryFn: async () => {
      if (!watchlists?.length) return [];
      
      const { data, error } = await supabase
        .from('watchlist_items')
        .select('watchlist_id, watchlists!inner(id, name)')
        .eq('ticker', ticker)
        .in('watchlist_id', watchlists.map(w => w.id));
      
      if (error) throw error;
      return data.map(item => ({
        watchlistId: item.watchlist_id,
        watchlistName: item.watchlists?.name
      }));
    },
    enabled: !!ticker && !!watchlists,
  });
}
