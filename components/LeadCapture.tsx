"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

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
  const isLowSaver = totalMonthlySavings < 100;

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
          company: isLowSaver ? "" : String(formData.get("company") ?? "").trim(),
          role: isLowSaver ? "" : String(formData.get("role") ?? "").trim(),
          honeypot: String(formData.get("website") ?? "").trim(),
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Unable to save your report request.");
      }

      setSubmitted(true);
      toast.success(isLowSaver ? "You are on the notify list." : "Your report request has been saved.");
      window.setTimeout(() => setIsOpen(false), 900);
    } catch (submissionError) {
      const message = submissionError instanceof Error ? submissionError.message : "Unable to save your report request.";
      setError(message);
      toast.error(message);
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isLowSaver ? "Get optimization alerts" : highlightCredex ? "Get your detailed savings report" : "Get your detailed savings report"}</DialogTitle>
          <DialogDescription>
            {isLowSaver
              ? "Your stack is already efficient. Leave your work email and we will only notify you when a meaningful new savings opportunity appears."
              : highlightCredex
              ? `You are sitting on roughly $${totalMonthlySavings.toFixed(2)} in monthly savings. Enter your work email to get the report and a free credit evaluation.`
              : "Enter your work email to get the report and a free credit evaluation. If Credex looks like a fit, we’ll follow up once with a human."}
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
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoFocus
                aria-describedby={error ? "lead-error" : undefined}
                placeholder="you@company.com"
                className="transition-all duration-200 focus-visible:ring-2 focus-visible:ring-accent"
              />
            </div>
            {!isLowSaver ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" name="company" placeholder="Credex Labs" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input id="role" name="role" placeholder="Finance, engineering, operations" />
                </div>
              </>
            ) : null}
            <p className="text-xs leading-5 text-muted">
              We&apos;ll never spam you. You&apos;ll get one email with the audit and, if it makes sense, a human follow-up about Credex credits.
            </p>
            {error ? <p id="lead-error" className="text-sm text-red-700" role="alert">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isLowSaver ? "Notify me" : "Get my report"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}