# Security Policy

## Reporting a vulnerability

If you discover a security vulnerability in `@dilix/mcp`, please report it
privately. **Do not open a public GitHub issue.**

Email: **ops@dilix.ai** (subject line: `[SECURITY]`)

Include:
- A description of the vulnerability
- Steps to reproduce
- Affected versions
- Any suggested mitigation

## Disclosure timeline

- We'll acknowledge your report within **5 business days**.
- We'll work on a fix and target disclosure within **90 days** of the report.
- We'll credit you in the release notes (unless you prefer to remain anonymous).

## Scope

This policy covers the `@dilix/mcp` package itself — the open-source MCP
client that calls the Dilix API.

For vulnerabilities in the **Dilix API or hosted services**, please report
to the same address (ops@dilix.ai). Those are not covered by this
public repository but are taken just as seriously.

## What's in scope

- Code in this repository (`src/`, `dist/`)
- The published npm package `@dilix/mcp`

## What's out of scope

- Bugs that don't have a security impact (please use GitHub Issues)
- Issues in third-party dependencies (please report upstream)
- Issues in the Dilix API surface (report to ops@dilix.ai)
- Social engineering or physical attacks
