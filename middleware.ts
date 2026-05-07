import { NextResponse, type NextRequest } from "next/server";

const WINDOW_MS = 60_000;
const LIMIT = 5;
const PROTECTED_POST_ROUTES = new Set(["/api/audit", "/api/leads"]);

interface Bucket {
  attempts: number[];
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function getIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }

  return request.ip ?? request.headers.get("x-real-ip") ?? "unknown";
}

export function middleware(request: NextRequest) {
  if (request.method !== "POST") {
    return NextResponse.next();
  }

  if (!PROTECTED_POST_ROUTES.has(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const ip = getIp(request);
  const now = Date.now();
  const bucket = buckets.get(ip);

  const attempts = (bucket?.attempts ?? []).filter((timestamp) => now - timestamp < WINDOW_MS);
  const resetAt = attempts.length ? attempts[0] + WINDOW_MS : now + WINDOW_MS;

  if (attempts.length >= LIMIT) {
    const retryAfterSeconds = Math.max(1, Math.ceil((resetAt - now) / 1000));
    console.info(`[rate-limit] blocked ip=${ip} route=${request.nextUrl.pathname} retryAfter=${retryAfterSeconds}s`);
    return NextResponse.json(
      { error: "Rate limit exceeded. Please retry shortly." },
      { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
    );
  }

  attempts.push(now);
  buckets.set(ip, { attempts, resetAt });
  console.info(`[rate-limit] accepted ip=${ip} route=${request.nextUrl.pathname} count=${attempts.length}`);

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/audit", "/api/leads"],
};