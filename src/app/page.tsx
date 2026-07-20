/**
 * Minimal landing/status page for the gateway host. The rich marketing/docs
 * surface lives on quantakrypto.com/mcp; this is the bare service root.
 */
export default function Home() {
  const base = process.env.BETTER_AUTH_URL ?? "https://mcp.quantakrypto.com";
  return (
    <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", background: "#0b0d12", color: "#e6e9ef", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 560, padding: 24 }}>
        <p style={{ fontFamily: "ui-monospace, monospace", letterSpacing: "0.16em", textTransform: "uppercase", color: "#6ee7e7", fontSize: 12 }}>
          quantakrypto MCP
        </p>
        <h1 style={{ fontSize: 26, margin: "8px 0 12px" }}>Hosted MCP gateway</h1>
        <p style={{ color: "#aab2c0", lineHeight: 1.6 }}>
          OAuth-gated Model Context Protocol endpoint for AI coding agents. Sign in to obtain a
          30-day token, then point your client at <code>{base}/mcp</code>.
        </p>
        <p style={{ marginTop: 20 }}>
          <a href="/sign-in" style={{ color: "#6ee7e7" }}>Sign in</a>
          <span style={{ color: "#3a3f4a", margin: "0 10px" }}>·</span>
          <a href="https://quantakrypto.com/mcp" style={{ color: "#6ee7e7" }}>Connection guide</a>
        </p>
      </div>
    </main>
  );
}
