import { useQuery, useQueries } from '@tanstack/react-query';
import { getHistoricalDataApiV1StockTickerHistoryGet } from '../stock/stock';

interface HistoricalPrice {
  date: string;
  close: number;
  normalizedDate?: string; // For internal use
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
        // Helper function to normalize dates to YYYY-MM-DD format to handle timezone differences
        const normalizeDate = (dateStr: string): string => {
          try {
            // Extract just the date part (YYYY-MM-DD) from ISO string
            return new Date(dateStr).toISOString().split('T')[0];
          } catch (e) {
            // Fallback: Just take the date part before 'T' if it exists
            return dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
          }
        };

        // Process each ticker's data to add normalized dates
        const processedTickerData = tickerQueries.map(query => ({
          ...query,
          data: (query.data || []).map(price => ({
            ...price,
            normalizedDate: normalizeDate(price.date)
          }))
        }));

        // Create a map of ticker to its price data with normalized dates
        const tickerToPrices = new Map(
          uniqueTickers.map((ticker, index) => [ticker, processedTickerData[index].data || []])
        );

        // Get all unique normalized dates
        const allDates = new Set<string>();
        processedTickerData.forEach(query => {
          query.data.forEach(price => {
            allDates.add(price.normalizedDate);
          });
        });

        // Sort dates in ascending order
        const sortedUniqueDates = Array.from(allDates)
          .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

        // For each date, keep track of the first original date string we see
        const dateDisplayMap = new Map<string, string>();
        processedTickerData.forEach(query => {
          query.data.forEach(price => {
            if (!dateDisplayMap.has(price.normalizedDate)) {
              dateDisplayMap.set(price.normalizedDate, price.date);
            }
          });
        });

        // Sort prices by date for each ticker to ensure reliable finding
        const sortedPricesMap = new Map<string, typeof processedTickerData[0]['data']>();
        tickerToPrices.forEach((prices, ticker) => {
          sortedPricesMap.set(
            ticker,
            [...prices].sort((a, b) => a.normalizedDate.localeCompare(b.normalizedDate))
          );
        });

        // Calculate portfolio value for each unique date
        const values = sortedUniqueDates.map(normalizedDate => {
          return holdings.reduce((total, holding) => {
            const prices = sortedPricesMap.get(holding.ticker) || [];

            if (prices.length === 0) return total;

            // Find the most recent price on or before this date
            // Since prices are sorted ascending, we can reverse or findLast (if available) 
            // or just filter and take the last one.
            // Optimization: find the last price where date <= normalizedDate
            let priceToUse = 0;

            const priceIndex = prices.findIndex(p => p.normalizedDate > normalizedDate);

            if (priceIndex === -1) {
              // All prices are <= normalizedDate, use the last one (most recent)
              priceToUse = prices[prices.length - 1].close;
            } else if (priceIndex === 0) {
              // All prices are > normalizedDate (future prices only)
              // This is the case causing the issue. Backfill with the earliest available price.
              priceToUse = prices[0].close;
            } else {
              // Found the boundary, use the price just before the boundary
              priceToUse = prices[priceIndex - 1].close;
            }

            return total + (priceToUse * holding.quantity);
          }, 0);
        });

        // Use the display dates in the final output
        const displayDates = sortedUniqueDates.map(date => dateDisplayMap.get(date) || date);

        return {
          dates: displayDates,
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
