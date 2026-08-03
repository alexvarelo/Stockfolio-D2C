import { useMemo } from "react";
import { useReducedMotion } from "framer-motion";
import { StockyLogo } from "@/components/brand/StockyLogo";
import { useCustomerHoldings } from "@/api/portfolio/useCustomerHoldings";
import { formatCurrency } from "@/lib/utils";
import { formatPercentage } from "@/lib/formatters";
import { useTypewriterRotation } from "@/hooks/useTypewriterRotation";

export const WealthInsight = () => {
    const { data: holdings, isLoading } = useCustomerHoldings({ includeMarketData: true });
    const prefersReducedMotion = useReducedMotion();

    const phrases = useMemo(() => {
        if (!holdings || holdings.length === 0) return [];

        const withDailyChange = holdings.filter((h) => h.dailyChangePercent !== null);
        const topGainer = [...withDailyChange].sort((a, b) => (b.dailyChangePercent || 0) - (a.dailyChangePercent || 0))[0];
        const topLoser = [...withDailyChange].sort((a, b) => (a.dailyChangePercent || 0) - (b.dailyChangePercent || 0))[0];
        // holdings arrives sorted by currentValue desc
        const largest = holdings[0];

        const list: string[] = [];

        if (topGainer && (topGainer.dailyChangePercent || 0) > 0) {
            list.push(`Today your biggest performer is ${topGainer.symbol}, up ${formatPercentage(topGainer.dailyChangePercent || 0)}`);
        }
        if (topLoser && (topLoser.dailyChangePercent || 0) < 0 && topLoser.symbol !== topGainer?.symbol) {
            list.push(`Your biggest mover today is ${topLoser.symbol}, down ${formatPercentage(Math.abs(topLoser.dailyChangePercent || 0))}`);
        }
        if (largest?.currentValue) {
            list.push(`Your largest holding is ${largest.symbol}, worth ${formatCurrency(largest.currentValue)}`);
        }

        return list.length > 0 ? list : [`You hold ${holdings.length} asset${holdings.length === 1 ? "" : "s"} right now`];
    }, [holdings]);

    const { text, isTyping } = useTypewriterRotation(
        phrases.length > 0 ? phrases : ["Tracking your portfolio in real time"],
        { reduced: prefersReducedMotion || false }
    );

    if (isLoading) return null;

    return (
        <div className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-muted px-2.5 py-1.5">
            <StockyLogo variant="ink" size={18} className="shrink-0" />
            <span className="truncate text-xs text-foreground/80">
                {text}
                <span
                    className="ml-0.5 inline-block h-3 w-px translate-y-0.5 animate-pulse bg-foreground/50 align-middle"
                    style={{ opacity: isTyping ? 1 : 0.4 }}
                />
            </span>
        </div>
    );
};
