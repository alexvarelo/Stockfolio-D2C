import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { WatchlistItem, AddToWatchlistInput, UpdateWatchlistItemInput } from './types';

export function useWatchlistItems(watchlistId: string) {
  return useQuery({
    queryKey: ['watchlistItems', watchlistId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('watchlist_items')
        .select('*')
        .eq('watchlist_id', watchlistId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data as WatchlistItem[];
    },
    enabled: !!watchlistId,
  });
}

export function useAddToWatchlist(watchlistId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: Omit<AddToWatchlistInput, 'watchlistId'>) => {
      const { data, error } = await supabase
        .from('watchlist_items')
        .insert({
          watchlist_id: watchlistId,
          ticker: input.ticker,
          target_price: input.target_price || null,
          notes: input.notes || null,
        })
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

export function useUpdateWatchlistItem(watchlistId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (input: UpdateWatchlistItemInput & { id: string }) => {
      const { id, ...updateData } = input;
      const { data, error } = await supabase
        .from('watchlist_items')
        .update({
          ...(updateData.target_price !== undefined && { target_price: updateData.target_price }),
          ...(updateData.notes !== undefined && { notes: updateData.notes }),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
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
        .eq('id', itemId)
        .eq('watchlist_id', watchlistId);
      
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
