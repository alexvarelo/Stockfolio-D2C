import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercentage } from "@/lib/formatters";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { PortfolioHolding } from "@/api/portfolio/portfolio";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PortfolioHoldingsProps {
  holdings: PortfolioHolding[];
  isLoading?: boolean;
  isLoadingPrices?: boolean;
}

export const PortfolioHoldings = ({
  holdings,
  isLoading = false,
  isLoadingPrices = false
}: PortfolioHoldingsProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
          <CardDescription>Loading holdings...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 bg-muted/20 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  if (holdings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
          <CardDescription>
            This portfolio doesn't have any holdings yet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Calculate total portfolio value for percentage calculations
  // If loading prices, we can't calculate accurate total value for allocation
  const totalValue = holdings.reduce(
    (sum, holding) => sum + (isLoadingPrices ? holding.total_invested : (holding.current_price || 0) * holding.quantity),
    0
  );

  return (
    <Card className="border-border/50 bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-slate-900/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold tracking-tight">Holdings</CardTitle>
            <CardDescription className="mt-1">
              {holdings.length} {holdings.length === 1 ? "holding" : "holdings"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="w-[200px]">Asset</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Avg. Cost</TableHead>
              <TableHead className="text-right">Market Value</TableHead>
              <TableHead className="text-right">P&L</TableHead>
              <TableHead className="text-right w-[150px]">Allocation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.map((holding) => {
              const marketValue =
                (holding.current_price || 0) * holding.quantity;
              const pnl = marketValue - holding.total_invested;
              const pnlPercentage = (pnl / holding.total_invested) * 100;

              // If loading prices, allocation calculation might be off if we use total_invested as fallback for totalValue
              // But for skeleton display it doesn't matter much
              const allocation = totalValue > 0 ? (holding.total_invested / totalValue) * 100 : 0;

              return (
                <TableRow key={holding.ticker} className="group hover:bg-muted/30 border-border/50 transition-colors">
                  <TableCell className="font-medium">
                    <Link
                      to={`/instrument/${holding.ticker}`}
                      className="flex items-center gap-2 group/link"
                    >
                      <span className="bg-muted/50 px-2 py-1 rounded text-sm font-semibold group-hover/link:bg-primary/10 group-hover/link:text-primary transition-colors">
                        {holding.ticker}
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover/link:opacity-100 transition-all -translate-x-1 group-hover/link:translate-x-0" />
                    </Link>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {isLoadingPrices ? (
                      <Skeleton className="h-4 w-16 ml-auto" />
                    ) : (
                      holding.current_price
                        ? formatCurrency(holding.current_price)
                        : "N/A"
                    )}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {holding.quantity.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCurrency(holding.average_price)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {isLoadingPrices ? (
                      <Skeleton className="h-4 w-20 ml-auto" />
                    ) : (
                      formatCurrency(marketValue)
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {isLoadingPrices ? (
                      <Skeleton className="h-4 w-24 ml-auto" />
                    ) : (
                      <div className="flex justify-end">
                        <div
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${pnl >= 0
                            ? "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400"
                            : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                            }`}
                        >
                          {pnl >= 0 ? (
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 mr-1" />
                          )}
                          {formatCurrency(pnl)} ({formatPercentage(pnlPercentage)})
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {isLoadingPrices ? (
                      <Skeleton className="h-4 w-full" />
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="h-1.5 bg-muted rounded-full flex-1 overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${Math.min(100, allocation)}%` }}
                          />
                        </div>
                        <span className="text-muted-foreground text-xs w-10 text-right font-medium">
                          {formatPercentage(allocation)}
                        </span>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
