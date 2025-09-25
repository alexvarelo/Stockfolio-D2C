import { useQuery } from "@tanstack/react-query";

export interface PortfolioLLMSummaryResponse {
  result: {
    sentiment: string;
    justification: string;
    risks: { title: string; explanation: string }[];
    recommendations: { title: string; action: string }[];
    assumptions: string[];
  };
}

export function usePortfolioAISummary(
  portfolioId?: string,
  enabled: boolean = false
) {
  return useQuery<PortfolioLLMSummaryResponse, Error>({
    queryKey: ["portfolio-ai-summary", portfolioId],
    queryFn: async () => {
      // Dynamically import supabase client to avoid circular deps
      const { supabase } = await import("@/integrations/supabase/client");
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Not authenticated");
      }
      const res = await fetch(
        "https://tonbljcxqunrriecgpup.supabase.co/functions/v1/portfolio-llm-summarizer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ portfolioId }),
        }
      );
      if (!res.ok) throw new Error("Failed to fetch AI summary");
      return res.json();
    },
    enabled: !!portfolioId && enabled,
  });
}
