import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Watchlist, CreateWatchlistInput, UpdateWatchlistInput } from './types';

export function useWatchlists() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['watchlists'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('watchlists')
        .select('*, watchlist_items(count)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(watchlist => ({
        ...watchlist,
        items_count: watchlist.watchlist_items?.[0]?.count || 0
      })) as Watchlist[];
    },
    enabled: !!user,
  });
}

export function useCreateWatchlist() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (input: CreateWatchlistInput) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('watchlists')
        .insert([
          {
            ...input,
            user_id: user.id,
            is_public: input.is_public ?? false,
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      return data as Watchlist;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
    },
  });
}

export function useUpdateWatchlist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & UpdateWatchlistInput) => {
      const { data, error } = await supabase
        .from('watchlists')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Watchlist;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
    },
  });
}

export function useDeleteWatchlist() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('watchlists')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlists'] });
    },
  });
}
