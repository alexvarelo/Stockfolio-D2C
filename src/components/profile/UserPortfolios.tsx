import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Briefcase } from 'lucide-react';
import { PortfolioCard } from '@/components/portfolio/PortfolioCard';
import { useAuth } from '@/lib/auth';

export interface Portfolio {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  holdings?: {
    ticker: string;
    quantity: number;
    total_invested: number;
  }[];
}

export const UserPortfolios = ({ userId }: { userId: string }) => {
  const {user} = useAuth();
  const { data: portfolios, isLoading, isError, error } = useQuery({
    queryKey: ['user-portfolios', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolios')
        .select(`
          id,
          name,
          description,
          is_public,
          is_default,
          created_at,
          updated_at,
          holdings (
            ticker,
            quantity,
            total_invested
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Portfolio[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading portfolios: {error.message}</p>
      </div>
    );
  }

  if (!portfolios || portfolios.length === 0) {
    return (
      <Card className="p-12 text-center">
        <Briefcase className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
        <h3 className="text-lg font-semibold mb-2">No portfolios yet</h3>
        <p className="text-muted-foreground">This user hasn't created any portfolios.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
      {portfolios
        .filter(portfolio => portfolio.is_public) // Only show public portfolios
        .map((portfolio) => (
          <PortfolioCard key={portfolio.id} {...portfolio} isOwnPortfolio={userId === user?.id}/>
        ))}
    </div>
  );
};
