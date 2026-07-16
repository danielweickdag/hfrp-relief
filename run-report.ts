import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  console.log("Initializing MCP Client...");

  const transport = new StdioClientTransport({
    command: "dotenvx",
    args: ["run", "-f", ".env.local", "--", "instagram-engagement-mcp"],
  });

  const client = new Client({
    name: "mcp-client-cli",
    version: "1.0.0",
  });

  try {
    await client.connect(transport);
    console.log("MCP Client connected successfully");

    const result = await client.callTool("generate_engagement_report", { account: "Familyreliefproject" });
    console.log("Engagement Report:", result.structured_content);

  } catch (error) {
    console.error("Error generating engagement report:", error);
  } finally {
    await (transport as any)._process.kill();
  }
}

main();
