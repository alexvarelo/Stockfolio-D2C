import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
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
    const returnPct = totalInvested > 0 ? (netProfitLoss / totalInvested) * 100 : 0;
    const isPositive = netProfitLoss >= 0;
    const holdingsCount = portfolios.reduce((sum, p) => sum + (p.holdings_count || 0), 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-3xl border border-border bg-card p-6 sm:p-8"
        >
            <p className="text-sm font-medium text-muted-foreground">Total Wealth</p>
            <div className="mt-2 flex flex-wrap items-end gap-3">
                <h1 className="text-[40px] sm:text-[48px] font-bold tracking-tight leading-none">
                    {formatCurrency(totalValue)}
                </h1>
                <div
                    className={`mb-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold ${isPositive ? "bg-success-light text-success" : "bg-danger-light text-danger"
                        }`}
                >
                    {isPositive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    {isPositive ? "+" : ""}
                    {returnPct.toFixed(2)}%
                </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-border pt-5">
                <Stat label="Invested" value={formatCurrency(totalInvested)} />
                <Stat
                    label="Gain / Loss"
                    value={`${isPositive ? "+" : ""}${formatCurrency(netProfitLoss)}`}
                    tone={isPositive ? "success" : "danger"}
                />
                <Stat label="Holdings" value={`${holdingsCount}`} />
                <Stat label="Portfolios" value={`${portfolios.length}`} />
            </div>
        </motion.div>
    );
};

function Stat({ label, value, tone }: { label: string; value: string; tone?: "success" | "danger" }) {
    return (
        <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
            <p
                className={`mt-0.5 text-sm font-semibold ${tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : "text-foreground"
                    }`}
            >
                {value}
            </p>
        </div>
    );
}
