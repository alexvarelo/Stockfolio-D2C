import { CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { StockSearch } from '@/components/stock/StockSearch';
import { TimeRange, ChartMode } from './types';

interface ChartControlsProps {
    ticker: string;
    currency: string;
    currentPrice: number;
    priceChange: number;
    percentChange: number;
    isPositive: boolean;
    timeRange: TimeRange;
    setTimeRange: (range: TimeRange) => void;
    chartMode: ChartMode;
    setChartMode: (mode: ChartMode) => void;
    comparisonTicker: string | null;
    setComparisonTicker: (ticker: string | null) => void;
    hasData: boolean;
}

export const ChartControls = ({
    ticker,
    currency,
    currentPrice,
    priceChange,
    percentChange,
    isPositive,
    timeRange,
    setTimeRange,
    chartMode,
    setChartMode,
    comparisonTicker,
    setComparisonTicker,
    hasData
}: ChartControlsProps) => {
    return (
        <CardHeader className="flex flex-col gap-4 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                        {ticker}
                        {comparisonTicker && (
                            <span className="text-muted-foreground text-base font-normal">
                                vs {comparisonTicker}
                            </span>
                        )}
                    </CardTitle>
                    {hasData && (
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-2xl font-bold">
                                {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: currency || 'USD',
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                }).format(currentPrice)}
                            </span>
                            <span className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                                {isPositive ? '↑' : '↓'} {Math.abs(percentChange).toFixed(2)}% ({isPositive ? '+' : ''}{priceChange.toFixed(2)})
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                        <Tabs value={chartMode} onValueChange={(v) => {
                            setChartMode(v as ChartMode);
                            if (v === 'price') setComparisonTicker(null);
                        }} className="w-auto">
                            <TabsList>
                                <TabsTrigger value="price">Price</TabsTrigger>
                                <TabsTrigger value="performance">Performance</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <Tabs
                            value={timeRange}
                            onValueChange={(value) => setTimeRange(value as TimeRange)}
                            className="w-auto"
                        >
                            <TabsList className="bg-transparent p-0 h-auto hidden sm:flex">
                                {['5d', '1mo', '3mo', '6mo', 'ytd', '1y', '5y', 'max'].map((range) => (
                                    <TabsTrigger
                                        key={range}
                                        value={range}
                                        className="text-xs px-2 py-1 bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-auto"
                                    >
                                        {range.toUpperCase()}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </Tabs>
                    </div>

                    {chartMode === 'performance' && (
                        <div className="w-full sm:w-64 flex items-center gap-2">
                            {comparisonTicker ? (
                                <div className="flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-md text-sm w-full justify-between">
                                    <span className="font-medium">{comparisonTicker}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-4 w-4 hover:bg-transparent"
                                        onClick={() => setComparisonTicker(null)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ) : (
                                <StockSearch
                                    onSelect={(stock) => setComparisonTicker(stock.symbol)}
                                    placeholder="Compare with..."
                                    className="w-full"
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </CardHeader>
    );
};
