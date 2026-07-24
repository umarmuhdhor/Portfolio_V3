import type { NextConfig } from 'next';
import path from 'node:path';

const nextConfig: NextConfig = {
  // Several lockfiles exist above this directory; pin the root so module
  // resolution cannot drift to a parent workspace.
  turbopack: { root: path.resolve(__dirname) },
};

export default nextConfig;
