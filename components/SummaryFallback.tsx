import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AuditOutcome } from "@/lib/auditEngine";
import { buildSummaryFallback } from "@/lib/summary";

interface SummaryFallbackProps {
  auditId: string;
  teamSize: number;
  useCase: string;
  outcome: AuditOutcome;
}

export function SummaryFallback({ auditId, teamSize, useCase, outcome }: SummaryFallbackProps) {
  const summary = buildSummaryFallback({ auditId, teamSize, useCase, outcome });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge variant="accent">Fallback summary</Badge>
          <span className="text-xs text-muted">Deterministic, no AI dependency</span>
        </div>
        <CardTitle>Executive summary</CardTitle>
        <CardDescription>Used when the Anthropic summary API is unavailable or rate limited.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-7 text-foreground">{summary}</p>
      </CardContent>
    </Card>
  );
}