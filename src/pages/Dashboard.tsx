import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="overview" className="space-y-8">
      <TabsContent value="overview">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-6">
              <Avatar className="h-16 w-16">
                {userProfile?.avatar_url ? (
                  <AvatarImage
                    src={userProfile.avatar_url}
                    alt={userProfile.full_name || userProfile.email || "User"}
                  />
                ) : null}
                <AvatarFallback>
                  {userProfile?.full_name
                    ? userProfile.full_name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    : userProfile?.email?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-bold text-2xl">
                  {userProfile?.full_name || userProfile?.email || "User"}
                </span>
                {userProfile?.email && userProfile?.full_name && (
                  <span className="text-muted-foreground ">
                    {/* {userProfile.email} */}Welcome back!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Value
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  $
                  {totalPortfolioValue.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across {portfolios?.length || 0} portfolios
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Holdings</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalHoldings}</div>
                <p className="text-xs text-muted-foreground">
                  Active investments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Today's Change
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">
                  +$2,350.00
                </div>
                <p className="text-xs text-success flex items-center">
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                  +2.4% from yesterday
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Performance
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-success">+12.3%</div>
                <p className="text-xs text-muted-foreground">30-day return</p>
              </CardContent>
            </Card>
          </div>

          {/* Portfolio Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Portfolios */}
            <Card>
              <CardHeader>
                <CardTitle>My Portfolios</CardTitle>
                <CardDescription>
                  Manage and track your investment portfolios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {portfolios?.map((portfolio) => (
                  <div
                    key={portfolio.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{portfolio.name}</p>
                        {portfolio.is_default && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {portfolio.total_holdings} holdings
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        $
                        {portfolio.total_invested.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-sm text-success">+5.2%</p>
                    </div>
                  </div>
                ))}
                {portfolios?.length === 0 && (
                  <div className="text-center py-8">
                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No portfolios yet
                    </p>
                    <Button variant="outline">
                      Create Your First Portfolio
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>
                  Your latest investment activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentTransactions?.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{transaction.ticker}</p>
                        <Badge
                          variant={
                            transaction.transaction_type === "BUY"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {transaction.transaction_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {transaction.quantity} shares @ $
                        {transaction.price_per_share}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        $
                        {(
                          transaction.quantity * transaction.price_per_share
                        ).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(
                          transaction.transaction_date
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {recentTransactions?.length === 0 && (
                  <div className="text-center py-8">
                    <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No transactions yet
                    </p>
                    <Button variant="outline">
                      Add Your First Transaction
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          {user && needsOnboarding && !loading && (
            <UserOnboardingWizard
              open={onboardingOpen}
              onComplete={() => setOnboardingOpen(false)}
              userId={user.id}
              email={user.email}
            />
          )}
        </div>
      </TabsContent>
      <TabsContent value="search">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Search</CardTitle>
            <CardDescription>
              Search for instruments, portfolios, and more.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CommandDialog open={true} onOpenChange={() => {}}>
              <CommandInput placeholder="Type to search..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Instruments">
                  {/* Instrument search results go here */}
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Portfolios">
                  {/* Portfolio search results go here */}
                </CommandGroup>
              </CommandList>
            </CommandDialog>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default Dashboard;
