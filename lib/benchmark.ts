import type { AuditOutcome } from "@/lib/auditEngine";

/**
 * Benchmark calculation for AI spend per developer
 * Based on industry average of ~$600 per developer/month for AI tools
 * Source: Placeholder estimate from common startup tooling surveys (2024-2025)
 * This is a rough industry baseline and should be updated with real data
 */
const INDUSTRY_AVERAGE_SPEND_PER_DEV_MONTHLY = 600;

export interface BenchmarkData {
  userSpendPerDev: number;
  industryAveragePerDev: number;
  teamSize: number;
  isAboveAverage: boolean;
  savingsPerDev: number;
  interpretation: string;
}

export function calculateBenchmark(teamSize: number, outcome: AuditOutcome): BenchmarkData {
  const userSpendPerDev = outcome.totalMonthlySavings > 0
    ? Math.max(0, (outcome.totalMonthlySavings / teamSize))
    : 0;

  const isAboveAverage = userSpendPerDev > INDUSTRY_AVERAGE_SPEND_PER_DEV_MONTHLY;
  const savingsPerDev = Math.abs(INDUSTRY_AVERAGE_SPEND_PER_DEV_MONTHLY - userSpendPerDev);

  let interpretation = "";
  if (isAboveAverage) {
    interpretation = `Your team is spending $${savingsPerDev.toFixed(0)} more per developer than the industry average. There's significant opportunity to optimize.`;
  } else {
    interpretation = `Your team is spending $${savingsPerDev.toFixed(0)} less per developer than the industry average. Good job keeping costs in check!`;
  }

  return {
    userSpendPerDev: Math.round(userSpendPerDev),
    industryAveragePerDev: INDUSTRY_AVERAGE_SPEND_PER_DEV_MONTHLY,
    teamSize,
    isAboveAverage,
    savingsPerDev: Math.round(savingsPerDev),
    interpretation,
  };
}

export function formatBenchmarkSummary(benchmark: BenchmarkData): string {
  const prefix = benchmark.isAboveAverage ? "above" : "below";
  return `Your team spends $${benchmark.userSpendPerDev}/dev/month, ${prefix} the $${benchmark.industryAveragePerDev} industry average.`;
}
