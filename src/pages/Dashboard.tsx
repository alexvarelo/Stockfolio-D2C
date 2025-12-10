import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import { useAuth } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent, CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp, DollarSign,
  Briefcase,
  BarChart3,
  Plus, Clock,
  Sparkles
} from "lucide-react";
import { useNeedsOnboarding } from "@/lib/onboarding";
import { UserOnboardingWizard } from "@/components/onboarding/UserOnboardingWizard";
import { DashboardPosts } from "@/components/dashboard/DashboardPosts";
import { CreatePost } from "@/components/social/CreatePost";
import { useQueryClient } from "@tanstack/react-query";
import { ArticlesSection } from "@/components/articles/ArticlesSection";
import { useNavigate } from "react-router-dom";
import {
  DashboardSkeleton,
} from "@/components/dashboard/DashboardSkeleton";
import { HoldingsDonutChart } from "@/components/charts/HoldingsDonutChart";
import { ActivityCalendar } from "@/components/profile/ActivityCalendar";

const Dashboard = () => {
  const [commandOpen, setCommandOpen] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

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

  const { needsOnboarding } = useNeedsOnboarding(user?.id);

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

  if (isLoading) {
    return (
      <div className="min-h-screen p-6">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen md:p-6 space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Your financial overview and market insights
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative group overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
        >
          <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
          <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-gradient-to-r px-6 py-2 text-sm font-medium text-white backdrop-blur-3xl transition-all hover:opacity-90 gap-2">
            Ask Stocky
            <Sparkles className="h-3 w-3 text-yellow-200" />
          </span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column - Portfolio Overview & Insights (5/12) */}
        <div className="xl:col-span-5 space-y-8">
          {/* Stats Grid */}
          <motion.div
            className="grid grid-cols-2 gap-4"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={item}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${totalPortfolioValue?.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">Across all portfolios</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Holdings</CardTitle>
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalHoldings}</div>
                  <p className="text-xs text-muted-foreground">Unique assets</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Performance</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold flex items-center">
                    <TrendingUp className="h-5 w-5 text-green-500 mr-1" />
                    +12.5%
                  </div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Updates</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">New notifications</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          {/* Articles Section */}
          <motion.div variants={item} initial="hidden" animate="show">
            <ArticlesSection />
          </motion.div>

          {/* Portfolio Allocation */}
          <motion.div variants={item} initial="hidden" animate="show" className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Allocation</h2>
            <div className="h-[24rem] xl:h-[28rem]">
              <HoldingsDonutChart />
            </div>
          </motion.div>

          {/* Activity Calendar */}
          <motion.div variants={item} initial="hidden" animate="show" className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight">Activity</h2>
            <div className="h-[24rem] xl:h-[28rem]">
              <ActivityCalendar userId={user?.id || ""} />
            </div>
          </motion.div>
        </div>

        {/* Right Column - Feed (7/12) */}
        <div className="xl:col-span-7 space-y-6">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            <motion.div variants={item}>
              <CreatePost
                onPostCreated={() => {
                  queryClient.invalidateQueries({ queryKey: ["posts"] });
                }}
              />
            </motion.div>
            <motion.div variants={item}>
              <DashboardPosts />
            </motion.div>
          </motion.div>
        </div>
      </div>

      <UserOnboardingWizard />
    </motion.div>
  );
};

export default Dashboard;
