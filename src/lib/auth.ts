import { betterAuth } from "better-auth";
import { mcp } from "better-auth/plugins";
import { Pool } from "pg";
import { sendVerificationEmail, sendMagicLinkEmail } from "./email";

/** Include a social provider only when both its credentials are configured. */
function buildSocialProviders(): Record<string, { clientId: string; clientSecret: string }> {
  const providers: Record<string, { clientId: string; clientSecret: string }> = {};
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.google = {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    };
  }
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    providers.github = {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    };
  }
  return providers;
}

/**
 * Better Auth = the OAuth 2.1 / OIDC provider for the hosted quantakrypto MCP.
 *
 * Identity: Google + GitHub social sign-in, plus email/password with mandatory
 * verification (magic-link style) delivered through Resend. Accounts + tokens
 * live in your own Postgres.
 *
 * The `mcp` plugin turns this instance into the OAuth provider MCP clients
 * authenticate against: it publishes the discovery metadata (wired in
 * src/app/.well-known/*), runs the authorize/token endpoints, and issues the
 * access tokens the /mcp route validates via `withMcpAuth` (same process).
 *
 * Access tokens expire after 30 days (`accessTokenExpiresIn: 2592000`), per the
 * product requirement; refresh tokens live longer and rotate.
 */
export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,

  // Your own Postgres. Better Auth manages its schema; run `npm run auth:migrate`
  // (see RUNBOOK.md) to create/upgrade the tables.
  database: new Pool({ connectionString: process.env.DATABASE_URL }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, url);
    },
  },

  // Social providers are registered ONLY when their credentials are present, so
  // the gateway boots on email/password alone and gains Google/GitHub the moment
  // you add the client id/secret to the environment.
  socialProviders: buildSocialProviders(),

  plugins: [
    mcp({
      // Where unauthenticated MCP OAuth flows send the user to sign in.
      loginPage: "/sign-in",
      // Identifies this MCP endpoint in the protected-resource metadata.
      resource: `${process.env.BETTER_AUTH_URL ?? ""}/mcp`,
      oidcConfig: {
        loginPage: "/sign-in",
        // 30-day access tokens (seconds). This is the "token with 30-day
        // expiration" the user connects with.
        accessTokenExpiresIn: 60 * 60 * 24 * 30, // 2_592_000
        refreshTokenExpiresIn: 60 * 60 * 24 * 90, // 90 days
        codeExpiresIn: 600, // 10 minutes
      },
    }),
  ],
});

export type Auth = typeof auth;

// Keep the magic-link helper referenced so tree-shaking doesn't drop it; it is
// used by the email/password verification flow above and can back a dedicated
// magic-link plugin later.
export { sendMagicLinkEmail };
