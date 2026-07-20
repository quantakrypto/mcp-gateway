/** @type {import('next').NextConfig} */
const nextConfig = {
  // @quantakrypto/mcp is an ESM package with Node built-ins; keep it external to
  // the server bundle so its `node:` imports resolve at runtime.
  serverExternalPackages: ["@quantakrypto/mcp", "pg"],
};

export default nextConfig;
