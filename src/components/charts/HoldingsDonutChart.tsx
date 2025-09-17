import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useCustomerHoldings } from '@/api/portfolio/useCustomerHoldings';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/formatters';
import { PortfolioHolding } from '@/types/portfolio';

const COLORS = [
  '#4F46E5', '#7C3AED', '#DB2777', '#E11D48', '#F59E0B',
  '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F43F5E',
  '#F97316', '#06B6D4', '#6366F1', '#A855F7', '#F472B6',
  '#F87171', '#60A5FA', '#A78BFA', '#F472B6', '#F87171'
];

const RADIAN = Math.PI / 180;

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  index: number;
}) => {
  const radius = 25 + innerRadius + (outerRadius - innerRadius);
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <g>
      <line 
        x1={cx + (outerRadius + 10) * Math.cos(-midAngle * RADIAN)} 
        y1={cy + (outerRadius + 10) * Math.sin(-midAngle * RADIAN)}
        x2={x - 5 * Math.cos(-midAngle * RADIAN)} 
        y2={y - 5 * Math.sin(-midAngle * RADIAN)}
        stroke="#94A3B8"
        strokeWidth={1}
      />
      <text
        x={x}
        y={y}
        fill="#334155"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold">{data.name}</p>
        <p className="text-sm">Value: {formatCurrency(data.value)}</p>
        <p className="text-sm">Shares: {data.quantity}</p>
      </div>
    );
  }
  return null;
};

export const HoldingsDonutChart = () => {
  const { data: holdings, isLoading, error } = useCustomerHoldings({ includeMarketData: false });

  // Transform holdings data for the chart
  const chartData = React.useMemo(() => {
    if (!holdings) return [];
    
    return holdings.map((holding: PortfolioHolding) => ({
      name: holding.symbol,
      value: holding.currentValue || holding.averagePrice,
      quantity: holding.quantity,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
  }, [holdings]);

  if (isLoading) {
    return (
      <Card className="w-full h-96 flex items-center justify-center">
        <Skeleton className="w-full h-full" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full h-96 flex items-center justify-center">
        <p className="text-red-500">Error loading holdings data</p>
      </Card>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Card className="w-full h-96 flex items-center justify-center">
        <p className="text-muted-foreground">No holdings data available</p>
      </Card>
    );
  }

  return (
    <Card className="w-full border-0 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-900">Portfolio Allocation</CardTitle>
      </CardHeader>
      <CardContent className="h-96 p-0">
        <div className="relative h-full">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(chartData.reduce((sum, item) => sum + item.value, 0))}
              </div>
              <div className="text-sm text-gray-500">Total Value</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={140}
                innerRadius={80}
                paddingAngle={1}
                cornerRadius={4}
                dataKey="value"
              >
                {chartData.map((entry: any, index: number) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color || COLORS[index % COLORS.length]} 
                    stroke="#fff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip 
                content={<CustomTooltip />} 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #E2E8F0',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                  padding: '0.75rem',
                  fontSize: '0.875rem',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default HoldingsDonutChart;
