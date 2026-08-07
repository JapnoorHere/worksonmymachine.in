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
      status: "pending",
      votes: 0,
      createdAt: new Date().toISOString(),
      reviewedAt: null,
      editedFrom: null,
    };
    memory.unshift(rec);
    return rec;
  }

  const doc = await Submission.create({ ...input, status: "pending" });
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

export async function setStatus(
  id: string,
  status: "approved" | "rejected",
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
    rec.reviewedAt = new Date().toISOString();
    return rec;
  }

  const existing = await Submission.findById(id);
  if (!existing) return null;

  if (text && text !== existing.text) {
    existing.editedFrom = existing.text;
    existing.text = text;
  }
  existing.status = status;
  existing.reviewedAt = new Date();
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
  approved: number;
  pending: number;
  latest: string | null;
  types: string[];
}

/** Powers the Hall of Cringe. */
export async function contributorStats(): Promise<ContributorStat[]> {
  const all = await listSubmissions("all", 1000);
  const byAuthor = new Map<string, ContributorStat>();

  for (const r of all) {
    if (r.status === "rejected") continue;
    const entry = byAuthor.get(r.author) ?? {
      author: r.author,
      approved: 0,
      pending: 0,
      latest: null,
      types: [],
    };
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
