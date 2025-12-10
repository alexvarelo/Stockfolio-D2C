import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

interface TotalHoldingsCardProps {
    count: number;
}

export const TotalHoldingsCard = ({ count }: TotalHoldingsCardProps) => {
    return (
        <Card className="relative overflow-hidden border-0 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-300 group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Holdings</CardTitle>
                <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <Briefcase className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">{count}</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Unique assets</p>
            </CardContent>
        </Card>
    );
};
