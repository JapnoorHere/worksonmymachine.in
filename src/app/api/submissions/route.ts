import { NextResponse } from "next/server";
import { createSubmission, listSubmissions } from "@/lib/submissions";
import { sanitizeAuthor, validateSubmission } from "@/lib/sanitize";
import { CONTENT_TYPES, TRIGGERS, type ContentType, type Trigger } from "@/lib/content";
import { clientKey, rateLimit, sweepBuckets } from "@/lib/ratelimit";
import { getSessionUserId } from "@/lib/auth";
import { findUserById } from "@/lib/users";

export const dynamic = "force-dynamic";

/** Public: the pending queue, for the community upvoting board. */
export async function GET() {
  try {
    const pending = await listSubmissions("pending", 60);
    // Voter-facing view: no reviewer notes, no edit history.
    return NextResponse.json({
      submissions: pending.map((s) => ({
        id: s.id,
        type: s.type,
        text: s.text,
        trigger: s.trigger,
        author: s.author,
        votes: s.votes,
        createdAt: s.createdAt,
      })),
    });
  } catch (err) {
    console.error("[api/submissions GET]", err);
    return NextResponse.json({ submissions: [] });
  }
}

/** Public: submit a joke. Lands in `pending`; a human approves it or it dies there. */
export async function POST(req: Request) {
  sweepBuckets();

  const limit = rateLimit(`submit:${clientKey(req)}`, 5, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      {
        ok: false,
        errors: [
          `That's ${5} submissions in a minute. Impressive. Try again in ${limit.retryAfter}s.`,
        ],
      },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, errors: ["Malformed request."] }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  const result = validateSubmission(raw, CONTENT_TYPES, TRIGGERS);

  if (!result.ok) {
    return NextResponse.json({ ok: false, errors: result.errors }, { status: 400 });
  }

  /* Attribution. The handle stays free text — someone logged in is still
     allowed to post under any name, including "anonymous" if they type it —
     but the session, when there is one, is the only durable link back to a
     real account. A blank handle from a logged-in submitter falls back to
     their account name rather than "anonymous". */
  let userId: string | null = null;
  let author = result.value.author;

  const sessionId = await getSessionUserId().catch(() => null);
  if (sessionId) {
    // A cookie can outlive the row it names, so confirm the account is live
    // before pinning a submission to it.
    const user = await findUserById(sessionId).catch(() => null);
    if (user) {
      userId = user.id;
      const typedHandle = typeof raw.author === "string" ? raw.author.trim() : "";
      if (!typedHandle) author = sanitizeAuthor(user.name);
    }
  }

  try {
    const saved = await createSubmission({
      type: result.value.type as ContentType,
      text: result.value.text,
      trigger: result.value.trigger as Trigger,
      author,
      userId,
    });

    return NextResponse.json({
      ok: true,
      submission: { id: saved.id, text: saved.text, author: saved.author },
    });
  } catch (err) {
    console.error("[api/submissions POST]", err);
    return NextResponse.json(
      { ok: false, errors: ["Could not save that. The database is having a moment."] },
      { status: 500 },
    );
  }
}
