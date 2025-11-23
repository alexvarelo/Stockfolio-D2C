import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
      <Card className={`flex flex-col border-none shadow-none bg-transparent ${className}`}>
        <CardHeader className="pb-2 px-0">
          <CardTitle className="text-lg font-medium">Evolution</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <div className="h-[300px] md:h-[400px] w-full bg-card/50 border border-border/50 rounded-3xl p-4 md:p-6 shadow-sm flex items-end gap-2">
            {[...Array(12)].map((_, i) => (
              <Skeleton key={i} className="w-full rounded-t-lg" style={{ height: `${Math.random() * 60 + 20}%` }} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`flex flex-col border-none shadow-none bg-transparent ${className}`}>
      <CardHeader className="pb-2 px-0">
        <CardTitle className="text-lg font-medium">Evolution</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <div className="h-[300px] md:h-[400px] w-full bg-card/50 border border-border/50 rounded-3xl overflow-hidden p-4 md:p-6 shadow-sm">
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
