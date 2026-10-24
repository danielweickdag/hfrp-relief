import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
type McpServerOptions = NonNullable<ConstructorParameters<typeof McpServer>[1]>;
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

console.log("Initializing MCP Server...");

const configPath = path.resolve(process.cwd(), "mcp-config.json");
let config: McpServerOptions;

try {
  const configData = fs.readFileSync(configPath, "utf-8");
  const parsedConfig = JSON.parse(configData);
  config = {
    name: "test-mcp",
    version: "1.0.0",
    servers: parsedConfig.mcpServers,
  };
} catch (error) {
  console.error("Error reading or parsing mcp-config.json:", error);
  process.exit(1);
}

try {
  const server = new McpServer(config);
  console.log("MCP Server initialized successfully");
} catch (error) {
  console.error("Error initializing MCP Server:", error);
}
