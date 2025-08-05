import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Briefcase, TrendingUp, Eye, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { FormProvider, useForm } from "react-hook-form";
import { PortfolioWizard } from "@/components/portfolio/portfolioWizard/PortfolioWizard";

const Portfolios = () => {
  const { user } = useAuth();
  const [showCreateWizard, setShowCreateWizard] = useState(false);

  const methods = useForm();

  const { data: portfolios, isLoading } = useQuery({
    queryKey: ["portfolios-detailed"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolios")
        .select(
          `
          id,
          name,
          description,
          is_public,
          is_default,
          created_at,
          holdings (
            ticker,
            quantity,
            total_invested
          )
        `
        )
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Portfolios</h1>
          <p className="text-muted-foreground">
            Manage and track your investment portfolios
          </p>
        </div>
        <Button
          variant="gradient"
          size="lg"
          onClick={() => setShowCreateWizard(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Portfolio
        </Button>
      </div>

      {/* Portfolios Grid */}
      {portfolios && portfolios.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {portfolios.map((portfolio) => {
            const totalValue =
              portfolio.holdings?.reduce(
                (sum, h) => sum + (h.total_invested || 0),
                0
              ) || 0;
            const totalHoldings = portfolio.holdings?.length || 0;

            return (
              <Card
                key={portfolio.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">
                        {portfolio.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {portfolio.is_default && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                        <Badge
                          variant={portfolio.is_public ? "default" : "outline"}
                        >
                          {portfolio.is_public ? (
                            <>
                              <Eye className="mr-1 h-3 w-3" />
                              Public
                            </>
                          ) : (
                            <>
                              <Lock className="mr-1 h-3 w-3" />
                              Private
                            </>
                          )}
                        </Badge>
                      </div>
                    </div>
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                  </div>
                  {portfolio.description && (
                    <CardDescription className="text-sm">
                      {portfolio.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Total Value
                      </span>
                      <span className="font-semibold">
                        $
                        {totalValue.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Holdings
                      </span>
                      <span className="font-medium">{totalHoldings}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        Performance
                      </span>
                      <span className="font-medium text-success flex items-center">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        +5.2%
                      </span>
                    </div>
                  </div>

                  {totalHoldings > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Top Holdings</p>
                      <div className="space-y-1">
                        {portfolio.holdings
                          ?.slice(0, 3)
                          .map((holding, index) => (
                            <div
                              key={index}
                              className="flex justify-between text-sm"
                            >
                              <span className="text-muted-foreground">
                                {holding.ticker}
                              </span>
                              <span>{holding.quantity} shares</span>
                            </div>
                          ))}
                        {portfolio.holdings &&
                          portfolio.holdings.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              +{portfolio.holdings.length - 3} more
                            </p>
                          )}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Created{" "}
                      {new Date(portfolio.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Briefcase className="mx-auto h-16 w-16 text-muted-foreground mb-6" />
          <h3 className="text-lg font-semibold mb-2">No portfolios yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Start building your investment tracking by creating your first
            portfolio.
          </p>
          <Button
            variant="gradient"
            size="lg"
            onClick={() => setShowCreateWizard(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Portfolio
          </Button>
        </Card>
      )}

      <FormProvider {...methods}>
        <PortfolioWizard
          open={showCreateWizard}
          onOpenChange={setShowCreateWizard}
        />
      </FormProvider>
    </div>
  );
};

export default Portfolios;
