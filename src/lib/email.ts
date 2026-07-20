import { Resend } from "resend";

/**
 * Transactional email via Resend — verification links and magic links for the
 * MCP gateway. Sender domain must be verified in your Resend account and set in
 * EMAIL_FROM.
 *
 * DEV FALLBACK: when RESEND_API_KEY is unset, emails are NOT sent — the link is
 * logged to the server console instead, so local email/password sign-up works
 * without an email provider. Set RESEND_API_KEY in production.
 */
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

const FROM = process.env.EMAIL_FROM ?? "quantakrypto <no-reply@quantakrypto.com>";

async function deliver(to: string, subject: string, html: string, link: string): Promise<void> {
  if (!resend) {
    // eslint-disable-next-line no-console
    console.log(`[email:dev] no RESEND_API_KEY — would send "${subject}" to ${to}\n  link: ${link}`);
    return;
  }
  await resend.emails.send({ from: FROM, to, subject, html });
}

function shell(title: string, body: string, cta: { label: string; url: string }): string {
  return `<!doctype html><html><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#0b0d12;color:#e6e9ef;margin:0;padding:32px">
    <div style="max-width:480px;margin:0 auto">
      <p style="font-family:ui-monospace,monospace;letter-spacing:.16em;text-transform:uppercase;color:#6ee7e7;font-size:12px">quantakrypto</p>
      <h1 style="font-size:22px;margin:8px 0 16px">${title}</h1>
      <p style="color:#aab2c0;line-height:1.6">${body}</p>
      <p style="margin:28px 0">
        <a href="${cta.url}" style="display:inline-block;background:#4f46e5;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;font-weight:600">${cta.label}</a>
      </p>
      <p style="color:#6b7280;font-size:12px;line-height:1.6">If you didn’t request this, you can ignore this email. The link expires shortly.</p>
    </div></body></html>`;
}

export async function sendVerificationEmail(to: string, url: string): Promise<void> {
  await deliver(
    to,
    "Verify your email to access the quantakrypto MCP",
    shell(
      "Confirm your email",
      "Confirm this address to finish creating your quantakrypto MCP account. Once verified, your AI coding agent can connect to the hosted MCP server.",
      { label: "Verify email", url },
    ),
    url,
  );
}

export async function sendMagicLinkEmail(to: string, url: string): Promise<void> {
  await deliver(
    to,
    "Your quantakrypto MCP sign-in link",
    shell(
      "Sign in to quantakrypto",
      "Click below to sign in to your quantakrypto MCP account. This link is single-use and expires shortly.",
      { label: "Sign in", url },
    ),
    url,
  );
}
