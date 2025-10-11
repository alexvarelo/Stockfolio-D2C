import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import PostNotifications from "./components/notifications/PostNotifications";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AuthProvider, useAuth } from "@/lib/auth";
import Dashboard from "./pages/Dashboard";
import Portfolios from "./pages/Portfolios";
import { PortfolioDetail } from "./pages/PortfolioDetail";
import { InstrumentPage } from "./pages/InstrumentPage";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { Navbar } from "@/components/navigation/Navbar";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import Watchlists from "./pages/Watchlists";
import WatchlistDetail from "./pages/WatchlistDetail";
import { UserProfile } from "./pages/UserProfile";
import EditProfilePage from "./pages/EditProfilePage";
import { inject } from "@vercel/analytics"
import { DashboardSkeleton } from "./components/dashboard/DashboardSkeleton";
import DiscoverPage from "./pages/Discover";
import MarketResearchPage from "./pages/MarketResearch";
// CreateEditWatchlist component has been replaced with dialogs

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes before data becomes stale
      gcTime: 30 * 60 * 1000, // 30 minutes before inactive data is garbage collected
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnMount: false, // Don't refetch when component mounts
      refetchOnReconnect: false, // Don't refetch on reconnect
      retry: 1, // Retry failed requests once
    },
  },
});

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

// Main Layout Component
function MainLayout({ children }: { children: React.ReactNode }) {
  inject();
  return (
    <div className="min-h-screen flex flex-col w-full">
      <Navbar />
      <main className="flex-1 px-4 py-6 sm:px-2 md:px-6 md:py-4 max-w-[2000px] mx-auto w-full">
        {children}
      </main>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SidebarProvider>
          <TooltipProvider>
            <PostNotifications />
            <Toaster />
            <Sonner position="top-right" richColors />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Dashboard />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/portfolios"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Portfolios />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/portfolio/:portfolioId"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <PortfolioDetail />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                {/* Placeholder routes for future features */}
                <Route
                  path="/transactions"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <div className="text-center py-12">
                          <h2 className="text-2xl font-bold mb-4">
                            Transactions
                          </h2>
                          <p className="text-muted-foreground">
                            Coming soon...
                          </p>
                        </div>
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/watchlists"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <Watchlists />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user/:userId"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <UserProfile />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/accounts/edit"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <EditProfilePage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/discover"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <DiscoverPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/market-research"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <MarketResearchPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/following"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <div className="text-center py-12">
                          <h2 className="text-2xl font-bold mb-4">Following</h2>
                          <p className="text-muted-foreground">
                            Coming soon...
                          </p>
                        </div>
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <div className="text-center py-12">
                          <h2 className="text-2xl font-bold mb-4">
                            Notifications
                          </h2>
                          <p className="text-muted-foreground">
                            Coming soon...
                          </p>
                        </div>
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <div className="text-center py-12">
                          <h2 className="text-2xl font-bold mb-4">Settings</h2>
                          <p className="text-muted-foreground">
                            Coming soon...
                          </p>
                        </div>
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/instrument/:ticker"
                  element={
                    <ProtectedRoute>
                      <MainLayout>
                        <InstrumentPage />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </SidebarProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
