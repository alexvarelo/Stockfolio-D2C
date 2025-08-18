import { useGetPopularStocksApiV1SearchPopularGet } from '../search/search';
import { SearchResult } from '../financialDataApi.schemas';

export interface PopularStock {
  ticker: string;
  name: string;
  exchange?: string;
  type?: string;
  isin?: string;
  country?: string;
}

interface UsePopularStocksReturn {
  data: SearchResult[] | undefined;
  isLoading: boolean;
}

/**
 * Hook to fetch popular stocks
 * @param options Configuration options including `enabled` to control when the query runs
 * @returns Object containing popular stocks data and loading state
 */
export function usePopularStocks(options: { enabled?: boolean } = {}): UsePopularStocksReturn {
  const { data: searchResults, isLoading: isLoadingSearchResults } = useGetPopularStocksApiV1SearchPopularGet(
    
  );

  return {
    data: searchResults?.data,
    isLoading: isLoadingSearchResults,
  };
}

export default usePopularStocks;
