/**
 * Minimal landing/status page for the gateway host, in the quantakrypto brand.
 * The rich marketing/docs surface lives on quantakrypto.com/mcp.
 */
export default function Home() {
  const base = process.env.BETTER_AUTH_URL ?? "https://mcp.quantakrypto.com";
  return (
    <main className="relative flex min-h-dvh items-center justify-center px-5 py-16">
      <div className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-60" aria-hidden />
      <div className="w-full max-w-[38rem]">
        <span className="eyebrow">quantakrypto MCP</span>
        <h1 className="mt-3 font-display text-4xl leading-[1.05] text-ink sm:text-5xl">
          Hosted MCP gateway
        </h1>
        <p className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted">
          An OAuth-gated Model Context Protocol endpoint for AI coding agents. Sign in to obtain a
          30-day token, then point your client at{" "}
          <code className="font-mono text-[0.95em] text-ink">{base}/mcp</code>.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="/sign-in"
            className="inline-flex items-center rounded-none border border-indigo bg-indigo px-6 py-3 font-mono text-[0.85rem] font-medium text-white transition-all duration-200 hover:-translate-y-px hover:bg-cyan-deep"
          >
            Sign in
          </a>
          <a
            href="https://quantakrypto.com/mcp"
            className="inline-flex items-center rounded-none border border-ink px-6 py-3 font-mono text-[0.85rem] font-medium text-ink transition-all duration-200 hover:-translate-y-px hover:bg-ink hover:text-paper"
          >
            Connection guide
          </a>
        </div>
        <p className="mt-10 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-faint">
          Open source · github.com/quantakrypto/mcp-gateway
        </p>
      </div>
    </main>
  );
}
