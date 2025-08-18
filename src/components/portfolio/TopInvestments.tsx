import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { useCustomerHoldings } from '@/api/portfolio/useCustomerHoldings';
import { isModuleNamespaceObject } from 'util/types';

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
  const { 
    data: holdings, 
    isLoading,
    isLoadingMarketData 
  } = useCustomerHoldings({ 
    includeMarketData: true,
    limit: 10 
  });

  console.log(holdings, isLoading, isLoadingMarketData);

  // Show full skeleton only when we don't have any data yet
  if (isLoading && !holdings?.length) {
    return (
      <Card className={className}>
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

  const displayHoldings = holdings || [];

  if (!displayHoldings.length) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Top Investments</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No investments found</p>
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
        {displayHoldings.map((holding) => {
          const isPositive = (holding.dailyChangePercent || 0) > 0;
          const isNegative = (holding.dailyChangePercent || 0) < 0;
          
          return (
            <div key={holding.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{holding.symbol}</p>
                <p className="text-xs text-muted-foreground">
                  {holding.quantity} shares
                </p>
              </div>
              <div className="text-right">
                {isLoadingMarketData ? (
                  <Skeleton className="h-4 w-20 mb-1" />
                ) : (
                  <p className="font-medium">
                    {holding.currentValue !== null 
                      ? formatCurrency(holding.currentValue)
                      : 'N/A'}
                  </p>
                )}
                <div className={cn(
                  'text-xs flex items-center justify-end',
                  holding.dailyChangePercent === null ? 'text-muted-foreground' :
                  holding.dailyChangePercent > 0 ? 'text-green-500' : 
                  'text-red-500'
                )}>
                  {isLoadingMarketData ? (
                    <Skeleton className="h-3 w-12" />
                  ) : (
                    <>
                      {holding.dailyChangePercent !== null && (
                        <>
                          {holding.dailyChangePercent > 0 ? (
                            <ArrowUp className="h-3 w-3 mr-1" />
                          ) : holding.dailyChangePercent < 0 ? (
                            <ArrowDown className="h-3 w-3 mr-1" />
                          ) : (
                            <Minus className="h-3 w-3 mr-1" />
                          )}
                          {formatPercentage(holding.dailyChangePercent / 100)}
                        </>
                      )}
                      {holding.dailyChangePercent === null && 'N/A'}
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
