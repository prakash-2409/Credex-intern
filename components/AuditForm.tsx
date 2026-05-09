"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight, Loader2, Plus } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { toolCatalog, toolOrder, type ToolKey, useCaseOptions, type UseCase, getDefaultPlanId, getPlanDefinition } from "@/lib/pricingData";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

const localStorageKey = "credex-audit-form";

const selectedToolSchema = z.object({
  tool: z.enum(toolOrder),
  enabled: z.boolean(),
  plan: z.string().min(1),
  monthlySpend: z.coerce.number().min(0),
  seats: z.coerce.number().int().min(1).max(1000),
});

const auditFormSchema = z.object({
  teamSize: z.coerce.number().int().min(1).max(1000),
  useCase: z.enum(useCaseOptions),
  tools: z.array(selectedToolSchema).length(toolOrder.length),
});

export type AuditFormValues = z.infer<typeof auditFormSchema>;

export interface AuditResponse {
  auditId: string;
  publicUrl: string;
  teamSize: number;
  useCase: UseCase;
  outcome: {
    results: Array<{
      tool: string;
      currentSpend: number;
      recommendation: string;
      savings: number;
      reasoning: string;
    }>;
    totalMonthlySavings: number;
    totalAnnualSavings: number;
    highlightCredex: boolean;
  };
  summaryFallback: string;
}

interface AuditFormProps {
  onSubmitted: (response: AuditResponse) => void;
  isSubmitting?: boolean;
}

function buildDefaultValues(): AuditFormValues {
  const defaultUseCase: UseCase = "coding";
  return {
    teamSize: 3,
    useCase: defaultUseCase,
    tools: toolOrder.map((tool, index) => {
      const plan = getDefaultPlanId(tool, 1, defaultUseCase);
      const planDefinition = getPlanDefinition(tool, plan);
      const seats = tool === "anthropicApi" || tool === "openaiApi" || tool === "gemini" ? 1 : index === 0 ? 2 : 1;
      return {
        tool,
        enabled: index < 4,
        plan,
        seats,
        monthlySpend: planDefinition.monthlyPrice ? planDefinition.monthlyPrice * seats : 0,
      };
    }),
  };
}

