import { createQuantakryptoServer, quantakryptoTools } from "@quantakrypto/mcp";

/**
 * Tools that read the server filesystem or reach out over the network. A hosted,
 * multi-tenant endpoint has no user repo to scan and must not read server paths
 * or probe arbitrary hosts, so these are withheld — the same posture the
 * package's HTTP transport enforces via `gateHttpTools`.
 *
 * NOTE: when @quantakrypto/mcp exports `gateHttpTools` / `FS_TOOL_NAMES` /
 * `NETWORK_TOOL_NAMES` from its package root, replace this local denylist with
 * `gateHttpTools(quantakryptoTools, false, false)` for a single source of truth.
 */
const WITHHELD_OVER_HTTP = new Set([
  "scan_path",
  "inventory_crypto",
  "generate_cbom",
  "plan_migration",
  "probe_endpoint",
]);

const httpSafeTools = quantakryptoTools.filter((t) => !WITHHELD_OVER_HTTP.has(t.name));

/**
 * A single, shared, stateless MCP server exposing only the HTTP-safe tools:
 * the advisory/knowledge tools and the content-based analysis tools
 * (verify_fix, check_dependency, triage_findings, remediate_findings, …), which
 * take submitted content rather than a filesystem path.
 */
export const mcpServer = createQuantakryptoServer({ tools: httpSafeTools });
