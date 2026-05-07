"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface DownloadPDFProps {
  targetId: string;
  fileName: string;
}

export function DownloadPDF({ targetId, fileName }: DownloadPDFProps) {
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    const target = document.getElementById(targetId);
    if (!target) {
      toast.error("Could not find the report content to export.");
      return;
    }

    setIsExporting(true);

    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);

      const canvas = await html2canvas(target, {
        backgroundColor: "#fffaf4",
        scale: window.devicePixelRatio > 1 ? 2 : 1.5,
        useCORS: true,
      });

      const imageData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imageWidth = pageWidth - 48;
      const imageHeight = (canvas.height * imageWidth) / canvas.width;
      const renderedHeight = Math.min(imageHeight, pageHeight - 48);

      pdf.addImage(imageData, "PNG", 24, 24, imageWidth, renderedHeight, undefined, "FAST");
      pdf.save(`${fileName}.pdf`);
      toast.success("Report exported as PDF.");
    } catch {
      toast.error("Unable to export the PDF right now. Please try again.");
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
