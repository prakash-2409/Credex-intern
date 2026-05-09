"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowRight, BadgeCheck, Sparkles, ShieldCheck, WandSparkles } from "lucide-react";

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
      <section className="relative overflow-hidden rounded-[2.5rem] border border-border bg-surface/85 px-5 py-8 shadow-soft sm:px-8 lg:px-10 lg:py-12 animate-fade-in-up">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(79,70,229,0.14),transparent_28%)]" />
        <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Credex internship assignment
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl bg-gradient-to-r from-slate-950 via-blue-900 to-indigo-700 bg-clip-text text-4xl font-semibold tracking-tight text-transparent sm:text-6xl lg:text-7xl">
                Audit AI spend with a cleaner, more human product feel.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted sm:text-lg">
                Compare subscription tiers, seat counts, and raw API usage against hardcoded pricing rules. The audit engine stays deterministic; only the summary paragraph uses Anthropic.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a href="#audit-form" className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/20 transition-transform duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-xl">
                Run the audit
                <ArrowRight className="h-4 w-4" />
              </a>
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/80 px-4 py-3 text-sm text-muted shadow-sm">
                <ShieldCheck className="h-4 w-4 text-accent" />
                Deterministic output, polished presentation
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                [BadgeCheck, "Deterministic engine", "Hardcoded pricing and rules from local data."],
                [Sparkles, "Public result URL", "Shareable result pages with OG metadata."],
                [WandSparkles, "Lead capture", "Supabase storage and Resend follow-up email."],
              ].map(([Icon, title, text]) => (
                <Card key={title as string} className="glass-panel border-white/70 transition-all duration-200 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-xl">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-accent" />
                      <p className="font-semibold text-foreground">{title as string}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted">{text as string}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="relative rounded-[2rem] border border-border bg-gradient-to-br from-slate-950 to-blue-950 p-4 text-white shadow-2xl shadow-blue-900/20 animate-float-slow">
            <div className="absolute inset-0 rounded-[2rem] bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_30%,rgba(255,255,255,0.06)_65%,transparent)]" />
            <div className="relative rounded-[1.5rem] border border-white/10 bg-white/8 p-5 backdrop-blur-md">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">What gets checked</p>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-white/88">
                <li>• Team size versus the selected plan</li>
                <li>• Cheaper same-vendor tiers for the same seat count</li>
                <li>• Lower-cost alternatives for the stated use case</li>
                <li>• Retail API spend versus packaged subscriptions</li>
              </ul>
            </div>
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