import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: any; // JSONB content
  article_type: 'TICKER_ANALYSIS' | 'NEWS_SUMMARY' | 'MARKET_OVERVIEW';
  tickers: string[] | null;
  tags: string[] | null;
  author: string | null;
  status: 'draft' | 'published' | 'archived';
  view_count: number;
  is_premium: boolean;
  metadata: any; // JSONB metadata
  created_at: string;
  updated_at: string;
}

export function useGetArticles(limit = 10) {
  return useQuery({
    queryKey: ['articles', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Article[];
    },
  });
}

export function useGetArticleBySlug(slug: string) {
  return useQuery({
    queryKey: ['article', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      return data as Article;
    },
    enabled: !!slug,
  });
}

export function useGetArticlesByType(articleType: Article['article_type'], limit = 10) {
  return useQuery({
    queryKey: ['articles', articleType, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .eq('article_type', articleType)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Article[];
    },
  });
}
