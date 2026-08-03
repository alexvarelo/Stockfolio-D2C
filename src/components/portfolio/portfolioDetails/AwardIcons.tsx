// Clay-gradient milestone icon set (Ice Blue accent), ported from the
// "Stocky — Final Icon Set (Ice Blue)" reference. Locked/unlocked variants
// share one <defs> block rendered once via AwardIconDefs.
export type AwardIconId = "bullseye" | "club100" | "onFire" | "diversified" | "disciplined";

export function AwardIconDefs() {
    return (
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
            <defs>
                <linearGradient id="pa-clayInk" x1="20%" y1="10%" x2="80%" y2="100%">
                    <stop offset="0%" stopColor="#3A3A3A" /><stop offset="45%" stopColor="#1C1C1C" /><stop offset="100%" stopColor="#000" />
                </linearGradient>
                <linearGradient id="pa-clayLight" x1="20%" y1="10%" x2="80%" y2="100%">
                    <stop offset="0%" stopColor="#FFF" /><stop offset="55%" stopColor="#EDEDEA" /><stop offset="100%" stopColor="#D4D4D0" />
                </linearGradient>
                <linearGradient id="pa-claySilver" x1="20%" y1="10%" x2="80%" y2="100%">
                    <stop offset="0%" stopColor="#B8B8B4" /><stop offset="50%" stopColor="#8E8E8A" /><stop offset="100%" stopColor="#5C5C58" />
                </linearGradient>
                <linearGradient id="pa-clayLocked" x1="20%" y1="10%" x2="80%" y2="100%">
                    <stop offset="0%" stopColor="#D8D8D6" /><stop offset="50%" stopColor="#C4C4C0" /><stop offset="100%" stopColor="#AEAEAA" />
                </linearGradient>
                <linearGradient id="pa-accentIce" x1="20%" y1="10%" x2="80%" y2="100%">
                    <stop offset="0%" stopColor="#8FD8FF" /><stop offset="50%" stopColor="#3FB6F0" /><stop offset="100%" stopColor="#1C8CC7" />
                </linearGradient>
                <filter id="pa-shadowFull" x="-60%" y="-60%" width="220%" height="220%">
                    <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000" floodOpacity="0.15" />
                </filter>
                <filter id="pa-shadowSoft" x="-60%" y="-60%" width="220%" height="220%">
                    <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.07" />
                </filter>
            </defs>
        </svg>
    );
}

function UnlockedBadge({ x, y }: { x: number; y: number }) {
    return (
        <g transform={`translate(${x},${y})`}>
            <circle r="12" fill="url(#pa-accentIce)" />
            <path d="M-4 0l3 3 6-6" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
    );
}

function LockedBadge({ x, y }: { x: number; y: number }) {
    return (
        <g transform={`translate(${x},${y})`}>
            <circle r="12" fill="white" stroke="#DDD" strokeWidth="1.5" />
            <path d="M-3.5-1.5v-2.5a3.5 3.5 0 017 0v2.5" fill="none" stroke="#999" strokeWidth="1.8" strokeLinecap="round" />
            <rect x="-4.5" y="-1.5" width="9" height="7" rx="1.8" fill="#999" />
        </g>
    );
}

interface AwardIconProps {
    id: AwardIconId;
    unlocked: boolean;
    size?: number;
    className?: string;
}

