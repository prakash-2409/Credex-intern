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
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Share link copied to clipboard.");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Unable to copy link. Please copy it manually.");
    }
  }

  return (
    <Button type="button" variant="secondary" onClick={handleCopy} className="w-full sm:w-auto" aria-label="Copy share link to clipboard">
      <Link2 className="h-4 w-4" />
      {copied ? "Copied link" : "Copy share link"}
    </Button>
  );
}