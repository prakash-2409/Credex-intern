# Credex AI Spend Audit

## Summary

This project is a public AI spend audit for the Credex internship assignment. It lets a visitor enter the AI tools their team uses, compares the current spend against hardcoded pricing rules, and generates a shareable result page with a lead capture flow.

## Screenshots

## Quick Start

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and set the Supabase, Anthropic, Resend, and site URL values.
3. Run `npm run dev`.
4. Open the landing page, submit an audit, and review the shareable result URL.

## Decisions

1. The audit engine is pure and deterministic so pricing decisions are reproducible.
2. The summary paragraph is the only AI-generated part of the flow.
3. Supabase stores audits and leads because the assignment requires a shareable result and a lead table.
4. The lead gate uses a honeypot and middleware rate limiting instead of heavier auth.
5. The public result page keeps personal data out of the URL and OG metadata.

## Deployed URL

## Notes

See [ARCHITECTURE.md](ARCHITECTURE.md), [TESTS.md](TESTS.md), and [PRICING_DATA.md](PRICING_DATA.md) for implementation details.This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
