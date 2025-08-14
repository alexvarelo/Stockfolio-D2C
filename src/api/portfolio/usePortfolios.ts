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
  daily_change?: number;
  holdings_count?: number;
}

export const usePortfolios = (userId?: string) => {
  return useQuery<Portfolio[]>({
    queryKey: ['portfolios', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching portfolios:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!userId,
  });
};
