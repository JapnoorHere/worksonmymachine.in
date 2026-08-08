"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  age: number | null;
  vibes: string[];
  trust: number;
  achievements: string[];
}

interface AuthCtx {
  user: AuthUser | null;
  loading: boolean;
  mounted: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  loading: true,
  mounted: false,
  refresh: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(Ctx);

/**
 * The one place that knows whether a real session exists.
 *
 * Everything else — the nav, the dashboard, the signup page — used to guess
 * independently (or not at all, in the nav's case, which is why it kept
 * showing "Log in" to people who'd just signed up). This fetches
 * `/api/auth/me` once on mount and exposes the result everywhere via
 * context, same shape as `AchievementProvider`. `refresh()` lets
 * signup/login call it the instant a session is created, instead of waiting
 * for the next full page load to notice.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = (await res.json()) as { ok: boolean; user?: AuthUser };
      setUser(
        data.ok && data.user
          ? { ...data.user, achievements: data.user.achievements ?? [] }
          : null,
      );
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    void refresh().finally(() => setLoading(false));
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  }, []);

  return <Ctx.Provider value={{ user, loading, mounted, refresh, logout }}>{children}</Ctx.Provider>;
}
