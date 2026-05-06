import { describe, expect, it } from "vitest";

import { runAudit } from "@/lib/auditEngine";

describe("runAudit edge cases", () => {
  it("returns an empty result set for an empty tool list", () => {
    const result = runAudit({
      teamSize: 1,
      useCase: "coding",
      tools: [],
    });

    expect(result.results).toHaveLength(0);
    expect(result.totalMonthlySavings).toBe(0);
  });

  it("keeps zero spend entries neutral", () => {
    const result = runAudit({
      teamSize: 1,
      useCase: "data",
      tools: [{ tool: "gemini", plan: "gemini-2-5-flash-lite", monthlySpend: 0, seats: 1 }],
    });

    expect(result.results[0]?.savings).toBe(0);
    expect(result.highlightCredex).toBe(false);
  });
});