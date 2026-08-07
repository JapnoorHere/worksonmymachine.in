import mongoose from "mongoose";

/**
 * Mongo connection, cached across hot reloads.
 *
 * `MONGODB_URI` is optional on purpose. Somebody who clones this repo to laugh
 * at it for ten minutes should not have to stand up a database first — without
 * a URI the submission layer transparently falls back to an in-process store
 * (see `submissions.ts`). Every call site treats "no database" as a normal
 * state rather than an error, which is also, in fairness, extremely on brand.
 */

const URI = process.env.MONGODB_URI?.trim();

export const dbConfigured = Boolean(URI);

interface Cache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  failed: boolean;
}

const globalForMongoose = globalThis as unknown as { __tifMongo?: Cache };

const cache: Cache =
  globalForMongoose.__tifMongo ?? (globalForMongoose.__tifMongo = {
    conn: null,
    promise: null,
    failed: false,
  });

/** Returns a live connection, or null if Mongo isn't configured or won't answer. */
export async function connectDB(): Promise<typeof mongoose | null> {
  if (!URI || cache.failed) return null;
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(URI, {
        bufferCommands: false,
        // Fail fast. A hung connection would stall every page that reads content.
        serverSelectionTimeoutMS: 5000,
      })
      .then((m) => m);
  }

  try {
    cache.conn = await cache.promise;
    return cache.conn;
  } catch (err) {
    // Latch the failure so we don't retry on every single request.
    cache.failed = true;
    cache.promise = null;
    console.warn(
      "[this-is-fine] MongoDB unavailable, using in-memory submissions:",
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}
