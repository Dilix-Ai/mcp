// HTTP client for the Dilix API.
// Talks to api.dilix.ai by default; override with DILIX_API_BASE.

export interface DilixClientOptions {
  apiKey: string;
  baseUrl: string;
}

/**
 * MCP envelope fields that Dilix endpoints emit alongside their primary
 * data. Documented in the Dilix repo at:
 *   docs/AGENT-NATIVE-DATA-STRATEGY.md
 *   docs/DATA-MODEL-SPEC.md (McpResponse<T>)
 *
 * All optional — endpoints that haven't migrated yet just return the raw
 * data shape without these fields, and the server falls back to dumping
 * the response as one JSON block.
 */
export interface DilixEnvelope {
  _reasoning?: string;
  _sources?: Array<{
    provider: string;
    providerLabel: string;
    endpoint: string;
    citation: string;
    sourceUrl?: string;
    license: string;
    fetchedAt: string;
  }>;
  _caveats?: string[];
  _schemaVersion?: string;
  _generatedAt?: string;
}

export class DilixClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(opts: DilixClientOptions) {
    this.apiKey = opts.apiKey;
    this.baseUrl = opts.baseUrl.replace(/\/$/, "");
  }

  async call(endpoint: string, body: Record<string, unknown>): Promise<unknown> {
    const url = `${this.baseUrl}/${endpoint}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "user-agent": "@dilix/mcp",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "<no body>");
      throw new Error(
        `Dilix API error (${res.status} ${res.statusText}): ${text}`
      );
    }

    return res.json();
  }
}

/**
 * Pulls the envelope fields out of a response without mutating it.
 * Returns the envelope plus the "data portion" — the response with
 * the underscore-prefixed keys removed, suitable for showing the
 * agent the structured part of the answer.
 */
export function splitEnvelope(response: unknown): {
  envelope: DilixEnvelope;
  data: Record<string, unknown>;
} {
  if (!response || typeof response !== "object") {
    return { envelope: {}, data: {} };
  }
  const r = response as Record<string, unknown>;
  const envelope: DilixEnvelope = {
    _reasoning: typeof r._reasoning === "string" ? r._reasoning : undefined,
    _sources: Array.isArray(r._sources) ? (r._sources as DilixEnvelope["_sources"]) : undefined,
    _caveats: Array.isArray(r._caveats) ? (r._caveats as string[]) : undefined,
    _schemaVersion: typeof r._schemaVersion === "string" ? r._schemaVersion : undefined,
    _generatedAt: typeof r._generatedAt === "string" ? r._generatedAt : undefined,
  };
  const data: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(r)) {
    if (!k.startsWith("_")) data[k] = v;
  }
  return { envelope, data };
}
