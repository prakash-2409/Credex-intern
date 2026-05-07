import { ImageResponse } from "@vercel/og";
import { type NextRequest } from "next/server";

import { getAuditById } from "@/lib/auditStore";

export const runtime = "edge";

function parseAuditId(request: NextRequest) {
  const value = request.nextUrl.searchParams.get("auditId");
  return value && value.trim().length >= 6 ? value.trim() : null;
}

export async function GET(request: NextRequest) {
  const auditId = parseAuditId(request);
  const audit = auditId ? await getAuditById(auditId) : null;
  const savings = audit?.total_monthly_savings ?? 0;
  const headline = audit
    ? `AI Spend Audit: Save $${savings.toFixed(2)}/month on AI tools`
    : "AI Spend Audit: Find savings across your AI stack";
  const subtitle = audit ? `Audit ID: ${audit.id}` : "Deterministic pricing rules, shareable public reports.";

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: 56,
          background:
            "linear-gradient(140deg, rgba(255,250,244,1) 0%, rgba(245,239,230,1) 50%, rgba(15,118,110,0.24) 100%)",
          color: "#111318",
          fontFamily: "IBM Plex Sans, Arial, sans-serif",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <p style={{ margin: 0, fontSize: 26, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600 }}>
            Credex AI Spend Audit
          </p>
          <h1 style={{ margin: 0, fontSize: 64, lineHeight: 1.08, fontWeight: 700, maxWidth: 980 }}>
            {headline}
          </h1>
          <p style={{ margin: 0, fontSize: 28, color: "#3b3f48" }}>{subtitle}</p>
        </div>
        <div style={{ display: "flex", gap: 24, fontSize: 24, color: "#2a2f37" }}>
          <span>Deterministic pricing rules</span>
          <span>Shareable result link</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "cache-control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      },
    },
  );
}
