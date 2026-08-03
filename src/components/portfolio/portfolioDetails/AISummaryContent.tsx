import { AlertTriangle, Lightbulb, Minus, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { usePortfolioAISummary } from "@/api/portfolio/usePortfolioAISummary";
import { StockyLogo } from "@/components/brand/StockyLogo";
import { useTypewriterRotation } from "@/hooks/useTypewriterRotation";
import { cn } from "@/lib/utils";

interface AISummaryContentProps {
  portfolioId: string;
  open: boolean;
}

const LOADING_PHRASES = [
  "Reading your holdings…",
  "Weighing today's moves…",
  "Checking the risks…",
];

function AISummaryLoading() {
  const prefersReducedMotion = useReducedMotion();
  const { text } = useTypewriterRotation(LOADING_PHRASES, {
    holdMs: 1600,
    typeSpeedMs: 22,
    reduced: prefersReducedMotion || false,
  });

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <motion.div
        animate={prefersReducedMotion ? undefined : { scale: [1, 1.08, 1] }}
        transition={prefersReducedMotion ? undefined : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <StockyLogo variant="ink" size={40} />
      </motion.div>
      <p className="min-h-[20px] text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

const SENTIMENT_META = {
  bullish: { label: "Bullish", tone: "success" as const, Icon: TrendingUp },
  bearish: { label: "Bearish", tone: "danger" as const, Icon: TrendingDown },
  neutral: { label: "Neutral", tone: "muted" as const, Icon: Minus },
};

function getSentimentMeta(sentiment: string) {
  const s = sentiment.toLowerCase();
  if (s.includes("bull")) return SENTIMENT_META.bullish;
  if (s.includes("bear")) return SENTIMENT_META.bearish;
  return {
    ...SENTIMENT_META.neutral,
    label: sentiment ? sentiment[0].toUpperCase() + sentiment.slice(1) : "Neutral",
  };
}

const toneClasses = {
  success: { chip: "bg-success-light text-success", text: "text-success" },
  danger: { chip: "bg-danger-light text-danger", text: "text-danger" },
  muted: { chip: "bg-muted text-muted-foreground", text: "text-muted-foreground" },
};

export const AISummaryContent = ({ portfolioId, open }: AISummaryContentProps) => {
  const { data, isLoading, error, refetch, isFetching } = usePortfolioAISummary(portfolioId, open);

  if (!open) return null;

  if (isLoading || isFetching) {
    return <AISummaryLoading />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <AlertTriangle className="h-6 w-6 text-danger" />
        <p className="text-sm text-muted-foreground">Couldn't generate a summary right now.</p>
        <button
          className="text-sm font-medium text-primary underline underline-offset-4"
          onClick={() => refetch()}
        >
          Try again
        </button>
      </div>
    );
  }

  const result = data?.result;
  if (!result) {
    return <div className="py-16 text-center text-sm text-muted-foreground">No summary available.</div>;
  }

  const { sentiment, justification, risks, recommendations, assumptions } = result;
  const meta = getSentimentMeta(sentiment);
  const tone = toneClasses[meta.tone];

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-6 pb-6">
      {/* Verdict */}
      <div className="flex items-start gap-4 rounded-3xl border border-border bg-card p-5">
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl", tone.chip)}>
          <meta.Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className={cn("text-lg font-bold tracking-tight", tone.text)}>{meta.label}</p>
            <button
              onClick={() => refetch()}
              className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
              title="Regenerate"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{justification}</p>
        </div>
      </div>

      {/* Risks */}
      {risks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight">Risks to watch</h3>
            <span className="rounded-full bg-danger-light px-2 py-0.5 text-xs font-semibold text-danger">
              {risks.length}
            </span>
          </div>
          <div className="space-y-2">
            {risks.map((risk, idx) => (
              <div key={idx} className="flex gap-3 rounded-2xl border border-border bg-card/50 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-danger-light">
                  <AlertTriangle className="h-4 w-4 text-danger" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{risk.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{risk.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight">Worth considering</h3>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {recommendations.length}
            </span>
          </div>
          <div className="space-y-2">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="flex gap-3 rounded-2xl border border-border bg-card/50 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Lightbulb className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{rec.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{rec.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assumptions - de-emphasized, collapsed by default */}
      {assumptions.length > 0 && (
        <details className="group rounded-2xl border border-border/60 px-4 py-3">
          <summary className="cursor-pointer list-none text-xs font-medium text-muted-foreground marker:content-none">
            <span className="inline-flex items-center gap-1">
              Based on {assumptions.length} assumption{assumptions.length === 1 ? "" : "s"}
              <span className="transition-transform group-open:rotate-180">⌄</span>
            </span>
          </summary>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {assumptions.map((a, idx) => (
              <li key={idx}>· {a}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
};
