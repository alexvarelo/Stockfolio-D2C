import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ChartControls } from './ChartControls';
import { ChartVisualizer } from './ChartVisualizer';
import { useChartData } from './useChartData';
import { TimeRange, ChartMode } from './types';

interface PriceChartProps {
    ticker: string;
    currency?: string;
}

export function PriceChart({ ticker, currency = 'USD' }: PriceChartProps) {
    const [timeRange, setTimeRange] = useState<TimeRange>('1y');
    const [chartMode, setChartMode] = useState<ChartMode>('price');
    const [comparisonTicker, setComparisonTicker] = useState<string | null>(null);

    const {
        chartData,
        isLoading,
        priceChange,
        percentChange,
        isPositive,
        currentPrice
    } = useChartData({
        ticker,
        timeRange,
        chartMode,
        comparisonTicker
    });

    return (
        <Card className="w-full">
            <ChartControls
                ticker={ticker}
                currency={currency}
                currentPrice={currentPrice}
                priceChange={priceChange}
                percentChange={percentChange}
                isPositive={isPositive}
                timeRange={timeRange}
                setTimeRange={setTimeRange}
                chartMode={chartMode}
                setChartMode={setChartMode}
                comparisonTicker={comparisonTicker}
                setComparisonTicker={setComparisonTicker}
                hasData={chartData.length > 0}
            />
            <ChartVisualizer
                data={chartData}
                isLoading={isLoading}
                chartMode={chartMode}
                ticker={ticker}
                comparisonTicker={comparisonTicker}
                isPositive={isPositive}
            />
        </Card>
    );
}
