import { Skeleton } from '@/components/ui/skeleton';
import { ArticleCard } from './ArticleCard';
import { useGetArticles, useGetArticlesByType } from '@/api/articles/useArticles';

export function ArticlesSection() {
  const { data: allArticles = [], isLoading: isLoadingAll } = useGetArticles(12);
  const { data: tickerAnalysis = [], isLoading: isLoadingTicker } = useGetArticlesByType('TICKER_ANALYSIS', 6);
  const { data: newsSummary = [], isLoading: isLoadingNews } = useGetArticlesByType('NEWS_SUMMARY', 6);
  const { data: marketOverview = [], isLoading: isLoadingMarket } = useGetArticlesByType('MARKET_OVERVIEW', 6);

  const isLoading = isLoadingAll || isLoadingTicker || isLoadingNews || isLoadingMarket;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-80 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {allArticles.map((article) => (
        <ArticleCard key={article.id} article={article} className="mb-6 last:mb-0" />
      ))}
    </div>
  );
}
