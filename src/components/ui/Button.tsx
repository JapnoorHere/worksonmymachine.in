"use client";

import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/cn";
import { spring } from "@/lib/motion";
import { useSound } from "@/components/providers/SoundProvider";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-ember text-ember-ink border border-transparent shadow-[0_1px_0_rgba(255,255,255,0.22)_inset,0_2px_8px_-2px_rgba(232,65,11,0.5)] hover:bg-ember-hi",
  secondary:
    "bg-surface text-ink border border-line-strong shadow-soft hover:bg-surface-2 hover:border-ink-faint",
  outline:
    "bg-transparent text-ink border border-line-strong hover:bg-surface-2 hover:border-ink-faint",
  ghost: "bg-transparent text-ink-soft border border-transparent hover:bg-surface-2 hover:text-ink",
  danger: "bg-ink text-bg border border-transparent hover:opacity-90",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-lg",
  md: "h-10 px-4 text-[14px] gap-2 rounded-[10px]",
  lg: "h-12 px-6 text-[15px] gap-2.5 rounded-xl",
};

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children?: React.ReactNode;
}

/**
 * Buttons here have real physicality — press scales them down and pulls the
 * shadow in, so they feel like objects rather than colored rectangles. That
 * physicality is load-bearing for the humor: a button that feels good to press
 * is a button people will press again after it lies to them.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, className, children, onClick, disabled, ...rest },
  ref,
) {
  const { play } = useSound();

  return (
    <motion.button
      ref={ref}
      whileHover={disabled || loading ? undefined : { y: -1.5 }}
      whileTap={disabled || loading ? undefined : { scale: 0.965, y: 0 }}
      transition={spring.snappy}
      disabled={disabled || loading}
      onClick={(e) => {
        play("click");
        onClick?.(e);
      }}
      className={cn(
        "relative inline-flex cursor-pointer items-center justify-center font-medium whitespace-nowrap",
        "transition-colors duration-150 select-none",
        "disabled:cursor-not-allowed disabled:opacity-45",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {loading && (
        <motion.span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Spinner />
        </motion.span>
      )}
      <span className={cn("inline-flex items-center gap-[inherit]", loading && "opacity-0")}>
        {children}
      </span>
    </motion.button>
  );
});

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("size-4 animate-spin", className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
