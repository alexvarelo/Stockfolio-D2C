import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote } from "lucide-react";

interface TotalInvestedCardProps {
    totalValue: number;
}

export const TotalInvestedCard = ({ totalValue }: TotalInvestedCardProps) => {
    return (
        <Card className="relative overflow-hidden border-0 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Invested</CardTitle>
                <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <Banknote className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
                    ${totalValue.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Across all portfolios</p>
            </CardContent>
        </Card>
    );
};
