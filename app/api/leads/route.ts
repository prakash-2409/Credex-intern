import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getAuditById, saveLead } from "@/lib/auditStore";
import { getResendClient } from "@/lib/resendClient";

const leadSchema = z.object({
  email: z.string().email(),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  role: z.string().trim().max(120).optional().or(z.literal("")),
  auditId: z.string().min(6),
  honeypot: z.string().optional().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = leadSchema.parse(body);

    if (parsed.honeypot && parsed.honeypot.trim().length > 0) {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const audit = await getAuditById(parsed.auditId);
    const stored = await saveLead({
      email: parsed.email,
      company: parsed.company || null,
      role: parsed.role || null,
      auditId: parsed.auditId,
    });

    const resend = getResendClient();
    if (resend) {
      const shouldMentionCredex = (audit?.total_monthly_savings ?? 0) >= 500;
      await resend.emails.send({
        from: "Credex Audit <no-reply@credex.app>",
        to: parsed.email,
        subject: "Your Credex AI spend audit",
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111318">
            <h2>Your AI spend audit is saved</h2>
            <p>Thanks for requesting the report for audit <strong>${parsed.auditId}</strong>.</p>
            <p>Total monthly savings identified: <strong>$${(audit?.total_monthly_savings ?? 0).toFixed(2)}</strong>.</p>
            <p>${shouldMentionCredex ? "Credex may reach out because the savings opportunity is material." : "We will only follow up if the economics change or if you asked for more detail."}</p>
            <p><a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://credex.example"}/audit/${parsed.auditId}">Open your audit</a></p>
          </div>
        `,
      });
    }

    return NextResponse.json({ ok: stored });
  } catch (error) {
    const message = error instanceof z.ZodError ? error.issues[0]?.message ?? "Invalid lead payload." : "Unable to save lead.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}