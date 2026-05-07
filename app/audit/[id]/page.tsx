import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AuditResults } from "@/components/AuditResults";
import { LeadCapture } from "@/components/LeadCapture";
import { ReferralCodeDisplay } from "@/components/ReferralCodeDisplay";
import { getAuditById } from "@/lib/auditStore";
import { buildSummaryFallback } from "@/lib/summary";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const audit = await getAuditById(id);

  if (!audit) {
    return {
      title: "Audit not found | Credex AI Spend Audit",
    };
  }

  return {
    title: `Audit ${id} | Credex AI Spend Audit`,
    description: `Estimated monthly savings of $${audit.total_monthly_savings.toFixed(2)} for a ${audit.team_size}-person ${audit.use_case} team.`,
    openGraph: {
      title: `Audit ${id} | Credex AI Spend Audit`,
      description: `Estimated monthly savings of $${audit.total_monthly_savings.toFixed(2)} for a ${audit.team_size}-person ${audit.use_case} team.`,
      images: [`/api/og?auditId=${id}`],
    },
    twitter: {
      card: "summary_large_image",
      title: `Audit ${id} | Credex AI Spend Audit`,
      description: `Estimated monthly savings of $${audit.total_monthly_savings.toFixed(2)} for a ${audit.team_size}-person ${audit.use_case} team.`,
      images: [`/api/og?auditId=${id}`],
    },
  };
}

export default async function AuditPage({ params }: PageProps) {
  const { id } = await params;
  const audit = await getAuditById(id);

  if (!audit) {
    notFound();
  }

  const outcome = {
    results: Array.isArray(audit.results) ? audit.results : [],
    totalMonthlySavings: Number(audit.total_monthly_savings),
    totalAnnualSavings: Number(audit.total_annual_savings),
    highlightCredex: Number(audit.total_monthly_savings) >= 500,
  };

  const summary = audit.summary ?? buildSummaryFallback({
    auditId: audit.id,
    teamSize: audit.team_size,
    useCase: audit.use_case,
    outcome,
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 rounded-[1.75rem] border border-border bg-surface p-6 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Shareable audit</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground">Audit {audit.id}</h1>
        <p className="mt-2 text-sm leading-6 text-muted">Public result page with company and email stripped out.</p>
      </div>
      <AuditResults
        auditId={audit.id}
        teamSize={audit.team_size}
        useCase={audit.use_case}
        outcome={outcome}
        summary={summary}
        summarySource={audit.summary ? "live" : "fallback"}
        publicUrl={`/audit/${audit.id}`}
      />
      <ReferralCodeDisplay referralCode={audit.referral_code} />
      <div className="mt-6">
        <LeadCapture
          auditId={audit.id}
          highlightCredex={outcome.highlightCredex}
          totalMonthlySavings={outcome.totalMonthlySavings}
          open={false}
        />
      </div>
    </div>
  );
}