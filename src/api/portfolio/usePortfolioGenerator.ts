import { useMutation } from "@tanstack/react-query";

export interface GeneratedPortfolioResponse {
    success: boolean;
    portfolio_id: string;
    message: string;
    missing_info?: string[];
}

interface GeneratePortfolioParams {
    prompt: string;
}

export function usePortfolioGenerator() {
    return useMutation<GeneratedPortfolioResponse, Error, GeneratePortfolioParams>({
        mutationFn: async ({ prompt }) => {
            // Dynamically import supabase client to match usePortfolioAISummary pattern
            const { supabase } = await import("@/integrations/supabase/client");

            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session?.access_token) {
                throw new Error("Not authenticated");
            }

            const res = await fetch(
                "https://tonbljcxqunrriecgpup.supabase.co/functions/v1/portfolio-generator-assistant",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${session.access_token} `,
                    },
                    body: JSON.stringify({ prompt }),
                }
            );

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to generate portfolio");
            }

            return res.json();
        },
    });
}
