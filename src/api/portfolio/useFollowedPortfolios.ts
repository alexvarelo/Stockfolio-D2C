import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export interface FollowedPortfolio {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  user_id: string;
  user_name?: string;
  user_avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export const useFollowedPortfolios = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["followed-portfolios", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data: follows, error: followsError } = await supabase
        .from('portfolio_follows')
        .select('portfolio_id')
        .eq('user_id', user.id);

      if (followsError) throw followsError;
      
      if (!follows || follows.length === 0) return [];
      
      const portfolioIds = follows.map(follow => follow.portfolio_id);
      
      const { data: portfolios, error: portfoliosError } = await supabase
        .from('portfolios')
        .select(`
          id,
          name,
          description,
          is_public,
          user_id,
          created_at,
          updated_at,
          profiles:user_id (id, full_name, avatar_url)
        `)
        .in('id', portfolioIds);

      if (portfoliosError) throw portfoliosError;
      
      return (portfolios || []).map(portfolio => ({
        ...portfolio,
        user_name: portfolio.profiles?.full_name || 'Unknown',
        user_avatar_url: portfolio.profiles?.avatar_url || null
      })) as FollowedPortfolio[];
    },
    enabled: !!user?.id,
  });
};
