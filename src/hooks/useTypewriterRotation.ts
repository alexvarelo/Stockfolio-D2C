import { useEffect, useRef, useState } from "react";

interface UseTypewriterRotationOptions {
    /** How long a fully-typed phrase stays on screen before the next one starts typing. */
    holdMs?: number;
    /** ms per character while typing. */
    typeSpeedMs?: number;
    /** Set to skip the typing effect (prefers-reduced-motion). */
    reduced?: boolean;
}

/** Types out phrases[] one at a time, holds each, then moves to the next (looping). */
export function useTypewriterRotation(
    phrases: string[],
    { holdMs = 10000, typeSpeedMs = 28, reduced = false }: UseTypewriterRotationOptions = {}
) {
    const [phraseIndex, setPhraseIndex] = useState(0);
    const [displayed, setDisplayed] = useState("");
    const [isTyping, setIsTyping] = useState(true);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
        if (phrases.length === 0) return;
        // A phrase list can change length/content between renders (data loads in);
        // keep the index in range instead of resetting to 0 every time.
        if (phraseIndex >= phrases.length) setPhraseIndex(0);
    }, [phrases, phraseIndex]);

    useEffect(() => {
        if (phrases.length === 0) return;
        const target = phrases[phraseIndex] ?? "";

        if (reduced) {
            setDisplayed(target);
            setIsTyping(false);
            timeoutRef.current = setTimeout(() => {
                setPhraseIndex((i) => (i + 1) % phrases.length);
            }, holdMs);
            return () => clearTimeout(timeoutRef.current);
        }

        setIsTyping(true);
        let charCount = 0;
        const typeInterval = setInterval(() => {
            charCount += 1;
            setDisplayed(target.slice(0, charCount));
            if (charCount >= target.length) {
                clearInterval(typeInterval);
                setIsTyping(false);
                timeoutRef.current = setTimeout(() => {
                    setPhraseIndex((i) => (i + 1) % phrases.length);
                }, holdMs);
            }
        }, typeSpeedMs);

        return () => {
            clearInterval(typeInterval);
            clearTimeout(timeoutRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phraseIndex, phrases.length, holdMs, typeSpeedMs, reduced]);

    return { text: displayed, isTyping, phraseIndex };
}
