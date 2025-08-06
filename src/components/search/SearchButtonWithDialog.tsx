import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Search, ArrowRight } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { useSearchInstrumentsApiV1SearchGet } from "@/api/search/search";
import { Skeleton } from "@/components/ui/skeleton";

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

  // Fetch search results
  const { data: searchResponse, isLoading } = useSearchInstrumentsApiV1SearchGet(
    { query: debouncedQuery },
    { 
      query: { 
        enabled: debouncedQuery.length >= 2, // Only fetch if query is 2+ characters
        staleTime: 5 * 60 * 1000, // Cache results for 5 minutes
      } 
    }
  );
  
  const searchResults = searchResponse?.data;

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
          ) : searchResults.results.length === 0 ? (
            <CommandEmpty>No results found for "{searchQuery}"</CommandEmpty>
          ) : (
            <CommandGroup heading="Instruments">
              {searchResults.results.map((result) => (
                <CommandItem
                  key={result.symbol}
                  value={`${result.symbol} ${result.name}`}
                  onSelect={() => handleSelectResult(result.symbol)}
                  className="flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{result.symbol}</span>
                    <span className="text-xs text-muted-foreground">
                      {result.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {result.exchange && (
                      <span className="text-xs text-muted-foreground">
                        {result.exchange}
                      </span>
                    )}
                    <ArrowRight className="h-4 w-4 opacity-50" />
                  </div>
                </CommandItem>
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
