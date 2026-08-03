import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

/**
 * Animates to `target`: counts up from 0 on first render, then smoothly
 * interpolates from the previous value on later changes (e.g. live price
 * ticks) instead of resetting to 0 each time.
 */
export function useAnimatedNumber(target: number, duration = 1) {
    const [value, setValue] = useState(0);
    const prevTarget = useRef(0);
    const isFirstRun = useRef(true);

    useEffect(() => {
        const from = isFirstRun.current ? 0 : prevTarget.current;
        if (!isFirstRun.current && from === target) return;
        isFirstRun.current = false;
        prevTarget.current = target;

        const controls = animate(from, target, {
            duration,
            ease: "easeOut",
            onUpdate: setValue,
        });

        return () => controls.stop();
    }, [target, duration]);

    return value;
}
