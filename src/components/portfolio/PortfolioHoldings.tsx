import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatPercentage } from "@/lib/formatters";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { PortfolioHolding } from "@/api/portfolio/portfolio";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PortfolioHoldingsProps {
  holdings: PortfolioHolding[];
}

export const PortfolioHoldings = ({ holdings }: PortfolioHoldingsProps) => {
  if (holdings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
          <CardDescription>This portfolio doesn't have any holdings yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Calculate total portfolio value for percentage calculations
  const totalValue = holdings.reduce(
    (sum, holding) => sum + (holding.current_price || 0) * holding.quantity,
    0
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Holdings</CardTitle>
        <CardDescription>
          {holdings.length} {holdings.length === 1 ? 'holding' : 'holdings'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Quantity</TableHead>
              <TableHead className="text-right">Avg. Cost</TableHead>
              <TableHead className="text-right">Market Value</TableHead>
              <TableHead className="text-right">P&L</TableHead>
              <TableHead className="text-right">Allocation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {holdings.map((holding) => {
              const marketValue = (holding.current_price || 0) * holding.quantity;
              const pnl = marketValue - holding.total_invested;
              const pnlPercentage = (pnl / holding.total_invested) * 100;
              const allocation = (marketValue / totalValue) * 100;

              return (
                <TableRow key={holding.ticker} className="group">
                  <TableCell className="font-medium">
                    <Link 
                      to={`/instrument/${holding.ticker}`}
                      className="hover:underline flex items-center gap-2"
                    >
                      {holding.ticker}
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">
                    {holding.current_price ? formatCurrency(holding.current_price) : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    {holding.quantity.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(holding.average_price)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(marketValue)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className={`flex items-center justify-end ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {pnl >= 0 ? (
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                      )}
                      {formatCurrency(pnl)} ({formatPercentage(pnlPercentage)})
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 bg-muted rounded-full flex-1">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${Math.min(100, allocation)}%` }}
                        />
                      </div>
                      <span className="text-muted-foreground text-sm w-12 text-right">
                        {formatPercentage(allocation)}
                      </span>
                    </div>
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
