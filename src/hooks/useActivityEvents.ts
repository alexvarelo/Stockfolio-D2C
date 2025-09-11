import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type EventType = "post" | "portfolio" | "transaction" | "watchlist";

export interface ActivityEvent {
  id: string;
  title: string;
  type: EventType;
  date: Date;
  description?: string;
  link?: string;
}

// Simplified type for posts
interface Post {
  id: string;
  created_at: string;
  content: string;
}

// Simplified type for portfolios
interface Portfolio {
  id: string;
  created_at: string;
  name: string;
}

// Simplified type for transactions
interface Transaction {
  id: string;
  created_at: string;
  quantity: number;
  transaction_type: "BUY" | "SELL";
  portfolio_id?: string;
  price_per_share?: number;
  ticker?: string;
}

// Simplified type for watchlist items
interface WatchlistItem {
  id: string;
  created_at: string;
  ticker?: string;
}

export const useActivityEvents = (userId?: string) => {
  return useQuery({
    queryKey: ["activity-events", userId] as const,
    queryFn: async ({ queryKey }): Promise<ActivityEvent[]> => {
      const [, userId] = queryKey;
      if (!userId) return [];

      try {
        // Fetch posts
        const { data: posts = [], error: postsError } = await supabase
          .from("posts")
          .select("id, created_at, content")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (postsError) throw postsError;

        // Fetch portfolios
        const { data: portfolios = [], error: portfoliosError } = await supabase
          .from("portfolios")
          .select("id, created_at, name")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (portfoliosError) throw portfoliosError;

        const { data: transactions = [], error: transactionsError } =
          await supabase
            .from("transactions")
            .select(
              `
          id, 
          created_at, 
          quantity, 
          transaction_type, 
          portfolio_id, 
          price_per_share, 
          ticker,
          portfolio:portfolios!inner(user_id)
        `
            )
            .eq("portfolio.user_id", userId)
            .order("created_at", { ascending: false });
        if (transactionsError) throw transactionsError;

        // No need to fetch securities separately since we have ticker directly

        // Transform posts to ActivityEvent format
        const postEvents: ActivityEvent[] = posts.map((post) => ({
          id: `post-${post.id}`,
          title: "Created a new post",
          type: "post" as const,
          date: new Date(post.created_at),
          description:
            post.content.substring(0, 100) +
            (post.content.length > 100 ? "..." : ""),
          link: `/posts/${post.id}`,
        }));

        // Transform portfolios to ActivityEvent format
        const portfolioEvents: ActivityEvent[] = portfolios.map(
          (portfolio) => ({
            id: `portfolio-${portfolio.id}`,
            title: `Created portfolio: ${portfolio.name}`,
            type: "portfolio" as const,
            date: new Date(portfolio.created_at),
            link: `/portfolio/${portfolio.id}`,
          })
        );

        // Transform transactions to ActivityEvent format
        const transactionEvents: ActivityEvent[] = transactions.map((tx) => ({
          id: `tx-${tx.id}`,
          title: `${tx.transaction_type === "BUY" ? "Bought" : "Sold"} ${
            tx.quantity
          } ${tx.ticker || "stock"}`,
          type: "transaction" as const,
          date: new Date(tx.created_at),
          description: tx.price_per_share
            ? `Price: $${tx.price_per_share.toFixed(2)}`
            : undefined,
          link: tx.portfolio_id ? `/portfolio/${tx.portfolio_id}` : undefined,
        }));
        

        // Combine all events and sort by date (newest first)
        const allEvents = [
          ...postEvents,
          ...portfolioEvents,
          ...transactionEvents,
        ].sort((a, b) => b.date.getTime() - a.date.getTime());

        return allEvents;
      } catch (error) {
        console.error("Error fetching activity events:", error);
        return [];
      }
    },
    enabled: !!userId,
  });
};
