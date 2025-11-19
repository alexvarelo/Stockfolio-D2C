import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Filter } from "lucide-react";
import { USMarketView } from "./market-research/USMarketView";
import { EuropeMarketView } from "./market-research/EuropeMarketView";

export function MarketResearchRevamped() {
    const [activeTab, setActiveTab] = useState("us");

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-4xl font-extrabold tracking-tight mb-2">Market Pulse</h1>
                <p className="text-muted-foreground text-lg">
                    Real-time insights from global markets.
                </p>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="us" className="space-y-8" onValueChange={setActiveTab}>
                <TabsList className="bg-muted/50 p-1 rounded-full">
                    <TabsTrigger value="us" className="rounded-full px-6">US Market</TabsTrigger>
                    <TabsTrigger value="europe" className="rounded-full px-6">Europe</TabsTrigger>
                    <TabsTrigger value="sectors" className="rounded-full px-6">Sectors</TabsTrigger>
                </TabsList>

                <TabsContent value="us">
                    <USMarketView />
                </TabsContent>

                <TabsContent value="europe">
                    <EuropeMarketView />
                </TabsContent>

                <TabsContent value="sectors" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="text-center py-20">
                        <div className="bg-muted/30 rounded-full h-20 w-20 flex items-center justify-center mx-auto mb-6">
                            <Filter className="h-10 w-10 text-muted-foreground" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Sector Analysis</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                            Detailed sector performance and heatmaps are coming soon. Stay tuned for updates!
                        </p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
