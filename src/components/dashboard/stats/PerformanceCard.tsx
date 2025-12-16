import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import { Portfolio } from "@/api/portfolio/usePortfolios";

interface PerformanceCardProps {
    portfolios: Portfolio[];
}

export const PerformanceCard = ({ portfolios }: PerformanceCardProps) => {
    // Calculate total value
    const totalPortfolioValue = portfolios?.reduce((sum, p) => sum + (p.total_value || 0), 0) || 0;

    // Calculate weighted average return percentage
    // Formula: (Total Current Value - Total Cost Basis) / Total Cost Basis
    // Cost Basis = Current Value / (1 + Return%)
    const totalCostBasis = portfolios?.reduce((sum, p) => {
        const value = p.total_value || 0;

        const returnPct = (p.total_return_percentage || 0) / 100;
        // Avoid division by zero if return is -100% (unlikely but possible)
        const costBasis = returnPct === -1 ? 0 : value / (1 + returnPct);
        return sum + costBasis;
    }, 0) || 0;

    const totalPerformancePercentage = totalCostBasis > 0
        ? ((totalPortfolioValue - totalCostBasis) / totalCostBasis) * 100
        : 0;

    const isPositivePerformance = totalPerformancePercentage >= 0;

    return (
        <Card className="relative overflow-hidden border-0 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Performance</CardTitle>
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300 ${isPositivePerformance ? 'bg-lime-100 dark:bg-lime-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    <BarChart3 className={`h-5 w-5 ${isPositivePerformance ? 'text-lime-600 dark:text-lime-400' : 'text-red-600 dark:text-red-400'}`} />
                </div>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className={`text-2xl sm:text-3xl font-extrabold flex items-center tracking-tight ${isPositivePerformance ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isPositivePerformance ? (
                        <TrendingUp className="h-5 w-5 mr-1" />
                    ) : (
                        <TrendingDown className="h-5 w-5 mr-1" />
                    )}
                    {isPositivePerformance ? '+' : ''}
                    {totalPerformancePercentage.toFixed(2)}%
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total Return</p>
            </CardContent>
        </Card>
    );
};
