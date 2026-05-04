# Dilix MCP

> The open-source MCP server for Dilix — the regulatory intelligence layer for real estate AI agents.

[![npm version](https://img.shields.io/npm/v/@dilix/mcp.svg)](https://www.npmjs.com/package/@dilix/mcp)
[![CI](https://github.com/dilix-ai/mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/dilix-ai/mcp/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/dilix-ai/mcp.svg?style=social)](https://github.com/dilix-ai/mcp)

Add Dilix to any MCP-compatible AI agent in 30 seconds. Get zoning,
permits, entitlement roadmaps, state legislation flags, and deal scoring
for any US property — surfaced as 10 callable tools.

> **Heads up:** This package is the open-source **client**. The Dilix API
> (data + intelligence) requires an API key — get one free at
> [dilix.ai/api-keys](https://dilix.ai/api-keys).

---

## Why Dilix exists

Real estate is one of the largest opaque asset classes in the world.
Owners close on properties unaware of regulatory shifts that compress NOI.
Flippers burn months of carry on permits that never land. Brokers waste
deal cycles chasing entitlements that won't clear.

Dilix is the data layer that catches it all — every permit, zoning change,
and bill across 16 cities and 11 states, going national. For humans, and
the AI agents reshaping the industry.

This MCP package gives those agents direct access.

---

## Install

```bash
npm install -g @dilix/mcp
```

Or run on demand without installing:

```bash
npx @dilix/mcp
```

---

## Get an API key

Free tier: 100 calls/month. Sign up at [dilix.ai/api-keys](https://dilix.ai/api-keys).

Set it as an environment variable:

```bash
export DILIX_API_KEY="your-key-here"
```

---

## Wire it into Claude Desktop

Add to `~/.claude/claude_desktop_config.json` (Mac) or
`%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "dilix": {
      "command": "npx",
      "args": ["-y", "@dilix/mcp"],
      "env": {
        "DILIX_API_KEY": "your-key-here"
      }
    }
  }
}
```

Restart Claude Desktop. The Dilix tools will appear in the MCP tool palette.

---

## Wire it into Cursor / Continue / custom agents

Any MCP-compatible host. Spawn the binary with `DILIX_API_KEY` in the
environment. Speaks standard MCP over stdio.

---

## Available tools

| Tool | What it does |
|------|--------------|
| `analyze_zoning` | Zoning + HCD compliance + state-law flags for any address |
| `get_entitlement_roadmap` | Full approval pathway with timelines, fees, risks |
| `lookup_property` | Property records, valuation, sale history (US) |
| `find_opportunities` | Scan a city for SB-9, SB-79, AB-2011, AB-130 candidates |
| `scan_portfolio` | Bulk compliance + opportunity scan across up to 50 properties |
| `watch_parcel` | Hourly autonomous monitoring with email alerts |
| `track_permit` | Real-time permit status + status-change notifications |
| `analyze_deal` | Full deal score: zoning + property + financials + verdict |
| `source_deals` | Source candidate properties matching investment criteria |
| `get_market_rates` | Live SOFR + 10Y Treasury for cap-rate underwriting |

Full schemas: [docs/tools.md](./docs/tools.md) (coming soon — for now, MCP
hosts will expose them automatically once connected).

---

## Example: Claude analyzing a deal

```
User: Should I pursue 555 California St for a residential conversion?

Claude (with Dilix MCP):
  1. analyze_zoning(city="San Francisco", address="555 California St")
     → C-3-O zoning · Builder's Remedy active · AB-2011 eligible
  2. get_entitlement_roadmap(...)
     → Ministerial pathway · CEQA exempt · 6-9 mo timeline · $X est. fees
  3. lookup_property(address1="555 California St", address2="SF, CA 94104")
     → Built 1969 · 350K sqft · last sold 2018 · $X assessed

Verdict: Strong candidate. Pursue. Submit SB-330 vesting application
within 30 days to lock current rules.
```

---

## Grounding — every tool returns reasoning + sources

Starting in v1.1.0, every Dilix MCP tool surfaces a structured envelope
to the host model:

- **`_reasoning`** — plain-English narrative the agent can quote verbatim
  to the user. Composed by Dilix from structured fields, not extrapolated.
  Eliminates the most common failure mode (host model invents a cap rate /
  code section / date that wasn't in the response).
- **`_sources`** — citations the agent can surface as "Source: X" links.
  Includes provider, citation text, and a verifiable URL where available.
  Pulled from real authorities: ATTOM, DataSF, FEMA, HUD, NY Fed, FRED,
  Cal. Civ. Code, municipal codes, etc.
- **`_caveats`** — soft warnings the agent should pass through (e.g.
  "no parcel-level zoning available for this address — answers are
  city-level only").
- **`_schemaVersion`** — pin behavior across upgrades.

The MCP server splits these into separate content blocks so the host
model receives the narrative as the primary text and citations as a
structured second block. Agents that want the raw payload still get it
as a JSON block.

Endpoints currently emitting the envelope: `analyze_deal`, `analyze_zoning`,
`get_entitlement_roadmap`, `lookup_property`, `market_rates`,
`find_opportunities`, `scan_portfolio`. Others fall back to the legacy
single-block JSON response.

---

## Configuration

| Env var | Required? | Default | Description |
|---------|-----------|---------|-------------|
| `DILIX_API_KEY` | Yes | — | Get from [dilix.ai/api-keys](https://dilix.ai/api-keys) |
| `DILIX_API_BASE` | No | `https://api.dilix.ai` | Override for self-hosted or staging |

---

## Pricing

The MCP client is free and open-source (MIT). The hosted Dilix API is
usage-based:

- **Free tier:** 100 calls/month
- **Pro:** $49/month — 5,000 calls
- **Agentic:** $499/month — 50,000 calls + portfolio monitoring + webhooks
- **Enterprise:** custom — email ops@dilix.ai

See [dilix.ai/pricing](https://dilix.ai/pricing) for the live tiers.

---

## Why open source?

Same playbook as Anthropic, Vercel, Supabase, Resend: open the developer
surface, charge for the data + infrastructure behind it.

We open-sourced the MCP client because:
- Devs deserve to read the code that runs in their agent
- The MCP spec is open (Anthropic, late 2024) — closing the client would be hypocritical
- The client is just the "USB cable." Our actual value is the data + scoring + intelligence behind the API

---

## Project status

Maintained best-effort by a solo founder. See [STATUS.md](./STATUS.md) for
expectations and how to help.

For commercial support, custom integrations, or enterprise SLAs:
**ops@dilix.ai**

---

## Security

Found a vulnerability? See [SECURITY.md](./SECURITY.md) — please email
**ops@dilix.ai** (subject: `[SECURITY]`) rather than opening a public issue.

---

## Contributing

PRs welcome. Small and focused win. Large refactors usually don't.

```bash
git clone https://github.com/dilix-ai/mcp.git
cd mcp
npm install
npm run build
npm run dev
```

---

## License

MIT. See [LICENSE](./LICENSE).

"Dilix" is a trademark of Ownership Theory LLC. The MIT license grants
rights to the source code, not to the brand.

---

## Links

- 🌐 Website: [dilix.ai](https://dilix.ai)
- 🔑 Get an API key: [dilix.ai/api-keys](https://dilix.ai/api-keys)
- 📖 Docs (full): [dilix.ai/agents](https://dilix.ai/agents)
- 📰 Weekly Briefing: [dilix.ai/briefings](https://dilix.ai/briefings)
- 📧 Contact: ops@dilix.ai
