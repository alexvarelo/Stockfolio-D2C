import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

export const UpdatesCard = () => {
    return (
        <Card className="relative overflow-hidden border-0 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Updates</CardTitle>
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-400/10 dark:to-orange-500/10 backdrop-blur-md border border-amber-200/50 dark:border-amber-700/50 flex items-center justify-center shadow-lg shadow-amber-500/10 group-hover:scale-110 transition-all duration-300">
                    <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400 drop-shadow-sm" />
                </div>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">3</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">New notifications</p>
            </CardContent>
        </Card>
    );
};
