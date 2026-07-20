import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

/**
 * Better Auth's catch-all handler: sign-in/up, social callbacks, email
 * verification, and the OAuth 2.1 authorize/token endpoints contributed by the
 * `mcp` plugin all live under /api/auth/*.
 */
export const { GET, POST } = toNextJsHandler(auth);
