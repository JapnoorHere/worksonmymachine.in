"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Primitives";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/providers/AuthProvider";
import { TYPE_LABELS, type ContentType } from "@/lib/content";
import { riseIn, stagger } from "@/lib/motion";
import { cn } from "@/lib/cn";

/**
 * What happened to the things you wrote.
 *
 * Before this existed, a contributor had no way to find out: the pending board
 * shows everyone's queue by handle, the Hall shows approved totals, and a
 * rejection was silence. Submissions carry a `userId` now, so the account can
 * finally answer its own question — including for the rejected ones, which is
 * the answer people actually want.
 */

interface Mine {
  id: string;
  type: ContentType;
  text: string;
  status: "pending" | "approved" | "rejected";
  votes: number;
  createdAt: string;
  editedFrom: string | null;
}

/** Plain language, not database words. "rejected" is nobody's status. */
const STATUS: Record<Mine["status"], { label: string; className: string }> = {
  approved: { label: "in rotation", className: "bg-moss-wash text-moss" },
  pending: { label: "in review", className: "bg-warn-wash text-warn" },
  rejected: { label: "not used", className: "bg-surface-3 text-ink-faint" },
};

export function YourSubmissions() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<Mine[] | null>(null);

  useEffect(() => {
    if (!user) {
      setItems(null);
      return;
    }
    let cancelled = false;

    fetch("/api/me/submissions")
      .then((r) => r.json())
      .then((d: { submissions?: Mine[] }) => {
        if (!cancelled) setItems(d.submissions ?? []);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (authLoading) {
    return (
      <Card className="p-5">
        <div className="tif-shimmer h-4 w-44 rounded" />
        <div className="tif-shimmer mt-3 h-14 rounded-lg" />
      </Card>
    );
  }

  // Never render someone else's writing here — logged out means nothing to show.
  if (!user) {
    return (
      <Card className="p-8 text-center sm:p-12">
        <p className="text-[40px]" aria-hidden>
          🗂️
        </p>
        <h2 className="mt-4 text-[21px]">Submissions follow the account.</h2>
        <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-ink-soft">
          Log in and anything you send from this browser gets tied to you — so you
          can come back and see whether a human said yes.
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/signup?mode=login">
            <Button>Log in</Button>
          </Link>
          <Link href="/contribute">
            <Button variant="ghost">Write one anyway</Button>
          </Link>
        </div>
      </Card>
    );
  }

  if (items === null) {
    return (
      <Card className="p-5">
        <div className="tif-shimmer h-4 w-44 rounded" />
        <div className="tif-shimmer mt-3 h-14 rounded-lg" />
        <div className="tif-shimmer mt-2 h-14 rounded-lg" />
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="p-8 text-center sm:p-12">
        <p className="text-[40px]" aria-hidden>
          📝
        </p>
        <h2 className="mt-4 text-[21px]">Nothing yet.</h2>
        <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-ink-soft">
          Write one line and it lands in the same pool the rest of the site reads
          from. Community lines aren&apos;t kept in a corner — they&apos;re in the
          actual rotation.
        </p>
        <Link href="/contribute" className="mt-7 inline-block">
          <Button>Write your first</Button>
        </Link>
      </Card>
    );
  }

  const live = items.filter((i) => i.status === "approved").length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-[13px] text-ink-soft">
          <span className="font-semibold text-ink">{live}</span> of {items.length} in
          rotation. A human reads every one.
        </p>
        <Link
          href="/contribute"
          className="text-[13px] text-ember underline-offset-2 hover:underline"
        >
          Write another →
        </Link>
      </div>

      <motion.ul variants={stagger()} initial="hidden" animate="show" className="space-y-2.5">
        {items.map((item) => {
          const status = STATUS[item.status];
          return (
            <motion.li key={item.id} variants={riseIn}>
              <Card className="p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2 font-mono text-[10.5px] text-ink-faint">
                  <span className={cn("rounded px-2 py-1", status.className)}>
                    {status.label}
                  </span>
                  <span className="rounded bg-surface-2 px-2 py-1">
                    {TYPE_LABELS[item.type] ?? item.type}
                  </span>
                  {item.votes > 0 && (
                    <span className="rounded bg-surface-2 px-2 py-1">▲ {item.votes}</span>
                  )}
                  <span className="ml-auto">
                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <p className="mt-3 text-[14.5px] leading-relaxed">{item.text}</p>

                {item.editedFrom && (
                  <p className="mt-2 border-t border-line pt-2 text-[12px] leading-snug text-ink-faint">
                    A reviewer tightened this. You wrote: &ldquo;{item.editedFrom}&rdquo;
                  </p>
                )}

                {item.status === "rejected" && (
                  <p className="mt-2 border-t border-line pt-2 text-[12px] leading-snug text-ink-faint">
                    Didn&apos;t make it in. No notes, no appeal, no hard feelings —
                    write another.
                  </p>
                )}
              </Card>
            </motion.li>
          );
        })}
      </motion.ul>
    </div>
  );
}
