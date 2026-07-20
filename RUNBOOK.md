# quantakrypto MCP gateway — runbook

A hosted, OAuth-gated multi-tenant gateway for the quantakrypto MCP server.
Better Auth (Google + GitHub + email via Resend) is the OAuth 2.1 provider and
issues **30-day** access tokens; the `/mcp` endpoint runs behind `withMcpAuth`
in the same process, so no separate resource server is needed.

```
  AI coding agent ──OAuth 2.1 (PKCE)──►  /api/auth/*        (Better Auth: authorize/token)
                  ◄──.well-known/*──────  discovery metadata (RFC 8414 / 9728)
                  ──Bearer <30d token>─►  /mcp              (withMcpAuth → MCP tools)
```

## What runs where

- **This app** (Next.js) — the whole service: sign-in UI, OAuth endpoints,
  discovery metadata, and the authenticated `/mcp` endpoint. Runs on **your
  server**.
- **Postgres** — accounts, OAuth clients, tokens. **Your own** instance
  (`docker-compose.yml` provided for local/self-host).
- **Resend** — verification / magic-link email.
- **`@quantakrypto/mcp`** — the open-source MCP core (advisory + content-analysis
  tools); the filesystem/network tools are withheld over HTTP (see
  `src/lib/mcp-server.ts`).

## One-time setup

1. **Install**
   ```bash
   npm install
   ```
   Pulls `@quantakrypto/mcp` (^0.5.0, published to npm with provenance) and its
   `core`/`qprobe` deps.

2. **Postgres** — either `docker compose up -d postgres`, or point
   `DATABASE_URL` at your existing instance.

3. **Environment** — copy `.env.example` → `.env` and fill in:
   - `BETTER_AUTH_URL` — the public origin (e.g. `https://mcp.quantakrypto.com`).
   - `BETTER_AUTH_SECRET` — `openssl rand -base64 32`.
   - `DATABASE_URL`.
   - **Google** OAuth client — redirect URI
     `${BETTER_AUTH_URL}/api/auth/callback/google`.
   - **GitHub** OAuth app — callback
     `${BETTER_AUTH_URL}/api/auth/callback/github`.
   - **Resend** — `RESEND_API_KEY` + a verified `EMAIL_FROM` domain.

4. **Database schema** — Better Auth manages its own tables (accounts, sessions,
   oauth clients/consents, tokens):
   ```bash
   npx @better-auth/cli generate   # inspect the SQL
   npx @better-auth/cli migrate    # apply it
   ```

5. **Run**
   ```bash
   npm run build && npm run start   # listens on :3333
   ```
   Put a TLS-terminating reverse proxy (Caddy/nginx) in front, mapping
   `mcp.quantakrypto.com` → `127.0.0.1:3333`. **HTTPS is mandatory** — the access
   tokens are Bearer credentials.

## Connecting a client

```bash
claude mcp add --transport http quantakrypto https://mcp.quantakrypto.com/mcp
```
The client discovers the OAuth provider from
`/.well-known/oauth-protected-resource`, runs the PKCE flow (opening `/sign-in`),
and stores the 30-day token. Cursor/VS Code: add an HTTP MCP server at the same
URL; they run the same flow.

## Security checklist (do not skip)

- [ ] **HTTPS only** in front of the app; never expose `:3333` directly.
- [ ] `BETTER_AUTH_SECRET` is a strong random value, not committed.
- [ ] Google/GitHub redirect URIs are the exact production URLs (no wildcards).
- [ ] Resend sender domain is verified (SPF/DKIM) so mail isn't spoofable.
- [ ] **Rate limiting / quotas** on `/mcp` per token — a hosted MCP burns your
      compute. Better Auth has built-in rate limiting; also cap per-tenant
      tool-calls (TODO below).
- [ ] Postgres is not internet-exposed; backups enabled.
- [ ] Token revocation path tested (Better Auth account/session APIs).

## Follow-ups (not yet built)

- **Per-tenant quotas/metering** on `/mcp` keyed by `session.userId`.
- **Account dashboard** to view/revoke/regenerate tokens (Better Auth exposes
  the APIs; needs a small UI).
- **Streamable-HTTP SSE half** if/when tools stream progress (current tools are
  synchronous request/response, so JSON is sufficient).
- **Brand the `/sign-in` page** to match quantakrypto.com.
- Replace the local HTTP-safe tool denylist in `src/lib/mcp-server.ts` with the
  package's `gateHttpTools` export once published.

See `qproof-tools/docs/design/hosted-mcp-oauth-gateway.md` for the full design.
