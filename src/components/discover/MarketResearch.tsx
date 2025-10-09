import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
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
    List
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useScreenPredefinedApiV1ScreenPredefinedScreenerNameGet } from "@/api/search/search";
import { formatCurrency } from "@/lib/formatters";
import { SearchResult } from "@/api/financialDataApi.schemas";

type ScreenerType =
  | "day_gainers"
  | "day_losers"
  | "most_actives"
  | "most_shorted_stocks"
  | "portfolio_anchors"
  | "undervalued_large_caps";

const screenerConfig = {
  day_gainers: {
    title: "Top Gainers",
    icon: TrendingUp,
    color: "text-green-600",
    bgColor: "bg-green-50 border-green-200",
  },
  day_losers: {
    title: "Top Losers",
    icon: TrendingDown,
    color: "text-red-600",
    bgColor: "bg-red-50 border-red-200",
  },
  most_actives: {
    title: "Most Active",
    icon: Activity,
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
  },
  most_shorted_stocks: {
    title: "Most Shorted",
    icon: Target,
    color: "text-purple-600",
    bgColor: "bg-purple-50 border-purple-200",
  },
  portfolio_anchors: {
    title: "Stable Stocks",
    icon: BarChart3,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 border-indigo-200",
  },
  undervalued_large_caps: {
    title: "Undervalued Large Caps",
    icon: DollarSign,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 border-emerald-200",
  },
};

