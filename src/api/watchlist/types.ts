export interface Watchlist {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  items_count?: number;
}

export interface WatchlistItem {
  id: string;
  watchlist_id: string;
  ticker: string;
  target_price: number | null;
  notes: string | null;
  created_at: string;
}

export interface CreateWatchlistInput {
  name: string;
  description?: string;
  is_public?: boolean;
}

export interface UpdateWatchlistInput {
  name?: string;
  description?: string | null;
  is_public?: boolean;
}

export interface AddToWatchlistInput {
  ticker: string;
  target_price?: number | null;
  notes?: string | null;
  watchlistId: string;
}

export interface UpdateWatchlistItemInput {
  target_price?: number | null;
  notes?: string | null;
}
