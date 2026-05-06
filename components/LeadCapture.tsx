"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LeadCaptureProps {
  auditId: string;
  highlightCredex: boolean;
  totalMonthlySavings: number;
  open?: boolean;
}

export function LeadCapture({ auditId, highlightCredex, totalMonthlySavings, open = false }: LeadCaptureProps) {
  const [isOpen, setIsOpen] = useState(open);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auditId,
          email: String(formData.get("email") ?? "").trim(),
          company: String(formData.get("company") ?? "").trim(),
          role: String(formData.get("role") ?? "").trim(),
          honeypot: String(formData.get("website") ?? "").trim(),
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to save your report request.");
      }

      setSubmitted(true);
      window.setTimeout(() => setIsOpen(false), 900);
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to save your report request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await handleSubmit(new FormData(event.currentTarget));
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{highlightCredex ? "Get the full report" : "Send me the full report"}</DialogTitle>
          <DialogDescription>
            {highlightCredex
              ? `You are sitting on roughly $${totalMonthlySavings.toFixed(2)} in monthly savings. Credex may want to reach out.`
              : "We will email a copy of the audit and let you know if the economics change later."}
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="rounded-3xl border border-border bg-surface-strong p-4 text-sm leading-6 text-foreground">
            Thanks. Your report request has been saved.
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <input type="hidden" name="website" value="" aria-hidden="true" tabIndex={-1} autoComplete="off" className="hidden" />
            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <Input id="email" name="email" type="email" required placeholder="you@company.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input id="company" name="company" placeholder="Credex Labs" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" name="role" placeholder="Finance, engineering, operations" />
            </div>
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Send report"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}