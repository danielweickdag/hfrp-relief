import { NextResponse } from "next/server";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  const adminToken = process.env.ADMIN_HEALTH_TOKEN;
  if (!adminToken) {
    return NextResponse.json(
      {
        ok: false,
        error: "ADMIN_HEALTH_TOKEN is not configured. Set env and restart.",
      },
      { status: 500 },
    );
  }

  try {
    const hdrs = await headers();
    const host =
      hdrs.get("x-forwarded-host") || hdrs.get("host") || "localhost:3000";
    const proto = hdrs.get("x-forwarded-proto") || "http";
    const baseUrl = `${proto}://${host}`;

    const res = await fetch(`${baseUrl}/api/stripe/webhook/health`, {
      headers: {
        "X-Admin-Health-Token": adminToken,
      },
      // Ensure we always hit the server, not Next.js cache
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Proxy request failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
