import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PortfolioHolding } from "@/types/portfolio";
import { useGetMultipleStockPricesApiV1StockTickersPricesGet } from "@/api/stock/stock";
import { PriceData } from "../financialDataApi.schemas";

interface ConsolidatedHolding {
  symbol: string;
  totalQuantity: number;
  totalInvested: number;
  averagePrice: number;
  portfolioIds: string[];
  portfolioNames: string[];
}

interface UseCustomerHoldingsOptions {
  includeMarketData?: boolean;
  limit?: number;
}

interface UseCustomerHoldingsResult {
  data: PortfolioHolding[];
  isLoading: boolean;
  isLoadingMarketData: boolean;
  error: any;
}

export const useCustomerHoldings = (
  options: UseCustomerHoldingsOptions = {}
): UseCustomerHoldingsResult => {
  const { includeMarketData = true, limit } = options;

  // Fetch basic holdings data
  const {
    data: holdings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["consolidated-holdings"],
    queryFn: async () => {
      const { data: holdingsData, error: holdingsError } = await supabase.from(
        "holdings"
      ).select(`
          id,
          ticker,
          quantity,
          total_invested,
          portfolio_id,
          portfolios!inner(id, name)
        `);

      if (holdingsError) throw holdingsError;
      if (!holdingsData?.length) return [];

      const holdingsByTicker = new Map<string, ConsolidatedHolding>();

      for (const holding of holdingsData) {
        const existing = holdingsByTicker.get(holding.ticker);
        const quantity = holding.quantity || 0;
        const totalInvested = holding.total_invested || 0;

        if (existing) {
          existing.totalQuantity += quantity;
          existing.totalInvested += totalInvested;
          existing.averagePrice =
            existing.totalInvested / (existing.totalQuantity || 1);

          if (!existing.portfolioIds.includes(holding.portfolio_id)) {
            existing.portfolioIds.push(holding.portfolio_id);
            existing.portfolioNames.push(
              holding.portfolios?.name || "Unnamed Portfolio"
            );
          }
        } else {
          holdingsByTicker.set(holding.ticker, {
            symbol: holding.ticker,
            totalQuantity: quantity,
            totalInvested,
            averagePrice: quantity > 0 ? totalInvested / quantity : 0,
            portfolioIds: [holding.portfolio_id],
            portfolioNames: [holding.portfolios?.name || "Unnamed Portfolio"],
          });
        }
      }

      return Array.from(holdingsByTicker.values());
    },
    refetchOnWindowFocus: false,
  });

  // Get current prices if market data is requested
  const tickers = holdings?.map((h) => h.symbol).join(",") || "";
  const {
    data: prices,
    isLoading: isLoadingPrices,
    error: pricesError,
  } = useGetMultipleStockPricesApiV1StockTickersPricesGet(tickers, {
    query: {
      enabled: includeMarketData && !!tickers && tickers.length > 0,
      refetchOnWindowFocus: false,
    },
  });

  // Process holdings with or without market data
  const processedHoldings = useQuery({
    queryKey: ["processed-holdings", holdings, prices],
    queryFn: () => {
      if (!holdings) return [];

      // If we don't need market data or it's not available yet, return basic holdings
      if (!includeMarketData || !prices?.data) {
        return holdings.map(
          (holding) =>
            ({
              id: holding.symbol,
              symbol: holding.symbol,
              quantity: holding.totalQuantity,
              averagePrice: holding.averagePrice,
              currentPrice: null,
              currentValue: null,
              costBasis: holding.totalInvested,
              dailyChangePercent: null,
              totalGainLoss: null,
              totalGainLossPercent: null,
              portfolioCount: holding.portfolioIds.length,
              portfolioNames: holding.portfolioNames,
              lastUpdated: new Date().toISOString(),
              isLoading: includeMarketData, // Indicate if we're still loading market data
            } as PortfolioHolding)
        );
      }

      // If we have market data, enrich the holdings
      const priceMap = new Map(
        prices.data.map((p: PriceData) => [p.symbol, p])
      );

      return holdings
        .map((holding) => {
          const priceData = priceMap.get(holding.symbol);
          const currentPrice = priceData?.current_price || 0;
          const dailyChangePercent = priceData?.change_percent || 0;
          const currentValue = currentPrice * holding.totalQuantity;
          const totalGainLoss = currentValue - holding.totalInvested;
          const totalGainLossPercent =
            holding.totalInvested > 0
              ? (totalGainLoss / holding.totalInvested) * 100
              : 0;

          return {
            id: holding.symbol,
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
            isLoading: false,
          } as PortfolioHolding;
        })
        .sort((a, b) => (b.currentValue || 0) - (a.currentValue || 0))
        .slice(0, limit || holdings.length);
    },
    enabled: !!holdings && (!includeMarketData || !!prices?.data),
  });

  return {
    data:
      (processedHoldings.data ??
        holdings?.map((x) => ({
          id: x.symbol,
          symbol: x.symbol,
          quantity: x.totalQuantity,
          averagePrice: x.averagePrice,
          currentPrice: null,
          currentValue: null,
          costBasis: x.totalInvested,
          dailyChangePercent: null,
          totalGainLoss: null,
          totalGainLossPercent: null,
          portfolioCount: x.portfolioIds.length,
          portfolioNames: x.portfolioNames,
          lastUpdated: new Date().toISOString(),
          isLoading: includeMarketData,
        }))) ||
      [],
    isLoading,
    isLoadingMarketData:
      includeMarketData && (isLoadingPrices || processedHoldings.isLoading),
    error: error || pricesError || processedHoldings.error,
  };
};
