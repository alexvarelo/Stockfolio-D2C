export interface Holding {
  id: string;
  symbol: string;
  name?: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number | null;
  currentValue: number | null;
  costBasis: number;
  dailyChangePercent: number | null;
  totalGainLoss: number | null;
  totalGainLossPercent: number | null;
  lastUpdated: string;
}

export interface PortfolioHolding extends Omit<Holding, 'id'> {
  id: string; // Can be symbol or original ID
  portfolioCount: number;
  portfolioNames: string[];
  assetClass?: string;
  sector?: string;
  industry?: string;
  isLoading?: boolean; // Indicates if market data is still loading
}
