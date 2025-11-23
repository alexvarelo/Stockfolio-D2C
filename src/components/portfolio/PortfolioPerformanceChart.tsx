import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

interface PortfolioPerformanceChartProps {
  dates: string[];
  values: number[];
  className?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover/95 backdrop-blur-sm border border-border/50 rounded-xl p-3 shadow-xl">
        <p className="text-xs text-muted-foreground mb-1">
          {format(new Date(label), "MMM d, yyyy")}
        </p>
        <p className="font-bold text-lg tabular-nums tracking-tight">
          {formatCurrency(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

export const PortfolioPerformanceChart = ({
  dates,
  values,
  className = ""
}: PortfolioPerformanceChartProps) => {
  const chartData = useMemo(() => {
    return dates.map((date, index) => ({
      date,
      value: values[index],
    }));
  }, [dates, values]);

  if (dates.length === 0 || values.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No performance data available
      </div>
    );
  }

  // Find min and max values for the Y-axis domain
  const minValue = Math.max(0, Math.min(...values) * 0.995); // 0.5% padding on the bottom
  const maxValue = Math.max(...values) * 1.005; // 0.5% padding on the top

  // Format X-axis tick to show month and year
  const formatXAxis = (date: string) => {
    return format(new Date(date), "MMM yyyy");
  };

  // Format Y-axis tick to show abbreviated currency values (e.g., 1K, 1M)
  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  return (
    <div className={`h-full w-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{
            top: 5,
            right: 0,
            left: 0,
            bottom: 0
          }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="hsl(var(--primary))"
                stopOpacity={0.3}
              />
              <stop
                offset="95%"
                stopColor="hsl(var(--primary))"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickFormatter={(date) => format(new Date(date), "MMM d")}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            minTickGap={30}
          />
          <YAxis
            tickFormatter={(value) => `$${value}`}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, strokeDasharray: '5 5' }} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
