import { connectDB } from "./db";
import { Submission } from "./models/Submission";
import type { ContentType, Trigger } from "./content";

/**
 * The submissions repository.
 *
 * Two backends behind one interface: MongoDB when `MONGODB_URI` is set, and an
 * in-process array when it isn't. The in-memory store is genuinely ephemeral —
 * it dies with the server — which is fine for a local clone and openly wrong
 * for production. Deployments set the URI. The point is that nothing upstream
 * of here has to know or care which one it got.
 */

export interface SubmissionRecord {
  id: string;
  type: ContentType;
  text: string;
  trigger: Trigger;
  author: string;
  /** The account that submitted this, if any. `author` is still free text. */
  userId: string | null;
  status: "pending" | "approved" | "rejected";
  votes: number;
  createdAt: string;
  reviewedAt: string | null;
  editedFrom: string | null;
}

export interface NewSubmission {
  type: ContentType;
  text: string;
  trigger: Trigger;
  author: string;
  userId?: string | null;
}

/* -------------------------------------------------------------------------- */
/* In-memory fallback                                                          */
/* -------------------------------------------------------------------------- */

const globalForMem = globalThis as unknown as { __tifMem?: SubmissionRecord[] };
const memory: SubmissionRecord[] = (globalForMem.__tifMem ??= []);

let memSeq = 0;
const memId = () => `mem_${Date.now().toString(36)}_${(++memSeq).toString(36)}`;

/* -------------------------------------------------------------------------- */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toRecord(doc: any): SubmissionRecord {
  return {
    id: String(doc._id),
    type: doc.type,
    text: doc.text,
    trigger: doc.trigger,
    author: doc.author,
    userId: doc.userId ?? null,
    status: doc.status,
    votes: doc.votes ?? 0,
    createdAt: new Date(doc.createdAt).toISOString(),
    reviewedAt: doc.reviewedAt ? new Date(doc.reviewedAt).toISOString() : null,
    editedFrom: doc.editedFrom ?? null,
  };
}

export async function createSubmission(input: NewSubmission): Promise<SubmissionRecord> {
  const db = await connectDB();

  if (!db) {
    const rec: SubmissionRecord = {
      id: memId(),
      ...input,
      userId: input.userId ?? null,
      status: "pending",
      votes: 0,
      createdAt: new Date().toISOString(),
      reviewedAt: null,
      editedFrom: null,
    };
    memory.unshift(rec);
    return rec;
  }

  const doc = await Submission.create({
    ...input,
    userId: input.userId ?? null,
    status: "pending",
  });
  return toRecord(doc);
}

export async function listSubmissions(
  status: SubmissionRecord["status"] | "all",
  limit = 200,
): Promise<SubmissionRecord[]> {
  const db = await connectDB();

  if (!db) {
    return memory.filter((r) => status === "all" || r.status === status).slice(0, limit);
  }

  const query = status === "all" ? {} : { status };
  const docs = await Submission.find(query).sort({ votes: -1, createdAt: -1 }).limit(limit).lean();
  return docs.map(toRecord);
}

/** Everything one account has ever submitted, newest first. */
export async function listByUser(userId: string, limit = 100): Promise<SubmissionRecord[]> {
  const db = await connectDB();

  if (!db) {
    return memory.filter((r) => r.userId === userId).slice(0, limit);
  }

  const docs = await Submission.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean();
  return docs.map(toRecord);
}

export async function setStatus(
  id: string,
  status: "approved" | "rejected" | "pending",
  text?: string,
): Promise<SubmissionRecord | null> {
  const db = await connectDB();

  if (!db) {
    const rec = memory.find((r) => r.id === id);
    if (!rec) return null;
    if (text && text !== rec.text) {
      rec.editedFrom = rec.text;
      rec.text = text;
    }
    rec.status = status;
    // Back to pending means genuinely un-reviewed, not reviewed-then-parked.
    rec.reviewedAt = status === "pending" ? null : new Date().toISOString();
    return rec;
  }

  const existing = await Submission.findById(id);
  if (!existing) return null;

  if (text && text !== existing.text) {
    existing.editedFrom = existing.text;
    existing.text = text;
  }
  existing.status = status;
  existing.reviewedAt = status === "pending" ? null : new Date();
  await existing.save();
  return toRecord(existing);
}

export async function voteFor(id: string): Promise<number | null> {
  const db = await connectDB();

  if (!db) {
    const rec = memory.find((r) => r.id === id && r.status === "pending");
    if (!rec) return null;
    rec.votes += 1;
    return rec.votes;
  }

  const doc = await Submission.findOneAndUpdate(
    { _id: id, status: "pending" },
    { $inc: { votes: 1 } },
    { new: true },
  );
  return doc ? (doc.votes ?? 0) : null;
}

/** Approved lines, bucketed by type — exactly the shape `buildDaily` merges in. */
export async function approvedPools(): Promise<Partial<Record<ContentType, string[]>>> {
  const approved = await listSubmissions("approved", 500);
  const pools: Partial<Record<ContentType, string[]>> = {};
  for (const r of approved) {
    (pools[r.type] ??= []).push(r.text);
  }
  return pools;
}

export interface ContributorStat {
  author: string;
  /** Set when at least one submission under this handle came from an account. */
  userId: string | null;
  approved: number;
  pending: number;
  latest: string | null;
  types: string[];
}

/**
 * Powers the Hall of Cringe.
 *
 * Still grouped by the free-text handle, deliberately — anonymous contributors
 * are the common case and they only have a handle. `userId` rides along so the
 * hall can mark which handles belong to a real account. Two accounts typing the
 * same handle collapse into one row, same as they always have; the first
 * account seen wins the marker.
 */
export async function contributorStats(): Promise<ContributorStat[]> {
  const all = await listSubmissions("all", 1000);
  const byAuthor = new Map<string, ContributorStat>();

  for (const r of all) {
    if (r.status === "rejected") continue;
    const entry = byAuthor.get(r.author) ?? {
      author: r.author,
      userId: null,
      approved: 0,
      pending: 0,
      latest: null,
      types: [],
    };
    entry.userId ??= r.userId;
    if (r.status === "approved") {
      entry.approved += 1;
      if (!entry.types.includes(r.type)) entry.types.push(r.type);
    } else {
      entry.pending += 1;
    }
    if (!entry.latest || r.createdAt > entry.latest) entry.latest = r.createdAt;
    byAuthor.set(r.author, entry);
  }

  return [...byAuthor.values()].sort(
    (a, b) => b.approved - a.approved || b.pending - a.pending,
  );
}
