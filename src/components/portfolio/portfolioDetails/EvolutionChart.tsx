import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PortfolioPerformanceChart } from "../PortfolioPerformanceChart";
import { usePortfolioPerformance } from "@/api/portfolio/usePortfolioPerformance";
import type { PortfolioHolding } from "@/api/portfolio/portfolio";

interface EvolutionChartProps {
  holdings: PortfolioHolding[];
  className?: string;
}

export const EvolutionChart = ({ holdings, className = "" }: EvolutionChartProps) => {
  const { data: performanceData, isLoading } = usePortfolioPerformance(holdings);

  if (isLoading || !performanceData) {
    return (
      <Card className={`h-full flex flex-col ${className}`}>
        <CardHeader className="pb-2">
          <CardTitle>Evolution</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-0">
          <div className="h-[300px] md:h-[400px] w-full md:px-1 pb-6 pt-4">
            <div className="h-full w-full bg-muted animate-pulse rounded-md" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle>Evolution</CardTitle>
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
