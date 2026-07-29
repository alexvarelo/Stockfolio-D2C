import { Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceInputButtonProps {
    isListening: boolean;
    isSupported: boolean;
    onToggle: () => void;
    className?: string;
    size?: "sm" | "md";
}

function ListeningWave() {
    return (
        <div className="flex items-end gap-0.5 h-4 relative z-10">
            {[0, 1, 2, 3].map((i) => (
                <span
                    key={i}
                    className="voice-bar w-0.5 h-full rounded-full bg-danger"
                    style={{ animationDelay: `${i * 0.12}s` }}
                />
            ))}
        </div>
    );
}

export function VoiceInputButton({ isListening, isSupported, onToggle, className, size = "md" }: VoiceInputButtonProps) {
    if (!isSupported) return null;

    return (
        <button
            type="button"
            onClick={onToggle}
            aria-label={isListening ? "Stop voice input" : "Start voice input"}
            aria-pressed={isListening}
            className={cn(
                "relative flex items-center justify-center transition-colors",
                size === "md" ? "h-9 w-9 rounded-xl" : "h-8 w-8 rounded-lg",
                isListening
                    ? "text-danger"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-100",
                className
            )}
        >
            {isListening && (
                <>
                    <span className="absolute inset-0 rounded-[inherit] bg-danger/15 animate-ping" />
                    <span className="absolute inset-0 rounded-[inherit] bg-danger/10" />
                </>
            )}
            {isListening ? <ListeningWave /> : <Mic className="w-4 h-4" />}
        </button>
    );
}
