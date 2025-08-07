import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { SearchButtonWithDialog } from '@/components/search/SearchButtonWithDialog';
import { NavLinks } from './NavLinks';
import { MobileNav } from './MobileNav';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { href: "/", label: "Dashboard" },
    { href: "/portfolios", label: "My Portfolios" },
    { href: "/transactions", label: "Transactions" },
    { href: "/following", label: "Following" },
  ];

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
      <div className="flex h-14 items-center px-4 gap-4">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <img src="/shark.png" alt="Logo" className="h-7 w-7" />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLinks links={navLinks} currentPath={location.pathname} />
        </nav>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <SearchButtonWithDialog />
          </div>
          <ThemeToggle />
          
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
            <div className="px-4 py-2 border-b border-border">
              <SearchButtonWithDialog />
            </div>
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
