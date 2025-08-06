import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AuthProvider, useAuth } from "@/lib/auth";
import { AppSidebar } from "@/components/layout/AppSidebar";
import Dashboard from "./pages/Dashboard";
import Portfolios from "./pages/Portfolios";
import { PortfolioDetail } from "./pages/PortfolioDetail";
import { InstrumentPage } from "./pages/InstrumentPage";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

// Main Layout Component
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { useLocation } from "react-router-dom";
import { SearchButtonWithDialog } from "@/components/search/SearchButtonWithDialog";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

function MainLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  // Define nav links
  const navLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/portfolios", label: "My Portfolios" },
    { href: "/transactions", label: "Transactions" },
    { href: "/following", label: "Following" },
  ];

  return (
    <div className="min-h-screen flex flex-col w-full">
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
        <div className="flex h-14 items-center px-4 gap-4">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <img src="shark.png" alt="Logo" className="h-7 w-7" />
            {/* <span className="font-bold text-lg">Stockfolio</span> */}
          </a>
          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  location.pathname === link.href ||
                  (link.href !== "/" && location.pathname.startsWith(link.href))
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent/50"
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <SearchButtonWithDialog />
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile: Search bar below top bar */}
        <div className="block md:hidden px-4 py-2">
          <SearchButtonWithDialog />
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6">{children}</main>
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
            <Toaster />
            <Sonner />
            <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/"
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
                path="/portfolios/:portfolioId"
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
                        <p className="text-muted-foreground">Coming soon...</p>
                      </div>
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/watchlist"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <div className="text-center py-12">
                        <h2 className="text-2xl font-bold mb-4">Watchlist</h2>
                        <p className="text-muted-foreground">Coming soon...</p>
                      </div>
                    </MainLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/discover"
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <div className="text-center py-12">
                        <h2 className="text-2xl font-bold mb-4">Discover</h2>
                        <p className="text-muted-foreground">Coming soon...</p>
                      </div>
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
                        <p className="text-muted-foreground">Coming soon...</p>
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
                        <p className="text-muted-foreground">Coming soon...</p>
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
                        <p className="text-muted-foreground">Coming soon...</p>
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
