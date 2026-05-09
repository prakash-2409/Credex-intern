import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { BenchmarkData } from "@/lib/benchmark";
import { formatCurrency } from "@/lib/utils";

interface BenchmarkDisplayProps {
  benchmark: BenchmarkData;
}

export function BenchmarkDisplay({ benchmark }: BenchmarkDisplayProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {benchmark.isAboveAverage ? (
            <>
              <TrendingUp className="h-5 w-5 text-orange-500" />
              Above average spend
            </>
          ) : (
            <>
              <TrendingDown className="h-5 w-5 text-accent" />
              Below average spend
            </>
          )}
        </CardTitle>
        <CardDescription>Compared to industry benchmark</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm transition-transform duration-200 motion-safe:hover:-translate-y-0.5">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Your spend/dev/month</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{formatCurrency(benchmark.userSpendPerDev)}</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm transition-transform duration-200 motion-safe:hover:-translate-y-0.5">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Industry average</p>
            <p className="mt-2 text-2xl font-bold text-foreground">{formatCurrency(benchmark.industryAveragePerDev)}</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm transition-transform duration-200 motion-safe:hover:-translate-y-0.5">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Difference</p>
            <p className={`mt-2 text-2xl font-bold ${benchmark.isAboveAverage ? "text-orange-500" : "text-accent"}`}>
              {formatCurrency(benchmark.savingsPerDev)}
            </p>
          </div>
        </div>
        <div className={`rounded-2xl border p-4 ${benchmark.isAboveAverage ? "border-orange-200 bg-orange-50/80" : "border-accent/20 bg-accent-soft/60"}`}>
          <p className="text-sm leading-6 text-foreground">{benchmark.interpretation}</p>
          <p className="mt-2 text-xs text-muted">Industry average based on startup tooling surveys (~$600/dev/month for AI tools).</p>
        </div>
      </CardContent>
    </Card>
  );
}
