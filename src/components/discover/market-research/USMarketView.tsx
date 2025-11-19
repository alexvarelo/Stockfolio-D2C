import { useScreenPredefinedApiV1ScreenPredefinedScreenerNameGet } from "@/api/search/search";
import { MarketSection } from "./MarketSection";
import { SearchResult } from "@/api/financialDataApi.schemas";

export function USMarketView() {
    // Fetch predefined screeners (US Market)
    // Note: In a real app, we might want to parallelize these or fetch them individually as needed
    // For now, we'll use the main hook we were using before, but we might need to fetch multiple if the API requires it.
    // The previous implementation fetched "day_gainers" and seemingly used it for everything or had a logic I missed?
    // Looking back at the original code:
    // const { data: predefinedData } = useScreenPredefinedApiV1ScreenPredefinedScreenerNameGet("day_gainers", ...)
    // And getScreenerData returned predefinedData for ALL predefined types.
    // This implies the previous code was showing "day_gainers" data for "day_losers" etc. unless the API returns all.
    // Let's check the API or assume we need to fetch each.
    // Actually, the previous code had a bug/simplification:
    // if (isPredefinedScreener(type)) return predefinedData;
    // This means it was showing the SAME data for all US sections.
    // I should fix this by fetching the correct data for each section.

    const { data: gainers, isLoading: gainersLoading } = useScreenPredefinedApiV1ScreenPredefinedScreenerNameGet(
        "day_gainers",
        undefined,
        { query: { staleTime: 300000 } }
    );

    const { data: losers, isLoading: losersLoading } = useScreenPredefinedApiV1ScreenPredefinedScreenerNameGet(
        "day_losers",
        undefined,
        { query: { staleTime: 300000 } }
    );

    const { data: active, isLoading: activeLoading } = useScreenPredefinedApiV1ScreenPredefinedScreenerNameGet(
        "most_actives",
        undefined,
        { query: { staleTime: 300000 } }
    );

    const { data: undervalued, isLoading: undervaluedLoading } = useScreenPredefinedApiV1ScreenPredefinedScreenerNameGet(
        "undervalued_large_caps",
        undefined,
        { query: { staleTime: 300000 } }
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <MarketSection
                title="Top Gainers"
                stocks={gainers?.data?.results || []}
                isLoading={gainersLoading}
                featured
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <MarketSection
                    title="Top Losers"
                    stocks={losers?.data?.results || []}
                    isLoading={losersLoading}
                />
                <MarketSection
                    title="Most Active"
                    stocks={active?.data?.results || []}
                    isLoading={activeLoading}
                />
            </div>

            <MarketSection
                title="Undervalued Gems"
                stocks={undervalued?.data?.results || []}
                isLoading={undervaluedLoading}
                featured
            />
        </div>
    );
}
