import type { NextConfig } from "next";

import { join } from 'path';

const nextConfig: NextConfig = {
  // Ensure Next's output tracing root is this project directory so Next doesn't
  // accidentally pick a parent directory when multiple lockfiles exist.
  outputFileTracingRoot: join(__dirname),
};

export default nextConfig;
