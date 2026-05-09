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

      // Clone the target to avoid modifying the original DOM
      const clonedTarget = target.cloneNode(true) as HTMLElement;
      clonedTarget.style.width = target.scrollWidth + "px";
      clonedTarget.style.backgroundColor = "#fffaf4";
      document.body.appendChild(clonedTarget);

      const canvas = await Promise.race([
        html2canvas(clonedTarget, {
          backgroundColor: "#fffaf4",
          scale: window.devicePixelRatio > 1 ? 1.5 : 1,
          useCORS: true,
          allowTaint: true,
          logging: false,
          windowHeight: clonedTarget.scrollHeight,
          windowWidth: clonedTarget.scrollWidth,
        }),
        new Promise<HTMLCanvasElement>((_, reject) =>
          setTimeout(() => reject(new Error("Canvas rendering timeout")), 10000)
        ),
      ]);

      // Clean up the cloned element
      document.body.removeChild(clonedTarget);

      const imageData = canvas.toDataURL("image/png", 0.95);
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imageWidth = pageWidth - 48;
      const maxImageHeight = pageHeight - 48;

      // Handle content that spans multiple pages
      const imageHeight = (canvas.height * imageWidth) / canvas.width;

      if (imageHeight <= maxImageHeight) {
        // Content fits on one page
        pdf.addImage(imageData, "PNG", 24, 24, imageWidth, imageHeight, undefined, "FAST");
      } else {
        // Content spans multiple pages - create chunks
        const canvas2D = canvas.getContext("2d");
        if (!canvas2D) throw new Error("Could not get canvas context");

        const pageCanvasHeight = (maxImageHeight * canvas.width) / imageWidth;
        let currentY = 0;

        while (currentY < canvas.height) {
          const chunkCanvas = document.createElement("canvas");
          chunkCanvas.width = canvas.width;
          chunkCanvas.height = Math.min(pageCanvasHeight, canvas.height - currentY);

          const chunkCtx = chunkCanvas.getContext("2d");
          if (!chunkCtx) throw new Error("Could not get chunk canvas context");

          chunkCtx.drawImage(canvas, 0, currentY, canvas.width, chunkCanvas.height, 0, 0, canvas.width, chunkCanvas.height);

          const chunkImageData = chunkCanvas.toDataURL("image/png", 0.95);
          const chunkHeight = (chunkCanvas.height * imageWidth) / chunkCanvas.width;

          pdf.addImage(chunkImageData, "PNG", 24, 24, imageWidth, chunkHeight, undefined, "FAST");

          currentY += pageCanvasHeight;
          if (currentY < canvas.height) {
            pdf.addPage();
          }
        }
      }

      pdf.save(`${fileName}.pdf`);
      toast.success("Report exported as PDF.");
    } catch (error) {
      console.error("PDF export error:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (errorMessage.includes("timeout")) {
        toast.error("PDF generation took too long. Try again in a moment.");
      } else if (errorMessage.includes("CORS")) {
        toast.error("Could not load all content. Check your connection and try again.");
      } else {
        toast.error("Unable to export PDF. Please try again or check your browser permissions.");
      }
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
