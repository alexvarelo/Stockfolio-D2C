import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, Minus, Twitter, ChevronDown, ChevronUp, Heart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface InstrumentSentimentCardProps {
    ticker: string;
}

interface Tweet {
    id: string;
    created_at: string;
    text: string;
    public_metrics: {
        retweet_count: number;
        reply_count: number;
        like_count: number;
        quote_count: number;
        bookmark_count: number;
        impression_count: number;
    };
}

interface SentimentResponse {
    sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
    narrative: string;
    key_topics: string[];
    tweet_count: number;
    raw_tweets: Tweet[];
}

export const InstrumentSentimentCard = ({ ticker }: InstrumentSentimentCardProps) => {
    const [showTweets, setShowTweets] = useState(false);
    const { data, isLoading, error } = useQuery({
        queryKey: ["sentiment", ticker],
        queryFn: async () => {
            const { data, error } = await supabase.functions.invoke("analyze-ticker-sentiment", {
                body: { ticker },
            });

            if (error) throw error;
            return data as SentimentResponse;
        },
        retry: 1,
    });

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Market Sentiment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-16 w-full" />
                    <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error || !data) {
        // Optionally return null to hide if error, or show error state
        // For now, let's hide it on error to avoid cluttering the UI with broken components
        // if the edge function isn't ready or fails.
        // Or show a simple message.
        return null;
    }

    const getSentimentConfig = (sentiment: string) => {
        switch (sentiment) {
            case "BULLISH":
                return {
                    color: "text-green-600 dark:text-green-400",
                    bg: "bg-green-100 dark:bg-green-900/30",
                    icon: TrendingUp,
                    label: "Bullish",
                };
            case "BEARISH":
                return {
                    color: "text-red-600 dark:text-red-400",
                    bg: "bg-red-100 dark:bg-red-900/30",
                    icon: TrendingDown,
                    label: "Bearish",
                };
            default:
                return {
                    color: "text-slate-600 dark:text-slate-400",
                    bg: "bg-slate-100 dark:bg-slate-800",
                    icon: Minus,
                    label: "Neutral",
                };
        }
    };

    const config = getSentimentConfig(data.sentiment);
    const Icon = config.icon;

    return (
        <Card className="overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-900/50 shadow-sm">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Twitter className="h-5 w-5 text-blue-400" />
                        Social Sentiment
                    </CardTitle>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.color}`}>
                        <Icon className="h-4 w-4" />
                        {config.label}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {data.narrative}
                </p>

                {data.key_topics && data.key_topics.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {data.key_topics.map((topic) => (
                            <Badge key={topic} variant="secondary" className="text-xs font-normal">
                                {topic}
                            </Badge>
                        ))}
                    </div>
                )}

                <div className="pt-2 border-t space-y-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Source: X (Twitter)</span>
                        <div className="flex items-center gap-2">
                            <span>Based on {data.tweet_count} tweets</span>
                            {data.raw_tweets && data.raw_tweets.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => setShowTweets(!showTweets)}
                                >
                                    {showTweets ? "Hide Tweets" : "Show Tweets"}
                                    {showTweets ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
                                </Button>
                            )}
                        </div>
                    </div>

                    {showTweets && data.raw_tweets && (
                        <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                            {data.raw_tweets.map((tweet) => (
                                <div key={tweet.id} className="bg-white/50 dark:bg-slate-800/50 rounded-lg p-3 text-xs border border-slate-100 dark:border-slate-800">
                                    <p className="text-slate-700 dark:text-slate-300 mb-2 whitespace-pre-wrap">{tweet.text}</p>
                                    <div className="flex items-center justify-between text-slate-400">
                                        <span>{new Date(tweet.created_at).toLocaleDateString()}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1">
                                                <Heart className="h-3 w-3" />
                                                {tweet.public_metrics.like_count}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Eye className="h-3 w-3" />
                                                {tweet.public_metrics.impression_count}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
