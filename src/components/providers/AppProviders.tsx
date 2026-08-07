"use client";

import { SoundProvider } from "./SoundProvider";
import { ThemeProvider } from "./ThemeProvider";
import { ToastProvider } from "./ToastProvider";
import { AchievementProvider } from "./AchievementProvider";
import { DailyProvider } from "./DailyProvider";

/**
 * Provider order matters: toasts need sound, achievements need toasts.
 * Theme and daily content are independent of both.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SoundProvider>
        <ToastProvider>
          <AchievementProvider>
            <DailyProvider>{children}</DailyProvider>
          </AchievementProvider>
        </ToastProvider>
      </SoundProvider>
    </ThemeProvider>
  );
}
