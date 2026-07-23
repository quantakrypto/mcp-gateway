import { withMcpAuth } from "better-auth/plugins";
import { auth } from "@/lib/auth";
import { mcpServer } from "@/lib/mcp-server";
import type { JsonRpcRequest } from "@quantakrypto/mcp";

/**
 * JSON-RPC methods served WITHOUT authentication: the MCP handshake plus the
 * read-only capability *listings*. These expose only what is already public in
 * the open-source @quantakrypto/mcp package and the Glama listing — the server
 * info and the names/schemas of the HTTP-safe tools (fs/network tools are
 * withheld over HTTP, see mcp-server.ts). Serving them anonymously discloses
 * nothing new; it just lets MCP directories and clients introspect the server
 * before a user signs in (e.g. Glama's health check does an unauthenticated
 * `initialize` + `tools/list`).
 *
 * Everything else — crucially `tools/call`, and also `resources/read` /
 * `prompts/get` / `completion/complete` — still requires a valid Bearer token.
 */
const PUBLIC_METHODS = new Set<string>([
  "initialize",
  "notifications/initialized",
  "ping",
  "tools/list",
  "prompts/list",
  "resources/list",
  "resources/templates/list",
]);

function parseError(): Response {
  return Response.json(
    { jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } },
    { status: 400 },
  );
}

/** Dispatch a message through the shared, stateless MCP server. */
async function dispatch(message: JsonRpcRequest): Promise<Response> {
  const response = await mcpServer.handle(message);
  if (!response) return new Response(null, { status: 202 });
  return Response.json(response);
}

/**
 * Auth-gated dispatch. `withMcpAuth` validates the Bearer access token (against
 * the provider's published JWKS) BEFORE our handler runs and, on failure,
 * returns the 401 + WWW-Authenticate challenge that points MCP clients at the
 * OAuth flow. `session` carries the verified token record (user id + scopes).
 */
const authedPost = withMcpAuth(auth, async (req, _session) => {
  let message: JsonRpcRequest;
  try {
    message = (await req.json()) as JsonRpcRequest;
  } catch {
    return parseError();
  }
  return dispatch(message);
});

/**
 * The hosted MCP endpoint (Streamable HTTP, JSON request/response half).
 *
 * We peek at the JSON-RPC `method` on a CLONE of the request — leaving the
 * original body untouched — and route on it: public discovery/handshake methods
 * are served anonymously; every other method is delegated to the auth-gated
 * handler with the request passed through intact. Each request body is a single
 * JSON-RPC 2.0 message; notifications (no id) produce no body → HTTP 202.
 */
export async function POST(req: Request): Promise<Response> {
  let message: JsonRpcRequest;
  try {
    message = (await req.clone().json()) as JsonRpcRequest;
  } catch {
    return parseError();
  }

  if (typeof message?.method === "string" && PUBLIC_METHODS.has(message.method)) {
    return dispatch(message);
  }

  // Original request is still unread here, so withMcpAuth (headers) and its
  // handler (body) both work exactly as before.
  return authedPost(req);
}
