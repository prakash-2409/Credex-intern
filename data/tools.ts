export const useCaseOptions = ["coding", "writing", "data", "research", "mixed"] as const;

export type UseCase = (typeof useCaseOptions)[number];

export const toolKeys = [
  "cursor",
  "githubCopilot",
  "claude",
  "chatgpt",
  "anthropicApi",
  "openaiApi",
  "gemini",
  "windsurf",
] as const;

export type ToolKey = (typeof toolKeys)[number];

export type BillingKind = "subscription" | "usage";

export interface ToolPlan {
  id: string;
  label: string;
  monthlyPrice: number | null;
  billingKind: BillingKind;
  seatMode: "per-seat" | "usage";
  minSeats: number;
  maxSeats?: number;
  bestFor: UseCase[];
  sourceUrl: string;
  verifiedOn: string;
  note?: string;
}

export interface ToolDefinition {
  key: ToolKey;
  label: string;
  vendor: string;
  description: string;
  sourceUrl: string;
  verifiedOn: string;
  supportedUseCases: UseCase[];
  recommendedPlanId: string;
  plans: ToolPlan[];
}

/**
 * Placeholder pricing reference kept in sync with [PRICING_DATA.md](../PRICING_DATA.md).
 * Replace the placeholder price strings with verified values before submission.
 */
export interface PricingReferencePlan {
  plan: string;
  price: string;
  sourceUrl: string;
  verifiedOn: string;
}

export interface PricingReferenceTool {
  label: string;
  sourceUrl: string;
  verifiedOn: string;
  plans: PricingReferencePlan[];
}

const verifiedOn = "2026-05-06";
const placeholderVerifiedOn = "YYYY-MM-DD";

/**
 * Machine-readable placeholder pricing reference for manual verification.
 * This is separate from the live audit catalog so the current tests keep using the
 * verified numeric values until the placeholders are replaced.
 */
