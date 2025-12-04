import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StoredPrice {
    ticker: string;
    price: number;
    last_updated: string | null;
}

export const useStoredTickerPrices = (tickers: string[], enabled = true) => {
    return useQuery({
        queryKey: ["stored-ticker-prices", tickers],
        queryFn: async () => {
            if (!tickers.length) return {};

            const { data, error } = await supabase
                .from("ticker_prices")
                .select("ticker, price, last_updated")
                .in("ticker", tickers);

            if (error) throw error;

            const priceMap: Record<string, StoredPrice> = {};
            data?.forEach((item) => {
                priceMap[item.ticker] = item;
            });

            return priceMap;
        },
        enabled: enabled && tickers.length > 0,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export interface StoredPortfolioValue {
    portfolio_id: string;
    total_value: number;
    total_return_percentage: number | null;
    updated_at: string | null;
}

export const useStoredPortfolioValue = (portfolioId: string, enabled = true) => {
    return useQuery({
        queryKey: ["stored-portfolio-value", portfolioId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("portfolio_values")
                .select("*")
                .eq("portfolio_id", portfolioId)
                .maybeSingle();

            if (error) throw error;
            return data as StoredPortfolioValue | null;
        },
        enabled: enabled && !!portfolioId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};
