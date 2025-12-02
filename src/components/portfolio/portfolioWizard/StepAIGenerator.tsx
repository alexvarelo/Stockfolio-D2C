import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, ArrowRight, Loader2, Send, Bot, User } from "lucide-react";
import { usePortfolioGenerator, GeneratedPortfolioResponse } from "@/api/portfolio/usePortfolioGenerator";
import { useToast } from "@/components/ui/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface StepAIGeneratorProps {
    onGenerate: (data: GeneratedPortfolioResponse) => void;
    onSkip: () => void;
}

interface Message {
    role: "user" | "assistant";
    content: string;
    missingInfo?: string[];
}

export function StepAIGenerator({ onGenerate, onSkip }: StepAIGeneratorProps) {
    const [prompt, setPrompt] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const { mutate: generatePortfolio, isPending } = usePortfolioGenerator();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleGenerate = () => {
        if (!prompt.trim()) return;

        const userMessage: Message = { role: "user", content: prompt };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setPrompt("");

        // Construct a context-aware prompt including history
        const fullContextPrompt = newMessages.map(m =>
            `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}${m.missingInfo ? ` (Missing: ${m.missingInfo.join(', ')})` : ''}`
        ).join('\n\n');

        generatePortfolio(
            { prompt: fullContextPrompt },
            {
                onSuccess: (data) => {
                    if (data.success) {
                        onGenerate(data);
                    } else {
                        const aiMessage: Message = {
                            role: "assistant",
                            content: data.message,
                            missingInfo: data.missing_info,
                        };
                        setMessages((prev) => [...prev, aiMessage]);
                    }
                },
                onError: (error) => {
                    const errorMessage: Message = {
                        role: "assistant",
                        content: error.message || "Something went wrong. Please try again.",
                    };
                    setMessages((prev) => [...prev, errorMessage]);
                },
            }
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleGenerate();
        }
    };

    return (
        <div className="flex flex-col h-[500px]">
            <div className="flex-1 overflow-hidden relative rounded-lg border bg-muted/30 mb-4">
                <ScrollArea className="h-full p-4">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 text-muted-foreground space-y-4">
                            <div className="bg-primary/10 p-4 rounded-full">
                                <Sparkles className="h-8 w-8 text-primary" />
                            </div>
                            <div className="max-w-sm space-y-2">
                                <h3 className="font-medium text-foreground">AI Portfolio Assistant</h3>
                                <p className="text-sm">
                                    Describe your investment goals, risk tolerance, or specific sectors.
                                    I'll help you build a diversified portfolio.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 pb-4">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "flex gap-3 max-w-[85%]",
                                        msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                                    )}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                        msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted border"
                                    )}>
                                        {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                    </div>
                                    <div className={cn(
                                        "rounded-lg p-3 text-sm",
                                        msg.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-background border shadow-sm"
                                    )}>
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                        {msg.missingInfo && msg.missingInfo.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-border/50">
                                                <p className="font-medium mb-2 text-xs uppercase tracking-wider opacity-70">Missing Information:</p>
                                                <ul className="list-disc list-inside space-y-1">
                                                    {msg.missingInfo.map((info, i) => (
                                                        <li key={i}>{info}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isPending && (
                                <div className="flex gap-3 max-w-[85%]">
                                    <div className="w-8 h-8 rounded-full bg-muted border flex items-center justify-center shrink-0">
                                        <Bot className="h-4 w-4" />
                                    </div>
                                    <div className="bg-background border shadow-sm rounded-lg p-3 flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Thinking...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>
                    )}
                </ScrollArea>
            </div>

            <div className="flex gap-2">
                <Textarea
                    placeholder="Type your message..."
                    className="min-h-[50px] max-h-[150px] resize-none"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isPending}
                />
                <Button
                    onClick={handleGenerate}
                    disabled={!prompt.trim() || isPending}
                    className="h-auto px-4"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex justify-center mt-4">
                <Button
                    variant="ghost"
                    onClick={onSkip}
                    disabled={isPending}
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                >
                    Skip to Manual Creation <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
