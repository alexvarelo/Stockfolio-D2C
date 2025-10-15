import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    TrendingUp,
    TrendingDown,
    Activity,
    Target, BarChart3,
    DollarSign,
    ArrowUp,
    ArrowDown, Star,
    Building2,
    Globe, Activity as ActivityIcon,
    Grid3X3,
    List,
    MapPin,
    Crown,
    Zap,
    Award
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useScreenEquitiesApiV1ScreenPost, useScreenPredefinedApiV1ScreenPredefinedScreenerNameGet } from "@/api/search/search";
import { formatCurrency } from "@/lib/formatters";
import { SearchResult } from "@/api/financialDataApi.schemas";

type ScreenerType =
  | "day_gainers"
  | "day_losers"
  | "most_actives"
  | "most_shorted_stocks"
  | "portfolio_anchors"
  | "undervalued_large_caps"
  | "european_gainers"
  | "european_blue_chips"
  | "uk_stocks"
  | "spanish_stocks"
  | "german_stocks"
  | "french_stocks";

const screenerConfig = {
  day_gainers: {
    title: "Top Gainers",
    icon: TrendingUp,
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200",
    format: "mini-cards"
  },
  day_losers: {
    title: "Top Losers",
    icon: TrendingDown,
    color: "text-red-600",
    bgColor: "bg-red-50 border-red-200",
    format: "mini-cards"
  },
  most_actives: {
    title: "Most Active",
    icon: Activity,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
    format: "mini-table"
  },
  most_shorted_stocks: {
    title: "Most Shorted",
    icon: Target,
    color: "text-purple-600",
    bgColor: "bg-purple-50 border-purple-200",
    format: "mini-cards"
  },
  portfolio_anchors: {
    title: "Stable Stocks",
    icon: BarChart3,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 border-indigo-200",
    format: "mini-cards"
  },
  undervalued_large_caps: {
    title: "Undervalued Large Caps",
    icon: DollarSign,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 border-emerald-200",
    format: "mini-table"
  },
  european_gainers: {
    title: "European Gainers",
    icon: Globe,
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200",
    format: "mini-cards"
  },
  european_blue_chips: {
    title: "European Blue Chips",
    icon: Crown,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
    format: "mini-cards"
  },
  uk_stocks: {
    title: "UK Stocks",
    icon: MapPin,
    color: "text-red-600",
    bgColor: "bg-red-50 border-red-200",
    format: "mini-cards"
  },
  spanish_stocks: {
    title: "Spanish Stocks",
    icon: MapPin,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 border-yellow-200",
    format: "mini-cards"
  },
  german_stocks: {
    title: "German Stocks",
    icon: Grid3X3,
    color: "text-purple-600",
    bgColor: "bg-purple-50 border-purple-200",
    format: "mini-cards"
  },
  french_stocks: {
    title: "French Stocks",
    icon: List,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 border-indigo-200",
    format: "mini-cards"
  },
};

// Widget categories for the dashboard layout
const widgetCategories = {
  "market-overview": ["day_gainers", "day_losers", "most_actives"],
  "value-stocks": ["undervalued_large_caps", "portfolio_anchors"],
  "special-focus": ["most_shorted_stocks", "european_gainers"],
  "regional-markets": ["uk_stocks", "spanish_stocks", "german_stocks", "french_stocks", "european_blue_chips"]
};

// Check if a screener type is a predefined screener
const isPredefinedScreener = (type: ScreenerType): type is "day_gainers" | "day_losers" | "most_actives" | "most_shorted_stocks" | "portfolio_anchors" | "undervalued_large_caps" => {
  return ["day_gainers", "day_losers", "most_actives", "most_shorted_stocks", "portfolio_anchors", "undervalued_large_caps"].includes(type);
};

// Check if a screener type is a European screener
const isEuropeanScreener = (type: ScreenerType): type is "european_gainers" | "european_blue_chips" | "uk_stocks" | "spanish_stocks" | "german_stocks" | "french_stocks" => {
  return ["european_gainers", "european_blue_chips", "uk_stocks", "spanish_stocks", "german_stocks", "french_stocks"].includes(type);
};

