# Architecture

## Data Flow

```mermaid
flowchart LR
  A[Landing form] --> B[/api/audit/]
  B --> C[Pure auditEngine]
  C --> D[(Supabase audits)]
  B --> E[Shareable result payload]
  E --> F[/api/summarize/]
  F --> G[Anthropic messages.create]
  F --> H[Fallback summary]
  A --> I[/api/leads/]
  I --> J[(Supabase leads)]
  I --> K[Resend email]
  L[/audit/[id]/] --> D
  M[middleware rate limit] --> B
  M --> I
  M --> F
```

## Stack Justification

Next.js App Router keeps the landing page, API routes, and public share page in one deployment unit. Tailwind CSS and small shadcn-style primitives keep the UI fast and easy to adapt. Supabase is used for persistent audits and leads because the assignment requires durable storage with simple row-level policies. Resend handles transactional confirmation email without adding a separate mail service layer. Anthropic is used only for the final summary paragraph so the pricing logic remains deterministic.

## What Changes At 10k Audits Per Day

At that volume, the in-memory middleware limiter would move to a shared store such as Upstash Redis or Supabase Edge Functions rate checks. Audit writes would batch through a queue or background worker so lead submission latency stays low. Summaries would be cached by audit id to avoid repeated Anthropic calls. Public result pages would read from the database directly and the OG image route would use a cached render or a pre-generated asset.