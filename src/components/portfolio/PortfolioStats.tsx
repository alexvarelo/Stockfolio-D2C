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
      <CardContent className="space-y-6">
        {stats.map((stat) => (
          <div key={stat.name} className="space-y-1.5">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.name}</div>
            {stat.isLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className={stat.name === "Total Value" ? "text-3xl font-bold tracking-tight" : "text-xl font-semibold"}>
                {stat.value}
              </div>
            )}
            <div className="text-xs text-muted-foreground">{stat.description}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
