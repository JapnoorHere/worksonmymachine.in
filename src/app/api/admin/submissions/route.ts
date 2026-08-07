import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { listSubmissions, setStatus } from "@/lib/submissions";
import { sanitizeText } from "@/lib/sanitize";

export const dynamic = "force-dynamic";

const DENIED = NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });

export async function GET(req: Request) {
  if (!(await isAdmin())) return DENIED;

  const status = new URL(req.url).searchParams.get("status") ?? "pending";
  const valid = ["pending", "approved", "rejected", "all"] as const;
  type Status = (typeof valid)[number];

  if (!valid.includes(status as Status)) {
    return NextResponse.json({ ok: false, error: "Bad status." }, { status: 400 });
  }

  try {
    const submissions = await listSubmissions(status as Status, 300);
    return NextResponse.json({ ok: true, submissions });
  } catch (err) {
    console.error("[api/admin/submissions GET]", err);
    return NextResponse.json({ ok: false, error: "Query failed." }, { status: 500 });
  }
}

/** Approve or reject, optionally rewriting the text first. */
export async function PATCH(req: Request) {
  if (!(await isAdmin())) return DENIED;

  let body: { id?: unknown; action?: unknown; text?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Malformed request." }, { status: 400 });
  }

  const { id, action } = body;

  if (typeof id !== "string" || !id) {
    return NextResponse.json({ ok: false, error: "Missing id." }, { status: 400 });
  }
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ ok: false, error: "Bad action." }, { status: 400 });
  }

  // Admin edits go through the same sanitizer as public input. Trusted reviewer,
  // untrusted clipboard.
  const text = body.text === undefined ? undefined : sanitizeText(body.text);

  try {
    const updated = await setStatus(id, action === "approve" ? "approved" : "rejected", text);
    if (!updated) {
      return NextResponse.json({ ok: false, error: "Not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, submission: updated });
  } catch (err) {
    console.error("[api/admin/submissions PATCH]", err);
    return NextResponse.json({ ok: false, error: "Update failed." }, { status: 500 });
  }
}
