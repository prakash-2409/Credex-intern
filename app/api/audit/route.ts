import { nanoid } from "nanoid";
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { runAudit } from "@/lib/auditEngine";
import { saveAudit } from "@/lib/auditStore";
import { buildSummaryFallback } from "@/lib/summary";
import { toolOrder, useCaseOptions } from "@/lib/pricingData";

const auditRequestSchema = z.object({
  teamSize: z.coerce.number().int().min(1).max(1000),
  useCase: z.enum(useCaseOptions),
  tools: z.array(
    z.object({
      tool: z.enum(toolOrder),
      plan: z.string().min(1),
      monthlySpend: z.coerce.number().min(0),
      seats: z.coerce.number().int().min(1).max(1000),
      enabled: z.boolean().optional().default(true),
    }),
  ).min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = auditRequestSchema.parse(body);
    const auditId = nanoid(12);
    const outcome = runAudit({
      teamSize: parsed.teamSize,
      useCase: parsed.useCase,
      tools: parsed.tools,
    });

    const summaryFallback = buildSummaryFallback({
      auditId,
      teamSize: parsed.teamSize,
      useCase: parsed.useCase,
      outcome,
    });

    void saveAudit({
      id: auditId,
      teamSize: parsed.teamSize,
      useCase: parsed.useCase,
      tools: parsed.tools,
      outcome,
      summary: summaryFallback,
    });

    return NextResponse.json({
      auditId,
      publicUrl: `/audit/${auditId}`,
      teamSize: parsed.teamSize,
      useCase: parsed.useCase,
      outcome,
      summaryFallback,
    });
  } catch (error) {
    const message = error instanceof z.ZodError ? error.issues[0]?.message ?? "Invalid audit payload." : "Unable to run audit.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}