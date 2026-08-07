import { cn } from "@/lib/cn";

/** The mark: a containment vessel with a flame that is objectively not contained. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "tif-mood relative inline-grid size-8 shrink-0 place-items-center overflow-hidden rounded-[9px] bg-ember",
        "shadow-[0_1px_0_rgba(255,255,255,0.3)_inset,0_2px_6px_-2px_rgba(232,65,11,0.6)]",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-[18px] text-ember-ink" aria-hidden>
        <path
          d="M12 2.5c.4 3.1-1.3 4.3-2.7 5.6-1.7 1.5-3.1 3-3.1 5.7A5.8 5.8 0 0 0 12 19.6a5.8 5.8 0 0 0 5.8-5.8c0-2.2-1-3.6-2-4.9-.4 1-1.1 1.7-2 2.1.5-2.9-.6-6.4-1.8-8.5Z"
          fill="currentColor"
        />
        <path
          d="M12 19.6c-1.6 0-2.9-1.2-2.9-2.7 0-1.3.8-1.9 1.6-2.7.6-.6 1.1-1.3 1.1-2.3.9 1 2.1 2.4 2.1 4.2 0 1.8-1 3.5-1.9 3.5Z"
          fill="currentColor"
          opacity="0.45"
        />
      </svg>
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[16.5px] font-bold tracking-tight">
          This Is Fine
          <span className="ml-0.5 align-super text-[8px] font-normal text-ink-faint">™</span>
        </span>
        <span className="mt-[3px] font-mono text-[9px] tracking-[0.13em] text-ink-faint uppercase">
          Works On My Machine, Inc.
        </span>
      </span>
    </span>
  );
}
