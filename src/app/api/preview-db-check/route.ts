
import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { Client } from "pg";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// Temporary, protected Preview-only diagnostic.
// Remove this file after verification.

const headers = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};

function authorized(request: NextRequest, secret: string): boolean {
  const authorization = request.headers.get("authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return false;
  }

  const supplied = authorization.slice(7).trim();

  if (!supplied || !secret) return false;

  const hash = (value: string) =>
    createHash("sha256").update(value).digest();

  return timingSafeEqual(hash(supplied), hash(secret));
}

export async function GET(request: NextRequest) {
  if (
    process.env.VERCEL_ENV !== "preview" ||
    !process.env.PREVIEW_DB_CHECK_TOKEN
  ) {
    return new NextResponse(null, {
      status: 404,
      headers,
    });
  }

  if (!authorized(request, process.env.PREVIEW_DB_CHECK_TOKEN)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers }
    );
  }

  const databaseUrl = process.env.DATABASE_URL;
  const expectedHost = process.env.PREVIEW_NEON_HOST;
  const databaseHostMatches =
    Boolean(databaseUrl && expectedHost) &&
    new URL(databaseUrl!).hostname === expectedHost;

  if (!databaseUrl) {
    return NextResponse.json(
      { connected: false, error: "DATABASE_URL missing" },
      { status: 503, headers }
    );
  }

  const client = new Client({
    connectionString: databaseUrl,
    connectionTimeoutMillis: 5000,
    query_timeout: 5000,
    statement_timeout: 5000,
  });

  try {
    await client.connect();

    await client.query("BEGIN READ ONLY");

    const result = await client.query(`
      SELECT
        current_database() AS database_name,
        current_schema() AS schema_name,
        (
          SELECT COUNT(*)::integer
          FROM information_schema.tables
          WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
        ) AS existing_tables
    `);

    await client.query("COMMIT");

    const row = result.rows[0];

    return NextResponse.json(
      {
        connected: true,
        environment: "preview",
        database: row.database_name,
        schema: row.schema_name,
        existingTables: row.existing_tables,
        databaseHostMatches,
        hostnameCheckConfigured: Boolean(expectedHost),
        branch: "Requires separate Neon verification",
        checkedAt: new Date().toISOString(),
      },
      { headers }
    );
  } catch {
    await client.query("ROLLBACK").catch(() => {});

    return NextResponse.json(
      {
        connected: false,
        error: "Database connectivity check failed",
      },
      { status: 503, headers }
    );
  } finally {
    await client.end().catch(() => {});
  }
}
