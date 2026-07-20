import type { ReactNode } from "react";

export const metadata = {
  title: "quantakrypto MCP gateway",
  description: "Hosted, OAuth-gated quantakrypto MCP server for AI coding agents.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