export const pricingReferenceCatalog: Record<ToolKey, PricingReferenceTool> = {
  cursor: {
    label: "Cursor",
    sourceUrl: "https://cursor.com/pricing",
    verifiedOn: placeholderVerifiedOn,
    plans: [
      { plan: "Hobby", price: "$XX.XX / month", sourceUrl: "https://cursor.com/pricing", verifiedOn: placeholderVerifiedOn },
      { plan: "Pro", price: "$XX.XX / month", sourceUrl: "https://cursor.com/pricing", verifiedOn: placeholderVerifiedOn },
      { plan: "Pro+", price: "$XX.XX / month", sourceUrl: "https://cursor.com/pricing", verifiedOn: placeholderVerifiedOn },
      { plan: "Teams", price: "$XX.XX / user / month", sourceUrl: "https://cursor.com/pricing", verifiedOn: placeholderVerifiedOn },
      { plan: "Ultra", price: "$XX.XX / month", sourceUrl: "https://cursor.com/pricing", verifiedOn: placeholderVerifiedOn },
    ],
  },
  githubCopilot: {
    label: "GitHub Copilot",
    sourceUrl: "https://github.com/features/copilot/plans",
    verifiedOn: placeholderVerifiedOn,
    plans: [
      { plan: "Free", price: "$XX.XX / month", sourceUrl: "https://github.com/features/copilot/plans", verifiedOn: placeholderVerifiedOn },
      { plan: "Pro", price: "$XX.XX / user / month", sourceUrl: "https://github.com/features/copilot/plans", verifiedOn: placeholderVerifiedOn },
      { plan: "Pro+", price: "$XX.XX / user / month", sourceUrl: "https://github.com/features/copilot/plans", verifiedOn: placeholderVerifiedOn },
      { plan: "Business", price: "$XX.XX / user / month", sourceUrl: "https://github.com/features/copilot/plans", verifiedOn: placeholderVerifiedOn },
    ],
  },
  claude: {
    label: "Claude",
    sourceUrl: "https://claude.com/pricing",
    verifiedOn: placeholderVerifiedOn,
    plans: [
      { plan: "Free", price: "$XX.XX / month", sourceUrl: "https://claude.com/pricing", verifiedOn: placeholderVerifiedOn },
      { plan: "Pro", price: "$XX.XX / month", sourceUrl: "https://claude.com/pricing", verifiedOn: placeholderVerifiedOn },
      { plan: "Max 5x", price: "$XX.XX / month", sourceUrl: "https://claude.com/pricing", verifiedOn: placeholderVerifiedOn },
      { plan: "Team Standard", price: "$XX.XX / seat / month", sourceUrl: "https://claude.com/pricing/team", verifiedOn: placeholderVerifiedOn },
      { plan: "Team Premium", price: "$XX.XX / seat / month", sourceUrl: "https://claude.com/pricing/team", verifiedOn: placeholderVerifiedOn },
    ],
  },
  chatgpt: {
    label: "ChatGPT",
    sourceUrl: "https://chatgpt.com/pricing",
    verifiedOn: placeholderVerifiedOn,
    plans: [
      { plan: "Free", price: "$XX.XX / month", sourceUrl: "https://chatgpt.com/pricing", verifiedOn: placeholderVerifiedOn },
      { plan: "Go", price: "$XX.XX / month", sourceUrl: "https://chatgpt.com/pricing", verifiedOn: placeholderVerifiedOn },
      { plan: "Plus", price: "$XX.XX / month", sourceUrl: "https://chatgpt.com/pricing", verifiedOn: placeholderVerifiedOn },
      { plan: "Pro", price: "$XX.XX / month", sourceUrl: "https://chatgpt.com/pricing", verifiedOn: placeholderVerifiedOn },
      { plan: "Business", price: "$XX.XX / user / month", sourceUrl: "https://chatgpt.com/pricing", verifiedOn: placeholderVerifiedOn },
    ],
  },
  anthropicApi: {
    label: "Anthropic API",
    sourceUrl: "https://platform.claude.com/docs/en/docs/about-claude/pricing",
    verifiedOn: placeholderVerifiedOn,
    plans: [
      { plan: "Claude Haiku 4.5", price: "$XX.XX / MTok in, $XX.XX / MTok out", sourceUrl: "https://platform.claude.com/docs/en/docs/about-claude/pricing", verifiedOn: placeholderVerifiedOn },
      { plan: "Claude Sonnet 4.6", price: "$XX.XX / MTok in, $XX.XX / MTok out", sourceUrl: "https://platform.claude.com/docs/en/docs/about-claude/pricing", verifiedOn: placeholderVerifiedOn },
      { plan: "Claude Opus 4.7", price: "$XX.XX / MTok in, $XX.XX / MTok out", sourceUrl: "https://platform.claude.com/docs/en/docs/about-claude/pricing", verifiedOn: placeholderVerifiedOn },
    ],
  },
  openaiApi: {
    label: "OpenAI API",
    sourceUrl: "https://developers.openai.com/api/docs/pricing",
    verifiedOn: placeholderVerifiedOn,
    plans: [
      { plan: "gpt-5.4-mini", price: "$XX.XX / MTok in, $XX.XX / MTok out", sourceUrl: "https://developers.openai.com/api/docs/pricing", verifiedOn: placeholderVerifiedOn },
      { plan: "gpt-5.4", price: "$XX.XX / MTok in, $XX.XX / MTok out", sourceUrl: "https://developers.openai.com/api/docs/pricing", verifiedOn: placeholderVerifiedOn },
      { plan: "gpt-5.5", price: "$XX.XX / MTok in, $XX.XX / MTok out", sourceUrl: "https://developers.openai.com/api/docs/pricing", verifiedOn: placeholderVerifiedOn },
    ],
  },
  gemini: {
    label: "Gemini",
    sourceUrl: "https://ai.google.dev/gemini-api/docs/pricing",
    verifiedOn: placeholderVerifiedOn,
    plans: [
      { plan: "Gemini 2.5 Flash-Lite", price: "$XX.XX / MTok in, $XX.XX / MTok out", sourceUrl: "https://ai.google.dev/gemini-api/docs/pricing", verifiedOn: placeholderVerifiedOn },
      { plan: "Gemini 2.5 Flash", price: "$XX.XX / MTok in, $XX.XX / MTok out", sourceUrl: "https://ai.google.dev/gemini-api/docs/pricing", verifiedOn: placeholderVerifiedOn },
      { plan: "Gemini 2.5 Pro", price: "$XX.XX / MTok in, $XX.XX / MTok out", sourceUrl: "https://ai.google.dev/gemini-api/docs/pricing", verifiedOn: placeholderVerifiedOn },
    ],
  },
  windsurf: {
    label: "Windsurf",
    sourceUrl: "https://windsurf.com/pricing",
    verifiedOn: placeholderVerifiedOn,
    plans: [
      { plan: "Free", price: "$XX.XX / month", sourceUrl: "https://windsurf.com/pricing", verifiedOn: placeholderVerifiedOn },
      { plan: "Pro", price: "$XX.XX / month", sourceUrl: "https://windsurf.com/pricing", verifiedOn: placeholderVerifiedOn },
      { plan: "Max", price: "$XX.XX / month", sourceUrl: "https://windsurf.com/pricing", verifiedOn: placeholderVerifiedOn },
      { plan: "Teams", price: "$XX.XX / user / month", sourceUrl: "https://windsurf.com/pricing", verifiedOn: placeholderVerifiedOn },
    ],
  },
};

