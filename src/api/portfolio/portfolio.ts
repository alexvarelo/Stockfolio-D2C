import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getMultipleStockPricesApiV1StockTickersPricesGet } from "../stock/stock";

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

export const usePortfolio = (portfolioId: string) => {
  return useQuery<Portfolio, Error>({
    queryKey: ['portfolio', portfolioId],
    queryFn: async () => {
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
      
      // Get current prices for all holdings
      const tickers = data.holdings?.map(h => h.ticker) || [];
      const prices: Record<string, number> = {};
      
      if (tickers.length > 0) {
        try {
          const pricesResponse = await getMultipleStockPricesApiV1StockTickersPricesGet(
            tickers.join(',')
          );
          
          // Convert array of PriceData to a map of ticker to current_price
          if (Array.isArray(pricesResponse?.data)) {
            pricesResponse.data.forEach(priceData => {
              if (priceData?.symbol && priceData.current_price !== null && priceData.current_price !== undefined) {
                prices[priceData.symbol] = priceData.current_price;
              }
            });
          }
        } catch (error) {
          console.error('Error fetching current prices:', error);
        }
      }
      
      // Create the response object with all required fields and current prices
      const portfolio: Portfolio = {
        ...data,
        holdings: (data.holdings || []).map(holding => ({
          ...holding,
          current_price: prices[holding.ticker] || 0
        })),
        followers_count: data.portfolio_followers?.[0]?.count || 0,
      };
      
      return portfolio;
    },
    enabled: !!portfolioId,
    retry: 1,
    refetchOnWindowFocus: false,
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