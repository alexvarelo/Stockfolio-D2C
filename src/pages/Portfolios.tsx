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
import { PortfolioCard } from "@/components/portfolio/PortfolioCard";
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
    <div className="container mx-auto p-6 space-y-6">
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
          {portfolios.map((portfolio) => (
            <PortfolioCard key={portfolio.id} {...portfolio} />
          ))}
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
