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
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu";
import { useLocation } from "react-router-dom";
import { SearchButtonWithDialog } from "@/components/search/SearchButtonWithDialog";
import { Sun, Moon, UserCircle, User2Icon, UserCogIcon, UserIcon } from "lucide-react";
import { useState } from "react";

function MainLayout({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>("light");
  const location = useLocation();

  // Define nav links
  const navLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/portfolios", label: "My Portfolios" },
    { href: "/transactions", label: "Transactions" },/* 
    { href: "/watchlist", label: "Watchlist" },
    { href: "/discover", label: "Discover" }, */
    { href: "/following", label: "Following" },
    /* { href: "/notifications", label: "Notifications" }, */
  ];

  return (
    <div className="min-h-screen flex flex-col w-full">
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
        <div className="flex h-14 items-center px-4 gap-2">
          {/* Logo */}
          <a href="/" className="flex items-center mr-4">
            <img src="shark.png" alt="Logo" className="h-7 w-7" />
          </a>
          {/* Navigation */}
          <nav className="hidden md:flex">
            <NavigationMenu>
              <NavigationMenuList className="gap-1">
                {navLinks.map(link => (
                  <NavigationMenuItem key={link.href}>
                    <NavigationMenuLink
                      href={link.href}
                      className={
                        [
                          "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
                          (location.pathname === link.href || (link.href !== "/" && location.pathname.startsWith(link.href)))
                            ? "font-bold"
                            : "font-semibold"
                        ].join(" ")
                      }
                    >
                      {link.label}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </nav>
          {/* Right-aligned Search and Profile */}
          <div className="flex items-center gap-2 ml-auto">
            <div className="hidden md:block w-full max-w-md">
              <SearchButtonWithDialog />
            </div>
            <button
              className="rounded-full p-2 hover:bg-accent"
              aria-label="Profile"
            >
              <UserIcon className="h-6 w-6" />
            </button>
            <button
              className="rounded p-2 hover:bg-accent"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {/* Mobile: Search bar below top bar */}
        <div className="block md:hidden px-4 py-2">
          <SearchButtonWithDialog />
        </div>
      </header>
      <main className="flex-1 p-12">
        {children}
      </main>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/portfolios" element={
              <ProtectedRoute>
                <MainLayout>
                  <Portfolios />
                </MainLayout>
              </ProtectedRoute>
            } />
            {/* Placeholder routes for future features */}
            <Route path="/transactions" element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-4">Transactions</h2>
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/watchlist" element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-4">Watchlist</h2>
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/discover" element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-4">Discover</h2>
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/following" element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-4">Following</h2>
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-4">Notifications</h2>
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <MainLayout>
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold mb-4">Settings</h2>
                    <p className="text-muted-foreground">Coming soon...</p>
                  </div>
                </MainLayout>
              </ProtectedRoute>
            } />
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
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
