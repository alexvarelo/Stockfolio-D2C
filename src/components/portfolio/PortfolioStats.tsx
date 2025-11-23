import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercentage } from "@/lib/formatters";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PortfolioStatsProps {
  totalValue: number;
  totalInvested: number;
  totalReturn: number;
  returnPercentage: number;
  holdingsCount: number;
  className?: string;
  isLoading?: boolean;
}

export const PortfolioStats = ({
  totalValue,
  totalInvested,
  totalReturn,
  returnPercentage,
  holdingsCount,
  className = "",
  isLoading = false,
}: PortfolioStatsProps) => {
  const isPositiveReturn = totalReturn >= 0;

  // Helper to render value or skeleton
  const renderValue = (value: React.ReactNode) => {
    if (isLoading) {
      return <Skeleton className="h-7 w-24" />;
    }
    return <div className="text-xl font-semibold">{value}</div>;
  };

  const stats = [
    {
      name: "Total Value",
      value: formatCurrency(totalValue),
      description: "Current value of your portfolio",
      isLoading: isLoading,
    },
    {
      name: "Total Invested",
      value: formatCurrency(totalInvested),
      description: "Total amount invested",
      isLoading: false, // Total invested is available from basic info
    },
    {
      name: "Total Return",
      value: (
        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${isPositiveReturn
          ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
          : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
          }`}>
          {isPositiveReturn ? (
            <ArrowUpRight className="inline h-4 w-4 mr-1" />
          ) : (
            <ArrowDownRight className="inline h-4 w-4 mr-1" />
          )}
          {formatCurrency(totalReturn)} ({formatPercentage(returnPercentage)})
        </div>
      ),
      description: "All-time return",
      isLoading: isLoading,
    },
    {
      name: "Holdings",
      value: holdingsCount,
      description: "Number of different assets",
      isLoading: false, // Holdings count is available from basic info
    },
  ];

  return (
    <Card className={`border-border/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900/50 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold tracking-tight">Overview</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between gap-6">
        <div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Total Value</div>
          <div className="text-4xl font-bold tracking-tight">
            {isLoading ? <Skeleton className="h-10 w-48" /> : formatCurrency(totalValue)}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Current value of your portfolio</div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Invested</div>
            <div className="text-lg font-semibold">
              {isLoading ? <Skeleton className="h-6 w-24" /> : formatCurrency(totalInvested)}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Holdings</div>
            <div className="text-lg font-semibold">
              {isLoading ? <Skeleton className="h-6 w-12" /> : holdingsCount}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Return</div>
            {isLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className={`inline-flex items-center text-sm font-bold ${isPositiveReturn
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
                }`}>
                {isPositiveReturn ? (
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                )}
                {formatPercentage(returnPercentage)}
              </div>
            )}
          </div>
          <div className={`text-xl font-bold ${isPositiveReturn
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'
            }`}>
            {isLoading ? <Skeleton className="h-7 w-32" /> : (
              <>
                {isPositiveReturn ? "+" : ""}{formatCurrency(totalReturn)}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
