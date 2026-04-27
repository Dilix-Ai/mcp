// HTTP client for the Dilix API.
// Talks to api.dilix.ai by default; override with DILIX_API_BASE.

export interface DilixClientOptions {
  apiKey: string;
  baseUrl: string;
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
