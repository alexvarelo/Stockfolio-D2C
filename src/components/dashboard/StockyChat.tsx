import React, { useState, useEffect, useRef } from "react";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
    Send,
    User,
    Sparkles,
    Loader2,
    MessageSquare,
    ChevronRight,
    History
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import stockyLogo from "@/assets/stocky.png";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
}

interface StockyChatProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const PREDEFINED_PROMPTS = [
    "Analyze my current portfolio performance",
    "What's the market sentiment for NVDA?",
    "Show me my largest holdings",
    "How can I diversify my portfolio further?",
];

export function StockyChat({ open, onOpenChange }: StockyChatProps) {
    const { user } = useAuth();
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Load existing conversation if it exists
    useEffect(() => {
        if (open && user && !conversationId) {
            loadLastConversation();
        }
    }, [open, user]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isLoading]);

    const loadLastConversation = async () => {
        if (!user) return;

        try {
            const { data: convs, error: convError } = await supabase
                .from("chat_conversations")
                .select("id")
                .eq("user_id", user.id)
                .order("updated_at", { ascending: false })
                .limit(1);

            if (convError) throw convError;

            if (convs && convs.length > 0) {
                const lastConvId = convs[0].id;
                setConversationId(lastConvId);

                const { data: msgs, error: msgsError } = await supabase
                    .from("chat_messages")
                    .select("*")
                    .eq("conversation_id", lastConvId)
                    .order("created_at", { ascending: true });

                if (msgsError) throw msgsError;

                if (msgs) {
                    setMessages(msgs.map(m => ({
                        id: m.id,
                        role: m.role as "user" | "assistant",
                        content: m.content || ""
                    })));
                }
            }
        } catch (err) {
            console.error("Error loading chat history:", err);
        }
    };

    const handleSend = async (text: string = input) => {
        if (!text.trim() || !user || isLoading) return;

        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: text,
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            // Invoke the edge function
            const { data, error } = await supabase.functions.invoke("stockfolio-chatbot", {
                body: {
                    message: text,
                    conversation_id: conversationId
                },
            });

            if (error) throw error;

            // Update state with assistant response and conversation ID
            if (data) {
                if (data.conversationId && !conversationId) {
                    setConversationId(data.conversationId);
                }

                const assistantMessage: Message = {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: data.response || "No response received.",
                };

                setMessages((prev) => [...prev, assistantMessage]);
            }
        } catch (err) {
            console.error("Chat error:", err);
            const errorMessage: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: "Sorry, I encountered an error processing your request. Please try again later.",
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const startNewChat = () => {
        setConversationId(null);
        setMessages([]);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="w-full sm:max-w-4xl p-0 flex flex-col bg-white border-l border-border/50"
            >
                <SheetHeader className="p-6 border-b border-border/50 shrink-0">
                    <div className="flex items-center justify-between max-w-5xl mx-auto w-full">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center p-2">
                                <img src={stockyLogo} alt="Stocky" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <SheetTitle className="text-xl font-bold flex items-center gap-2">
                                    Stocky
                                    <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                                </SheetTitle>
                                <SheetDescription className="text-sm">Your AI Financial Partner</SheetDescription>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={startNewChat}
                            title="Start New Chat"
                            className="rounded-full h-9 w-9"
                        >
                            <History className="w-4 h-4" />
                        </Button>
                    </div>
                </SheetHeader>

                <ScrollArea className="flex-1 overflow-y-auto">
                    <div className="max-w-3xl mx-auto px-6 py-12 md:px-12">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 py-12">
                                <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center">
                                    <MessageSquare className="w-10 h-10 text-primary/40" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold">How can I assist you today?</h3>
                                    <p className="text-muted-foreground max-w-sm mx-auto">
                                        Ask me anything about your portfolios, market trends, or insights.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 gap-3 w-full max-w-md">
                                    {PREDEFINED_PROMPTS.map((prompt) => (
                                        <Button
                                            key={prompt}
                                            variant="outline"
                                            className="justify-start h-auto py-4 px-6 text-left font-normal border-border hover:bg-muted/50 transition-all group rounded-xl"
                                            onClick={() => handleSend(prompt)}
                                        >
                                            <span className="flex-1">{prompt}</span>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-10 pb-8">
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn(
                                            "flex w-full",
                                            message.role === "user" ? "justify-end" : "justify-start"
                                        )}
                                    >
                                        {message.role === "user" ? (
                                            <div className="max-w-[85%] bg-muted/40 text-foreground px-5 py-3 rounded-[24px] text-base font-medium leading-relaxed">
                                                {message.content}
                                            </div>
                                        ) : (
                                            <div className="w-full flex gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="prose prose-slate max-w-none prose-headings:text-foreground prose-headings:font-semibold prose-headings:tracking-tight prose-p:text-gray-700 prose-p:leading-[1.7] prose-li:text-gray-700 prose-strong:text-foreground prose-strong:font-bold prose-code:text-foreground">
                                                        <ReactMarkdown
                                                            components={{
                                                                h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-8 mb-4" {...props} />,
                                                                h2: ({ node, ...props }) => <h2 className="text-xl font-bold mt-6 mb-3" {...props} />,
                                                                h3: ({ node, ...props }) => <h3 className="text-lg font-bold mt-5 mb-2" {...props} />,
                                                                p: ({ node, ...props }) => <p className="mb-4 text-[17px]" {...props} />,
                                                                ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-6 space-y-2" {...props} />,
                                                                ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-6 space-y-2" {...props} />,
                                                                li: ({ node, ...props }) => <li className="text-[17px]" {...props} />,
                                                                code: ({ node, inline, ...props }: any) =>
                                                                    inline ? (
                                                                        <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
                                                                    ) : (
                                                                        <pre className="bg-slate-900 text-slate-100 p-6 rounded-2xl overflow-x-auto my-6 overflow-wrap-anywhere whitespace-pre-wrap font-mono text-sm leading-relaxed border border-slate-800 shadow-sm">
                                                                            <code {...props} />
                                                                        </pre>
                                                                    ),
                                                                blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary/20 pl-4 italic my-6 text-muted-foreground" {...props} />,
                                                                hr: ({ node, ...props }) => <hr className="my-8 border-border/50" {...props} />,
                                                            }}
                                                        >
                                                            {message.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}

                                {isLoading && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex gap-4 pt-4"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center p-1.5 shrink-0">
                                            <img src={stockyLogo} alt="Stocky" className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin text-primary/40" />
                                            <span className="text-sm text-muted-foreground font-medium italic">Stocky is typing...</span>
                                        </div>
                                    </motion.div>
                                )}
                                <div ref={scrollRef} />
                            </div>
                        )}
                    </div>
                </ScrollArea>

                <div className="p-6 border-t border-border/50 shrink-0 bg-white shadow-sm">
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="flex gap-3 max-w-4xl mx-auto items-end"
                    >
                        <div className="flex-1 relative bg-muted/30 rounded-2xl border border-border/40 transition-all focus-within:border-primary/20 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/5">
                            <textarea
                                placeholder="Reply to Stocky..."
                                value={input}
                                onChange={(e) => {
                                    setInput(e.target.value);
                                    e.target.style.height = 'inherit';
                                    e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                disabled={isLoading}
                                className="w-full bg-transparent border-none focus:ring-0 text-base px-5 py-4 min-h-[56px] resize-none max-h-[200px]"
                                rows={1}
                            />
                        </div>
                        <Button
                            type="submit"
                            size="icon"
                            disabled={isLoading || !input.trim()}
                            className="h-14 w-14 rounded-2xl shrink-0 shadow-lg shadow-primary/10 transition-all hover:scale-105 active:scale-95 bg-primary hover:bg-primary/90"
                        >
                            <Send className="w-6 h-6" />
                        </Button>
                    </form>
                    <div className="max-w-4xl mx-auto mt-4 px-2 flex justify-between items-center text-[10px] text-muted-foreground/60 font-medium">
                        <span>AI response for informational purposes only.</span>
                        <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3" />
                            <span>Stocky Financial Intelligence</span>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
