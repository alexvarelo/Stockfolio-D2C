import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

/** Animates from 0 to `target` once per distinct target value. */
export function useCountUp(target: number, duration = 1) {
    const [value, setValue] = useState(0);
    const lastTarget = useRef<number | null>(null);

    useEffect(() => {
        if (lastTarget.current === target) return;
        lastTarget.current = target;

        const controls = animate(0, target, {
            duration,
            ease: "easeOut",
            onUpdate: (v) => setValue(v),
        });

        return () => controls.stop();
    }, [target, duration]);

    return value;
}