export function AwardIcon({ id, unlocked, size = 60, className }: AwardIconProps) {
    const filter = unlocked ? "url(#pa-shadowFull)" : "url(#pa-shadowSoft)";

    let content: React.ReactNode;
    switch (id) {
        case "bullseye":
            content = unlocked ? (
                <>
                    <circle cx="50" cy="50" r="38" fill="url(#pa-clayInk)" />
                    <ellipse cx="38" cy="35" rx="12" ry="8" fill="white" opacity="0.18" />
                    <circle cx="50" cy="50" r="26" fill="url(#pa-clayLight)" />
                    <circle cx="50" cy="50" r="14" fill="url(#pa-clayInk)" />
                    <circle cx="50" cy="50" r="5" fill="url(#pa-accentIce)" />
                    <UnlockedBadge x={68} y={68} />
                </>
            ) : (
                <>
                    <circle cx="50" cy="50" r="38" fill="url(#pa-clayLocked)" />
                    <ellipse cx="38" cy="35" rx="12" ry="8" fill="white" opacity="0.25" />
                    <circle cx="50" cy="50" r="26" fill="#E8E8E5" />
                    <circle cx="50" cy="50" r="14" fill="url(#pa-clayLocked)" />
                    <circle cx="50" cy="50" r="5" fill="#B8B8B4" />
                    <LockedBadge x={68} y={68} />
                </>
            );
            break;

        case "club100":
            content = unlocked ? (
                <>
                    <path d="M50 10c10 8 16 22 16 36a16 16 0 01-32 0c0-14 6-28 16-36z" fill="url(#pa-clayInk)" />
                    <ellipse cx="42" cy="30" rx="8" ry="12" fill="white" opacity="0.16" />
                    <circle cx="50" cy="42" r="8" fill="url(#pa-clayLight)" />
                    <path d="M34 48l-10 16 12-4M66 48l10 16-12-4" fill="url(#pa-claySilver)" />
                    <path d="M44 66l-3 16 9-8 9 8-3-16" fill="url(#pa-accentIce)" />
                    <UnlockedBadge x={68} y={68} />
                </>
            ) : (
                <>
                    <path d="M50 10c10 8 16 22 16 36a16 16 0 01-32 0c0-14 6-28 16-36z" fill="url(#pa-clayLocked)" />
                    <ellipse cx="42" cy="30" rx="8" ry="12" fill="white" opacity="0.25" />
                    <circle cx="50" cy="42" r="8" fill="#E8E8E5" />
                    <path d="M34 48l-10 16 12-4M66 48l10 16-12-4" fill="#C4C4C0" />
                    <path d="M44 66l-3 16 9-8 9 8-3-16" fill="#B8B8B4" />
                    <LockedBadge x={68} y={68} />
                </>
            );
            break;

        case "onFire":
            content = unlocked ? (
                <>
                    <path d="M50 14c8 12 22 22 22 40a22 22 0 11-44 0c0-5 1.5-9 4-13 1 4 4.5 7.5 8.5 7.5-2-8 2-16 9.5-24.5z" fill="url(#pa-clayInk)" />
                    <ellipse cx="41" cy="34" rx="9" ry="6" fill="white" opacity="0.22" />
                    <path d="M50 54c3-4 8-8 8-15a8 8 0 10-16 0c0 2 .5 3.5 1.5 5 .5-2 2-3.5 4-3.5-1.5 4.5 0 9.5 2.5 13.5z" fill="url(#pa-accentIce)" />
                    <UnlockedBadge x={68} y={68} />
                </>
            ) : (
                <>
                    <path d="M50 14c8 12 22 22 22 40a22 22 0 11-44 0c0-5 1.5-9 4-13 1 4 4.5 7.5 8.5 7.5-2-8 2-16 9.5-24.5z" fill="url(#pa-clayLocked)" />
                    <ellipse cx="41" cy="34" rx="9" ry="6" fill="white" opacity="0.3" />
                    <path d="M50 54c3-4 8-8 8-15a8 8 0 10-16 0c0 2 .5 3.5 1.5 5 .5-2 2-3.5 4-3.5-1.5 4.5 0 9.5 2.5 13.5z" fill="#E8E8E5" />
                    <LockedBadge x={68} y={68} />
                </>
            );
            break;

        case "diversified":
            content = unlocked ? (
                <>
                    <rect x="16" y="30" width="68" height="48" rx="10" fill="url(#pa-clayInk)" />
                    <ellipse cx="34" cy="42" rx="14" ry="7" fill="white" opacity="0.14" />
                    <rect x="16" y="30" width="68" height="16" rx="8" fill="url(#pa-claySilver)" />
                    <circle cx="68" cy="58" r="7" fill="url(#pa-accentIce)" />
                    <rect x="8" y="52" width="16" height="24" rx="4" fill="url(#pa-clayLight)" transform="rotate(-8 16 64)" />
                    <UnlockedBadge x={78} y={20} />
                </>
            ) : (
                <>
                    <rect x="16" y="30" width="68" height="48" rx="10" fill="url(#pa-clayLocked)" />
                    <ellipse cx="34" cy="42" rx="14" ry="7" fill="white" opacity="0.22" />
                    <rect x="16" y="30" width="68" height="16" rx="8" fill="#C4C4C0" />
                    <circle cx="68" cy="58" r="7" fill="#B8B8B4" />
                    <rect x="8" y="52" width="16" height="24" rx="4" fill="#E8E8E5" transform="rotate(-8 16 64)" />
                    <LockedBadge x={78} y={20} />
                </>
            );
            break;

        case "disciplined":
            content = unlocked ? (
                <>
                    <rect x="18" y="24" width="64" height="58" rx="12" fill="url(#pa-clayLight)" />
                    <rect x="18" y="24" width="64" height="18" rx="9" fill="url(#pa-clayInk)" />
                    <rect x="30" y="14" width="8" height="16" rx="4" fill="url(#pa-claySilver)" />
                    <rect x="62" y="14" width="8" height="16" rx="4" fill="url(#pa-claySilver)" />
                    <circle cx="50" cy="62" r="16" fill="url(#pa-accentIce)" />
                    <path d="M43 62l5 5 10-11" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </>
            ) : (
                <>
                    <rect x="18" y="24" width="64" height="58" rx="12" fill="#E8E8E5" />
                    <rect x="18" y="24" width="64" height="18" rx="9" fill="url(#pa-clayLocked)" />
                    <rect x="30" y="14" width="8" height="16" rx="4" fill="#C4C4C0" />
                    <rect x="62" y="14" width="8" height="16" rx="4" fill="#C4C4C0" />
                    <circle cx="50" cy="62" r="16" fill="#D8D8D6" />
                    <path d="M43 62l5 5 10-11" fill="none" stroke="#AAA" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </>
            );
            break;
    }

    return (
        <svg width={size} height={size} viewBox="0 0 100 100" filter={filter} className={className} role="img" aria-label={id}>
            {content}
        </svg>
    );
}
