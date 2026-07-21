"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard unavailable */
        }
      }}
      className="shrink-0 rounded-none border border-line bg-surface px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-indigo transition-colors hover:border-indigo"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
