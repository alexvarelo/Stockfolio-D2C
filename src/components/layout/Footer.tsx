import { Mail, Database, BarChart3, Code } from 'lucide-react';
import stockyLogo from '@/assets/stocky.png';

export const Footer = () => {
    return (
        <footer className="w-full border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-8 mt-auto">
            <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                    <img
                        src={stockyLogo}
                        alt="Stocky"
                        className="h-8 w-8 grayscale opacity-70 hover:opacity-100 transition-opacity"
                    />
                    <span className="font-semibold text-foreground">Stocky</span>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-xs">
                    <div className="flex items-center gap-2 hover:text-foreground transition-colors">
                        <BarChart3 className="h-3.5 w-3.5" />
                        <span>Data provided by Yahoo Finance (yfinance)</span>
                    </div>
                    <div className="flex items-center gap-2 hover:text-foreground transition-colors">
                        <Database className="h-3.5 w-3.5" />
                        <span>Data management by Supabase</span>
                    </div>
                    <div className="flex items-center gap-2 hover:text-foreground transition-colors">
                        <Mail className="h-3.5 w-3.5" />
                        <a href="mailto:stockyfolio@gmail.com">
                            stockyfolio@gmail.com
                        </a>
                    </div>
                    <div className="flex items-center gap-2 hover:text-foreground transition-colors">
                        <Code className="h-3.5 w-3.5" />
                        <a href="https://stockfolio-api-229460767991.europe-west1.run.app/" target="_blank" rel="noopener noreferrer">
                            API for developers
                        </a>
                    </div>
                </div>

                <div className="text-xs text-muted-foreground/60">
                    © {new Date().getFullYear()} Stockfolio. All rights reserved.
                </div>
            </div>
        </footer>
    );
};
