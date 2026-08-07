import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { THEME_BOOT_SCRIPT } from "@/components/providers/ThemeProvider";
import { AppProviders } from "@/components/providers/AppProviders";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { CookieBanner } from "@/components/gags/CookieBanner";
import { ChatWidget } from "@/components/gags/ChatWidget";
import { AmbientToasts } from "@/components/gags/AmbientToasts";
import { BoringModeNotice } from "@/components/gags/BoringModeNotice";
import { StatusTicker } from "@/components/landing/StatusTicker";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://worksonmymachine.in"),
  title: {
    default: "This Is Fine™ — the all-in-one platform for teams who have accepted it",
    template: "%s · This Is Fine™",
  },
  description:
    "Onboarding that fights back. A fake SaaS with real design, real animation, and a signup flow that refuses every name, age, and password you give it.",
  keywords: ["satire", "fake saas", "parody", "onboarding", "this is fine"],
  openGraph: {
    title: "This Is Fine™",
    description:
      "The all-in-one platform for teams who have accepted their situation. Every age is taken. Every name is taken. The dark mode button turns on the lights.",
    url: "https://worksonmymachine.in",
    siteName: "This Is Fine™",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "This Is Fine™",
    description: "A signup flow that rejects your age. Personally.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf6f0" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0c0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bricolage.variable} ${dmSans.variable} ${jetbrains.variable}`}
    >
      <head>
        {/* Applies the stored theme before first paint so the inversion never flashes. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body>
        <AppProviders>
          <a href="#main" className="skip-link">
            Skip to content
          </a>
          <StatusTicker />
          <Nav />
          <main id="main">{children}</main>
          <Footer />
          <CookieBanner />
          <ChatWidget />
          <AmbientToasts />
          <BoringModeNotice />
        </AppProviders>
      </body>
    </html>
  );
}
