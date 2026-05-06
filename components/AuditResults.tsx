"use client";

import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AuditOutcome } from "@/lib/auditEngine";
import { formatCurrency } from "@/lib/utils";
import { ShareButton } from "@/components/ShareButton";
import { SummaryFallback } from "@/components/SummaryFallback";

interface AuditResultsProps {
  auditId: string;
  teamSize: number;
  useCase: string;
  outcome: AuditOutcome;
  summary: string;
  summarySource: "loading" | "live" | "fallback";
  publicUrl: string;
}

export function AuditResults({ auditId, teamSize, useCase, outcome, summary, summarySource, publicUrl }: AuditResultsProps) {
  const isWellSpent = outcome.totalMonthlySavings < 100;

  return (
    <section className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(15,118,110,0.16),transparent_35%)]" />
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
          <CardContent className="relative grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-border bg-surface-strong p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Monthly savings</p>
              <p className="mt-3 text-4xl font-semibold tracking-tight text-foreground">{formatCurrency(outcome.totalMonthlySavings)}</p>
            </div>
            <div className="rounded-[1.5rem] border border-border bg-surface p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">Annual savings</p>
              <p className="mt-3 text-4xl font-semibold tracking-tight text-foreground">{formatCurrency(outcome.totalAnnualSavings)}</p>
            </div>
            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <ShareButton url={publicUrl} />
              {outcome.highlightCredex ? (
                <Button asChild variant="accent">
                  <a href="https://credex.com" target="_blank" rel="noreferrer">
                    Talk to Credex
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
              <div className="flex items-center gap-3 rounded-3xl border border-border bg-surface p-4 text-sm text-muted">
                <Sparkles className="h-4 w-4 animate-pulse text-accent" />
                Generating a concise executive summary...
              </div>
            ) : summarySource === "fallback" ? (
              <SummaryFallback auditId={auditId} teamSize={teamSize} useCase={useCase} outcome={outcome} />
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

      <Card>
        <CardHeader>
          <CardTitle>Per-tool breakdown</CardTitle>
          <CardDescription>Current spend, recommendation, and estimated monthly savings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {outcome.results.map((item) => (
            <div key={item.tool} className="grid gap-3 rounded-[1.5rem] border border-border bg-surface p-4 md:grid-cols-[1.2fr_1.2fr_0.6fr] md:items-center">
              <div>
                <p className="text-sm font-semibold text-foreground">{item.tool}</p>
                <p className="text-sm text-muted">Current spend: {formatCurrency(item.currentSpend)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{item.recommendation}</p>
                <p className="mt-1 text-sm leading-6 text-muted">{item.reasoning}</p>
              </div>
              <div className="text-left md:text-right">
                <p className="text-xs uppercase tracking-[0.2em] text-muted">Savings</p>
                <p className="text-lg font-semibold text-foreground">{formatCurrency(item.savings)}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  );
}