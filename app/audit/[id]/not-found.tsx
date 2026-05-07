import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function AuditNotFound() {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-start justify-center gap-4 px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">404</p>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">This audit link no longer exists</h1>
      <p className="max-w-xl text-sm leading-7 text-muted">
        The audit ID may be invalid or expired. Run a fresh audit to generate a new shareable URL.
      </p>
      <Button asChild variant="accent">
        <Link href="/">Back to audit tool</Link>
      </Button>
    </main>
  );
}
