import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetHistoricalDataApiV1StockTickerHistoryGet } from '@/api/stock/stock';
import { format, sub } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  TooltipProps
} from 'recharts';
import { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent';

// Define the expected data structure from the API
interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adj_close: number;
}

type TimeRange = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | '10y' | 'ytd' | 'max';

interface PriceChartProps {
  ticker: string;
  currency?: string;
}

export function PriceChart({ ticker, currency = 'USD' }: PriceChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('1y');
  
  // Calculate the start date based on the selected time range
  const getStartDate = (range: TimeRange): Date => {
    const now = new Date();
    switch (range) {
      case '1d':
        return sub(now, { days: 1 });
      case '5d':
        return sub(now, { days: 5 });
      case '1mo':
        return sub(now, { months: 1 });
      case '3mo':
        return sub(now, { months: 3 });
      case '6mo':
        return sub(now, { months: 6 });
      case 'ytd':
        return new Date(now.getFullYear(), 0, 1);
      case '1y':
        return sub(now, { years: 1 });
      case '2y':
        return sub(now, { years: 2 });
      case '5y':
        return sub(now, { years: 5 });
      case '10y':
        return sub(now, { years: 10 });
      case 'max':
      default:
        // Default to 10 years for 'max' or unknown values
        return sub(now, { years: 10 });
    }
  };

  const startDate = getStartDate(timeRange);
  const endDate = new Date();

  // Format dates for the API
  const formatDate = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
  };

  const { data: response, isLoading } = useGetHistoricalDataApiV1StockTickerHistoryGet(
    ticker,
    { 
      period: timeRange as any
    },
    {
      query: {
        enabled: !!ticker,
        select: (data) => {
          if (!data?.data) return [];
          // Transform the data to match the expected format
          const historicalData = Array.isArray(data.data.data) ? data.data.data : [];
          return historicalData.map((item: any) => ({
            date: format(new Date(item.date), 'MMM d, yyyy'),
            price: item.close,
            volume: item.volume
          }));
        }
      }
    }
  );

  const chartData = response || [];

  // Calculate price change if we have data
  const priceChange = chartData.length > 1 ? 
    chartData[chartData.length - 1].price - chartData[0].price : 0;
  const percentChange = chartData.length > 1 ? 
    (priceChange / chartData[0].price) * 100 : 0;
  const isPositive = percentChange >= 0;

  // Custom tooltip component with proper typing
  const CustomTooltip = ({
    active,
    payload,
    label,
  }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm">
            Price: ${data.price?.toFixed(2) || 'N/A'}
          </p>
          <p className="text-sm">
            Volume: {data.volume?.toLocaleString() || 'N/A'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 pb-10">
        <div>
          <CardTitle className="text-lg">{ticker}</CardTitle>
          {chartData.length > 1 && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: currency || 'USD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }).format(chartData[chartData.length - 1].price)}
              </span>
              <span className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                {isPositive ? '↑' : '↓'} {Math.abs(percentChange).toFixed(2)}% ({isPositive ? '+' : ''}{priceChange.toFixed(2)})
              </span>
            </div>
          )}
        </div>
        <Tabs 
          value={timeRange}
          onValueChange={(value) => setTimeRange(value as TimeRange)}
          className="w-full sm:w-auto mt-0 sm:mt-1"
        >
          <TabsList className="flex bg-transparent p-0 h-auto">
            {/* <TabsTrigger value="1d" className="text-xs px-2 sm:px-3">1D</TabsTrigger> */}
            <TabsTrigger value="5d" className="text-xs px-2 py-1 bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-auto">5D</TabsTrigger>
            <TabsTrigger value="1mo" className="text-xs px-2 py-1 bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-auto">1M</TabsTrigger>
            <TabsTrigger value="3mo" className="text-xs px-2 py-1 bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-auto">3M</TabsTrigger>
            <TabsTrigger value="6mo" className="text-xs px-2 py-1 bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-auto">6M</TabsTrigger>
            <TabsTrigger value="ytd" className="text-xs px-2 py-1 bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-auto">YTD</TabsTrigger>
            <TabsTrigger value="1y" className="text-xs px-2 py-1 bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-auto">1Y</TabsTrigger>
            <TabsTrigger value="2y" className="text-xs px-2 py-1 bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-auto">2Y</TabsTrigger>
            <TabsTrigger value="5y" className="text-xs px-2 py-1 bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-auto">5Y</TabsTrigger>
            <TabsTrigger value="max" className="text-xs px-2 py-1 bg-transparent data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-auto">MAX</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="h-[300px] w-full">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-pulse">Loading chart...</div>
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
                minTickGap={50}
              />
              <YAxis 
                domain={['auto', 'auto']} 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={60}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="price"
                name="Price"
                stroke={isPositive ? '#10b981' : '#ef4444'}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
              {chartData.length > 0 && (
                <ReferenceLine 
                  y={chartData[0].price} 
                  stroke="#6b7280" 
                  strokeDasharray="3 3"
                  strokeOpacity={0.5}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No data available for this time period
          </div>
        )}
      </CardContent>
    </Card>
  );
}
