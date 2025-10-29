import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { ArticleContent } from '@/components/articles/ArticleContent';

interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  content: any;
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

export function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  
  const { data: article, isLoading, error } = useQuery<Article | null>({
    queryKey: ['article', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles' as never) // Type assertion needed for custom tables
        .select('*')
        .eq('id', id)
        .eq('status', 'published')
        .single<Article>();

      if (error) throw error;
      return data;
    },
    enabled: !!id, // Only run query if we have an ID
  });

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-8">
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container max-w-4xl py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Article not found</h1>
        <p className="text-muted-foreground">The article you're looking for doesn't exist or has been removed.</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-24 2xl:px-32 py-8">
      <div className="mx-auto w-full max-w-4xl lg:max-w-6xl xl:max-w-7xl">
        <ArticleContent article={article} />
      </div>
    </div>
  );
}
