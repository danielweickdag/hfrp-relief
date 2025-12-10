import React from "react";

export const dynamic = "force-dynamic";

type HealthResponse = {
  ok: boolean;
  error?: string;
  publishableKey?: string | null;
  secrets?: {
    default?: boolean;
    test?: boolean;
    live?: boolean;
    config?: boolean;
  };
  flags?: {
    debugSignature?: boolean;
    devBypassVarPresent?: boolean;
    serverless?: boolean;
  };
  stripeAccountId?: string | null;
};

async function fetchHealth(): Promise<HealthResponse> {
  try {
    const res = await fetch("/api/admin/webhook/health", { cache: "no-store" });
    return (await res.json()) as HealthResponse;
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to fetch health";
    return { ok: false, error: message };
  }
}

export default async function WebhookHealthPage() {
  const data = await fetchHealth();

  const sections: {
    title: string;
    items: Record<string, string | number | boolean | null>;
  }[] = [
    {
      title: "Publishable Key",
      items: { publishableKey: data?.publishableKey ?? null },
    },
    {
      title: "Secrets",
      items: {
        default: data?.secrets?.default ?? null,
        test: data?.secrets?.test ?? null,
        live: data?.secrets?.live ?? null,
        config: data?.secrets?.config ?? null,
      },
    },
    {
      title: "Flags",
      items: {
        debugSignature: data?.flags?.debugSignature ?? null,
        devBypassVarPresent: data?.flags?.devBypassVarPresent ?? null,
        serverless: data?.flags?.serverless ?? null,
      },
    },
    {
      title: "Account",
      items: { stripeAccountId: data?.stripeAccountId ?? null },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 24, fontWeight: 600 }}>Webhook Health</h1>
      {!data?.ok && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            background: "#fee",
            border: "1px solid #f99",
          }}
        >
          <strong>Error:</strong> {data?.error || "Unknown error"}
        </div>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
          marginTop: 16,
        }}
      >
        {sections.map((section) => (
          <div
            key={section.title}
            style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16 }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 500 }}>{section.title}</h2>
            <ul style={{ marginTop: 8 }}>
              {Object.entries(section.items).map(([key, value]) => (
                <li key={key}>
                  <code>{key}</code>:{" "}
                  {value === null || value === undefined ? "—" : String(value)}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, fontSize: 13, color: "#555" }}>
        <p>
          This page reads from <code>/api/admin/webhook/health</code>, which
          forwards to the webhook health endpoint using the server-side token.
        </p>
        <p>
          To enable this page, set <code>ADMIN_HEALTH_TOKEN</code> in the
          environment and restart the server.
        </p>
      </div>
    </div>
  );
}
