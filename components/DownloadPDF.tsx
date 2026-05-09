"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { AuditOutcome } from "@/lib/auditEngine";

interface DownloadPDFProps {
  auditId: string;
  teamSize: number;
  useCase: string;
  outcome: AuditOutcome;
  summary: string;
  publicUrl: string;
  fileName: string;
}

export function DownloadPDF({ auditId, teamSize, useCase, outcome, summary, publicUrl, fileName }: DownloadPDFProps) {
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    setIsExporting(true);

    try {
      const { jsPDF } = await import("jspdf");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a4",
      });

      const margin = 40;
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const contentWidth = pageWidth - margin * 2;
      const lineHeight = 16;

      const addText = (text: string, x: number, y: number, options: { size?: number; color?: string; bold?: boolean; maxWidth?: number } = {}) => {
        const { size = 11, color = "#0f172a", bold = false, maxWidth = contentWidth } = options;
        pdf.setFont("helvetica", bold ? "bold" : "normal");
        pdf.setFontSize(size);
        pdf.setTextColor(color);
        const lines = pdf.splitTextToSize(text, maxWidth) as string[];
        let nextY = y;
        for (const line of lines) {
          if (nextY > pageHeight - margin) {
            pdf.addPage();
            nextY = margin;
          }
          pdf.text(line, x, nextY);
          nextY += lineHeight;
        }
        return nextY;
      };

      let cursorY = margin;
      cursorY = addText("Credex AI Spend Audit", margin, cursorY, { size: 20, bold: true });
      cursorY = addText(`Audit ${auditId}`, margin, cursorY + 4, { size: 11, color: "#475569" });
      cursorY = addText(`Team size: ${teamSize}  |  Use case: ${useCase}`, margin, cursorY + 2, { size: 11, color: "#475569" });
      cursorY = addText(`Public URL: ${publicUrl}`, margin, cursorY + 2, { size: 10, color: "#2563eb" });

      cursorY += 10;
      cursorY = addText(`Monthly savings: ${formatCurrency(outcome.totalMonthlySavings)}`, margin, cursorY, { size: 18, bold: true, color: "#1d4ed8" });
      cursorY = addText(`Annual savings: ${formatCurrency(outcome.totalAnnualSavings)}`, margin, cursorY + 2, { size: 13, bold: true });

      const currentSpend = outcome.results.reduce((sum, item) => sum + item.currentSpend, 0);
      const savingsRate = currentSpend > 0 ? Math.min(100, (outcome.totalMonthlySavings / currentSpend) * 100) : 0;
      cursorY = addText(`Savings rate: ${formatPercent(savingsRate)}`, margin, cursorY + 4, { size: 11, color: "#475569" });
      cursorY = addText("Summary", margin, cursorY + 12, { size: 15, bold: true });
      cursorY = addText(summary, margin, cursorY + 4, { size: 11, maxWidth: contentWidth });

      cursorY = addText("Per-tool breakdown", margin, cursorY + 12, { size: 15, bold: true });

      outcome.results.forEach((item) => {
        cursorY = addText(item.tool, margin, cursorY + 8, { size: 12, bold: true });
        cursorY = addText(`Current spend: ${formatCurrency(item.currentSpend)}`, margin, cursorY, { size: 10, color: "#475569" });
        cursorY = addText(`Recommendation: ${item.recommendation}`, margin, cursorY, { size: 10, bold: true });
        cursorY = addText(`Reasoning: ${item.reasoning}`, margin, cursorY, { size: 10, maxWidth: contentWidth });
        cursorY = addText(`Savings: ${formatCurrency(item.savings)}`, margin, cursorY, { size: 10, color: item.savings > 0 ? "#047857" : "#64748b" });

        if (cursorY > pageHeight - margin - 60) {
          pdf.addPage();
          cursorY = margin;
        }
      });

      pdf.save(`${fileName}.pdf`);
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("PDF export failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={handleExport}
      disabled={isExporting}
      aria-label="Download report as PDF"
      className="w-full sm:w-auto"
    >
      {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      {isExporting ? "Preparing PDF..." : "Download report as PDF"}
    </Button>
  );
}
