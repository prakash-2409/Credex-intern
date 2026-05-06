import type { AuditOutcome } from "@/lib/auditEngine";

export interface SummaryInput {
  auditId: string;
  teamSize: number;
  useCase: string;
  outcome: AuditOutcome;
}

export function buildSummaryPrompt({ auditId, teamSize, useCase, outcome }: SummaryInput) {
  const lines = outcome.results
    .map((item) => `- ${item.tool}: ${item.recommendation} (${item.savings.toFixed(2)} savings)`)
    .join("\n");

  return [
    `You are summarizing a deterministic AI spend audit for audit ${auditId}.`,
    "Use only the numbers and recommendations provided below.",
    "Do not mention email addresses, company names, or any personal data.",
    "Write one concise paragraph of 3 to 5 sentences for a finance-minded buyer.",
    `Team size: ${teamSize}. Primary use case: ${useCase}.`,
    `Total monthly savings: $${outcome.totalMonthlySavings.toFixed(2)}.`,
    `Total annual savings: $${outcome.totalAnnualSavings.toFixed(2)}.`,
    `Credex flag: ${outcome.highlightCredex ? "yes" : "no"}.`,
    "Per-tool actions:",
    lines || "- No selected tools.",
  ].join("\n");
}

export function buildSummaryFallback({ teamSize, useCase, outcome }: SummaryInput) {
  if (outcome.totalMonthlySavings <= 0) {
    return `Your current tool mix looks efficient for a ${teamSize}-person ${useCase} team. We did not find a material monthly savings opportunity, so the current setup is likely close to optimal.`;
  }

  const topRecommendation = [...outcome.results].sort((a, b) => b.savings - a.savings)[0];
  const lead = topRecommendation
    ? `${topRecommendation.tool} has the largest opportunity at $${topRecommendation.savings.toFixed(2)} per month by ${topRecommendation.recommendation.toLowerCase()}.`
    : "One or more tools have savings opportunities.";

  return `A ${teamSize}-person ${useCase} team could save about $${outcome.totalMonthlySavings.toFixed(2)} per month and $${outcome.totalAnnualSavings.toFixed(2)} per year. ${lead} The rest of the portfolio is either aligned or only offers marginal upside, so this is a good place to tighten spend without changing workflows too aggressively.`;
}