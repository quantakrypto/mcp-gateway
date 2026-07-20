import { oAuthDiscoveryMetadata } from "better-auth/plugins";
import { auth } from "@/lib/auth";

/**
 * RFC 8414 Authorization Server Metadata. MCP clients fetch this to discover the
 * authorize/token endpoints, supported scopes, and PKCE support.
 */
export const GET = oAuthDiscoveryMetadata(auth);
