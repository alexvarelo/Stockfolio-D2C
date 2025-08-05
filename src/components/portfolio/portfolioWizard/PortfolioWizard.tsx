import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StepPortfolioDetails } from "./StepPortfolioDetails";
import { StepHoldings } from "./StepHoldings";
import { Holding, portfolioSchema } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export type WizardStep = 0 | 1;

export function PortfolioWizard({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [step, setStep] = useState<WizardStep>(0);
  const [portfolioDetails, setPortfolioDetails] = useState<any>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const goToStep = (s: WizardStep) => setStep(s);

  const handleAddHolding = (holding: Holding) => {
    setHoldings((prev) => [...prev, holding]);
  };

  const handleRemoveHolding = (index: number) => {
    setHoldings((prev) => prev.filter((_, i) => i !== index));
  };

  console.log("holdings", holdings);

  // Submit wizard (create portfolio & holdings)
  const handleSubmit = async () => {
    if (!user || !portfolioDetails) return;
    setIsSubmitting(true);
    let portfolio = null;
    try {
      // Create portfolio
      const { data, error: portfolioError } = await supabase
        .from("portfolios")
        .insert({
          user_id: user.id,
          name: portfolioDetails.name,
          description: portfolioDetails.description,
          is_public: portfolioDetails.is_public,
        })
        .select()
        .single();
      if (portfolioError) throw portfolioError;
      portfolio = data;

      // Create holdings if any
      if (holdings.length > 0) {
        const { error: holdingsError } = await supabase.from("holdings").insert(
          holdings.map((h) => ({
            portfolio_id: portfolio.id,
            ticker: h.ticker,
            quantity: h.quantity,
            average_price: h.average_price,
            notes: h.notes,
          }))
        );
        if (holdingsError) {
          // Rollback: delete the portfolio
          await supabase.from("portfolios").delete().eq("id", portfolio.id);
          throw holdingsError;
        }
      }
      toast({
        title: "Portfolio Created",
        description: "Your portfolio has been created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["portfolios-detailed"] });
      onOpenChange(false);
      resetWizard();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create portfolio",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetWizard = () => {
    setStep(0);
    setPortfolioDetails(null);
    setHoldings([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Create New Portfolio" : "Add Holdings"}
          </DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Set up your portfolio details"
              : "Import your current holdings to this portfolio"}
          </DialogDescription>
        </DialogHeader>
        {step === 0 && (
          <StepPortfolioDetails
            initialValues={portfolioDetails}
            onNext={(values: any) => {
              setPortfolioDetails(values);
              goToStep(1);
            }}
          />
        )}
        {step === 1 && (
          <StepHoldings
            holdings={holdings}
            onAddHolding={handleAddHolding}
            onRemoveHolding={handleRemoveHolding}
            onBack={() => goToStep(0)}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
