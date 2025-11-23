import { useParams, useNavigate } from "react-router-dom";
import { usePortfolio, useDeletePortfolio } from "@/api/portfolio/portfolio";
import { usePortfolioTransactions } from "@/api/transaction/usePortfolioTransactions";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/lib/auth";
import { PortfolioHoldings } from "@/components/portfolio/PortfolioHoldings";
import { PortfolioStats } from "@/components/portfolio/PortfolioStats";
import { TransactionsCard } from "@/components/transactions/TransactionsCard";
import { PortfolioEditDialog } from "@/components/portfolio/edit/PortfolioEditDialog";
import { DeleteConfirmationDialog } from "@/components/portfolio/delete/DeleteConfirmationDialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// Import from portfolioDetails folder
import { EvolutionChart } from "@/components/portfolio/portfolioDetails/EvolutionChart";
import { PortfolioActions } from "@/components/portfolio/portfolioDetails/PortfolioActions";
import { AISummaryDrawer } from "@/components/portfolio/portfolioDetails/AISummaryDrawer";
import { PortfolioHeaderSection } from "@/components/portfolio/PortfolioHeaderSection";
import {
  PortfolioLayout,
  PortfolioGrid,
  PortfolioMainContent,
  PortfolioSidebar,
  PortfolioSection,
  PortfolioLoadingSkeleton
} from "@/components/portfolio/portfolioDetails/PortfolioLayout";

// Add custom animation keyframes for the spinning gradient
const style = document.createElement('style');
style.textContent = `
  @keyframes spin-slow {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  .animate-spin-slow {
    animation: spin-slow 3s linear infinite;
  }
`;
document.head.appendChild(style);

export const PortfolioDetail = () => {
  const { portfolioId } = useParams<{ portfolioId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [aiSummaryOpen, setAISummaryOpen] = useState(false);

  // Load portfolio data
  const {
    data: portfolio,
    isLoading: isLoadingPortfolio,
    isLoadingPrices, // New loading state for prices
    error
  } = usePortfolio(portfolioId);
  const { mutateAsync: deletePortfolio } = useDeletePortfolio();

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

  if (isLoadingPortfolio && !portfolio) {
    return <PortfolioLoadingSkeleton />;
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

  return (
    <PortfolioLayout>
      {/* Header Section */}
      <PortfolioHeaderSection
        onBack={() => navigate(-1)}
        name={portfolio.name}
        description={portfolio.description || ''}
        isPublic={portfolio.is_public || false}
        followersCount={portfolio.followers_count || 0}
        createdAt={portfolio.created_at}
        actions={
          <PortfolioActions
            portfolioId={portfolioId}
            isOwner={isOwner}
            isPublic={portfolio.is_public || false}
            followersCount={portfolio.followers_count || 0}
            onEdit={() => setIsEditDialogOpen(true)}
            onDelete={() => setIsDeleteDialogOpen(true)}
            onAISummary={() => setAISummaryOpen(true)}
            holdings={portfolio.holdings || []}
          />
        }
      />

      {/* AI Summary Drawer */}
      <AISummaryDrawer
        isOpen={aiSummaryOpen}
        onOpenChange={setAISummaryOpen}
        portfolioId={portfolioId}
      />

      <PortfolioSection>
        <PortfolioGrid>
          <PortfolioMainContent>
            <EvolutionChart
              holdings={portfolio.holdings || []}
              isLoading={isLoadingPrices} // Pass loading state to chart
            />
          </PortfolioMainContent>

          <PortfolioSidebar>
            <PortfolioStats
              totalValue={totalValue}
              totalInvested={totalInvested}
              totalReturn={totalReturn}
              returnPercentage={returnPercentage}
              holdingsCount={holdingsCount}
              className="w-full"
              isLoading={isLoadingPrices} // Pass loading state to stats
            />
          </PortfolioSidebar>
        </PortfolioGrid>

        {/* Holdings and Transactions section */}
        <PortfolioSection>
          <PortfolioHoldings
            holdings={portfolio.holdings || []}
            isLoading={isLoadingPortfolio} // Initial loading
            isLoadingPrices={isLoadingPrices} // Price loading
          />

          <TransactionsCard
            transactions={transactions || []}
            isLoading={isLoadingTransactions}
          />
        </PortfolioSection>
      </PortfolioSection>

      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title="Delete Portfolio"
        description="Are you sure you want to delete this portfolio? This action cannot be undone."
        confirmText="Delete Portfolio"
      />

      <PortfolioEditDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        portfolio={portfolio}
      />
    </PortfolioLayout>
  );
};

// Re-export the PortfolioDetail component as default
export default PortfolioDetail;
