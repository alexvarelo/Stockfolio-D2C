import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Portfolio {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export const UserPortfolios = ({ userId }: { userId: string }) => {
  const { data: portfolios, isLoading, isError, error } = useQuery({
    queryKey: ['user-portfolios', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolio_followers')
        .select(`
          portfolio:portfolio_id (
            id,
            name,
            description,
            is_public,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return data.map(item => item.portfolio) as Portfolio[];
    },
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Error loading portfolios: {error?.message}
      </div>
    );
  }

  if (!portfolios || portfolios.length === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-muted-foreground">No portfolios found</p>
        <Button asChild variant="outline">
          <Link to="/portfolios/new" className="gap-2">
            <Plus className="h-4 w-4" />
            Create Portfolio
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {portfolios.map((portfolio) => (
        <div key={portfolio.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
          <h3 className="font-semibold text-lg mb-2">
            <Link to={`/portfolios/${portfolio.id}`} className="hover:underline">
              {portfolio.name}
            </Link>
          </h3>
          {portfolio.description && (
            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
              {portfolio.description}
            </p>
          )}
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span>
              {portfolio.is_public ? 'Public' : 'Private'}
            </span>
            <span>
              Created {new Date(portfolio.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
