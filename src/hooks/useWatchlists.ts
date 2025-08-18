import { useQuery } from '@tanstack/react-query';

export interface WatchlistItem {
  ticker: string;
  name: string;
  // Add other item properties as needed
}

export interface Watchlist {
  id: string;
  name: string;
  items: WatchlistItem[];
  createdAt: string;
  updatedAt: string;
}

export function useWatchlists({ enabled = true } = {}) {
  return useQuery<Watchlist[]>({
    queryKey: ['watchlists'],
    queryFn: async () => {
      // TODO: Replace with actual API call to fetch watchlists
      // This is a mock implementation
      return [];
    },
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export default useWatchlists;
