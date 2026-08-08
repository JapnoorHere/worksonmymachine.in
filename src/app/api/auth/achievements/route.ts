import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { setAchievements } from "@/lib/users";
import { ACHIEVEMENTS } from "@/lib/content";

export const dynamic = "force-dynamic";

const KNOWN_IDS = new Set(ACHIEVEMENTS.map((a) => a.id));

/**
 * Syncs unlocked achievements onto the account.
 *
 * Allow-list, not deny-list — same posture as `validateSubmission`. The body
 * is a client claim, so an id that isn't in `ACHIEVEMENTS` never reaches the
 * database. The response is the merged set, which is what the client adopts:
 * a sync can add to your progress, never subtract from it.
 */
export async function POST(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ ok: false }, { status: 401 });

  let body: { ids?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const ids = Array.isArray(body.ids)
    ? [...new Set(body.ids.filter((id): id is string => typeof id === "string" && KNOWN_IDS.has(id)))]
    : [];

  try {
    const merged = await setAchievements(userId, ids);
    if (!merged) return NextResponse.json({ ok: false }, { status: 401 });
    return NextResponse.json({ ok: true, achievements: merged });
  } catch (err) {
    console.error("[api/auth/achievements]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
