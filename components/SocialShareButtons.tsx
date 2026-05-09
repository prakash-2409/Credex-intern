"use client";

import { Linkedin, Twitter } from "lucide-react";

import { Button } from "@/components/ui/button";

interface SocialShareButtonsProps {
  url: string;
  savings: number;
}

export function SocialShareButtons({ url, savings }: SocialShareButtonsProps) {
  const shareUrl = typeof window !== "undefined" && url.startsWith("http") ? url : typeof window !== "undefined" ? `${window.location.origin}${url}` : url;
  const formattedSavings = savings.toFixed(2);

  const xMessage = encodeURIComponent(
    `I just audited my team’s AI spend and found $${formattedSavings}/month in savings with @CredexAudit. Try it: ${shareUrl}`,
  );
  const linkedInMessage = encodeURIComponent(
    `I just audited my team’s AI spend and found $${formattedSavings}/month in savings with Credex. It was a useful way to sanity-check our AI tooling budget: ${shareUrl}`,
  );

  const xHref = `https://twitter.com/intent/tweet?text=${xMessage}`;
  const linkedInHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&mini=true&summary=${linkedInMessage}`;

  return (
    <div className="flex flex-wrap gap-3">
      <Button asChild type="button" variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100">
        <a href={xHref} target="_blank" rel="noreferrer" aria-label="Share audit on X">
          <Twitter className="h-4 w-4" />
          Share on X
        </a>
      </Button>
      <Button asChild type="button" variant="outline" className="border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100">
        <a href={linkedInHref} target="_blank" rel="noreferrer" aria-label="Share audit on LinkedIn">
          <Linkedin className="h-4 w-4" />
          Share on LinkedIn
        </a>
      </Button>
    </div>
  );
}
