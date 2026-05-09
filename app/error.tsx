"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-start justify-center gap-4 px-4 py-10 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Error</p>
      <h1 className="text-3xl font-semibold tracking-tight text-foreground">Something went wrong</h1>
      <p className="max-w-xl text-sm leading-7 text-muted">
        We encountered an unexpected error. Please try again or return to the home page.
      </p>
      {error.digest && (
        <p className="mt-2 text-xs font-mono text-muted">
          Error ID: <code>{error.digest}</code>
        </p>
      )}
      <div className="mt-4 flex gap-2">
        <Button onClick={reset} variant="accent">
          Try again
        </Button>
        <Button asChild variant="secondary">
          <Link href="/">Return home</Link>
        </Button>
      </div>
    </main>
  );
}
