import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatPercentage } from "@/lib/formatters";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface PortfolioStatsProps {
  totalValue: number;
  totalInvested: number;
  totalReturn: number;
  returnPercentage: number;
  holdingsCount: number;
  className?: string;
}

export const PortfolioStats = ({
  totalValue,
  totalInvested,
  totalReturn,
  returnPercentage,
  holdingsCount,
  className = "",
}: PortfolioStatsProps) => {
  const isPositiveReturn = totalReturn >= 0;
  const stats = [
    {
      name: "Total Value",
      value: formatCurrency(totalValue),
      description: "Current value of your portfolio",
    },
    {
      name: "Total Invested",
      value: formatCurrency(totalInvested),
      description: "Total amount invested",
    },
    {
      name: "Total Return",
      value: (
        <span className={isPositiveReturn ? "text-green-600" : "text-red-600"}>
          {isPositiveReturn ? (
            <ArrowUpRight className="inline h-4 w-4 mr-1" />
          ) : (
            <ArrowDownRight className="inline h-4 w-4 mr-1" />
          )}
          {formatCurrency(totalReturn)} ({formatPercentage(returnPercentage)})
        </span>
      ),
      description: "All-time return",
    },
    {
      name: "Holdings",
      value: holdingsCount,
      description: "Number of different assets",
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {stats.map((stat) => (
          <div key={stat.name} className="space-y-1">
            <div className="text-sm text-muted-foreground">{stat.name}</div>
            <div className="text-xl font-semibold">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.description}</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
