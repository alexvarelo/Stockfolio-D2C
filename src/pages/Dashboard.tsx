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
  Clock,
} from "lucide-react";
import { useNeedsOnboarding } from "@/lib/onboarding";
import { UserOnboardingWizard } from "@/components/onboarding/UserOnboardingWizard";
import { DashboardPosts } from "@/components/dashboard/DashboardPosts";
import { CreatePost } from "@/components/social/CreatePost";
import { useQueryClient } from "@tanstack/react-query";
import { RecentActivity } from "@/components/portfolio/RecentActivity";
import { TopInvestments } from "@/components/portfolio/TopInvestments";
import { useNavigate } from "react-router-dom";
import { DashboardSkeleton, PortfolioOverviewSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { HoldingsDonutChart } from "@/components/charts/HoldingsDonutChart";

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

  const { needsOnboarding, loading: onboardingLoading } = useNeedsOnboarding(user?.id);
  const [onboardingOpen, setOnboardingOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("feed");
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
    // Show loading state while checking onboarding status or loading portfolios
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen p-6"
      >
        {activeTab === 'feed' ? <DashboardSkeleton /> : <PortfolioOverviewSkeleton />}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen md:p-6"
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
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
                  <DashboardPosts />
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
                  <TopInvestments />
                </motion.div>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="overview" className="space-y-8">
            {isLoading ? (
              <PortfolioOverviewSkeleton />
            ) : (
              <>
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

                {/* Stats Grid */}
                <motion.div
                  className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {/* Total Value */}
                  <motion.div variants={item}>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total Value
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          ${totalPortfolioValue?.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Across all portfolios
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Total Holdings */}
                  <motion.div variants={item}>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Total Holdings
                        </CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{totalHoldings}</div>
                        <p className="text-xs text-muted-foreground">
                          Unique assets
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Performance */}
                  <motion.div variants={item}>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Performance
                        </CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold flex items-center">
                          <TrendingUp className="h-5 w-5 text-green-500 mr-1" />
                          +12.5%
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Last 30 days
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Recent Activity */}
                  <motion.div variants={item}>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                          Recent Activity
                        </CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">
                          Updates today
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>

                {/* Portfolio List */}
                <motion.div
                  className="space-y-4"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold">Your Portfolios</h2>
                      <p className="text-sm text-muted-foreground">
                        Manage your investment portfolios
                      </p>
                    </div>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      New Portfolio
                    </Button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {portfolios && portfolios.map((portfolio) => (
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
                            <Plus className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <h3 className="font-medium">Create New Portfolio</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Start a new investment portfolio
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Holdings Donut Chart */}
                <motion.div
                  variants={item}
                  initial="hidden"
                  animate="show"
                >
                  <HoldingsDonutChart />
                </motion.div>
              </>
            )}
          </TabsContent>
        </AnimatePresence>
      </Tabs>
      <UserOnboardingWizard />
    </motion.div>
  );
};

export default Dashboard;
