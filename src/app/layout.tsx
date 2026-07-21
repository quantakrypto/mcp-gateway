import type { ReactNode } from "react";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata = {
  title: "quantakrypto MCP gateway",
  description: "Hosted, OAuth-gated quantakrypto MCP server for AI coding agents.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
