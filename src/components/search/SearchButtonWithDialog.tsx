import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Search, ArrowRight, Plus } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { useSearchInstruments } from "@/api/instruments/useSearchInstruments";
import { Skeleton } from "@/components/ui/skeleton";
import { AddToWatchlist } from "@/components/watchlist/AddToWatchlist";
import { Button } from "@/components/ui/button";

/**
 * SearchButtonWithDialog
 * - Shows a responsive search button (full or icon-only depending on screen size)
 * - Opens a CommandDialog for searching instruments and portfolios
 * - Keyboard shortcut: Cmd+K / Ctrl+K
 */
export function SearchButtonWithDialog() {
  const navigate = useNavigate();
  const [commandOpen, setCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Debounce the search query
  const [debouncedQuery, setDebouncedQuery] = useState("");
  
  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch search results using our custom hook
  const { data: searchResults = [], isLoading } = useSearchInstruments(
    debouncedQuery,
    { 
      enabled: debouncedQuery.length >= 2 // Only fetch if query is 2+ characters
    }
  );

  // Handle result selection
  const handleSelectResult = useCallback((ticker: string) => {
    setCommandOpen(false);
    setSearchQuery("");
    navigate(`/instrument/${ticker}`);
  }, [navigate]);

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

  return (
    <>
      {/* Desktop/Tablet: full search button */}
      <button
        type="button"
        onClick={() => setCommandOpen(true)}
        className={cn(
          "hidden md:inline-flex items-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2 relative w-full justify-start text-sm text-muted-foreground sm:pr-16 md:w-32 lg:w-60"
        )}
      >
        <Search className="mr-2 h-4 w-4 shrink-0" />
        <span className="hidden lg:inline-flex">Search...</span>
        <span className="inline-flex lg:hidden">Search</span>
        <div className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 sm:flex">
          <kbd className="inline-flex items-center justify-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 h-5 min-w-[20px]">
            <span className="text-xs">⌘</span>
          </kbd>
          <kbd className="inline-flex items-center justify-center rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 h-5 min-w-[20px]">
            K
          </kbd>
        </div>
      </button>
      {/* Mobile: icon-only search button */}
      <button
        type="button"
        onClick={() => setCommandOpen(true)}
        aria-label="Search"
        className={cn(
          "md:hidden inline-flex items-center justify-center rounded-full border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-10 w-10 p-0"
        )}
      >
        <Search className="h-5 w-5" />
      </button>

      <CommandDialog 
        open={commandOpen} 
        onOpenChange={(open) => {
          setCommandOpen(open);
          if (!open) setSearchQuery("");
        }}
      >
        <CommandInput 
          placeholder="Search instruments..." 
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          {searchQuery.length < 2 ? (
            <CommandEmpty>Type at least 2 characters to search</CommandEmpty>
          ) : isLoading || !searchResults ? (
            <div className="p-4 space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : searchResults.length === 0 ? (
            <CommandEmpty>No results found for "{searchQuery}"</CommandEmpty>
          ) : (
            <CommandGroup heading="Instruments">
              {searchResults.map((result) => (
                <div key={result.ticker} className="relative group">
                  <CommandItem
                    value={`${result.ticker} ${result.name}`}
                    onSelect={() => handleSelectResult(result.ticker)}
                    className="flex items-center justify-between pr-16"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {result.name} <span className="text-muted-foreground">({result.ticker})</span>
                        </p>
                        {result.exchange && (
                          <p className="text-xs text-muted-foreground truncate">
                            {result.exchange}
                            {result.country && ` • ${result.country}`}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        <AddToWatchlist 
                          ticker={result.ticker}
                          buttonVariant="outline"
                          buttonSize="sm"
                          className="ml-2"
                          onAdded={() => {
                            setSearchQuery('');
                            setCommandOpen(false);
                          }}
                        />
                      </div>
                    </div>
                  </CommandItem>
                </div>
              ))}
            </CommandGroup>
          )}
          
          {searchQuery.length === 0 && (
            <CommandGroup heading="Popular">
              <CommandEmpty>Try searching for a stock or ETF</CommandEmpty>
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
