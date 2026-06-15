# Changelog

All notable changes to `@dilix/mcp` will be documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] — 2026-05-06

The demo-surface release: Dilix demo bundles are now agent-callable.

### Added

- New tool `lookup_demo` — returns the latest pre-rendered Dilix demo
  bundle for an address (3D hero/HUD images, broker headline, Dilix
  correction, public `/demo/{slug}` URL). Read-only; the nightly
  GitHub Actions cron renders new SF/Oakland multifamily listings, and
  ad-hoc renders happen via `/feasibility-3d` in a browser.
- New tool `request_demo_render` — live-renders a demo bundle on demand
  for an address that doesn't have one yet (fires the GitHub Actions
  render pipeline, returns immediately; poll `lookup_demo` ~60-90s later).
  Built for live pitches: "type any address, I'll render it."
- New edge functions `lookup-demo` and `trigger-demo-render` back the
  tools. Read from the new `demo_runs` table (envelope-shaped,
  agent_runs-compatible).

### Changed

- Default `DILIX_API_BASE` now points at the live Dilix API endpoint.
  The previous default (`api.dilix.ai`) was never provisioned in DNS,
  so fresh installs failed to connect; the new default resolves out of
  the box. Override with `DILIX_API_BASE` as before.

### Why this matters

A technical co-founder watching the Dilix pitch can paste any address
into Claude Code/Cursor, get the rendered counterfactual back via
`lookup_demo`, and see the data-layer + closed-loop architecture in
action — without touching the dilix.ai UI. Proof that the product is
agent-native, not just a webapp.

## [1.1.0] — 2026-05-03

The grounding upgrade: Dilix endpoints now emit a structured
envelope (`_reasoning`, `_sources`, `_caveats`, `_schemaVersion`)
alongside their primary data shape. v1.1.0 surfaces that envelope
to MCP host models as separate content blocks instead of dumping
the raw JSON.

### Added

- `splitEnvelope()` exported from `client.ts` — pulls envelope
  fields out of a Dilix API response without mutating it. Returns
  `{ envelope, data }` where `data` is the response with the
  underscore-prefixed keys removed.
- `DilixEnvelope` type — the shape every Dilix MCP-callable
  endpoint emits when it has migrated to the envelope contract.

### Changed

- Tool-call response shape: now returns up to 5 content blocks per
  tool call:
  1. `_reasoning` — short, quotable narrative for the host model
  2. `_caveats` (when present) — soft warnings the agent should
     pass through to the user
  3. Sources — formatted citation list with URLs where available
  4. Structured data — full JSON payload minus envelope keys
  5. Schema version + generated-at — for behavior pinning
- Legacy endpoints that don't yet emit the envelope keep working
  unchanged — they return as a single content block with the
  original JSON dump.

### Why

Without the envelope surfacing, every fact Dilix returned was one
parse step away from being usable by an agent. Host models (Claude,
Cursor, custom orchestrators) couldn't ground their answers in a
literal narrative + cited sources, so they'd risk inventing
municipal code sections or rent caps.

With v1.1.0, the host model gets the narrative as the primary text
and citations as a structured second block — directly quotable,
directly verifiable.

## [1.0.0] — 2026-04-XX

### Added

- Initial public release.
- Tools: `analyze_zoning`, `get_entitlement_roadmap`,
  `lookup_property`, `find_opportunities`, `scan_portfolio`,
  `analyze_deal`, `market_rates`, `watch_parcel`, `track_permit`,
  `source_outbound_leads`.
- `DilixClient` HTTP wrapper with API-key auth.
- `DILIX_API_BASE` override for local/dev API URLs.
