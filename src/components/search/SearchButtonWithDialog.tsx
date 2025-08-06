import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandSeparator,
} from "@/components/ui/command";

/**
 * SearchButtonWithDialog
 * - Shows a responsive search button (full or icon-only depending on screen size)
 * - Opens a CommandDialog for searching instruments and portfolios
 * - Keyboard shortcut: Cmd+K / Ctrl+K
 */
export function SearchButtonWithDialog() {
  const [commandOpen, setCommandOpen] = useState(false);

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
        <span className="hidden lg:inline-flex">Search</span>
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
      {/* Command Dialog Search */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Search for instruments or portfolios..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Instruments">
            {/* Instrument search results here */}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Portfolios">
            {/* Portfolio search results here */}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
