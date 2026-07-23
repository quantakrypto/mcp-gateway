/**
 * Glama connector ownership verification.
 *
 * Glama fetches https://mcp.quantakrypto.com/.well-known/glama.json to confirm
 * we own the hosted MCP connector listed at
 * glama.ai/mcp/connectors/com.quantakrypto.mcp/quantakrypto-pqc-tools-hosted.
 * The maintainer email must match the Glama account email; Glama auto-detects
 * and verifies the file within a few minutes of deploy.
 */
export function GET(): Response {
  return Response.json({
    $schema: "https://glama.ai/mcp/schemas/connector.json",
    maintainers: [{ email: "lnacosta91@gmail.com" }],
  });
}
