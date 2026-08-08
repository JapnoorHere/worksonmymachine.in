"use client";

import { SoundProvider } from "./SoundProvider";
import { ThemeProvider } from "./ThemeProvider";
import { ToastProvider } from "./ToastProvider";
import { AchievementProvider } from "./AchievementProvider";
import { DailyProvider } from "./DailyProvider";
import { AuthProvider } from "./AuthProvider";

/**
 * Provider order matters: toasts need sound, achievements need toasts, and
 * achievements now need auth too — unlocks sync onto the account when there
 * is one, so `AuthProvider` has to resolve above them. Theme and daily
 * content are independent of the rest.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SoundProvider>
        <ToastProvider>
          <AuthProvider>
            <AchievementProvider>
              <DailyProvider>{children}</DailyProvider>
            </AchievementProvider>
          </AuthProvider>
        </ToastProvider>
      </SoundProvider>
    </ThemeProvider>
  );
}
