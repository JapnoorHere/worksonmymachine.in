"use client";

import { motion } from "framer-motion";
import { Card, Eyebrow, Badge } from "@/components/ui/Primitives";
import { spring } from "@/lib/motion";
import type { ContentType } from "@/lib/content";

/**
 * Renders a contributor's text inside the real component it would appear in.
 *
 * SAFETY: `text` arrives here as an untrusted string and is placed as a JSX
 * *child* in every branch below — React escapes text nodes by construction, so
 * markup in the input renders as visible characters rather than elements. There
 * is no dangerouslySetInnerHTML here, no interpolation into an href/src/style,
 * and no path by which this value becomes code. If you extend this file, keep
 * that invariant: the contributor supplies content, never markup, never a URL.
 */
export function PreviewSurface({
  type,
  text,
  author,
}: {
  type: ContentType;
  text: string;
  author: string;
}) {
  // A visible placeholder keeps the preview from collapsing while they type.
  const body = text.trim() || "Your text will appear here.";
  const dim = !text.trim();

  const wrap = (children: React.ReactNode) => (
    <motion.div
      key={type}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: dim ? 0.55 : 1, y: 0 }}
      transition={spring.snappy}
    >
      {children}
    </motion.div>
  );

  switch (type) {
    case "error":
      return wrap(
        <div className="rounded-xl border border-line bg-surface p-4">
          <div className="mb-1.5 flex items-baseline justify-between">
            <span className="text-[13px] font-semibold">Full name</span>
            <span className="text-[11.5px] text-ink-faint">required</span>
          </div>
          <div className="flex h-11 items-center rounded-[10px] border border-ember bg-surface px-3">
            <span className="text-[15px] text-ink">Ada Lovelace</span>
            <span className="ml-auto text-[13px] text-ember" aria-hidden>
              ✕
            </span>
          </div>
          <p className="pt-1.5 text-[12.5px] leading-snug text-ember">{body}</p>
        </div>,
      );

    case "loading":
      return wrap(
        <div className="rounded-xl border border-line bg-surface p-6 text-center">
          <div className="mx-auto mb-4 size-10">
            <span className="block size-10 animate-spin rounded-full border-[3px] border-line border-t-ember" />
          </div>
          <div className="space-y-1.5">
            <p className="flex items-center justify-center gap-2 font-mono text-[12px] text-ink-faint opacity-40">
              <span className="size-1.5 rounded-full bg-moss" />
              Reticulating splines
            </p>
            <p className="flex items-center justify-center gap-2 font-mono text-[12.5px] text-ink">
              <span className="size-1.5 rounded-full bg-ember" />
              {body}
              <span className="tif-blink">…</span>
            </p>
          </div>
        </div>,
      );

    case "achievement":
      return wrap(
        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-float">
          <div className="flex items-stretch">
            <div className="w-1 shrink-0 bg-ember" />
            <div className="flex flex-1 items-start gap-3 p-3.5">
              <span className="mt-px text-lg leading-none" aria-hidden>
                🏆
              </span>
              <div className="min-w-0 flex-1">
                <p className="mb-0.5 font-mono text-[10px] tracking-[0.16em] text-ember uppercase">
                  Achievement unlocked
                </p>
                <p className="text-[13.5px] leading-snug font-semibold">{body}</p>
                <p className="mt-1 text-[12.5px] text-ink-soft">
                  Contributed by @{author || "anonymous"}
                </p>
              </div>
            </div>
          </div>
        </div>,
      );

    case "stat":
      return wrap(
        <Card className="p-5">
          <p className="text-[12px] text-ink-faint">{body}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-[32px] leading-none font-extrabold tracking-tighter">
              1.4
            </span>
            <span className="font-mono text-[11px] text-moss">▲ 0%</span>
          </div>
          <p className="mt-2 text-[12px] text-ink-soft">Measured against nothing.</p>
        </Card>,
      );

    case "roast":
      return wrap(
        <div className="flex justify-center">
          <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-surface py-1.5 pr-4 pl-1.5">
            <span className="rounded-full bg-ember px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wider text-ember-ink uppercase">
              Roast
            </span>
            <span className="text-[12.5px] text-ink-soft">{body}</span>
          </div>
        </div>,
      );

    case "toast":
      return wrap(
        <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-float">
          <div className="flex items-stretch">
            <div className="w-1 shrink-0 bg-ink-faint" />
            <div className="flex flex-1 items-start gap-3 p-3.5">
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] leading-snug font-semibold">
                  {body.split(/\s*[—–:]\s*/)[0]}
                </p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">
                  {body.split(/\s*[—–:]\s*/).slice(1).join(" — ") || "No further details."}
                </p>
              </div>
              <span className="text-ink-faint" aria-hidden>
                ✕
              </span>
            </div>
          </div>
        </div>,
      );

    case "excuse":
      return wrap(
        <div className="rounded-xl border border-line bg-surface p-6 text-center">
          <p className="font-display text-[52px] leading-none font-extrabold tracking-tighter text-ember">
            404
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-ink">{body}</p>
          <p className="mt-3 font-mono text-[10.5px] text-ink-faint">
            excuse rotates daily · yours would join the rotation
          </p>
        </div>,
      );

    case "buzzword": {
      const [word, ...rest] = body.split(/\s*[—–-]\s*/);
      return wrap(
        <Card className="p-5">
          <Eyebrow>Word of the day</Eyebrow>
          <p className="mt-3 font-display text-[26px] leading-tight font-bold tracking-tight text-ember">
            {word}
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
            {rest.join(" — ") || "Add a definition after an em dash."}
          </p>
        </Card>,
      );
    }

    default:
      return wrap(
        <Card className="p-5">
          <Badge>preview</Badge>
          <p className="mt-3 text-[14px]">{body}</p>
        </Card>,
      );
  }
}
