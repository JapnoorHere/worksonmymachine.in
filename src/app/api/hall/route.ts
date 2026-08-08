import { NextResponse } from "next/server";
import { contributorStats } from "@/lib/submissions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await contributorStats();
    // `linked`, not the id itself: the hall only needs to say "this handle is a
    // real account", and there's no reason to publish user ids to do that.
    const contributors = stats.map(({ userId, ...rest }) => ({
      ...rest,
      linked: userId !== null,
    }));
    return NextResponse.json({ contributors });
  } catch (err) {
    console.error("[api/hall]", err);
    return NextResponse.json({ contributors: [] });
  }
}
