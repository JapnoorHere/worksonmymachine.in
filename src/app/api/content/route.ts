import { NextResponse } from "next/server";
import { approvedPools } from "@/lib/submissions";

export const dynamic = "force-dynamic";

/**
 * Approved community content, bucketed by type. The client merges this into the
 * built-in pools before running the daily rotation, so an approved line is
 * indistinguishable from one we wrote.
 */
export async function GET() {
  try {
    const pools = await approvedPools();
    return NextResponse.json(
      { pools },
      { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=600" } },
    );
  } catch (err) {
    console.error("[api/content]", err);
    // Never let the content endpoint break the page — the built-in pool is enough.
    return NextResponse.json({ pools: {} });
  }
}
