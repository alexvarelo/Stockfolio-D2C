export type TimeRange = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | '10y' | 'ytd' | 'max';
export type ChartMode = 'price' | 'performance';

export interface ChartDataPoint {
    date: string;
    timestamp: number;
    price: number;
    volume: number;
    normalized?: number;
    comparisonPrice?: number | null;
    comparisonNormalized?: number | null;
}
