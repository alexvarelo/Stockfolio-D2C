import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import type { Portfolio } from "@/api/portfolio/usePortfolios";
import { WealthInsight } from "./WealthInsight";
import { useCountUp } from "./useCountUp";

interface WealthHeroProps {
    portfolios: Portfolio[];
}

export const WealthHero = ({ portfolios }: WealthHeroProps) => {
    const totalValue = portfolios.reduce((sum, p) => sum + (p.total_value || 0), 0);

    // Cost Basis = Value / (1 + Return%), same derivation used across the dashboard stat cards
    const totalInvested = portfolios.reduce((sum, p) => {
        const value = p.total_value || 0;
        const returnPct = (p.total_return_percentage || 0) / 100;
        const costBasis = returnPct === -1 ? 0 : value / (1 + returnPct);
        return sum + costBasis;
    }, 0);

    const netProfitLoss = totalValue - totalInvested;
    const returnPct = totalInvested > 0 ? (netProfitLoss / totalInvested) * 100 : 0;
    const isPositive = netProfitLoss >= 0;
    const holdingsCount = portfolios.reduce((sum, p) => sum + (p.holdings_count || 0), 0);

    const animatedValue = useCountUp(totalValue);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <WealthInsight />

            <p className="mt-4 text-sm font-medium text-muted-foreground">Total Wealth</p>
            <div className="mt-2 flex flex-wrap items-end gap-3">
                <h1 className="text-[40px] sm:text-[48px] font-bold tracking-tight leading-none tabular-nums">
                    {formatCurrency(animatedValue)}
                </h1>
                <span className={`mb-1 text-lg font-semibold ${isPositive ? "text-primary" : "text-danger"}`}>
                    {isPositive ? "+" : ""}
                    {returnPct.toFixed(2)}%
                </span>
            </div>

            <p className="mt-1.5 text-sm text-muted-foreground">
                <span className={isPositive ? "font-medium text-primary" : "font-medium text-danger"}>
                    {isPositive ? "+" : "-"}
                    {formatCurrency(Math.abs(netProfitLoss))}
                </span>
                {" "}
                {isPositive ? "gained" : "lost"} on {formatCurrency(totalInvested)} invested
            </p>

            <div className="mt-4 flex gap-6 text-sm text-muted-foreground">
                <span>{holdingsCount} holding{holdingsCount === 1 ? "" : "s"}</span>
                <span>{portfolios.length} portfolio{portfolios.length === 1 ? "" : "s"}</span>
            </div>
        </motion.div>
    );
};