export function AuditForm({ onSubmitted }: AuditFormProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const refParam = searchParams?.get("ref");

  const form = useForm<AuditFormValues>({
    resolver: zodResolver(auditFormSchema) as unknown as Resolver<AuditFormValues>,
    defaultValues: buildDefaultValues(),
    mode: "onChange",
  });

  const { watch, setValue, handleSubmit, reset, register, formState } = form;
  const formValues = watch();

  useEffect(() => {
    const raw = window.localStorage.getItem(localStorageKey);
    if (raw) {
      try {
        reset(JSON.parse(raw) as AuditFormValues);
      } catch {
        window.localStorage.removeItem(localStorageKey);
      }
    }
    setIsHydrated(true);
  }, [reset]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(localStorageKey, JSON.stringify(formValues));
  }, [formValues, isHydrated]);

  const selectedTools = useMemo(() => formValues.tools.filter((tool) => tool.enabled), [formValues.tools]);

  function updatePlan(toolIndex: number, planId: string) {
    const tool = formValues.tools[toolIndex];
    const nextPlan = getPlanDefinition(tool.tool, planId);
    const nextSpend = nextPlan.monthlyPrice ? nextPlan.monthlyPrice * tool.seats : tool.monthlySpend;
    setValue(`tools.${toolIndex}.plan`, planId, { shouldDirty: true, shouldValidate: true });
    setValue(`tools.${toolIndex}.monthlySpend`, nextSpend, { shouldDirty: true, shouldValidate: true });
  }

  function updateSeats(toolIndex: number, seats: number) {
    const tool = formValues.tools[toolIndex];
    const plan = getPlanDefinition(tool.tool, tool.plan);
    const nextSpend = plan.monthlyPrice ? plan.monthlyPrice * seats : tool.monthlySpend;
    setValue(`tools.${toolIndex}.seats`, seats, { shouldDirty: true, shouldValidate: true });
    setValue(`tools.${toolIndex}.monthlySpend`, nextSpend, { shouldDirty: true, shouldValidate: true });
  }

  const onSubmit = handleSubmit(async (values) => {
    const activeTools = values.tools.filter((tool) => tool.enabled);
    if (!activeTools.length) {
      setError("Select at least one tool to audit.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamSize: values.teamSize,
          useCase: values.useCase,
          tools: activeTools,
          ref: refParam ?? undefined,
        }),
      });

      const payload = (await response.json()) as AuditResponse & { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to run audit.");
      }

      onSubmitted(payload);
    } catch (submissionError) {
      const message = submissionError instanceof Error ? submissionError.message : "Unable to run audit.";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <Card id="audit-form" className="relative overflow-hidden">
      <CardHeader className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Audit your spend</CardTitle>
            <CardDescription>Save your progress locally and submit when you are ready.</CardDescription>
          </div>
          <div className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-muted">
            Step {step} of 2
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={onSubmit}>
          {step === 1 ? (
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="teamSize">Team size</Label>
                <Input id="teamSize" type="number" min={1} aria-describedby="team-size-hint" {...register("teamSize")} />
                <p id="team-size-hint" className="text-xs text-muted">Use total seats that actively use these tools each month.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="useCase">Primary use case</Label>
                <Select id="useCase" {...register("useCase")}>
                  {useCaseOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="md:col-span-2 flex justify-end">
                <Button type="button" variant="accent" onClick={() => setStep(2)}>
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted">Selected tools: {selectedTools.length}</p>
                <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              </div>

              <div className="space-y-4">
                {formValues.tools.map((toolEntry, toolIndex) => {
                  const definition = toolCatalog[toolEntry.tool as ToolKey];

                  return (
                    <div key={toolEntry.tool} className="rounded-[1.75rem] border border-border bg-surface p-4">
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <input
                              id={`tool-enabled-${toolIndex}`}
                              type="checkbox"
                              checked={toolEntry.enabled}
                              onChange={(event) => setValue(`tools.${toolIndex}.enabled`, event.target.checked, { shouldDirty: true })}
                              className="h-5 w-5 rounded border-border text-accent focus:ring-accent"
                              aria-label={`Enable ${definition.label}`}
                            />
                            <div>
                              <label htmlFor={`tool-enabled-${toolIndex}`} className="font-semibold text-foreground cursor-pointer">{definition.label}</label>
                              <p className="text-sm text-muted">{definition.description}</p>
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                          {definition.vendor}
                        </span>
                      </div>

                      <div className="mt-4 grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label>Plan</Label>
                          <Select value={toolEntry.plan} onChange={(event) => updatePlan(toolIndex, event.target.value)}>
                            {definition.plans.map((plan) => (
                              <option key={plan.id} value={plan.id}>
                                {plan.label}
                              </option>
                            ))}
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Seats</Label>
                          <Input
                            type="number"
                            min={1}
                            value={toolEntry.seats}
                            onChange={(event) => updateSeats(toolIndex, Number(event.target.value) || 1)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Monthly spend</Label>
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={toolEntry.monthlySpend}
                            onChange={(event) =>
                              setValue(`tools.${toolIndex}.monthlySpend`, Number(event.target.value) || 0, { shouldDirty: true, shouldValidate: true })
                            }
                          />
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-muted">
                        Suggested plan price: {definition.plans.find((plan) => plan.id === toolEntry.plan)?.monthlyPrice !== null ? formatCurrency(
                          (definition.plans.find((plan) => plan.id === toolEntry.plan)?.monthlyPrice ?? 0) * toolEntry.seats,
                        ) : definition.plans.find((plan) => plan.id === toolEntry.plan)?.note ?? "Usage-based pricing"}
                      </p>
                    </div>
                  );
                })}
              </div>

              {error ? <p className="text-sm text-red-700">{error}</p> : null}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button type="button" variant="secondary" onClick={() => reset(buildDefaultValues())}>
                  <Plus className="h-4 w-4" />
                  Reset form
                </Button>
                <Button type="submit" variant="accent" disabled={isSubmitting || !formState.isValid}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {isSubmitting ? "Running audit..." : "Run audit"}
                </Button>
              </div>
              {isSubmitting ? (
                <div className="rounded-2xl border border-border bg-surface-strong p-3">
                  <div className="h-2 w-2/3 rounded-full bg-gradient-to-r from-accent/10 via-accent/50 to-accent/10 animate-shimmer" />
                  <p className="mt-2 text-xs text-muted">Checking plans, seat counts, and alternative options.</p>
                </div>
              ) : null}
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}