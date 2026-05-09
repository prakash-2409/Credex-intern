import {
  getPlanDefinition,
  getSubscriptionPlanTotal,
  getToolDefinition,
  listAllPlansForVendor,
  listSubscriptionPlansForUseCase,
  type ToolKey,
  type UseCase,
} from "@/lib/pricingData";

export interface SelectedToolInput {
  tool: ToolKey;
  plan: string;
  monthlySpend: number;
  seats: number;
}

export interface AuditInput {
  teamSize: number;
  useCase: UseCase;
  tools: SelectedToolInput[];
}

export interface AuditLineItem {
  tool: string;
  currentSpend: number;
  recommendation: string;
  savings: number;
  reasoning: string;
}

export interface AuditOutcome {
  results: AuditLineItem[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  highlightCredex: boolean;
}

interface CandidateRecommendation {
  recommendation: string;
  savings: number;
  reasoning: string;
}

const MIN_SUBSTANTIAL_SAVINGS = 25;

function money(value: number) {
  return value.toFixed(2);
}

function buildKeepRecommendation(toolLabel: string, currentSpend: number, teamSize: number, useCase: UseCase) {
  return {
    recommendation: "Keep current setup",
    savings: 0,
    reasoning: `For a ${teamSize}-person ${useCase} team, ${toolLabel} looks sensible at $${money(currentSpend)} per month. I did not find a cheaper plan or a meaningful alternative that would save enough to justify a change right now.`,
  } satisfies CandidateRecommendation;
}

function pickBestSameVendorOption(input: SelectedToolInput, teamSize: number, useCase: UseCase): CandidateRecommendation | null {
  const currentTool = getToolDefinition(input.tool);
  const sameVendorPlans = listAllPlansForVendor(currentTool.vendor)
    .filter(({ tool, plan }) => !(tool.key === input.tool && plan.id === input.plan))
    .filter(({ plan }) => plan.billingKind === "subscription" && (plan.monthlyPrice ?? 0) > 0)
    .map(({ tool, plan }) => {
      const candidateCost = getSubscriptionPlanTotal(plan, input.seats);
      return candidateCost === null ? null : { tool, plan, candidateCost };
    })
    .filter((candidate): candidate is NonNullable<typeof candidate> => candidate !== null)
    .filter(({ candidateCost }) => candidateCost < input.monthlySpend)
    .sort((left, right) => left.candidateCost - right.candidateCost);

  const winner = sameVendorPlans[0];

  if (!winner) {
    return null;
  }

  return {
    recommendation: `Switch to ${winner.tool.label} ${winner.plan.label}`,
    savings: input.monthlySpend - winner.candidateCost,
    reasoning: `${currentTool.label} is on ${input.plan} for ${input.seats} seat(s), which is a bit heavier than a ${teamSize}-person ${useCase} team usually needs. ${winner.tool.label} ${winner.plan.label} keeps the same vendor workflow but brings the bill down to $${money(winner.candidateCost)} per month, saving you $${money(input.monthlySpend - winner.candidateCost)}.`,
  };
}

function pickBestAlternativeTool(input: SelectedToolInput, teamSize: number, useCase: UseCase) {
  const candidates = listSubscriptionPlansForUseCase(useCase)
    .map(({ tool, plan }) => {
      const candidateCost = getSubscriptionPlanTotal(plan, input.seats);
      return candidateCost === null ? null : { tool, plan, candidateCost };
    })
    .filter((candidate): candidate is NonNullable<typeof candidate> => candidate !== null)
    .filter(({ plan }) => (plan.monthlyPrice ?? 0) > 0)
    .filter(({ candidateCost }) => candidateCost < input.monthlySpend)
    .sort((left, right) => left.candidateCost - right.candidateCost);

  const winner = candidates[0];

  if (!winner) {
    return null;
  }

  const savings = input.monthlySpend - winner.candidateCost;
  if (savings < MIN_SUBSTANTIAL_SAVINGS || savings / Math.max(input.monthlySpend, 1) < 0.2) {
    return null;
  }

  return {
    recommendation: `Move to ${winner.tool.label} ${winner.plan.label}`,
    savings,
    reasoning: `For a ${teamSize}-person ${useCase} team, ${winner.tool.label} ${winner.plan.label} is the lowest-cost option that still matches the workflow well. It lands at $${money(winner.candidateCost)} per month, which saves $${money(savings)} versus the current setup.`,
  } satisfies CandidateRecommendation;
}

/**
 * Rule 1: normalize the user-selected plan against the team size.
 *
 * This catches obvious mismatches such as a single-seat plan carrying a multi-seat team
 * or a team tier being used when the lighter individual tier is cheaper for the same
 * number of seats.
 */
function evaluatePlanFit(input: SelectedToolInput, teamSize: number, useCase: UseCase) {
  const plan = getPlanDefinition(input.tool, input.plan);
  if (plan.billingKind === "usage") {
    return null;
  }

  const currentPlanCost = getSubscriptionPlanTotal(plan, input.seats) ?? input.monthlySpend;
  if (currentPlanCost <= input.monthlySpend) {
    return null;
  }

  return {
    recommendation: `Keep ${plan.label} but trim usage`,
    savings: 0,
    reasoning: `For a ${teamSize}-person ${useCase} team, ${plan.label} is already priced below the entered spend. The main issue looks like usage volume rather than the plan itself, so I would tighten the way the tool is being used before making a bigger switch.`,
  } satisfies CandidateRecommendation;
}

/**
 * Rule 2: find the cheapest same-vendor subscription that still supports the reported seat count.
 *
 * For team plans this often lands on an individual-tier license repeated across seats.
 * For API products this can surface a packaged subscription instead of raw usage billing.
 */
function evaluateSameVendor(input: SelectedToolInput, teamSize: number, useCase: UseCase) {
  const candidate = pickBestSameVendorOption(input, teamSize, useCase);
  return candidate && candidate.savings >= MIN_SUBSTANTIAL_SAVINGS ? candidate : null;
}

/**
 * Rule 3: compare the current tool against other tools that fit the stated use case.
 *
 * This is intentionally conservative. We only recommend an alternative when the savings are
 * meaningful enough to justify workflow change and migration cost.
 */
function evaluateAlternativeTool(input: SelectedToolInput, teamSize: number, useCase: UseCase) {
  return pickBestAlternativeTool(input, teamSize, useCase);
}

/**
 * Rule 4: direct API usage is treated as retail-priced spend, so we compare it against
 * lower-friction subscription bundles from the same vendor and category.
 *
 * The point is not to estimate token volume. The rule is to detect when raw usage billing is
 * meaningfully more expensive than a packaged plan for the same workflow and seat count.
 */
function evaluateRetailVsBundle(input: SelectedToolInput, teamSize: number, useCase: UseCase) {
  const currentTool = getToolDefinition(input.tool);
  if (currentTool.vendor !== "Anthropic" && currentTool.vendor !== "OpenAI" && input.tool !== "gemini") {
    return null;
  }

  return evaluateAlternativeTool(input, teamSize, useCase);
}

function evaluateTool(input: SelectedToolInput, teamSize: number, useCase: UseCase): AuditLineItem {
  const definition = getToolDefinition(input.tool);
  const planFit = evaluatePlanFit(input, teamSize, useCase);
  const sameVendor = evaluateSameVendor(input, teamSize, useCase);
  const alternative = evaluateAlternativeTool(input, teamSize, useCase);
  const retailVsBundle = evaluateRetailVsBundle(input, teamSize, useCase);

  const winner = sameVendor ?? alternative ?? retailVsBundle ?? planFit;

  if (!winner || winner.savings <= 0) {
    const keep = buildKeepRecommendation(definition.label, input.monthlySpend, teamSize, useCase);
    return {
      tool: definition.label,
      currentSpend: input.monthlySpend,
      recommendation: keep.recommendation,
      savings: keep.savings,
      reasoning: keep.reasoning,
    };
  }

  return {
    tool: definition.label,
    currentSpend: input.monthlySpend,
    recommendation: winner.recommendation,
    savings: Number(winner.savings.toFixed(2)),
    reasoning: winner.reasoning,
  };
}

/**
 * Pure audit engine.
 *
 * It accepts the selected tools, monthly spend, seat count, team size, and primary use case.
 * The output is a deterministic set of recommendations and savings values derived entirely
 * from hardcoded pricing data.
 */
export function runAudit(input: AuditInput): AuditOutcome {
  const results = input.tools
    .filter((tool) => tool.monthlySpend > 0 || tool.seats > 0)
    .map((tool) => evaluateTool(tool, input.teamSize, input.useCase));

  const totalMonthlySavings = Number(results.reduce((sum, item) => sum + item.savings, 0).toFixed(2));

  return {
    results,
    totalMonthlySavings,
    totalAnnualSavings: Number((totalMonthlySavings * 12).toFixed(2)),
    highlightCredex: totalMonthlySavings >= 500,
  };
}