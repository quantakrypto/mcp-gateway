"use client";

import { useState } from "react";
import { signIn, signUp } from "@/lib/auth-client";

/**
 * Sign-in surface for the MCP gateway — the `loginPage` the OAuth flow redirects
 * to. Styled with the quantakrypto "Lattice" design system (light paper field,
 * ink type, indigo accent) so it reads as part of quantakrypto.com.
 */
export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function social(provider: "google" | "github") {
    await signIn.social({ provider, callbackURL: "/" });
  }

  async function emailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setBusy(true);
    if (mode === "sign-up") {
      const { error } = await signUp.email({ email, password, name: email.split("@")[0] });
      setMessage(
        error ? (error.message ?? "Sign-up failed") : "Check your email to verify your account.",
      );
    } else {
      const { error } = await signIn.email({ email, password, callbackURL: "/" });
      if (error) setMessage(error.message ?? "Sign-in failed");
    }
    setBusy(false);
  }

  return (
    <main className="relative flex min-h-dvh items-center justify-center px-5 py-16">
      <div className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-60" aria-hidden />
      <div className="card glow-cyan w-full max-w-[26rem] p-8 sm:p-10">
        <span className="eyebrow">quantakrypto MCP</span>
        <h1 className="mt-3 font-display text-3xl text-ink">Sign in to connect</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Sign in to obtain a 30-day access token for the hosted MCP endpoint.
        </p>

        <div className="mt-7 grid gap-2.5">
          <button onClick={() => social("google")} className={btnSecondary}>
            Continue with Google
          </button>
          <button onClick={() => social("github")} className={btnSecondary}>
            Continue with GitHub
          </button>
        </div>

        <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-[0.16em] text-faint">
          <span className="h-px flex-1 bg-line" />
          or
          <span className="h-px flex-1 bg-line" />
        </div>

        <form onSubmit={emailSubmit} className="grid gap-2.5">
          <input
            type="email"
            required
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={input}
          />
          <input
            type="password"
            required
            minLength={8}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={input}
          />
          <button type="submit" disabled={busy} className={btnPrimary}>
            {mode === "sign-in" ? "Sign in" : "Create account"}
          </button>
        </form>

        {message ? <p className="mt-4 text-sm text-muted">{message}</p> : null}

        <button
          onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
          className="mt-5 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-indigo transition-colors hover:text-cyan-deep"
        >
          {mode === "sign-in" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>

        <p className="mt-8 text-xs leading-relaxed text-faint">
          By continuing you agree to our{" "}
          <a href="https://quantakrypto.com/terms" className="text-indigo hover:underline">
            Terms
          </a>{" "}
          and{" "}
          <a href="https://quantakrypto.com/privacy" className="text-indigo hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </main>
  );
}

const btnBase =
  "inline-flex items-center justify-center rounded-none border px-5 py-2.5 font-mono text-[0.85rem] font-medium tracking-tight transition-all duration-200 disabled:opacity-50";
const btnSecondary = `${btnBase} border-ink bg-transparent text-ink hover:-translate-y-px hover:bg-ink hover:text-paper`;
const btnPrimary = `${btnBase} border-indigo bg-indigo text-white hover:-translate-y-px hover:bg-cyan-deep`;
const input =
  "rounded-none border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-faint focus:border-indigo focus:outline-none";
