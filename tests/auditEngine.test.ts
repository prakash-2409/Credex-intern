import { describe, expect, it } from "vitest";

import { runAudit } from "@/lib/auditEngine";

describe("runAudit", () => {
  it("keeps a single Cursor Pro user on the optimal plan", () => {
    const result = runAudit({
      teamSize: 1,
      useCase: "coding",
      tools: [{ tool: "cursor", plan: "pro", monthlySpend: 20, seats: 1 }],
    });

    expect(result.results[0]?.recommendation).toBe("Keep current setup");
    expect(result.results[0]?.savings).toBe(0);
    expect(result.highlightCredex).toBe(false);
  });

  it("recommends Cursor Pro for a two-person Cursor Business setup", () => {
    const result = runAudit({
      teamSize: 2,
      useCase: "coding",
      tools: [{ tool: "cursor", plan: "teams", monthlySpend: 80, seats: 2 }],
    });

    expect(result.results[0]?.recommendation).toContain("Cursor Pro");
    expect(result.results[0]?.savings).toBe(40);
  });

  it("finds a cheaper alternative for Claude Team with three users", () => {
    const result = runAudit({
      teamSize: 3,
      useCase: "writing",
      tools: [{ tool: "claude", plan: "team-standard", monthlySpend: 75, seats: 3 }],
    });

    expect(result.results[0]?.recommendation).not.toBe("Keep current setup");
    expect(result.results[0]?.savings).toBeGreaterThan(0);
  });

  it("flags direct API usage when a bundled plan is materially cheaper", () => {
    const result = runAudit({
      teamSize: 1,
      useCase: "mixed",
      tools: [{ tool: "openaiApi", plan: "gpt-5-5", monthlySpend: 600, seats: 1 }],
    });

    expect(result.results[0]?.recommendation).not.toBe("Keep current setup");
    expect(result.results[0]?.savings).toBeGreaterThan(0);
  });

  it("flags Credex when the monthly savings exceed 500 dollars", () => {
    const result = runAudit({
      teamSize: 8,
      useCase: "mixed",
      tools: [
        { tool: "cursor", plan: "ultra", monthlySpend: 1200, seats: 8 },
        { tool: "claude", plan: "team-premium", monthlySpend: 900, seats: 8 },
      ],
    });

    expect(result.totalMonthlySavings).toBeGreaterThan(500);
    expect(result.highlightCredex).toBe(true);
  });
});