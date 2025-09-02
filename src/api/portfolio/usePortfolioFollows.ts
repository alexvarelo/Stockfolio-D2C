import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export interface PortfolioFollow {
  id: string;
  portfolio_id: string;
  user_id: string;
  created_at: string;
}

export const usePortfolioFollows = (portfolioId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if current user is following the portfolio
  const { data: isFollowing, ...followStatus } = useQuery({
    queryKey: ["portfolio-follow", portfolioId, user?.id],
    queryFn: async () => {
      if (!user?.id || !portfolioId) return false;
      
      const { data, error } = await supabase
        .from('portfolio_follows')
        .select('id')
        .eq('portfolio_id', portfolioId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: Boolean(user?.id && portfolioId),
  });

  // Get followers count for a portfolio
  const { data: followersCount, ...followersCountStatus } = useQuery({
    queryKey: ["portfolio-followers-count", portfolioId],
    queryFn: async () => {
      if (!portfolioId) return 0;
      
      const { count, error } = await supabase
        .from('portfolio_follows')
        .select('*', { count: 'exact', head: true })
        .eq('portfolio_id', portfolioId);

      if (error) throw error;
      return count || 0;
    },
    enabled: Boolean(portfolioId),
  });

  // Follow a portfolio
  const followPortfolio = useMutation({
    mutationFn: async (portfolioId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('portfolio_follows')
        .insert([
          { 
            portfolio_id: portfolioId,
            user_id: user.id 
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-follow", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-followers-count", portfolioId] });
    },
  });

  // Unfollow a portfolio
  const unfollowPortfolio = useMutation({
    mutationFn: async (portfolioId: string) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('portfolio_follows')
        .delete()
        .eq('portfolio_id', portfolioId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio-follow", portfolioId] });
      queryClient.invalidateQueries({ queryKey: ["portfolio-followers-count", portfolioId] });
    },
  });

  // Toggle follow status
  const toggleFollow = async () => {
    if (!portfolioId) return;
    
    if (isFollowing) {
      await unfollowPortfolio.mutateAsync(portfolioId);
    } else {
      await followPortfolio.mutateAsync(portfolioId);
    }
  };

  return {
    isFollowing: !!isFollowing,
    toggleFollow,
    followersCount: followersCount || 0,
    isLoading: followStatus.isLoading || followersCountStatus.isLoading,
    error: followStatus.error || followersCountStatus.error,
  };
};
