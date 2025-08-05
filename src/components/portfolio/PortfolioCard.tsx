import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Eye, Lock, Briefcase } from "lucide-react";
import { useGetMultipleStockPricesApiV1StockTickersPricesGet } from "@/api/stock/stock";

interface Holding {
  ticker: string;
  quantity: number;
  total_invested: number;
}

export interface PortfolioCardProps {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  is_default: boolean;
  created_at: string;
  holdings?: Holding[];
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({
  name,
  description,
  is_public,
  is_default,
  created_at,
  holdings = [],
}) => {
  const { data: instrumentPrices, isLoading: isLoadingPrices } =
    useGetMultipleStockPricesApiV1StockTickersPricesGet(
      holdings.map((h) => h.ticker).join(",")
    );

  console.log(instrumentPrices);

  // --- Portfolio performance calculations ---
  const priceMap = React.useMemo(() => {
    const map = new Map<string, any>();
    (instrumentPrices?.data ?? []).forEach((p: any) => map.set(p.symbol, p));
    return map;
  }, [instrumentPrices]);

  let totalCurrentValue = 0;
  let totalCostBasis = 0;
  let totalTodayChange = 0;

  holdings.forEach((h) => {
    const price = priceMap.get(h.ticker);
    if (!price || price.current_price == null) return;

    const currentValue = h.quantity * price.current_price;
    const costBasis = h.total_invested;
    const previousClose =
      price.previous_close ?? price.current_price - (price.change ?? 0);
    const todayChange =
      h.quantity * ((price.current_price ?? 0) - (previousClose ?? 0));

    totalCurrentValue += currentValue;
    totalCostBasis += costBasis;
    totalTodayChange += todayChange;
  });

  const totalEarnedLost = totalCurrentValue - totalCostBasis;
  const portfolioPerformance =
    totalCostBasis > 0 ? totalEarnedLost / totalCostBasis : 0;
  const todayPerformance =
    totalCurrentValue - totalTodayChange > 0
      ? totalTodayChange / (totalCurrentValue - totalTodayChange)
      : 0;

  const totalValue = totalCostBasis;
  const totalHoldings = holdings?.length || 0;

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{name}</CardTitle>
            <div className="flex items-center gap-2">
              {is_default && <Badge variant="secondary">Default</Badge>}
              <Badge variant={is_public ? "default" : "outline"}>
                {is_public ? (
                  <>
                    <Eye className="mr-1 h-3 w-3" /> Public
                  </>
                ) : (
                  <>
                    <Lock className="mr-1 h-3 w-3" /> Private
                  </>
                )}
              </Badge>
            </div>
          </div>
          <Briefcase className="h-5 w-5 text-muted-foreground" />
        </div>
        {description && (
          <CardDescription className="text-sm">{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Current Portfolio Value
            </span>
            <span className="font-semibold">
              $
              {totalCurrentValue.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Total Value (Invested)
            </span>
            <span className="font-semibold">
              $
              {totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Holdings</span>
            <span className="font-medium">{totalHoldings}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Total Earned/Lost
            </span>
            <span
              className={
                totalEarnedLost >= 0 ? "text-success" : "text-destructive"
              }
            >
              $
              {totalEarnedLost.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Portfolio Performance
            </span>
            <span
              className={
                portfolioPerformance >= 0 ? "text-success" : "text-destructive"
              }
            >
              {(portfolioPerformance * 100).toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Today's Change
            </span>
            <span
              className={
                totalTodayChange >= 0 ? "text-success" : "text-destructive"
              }
            >
              $
              {totalTodayChange.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}{" "}
              ({(todayPerformance * 100).toFixed(2)}%)
            </span>
          </div>
        </div>
        {totalHoldings > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Top Holdings</p>
            <div className="space-y-1">
              {holdings.slice(0, 3).map((holding, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {holding.ticker}
                  </span>
                  <span>{holding.quantity} shares</span>
                </div>
              ))}
              {holdings.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{holdings.length - 3} more
                </p>
              )}
            </div>
          </div>
        )}
        <div className="pt-2 border-t">
          <p className="text-xs text-muted-foreground">
            Created {new Date(created_at).toLocaleDateString()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
