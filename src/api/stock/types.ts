export interface Instrument {
  symbol: string;
  name: string;
  exchange?: string;
  type?: string;
  currency?: string;
  country?: string;
  sector?: string;
  industry?: string;
  market_cap?: number;
  pe_ratio?: number | null;
  dividend_yield?: number | null;
  price?: number;
  change_percent?: number;
  last_updated?: string;
}

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  change_percent: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  latest_trading_day: string;
  previous_close: number;
}

export interface StockSearchResult extends Instrument {
  match_score: number;
}

export interface StockChartDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockNews {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  published_at: string;
  image_url?: string;
  related_symbols: string[];
}