export function MarketResearch() {
  const navigate = useNavigate();

  // Hook for predefined screeners (US stocks)
  const {
    data: predefinedData,
    isLoading: isPredefinedLoading,
    error: predefinedError,
  } = useScreenPredefinedApiV1ScreenPredefinedScreenerNameGet(
    "day_gainers", // Default for initial load
    undefined,
    {
      query: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 5 * 60 * 1000, // Auto refresh every 5 minutes
      },
    }
  );

  // Hook for European screeners (custom queries)
  const europeanScreenMutation = useScreenEquitiesApiV1ScreenPost();

  // European screening queries
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
    european_blue_chips: {
      operator: "and",
      conditions: [
        { operator: "is-in", field: "region", value: ["gb", "de", "fr", "it", "es", "nl", "be", "at", "se", "dk", "no", "fi", "pt", "ie", "gr", "cz", "pl", "hu"] },
        { operator: "gt", field: "intradaymarketcap", value: 10000000000 } // > $10B market cap
      ],
      sort_by: "intradaymarketcap",
      sort_order: "desc"
    },
    uk_stocks: {
      operator: "and",
      conditions: [
        { operator: "eq", field: "region", value: "gb" },
        { operator: "is-in", field: "exchange", value: ["LSE", "AQS", "IOB"] }
      ],
      sort_by: "intradaymarketcap",
      sort_order: "desc"
    },
    spanish_stocks: {
      operator: "and",
      conditions: [
        { operator: "eq", field: "region", value: "es" },
        { operator: "is-in", field: "exchange", value: ["MCE"] }
      ],
      sort_by: "intradaymarketcap",
      sort_order: "desc"
    },
    german_stocks: {
      operator: "and",
      conditions: [
        { operator: "eq", field: "region", value: "de" },
        { operator: "is-in", field: "exchange", value: ["FRA", "BER", "DUS", "HAM", "MUN", "STU"] }
      ],
      sort_by: "intradaymarketcap",
      sort_order: "desc"
    },
    french_stocks: {
      operator: "and",
      conditions: [
        { operator: "eq", field: "region", value: "fr" },
        { operator: "is-in", field: "exchange", value: ["PAR"] }
      ],
      sort_by: "intradaymarketcap",
      sort_order: "desc"
    }
  };

  // Get data for a specific screener type
  const getScreenerData = (type: ScreenerType) => {
    if (isPredefinedScreener(type)) {
      // For now, use the same data for all predefined screeners
      // In a more complete implementation, you'd call the hook for each specific type
      return predefinedData;
    } else if (isEuropeanScreener(type)) {
      return europeanScreenMutation.data;
    }
    return null;
  };

  // Get loading state for a specific screener type
  const getScreenerLoading = (type: ScreenerType) => {
    if (isPredefinedScreener(type)) {
      return isPredefinedLoading;
    } else if (isEuropeanScreener(type)) {
      return europeanScreenMutation.isPending;
    }
    return false;
  };

  // Get error state for a specific screener type
  const getScreenerError = (type: ScreenerType) => {
    if (isPredefinedScreener(type)) {
      return predefinedError;
    } else if (isEuropeanScreener(type)) {
      return europeanScreenMutation.error;
    }
    return null;
  };

  // Trigger European screening for all European types
  useEffect(() => {
    const europeanTypes = Object.keys(europeanQueries) as ScreenerType[];
    europeanTypes.forEach(type => {
      if (isEuropeanScreener(type)) {
        europeanScreenMutation.mutate(
          { data: europeanQueries[type] },
          {
            onSuccess: (data) => {
              // Handle success if needed
            }
          }
        );
      }
    });
  }, []); // Only run once on mount

  const handleStockClick = (symbol: string) => {
    navigate(`/instrument/${symbol}`);
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
    return volume.toString();
  };

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(1)}T`;
    if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(1)}B`;
    if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(1)}M`;
  };

  // Mini card component for widgets
  const renderMiniStockCard = (stock: SearchResult, config: any) => {
    const Icon = config.icon;
    const isPositive = (stock.regular_market_change ?? 0) >= 0;

    return (
      <Card className="p-3 hover:shadow-md transition-all duration-200 cursor-pointer group" onClick={() => handleStockClick(stock.symbol)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div className={cn("p-1.5 rounded-lg", config.bgColor)}>
              <Icon className={cn("w-3 h-3", config.color)} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-sm truncate">{stock.symbol}</div>
              <div className="text-xs text-muted-foreground truncate">{stock.name}</div>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="font-bold text-sm">
              {formatCurrency(stock.regular_market_price ?? 0, stock.currency ?? "USD")}
            </div>
            <div className={cn("text-xs font-medium", isPositive ? "text-green-600" : "text-red-600")}>
              {isPositive ? "+" : ""}{stock.regular_market_change_percent?.toFixed(1)}%
            </div>
          </div>
        </div>
      </Card>
    );
  };

  // Mini table component for widgets
  const renderMiniTable = (stocks: SearchResult[], config: any) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs font-semibold py-2">Symbol</TableHead>
            <TableHead className="text-xs font-semibold text-right py-2">Price</TableHead>
            <TableHead className="text-xs font-semibold text-right py-2">Change</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stocks.slice(0, 5).map((stock) => (
            <TableRow key={stock.symbol} className="cursor-pointer hover:bg-gray-50" onClick={() => handleStockClick(stock.symbol)}>
              <TableCell className="text-xs font-medium py-2">{stock.symbol}</TableCell>
              <TableCell className="text-xs text-right py-2">
                {formatCurrency(stock.regular_market_price ?? 0, stock.currency ?? "USD")}
              </TableCell>
              <TableCell className={cn("text-xs text-right font-medium py-2",
                (stock.regular_market_change ?? 0) >= 0 ? "text-green-600" : "text-red-600"
              )}>
                {stock.regular_market_change_percent?.toFixed(1)}%
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  // Widget component
  const renderWidget = (type: ScreenerType, title: string, size: "normal" | "large" = "normal") => {
    const config = screenerConfig[type];
    const data = getScreenerData(type);
    const isLoading = getScreenerLoading(type);
    const error = getScreenerError(type);
    const stocks = data?.data?.results ?? [];

    return (
      <Card className={cn("h-full", size === "large" && "md:col-span-2")}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <div className={cn("p-2 rounded-lg", config.bgColor)}>
              <config.icon className={cn("w-5 h-5", config.color)} />
            </div>
            <span>{config.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {error ? (
            <div className="text-center text-sm text-muted-foreground py-4">
              Failed to load data
            </div>
          ) : isLoading ? (
            <div className="space-y-2">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <>
              {config.format === "mini-cards" ? (
                <div className="grid gap-2">
                  {stocks.slice(0, size === "large" ? 8 : 4).map(stock =>
                    renderMiniStockCard(stock, config)
                  )}
                </div>
              ) : (
                renderMiniTable(stocks, config)
              )}
              {stocks.length > (size === "large" ? 8 : 4) && (
                <div className="text-center mt-3">
                  <Button variant="outline" size="sm">
                    View All ({stocks.length})
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  // Render skeleton for widgets
  const renderWidgetSkeleton = (size: "normal" | "large" = "normal") => (
    <Card className={cn("h-full", size === "large" && "md:col-span-2")}>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="w-24 h-5" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Market Overview Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
          <ActivityIcon className="w-6 h-6" />
          <span>Market Overview</span>
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {widgetCategories["market-overview"].map(type =>
            isPredefinedScreener(type as ScreenerType) || isEuropeanScreener(type as ScreenerType) ?
              renderWidget(type as ScreenerType, screenerConfig[type as ScreenerType].title) :
              renderWidgetSkeleton()
          )}
        </div>
      </div>

      {/* Value Stocks Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
          <Award className="w-6 h-6" />
          <span>Value & Quality Stocks</span>
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {widgetCategories["value-stocks"].map(type =>
            isPredefinedScreener(type as ScreenerType) || isEuropeanScreener(type as ScreenerType) ?
              renderWidget(type as ScreenerType, screenerConfig[type as ScreenerType].title, "large") :
              renderWidgetSkeleton("large")
          )}
        </div>
      </div>

      {/* Special Focus Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
          <Zap className="w-6 h-6" />
          <span>Special Focus</span>
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {widgetCategories["special-focus"].map(type =>
            isPredefinedScreener(type as ScreenerType) || isEuropeanScreener(type as ScreenerType) ?
              renderWidget(type as ScreenerType, screenerConfig[type as ScreenerType].title) :
              renderWidgetSkeleton()
          )}
        </div>
      </div>

      {/* Regional Markets Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center space-x-2">
          <Globe className="w-6 h-6" />
          <span>Regional Markets</span>
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {widgetCategories["regional-markets"].map(type =>
            isPredefinedScreener(type as ScreenerType) || isEuropeanScreener(type as ScreenerType) ?
              renderWidget(type as ScreenerType, screenerConfig[type as ScreenerType].title) :
              renderWidgetSkeleton()
          )}
        </div>
      </div>

      <div className="mt-6 text-xs text-muted-foreground text-center">
        <div className="flex items-center justify-center space-x-2">
          <ActivityIcon className="w-4 h-4" />
          <span>
            Data refreshes every 5 minutes • Last updated:{" "}
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
}
