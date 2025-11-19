import { Moon, Sun, Monitor, Palette, Check } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';

type Theme = {
  value: 'light' | 'dark' | 'system';
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

type ColorScheme = {
  value: 'blue' | 'emerald' | 'rose' | 'violet' | 'orange' | 'default';
  label: string;
  light: string;
  dark: string;
};

const themes: Theme[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

const colorSchemes: ColorScheme[] = [
  { value: 'default', label: 'Default', light: '#3b82f6', dark: '#60a5fa' },
  { value: 'blue', label: 'Blue', light: '#3b82f6', dark: '#60a5fa' },
  { value: 'emerald', label: 'Emerald', light: '#10b981', dark: '#34d399' },
  { value: 'rose', label: 'Rose', light: '#f43f5e', dark: '#fb7185' },
  { value: 'violet', label: 'Violet', light: '#8b5cf6', dark: '#a78bfa' },
  { value: 'orange', label: 'Orange', light: '#f97316', dark: '#fb923c' },
];

export function ThemeSelector() {
  const { theme, colorScheme, setTheme, setColorScheme } = useTheme();
  const currentTheme = themes.find((t) => t.value === theme) || themes[2];
  const currentColorScheme = colorSchemes.find((c) => c.value === colorScheme) || colorSchemes[0];
  const Icon = currentTheme.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Palette className="h-4 w-4" />
          <span>Theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuGroup>
          {themes.map(({ value, label, icon: ThemeIcon }) => (
            <DropdownMenuItem
              key={`theme-${value}`}
              onClick={() => setTheme(value)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <ThemeIcon className="h-4 w-4" />
                <span>{label}</span>
              </div>
              {theme === value && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Color Scheme</DropdownMenuLabel>
        <div className="grid grid-cols-3 gap-1 p-2">
          {colorSchemes.map((scheme) => (
            <button
              key={`color-${scheme.value}`}
              onClick={() => setColorScheme(scheme.value)}
              className={cn(
                'relative h-8 w-full rounded-md flex items-center justify-center',
                'transition-colors hover:bg-accent',
                colorScheme === scheme.value ? 'ring-2 ring-offset-2 ring-primary' : ''
              )}
              title={scheme.label}
            >
              <div 
                className="absolute inset-0.5 rounded-sm"
                style={{ 
                  backgroundColor: scheme.light,
                  opacity: 0.8,
                }}
              />
              <div 
                className="absolute inset-0.5 rounded-sm"
                style={{ 
                  backgroundColor: scheme.dark,
                  clipPath: 'polygon(0 0, 100% 0, 0 100%)',
                  opacity: 0.8,
                }}
              />
              {colorScheme === scheme.value && (
                <Check className="h-4 w-4 text-primary-foreground relative z-10" />
              )}
            </button>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
