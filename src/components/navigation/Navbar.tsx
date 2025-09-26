import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { SearchButtonWithDialog } from '@/components/search/SearchButtonWithDialog';
import { NavLinks } from './NavLinks';
import { MobileNav } from './MobileNav';
import { useAuth } from '@/lib/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User, Settings } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile, signOut } = useAuth();
  const queryClient = useQueryClient();
  
  const handleSignOut = async () => {
    await signOut();
    // Clear all cached queries
    await queryClient.clear();
    // Invalidate all queries to ensure fresh data on next login
    await queryClient.invalidateQueries();
    navigate('/auth');
  };

  const navLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/portfolios", label: "Portfolios" },
    { href: "/watchlists", label: "Watchlists" },
    { href: "/discover", label: "Discover" },
  ];

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
      <div className="flex h-14 items-center px-4 gap-4">
        {/* User Profile Picture - Clickable */}
        <div className="flex items-center gap-2">
          {userProfile?.id ? (
            <button 
              onClick={() => navigate(`/user/${userProfile.id}`)}
              className="rounded-full hover:ring-2 hover:ring-ring hover:ring-offset-2 transition-all"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={userProfile.avatar_url} alt={userProfile.full_name || 'User'} />
                <AvatarFallback>
                  {userProfile.full_name 
                    ? userProfile.full_name.charAt(0).toUpperCase() 
                    : userProfile.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </button>
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLinks links={navLinks} currentPath={location.pathname} />
        </nav>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          {/* Search button - visible on all screen sizes */}
          <div className="block">
            <SearchButtonWithDialog />
          </div>
          
          {/* Theme toggle */}
          <ThemeToggle />
          
          {/* Settings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem 
                onClick={() => userProfile?.username && navigate(`/${userProfile.username}`)}
                disabled={!userProfile?.id}
              >
                <User className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={(e) => {
              e.stopPropagation();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute right-4 top-14 z-50">
          <div className="bg-background border border-border rounded-md shadow-lg w-48 py-1">
            <nav className="py-1">
              <NavLinks 
                links={navLinks} 
                currentPath={location.pathname} 
                className="block w-full text-left px-4 py-2 text-sm hover:bg-accent/50"
              />
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};
