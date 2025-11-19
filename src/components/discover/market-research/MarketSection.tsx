import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal } from "lucide-react";
import { StockCard } from "./StockCard";
import { SearchResult } from "@/api/financialDataApi.schemas";
import { cn } from "@/lib/utils";

interface MarketSectionProps {
    title: string;
    stocks: SearchResult[];
    isLoading: boolean;
    featured?: boolean;
}

export function MarketSection({ title, stocks, isLoading, featured = false }: MarketSectionProps) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <div className={cn("grid gap-4", featured ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full rounded-3xl" />)}
                </div>
            </div>
        );
    }

    if (!stocks.length) return null;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold tracking-tight">{title}</h2>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    See All <MoreHorizontal className="ml-1 h-4 w-4" />
                </Button>
            </div>

            {featured ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stocks.slice(0, 3).map(stock => (
                        <StockCard key={stock.symbol} stock={stock} type="featured" />
                    ))}
                </div>
            ) : (
                <div className="bg-card border rounded-3xl p-2">
                    {stocks.slice(0, 5).map(stock => (
                        <StockCard key={stock.symbol} stock={stock} type="normal" />
                    ))}
                </div>
            )}
        </div>
    );
}
