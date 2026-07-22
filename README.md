# quantakrypto MCP gateway

**A hosted, OAuth-gated, multi-tenant gateway that puts the [`@quantakrypto/mcp`](https://github.com/quantakrypto/pqc-tools/tree/main/packages/mcp) server on the public internet** — so an AI coding agent (Claude Code, Cursor, VS Code, …) can use quantakrypto's post-quantum advisory and analysis tools over authenticated HTTP, with nothing to install.

Live at **`https://mcp.quantakrypto.com/mcp`**. Open source so you can audit exactly how authentication and data handling work — or run your own.

It's a single [Next.js](https://nextjs.org) app: the sign-in UI, the OAuth 2.1 provider, the discovery metadata, and the authenticated `/mcp` endpoint all run in **one process**. [Better Auth](https://better-auth.com) is the OAuth provider (Google + GitHub + email) and issues **30-day access tokens**; the MCP endpoint runs behind `withMcpAuth` in the same process, so there's no separate resource server to operate.

```
  AI coding agent ──OAuth 2.1 (PKCE)──►  /api/auth/*        Better Auth: authorize / token
                  ◄──.well-known/*──────  discovery metadata (RFC 8414 / RFC 9728)
                  ──Bearer <30d token>─►  /mcp               withMcpAuth → MCP tools (JSON-RPC 2.0)
```

## Connect to the hosted endpoint

```bash
claude mcp add --transport http quantakrypto https://mcp.quantakrypto.com/mcp
```

On first use the client reads `/.well-known/oauth-protected-resource`, discovers the OAuth provider, runs the PKCE flow (opening the sign-in page in your browser), and stores the 30-day token. Cursor and VS Code: add an HTTP MCP server at the same URL — they run the same flow. Tokens expire after 30 days; sign in again to refresh.

## What tools you get (and what you don't)

The gateway is multi-tenant and has **no user repo to scan and no business reading server paths or probing arbitrary hosts**, so it exposes only the **HTTP-safe** subset of the MCP tools — the advisory/knowledge tools and the **content-based** analysis tools that take submitted content rather than a filesystem path:

| Available over HTTP | Withheld over HTTP |
|---|---|
| `verify_fix`, `check_dependency`, `triage_findings`, `remediate_findings`, plus the advisory/knowledge tools | `scan_path`, `inventory_crypto`, `generate_cbom`, `plan_migration`, `probe_endpoint` |

The withheld tools read the local filesystem or reach out over the network — for those, run the MCP **locally** instead (`npx @quantakrypto/mcp`), where it can see your repo. This is the same posture the `@quantakrypto/mcp` package enforces for its own HTTP transport (see [`THREAT-MODEL.md` §4.3](https://github.com/quantakrypto/pqc-tools/blob/main/docs/THREAT-MODEL.md)); the denylist lives in [`src/lib/mcp-server.ts`](src/lib/mcp-server.ts).

Transport is **Streamable HTTP, JSON request/response** — each request body is one JSON-RPC 2.0 message; notifications (no `id`) return `202`. The tools are synchronous, so the SSE streaming half isn't needed yet.

## Authentication

[Better Auth](https://better-auth.com) with its `mcp` plugin is the OAuth 2.1 / OIDC provider ([`src/lib/auth.ts`](src/lib/auth.ts)):

- **Identity** — Google and GitHub social sign-in (each registered only when its credentials are present, so the gateway boots on email alone), plus email/password with **mandatory verification** (magic-link style) delivered via [Resend](https://resend.com).
- **Tokens** — access tokens expire in **30 days**; refresh tokens live 90 days and rotate; authorization codes expire in 10 minutes.
- **Discovery** — the `mcp` plugin publishes the OAuth metadata wired at `src/app/.well-known/oauth-authorization-server` and `oauth-protected-resource`, so clients configure themselves.
- **Shared accounts** — in production the session cookie is scoped to `.quantakrypto.com`, so an account on [quantakrypto.com](https://quantakrypto.com) and the gateway are one and the same.

Accounts, OAuth clients, and tokens live in **your own Postgres** — Better Auth manages the schema.

## Run it yourself

Quick version (full detail — TLS, OAuth app setup, the security checklist — is in [**RUNBOOK.md**](RUNBOOK.md)):

```bash
npm install                     # pulls @quantakrypto/mcp (^0.5.0, published with provenance)
docker compose up -d postgres   # or point DATABASE_URL at your own instance
cp .env.example .env            # fill in BETTER_AUTH_URL/SECRET, DATABASE_URL, OAuth creds, Resend
npx @better-auth/cli migrate    # create the Better Auth tables
npm run build && npm run start  # listens on :3333 — put HTTPS in front (mandatory)
```

`.env` needs, at minimum: `BETTER_AUTH_URL` (public origin), `BETTER_AUTH_SECRET` (`openssl rand -base64 32`), `DATABASE_URL`, and — for social sign-in and email — the Google/GitHub OAuth credentials and a Resend key with a verified sender domain. See [`.env.example`](.env.example).

> **HTTPS is mandatory.** The access tokens are Bearer credentials; never expose `:3333` directly. Terminate TLS at a reverse proxy (Caddy/nginx) mapping `mcp.quantakrypto.com → 127.0.0.1:3333`.

### Scripts

| Script | What |
|---|---|
| `npm run dev` | Next.js dev server on `:3333` |
| `npm run build` / `npm run start` | Production build / serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run auth:generate` | Emit the Better Auth schema SQL for inspection |
| `npm run auth:migrate` | Apply the Better Auth schema |

## Repository layout

```
src/app/
  mcp/route.ts                 the authenticated /mcp endpoint (withMcpAuth → MCP server)
  .well-known/…                OAuth 2.1 discovery metadata (RFC 8414 / 9728)
  api/auth/[...all]/route.ts   Better Auth handler (authorize, token, callbacks)
  sign-in/ , page.tsx          sign-in UI + landing page
src/lib/
  auth.ts                      Better Auth config (providers, 30-day tokens, MCP plugin)
  mcp-server.ts                the shared MCP server + the HTTP-safe tool allowlist
  email.ts                     Resend verification / magic-link mail
docker-compose.yml             local Postgres
.github/workflows/deploy.yml   deploy pipeline
RUNBOOK.md                     full setup, deploy, and security operations
```

## Security posture

- **HTTPS-only**, Bearer tokens, tokens stored as hashes (not in the clear).
- **No filesystem or arbitrary-network tools** exposed to untrusted callers (the denylist above).
- Small attack surface; accounts/tokens in your own Postgres, not internet-exposed.
- Verify it yourself — that's the point of shipping it open source. See [RUNBOOK.md → Security checklist](RUNBOOK.md) and the [pqc-tools threat model](https://github.com/quantakrypto/pqc-tools/blob/main/docs/THREAT-MODEL.md).

## Related

- **[quantakrypto/pqc-tools](https://github.com/quantakrypto/pqc-tools)** — the open-source toolkit this gateway serves (scanner, MCP, conformance battery, CI action). Apache-2.0.
- **[`@quantakrypto/mcp`](https://github.com/quantakrypto/pqc-tools/tree/main/packages/mcp)** — the MCP server itself, and its `HOSTING.md` for the hosting design this gateway implements.
- **[quantakrypto.com](https://quantakrypto.com)** — post-quantum audits, certification, tooling, training, and research.
