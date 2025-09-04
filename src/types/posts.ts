export interface Post {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  username: string;
  avatar_url: string | null;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  tickers?: string[];
  portfolios?: string[];
  // Add any other fields that might be present in your Post type
}
