export interface Holding {
  id: string;
  symbol: string;
  name?: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  currentValue: number;
  costBasis: number;
  dailyChangePercent: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  lastUpdated: string;
}

export interface PortfolioHolding extends Omit<Holding, 'id'> {
  id: string; // Can be symbol or original ID
  portfolioCount: number;
  portfolioNames: string[];
  assetClass?: string;
  sector?: string;
  industry?: string;
}
