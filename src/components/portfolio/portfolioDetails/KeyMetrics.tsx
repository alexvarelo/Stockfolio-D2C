import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PortfolioHolding } from "@/api/portfolio/portfolio";
import { formatCurrency, formatPercentage } from "@/lib/formatters";
import { Trophy, TrendingDown, PieChart, DollarSign } from "lucide-react";

interface KeyMetricsProps {
    holdings: PortfolioHolding[];
    className?: string;
    isLoading?: boolean;
}

export const KeyMetrics = ({ holdings, className = "", isLoading }: KeyMetricsProps) => {
    if (isLoading) {
        return (
            <div className={`grid grid-cols-2 gap-4 ${className}`}>
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="border-none shadow-none bg-transparent">
                        <CardContent className="p-4 bg-card/50 border border-border/50 rounded-3xl h-full flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-2">
                                <Skeleton className="h-8 w-8 rounded-2xl" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-3 w-20" />
                                <Skeleton className="h-6 w-24" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (holdings.length === 0) {
        return null;
    }

    // Calculate metrics
    const bestPerformer = [...holdings].sort((a, b) => (b.change_percent || 0) - (a.change_percent || 0))[0];
    const worstPerformer = [...holdings].sort((a, b) => (a.change_percent || 0) - (b.change_percent || 0))[0];

    const totalValue = holdings.reduce((sum, h) => sum + ((h.current_price || 0) * h.quantity), 0);
    const largestHolding = [...holdings].sort((a, b) =>
        ((b.current_price || 0) * b.quantity) - ((a.current_price || 0) * a.quantity)
    )[0];

    const metrics = [
        {
            label: "Best Performer",
            value: bestPerformer?.ticker,
            subValue: formatPercentage(bestPerformer?.change_percent || 0),
            icon: Trophy,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            isPositive: (bestPerformer?.change_percent || 0) >= 0
        },
        {
            label: "Worst Performer",
            value: worstPerformer?.ticker,
            subValue: formatPercentage(worstPerformer?.change_percent || 0),
            icon: TrendingDown,
            color: "text-rose-500",
            bg: "bg-rose-500/10",
            isPositive: (worstPerformer?.change_percent || 0) >= 0
        },
        {
            label: "Largest Position",
            value: largestHolding?.ticker,
            subValue: formatPercentage(totalValue > 0 ? (((largestHolding?.current_price || 0) * largestHolding?.quantity) / totalValue) * 100 : 0),
            icon: PieChart,
            color: "text-sky-500",
            bg: "bg-sky-500/10",
            isPositive: true
        },
        {
            label: "Avg. Position",
            value: formatCurrency(totalValue / holdings.length),
            subValue: "per holding",
            icon: DollarSign,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            isPositive: true
        }
    ];

    return (
        <div className={`grid grid-cols-2 gap-4 ${className}`}>
            {metrics.map((metric, i) => (
                <Card key={i} className="border-none shadow-none bg-transparent">
                    <CardContent className="p-4 bg-card/50 border border-border/50 rounded-3xl h-full flex flex-col justify-between hover:bg-card/80 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                            <div className={`p-2 rounded-2xl ${metric.bg}`}>
                                <metric.icon className={`h-4 w-4 ${metric.color}`} />
                            </div>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">{metric.label}</p>
                            <p className="text-lg font-bold tracking-tight truncate">{metric.value}</p>
                            <p className={`text-xs font-medium mt-1 ${metric.label === "Worst Performer" || metric.label === "Best Performer" ?
                                (metric.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400") :
                                "text-muted-foreground"
                                }`}>
                                {metric.subValue}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};
