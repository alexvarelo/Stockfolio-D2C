import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { usePortfolio, useDeletePortfolio, type PortfolioHolding } from "@/api/portfolio/portfolio";
import { usePortfolioPerformance } from "@/api/portfolio/usePortfolioPerformance";
import { usePortfolioTransactions } from "@/api/transaction/usePortfolioTransactions";
import { usePortfolioFollows } from "@/api/portfolio/usePortfolioFollows";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Trash2,
  Edit,
  Share2,
  Users,
  BarChart2,
  MoreVertical,
  Plus,
  Heart,
  HeartOff,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { PortfolioHeader } from "@/components/portfolio/PortfolioHeader";
import { PortfolioHoldings } from "@/components/portfolio/PortfolioHoldings";
import { PortfolioStats } from "@/components/portfolio/PortfolioStats";
import { PortfolioPerformanceChart } from "@/components/portfolio/PortfolioPerformanceChart";
import { PortfolioEditDialog } from "@/components/portfolio/edit/PortfolioEditDialog";
import { TransactionDrawer } from "@/components/transactions";
import { TransactionsCard } from "@/components/transactions/TransactionsCard";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteConfirmationDialog } from "@/components/portfolio/delete/DeleteConfirmationDialog";

export const PortfolioDetail = () => {
  const { portfolioId } = useParams<{ portfolioId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Initialize portfolio follows hook early to maintain consistent hook order
  const { 
    isFollowing, 
    toggleFollow, 
    followersCount = 0, 
    isLoading: isFollowLoading 
  } = usePortfolioFollows(portfolioId);

  // Validate portfolioId
  if (!portfolioId) {
    navigate('/portfolios');
    return null;
  }

  // Load portfolio data with prices
  const { data: portfolio, isLoading: isLoadingPortfolio, error } = usePortfolio(portfolioId);
  
  const { mutateAsync: deletePortfolio } = useDeletePortfolio();
  
  // Load performance data if we have a portfolio with holdings
  const { data: performanceData, isLoading: isLoadingPerformance } = usePortfolioPerformance(
    (portfolio?.holdings || []) as PortfolioHolding[]
  );
  
  // Load transactions in parallel
  const { data: transactions, isLoading: isLoadingTransactions } = usePortfolioTransactions(portfolioId);
  
  // Calculate derived values
  const holdingsCount = portfolio?.holdings?.length || 0;
  const totalValue = portfolio?.holdings?.reduce(
    (sum, h) => sum + ((h.current_price || 0) * h.quantity),
    0
  ) || 0;
  
  const totalInvested = portfolio?.holdings?.reduce(
    (sum, h) => sum + h.total_invested,
    0
  ) || 0;
  
  const totalReturn = totalValue - totalInvested;
  const returnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;

  const handleDelete = async () => {
    if (!portfolioId) return;
    
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
  };

  const handlePortfolioSaved = () => {
    // Invalidate queries to refresh the data
    queryClient.invalidateQueries({ queryKey: ["portfolio", portfolioId] });
    queryClient.invalidateQueries({ queryKey: ["portfolios"] });
  };

  if (isLoadingPortfolio && !portfolio) {
    return <PortfolioDetailSkeleton />;
  }

  if (error || !portfolio) {
    return (
      <div className="mx-2 sm:mx-1 p-4 sm:p-0">
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

  // Check if user is the owner of the portfolio
  const isOwner = user?.id === portfolio?.user_id;
  const isLoadingPrices = isLoadingPortfolio;

  return (
    <div className="container mx-auto px-1 sm:px-2 md:px-4 py-2 sm:py-4 space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3 sm:mb-4">
        <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Back to Portfolios</span>
          <span className="sm:hidden">Back</span>
        </Button>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {isOwner ? (
            // Owner actions
            <>
              <TransactionDrawer
                portfolioId={portfolioId || ""}
                onTransactionAdded={() => {
                  queryClient.invalidateQueries({
                    queryKey: ["portfolio", portfolioId],
                  });
                  queryClient.invalidateQueries({
                    queryKey: ["portfolioTransactions", portfolioId],
                  });
                }}
                holdings={portfolio?.holdings || []}
              >
                <Button size="sm" className="gap-1 sm:gap-2 flex-1 sm:flex-initial">
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">New Transaction</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </TransactionDrawer>

              <PortfolioEditDialog
                portfolio={portfolio}
                isOpen={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                onSaved={handlePortfolioSaved}
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Share2 className="mr-2 h-4 w-4" />
                    <span>Share</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <BarChart2 className="mr-2 h-4 w-4" />
                    <span>Analytics</span>
                  </DropdownMenuItem>
                  {portfolio.is_public && (
                    <DropdownMenuItem>
                      <Users className="mr-2 h-4 w-4" />
                      <span>{portfolio.followers_count || 0} Followers</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit Portfolio</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Delete Portfolio</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            // Non-owner actions
            <div className="flex items-center gap-2">
              <Button 
                variant={isFollowing ? "outline" : "default"} 
                size="sm" 
                className="gap-1 sm:gap-2"
                onClick={async () => {
                  try {
                    await toggleFollow();
                    toast({
                      title: isFollowing ? "Unfollowed portfolio" : "Following portfolio",
                      description: isFollowing 
                        ? "You've unfollowed this portfolio" 
                        : "You're now following this portfolio",
                    });
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to update follow status. Please try again.",
                      variant: "destructive",
                    });
                  }
                }}
                disabled={isFollowLoading}
              >
                {isFollowing ? (
                  <>
                    <HeartOff className="h-4 w-4" />
                    <span className="hidden sm:inline">Unfollow</span>
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4" />
                    <span className="hidden sm:inline">Follow</span>
                  </>
                )}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Share2 className="mr-2 h-4 w-4" />
                    <span>Share</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <BarChart2 className="mr-2 h-4 w-4" />
                    <span>Analytics</span>
                  </DropdownMenuItem>
                  {portfolio.is_public && (
                    <DropdownMenuItem>
                      <Users className="mr-2 h-4 w-4" />
                      <span>{portfolio.followers_count || 0} Followers</span>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      <div className="px-1 sm:px-0">
        <PortfolioHeader
          name={portfolio?.name || ''}
          description={portfolio?.description || ''}
          isPublic={portfolio?.is_public || false}
          followersCount={followersCount}
          createdAt={portfolio?.created_at || ''}
        />
      </div>

      <div className="space-y-3 sm:space-y-4">
        {/* Main content area - full width on mobile, grid on desktop */}
        <div className="lg:grid lg:grid-cols-4 gap-4">
          {/* Graph - takes 3/4 width on desktop, full width on mobile */}
          <div className="lg:col-span-3">
            {performanceData && (
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle>Performance</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-0">
                  <div className="h-[300px] md:h-[400px] w-full md:px-1 pb-6 pt-4">
                    <PortfolioPerformanceChart 
                      dates={performanceData.dates} 
                      values={performanceData.values} 
                      className="h-full w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Portfolio stats - appears below graph on mobile, to the right on desktop */}
          <div className="mt-4 lg:mt-0">
            <PortfolioStats
              totalValue={totalValue}
              totalInvested={totalInvested}
              totalReturn={totalReturn}
              returnPercentage={returnPercentage}
              holdingsCount={holdingsCount}
              className="w-full"
            />
          </div>
        </div>

        {/* Holdings and Transactions section - full width below the graph and stats */}
        <div className="space-y-3 sm:space-y-4">
          <PortfolioHoldings 
            holdings={portfolio?.holdings || []} 
            isLoading={isLoadingPortfolio}
          />
          
         
              <TransactionsCard 
                transactions={transactions || []} 
                isLoading={isLoadingTransactions}
              />
            
        </div>
      </div>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Portfolio"
        description="Are you sure you want to delete this portfolio? This action cannot be undone."
        confirmText="Delete Portfolio"
      />
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
