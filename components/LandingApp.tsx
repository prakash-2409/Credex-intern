"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";

import { AuditForm, type AuditResponse } from "@/components/AuditForm";
import { AuditResults } from "@/components/AuditResults";
import { LeadCapture } from "@/components/LeadCapture";
import { Card, CardContent } from "@/components/ui/card";
import { buildSummaryFallback } from "@/lib/summary";
import { toast } from "@/components/ui/use-toast";

export function LandingApp() {
  const [auditResponse, setAuditResponse] = useState<AuditResponse | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [summarySource, setSummarySource] = useState<"loading" | "live" | "fallback">("loading");
  const [summaryRetryToken, setSummaryRetryToken] = useState(0);
  const searchParams = useSearchParams();
  const refParam = searchParams?.get("ref");

  useEffect(() => {
    async function hydrateSummary() {
      if (!auditResponse) {
        return;
      }

      setSummarySource("loading");

      try {
        const response = await fetch("/api/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            auditId: auditResponse.auditId,
            teamSize: auditResponse.teamSize,
            useCase: auditResponse.useCase,
            outcome: auditResponse.outcome,
          }),
        });

        const payload = (await response.json()) as { summary?: string; source?: string };

        if (!response.ok || !payload.summary) {
          throw new Error(payload.summary ?? "Summary unavailable");
        }

        setSummary(payload.summary);
        setSummarySource(payload.source === "fallback" ? "fallback" : "live");
      } catch {
        setSummary(
          buildSummaryFallback({
            auditId: auditResponse.auditId,
            teamSize: auditResponse.teamSize,
            useCase: auditResponse.useCase,
            outcome: auditResponse.outcome,
          }),
        );
        setSummarySource("fallback");
        toast.warning("AI summary unavailable. Showing deterministic fallback.");
      }
    }

    void hydrateSummary();
  }, [auditResponse, summaryRetryToken]);

  function retrySummary() {
    setSummaryRetryToken((value) => value + 1);
  }

  // Show referral perk notification when audit completes with ref parameter
  useEffect(() => {
    if (auditResponse && refParam) {
      toast.success("Perk unlocked! Both you and your friend get early Credex credits!");
    }
  }, [auditResponse, refParam]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-4">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Credex internship assignment
          </div>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-6xl">
              Audit AI spend without letting the model make the pricing call.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted sm:text-lg">
              Compare subscription tiers, seat counts, and raw API usage against hardcoded pricing rules. The audit engine stays deterministic; only the summary paragraph uses Anthropic.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["Deterministic engine", "Hardcoded pricing and rules from local data."],
              ["Public result URL", "Shareable result pages with OG metadata."],
              ["Lead capture", "Supabase storage and Resend follow-up email."],
            ].map(([title, text]) => (
              <Card key={title} className="glass-panel">
                <CardContent className="p-4">
                  <p className="font-semibold text-foreground">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted">{text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-border bg-surface/90 p-4 shadow-soft">
          <div className="rounded-[1.5rem] border border-border bg-foreground p-5 text-background">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-background/70">What gets checked</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-background/90">
              <li>• Team size versus the selected plan</li>
              <li>• Cheaper same-vendor tiers for the same seat count</li>
              <li>• Lower-cost alternatives for the stated use case</li>
              <li>• Retail API spend versus packaged subscriptions</li>
            </ul>
          </div>
        </div>
      </section>

      <AuditForm onSubmitted={setAuditResponse} />

      {auditResponse ? (
        <div className="space-y-6">
          <AuditResults
            auditId={auditResponse.auditId}
            teamSize={auditResponse.teamSize}
            useCase={auditResponse.useCase}
            outcome={auditResponse.outcome}
            summary={summary}
            summarySource={summarySource}
            publicUrl={auditResponse.publicUrl}
            onRetrySummary={retrySummary}
          />
          <LeadCapture
            auditId={auditResponse.auditId}
            highlightCredex={auditResponse.outcome.highlightCredex}
            totalMonthlySavings={auditResponse.outcome.totalMonthlySavings}
            open
          />
        </div>
      ) : null}
    </div>
  );
}