import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from '@tanstack/react-query';
import { usePortfolio, useDeletePortfolio, Portfolio } from "@/api/portfolio/portfolio";
import { usePortfolioPerformance } from "@/api/portfolio/usePortfolioPerformance";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Trash2,
  Edit,
  Share2,
  Users,
  BarChart2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { PortfolioHeader } from "@/components/portfolio/PortfolioHeader";
import { PortfolioHoldings } from "@/components/portfolio/PortfolioHoldings";
import { PortfolioStats } from "@/components/portfolio/PortfolioStats";
import { PortfolioPerformanceChart } from "@/components/portfolio/PortfolioPerformanceChart";
import { PortfolioEditDialog } from "@/components/portfolio/edit/PortfolioEditDialog";
import { TransactionDrawer } from "@/components/transactions";
import { useState } from "react";

export const PortfolioDetail = () => {
  const { portfolioId } = useParams<{ portfolioId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: portfolio, isLoading, error } = usePortfolio(portfolioId || "");
  const { mutateAsync: deletePortfolio } = useDeletePortfolio();
  const { data: performanceData } = usePortfolioPerformance(portfolio?.holdings);

  const handleDelete = async () => {
    if (!portfolioId) return;

    if (
      window.confirm(
        "Are you sure you want to delete this portfolio? This action cannot be undone."
      )
    ) {
      try {
        await deletePortfolio(portfolioId);
        toast({
          title: "Portfolio deleted",
          description: "Your portfolio has been successfully deleted.",
        });
        navigate("/portfolios");
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete portfolio. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handlePortfolioSaved = () => {
    // Invalidate queries to refresh the data
    queryClient.invalidateQueries({ queryKey: ['portfolio', portfolioId] });
    queryClient.invalidateQueries({ queryKey: ['portfolios'] });
  };

  if (isLoading || !portfolio) {
    return <PortfolioDetailSkeleton />;
  }

  if (error || !portfolio) {
    return (
      <div className="container mx-auto p-6">
        <Button variant="outline" onClick={() => navigate(-1)} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Portfolios
        </Button>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Portfolio not found</h2>
          <p className="text-muted-foreground mb-6">
            The portfolio you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Button onClick={() => navigate("/portfolios")}>
            View My Portfolios
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === portfolio.user_id;
  const totalValue = portfolio.holdings.reduce(
    (sum, holding) => sum + (holding.current_price || 0) * holding.quantity,
    0
  );
  const totalInvested = portfolio.holdings.reduce(
    (sum, holding) => sum + holding.total_invested,
    0
  );
  const totalReturn = totalValue - totalInvested;
  const returnPercentage = (totalReturn / totalInvested) * 100;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="space-x-2 flex items-center">
          <TransactionDrawer 
            portfolioId={portfolioId || ""} 
            onTransactionAdded={() => {
              queryClient.invalidateQueries({ queryKey: ['portfolio', portfolioId] });
            }} 
          />
          
          {isOwner && (
            <>
              <PortfolioEditDialog
                portfolio={portfolio}
                isOpen={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                onSaved={handlePortfolioSaved}
              />
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <PortfolioHeader
        name={portfolio.name}
        description={portfolio.description}
        isPublic={portfolio.is_public}
        followersCount={portfolio.followers_count || 0}
        createdAt={portfolio.created_at}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance</CardTitle>
              <CardDescription>Portfolio value over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {performanceData ? (
                  <PortfolioPerformanceChart 
                    dates={performanceData.dates} 
                    values={performanceData.values} 
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">Loading performance data...</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <PortfolioHoldings holdings={portfolio.holdings} />
        </div>

        <div className="space-y-6">
          <PortfolioStats
            totalValue={totalValue}
            totalInvested={totalInvested}
            totalReturn={totalReturn}
            returnPercentage={returnPercentage}
            holdingsCount={portfolio.holdings.length}
          />

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Share2 className="mr-2 h-4 w-4" />
                Share Portfolio
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart2 className="mr-2 h-4 w-4" />
                View Advanced Analytics
              </Button>
              {portfolio.is_public && (
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  {portfolio.followers_count || 0} Followers
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const PortfolioDetailSkeleton = () => (
  <div className="container mx-auto p-6 space-y-6">
    <Skeleton className="h-10 w-24" />

    <div className="space-y-4">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-3/4" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b"
              >
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

export default PortfolioDetail;
