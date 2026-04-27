#!/usr/bin/env node
// @dilix/mcp — open-source MCP server for the Dilix regulatory intelligence API.
// MIT licensed. https://github.com/dilix-ai/mcp

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { DilixClient } from "./client.js";
import { TOOLS } from "./tools.js";

const VERSION = "1.0.0";

const apiKey = process.env.DILIX_API_KEY;
if (!apiKey) {
  console.error(
    "[dilix-mcp] Missing DILIX_API_KEY environment variable.\n" +
      "Get a free API key at https://dilix.ai/api-keys"
  );
  process.exit(1);
}

const client = new DilixClient({
  apiKey,
  baseUrl: process.env.DILIX_API_BASE || "https://api.dilix.ai",
});

const server = new Server(
  { name: "@dilix/mcp", version: VERSION },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: t.inputSchema,
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const tool = TOOLS.find((t) => t.name === req.params.name);
  if (!tool) {
    throw new Error(
      `Unknown tool: ${req.params.name}. Available: ${TOOLS.map((t) => t.name).join(", ")}`
    );
  }

  const args = (req.params.arguments || {}) as Record<string, unknown>;
  const result = await client.call(tool.endpoint, args);

  return {
    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
