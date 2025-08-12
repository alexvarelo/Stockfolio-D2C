import { useSearchInstrumentsApiV1SearchGet } from '@/api/search/search';

export interface InstrumentSearchResult {
  ticker: string;
  name: string;
  exchange?: string;
  type?: string;
  isin?: string;
  country?: string;
}

export function useSearchInstruments(
  query: string,
  options: { enabled?: boolean } = {}
) {
  const { data: searchResponse, ...rest } = useSearchInstrumentsApiV1SearchGet(
    { query },
    { 
      query: { 
        enabled: options.enabled !== false && query?.length >= 2,
        staleTime: 1000 * 60 * 5, // 5 minutes
      } 
    }
  );

  return {
    data: searchResponse?.data?.results?.map(result => ({
      ticker: result.symbol,
      name: result.name,
      exchange: result.exchange,
      type: result.type,
      isin: result.isin,
      country: result.country,
    })) || [],
    ...rest,
  };
}

export default useSearchInstruments;
