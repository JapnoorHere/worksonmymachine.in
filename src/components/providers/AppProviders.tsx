"use client";

import { SoundProvider } from "./SoundProvider";
import { ThemeProvider } from "./ThemeProvider";
import { ToastProvider } from "./ToastProvider";
import { AchievementProvider } from "./AchievementProvider";
import { DailyProvider } from "./DailyProvider";
import { AuthProvider } from "./AuthProvider";

/**
 * Provider order matters: toasts need sound, achievements need toasts.
 * Theme, daily content, and auth are independent of the rest.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SoundProvider>
        <ToastProvider>
          <AchievementProvider>
            <DailyProvider>
              <AuthProvider>{children}</AuthProvider>
            </DailyProvider>
          </AchievementProvider>
        </ToastProvider>
      </SoundProvider>
    </ThemeProvider>
  );
}
