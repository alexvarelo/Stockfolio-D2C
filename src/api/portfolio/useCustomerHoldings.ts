import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PortfolioHolding } from '@/types/portfolio';
import { useGetMultipleStockPricesApiV1StockTickersPricesGet } from '@/api/stock/stock';
import { PriceData } from '../financialDataApi.schemas';

interface ConsolidatedHolding {
  symbol: string;
  totalQuantity: number;
  totalInvested: number;
  averagePrice: number;
  portfolioIds: string[];
  portfolioNames: string[];
}

export const useCustomerHoldings = () => {
  const { data: holdings, isLoading, error } = useQuery({
    queryKey: ['consolidated-holdings'],
    queryFn: async () => {
      // Get all holdings for the current user across all portfolios
      const { data: holdingsData, error: holdingsError } = await supabase
        .from('holdings')
        .select(`
          id,
          ticker,
          quantity,
          total_invested,
          portfolio_id,
          portfolios!inner(id, name)
        `);

      if (holdingsError) throw holdingsError;
      if (!holdingsData?.length) return [];

      // Consolidate holdings by ticker
      const holdingsByTicker = new Map<string, ConsolidatedHolding>();

      for (const holding of holdingsData) {
        const existing = holdingsByTicker.get(holding.ticker);
        const quantity = holding.quantity || 0;
        const totalInvested = holding.total_invested || 0;

        if (existing) {
          // Update existing consolidated holding
          existing.totalQuantity += quantity;
          existing.totalInvested += totalInvested;
          existing.averagePrice = existing.totalInvested / (existing.totalQuantity || 1);
          
          if (!existing.portfolioIds.includes(holding.portfolio_id)) {
            existing.portfolioIds.push(holding.portfolio_id);
            existing.portfolioNames.push(holding.portfolios?.name || 'Unnamed Portfolio');
          }
        } else {
          // Create new consolidated holding
          holdingsByTicker.set(holding.ticker, {
            symbol: holding.ticker,
            totalQuantity: quantity,
            totalInvested,
            averagePrice: quantity > 0 ? totalInvested / quantity : 0,
            portfolioIds: [holding.portfolio_id],
            portfolioNames: [holding.portfolios?.name || 'Unnamed Portfolio'],
          });
        }
      }

      return Array.from(holdingsByTicker.values());
    },
    refetchOnWindowFocus: false,
  });

  // Get current prices for all unique tickers
  const tickers = holdings?.map(h => h.symbol).join(',') || '';
  const { data: prices } = useGetMultipleStockPricesApiV1StockTickersPricesGet(
    tickers,
    { 
      query: { 
        enabled: !!tickers && tickers.length > 0,
      } 
    }
  );

  // Enrich with current prices and calculate values
  const enrichedHoldings = useQuery({
    queryKey: ['enriched-holdings', holdings, prices],
    queryFn: () => {
      if (!holdings || !prices?.data) return [];

      const priceMap = new Map(
        prices.data.map((p: PriceData) => [p.symbol, p])
      );

      return holdings
        .map(holding => {
          const priceData = priceMap.get(holding.symbol);
          const currentPrice = priceData?.current_price || 0;
          const dailyChangePercent = priceData?.change_percent || 0;
          const currentValue = currentPrice * holding.totalQuantity;
          const totalGainLoss = currentValue - holding.totalInvested;
          const totalGainLossPercent = holding.totalInvested > 0 
            ? (totalGainLoss / holding.totalInvested) * 100 
            : 0;

          return {
            id: holding.symbol, // Using symbol as ID since we're consolidating
            symbol: holding.symbol,
            quantity: holding.totalQuantity,
            averagePrice: holding.averagePrice,
            currentPrice,
            currentValue,
            costBasis: holding.totalInvested,
            dailyChangePercent,
            totalGainLoss,
            totalGainLossPercent,
            portfolioCount: holding.portfolioIds.length,
            portfolioNames: holding.portfolioNames,
            lastUpdated: new Date().toISOString(),
          } as PortfolioHolding;
        })
        .sort((a, b) => b.currentValue - a.currentValue)
        .slice(0, 10); // Return only top 10 by value
    },
    enabled: !!holdings?.length && !!prices?.data,
  });

  return {
    data: enrichedHoldings.data || [],
    isLoading: isLoading || enrichedHoldings.isLoading,
    error: error || enrichedHoldings.error,
  };
};
