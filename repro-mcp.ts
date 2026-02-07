import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

console.log("Initializing MCP Server...");
try {
  const server = new McpServer({
    name: "test-mcp",
    version: "1.0.0",
  });
  console.log("MCP Server initialized successfully");
} catch (error) {
  console.error("Error initializing MCP Server:", error);
}
