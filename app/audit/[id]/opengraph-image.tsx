import { ImageResponse } from "next/og";

import { getAuditById } from "@/lib/auditStore";

export const runtime = "edge";

interface ImageProps {
  params: Promise<{ id: string }>;
}

export default async function OpenGraphImage({ params }: ImageProps) {
  const { id } = await params;
  const audit = await getAuditById(id);
  const savings = audit?.total_monthly_savings ?? 0;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: 48,
          background:
            "linear-gradient(135deg, #fffaf4 0%, #f1ede7 40%, rgba(15,118,110,0.24) 100%)",
          color: "#111318",
          fontFamily: "Inter, Arial, sans-serif",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>Credex AI Spend Audit</div>
          <h1 style={{ marginTop: 20, fontSize: 64, lineHeight: 1.05, maxWidth: 920 }}>AI savings snapshot</h1>
          <p style={{ marginTop: 20, fontSize: 28, maxWidth: 880, color: "#3f3a33" }}>
            Audit {id} shows ${savings.toFixed(2)} in estimated monthly savings.
          </p>
        </div>
        <div style={{ display: "flex", gap: 24, fontSize: 24 }}>
          <div>Hardcoded pricing rules</div>
          <div>Public result URL</div>
          <div>Credex ready</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}