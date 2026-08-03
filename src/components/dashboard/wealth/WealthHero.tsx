import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import type { Portfolio } from "@/api/portfolio/usePortfolios";

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
    const isPositive = netProfitLoss >= 0;
    const holdingsCount = portfolios.reduce((sum, p) => sum + (p.holdings_count || 0), 0);

    // Bar always reads as "share of the larger of the two figures", so it never overflows
    // whichever direction the gain/loss goes.
    const barBase = Math.max(totalValue, totalInvested);
    const investedShare = barBase > 0 ? Math.min(100, (Math.min(totalValue, totalInvested) / barBase) * 100) : 0;
    const deltaShare = 100 - investedShare;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl border border-border bg-card p-6 sm:p-8"
        >
            <p className="text-sm font-medium text-muted-foreground">Total Wealth</p>
            <h1 className="mt-2 text-[40px] sm:text-[48px] font-bold tracking-tight leading-none">
                {formatCurrency(totalValue)}
            </h1>

            <div className="mt-5 flex h-1.5 overflow-hidden rounded-full">
                <div className="bg-muted" style={{ width: `${investedShare}%` }} />
                <div
                    className={isPositive ? "bg-primary" : "bg-danger"}
                    style={{ width: `${deltaShare}%` }}
                />
            </div>

            <p className="mt-2.5 text-sm text-muted-foreground">
                Invested {formatCurrency(totalInvested)}
                {" · "}
                <span className={isPositive ? "font-medium text-primary" : "font-medium text-danger"}>
                    {isPositive ? "Gained" : "Lost"} {formatCurrency(Math.abs(netProfitLoss))}
                </span>
            </p>

            <div className="mt-5 flex gap-6 border-t border-border pt-4 text-sm text-muted-foreground">
                <span>{holdingsCount} holding{holdingsCount === 1 ? "" : "s"}</span>
                <span>{portfolios.length} portfolio{portfolios.length === 1 ? "" : "s"}</span>
            </div>
        </motion.div>
    );
};
