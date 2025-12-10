import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Portfolio {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  total_value?: number;
  total_return_percentage?: number;
  holdings_count?: number;
  total_invested?: number;
}

export const usePortfolios = (userId?: string) => {
  return useQuery<Portfolio[]>({
    queryKey: ['portfolios', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('portfolios')
        .select(`
          *,
          portfolio_values (
            total_value,
            total_return_percentage,
            updated_at
          ),
          holdings (
            ticker,
            quantity,
            total_invested
          )
        `)
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching portfolios:', error);
        throw error;
      }

      // Map the response to include the joined data in the flat structure if needed
      // or just return as is and let the component handle it.
      // For now, let's map it to match the Portfolio interface expectations where possible
      return data.map(p => ({
        ...p,
        total_value: p.portfolio_values?.total_value,
        total_return_percentage: p.portfolio_values?.total_return_percentage,
        holdings_count: p.holdings?.length || 0,
        total_invested: p.holdings?.reduce((sum, h) => sum + (h.total_invested || 0), 0) || 0,
        // We keep the raw arrays too if needed
        holdings: p.holdings
      })) || [];
    },
    enabled: !!userId,
  });
};
