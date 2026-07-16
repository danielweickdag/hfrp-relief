import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  console.log("Running instagram-engagement-mcp...");

  const transport = new StdioClientTransport({
    command: "dotenvx",
    args: ["run", "-f", ".env.local", "--", "instagram-engagement-mcp", "--help"],
  });

  transport.onmessage = (message) => {
    console.log("Received:", message);
  };

  transport.onclose = () => {
    console.log("Connection closed");
  };

  await transport.connect();
}

main();
