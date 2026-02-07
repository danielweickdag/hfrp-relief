#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import Stripe from "stripe";
import { fileURLToPath } from "url";

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Stripe
const stripeKey = process.env.STRIPE_SECRET_KEY?.trim();

if (stripeKey) {
  console.error(`Initializing Stripe with key type: ${stripeKey.startsWith('rk_') ? 'Restricted' : 'Secret'}`);
} else {
  console.error("Warning: STRIPE_SECRET_KEY is missing");
}

const stripe = stripeKey
  ? new Stripe(stripeKey, {
      apiVersion: "2025-01-27.acacia" as any, // Use latest API version or ignore type check if mismatch
      typescript: true,
    })
  : null;

// Initialize MCP Server
const server = new McpServer({
  name: "stripe-mcp",
  version: "1.0.0",
});

// Helper to get doc content
async function getDocContent(filename: string): Promise<string> {
  try {
    const filePath = path.join(__dirname, "..", filename);
    return await fs.readFile(filePath, "utf-8");
  } catch (error) {
    return `Error reading ${filename}: ${error}`;
  }
}

// --- Resources ---

// 1. Best Practices Resource
server.resource("best-practices", "stripe://best-practices", async (uri) => {
  const setupGuide = await getDocContent("STRIPE_LIVE_SETUP.md");
  const migrationGuide = await getDocContent("STRIPE_MIGRATION_GUIDE.md");

  return {
    contents: [
      {
        uri: uri.href,
        text: `# Stripe Best Practices & Setup\n\n## Live Setup Guide\n${setupGuide}\n\n## Migration Guide\n${migrationGuide}`,
      },
    ],
  };
});

// 2. Schemas Resource (Simulated for common objects)
server.resource(
  "schemas",
  "stripe://schemas/{object}",
  async (uri, variables) => {
    const object = (variables as any).object;
    // In a real implementation, this might fetch from Stripe's OpenAPI spec
    // Here we provide some basic structural info or documentation links
    const schemaMap: Record<string, string> = {
      payment_intent: "https://stripe.com/docs/api/payment_intents/object",
      customer: "https://stripe.com/docs/api/customers/object",
      charge: "https://stripe.com/docs/api/charges/object",
      refund: "https://stripe.com/docs/api/refunds/object",
    };

    const url = schemaMap[object as string] || "https://stripe.com/docs/api";

    return {
      contents: [
        {
          uri: uri.href,
          text: `Schema documentation for ${object} is available at: ${url}\n\nFor detailed JSON schema, please refer to the official Stripe OpenAPI specification.`,
        },
      ],
    };
  }
);

// --- Tools ---

// 1. Get Balance
server.tool(
  "get_balance",
  "Retrieve the current Stripe balance",
  {},
  async () => {
    if (!stripe) {
      return {
        content: [
          {
            type: "text",
            text: "Stripe is not configured. Missing STRIPE_SECRET_KEY.",
          },
        ],
      };
    }

    try {
      const balance = await stripe.balance.retrieve();
      return {
        content: [{ type: "text", text: JSON.stringify(balance, null, 2) }],
      };
    } catch (error: any) {
      return {
        content: [
          { type: "text", text: `Error retrieving balance: ${error.message}` },
        ],
      };
    }
  }
);

// 2. List Recent Payment Intents
server.tool(
  "list_recent_payments",
  "List the 10 most recent payment intents",
  {
    limit: z
      .number()
      .optional()
      .describe("Number of payments to retrieve (default 10)"),
    status: z
      .enum([
        "succeeded",
        "requires_payment_method",
        "requires_confirmation",
        "canceled",
        "processing",
        "requires_action",
        "requires_capture",
      ])
      .optional()
      .describe("Filter by status"),
  },
  async ({ limit = 10, status }) => {
    if (!stripe) {
      return {
        content: [{ type: "text", text: "Stripe is not configured." }],
      };
    }

    try {
      const params: Stripe.PaymentIntentListParams = { limit };
      if (status) (params as any).status = status;

      const payments = await stripe.paymentIntents.list(params);

      const simplified = payments.data.map((pi) => ({
        id: pi.id,
        amount: pi.amount,
        currency: pi.currency,
        status: pi.status,
        created: new Date(pi.created * 1000).toISOString(),
        customer: pi.customer,
      }));

      return {
        content: [{ type: "text", text: JSON.stringify(simplified, null, 2) }],
      };
    } catch (error: any) {
      return {
        content: [
          { type: "text", text: `Error listing payments: ${error.message}` },
        ],
      };
    }
  }
);

// 3. Search Docs (Mocked/RAG stub)
server.tool(
  "search_stripe_docs",
  "Search Stripe documentation and best practices",
  {
    query: z.string().describe("Search query"),
  },
  async ({ query }) => {
    // In a real implementation, this would query a vector DB or search API
    // For now, we return a helpful message pointing to resources
    return {
      content: [
        {
          type: "text",
          text: `Searching docs for: "${query}"...\n\nResult: We recommend checking the official Stripe docs at https://stripe.com/docs/search?query=${encodeURIComponent(query)}\n\nYou can also check the local 'stripe://best-practices' resource for setup guides.`,
        },
      ],
    };
  }
);

// Start Server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Stripe MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
