import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/formatters";

interface PortfolioPerformanceChartProps {
  dates: string[];
  values: number[];
  className?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border rounded-lg p-4 shadow-lg">
        <p className="text-sm text-muted-foreground">
          {format(new Date(label), "MMM d, yyyy")}
        </p>
        <p className="font-semibold">{formatCurrency(payload[0].value)}</p>
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

  console.log(chartData);

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
            top: 10,
            right: 30,
            left: 0,
            bottom: 0
          }}
        >
        <defs>
          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="hsl(var(--primary))"
              stopOpacity={0.2}
            />
            <stop
              offset="95%"
              stopColor="hsl(var(--primary))"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="hsl(var(--muted))"
        />
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tickFormatter={formatXAxis}
          tick={{
            fill: "hsl(var(--muted-foreground))",
            fontSize: "0.75rem",
            fontFamily: "var(--font-sans)",
          }}
          tickMargin={10}
        />
        <YAxis
          domain={[minValue, maxValue]}
          axisLine={false}
          tickLine={false}
          tickFormatter={formatYAxis}
          tick={{
            fill: "hsl(var(--muted-foreground))",
            fontSize: "0.75rem",
            fontFamily: "var(--font-sans)",
          }}
          width={60}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ stroke: "hsl(var(--primary))", strokeWidth: 1 }}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorValue)"
        />
      </AreaChart>
    </ResponsiveContainer>
    </div>
  );
};
