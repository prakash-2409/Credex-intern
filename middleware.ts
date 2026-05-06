import { NextResponse, type NextRequest } from "next/server";

const WINDOW_MS = 60_000;
const LIMIT = 5;

const buckets = new Map<string, number[]>();

function getIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }

  return request.ip ?? request.headers.get("x-real-ip") ?? "unknown";
}

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const ip = getIp(request);
  const now = Date.now();
  const bucket = buckets.get(ip) ?? [];
  const recent = bucket.filter((timestamp) => now - timestamp < WINDOW_MS);

  if (recent.length >= LIMIT) {
    return NextResponse.json({ error: "Rate limit exceeded." }, { status: 429 });
  }

  recent.push(now);
  buckets.set(ip, recent);

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};