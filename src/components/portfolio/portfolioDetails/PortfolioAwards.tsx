import { motion } from "framer-motion";
import {
    Trophy,
    Rocket,
    Diamond,
    Zap,
    Globe,
    Crown,
    Lock,
    TrendingUp
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PortfolioAwardsProps {
    totalReturn: number;
    returnPercentage: number;
    portfolioAgeDays: number;
    holdingsCount: number;
    totalValue: number;
    todayChangePercent: number;
    className?: string;
}

interface Award {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    isUnlocked: boolean;
    color: string;
    gradient: string;
    progress: number;
    targetValue: string;
    currentValue: string;
}

export const PortfolioAwards = ({
    totalReturn,
    returnPercentage,
    portfolioAgeDays,
    holdingsCount,
    totalValue,
    todayChangePercent,
    className = ""
}: PortfolioAwardsProps) => {

    const awards: Award[] = [
        {
            id: "100_club",
            title: "100% Club",
            description: "Achieved a total return of over 100%",
            icon: Rocket,
            isUnlocked: returnPercentage >= 100,
            color: "text-emerald-500",
            gradient: "from-emerald-500/20 to-emerald-500/5",
            progress: Math.min(100, Math.max(0, (returnPercentage / 100) * 100)),
            targetValue: "100%",
            currentValue: `${returnPercentage.toFixed(1)}%`
        },
        {
            id: "moon_walker",
            title: "Moon Walker",
            description: "Achieved a total return of over 200%",
            icon: Trophy,
            isUnlocked: returnPercentage >= 200,
            color: "text-amber-500",
            gradient: "from-amber-500/20 to-amber-500/5",
            progress: Math.min(100, Math.max(0, (returnPercentage / 200) * 100)),
            targetValue: "200%",
            currentValue: `${returnPercentage.toFixed(1)}%`
        },
        {
            id: "diamond_hands",
            title: "Diamond Hands",
            description: "Held portfolio for over 1 year",
            icon: Diamond,
            isUnlocked: portfolioAgeDays >= 365,
            color: "text-blue-400",
            gradient: "from-blue-500/20 to-blue-500/5",
            progress: Math.min(100, Math.max(0, (portfolioAgeDays / 365) * 100)),
            targetValue: "365 days",
            currentValue: `${portfolioAgeDays} days`
        },
        {
            id: "momentum_master",
            title: "Momentum Master",
            description: "Daily gain of over 3%",
            icon: Zap,
            isUnlocked: todayChangePercent >= 3,
            color: "text-yellow-400",
            gradient: "from-yellow-500/20 to-yellow-500/5",
            progress: Math.min(100, Math.max(0, (todayChangePercent / 3) * 100)),
            targetValue: "3%",
            currentValue: `${todayChangePercent.toFixed(2)}%`
        },
        {
            id: "diversified",
            title: "Diversified",
            description: "Holds 5 or more different assets",
            icon: Globe,
            isUnlocked: holdingsCount >= 5,
            color: "text-indigo-400",
            gradient: "from-indigo-500/20 to-indigo-500/5",
            progress: Math.min(100, Math.max(0, (holdingsCount / 5) * 100)),
            targetValue: "5 assets",
            currentValue: `${holdingsCount} assets`
        },
        {
            id: "whale_status",
            title: "Whale Status",
            description: "Portfolio value exceeds $100,000",
            icon: Crown,
            isUnlocked: totalValue >= 100000,
            color: "text-purple-500",
            gradient: "from-purple-500/20 to-purple-500/5",
            progress: Math.min(100, Math.max(0, (totalValue / 100000) * 100)),
            targetValue: "$100k",
            currentValue: formatCurrency(totalValue)
        }
    ];

    // Sort awards: Unlocked first, then by id
    const sortedAwards = [...awards].sort((a, b) => {
        if (a.isUnlocked === b.isUnlocked) return 0;
        return a.isUnlocked ? -1 : 1;
    });

    return (
        <div className={`flex flex-col gap-6 ${className}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Awards & Achievements</h2>
                    <p className="text-sm text-muted-foreground">Milestones unlocked by your portfolio.</p>
                </div>
                <div className="self-start sm:self-auto px-3 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold border border-primary/20">
                    {awards.filter(a => a.isUnlocked).length}/{awards.length} Unlocked
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {sortedAwards.map((award, index) => (
                    <motion.div
                        key={award.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`
                            relative group overflow-hidden rounded-3xl border p-6 h-full transition-all duration-500 flex flex-col justify-between
                            ${award.isUnlocked
                                ? "bg-card/50 hover:bg-card/80 border-white/10 hover:border-white/20 hover:shadow-2xl"
                                : "bg-card/20 border-white/5 opacity-70 grayscale hover:opacity-100 hover:grayscale-0"}
                        `}
                    >
                        {/* Background Gradient Mesh */}
                        {award.isUnlocked && (
                            <div className={`absolute inset-0 bg-gradient-to-br ${award.gradient} opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />
                        )}

                        <div>
                            <div className="relative z-10 flex items-start justify-between mb-4">
                                <div className={`
                                    p-3 rounded-2xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3
                                    ${award.isUnlocked
                                        ? `bg-gradient-to-br ${award.gradient} text-white shadow-lg`
                                        : "bg-muted text-muted-foreground"}
                                `}>
                                    <award.icon className="w-8 h-8" />
                                </div>

                                {award.isUnlocked ? (
                                    <div className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] sm:text-xs font-bold border border-emerald-500/20">
                                        UNLOCKED
                                    </div>
                                ) : (
                                    <div className="px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full bg-muted/50 text-muted-foreground text-[10px] sm:text-xs font-bold border border-white/5 flex items-center gap-1">
                                        <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> LOCKED
                                    </div>
                                )}
                            </div>

                            <div className="relative z-10 mb-4">
                                <h3 className={`text-lg font-bold mb-1 group-hover:text-primary transition-colors duration-300 ${award.isUnlocked ? "text-foreground" : "text-muted-foreground"}`}>
                                    {award.title}
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {award.description}
                                </p>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative z-10 space-y-2 mt-auto">
                            <div className="flex justify-between text-xs font-medium">
                                <span className="text-muted-foreground">Progress</span>
                                <span className={award.isUnlocked ? "text-primary" : "text-muted-foreground"}>
                                    {award.isUnlocked ? "Completed" : `${award.currentValue} / ${award.targetValue}`}
                                </span>
                            </div>
                            <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${award.progress}%` }}
                                    transition={{ duration: 1, delay: 0.5 + (index * 0.1) }}
                                    className={`h-full rounded-full ${award.isUnlocked ? "bg-emerald-500" : "bg-primary/50"}`}
                                />
                            </div>
                        </div>

                        {/* Shine Effect on Hover */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-700">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
