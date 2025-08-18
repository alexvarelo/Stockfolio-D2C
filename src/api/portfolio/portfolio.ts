import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getMultipleStockPricesApiV1StockTickersPricesGet } from "../stock/stock";
import { useToast } from "@/components/ui/use-toast";

export interface PortfolioHolding {
  ticker: string;
  quantity: number;
  total_invested: number;
  average_price: number;
  current_price?: number;
  change_percent?: number;
}

interface PortfolioBase {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  holdings: PortfolioHolding[];
  portfolio_followers: Array<{ count: number }>;
}

export interface Portfolio extends Omit<PortfolioBase, 'portfolio_followers'> {
  followers_count: number;
  performance_data?: {
    dates: string[];
    values: number[];
  };
}

// Get portfolio data with current prices and performance
// This is a combination of basic portfolio data and current market data
export const usePortfolio = (portfolioId: string, includePrices = true) => {
  return useQuery<Portfolio, Error>({
    queryKey: ['portfolio', portfolioId],
    queryFn: async () => {
      // First, get basic portfolio data
      const { data, error } = await supabase
        .from('portfolios')
        .select(`
          *,
          holdings (
            ticker,
            quantity,
            total_invested,
            average_price
          ),
          portfolio_follows(count)
        `)
        .eq('id', portfolioId)
        .single<PortfolioBase>();

      if (error) throw error;
      if (!data) throw new Error('Portfolio not found');
      
      // Create initial portfolio object
      const portfolio: Portfolio = {
        ...data,
        holdings: data.holdings || [],
        followers_count: data.portfolio_followers?.[0]?.count || 0,
      };

      // If we don't need prices or there are no holdings, return early
      if (!includePrices || !portfolio.holdings.length) {
        return portfolio;
      }

      // Get current prices for all holdings
      const tickers = portfolio.holdings.map(h => h.ticker);
      const prices: Record<string, number> = {};
      
      try {
        const pricesResponse = await getMultipleStockPricesApiV1StockTickersPricesGet(tickers.join(','));
        
        if (Array.isArray(pricesResponse?.data)) {
          pricesResponse.data.forEach(priceData => {
            if (priceData?.symbol && priceData.current_price !== null && priceData.current_price !== undefined) {
              prices[priceData.symbol] = priceData.current_price;
            }
          });
        }
      } catch (error) {
        console.error('Error fetching current prices:', error);
        // Continue without prices rather than failing the whole query
        return portfolio;
      }
      
      // Update holdings with current prices and calculate performance
      portfolio.holdings = portfolio.holdings.map(holding => {
        const currentPrice = prices[holding.ticker] || 0;
        const changePercent = holding.average_price > 0 
          ? ((currentPrice - holding.average_price) / holding.average_price) * 100 
          : 0;
          
        return {
          ...holding,
          current_price: currentPrice,
          change_percent: changePercent
        };
      });
      
      return portfolio;
    },
    enabled: !!portfolioId,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get portfolio performance data (prices, etc.)
export const usePortfolioPerformance = (portfolioId: string, enabled = true) => {
  return useQuery<{
    holdings: Array<PortfolioHolding & { current_price: number; change_percent: number }>;
    total_value: number;
    total_change_percent: number;
  }, Error>({
    queryKey: ['portfolio-performance', portfolioId],
    queryFn: async () => {
      // First get the portfolio with holdings
      const { data: portfolio } = await supabase
        .from('portfolios')
        .select(`
          id,
          holdings (
            ticker,
            quantity,
            total_invested,
            average_price
          )
        `)
        .eq('id', portfolioId)
        .single();

      if (!portfolio?.holdings?.length) {
        return { holdings: [], total_value: 0, total_change_percent: 0 };
      }

      // Get current prices for all holdings
      const tickers = portfolio.holdings.map(h => h.ticker);
      const prices: Record<string, number> = {};
      
      try {
        const pricesResponse = await getMultipleStockPricesApiV1StockTickersPricesGet(tickers.join(','));
        
        if (Array.isArray(pricesResponse?.data)) {
          pricesResponse.data.forEach(priceData => {
            if (priceData?.symbol && priceData.current_price !== null && priceData.current_price !== undefined) {
              prices[priceData.symbol] = priceData.current_price;
            }
          });
        }
      } catch (error) {
        console.error('Error fetching current prices:', error);
        throw error;
      }
      
      // Calculate performance for each holding
      const holdingsWithPerformance = portfolio.holdings.map(holding => {
        const currentPrice = prices[holding.ticker] || 0;
        const changePercent = holding.average_price > 0 
          ? ((currentPrice - holding.average_price) / holding.average_price) * 100 
          : 0;
          
        return {
          ...holding,
          current_price: currentPrice,
          change_percent: changePercent
        };
      });
      
      // Calculate total portfolio value and change
      const totalValue = holdingsWithPerformance.reduce(
        (sum, h) => sum + (h.current_price * h.quantity),
        0
      );
      
      const totalInvested = holdingsWithPerformance.reduce(
        (sum, h) => sum + h.total_invested,
        0
      );
      
      const totalChangePercent = totalInvested > 0 
        ? ((totalValue - totalInvested) / totalInvested) * 100 
        : 0;
      
      return {
        holdings: holdingsWithPerformance,
        total_value: totalValue,
        total_change_percent: totalChangePercent
      };
    },
    enabled: !!portfolioId && enabled,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useDeletePortfolio = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (portfolioId: string) => {
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', portfolioId);
      
      if (error) throw error;
      return true;
    },
    onSuccess: (_, portfolioId) => {
      // Invalidate both the portfolio list and the specific portfolio
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio', portfolioId] });
    },
  });
};

// Helper function to update portfolio holdings
const updatePortfolioHoldings = async (portfolioId: string, updates: Omit<PortfolioHolding,'current_price' |'change_percent' |'created_at' | 'updated_at' | 'id' >) => {
  const { data: existingHolding, error: fetchError } = await supabase
    .from('holdings')
    .select('*')
    .eq('portfolio_id', portfolioId)
    .eq('ticker', updates.ticker)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  if (existingHolding) {
    // Update existing holding
    const { data, error } = await supabase
      .from('holdings')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingHolding.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Add new holding
    const newHolding = {
      portfolio_id: portfolioId,
      ticker: updates.ticker,
      quantity: updates.quantity || 0,
      total_invested: updates.total_invested || 0,
      average_price: updates.average_price || 0,
      notes: '',
    };

    const { data, error } = await supabase
      .from('holdings')
      .insert(newHolding)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

export const useUpdatePortfolio = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      portfolioId,
      portfolioData,
    }: {
      portfolioId: string;
      portfolioData: Partial<Portfolio>;
    }) => {
      const { data, error } = await supabase
        .from('portfolios')
        .update({
          name: portfolioData.name,
          description: portfolioData.description,
          is_public: portfolioData.is_public,
          updated_at: new Date().toISOString(),
        })
        .eq('id', portfolioId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch the portfolio query
      queryClient.invalidateQueries({ queryKey: ['portfolio', variables.portfolioId] });
      // Also invalidate the portfolios list
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    },
  });
};

export const useUpdatePortfolioHoldings = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({
      portfolioId,
      holding,
    }: {
      portfolioId: string;
      holding: Omit<PortfolioHolding, 'id' | 'created_at' | 'updated_at'>;
    }) => {
      const data = await updatePortfolioHoldings(portfolioId, holding);
      return data;
    },
    onSuccess: (_, { portfolioId }) => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', portfolioId] });
      toast({
        title: 'Holding updated',
        description: 'Your portfolio holding has been updated.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update holding',
        variant: 'destructive',
      });
    },
  });
};

export const useDeletePortfolioHolding = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({
      portfolioId,
      ticker,
    }: {
      portfolioId: string;
      ticker: string;
    }) => {
      // First get the holding ID
      const { data: holding, error: fetchError } = await supabase
        .from('holdings')
        .select('id')
        .eq('portfolio_id', portfolioId)
        .eq('ticker', ticker)
        .single();

      if (fetchError) throw fetchError;
      if (!holding) throw new Error('Holding not found');

      // Then delete it
      const { error } = await supabase
        .from('holdings')
        .delete()
        .eq('id', holding.id);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: (_, { portfolioId }) => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', portfolioId] });
      toast({
        title: 'Holding removed',
        description: 'The holding has been removed from your portfolio.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to remove holding',
        variant: 'destructive',
      });
    },
  });
};