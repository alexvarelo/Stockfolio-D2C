import { Transaction } from "@/api/transaction/usePortfolioTransactions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface TransactionsCardProps {
  transactions: Transaction[];
  className?: string;
  isLoading?: boolean;
  showHeader?: boolean;
}

const TransactionRowSkeleton = () => (
  <TableRow>
    <TableCell>
      <Skeleton className="h-4 w-24" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-16" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-16" />
    </TableCell>
    <TableCell className="text-right">
      <Skeleton className="h-4 w-12 ml-auto" />
    </TableCell>
    <TableCell className="text-right">
      <Skeleton className="h-4 w-16 ml-auto" />
    </TableCell>
    <TableCell className="text-right">
      <Skeleton className="h-4 w-20 ml-auto" />
    </TableCell>
  </TableRow>
);

export function TransactionsCard({
  transactions,
  className,
  isLoading = false,
  showHeader = true,
}: TransactionsCardProps) {
  // Show loading state
  if (isLoading) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>Loading transactions...</CardDescription>
          </CardHeader>
        )}
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Shares</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TransactionRowSkeleton key={i} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  }

  // Show empty state
  if (!transactions || transactions.length === 0) {
    return (
      <Card className={className}>
        {showHeader && (
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>No transactions found</CardDescription>
          </CardHeader>
        )}
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">
            No transactions have been recorded for this portfolio yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className="pb-2">
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            Showing {transactions.length} transaction
            {transactions.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
      )}
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Shares</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  {format(
                    new Date(transaction.transaction_date),
                    "MMM d, yyyy"
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {transaction.transaction_type === "BUY" ? (
                      <ArrowDownRight className="h-4 w-4 text-green-600" />
                    ) : (
                      <ArrowUpRight className="h-4 w-4 text-red-600" />
                    )}
                    <span className="capitalize font-medium">
                      {transaction.transaction_type.toLowerCase()}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{transaction.ticker}</div>
                </TableCell>
                <TableCell className="text-right">
                  {transaction.quantity}
                </TableCell>
                <TableCell className="text-right">
                  ${transaction.price_per_share.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-medium">
                  $
                  {(transaction.quantity * transaction.price_per_share).toFixed(
                    2
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
