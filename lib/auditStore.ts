import type { AuditOutcome } from "@/lib/auditEngine";
import { getSupabaseClient } from "@/lib/supabaseClient";

export interface StoredAudit {
  id: string;
  team_size: number;
  use_case: string;
  tools: unknown;
  results: unknown;
  total_monthly_savings: number;
  total_annual_savings: number;
  summary: string | null;
  created_at: string;
}

export interface AuditSnapshot {
  id: string;
  teamSize: number;
  useCase: string;
  tools: unknown;
  outcome: AuditOutcome;
  summary: string | null;
}

export async function saveAudit(snapshot: AuditSnapshot) {
  const client = getSupabaseClient();
  if (!client) {
    return false;
  }

  const { error } = await client.from("audits").insert({
    id: snapshot.id,
    team_size: snapshot.teamSize,
    use_case: snapshot.useCase,
    tools: snapshot.tools,
    results: snapshot.outcome.results,
    total_monthly_savings: snapshot.outcome.totalMonthlySavings,
    total_annual_savings: snapshot.outcome.totalAnnualSavings,
    summary: snapshot.summary,
  });

  return !error;
}

export async function getAuditById(id: string): Promise<StoredAudit | null> {
  const client = getSupabaseClient();
  if (!client) {
    return null;
  }

  const { data, error } = await client.from("audits").select("*").eq("id", id).maybeSingle();
  if (error || !data) {
    return null;
  }

  return data as StoredAudit;
}

export async function saveLead(
  payload: {
    email: string;
    company?: string | null;
    role?: string | null;
    auditId: string;
  },
) {
  const client = getSupabaseClient();
  if (!client) {
    return false;
  }

  const { error } = await client.from("leads").insert({
    email: payload.email,
    company: payload.company ?? null,
    role: payload.role ?? null,
    audit_id: payload.auditId,
  });

  return !error;
}