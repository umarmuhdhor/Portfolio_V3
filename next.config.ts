import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  // Every route is known at build time, so the site ships as plain files
  // (out/) served by Cloudflare Workers static assets — see wrangler.jsonc.
  output: 'export',
  // Several lockfiles exist above this directory; pin the root so module
  // resolution cannot drift to a parent workspace.
  turbopack: { root: path.resolve(__dirname) },
  // The floating dev indicator overlays the page and shows up in captures.
  devIndicators: false,
};

export default nextConfig;
