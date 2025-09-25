import React from "react";
import { usePortfolioAISummary } from "@/api/portfolio/usePortfolioAISummary";

interface AISummaryContentProps {
  portfolioId: string;
  open: boolean;
}

export const AISummaryContent: React.FC<AISummaryContentProps> = ({ portfolioId, open }) => {
  const { data, isLoading, error, refetch, isFetching } = usePortfolioAISummary(portfolioId, open);

  if (!open) return null;

  if (isLoading || isFetching) {
    return <div className="text-center text-muted-foreground py-8">Generating summary…</div>;
  }
  if (error) {
    return (
      <div className="text-center text-destructive py-8">
        <div>Failed to load summary.</div>
        <button className="mt-2 underline" onClick={() => refetch()}>Retry</button>
      </div>
    );
  }
  const result = (data as import("@/api/portfolio/usePortfolioAISummary").PortfolioLLMSummaryResponse | undefined)?.result;
  if (!result) {
    return <div className="text-center text-muted-foreground py-8">No summary available.</div>;
  }
  const { sentiment, justification, risks, recommendations, assumptions } = result;
  return (
    <div className="space-y-6 mx-10">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-primary">Sentiment:</span>
        <span className={`px-2 py-1 rounded text-sm ${sentiment === 'bullish' ? 'bg-green-100 text-green-700' : sentiment === 'bearish' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{sentiment}</span>
      </div>
      <div>
        <div className="font-semibold mb-1">Justification</div>
        <div className="rounded p-3 whitespace-pre-line">{justification}</div>
      </div>
      <div>
        <div className="font-semibold mb-1">Risks</div>
        <ul className="space-y-2">
          {risks.map((risk, idx) => (
            <li key={idx} className="border-l-4 border-orange-400 p-3 rounded">
              <div className="font-semibold text-orange-700">{risk.title}</div>
              <div className="text-sm text-orange-900">{risk.explanation}</div>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div className="font-semibold mb-1">Recommendations</div>
        <ul className="space-y-2">
          {recommendations.map((rec, idx) => (
            <li key={idx} className="border-l-4 border-blue-400 p-3 rounded">
              <div className="font-semibold text-blue-700">{rec.title}</div>
              <div className="text-sm text-blue-900">{rec.action}</div>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div className="font-semibold mb-1">Assumptions</div>
        <ul className="list-disc pl-6 text-muted-foreground">
          {assumptions.map((a, idx) => (
            <li key={idx}>{a}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
