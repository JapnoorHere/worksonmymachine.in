import { rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

/**
 * Removes every build artifact directory.
 *
 * Exists because a half-written `.next` is the single most common way this
 * project breaks locally: dev and production builds are not interchangeable,
 * and deleting the directory while a server holds handles into it leaves
 * dangling chunk manifests that surface as bizarre, misleading errors
 * ("Cannot find module './611.js'", "__webpack_modules__[moduleId] is not a
 * function", a phantom pages-router `_document`).
 *
 * ALWAYS stop the dev server before running this. It cannot do that for you.
 */
const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(here, "..");

const targets = [".next", ".next-build", "node_modules/.cache"];

for (const t of targets) {
  await rm(path.join(root, t), { recursive: true, force: true });
  console.log(`removed ${t}`);
}

console.log("\nClean. Start the dev server with `npm run dev`.");
