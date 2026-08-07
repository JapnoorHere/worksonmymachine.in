import { NextResponse } from "next/server";
import { contributorStats } from "@/lib/submissions";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const contributors = await contributorStats();
    return NextResponse.json({ contributors });
  } catch (err) {
    console.error("[api/hall]", err);
    return NextResponse.json({ contributors: [] });
  }
}
