"use client";

import { useState } from "react";
import { signOut } from "@/lib/auth-client";

export function SignOutButton() {
  const [busy, setBusy] = useState(false);
  return (
    <button
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await signOut();
        window.location.reload();
      }}
      className="inline-flex items-center rounded-none border border-line bg-surface px-6 py-3 font-mono text-[0.85rem] font-medium text-ink transition-all duration-200 hover:-translate-y-px hover:border-ink disabled:opacity-50"
    >
      {busy ? "Signing out…" : "Sign out"}
    </button>
  );
}
