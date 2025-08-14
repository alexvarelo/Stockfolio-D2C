import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { useCustomerHoldings } from '@/api/portfolio/useCustomerHoldings';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatPercentage = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    signDisplay: 'exceptZero',
  }).format(value / 100);
};

interface TopInvestmentsProps {
  className?: string;
}

export const TopInvestments = ({ className }: TopInvestmentsProps) => {
  const { data: holdings, isLoading } = useCustomerHoldings();
  const topHoldings = holdings?.slice(0, 10) || []; // Already sorted by value in the hook

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Investments</CardTitle>
        </CardHeader>
        <CardContent>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!topHoldings.length) {
    return (
      <Card className={cn('h-full', className)}>
        <CardHeader>
          <CardTitle>Top Investments</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No holdings found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Top Investments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {topHoldings.map((holding) => {
          const isPositive = (holding.dailyChangePercent || 0) > 0;
          const isNegative = (holding.dailyChangePercent || 0) < 0;
          
          return (
            <div key={holding.id} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{holding.symbol}</div>
                <div className="text-sm text-muted-foreground">
                  {holding.quantity} shares
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {formatCurrency(holding.currentValue || 0)}
                </div>
                <div
                  className={`flex items-center justify-end text-sm ${
                    isPositive
                      ? 'text-green-600 dark:text-green-400'
                      : isNegative
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-muted-foreground'
                  }`}
                >
                  {isPositive ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : isNegative ? (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  ) : (
                    <Minus className="h-3 w-3 mr-1" />
                  )}
                  {formatPercentage(holding.dailyChangePercent || 0)}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