export function MarketResearch() {
  const [activeTab, setActiveTab] = useState<ScreenerType>("day_gainers");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const navigate = useNavigate();

  const {
    data: marketData,
    isLoading,
    error,
  } = useScreenPredefinedApiV1ScreenPredefinedScreenerNameGet(
    activeTab,
    undefined,
    {
      query: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchInterval: 5 * 60 * 1000, // Auto refresh every 5 minutes
      },
    }
  );

  const stocks = marketData?.data?.results ?? [];

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

  const renderStockCard = (stock: SearchResult) => {
    const config = screenerConfig[activeTab];
    const Icon = config.icon;
    const isPositive = (stock.regular_market_change ?? 0) >= 0;

    return (
      <Card
        className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer"
        onClick={() => handleStockClick(stock.symbol)}
      >
        {/* Header with icon and symbol */}
        <div className="relative p-4 pb-2">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div
                className={cn(
                  "p-2 rounded-xl shadow-sm transition-all duration-300 group-hover:scale-110",
                  config.bgColor
                )}
              >
                <Icon className={cn("w-5 h-5", config.color)} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-lg truncate">{stock.name}</div>
                <div className="text-sm truncate max-w-[140px]">
                  {stock.symbol}
                </div>
              </div>
            </div>

            {/* Price and change indicator */}
            <div className="text-right">
              <div className="font-bold text-lg ">
                {formatCurrency(
                  stock.regular_market_price ?? 0,
                  stock.currency ?? "USD"
                )}
              </div>
              <div
                className={cn(
                  "flex items-center justify-end space-x-1 text-sm font-medium transition-colors duration-200",
                  isPositive ? "text-green-600" : "text-red-600"
                )}
              >
                {isPositive ? (
                  <ArrowUp className="w-4 h-4" />
                ) : (
                  <ArrowDown className="w-4 h-4" />
                )}
                <span>
                  {Math.abs(stock.regular_market_change_percent ?? 0).toFixed(
                    2
                  )}
                  %
                </span>
              </div>
            </div>
          </div>

          {/* Key metrics row */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {stock.market_cap && (
              <div className="rounded-lg p-2">
                <div className="text-xs font-medium">Market Cap</div>
                <div className="font-semibold text-sm">
                  {formatMarketCap(stock.market_cap)}
                </div>
              </div>
            )}

            {stock.pe_ratio && stock.pe_ratio > 0 && (
              <div className="rounded-lg p-2">
                <div className="text-xs font-medium">P/E Ratio</div>
                <div className="font-semibold text-sm">
                  {stock.pe_ratio.toFixed(1)}
                </div>
              </div>
            )}

            {stock.average_daily_volume_3_month &&
              stock.average_daily_volume_3_month > 0 && (
                <div className="rounded-lg p-2">
                  <div className="text-xs font-medium">Avg Volume</div>
                  <div className="font-semibold text-sm">
                    {formatVolume(stock.average_daily_volume_3_month)}
                  </div>
                </div>
              )}

            {stock.average_analyst_rating && (
              <div className="rounded-lg p-2">
                <div className="text-xs font-medium">Rating</div>
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span className="font-semibold text-sm">
                    {stock.average_analyst_rating}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Additional info */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3">
              {stock.exchange && (
                <div className="flex items-center space-x-1">
                  <Globe className="w-3 h-3" />
                  <span className="truncate max-w-[80px]">
                    {stock.exchange}
                  </span>
                </div>
              )}
              {stock.country && (
                <div className="flex items-center space-x-1">
                  <Building2 className="w-3 h-3" />
                  <span>{stock.country}</span>
                </div>
              )}
            </div>

            {stock.fifty_two_week_change_percent && (
              <div
                className={cn(
                  "font-medium",
                  (stock.fifty_two_week_change_percent ?? 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                )}
              >
                52W: {stock.fifty_two_week_change_percent.toFixed(1)}%
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const renderSkeletonCards = () =>
    Array(6)
      .fill(0)
      .map((_, i) => (
        <Card key={i} className="animate-pulse overflow-hidden">
          <div className="p-4 pb-2">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="w-16 h-5" />
                  <Skeleton className="w-24 h-4" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="w-20 h-5 ml-auto" />
                <Skeleton className="w-16 h-4 ml-auto" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              {Array(4)
                .fill(0)
                .map((_, j) => (
                  <div key={j} className="rounded-lg p-2">
                    <Skeleton className="w-16 h-3 mb-1" />
                    <Skeleton className="w-12 h-4" />
                  </div>
                ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-16 h-3" />
                <Skeleton className="w-12 h-3" />
              </div>
              <Skeleton className="w-16 h-3" />
            </div>
          </div>
        </Card>
      ));

  const renderTableView = (stocks: SearchResult[]) => (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Symbol</TableHead>
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold text-right">Price</TableHead>
            <TableHead className="font-semibold text-right">Change</TableHead>
            <TableHead className="font-semibold text-right">
              Market Cap
            </TableHead>
            <TableHead className="font-semibold text-right">
              P/E Ratio
            </TableHead>
            <TableHead className="font-semibold text-right">Volume</TableHead>
            <TableHead className="font-semibold text-right">Exchange</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stocks.slice(0, 20).map((stock) => (
            <TableRow
              key={stock.symbol}
              className="transition-colors cursor-pointer hover:bg-gray-50"
              onClick={() => handleStockClick(stock.symbol)}
            >
              <TableCell className="font-medium">{stock.symbol}</TableCell>
              <TableCell className="max-w-xs truncate">{stock.name}</TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(
                  stock.regular_market_price ?? 0,
                  stock.currency ?? "USD"
                )}
              </TableCell>
              <TableCell
                className={cn(
                  "text-right font-medium",
                  (stock.regular_market_change ?? 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                )}
              >
                <div className="flex items-center justify-end space-x-1">
                  {(stock.regular_market_change ?? 0) >= 0 ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                  <span>
                    {Math.abs(stock.regular_market_change_percent ?? 0).toFixed(
                      2
                    )}
                    %
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                {stock.market_cap ? formatMarketCap(stock.market_cap) : "-"}
              </TableCell>
              <TableCell className="text-right">
                {stock.pe_ratio && stock.pe_ratio > 0
                  ? stock.pe_ratio.toFixed(1)
                  : "-"}
              </TableCell>
              <TableCell className="text-right">
                {stock.average_daily_volume_3_month &&
                stock.average_daily_volume_3_month > 0
                  ? formatVolume(stock.average_daily_volume_3_month)
                  : "-"}
              </TableCell>
              <TableCell className="text-right text-sm text-gray-600">
                {stock.exchange || "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderViewToggle = () => (
    <div className="flex items-center">
      <div className="flex rounded-lg">
        <Button
          variant={viewMode === "cards" ? "default" : "ghost"}
          size="sm"
          onClick={() => setViewMode("cards")}
          className={cn("px-2 py-1 text-xs font-medium transition-all")}
        >
          <Grid3X3 className="w-3 h-3 mr-1" />
          Card
        </Button>
        <Button
          variant={viewMode === "table" ? "default" : "ghost"}
          size="sm"
          onClick={() => setViewMode("table")}
          className={cn("px-2 py-1 text-xs font-medium transition-all")}
        >
          <List className="w-3 h-3 mr-1" />
          Table
        </Button>
      </div>
    </div>
  );
  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Failed to load market data. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {renderViewToggle()}
      <Card className="w-full">
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as ScreenerType)}
          >
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-6 h-auto p-1 mt-5">
              {Object.entries(screenerConfig).map(([key, config]) => {
                const Icon = config.icon;
                return (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className={cn(
                      "flex items-center space-x-1 text-xs py-2 px-3 transition-all duration-200"
                    )}
                  >
                    <Icon
                      className={cn("w-3 h-3 transition-colors duration-200")}
                    />
                    <span className="hidden sm:inline font-medium">
                      {config.title}
                    </span>
                    <span className="sm:hidden font-medium">
                      {config.title.split(" ")[0]}
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {Object.entries(screenerConfig).map(([key, config]) => (
              <TabsContent key={key} value={key} className="mt-0">
                {isLoading ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {renderSkeletonCards()}
                  </div>
                ) : (
                  <>
                    {viewMode === "cards" ? (
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {stocks?.slice(0, 12).map(renderStockCard) || []}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        {renderTableView(stocks || [])}
                      </div>
                    )}
                  </>
                )}
              </TabsContent>
            ))}
          </Tabs>

          <div className="mt-6 text-xs text-muted-foreground text-center">
            <div className="flex items-center justify-center space-x-2">
              <ActivityIcon className="w-4 h-4" />
              <span>
                Data refreshes every 5 minutes • Last updated:{" "}
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
