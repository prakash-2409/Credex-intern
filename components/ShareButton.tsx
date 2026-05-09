"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface ShareButtonProps {
  url: string;
}

export function ShareButton({ url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      // Build full shareable URL
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
      const fullUrl = `${baseUrl}${url}`;
      
      // Try clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullUrl);
        setCopied(true);
        toast.success("Share link copied to clipboard.");
        window.setTimeout(() => setCopied(false), 1800);
      } else {
        // Fallback for older browsers: use textarea trick
        const textArea = document.createElement("textarea");
        textArea.value = fullUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        const success = document.execCommand("copy");
        document.body.removeChild(textArea);
        
        if (!success) {
          throw new Error("Copy command failed");
        }
        setCopied(true);
        toast.success("Share link copied to clipboard.");
        window.setTimeout(() => setCopied(false), 1800);
      }
    } catch (error) {
      console.error("Copy error:", error);
      toast.error("Unable to copy link. Please try again.");
    }
  }

  return (
    <Button type="button" variant="secondary" onClick={handleCopy} className="w-full sm:w-auto" aria-label="Copy share link to clipboard">
      <Link2 className="h-4 w-4" />
      {copied ? "Copied link" : "Copy share link"}
    </Button>
  );
}