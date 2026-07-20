import { withMcpAuth } from "better-auth/plugins";
import { auth } from "@/lib/auth";
import { mcpServer } from "@/lib/mcp-server";
import type { JsonRpcRequest } from "@quantakrypto/mcp";

/**
 * The hosted MCP endpoint (Streamable HTTP, JSON request/response half).
 *
 * `withMcpAuth` extracts and validates the Bearer access token (against the
 * provider's published JWKS) BEFORE our handler runs; `session` carries the
 * verified token record (user id + scopes) for per-tenant metering. An
 * unauthenticated request gets a 401 with the WWW-Authenticate challenge that
 * points MCP clients at the OAuth flow.
 *
 * Each request body is a single JSON-RPC 2.0 message; we dispatch it through the
 * shared, stateless MCP server and return the JSON-RPC response. Notifications
 * (no id) produce no response body → HTTP 202.
 */
export const POST = withMcpAuth(auth, async (req, _session) => {
  let message: JsonRpcRequest;
  try {
    message = (await req.json()) as JsonRpcRequest;
  } catch {
    return Response.json(
      { jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } },
      { status: 400 },
    );
  }

  const response = await mcpServer.handle(message);
  if (!response) return new Response(null, { status: 202 });
  return Response.json(response);
});
