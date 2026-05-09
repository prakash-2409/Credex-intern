"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AuditOutcome } from "@/lib/auditEngine";
import { formatCurrency } from "@/lib/utils";
import { ShareButton } from "@/components/ShareButton";
import { SocialShareButtons } from "@/components/SocialShareButtons";
import { SummaryFallback } from "@/components/SummaryFallback";
import { calculateBenchmark } from "@/lib/benchmark";
import { formatPercent } from "@/lib/utils";

const DownloadPDF = dynamic(() => import("@/components/DownloadPDF").then((module) => module.DownloadPDF), {
  ssr: false,
});

const BenchmarkDisplay = dynamic(() => import("@/components/BenchmarkDisplay").then((module) => module.BenchmarkDisplay), {
  ssr: false,
});

interface AuditResultsProps {
  auditId: string;
  teamSize: number;
  useCase: string;
  outcome: AuditOutcome;
  summary: string;
  summarySource: "loading" | "live" | "fallback";
  publicUrl: string;
  onRetrySummary?: () => void;
}

export function AuditResults({ auditId, teamSize, useCase, outcome, summary, summarySource, publicUrl, onRetrySummary }: AuditResultsProps) {
  const [displaySavings, setDisplaySavings] = useState(0);
  const isWellSpent = outcome.totalMonthlySavings < 100;
  const benchmark = calculateBenchmark(teamSize, outcome);
  const consultationLink = process.env.NEXT_PUBLIC_CONSULTATION_LINK || "mailto:hello@credex.rocks?subject=Audit%20Consultation";
  const showConsultationCTA = outcome.totalMonthlySavings > 500;
  const totalCurrentSpend = useMemo(() => outcome.results.reduce((sum, item) => sum + item.currentSpend, 0), [outcome.results]);
  const savingsRate = totalCurrentSpend > 0 ? Math.min(100, (outcome.totalMonthlySavings / totalCurrentSpend) * 100) : 0;

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setDisplaySavings(outcome.totalMonthlySavings);
      return;
    }

    let frame = 0;
    const duration = 700;
    const start = performance.now();

    function step(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const value = outcome.totalMonthlySavings * (0.15 + 0.85 * progress);
      setDisplaySavings(Number(value.toFixed(2)));
      if (progress < 1) {
        frame = window.requestAnimationFrame(step);
      }
    }

    frame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frame);
  }, [outcome.totalMonthlySavings]);

  const confetti = outcome.totalMonthlySavings > 100 ? Array.from({ length: 10 }, (_, index) => index) : [];

  return (
    <section className="space-y-6" id="audit-report-content">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.16),transparent_35%)]" />
          <div className="absolute right-4 top-4 flex gap-1">
            {confetti.map((piece) => (
              <span
                key={piece}
                className="h-2 w-2 rounded-full animate-confetti-fall motion-reduce:hidden"
                style={{
                  backgroundColor: ["#2563eb", "#4f46e5", "#14b8a6", "#f59e0b", "#ec4899"][piece % 5],
                  opacity: 0,
                  ["--confetti-x" as string]: `${(piece % 5) * 12 - 24}px`,
                  animationDelay: `${piece * 45}ms`,
                }}
              />
            ))}
          </div>
          <CardHeader className="relative">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="accent">Audit complete</Badge>
              {outcome.highlightCredex ? <Badge>Credex opportunity</Badge> : <Badge variant="subtle">Lean spend</Badge>}
            </div>
            <CardTitle className="text-3xl sm:text-4xl">Your AI spend audit is ready</CardTitle>
            <CardDescription>
              {teamSize}-person {useCase} team. The engine is deterministic and uses the hardcoded pricing matrix only.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-border bg-surface-strong p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Monthly savings</p>
                <p className="mt-3 text-4xl font-semibold tracking-tight text-foreground">{formatCurrency(displaySavings)}</p>
                <p className="mt-2 text-sm text-muted">Projected recurring savings if you adopt the top recommendations.</p>
              </div>
              <div className="rounded-[1.5rem] border border-border bg-surface p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Annual savings</p>
                <p className="mt-3 text-4xl font-semibold tracking-tight text-foreground">{formatCurrency(outcome.totalAnnualSavings)}</p>
                <p className="mt-2 text-sm text-muted">A full-year view of the same spend reduction.</p>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-border bg-surface p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-foreground">Savings rate</span>
                <span className="font-semibold text-accent">{formatPercent(savingsRate)}</span>
              </div>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200/80">
                <div className="h-full rounded-full bg-gradient-to-r from-accent to-accent-secondary transition-all duration-500" style={{ width: `${savingsRate}%` }} />
              </div>
              <p className="mt-3 text-xs leading-5 text-muted">This shows savings as a share of the current monthly spend you entered.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <ShareButton url={publicUrl} />
              <SocialShareButtons url={publicUrl} savings={outcome.totalMonthlySavings} />
              <DownloadPDF auditId={auditId} teamSize={teamSize} useCase={useCase} outcome={outcome} summary={summary} publicUrl={publicUrl} fileName={`credex-audit-${auditId}`} />
              {outcome.highlightCredex ? (
                <Button asChild variant="accent">
                  <a href="https://credex.com" target="_blank" rel="noreferrer">
                    Talk to Credex
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              ) : null}
              {showConsultationCTA ? (
                <Button asChild variant="secondary">
                  <a href={consultationLink} target="_blank" rel="noreferrer">
                    Book consultation
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>{summarySource === "live" ? "AI-generated via Anthropic" : "Fallback summary"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {summarySource === "loading" ? (
              <div className="space-y-3 rounded-3xl border border-border bg-surface p-4">
                <div className="h-3 w-3/5 rounded-full animate-shimmer" />
                <div className="h-3 w-11/12 rounded-full animate-shimmer" />
                <div className="h-3 w-4/5 rounded-full animate-shimmer" />
                <div className="flex items-center gap-3 pt-2 text-sm text-muted">
                  <Sparkles className="h-4 w-4 animate-pulse text-accent" />
                  Generating a concise executive summary...
                </div>
              </div>
            ) : summarySource === "fallback" ? (
              <>
                <SummaryFallback auditId={auditId} teamSize={teamSize} useCase={useCase} outcome={outcome} />
                <div className="rounded-2xl border border-border bg-surface-strong p-3 text-xs leading-6 text-muted">
                  AI summary could not be loaded. Showing deterministic fallback copy instead.
                </div>
                {onRetrySummary ? (
                  <Button type="button" variant="secondary" size="sm" onClick={onRetrySummary}>
                    Retry AI summary
                  </Button>
                ) : null}
              </>
            ) : (
              <p className="text-sm leading-7 text-foreground">{summary}</p>
            )}
            {isWellSpent ? (
              <div className="rounded-3xl border border-border bg-surface p-4 text-sm leading-6 text-foreground">
                <div className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-accent" /> You&apos;re spending well.
                </div>
                <p className="mt-2 text-muted">Savings below $100/mo are treated as a healthy baseline, so we keep the call honest and low pressure.</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <BenchmarkDisplay benchmark={benchmark} />

      {showConsultationCTA ? (
        <Card className="border-accent/50 bg-accent/5">
          <CardHeader>
            <CardTitle>Capture these savings</CardTitle>
            <CardDescription>Credex&apos;s AI credit marketplace can help you redeploy this budget</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-6 text-foreground mb-4">
              Your audit shows you could save <strong>{formatCurrency(outcome.totalMonthlySavings)}/month</strong>. A Credex specialist can help you negotiate contracts or restructure tool usage to capture these savings.
            </p>
            <Button asChild variant="accent">
              <a href={consultationLink} target="_blank" rel="noreferrer">
                Schedule a free 15-min consultation
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Per-tool breakdown</CardTitle>
          <CardDescription>Current spend, recommendation, and estimated monthly savings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {outcome.results.map((item) => (
            <div key={item.tool} className="grid gap-3 rounded-[1.5rem] border border-border bg-surface p-4 shadow-sm transition-all duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-lg md:grid-cols-[1.2fr_1.2fr_0.6fr] md:items-center">
              <div className="border-l-4 pl-4" style={{ borderColor: item.savings > 0 ? "var(--accent)" : "rgba(100,116,139,0.35)" }}>
                <p className="text-sm font-semibold text-foreground">{item.tool}</p>
                <p className="text-sm text-muted">Current spend: {formatCurrency(item.currentSpend)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{item.recommendation}</p>
                <p className="mt-1 text-sm leading-6 text-muted">{item.reasoning}</p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-muted">Savings</p>
                <p className={`text-lg font-semibold ${item.savings > 0 ? "text-emerald-600" : "text-slate-500"}`}>{formatCurrency(item.savings)}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}