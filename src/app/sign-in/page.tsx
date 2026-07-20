"use client";

import { useState } from "react";
import { signIn, signUp } from "@/lib/auth-client";

/**
 * Sign-in surface for the MCP gateway. This is the `loginPage` the OAuth flow
 * redirects to when an MCP client needs the user to authenticate. Social
 * sign-in (Google, GitHub) plus email/password with verification.
 *
 * Deliberately minimal — style to the quantakrypto brand as a follow-up.
 */
export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [message, setMessage] = useState<string | null>(null);

  async function social(provider: "google" | "github") {
    await signIn.social({ provider, callbackURL: "/" });
  }

  async function emailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (mode === "sign-up") {
      const { error } = await signUp.email({ email, password, name: email.split("@")[0] });
      setMessage(error ? error.message ?? "Sign-up failed" : "Check your email to verify your account.");
    } else {
      const { error } = await signIn.email({ email, password, callbackURL: "/" });
      if (error) setMessage(error.message ?? "Sign-in failed");
    }
  }

  return (
    <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", background: "#0b0d12", color: "#e6e9ef", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 380, padding: 24 }}>
        <p style={{ fontFamily: "ui-monospace, monospace", letterSpacing: "0.16em", textTransform: "uppercase", color: "#6ee7e7", fontSize: 12 }}>
          quantakrypto MCP
        </p>
        <h1 style={{ fontSize: 24, margin: "8px 0 20px" }}>Sign in to connect</h1>

        <div style={{ display: "grid", gap: 10 }}>
          <button onClick={() => social("google")} style={btn}>Continue with Google</button>
          <button onClick={() => social("github")} style={btn}>Continue with GitHub</button>
        </div>

        <div style={{ textAlign: "center", color: "#6b7280", margin: "18px 0", fontSize: 13 }}>or</div>

        <form onSubmit={emailSubmit} style={{ display: "grid", gap: 10 }}>
          <input type="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} style={input} />
          <input type="password" required minLength={8} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={input} />
          <button type="submit" style={{ ...btn, background: "#4f46e5", borderColor: "#4f46e5", color: "#fff" }}>
            {mode === "sign-in" ? "Sign in" : "Create account"}
          </button>
        </form>

        {message ? <p style={{ color: "#aab2c0", fontSize: 13, marginTop: 12 }}>{message}</p> : null}

        <button
          onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
          style={{ background: "none", border: "none", color: "#6ee7e7", fontSize: 13, marginTop: 16, cursor: "pointer" }}
        >
          {mode === "sign-in" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}

const btn: React.CSSProperties = {
  padding: "11px 16px",
  borderRadius: 8,
  border: "1px solid #2a2f3a",
  background: "transparent",
  color: "#e6e9ef",
  fontSize: 14,
  cursor: "pointer",
};

const input: React.CSSProperties = {
  padding: "11px 14px",
  borderRadius: 8,
  border: "1px solid #2a2f3a",
  background: "#12151c",
  color: "#e6e9ef",
  fontSize: 14,
};
