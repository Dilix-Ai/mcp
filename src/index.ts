#!/usr/bin/env node
// @dilix/mcp — open-source MCP server for the Dilix regulatory intelligence API.
// MIT licensed. https://github.com/dilix-ai/mcp

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import { DilixClient, splitEnvelope, type DilixEnvelope } from "./client.js";
import { TOOLS } from "./tools.js";

const VERSION = "1.2.0";

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
  // Default points at the live Dilix API (Supabase Edge Functions). A
  // branded api.dilix.ai custom domain can front this later; until then
  // the raw functions URL is what actually resolves. Override with
  // DILIX_API_BASE for self-hosted or staging.
  baseUrl:
    process.env.DILIX_API_BASE ||
    "https://tztkiptepktvuwlygqeq.supabase.co/functions/v1",
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
  const { envelope, data } = splitEnvelope(result);

  // The MCP content array can carry multiple text blocks. Putting
  // the envelope's narrative + sources first makes it easy for the
  // host model to ground its answer without fishing through the
  // structured payload.
  const content: Array<{ type: "text"; text: string }> = [];

  if (envelope._reasoning) {
    content.push({
      type: "text",
      text: `${envelope._reasoning}`,
    });
  }

  if (envelope._caveats && envelope._caveats.length > 0) {
    content.push({
      type: "text",
      text: `⚠ Caveats:\n- ${envelope._caveats.join("\n- ")}`,
    });
  }

  if (envelope._sources && envelope._sources.length > 0) {
    content.push({
      type: "text",
      text: formatSources(envelope._sources),
    });
  }

  // Always include the structured data — agents that need the full
  // shape can parse this. If the response had no envelope at all
  // (legacy endpoint), this is the only block returned.
  content.push({
    type: "text",
    text: JSON.stringify(envelope._reasoning ? data : result, null, 2),
  });

  if (envelope._schemaVersion) {
    content.push({
      type: "text",
      text: `Schema: ${envelope._schemaVersion}${envelope._generatedAt ? ` · generated ${envelope._generatedAt}` : ""}`,
    });
  }

  return { content };
});

function formatSources(sources: NonNullable<DilixEnvelope["_sources"]>): string {
  const lines = ["Sources:"];
  for (const s of sources) {
    const url = s.sourceUrl ? ` — ${s.sourceUrl}` : "";
    lines.push(`- ${s.providerLabel}: ${s.citation}${url}`);
  }
  return lines.join("\n");
}

const transport = new StdioServerTransport();
await server.connect(transport);
