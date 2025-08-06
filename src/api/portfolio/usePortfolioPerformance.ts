import { useQuery, useQueries } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { getHistoricalDataApiV1StockTickerHistoryGet } from '../stock/stock';

interface HistoricalPrice {
  date: string;
  close: number;
}

interface PortfolioPerformance {
  dates: string[];
  values: number[];
}

// Function to fetch historical prices for a single ticker
const fetchTickerHistory = async (ticker: string): Promise<HistoricalPrice[]> => {
  try {
    const response = await getHistoricalDataApiV1StockTickerHistoryGet(ticker, { period: '1y' });
    if (!response?.data?.data) return [];
    
    return response.data.data.map(item => ({
      date: item.date,
      close: item.close ? Number(item.close) : 0
    }));
  } catch (error) {
    console.error(`Error fetching historical data for ${ticker}:`, error);
    return [];
  }
};

interface Holding {
  ticker: string;
  quantity: number;
  average_price: number;
}

export const usePortfolioPerformance = (holdings: Holding[] | undefined) => {
  // Get unique tickers from holdings
  const uniqueTickers = [...new Set(holdings?.map(h => h.ticker) || [])];

  // Fetch historical data for all tickers in parallel
  const tickerQueries = useQueries({
    queries: uniqueTickers.map(ticker => ({
      queryKey: ['ticker-history', ticker],
      queryFn: () => fetchTickerHistory(ticker),
      enabled: !!holdings && holdings.length > 0,
      staleTime: 24 * 60 * 60 * 1000, // 1 day
    }))
  });

  // Check if any queries are still loading
  const isLoading = tickerQueries.some(query => query.isLoading);
  const isError = tickerQueries.some(query => query.isError);

  // Process the data once all queries are done
  const portfolioPerformance = useQuery<PortfolioPerformance>({
    queryKey: ['portfolio-performance', uniqueTickers.join(',')],
    queryFn: () => {
      if (!holdings || holdings.length === 0) {
        return { dates: [], values: [] };
      }

      try {
        // Create a map of ticker to its price data
        const tickerToPrices = new Map(
          uniqueTickers.map((ticker, index) => [ticker, tickerQueries[index].data || []])
        );

        // Get all unique dates across all tickers
        const allDates = new Set<string>();
        tickerQueries.forEach(query => {
          (query.data || []).forEach(price => allDates.add(price.date));
        });

        // Sort dates in ascending order
        const sortedDates = Array.from(allDates).sort((a, b) => 
          new Date(a).getTime() - new Date(b).getTime()
        );

        // Calculate portfolio value for each date
        const values = sortedDates.map(date => {
          return holdings.reduce((total, holding) => {
            const prices = tickerToPrices.get(holding.ticker) || [];
            const priceData = prices.find(p => p.date === date);
            if (priceData) {
              return total + (priceData.close * holding.quantity);
            }
            return total;
          }, 0);
        });

        return {
          dates: sortedDates,
          values
        };
      } catch (error) {
        console.error('Error calculating portfolio performance:', error);
        return { dates: [], values: [] };
      }
    },
    enabled: !isLoading && !isError && tickerQueries.every(query => query.isSuccess),
    staleTime: 24 * 60 * 60 * 1000, // 1 day
  });

  // Return the appropriate state based on loading/error status
  if (isLoading) {
    return { ...portfolioPerformance, isLoading: true, isError: false };
  }

  if (isError) {
    return { ...portfolioPerformance, isLoading: false, isError: true };
  }

  return portfolioPerformance;
};
