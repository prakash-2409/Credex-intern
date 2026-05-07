import { Copy, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

interface ReferralCodeDisplayProps {
  referralCode: string | null;
}

export function ReferralCodeDisplay({ referralCode }: ReferralCodeDisplayProps) {
  if (!referralCode) {
    return null;
  }

  const referralUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/?ref=${referralCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralUrl);
    toast.success("Referral link copied!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Share & earn credits
        </CardTitle>
        <CardDescription>Invite founders to audit their spend too</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-foreground">
          When a founder completes an audit using your referral link, you both get early access to Credex credits. Share your unique link:
        </p>
        
        <div className="flex gap-2">
          <code className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm text-foreground break-all">
            {referralUrl}
          </code>
          <Button
            variant="secondary"
            size="sm"
            onClick={copyToClipboard}
            className="flex-shrink-0"
            aria-label="Copy referral link"
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>

        <div className="rounded-lg border border-accent/20 bg-accent/5 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted mb-1">Your referral code</p>
          <p className="font-mono text-sm font-bold text-accent">{referralCode}</p>
        </div>
      </CardContent>
    </Card>
  );
}
