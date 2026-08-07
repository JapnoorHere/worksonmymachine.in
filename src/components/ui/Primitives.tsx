import { cn } from "@/lib/cn";

export function Card({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[14px] border border-line bg-surface shadow-soft",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

type BadgeTone = "neutral" | "ember" | "moss" | "warn" | "smoke";

const BADGE: Record<BadgeTone, string> = {
  neutral: "bg-surface-2 text-ink-soft border-line",
  ember: "bg-ember-wash text-ember border-transparent",
  moss: "bg-moss-wash text-moss border-transparent",
  warn: "bg-warn-wash text-warn border-transparent",
  smoke: "bg-smoke-wash text-smoke border-transparent",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1",
        "font-mono text-[10.5px] tracking-[0.1em] uppercase",
        BADGE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Section eyebrow — small monospace label above a heading. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "font-mono text-[11px] tracking-[0.22em] text-ember uppercase",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-line", className)} />;
}

/** Wraps page content at a consistent measure. */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("mx-auto w-full max-w-6xl px-5 sm:px-7", className)}>{children}</div>;
}
