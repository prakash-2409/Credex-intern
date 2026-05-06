"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  url: string;
}

export function ShareButton({ url }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <Button type="button" variant="secondary" onClick={handleCopy} className="w-full sm:w-auto">
      <Link2 className="h-4 w-4" />
      {copied ? "Copied link" : "Copy share link"}
    </Button>
  );
}