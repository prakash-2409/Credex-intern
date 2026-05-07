import Anthropic from "@anthropic-ai/sdk";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { buildSummaryFallback, buildSummaryPrompt } from "@/lib/summary";
import type { AuditOutcome } from "@/lib/auditEngine";
import { useCaseOptions } from "@/lib/pricingData";

const summaryRequestSchema = z.object({
  auditId: z.string().min(4),
  teamSize: z.coerce.number().int().min(1),
  useCase: z.enum(useCaseOptions),
  outcome: z.object({
    results: z.array(
      z.object({
        tool: z.string(),
        currentSpend: z.number(),
        recommendation: z.string(),
        savings: z.number(),
        reasoning: z.string(),
      }),
    ),
    totalMonthlySavings: z.number(),
    totalAnnualSavings: z.number(),
    highlightCredex: z.boolean(),
  }) satisfies z.ZodType<AuditOutcome>,
});

export async function POST(request: NextRequest) {
  let fallback = "";
  try {
    const body = await request.json();
    const parsed = summaryRequestSchema.parse(body);
    fallback = buildSummaryFallback({
      auditId: parsed.auditId,
      teamSize: parsed.teamSize,
      useCase: parsed.useCase,
      outcome: parsed.outcome,
    });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ summary: fallback, source: "fallback", reason: "missing_api_key" });
    }

    const client = new Anthropic({ apiKey });
    const prompt = buildSummaryPrompt({
      auditId: parsed.auditId,
      teamSize: parsed.teamSize,
      useCase: parsed.useCase,
      outcome: parsed.outcome,
    });

    const response = await client.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 220,
      system:
        "You write short, precise finance summaries. Never include PII. Return a single paragraph without bullets or markdown.",
      messages: [{ role: "user", content: prompt }],
    });

    const summary = response.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join(" ")
      .trim();

    if (!summary) {
      return NextResponse.json({ summary: fallback, source: "fallback", reason: "empty_ai_response" });
    }

    return NextResponse.json({ summary, source: "live" });
  } catch {
    return NextResponse.json(
      {
        summary: fallback || "AI summary is temporarily unavailable. Using deterministic fallback summary.",
        source: "fallback",
        reason: "request_failed",
      },
      { status: 200, headers: { "x-summary-fallback": "true" } },
    );
  }
}