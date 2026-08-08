"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { SoundToggle } from "./SoundToggle";
import { Button } from "./ui/Button";
import { useAuth } from "./providers/AuthProvider";
import { spring, ease } from "@/lib/motion";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "/#features", label: "Product" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/changelog", label: "Changelog" },
  { href: "/contribute", label: "Contribute" },
  { href: "/hall-of-cringe", label: "Hall of Cringe" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  // Don't let the page scroll behind the mobile sheet.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled || open
          ? "border-b border-line bg-bg/85 backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-5 sm:px-7">
        <Link href="/" className="rounded-lg" aria-label="This Is Fine, home">
          <Logo />
        </Link>

        <ul className="ml-4 hidden items-center gap-0.5 lg:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 text-[13.5px] font-medium transition-colors",
                  pathname === l.href ? "text-ink" : "text-ink-soft hover:text-ink",
                )}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:block">
            <SoundToggle />
          </div>
          <ThemeToggle compact />
          {user ? (
            <Link href="/dashboard" className="hidden rounded-[10px] sm:block">
              <Button size="sm">Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link
                href="/signup?mode=login"
                className="hidden rounded-lg px-2 py-1.5 text-[13px] font-medium text-ink-soft transition-colors hover:text-ink sm:block"
              >
                Log in
              </Link>
              <Link href="/signup" className="hidden rounded-[10px] sm:block">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid size-9 cursor-pointer place-items-center rounded-full border border-line bg-surface-2 text-ink lg:hidden"
          >
            <svg viewBox="0 0 20 20" className="size-4" aria-hidden>
              <motion.path
                d="M3 6h14"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                animate={open ? { d: "M4.5 4.5L15.5 15.5" } : { d: "M3 6h14" }}
                transition={spring.snappy}
              />
              <motion.path
                d="M3 14h14"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                animate={open ? { d: "M15.5 4.5L4.5 15.5" } : { d: "M3 14h14" }}
                transition={spring.snappy}
              />
            </svg>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: ease.out }}
            className="overflow-hidden border-t border-line bg-bg lg:hidden"
          >
            <ul className="mx-auto flex max-w-6xl flex-col px-5 py-3 sm:px-7">
              {LINKS.map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i + 0.05, ...spring.gentle }}
                >
                  <Link
                    href={l.href}
                    className="block border-b border-line py-3.5 font-display text-lg font-semibold tracking-tight"
                  >
                    {l.label}
                  </Link>
                </motion.li>
              ))}
              <li className="flex items-center gap-3 pt-4 pb-2">
                <Link href={user ? "/dashboard" : "/signup"} className="flex-1">
                  <Button size="lg" className="w-full">
                    {user ? "Dashboard" : "Get started"}
                  </Button>
                </Link>
                <SoundToggle />
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
