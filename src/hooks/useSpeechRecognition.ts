import { useCallback, useEffect, useRef, useState } from "react";

// Minimal typing for the Web Speech API surface we use — not in the default
// TS lib, and browsers only expose it as SpeechRecognition/webkitSpeechRecognition.
interface SpeechRecognitionResultLike {
    isFinal: boolean;
    0: { transcript: string };
}

interface SpeechRecognitionEventLike {
    resultIndex: number;
    results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorEventLike {
    error: string;
}

interface SpeechRecognitionLike {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    onresult: ((_event: SpeechRecognitionEventLike) => void) | null;
    onerror: ((_event: SpeechRecognitionErrorEventLike) => void) | null;
    onend: (() => void) | null;
    start: () => void;
    stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionConstructor | null {
    if (typeof window === "undefined") return null;
    const win = window as unknown as {
        SpeechRecognition?: SpeechRecognitionConstructor;
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    return win.SpeechRecognition || win.webkitSpeechRecognition || null;
}

// Free, browser-native speech-to-text (Web Speech API). Supported in Chrome,
// Edge, and Safari; not in Firefox — callers should check `isSupported` and
// hide the mic control entirely when it's false rather than showing a
// broken button.
interface UseSpeechRecognitionOptions {
    // Called with the full transcript accumulated so far for the current
    // listening session (finalized speech + live interim guess), so callers
    // can just prepend it to whatever text was already in the input.
    onResult: (_transcript: string, _isFinal: boolean) => void;
    onError?: (_error: string) => void;
    lang?: string;
}

export function useSpeechRecognition({ onResult, onError, lang }: UseSpeechRecognitionOptions) {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
    const onResultRef = useRef(onResult);
    const onErrorRef = useRef(onError);
    onResultRef.current = onResult;
    onErrorRef.current = onError;

    const SpeechRecognitionCtor = getSpeechRecognitionCtor();
    const isSupported = !!SpeechRecognitionCtor;

    useEffect(() => {
        return () => {
            recognitionRef.current?.stop();
        };
    }, []);

    const stop = useCallback(() => {
        recognitionRef.current?.stop();
    }, []);

    const start = useCallback(() => {
        if (!SpeechRecognitionCtor || recognitionRef.current) return;

        const recognition = new SpeechRecognitionCtor();
        recognition.lang = lang || navigator.language || "en-US";
        recognition.continuous = true;
        recognition.interimResults = true;

        let finalTranscript = "";

        recognition.onresult = (event) => {
            let interim = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const chunk = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += chunk + " ";
                } else {
                    interim += chunk;
                }
            }
            onResultRef.current((finalTranscript + interim).trim(), interim === "");
        };

        recognition.onerror = (event) => {
            onErrorRef.current?.(event.error);
        };

        recognition.onend = () => {
            recognitionRef.current = null;
            setIsListening(false);
        };

        recognitionRef.current = recognition;
        setIsListening(true);
        recognition.start();
    }, [SpeechRecognitionCtor, lang]);

    const toggle = useCallback(() => {
        if (isListening) stop(); else start();
    }, [isListening, start, stop]);

    return { isSupported, isListening, start, stop, toggle };
}
