import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // A stray package-lock.json in the parent folder makes Next infer the wrong
  // workspace root, which then breaks file tracing. Pin it to this project.
  outputFileTracingRoot: here,
  // Dev and production artifacts are not interchangeable, and a `next build`
  // run while `next dev` is up leaves the dev server reading prod chunks it
  // can't resolve. Keeping the outputs in separate directories makes the two
  // safe to run side by side.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Mongoose ships optional native-ish deps that Turbopack/webpack try to trace.
  serverExternalPackages: ["mongoose"],
};

export default nextConfig;
