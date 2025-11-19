import { useEffect, useState } from "react";
import { useScreenEquitiesApiV1ScreenPost } from "@/api/search/search";
import { MarketSection } from "./MarketSection";
import { SearchResult } from "@/api/financialDataApi.schemas";

// European Queries
const europeanQueries = {
    european_gainers: {
        operator: "and",
        conditions: [
            { operator: "is-in", field: "region", value: ["gb", "de", "fr", "it", "es", "nl", "be", "at", "se", "dk", "no", "fi", "pt", "ie", "gr", "cz", "pl", "hu"] },
            { operator: "gt", field: "percentchange", value: 0 }
        ],
        sort_by: "percentChange",
        sort_order: "desc"
    },
    uk_stocks: {
        operator: "and",
        conditions: [{ operator: "eq", field: "region", value: "gb" }, { operator: "is-in", field: "exchange", value: ["LSE", "AQS", "IOB"] }],
        sort_by: "intradaymarketcap",
        sort_order: "desc"
    },
    spanish_stocks: {
        operator: "and",
        conditions: [{ operator: "eq", field: "region", value: "es" }, { operator: "is-in", field: "exchange", value: ["MCE"] }],
        sort_by: "intradaymarketcap",
        sort_order: "desc"
    },
    german_stocks: {
        operator: "and",
        conditions: [{ operator: "eq", field: "region", value: "de" }, { operator: "is-in", field: "exchange", value: ["FRA", "BER", "DUS", "HAM", "MUN", "STU"] }],
        sort_by: "intradaymarketcap",
        sort_order: "desc"
    },
    french_stocks: {
        operator: "and",
        conditions: [{ operator: "eq", field: "region", value: "fr" }, { operator: "is-in", field: "exchange", value: ["PAR"] }],
        sort_by: "intradaymarketcap",
        sort_order: "desc"
    }
};

export function EuropeMarketView() {
    // We need separate mutations or state for each section to avoid overwriting data
    // Since useScreenEquitiesApiV1ScreenPost is a mutation, we can't easily use it for multiple simultaneous fetches 
    // without multiple instances or managing state manually.
    // A better approach for "fetch on mount" with mutations is to use them like queries or have a custom hook.
    // However, to keep it simple and consistent with the previous design, I'll create a small helper component 
    // or just use multiple hooks. Given the generated code structure, let's use a helper component for each section
    // that handles its own data fetching.

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <EuropeSection
                title="European Gainers"
                query={europeanQueries.european_gainers}
                featured
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <EuropeSection title="UK Market" query={europeanQueries.uk_stocks} />
                <EuropeSection title="German Market" query={europeanQueries.german_stocks} />
                <EuropeSection title="French Market" query={europeanQueries.french_stocks} />
                <EuropeSection title="Spanish Market" query={europeanQueries.spanish_stocks} />
            </div>
        </div>
    );
}

function EuropeSection({ title, query, featured }: { title: string, query: any, featured?: boolean }) {
    const { mutate, data, isPending } = useScreenEquitiesApiV1ScreenPost();

    useEffect(() => {
        mutate({ data: query });
    }, []);

    return (
        <MarketSection
            title={title}
            stocks={data?.data?.results || []}
            isLoading={isPending}
            featured={featured}
        />
    );
}
