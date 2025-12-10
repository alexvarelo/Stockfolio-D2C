import { motion, Variants } from "framer-motion";
import { Portfolio } from "@/api/portfolio/usePortfolios";
import { TotalInvestedCard } from "./TotalInvestedCard";
import { TotalHoldingsCard } from "./TotalHoldingsCard";
import { PerformanceCard } from "./PerformanceCard";
import { NetProfitLossCard } from "./NetProfitLossCard";

interface DashboardStatsGridProps {
    portfolios: Portfolio[];
}

export const DashboardStatsGrid = ({ portfolios }: DashboardStatsGridProps) => {
    const totalPortfolioValue = portfolios?.reduce((sum, p) => sum + (p.total_value || 0), 0) || 0;

    // Calculate total invested (Cost Basis) derived from Value and Return %
    // Cost Basis = Value / (1 + Return%)
    const totalInvested = portfolios?.reduce((sum, p) => {
        const value = p.total_value || 0;
        const returnPct = (p.total_return_percentage || 0) / 100;
        // Avoid division by zero if return is -100%
        const costBasis = returnPct === -1 ? 0 : value / (1 + returnPct);
        return sum + costBasis;
    }, 0) || 0;

    const totalHoldings = portfolios?.reduce((sum, p) => sum + (p.holdings_count || 0), 0) || 0;

    const netProfitLoss = totalPortfolioValue - totalInvested;

    // Animation variants
    const container: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    };

    const item: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 12,
            },
        },
    };

    return (
        <motion.div
            className="grid grid-cols-2 gap-4"
            variants={container}
            initial="hidden"
            animate="show"
        >
            <motion.div variants={item}>
                <TotalInvestedCard totalValue={totalInvested} />
            </motion.div>

            <motion.div variants={item}>
                <TotalHoldingsCard count={totalHoldings} />
            </motion.div>

            <motion.div variants={item}>
                <PerformanceCard portfolios={portfolios} />
            </motion.div>

            <motion.div variants={item}>
                <NetProfitLossCard netProfitLoss={netProfitLoss} />
            </motion.div>
        </motion.div>
    );
};
