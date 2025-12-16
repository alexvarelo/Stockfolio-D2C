import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { formatCompactCurrency } from "@/lib/utils";

interface NetProfitLossCardProps {
    netProfitLoss: number;
}

export const NetProfitLossCard = ({ netProfitLoss }: NetProfitLossCardProps) => {
    const isPositive = netProfitLoss >= 0;

    return (
        <Card className="relative overflow-hidden border-0 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Net Profit/Loss</CardTitle>
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300 ${isPositive ? 'bg-lime-100 dark:bg-lime-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                    <DollarSign className={`h-5 w-5 ${isPositive ? 'text-lime-600 dark:text-lime-400' : 'text-red-600 dark:text-red-400'}`} />
                </div>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className={`text-2xl sm:text-3xl font-extrabold flex items-center tracking-tight ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {isPositive ? (
                        <TrendingUp className="h-5 w-5 mr-1" />
                    ) : (
                        <TrendingDown className="h-5 w-5 mr-1" />
                    )}
                    {isPositive ? '+' : ''}
                    {formatCompactCurrency(Math.abs(netProfitLoss))}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total Gain/Loss</p>
            </CardContent>
        </Card>
    );
};
