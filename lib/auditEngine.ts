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

function buildKeepRecommendation(toolLabel: string, currentSpend: number, useCase: UseCase) {
  return {
    recommendation: "Keep current setup",
    savings: 0,
    reasoning: `${toolLabel} looks appropriate for a ${useCase} workflow at $${money(currentSpend)} per month, and no cheaper plan or alternative clears the savings threshold.`,
  } satisfies CandidateRecommendation;
}

function pickBestSameVendorOption(input: SelectedToolInput): CandidateRecommendation | null {
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
    reasoning: `${currentTool.label} is on ${input.plan} for ${input.seats} seat(s). ${winner.tool.label} ${winner.plan.label} is a cheaper same-vendor option at $${money(winner.candidateCost)} per month for the same seat count.`,
  };
}

function pickBestAlternativeTool(input: SelectedToolInput, useCase: UseCase) {
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
    reasoning: `${winner.tool.label} ${winner.plan.label} is the lowest-cost matched option for a ${useCase} team at $${money(winner.candidateCost)} per month.`,
  } satisfies CandidateRecommendation;
}

/**
 * Rule 1: normalize the user-selected plan against the team size.
 *
 * This catches obvious mismatches such as a single-seat plan carrying a multi-seat team
 * or a team tier being used when the lighter individual tier is cheaper for the same
 * number of seats.
 */
function evaluatePlanFit(input: SelectedToolInput) {
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
    reasoning: `${plan.label} is priced below the entered monthly spend, so the issue appears to be usage volume rather than plan selection.`,
  } satisfies CandidateRecommendation;
}

/**
 * Rule 2: find the cheapest same-vendor subscription that still supports the reported seat count.
 *
 * For team plans this often lands on an individual-tier license repeated across seats.
 * For API products this can surface a packaged subscription instead of raw usage billing.
 */
function evaluateSameVendor(input: SelectedToolInput) {
  const candidate = pickBestSameVendorOption(input);
  return candidate && candidate.savings >= MIN_SUBSTANTIAL_SAVINGS ? candidate : null;
}

/**
 * Rule 3: compare the current tool against other tools that fit the stated use case.
 *
 * This is intentionally conservative. We only recommend an alternative when the savings are
 * meaningful enough to justify workflow change and migration cost.
 */
function evaluateAlternativeTool(input: SelectedToolInput, useCase: UseCase) {
  return pickBestAlternativeTool(input, useCase);
}

/**
 * Rule 4: direct API usage is treated as retail-priced spend, so we compare it against
 * lower-friction subscription bundles from the same vendor and category.
 *
 * The point is not to estimate token volume. The rule is to detect when raw usage billing is
 * meaningfully more expensive than a packaged plan for the same workflow and seat count.
 */
function evaluateRetailVsBundle(input: SelectedToolInput, useCase: UseCase) {
  const currentTool = getToolDefinition(input.tool);
  if (currentTool.vendor !== "Anthropic" && currentTool.vendor !== "OpenAI" && input.tool !== "gemini") {
    return null;
  }

  return evaluateAlternativeTool(input, useCase);
}

function evaluateTool(input: SelectedToolInput, useCase: UseCase): AuditLineItem {
  const definition = getToolDefinition(input.tool);
  const planFit = evaluatePlanFit(input);
  const sameVendor = evaluateSameVendor(input);
  const alternative = evaluateAlternativeTool(input, useCase);
  const retailVsBundle = evaluateRetailVsBundle(input, useCase);

  const winner = sameVendor ?? alternative ?? retailVsBundle ?? planFit;

  if (!winner || winner.savings <= 0) {
    const keep = buildKeepRecommendation(definition.label, input.monthlySpend, useCase);
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
    .map((tool) => evaluateTool(tool, input.useCase));

  const totalMonthlySavings = Number(results.reduce((sum, item) => sum + item.savings, 0).toFixed(2));

  return {
    results,
    totalMonthlySavings,
    totalAnnualSavings: Number((totalMonthlySavings * 12).toFixed(2)),
    highlightCredex: totalMonthlySavings >= 500,
  };
}