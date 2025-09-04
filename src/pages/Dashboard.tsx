import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandSeparator,
} from "@/components/ui/command";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { SearchButtonWithDialog } from "@/components/search/SearchButtonWithDialog";
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
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Briefcase,
  BarChart3,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useNeedsOnboarding } from "@/lib/onboarding";
import { UserOnboardingWizard } from "@/components/onboarding/UserOnboardingWizard";
import { PostList } from "@/components/social/PostList";
import { CreatePost } from "@/components/social/CreatePost";
import { useQueryClient } from "@tanstack/react-query";
import { RecentActivity } from "@/components/portfolio/RecentActivity";
import { TopInvestments } from "@/components/portfolio/TopInvestments";
import { useNavigate } from "react-router-dom";

interface PortfolioSummary {
  id: string;
  name: string;
  total_invested: number;
  total_holdings: number;
  is_default: boolean;
}

const Dashboard = () => {
  const [commandOpen, setCommandOpen] = useState(false);
  const { userProfile } = useAuth();

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  const { user } = useAuth();

  const { needsOnboarding, loading } = useNeedsOnboarding(user?.id);
  const [onboardingOpen, setOnboardingOpen] = useState(true);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: portfolios, isLoading } = useQuery({
    queryKey: ["portfolios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolios")
        .select(
          `
          id,
          name,
          is_default,
          holdings (
            total_invested
          )
        `
        )
        .eq("user_id", user?.id);

      if (error) throw error;

      return (
        data?.map((portfolio) => ({
          id: portfolio.id,
          name: portfolio.name,
          is_default: portfolio.is_default,
          total_invested:
            portfolio.holdings?.reduce(
              (sum, h) => sum + (h.total_invested || 0),
              0
            ) || 0,
          total_holdings: portfolio.holdings?.length || 0,
        })) || []
      );
    },
    enabled: !!user,
  });

  const { data: recentTransactions } = useQuery({
    queryKey: ["recent-transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select(
          `
          id,
          ticker,
          transaction_type,
          quantity,
          price_per_share,
          transaction_date,
          portfolios (name)
        `
        )
        .in("portfolio_id", portfolios?.map((p) => p.id) || [])
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!portfolios?.length,
  });

  const totalPortfolioValue =
    portfolios?.reduce((sum, p) => sum + p.total_invested, 0) || 0;
  const totalHoldings =
    portfolios?.reduce((sum, p) => sum + p.total_holdings, 0) || 0;

  // Animation variants
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
      },
    },
  };

  const cardHover = {
    scale: 1.02,
    transition: { type: "spring" as const, stiffness: 400, damping: 10 }
  };

  const cardTap = {
    scale: 0.98
  } as const;

  if (isLoading) {
    return (
      <motion.div 
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="animate-pulse"
          variants={item}
        >
          <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </motion.div>
        <motion.div 
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-7"
          variants={container}
        >
          <RecentActivity className="col-span-3" />
        </motion.div>
        <motion.div 
          className="grid gap-4 md:grid-cols-2 lg:grid-cols-7"
          variants={container}
        >
          <TopInvestments className="col-span-4" />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Tabs defaultValue="feed" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-8">
          <TabsTrigger value="feed">Social Feed</TabsTrigger>
          <TabsTrigger value="overview">Portfolio Overview</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="feed" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Feed */}
              <motion.div 
                className="lg:col-span-2 space-y-6"
                variants={container}
                initial="hidden"
                animate="show"
              >
                <motion.div variants={item}>
                  <CreatePost 
                    onPostCreated={() => {
                      queryClient.invalidateQueries({ queryKey: ['posts'] });
                    }} 
                  />
                </motion.div>
                <motion.div variants={item}>
                  <PostList />
                </motion.div>
              </motion.div>

              {/* Sidebar */}
              <motion.div 
                className="space-y-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {/* Portfolio Summary Card */}
                <motion.div
                  whileHover={cardHover}
                  whileTap={cardTap}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Portfolio Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Value</p>
                        <p className="text-2xl font-semibold">
                          ${totalPortfolioValue?.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Holdings</p>
                        <p className="text-2xl font-semibold">{totalHoldings}</p>
                      </div>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => navigate("/portfolios")}
                      >
                        View All Portfolios
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
                <motion.div
                  whileHover={cardHover}
                  whileTap={cardTap}
                >
                  <TopInvestments className="col-span-4" />
                </motion.div>
              </motion.div>
            </div>
          </TabsContent>

          {/* Portfolio Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Header */}
            <motion.div
              className="flex justify-between items-start"
              variants={item}
              initial="hidden"
              animate="show"
            >
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Portfolio Overview</h1>
                <p className="text-muted-foreground">
                  Track and manage your investments
                </p>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </motion.div>

            {/* Portfolio Cards */}
            <motion.div
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {portfolios?.map((portfolio) => (
                <motion.div key={portfolio.id} variants={item}>
                  <Card className="h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        {portfolio.name}
                        {portfolio.is_default && (
                          <Badge className="ml-2" variant="secondary">
                            Default
                          </Badge>
                        )}
                      </CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        ${portfolio.total_invested?.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Total Invested
                      </p>
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Holdings</span>
                          <span className="font-medium">
                            {portfolio.total_holdings}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {/* Add Portfolio Card */}
              <motion.div variants={item}>
                <Card className="h-full border-dashed hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="flex flex-col items-center justify-center h-full p-6 text-center">
                    <div className="rounded-full bg-muted p-3 mb-4">
                      <Plus className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">Add Portfolio</h3>
                    <p className="text-sm text-muted-foreground">
                      Create a new portfolio to organize your investments
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div variants={item}>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your latest transactions across all portfolios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentActivity />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>
    </motion.div>
  );
};

export default Dashboard;