export const toolCatalog: Record<ToolKey, ToolDefinition> = {
  cursor: {
    key: "cursor",
    label: "Cursor",
    vendor: "Anysphere",
    description: "Agentic code editor for individual and team coding workflows.",
    sourceUrl: "https://cursor.com/pricing",
    verifiedOn,
    supportedUseCases: ["coding", "mixed"],
    recommendedPlanId: "pro",
    plans: [
      {
        id: "hobby",
        label: "Hobby",
        monthlyPrice: 0,
        billingKind: "subscription",
        seatMode: "per-seat",
        minSeats: 1,
        maxSeats: 1,
        bestFor: ["coding", "mixed"],
        sourceUrl: "https://cursor.com/pricing",
        verifiedOn,
      },
      {
        id: "pro",
        label: "Pro",
        monthlyPrice: 20,
        billingKind: "subscription",
        seatMode: "per-seat",
        minSeats: 1,
        bestFor: ["coding", "mixed"],
        sourceUrl: "https://cursor.com/pricing",
        verifiedOn,
      },
      {
        id: "pro-plus",
        label: "Pro+",
        monthlyPrice: 60,
        billingKind: "subscription",
        seatMode: "per-seat",
        minSeats: 1,
        bestFor: ["coding", "mixed"],
        sourceUrl: "https://cursor.com/pricing",
        verifiedOn,
      },
      {
        id: "teams",
        label: "Teams",
        monthlyPrice: 40,
        billingKind: "subscription",
        seatMode: "per-seat",
        minSeats: 2,
        bestFor: ["coding", "mixed"],
        sourceUrl: "https://cursor.com/pricing",
        verifiedOn,
      },
      {
        id: "ultra",
        label: "Ultra",
        monthlyPrice: 200,
        billingKind: "subscription",
        seatMode: "per-seat",
        minSeats: 1,
        bestFor: ["coding", "mixed"],
        sourceUrl: "https://cursor.com/pricing",
        verifiedOn,
      },
    ],
  },
  githubCopilot: {
    key: "githubCopilot",
    label: "GitHub Copilot",
    vendor: "GitHub",
    description: "Copilot subscription plans for editors and teams.",
    sourceUrl: "https://github.com/features/copilot/plans",
    verifiedOn,
    supportedUseCases: ["coding", "mixed"],
    recommendedPlanId: "pro",
    plans: [
      {
        id: "free",
        label: "Free",
        monthlyPrice: 0,
        billingKind: "subscription",
        seatMode: "per-seat",
        minSeats: 1,
        maxSeats: 1,
        bestFor: ["coding", "mixed"],
        sourceUrl: "https://github.com/features/copilot/plans",
        verifiedOn,
      },
      {
        id: "pro",
        label: "Pro",
        monthlyPrice: 10,
        billingKind: "subscription",
        seatMode: "per-seat",
        minSeats: 1,
        bestFor: ["coding", "mixed"],
        sourceUrl: "https://github.com/features/copilot/plans",
        verifiedOn,
      },
      {
        id: "pro-plus",
        label: "Pro+",
        monthlyPrice: 39,
        billingKind: "subscription",
        seatMode: "per-seat",
        minSeats: 1,
        bestFor: ["coding", "mixed"],
        sourceUrl: "https://github.com/features/copilot/plans",
        verifiedOn,
      },
      {
        id: "business",
        label: "Business",
        monthlyPrice: 19,
        billingKind: "subscription",
        seatMode: "per-seat",
        minSeats: 2,
        bestFor: ["coding", "mixed"],
        sourceUrl: "https://github.com/features/copilot/plans",
        verifiedOn,
      },
    ],
  },
  claude: {
    key: "claude",
    label: "Claude",
    vendor: "Anthropic",
    description: "Claude app plans for writing, reasoning, and mixed work.",
    sourceUrl: "https://claude.com/pricing",
    verifiedOn,
    supportedUseCases: ["writing", "research", "mixed", "coding"],
    recommendedPlanId: "pro",
    plans: [
      {
        id: "free",
        label: "Free",
        monthlyPrice: 0,
        billingKind: "subscription",
        seatMode: "per-seat",
        minSeats: 1,
        maxSeats: 1,
        bestFor: ["writing", "research", "mixed"],
        sourceUrl: "https://claude.com/pricing",
        verifiedOn,
      },
      {
        id: "pro",
        label: "Pro",
        monthlyPrice: 20,
        billingKind: "subscription",
        seatMode: "per-seat",
        minSeats: 1,
        bestFor: ["writing", "research", "mixed", "coding"],
        sourceUrl: "https://claude.com/pricing",
        verifiedOn,
      },
      {
        id: "max-5x",
        label: "Max 5x",
        monthlyPrice: 100,
        billingKind: "subscription",
        seatMode: "per-seat",
        minSeats: 1,
        bestFor: ["writing", "research", "mixed", "coding"],
        sourceUrl: "https://claude.com/pricing",
        verifiedOn,
      },
      {
        id: "team-standard",
        label: "Team Standard",
        monthlyPrice: 25,
        billingKind: "subscription",
        seatMode: "per-seat",
        minSeats: 2,
        bestFor: ["writing", "research", "mixed", "coding"],
        sourceUrl: "https://claude.com/pricing/team",
        verifiedOn,
      },
      {
        id: "team-premium",
        label: "Team Premium",
        monthlyPrice: 125,
        billingKind: "subscription",
        seatMode: "per-seat",
        minSeats: 2,
        bestFor: ["writing", "research", "mixed", "coding"],
        sourceUrl: "https://claude.com/pricing/team",
        verifiedOn,
      },
    ],
  },
  chatgpt: {
    key: "chatgpt",
    label: "ChatGPT",
    vendor: "OpenAI",
    description: "ChatGPT subscriptions for general, writing, and research workflows.",
    sourceUrl: "https://chatgpt.com/pricing",
    verifiedOn,
    supportedUseCases: ["writing", "research", "mixed", "data"],
    recommendedPlanId: "plus",
    plans: [
      {
        id: "free",
        label: "Free",
        monthlyPrice: 0,
        billingKind: "subscription",
        seatMode: "per-seat",
        minSeats: 1,
        maxSeats: 1,
        bestFor: ["writing", "research", "mixed"],
        sourceUrl: "https://chatgpt.com/pricing",
        verifiedOn,
      },
      {
        id: "go",
        label: "Go",
        monthlyPrice: 4,
        billingKind: "subscription",
        seatMode: "per-seat",
        minSeats: 1,
        bestFor: ["writing", "research", "mixed"],
        sourceUrl: "https://chatgpt.com/pricing",
        verifiedOn,
      },
      {
        id: "plus",
        label: "Plus",
        monthlyPrice: 20,
        billingKind: "subscription",
        seatMode: "per-seat",
        minSeats: 1,
        bestFor: ["writing", "research", "mixed", "data"],
        sourceUrl: "https://chatgpt.com/pricing",
        verifiedOn,
      },
      {
        id: "pro",
        label: "Pro",
        monthlyPrice: 200,
        billingKind: "subscription",
        seatMode: "per-seat",
        minSeats: 1,
        bestFor: ["writing", "research", "mixed", "data"],
        sourceUrl: "https://chatgpt.com/pricing",
        verifiedOn,
      },
      {
        id: "business",
        label: "Business",
        monthlyPrice: 30,
        billingKind: "subscription",
        seatMode: "per-seat",
        minSeats: 2,
        bestFor: ["writing", "research", "mixed", "data"],
        sourceUrl: "https://chatgpt.com/pricing",
        verifiedOn,
      },
    ],
  },
  anthropicApi: {
    key: "anthropicApi",
    label: "Anthropic API direct",
    vendor: "Anthropic",
    description: "Direct Claude API usage priced per token and feature call.",
    sourceUrl: "https://platform.claude.com/docs/en/docs/about-claude/pricing",
    verifiedOn,
    supportedUseCases: ["coding", "writing", "research", "mixed"],
    recommendedPlanId: "sonnet-4-6",
    plans: [
      {
        id: "haiku-4-5",
        label: "Claude Haiku 4.5",
        monthlyPrice: null,
        billingKind: "usage",
        seatMode: "usage",
        minSeats: 1,
        bestFor: ["writing", "research", "mixed", "coding"],
        sourceUrl: "https://platform.claude.com/docs/en/docs/about-claude/pricing",
        verifiedOn,
        note: "$1 / MTok input, $5 / MTok output",
      },
      {
        id: "sonnet-4-6",
        label: "Claude Sonnet 4.6",
        monthlyPrice: null,
        billingKind: "usage",
        seatMode: "usage",
        minSeats: 1,
        bestFor: ["coding", "writing", "research", "mixed"],
        sourceUrl: "https://platform.claude.com/docs/en/docs/about-claude/pricing",
        verifiedOn,
        note: "$3 / MTok input, $15 / MTok output",
      },
      {
        id: "opus-4-7",
        label: "Claude Opus 4.7",
        monthlyPrice: null,
        billingKind: "usage",
        seatMode: "usage",
        minSeats: 1,
        bestFor: ["coding", "writing", "research", "mixed"],
        sourceUrl: "https://platform.claude.com/docs/en/docs/about-claude/pricing",
        verifiedOn,
        note: "$5 / MTok input, $25 / MTok output",
      },
    ],
  },
  openaiApi: {
    key: "openaiApi",
    label: "OpenAI API direct",
    vendor: "OpenAI",
    description: "Direct OpenAI API usage priced per token and tool call.",
    sourceUrl: "https://developers.openai.com/api/docs/pricing",
    verifiedOn,
    supportedUseCases: ["coding", "writing", "research", "mixed", "data"],
    recommendedPlanId: "gpt-5-4-mini",
    plans: [
      {
        id: "gpt-5-4-mini",
        label: "gpt-5.4-mini",
        monthlyPrice: null,
        billingKind: "usage",
        seatMode: "usage",
        minSeats: 1,
        bestFor: ["coding", "writing", "research", "mixed", "data"],
        sourceUrl: "https://developers.openai.com/api/docs/pricing",
        verifiedOn,
        note: "$0.75 / MTok input, $4.50 / MTok output",
      },
      {
        id: "gpt-5-4",
        label: "gpt-5.4",
        monthlyPrice: null,
        billingKind: "usage",
        seatMode: "usage",
        minSeats: 1,
        bestFor: ["coding", "writing", "research", "mixed", "data"],
        sourceUrl: "https://developers.openai.com/api/docs/pricing",
        verifiedOn,
        note: "$2.50 / MTok input, $15 / MTok output",
      },
      {
        id: "gpt-5-5",
        label: "gpt-5.5",
        monthlyPrice: null,
        billingKind: "usage",
        seatMode: "usage",
        minSeats: 1,
        bestFor: ["coding", "writing", "research", "mixed", "data"],
        sourceUrl: "https://developers.openai.com/api/docs/pricing",
        verifiedOn,
        note: "$5 / MTok input, $30 / MTok output",
      },
    ],
  },
  gemini: {
    key: "gemini",
    label: "Gemini",
    vendor: "Google",
    description: "Gemini Developer API usage for research, data, and mixed tasks.",
    sourceUrl: "https://ai.google.dev/gemini-api/docs/pricing",
    verifiedOn,
    supportedUseCases: ["data", "research", "mixed", "coding"],
    recommendedPlanId: "gemini-2-5-flash",
    plans: [
      {
        id: "gemini-2-5-flash-lite",
        label: "Gemini 2.5 Flash-Lite",
        monthlyPrice: null,
        billingKind: "usage",
        seatMode: "usage",
        minSeats: 1,
        bestFor: ["data", "research", "mixed", "coding"],
        sourceUrl: "https://ai.google.dev/gemini-api/docs/pricing",
        verifiedOn,
        note: "$0.10 / MTok input, $0.40 / MTok output",
      },
      {
        id: "gemini-2-5-flash",
        label: "Gemini 2.5 Flash",
        monthlyPrice: null,
        billingKind: "usage",
        seatMode: "usage",
        minSeats: 1,
        bestFor: ["data", "research", "mixed", "coding"],
        sourceUrl: "https://ai.google.dev/gemini-api/docs/pricing",
        verifiedOn,
        note: "$0.30 / MTok input, $2.50 / MTok output",
      },
      {
        id: "gemini-2-5-pro",
        label: "Gemini 2.5 Pro",
        monthlyPrice: null,
        billingKind: "usage",
        seatMode: "usage",
        minSeats: 1,
        bestFor: ["data", "research", "mixed", "coding"],
        sourceUrl: "https://ai.google.dev/gemini-api/docs/pricing",
        verifiedOn,
        note: "$1.25 / MTok input, $10 / MTok output",
      },
    ],
  },
  windsurf: {
    key: "windsurf",
    label: "Windsurf",
    vendor: "Cognition",
    description: "Coding-focused editor plans with team and enterprise tiers.",
    sourceUrl: "https://windsurf.com/pricing",
    verifiedOn,
    supportedUseCases: ["coding", "mixed"],
    recommendedPlanId: "pro",
    plans: [
      {
        id: "free",
        label: "Free",
        monthlyPrice: 0,
        billingKind: "subscription",
        seatMode: "per-seat",
        minSeats: 1,
        maxSeats: 1,
        bestFor: ["coding", "mixed"],
        sourceUrl: "https://windsurf.com/pricing",
        verifiedOn,
      },
      {
        id: "pro",
        label: "Pro",
        monthlyPrice: 20,
        billingKind: "subscription",
        seatMode: "per-seat",
        minSeats: 1,
        bestFor: ["coding", "mixed"],
        sourceUrl: "https://windsurf.com/pricing",
        verifiedOn,
      },
      {
        id: "max",
        label: "Max",
        monthlyPrice: 200,
        billingKind: "subscription",
        seatMode: "per-seat",
        minSeats: 1,
        bestFor: ["coding", "mixed"],
        sourceUrl: "https://windsurf.com/pricing",
        verifiedOn,
      },
      {
        id: "teams",
        label: "Teams",
        monthlyPrice: 40,
        billingKind: "subscription",
        seatMode: "per-seat",
        minSeats: 2,
        bestFor: ["coding", "mixed"],
        sourceUrl: "https://windsurf.com/pricing",
        verifiedOn,
      },
    ],
  },
};

