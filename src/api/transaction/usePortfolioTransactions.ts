import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Transaction {
  id: string;
  portfolio_id: string;
  ticker: string;
  transaction_type: 'BUY' | 'SELL';
  quantity: number;
  price_per_share: number;
  transaction_date: string;
  fees: number;
  notes: string | null;
  created_at: string;
}

export function usePortfolioTransactions(portfolioId?: string) {
  return useQuery({
    queryKey: ['portfolioTransactions', portfolioId],
    queryFn: async () => {
      if (!portfolioId) return [];
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('transaction_date', { ascending: false });
      
      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!portfolioId,
  });
}
