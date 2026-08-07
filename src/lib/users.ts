import { connectDB } from "./db";
import { User } from "./models/User";

/**
 * The user repository — same dual-backend shape as `submissions.ts`: Mongo
 * when `MONGODB_URI` is set, an in-process Map when it isn't, so real signup
 * still works on a bare clone with no database standing behind it.
 */

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  age: number | null;
  vibes: string[];
  trust: number;
  createdAt: string;
}

export interface NewUser {
  email: string;
  passwordHash: string;
  name: string;
  age: number | null;
  vibes: string[];
  trust: number;
}

/** Thrown by `createUser` when the email is already registered. */
export class DuplicateEmailError extends Error {
  constructor() {
    super("Email already registered");
    this.name = "DuplicateEmailError";
  }
}

/* -------------------------------------------------------------------------- */
/* In-memory fallback                                                          */
/* -------------------------------------------------------------------------- */

const globalForMem = globalThis as unknown as { __tifUsers?: Map<string, UserRecord> };
const memory: Map<string, UserRecord> = (globalForMem.__tifUsers ??= new Map());

let memSeq = 0;
const memId = () => `mem_${Date.now().toString(36)}_${(++memSeq).toString(36)}`;

/* -------------------------------------------------------------------------- */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toRecord(doc: any): UserRecord {
  return {
    id: String(doc._id),
    email: doc.email,
    passwordHash: doc.passwordHash,
    name: doc.name,
    age: doc.age ?? null,
    vibes: doc.vibes ?? [],
    trust: doc.trust ?? 50,
    createdAt: new Date(doc.createdAt).toISOString(),
  };
}

export async function createUser(input: NewUser): Promise<UserRecord> {
  const email = input.email.trim().toLowerCase();
  const db = await connectDB();

  if (!db) {
    if (memory.has(email)) throw new DuplicateEmailError();
    const rec: UserRecord = {
      id: memId(),
      ...input,
      email,
      createdAt: new Date().toISOString(),
    };
    memory.set(email, rec);
    return rec;
  }

  try {
    const doc = await User.create({ ...input, email });
    return toRecord(doc);
  } catch (err) {
    // Mongo's unique index is the real backstop against a signup race —
    // the live availability check happens moments earlier and can't fully
    // close the gap between two concurrent submits.
    if (err && typeof err === "object" && "code" in err && err.code === 11000) {
      throw new DuplicateEmailError();
    }
    throw err;
  }
}

export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const normalized = email.trim().toLowerCase();
  const db = await connectDB();

  if (!db) return memory.get(normalized) ?? null;

  const doc = await User.findOne({ email: normalized });
  return doc ? toRecord(doc) : null;
}

export async function findUserById(id: string): Promise<UserRecord | null> {
  const db = await connectDB();

  if (!db) {
    for (const rec of memory.values()) if (rec.id === id) return rec;
    return null;
  }

  const doc = await User.findById(id).catch(() => null);
  return doc ? toRecord(doc) : null;
}
