import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Widget Demo | Credex AI Spend Audit",
  description: "Embed the AI Spend Audit widget on any site with a single script tag.",
};

const embedSnippet = `<script
  src="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://credex.example"}/widget.js"
  data-cta-text="Audit your AI spend"
  async
></script>`;

export default function WidgetPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <section className="space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted">Embeddable widget</p>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">Add an audit button to any founder-facing site</h1>
            <p className="max-w-2xl text-base leading-7 text-muted">
              The widget injects a small button, opens a scoped modal, and runs the same audit flow through the public API. No iframe, no host-page style leakage.
            </p>
          </div>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Live demo</CardTitle>
              <CardDescription>Preview how the trigger and modal feel on a typical blog layout.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-[1.5rem] border border-border bg-surface p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-muted">AI Spend Audit widget</p>
                <p className="mt-2 max-w-xl text-sm leading-6 text-foreground">
                  A button that opens a lightweight modal for founders to estimate AI spend, benchmark per developer, and share the result.
                </p>
                <button type="button" className="mt-4 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">
                  Audit your AI spend
                </button>
              </div>
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-6 lg:sticky lg:top-6">
          <Card>
            <CardHeader>
              <CardTitle>Embed code</CardTitle>
              <CardDescription>Copy this into any page before the closing body tag.</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto rounded-2xl border border-border bg-surface p-4 text-sm leading-6 text-foreground">
                <code>{embedSnippet}</code>
              </pre>
              <p className="mt-4 text-sm leading-6 text-muted">
                Customize the button text with <span className="font-semibold text-foreground">data-cta-text</span>.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How it works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted">
              <p>1. Drop in the script tag.</p>
              <p>2. The widget mounts a floating button with a scoped modal.</p>
              <p>3. Audit data posts to the existing API routes and returns results in the modal.</p>
              <p>4. The host page keeps its styles because the widget uses a shadow root.</p>
              <Link href="/" className="inline-flex font-semibold text-accent hover:underline">
                Try the full app instead
              </Link>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
