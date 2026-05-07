import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Credex AI Spend Audit",
    template: "%s | Credex AI Spend Audit",
  },
  description:
    "Audit your AI tooling spend, compare plan fit, and surface savings opportunities with a Credex-ready report.",
  openGraph: {
    title: "Credex AI Spend Audit",
    description:
      "Compare AI tool subscriptions and API spend against hardcoded pricing rules.",
    type: "website",
    images: ["/api/og?auditId=preview"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Credex AI Spend Audit",
    description:
      "Compare AI tool subscriptions and API spend against hardcoded pricing rules.",
    images: ["/api/og?auditId=preview"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${ibmPlexSans.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
