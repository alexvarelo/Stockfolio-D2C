import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PortfolioPerformanceChart } from "../PortfolioPerformanceChart";
import { usePortfolioPerformance } from "@/api/portfolio/usePortfolioPerformance";
import type { PortfolioHolding } from "@/api/portfolio/portfolio";


interface EvolutionChartProps {
  holdings: PortfolioHolding[];
  className?: string;
  isLoading?: boolean;
}

export const EvolutionChart = ({ holdings, className = "", isLoading: isParentLoading }: EvolutionChartProps) => {
  const { data: performanceData, isLoading: isChartLoading } = usePortfolioPerformance(holdings);

  const isLoading = isParentLoading || isChartLoading;

  if (isLoading || !performanceData) {
    return (
      <Card className={`h-full flex flex-col ${className}`}>
        <CardHeader className="pb-2">
          <CardTitle>Evolution</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">Loading performance...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`h-full flex flex-col border-border/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900/50 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold tracking-tight">Evolution</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <div className="h-[300px] md:h-[400px] w-full md:px-1 pb-6 pt-4">
          <PortfolioPerformanceChart
            dates={performanceData.dates}
            values={performanceData.values}
            className="h-full w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
};
