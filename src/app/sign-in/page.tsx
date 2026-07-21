"use client";

import { useState } from "react";
import { signIn, signUp } from "@/lib/auth-client";

/**
 * Sign-in surface for the MCP gateway — the `loginPage` the OAuth flow redirects
 * to. Styled with the quantakrypto "Lattice" design system. Email/password is the
 * primary path; Google and GitHub sit below as compact icon buttons.
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

        {/* Primary: email + password */}
        <form onSubmit={emailSubmit} className="mt-7 grid gap-2.5">
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

        <button
          onClick={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
          className="mt-4 font-mono text-[0.72rem] uppercase tracking-[0.14em] text-indigo transition-colors hover:text-cyan-deep"
        >
          {mode === "sign-in" ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>

        {/* Secondary: social icon buttons */}
        <div className="my-6 flex items-center gap-3 text-[0.68rem] uppercase tracking-[0.16em] text-faint">
          <span className="h-px flex-1 bg-line" />
          or continue with
          <span className="h-px flex-1 bg-line" />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <button onClick={() => social("google")} aria-label="Continue with Google" className={iconBtn}>
            <GoogleMark />
            Google
          </button>
          <button onClick={() => social("github")} aria-label="Continue with GitHub" className={iconBtn}>
            <GithubMark />
            GitHub
          </button>
        </div>

        {message ? <p className="mt-5 text-sm text-muted">{message}</p> : null}

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

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.87z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.08 7.95-2.91l-3.88-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A12 12 0 0 0 12 24z"
      />
      <path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29a12 12 0 0 0 0 10.76z" />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

function GithubMark() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.05-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.49 5.93.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.22.7.83.58A12 12 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />
    </svg>
  );
}

const btnPrimary =
  "inline-flex items-center justify-center rounded-none border border-indigo bg-indigo px-5 py-2.5 font-mono text-[0.85rem] font-medium tracking-tight text-white transition-all duration-200 hover:-translate-y-px hover:bg-cyan-deep disabled:opacity-50";
const iconBtn =
  "inline-flex items-center justify-center gap-2 rounded-none border border-line bg-surface px-4 py-2.5 font-mono text-[0.8rem] font-medium text-ink transition-all duration-200 hover:-translate-y-px hover:border-ink";
const input =
  "rounded-none border border-line bg-surface px-4 py-2.5 text-sm text-ink placeholder:text-faint focus:border-indigo focus:outline-none";
