import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { listByUser } from "@/lib/submissions";

export const dynamic = "force-dynamic";

/**
 * Your own submissions, whatever happened to them.
 *
 * Deliberately wider than the public view in `/api/submissions`: this returns
 * rejected rows and the pre-edit text too. That's not a leak — it's the
 * caller's own writing, and "a human read it and said no" is a far better
 * answer than the silence contributors got before.
 */
export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ ok: false, submissions: [] }, { status: 401 });

  try {
    const mine = await listByUser(userId, 100);
    return NextResponse.json({
      ok: true,
      submissions: mine.map((s) => ({
        id: s.id,
        type: s.type,
        text: s.text,
        trigger: s.trigger,
        author: s.author,
        status: s.status,
        votes: s.votes,
        createdAt: s.createdAt,
        reviewedAt: s.reviewedAt,
        editedFrom: s.editedFrom,
      })),
    });
  } catch (err) {
    console.error("[api/me/submissions]", err);
    return NextResponse.json({ ok: false, submissions: [] }, { status: 500 });
  }
}