export const toolOrder = toolKeys;

export function getToolDefinition(tool: ToolKey) {
  return toolCatalog[tool];
}

export function getPlanDefinition(tool: ToolKey, planId: string) {
  return toolCatalog[tool].plans.find((plan) => plan.id === planId) ?? toolCatalog[tool].plans[0];
}

export function getDefaultPlanId(tool: ToolKey, seats: number, useCase: UseCase) {
  const definition = toolCatalog[tool];
  const preferred = definition.plans.find((plan) => plan.id === definition.recommendedPlanId) ?? definition.plans[0];
  const matching = definition.plans.find((plan) => plan.bestFor.includes(useCase) && seats >= plan.minSeats);
  return matching?.id ?? preferred.id;
}

export function getPlanSeatCost(tool: ToolKey, planId: string, seats: number) {
  const plan = getPlanDefinition(tool, planId);
  if (plan.billingKind === "usage" || plan.monthlyPrice === null) {
    return null;
  }

  return plan.monthlyPrice * seats;
}

export function getSubscriptionPlanTotal(plan: ToolPlan, seats: number) {
  if (plan.billingKind === "usage" || plan.monthlyPrice === null) {
    return null;
  }

  return plan.monthlyPrice * seats;
}

export function listSubscriptionPlansForUseCase(useCase: UseCase) {
  return Object.values(toolCatalog)
    .flatMap((tool) => tool.plans.map((plan) => ({ tool, plan })))
    .filter(({ plan }) => plan.billingKind === "subscription" && plan.bestFor.includes(useCase));
}

export function listAllPlansForVendor(vendor: string) {
  return Object.values(toolCatalog)
    .filter((tool) => tool.vendor === vendor)
    .flatMap((tool) => tool.plans.map((plan) => ({ tool, plan })));
}