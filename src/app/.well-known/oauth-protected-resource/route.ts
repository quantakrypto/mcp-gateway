import { oAuthProtectedResourceMetadata } from "better-auth/plugins";
import { auth } from "@/lib/auth";

/**
 * RFC 9728 Protected Resource Metadata. The /mcp resource advertises which
 * authorization server protects it, so an MCP client that hits a 401 knows where
 * to run the OAuth flow.
 */
export const GET = oAuthProtectedResourceMetadata(auth);
