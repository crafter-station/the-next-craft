import type { Metadata, Viewport } from "next";
import { Borel, IBM_Plex_Mono, Silkscreen } from "next/font/google";

import "../globals.css";

const silkscreen = Silkscreen({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const borel = Borel({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://thenextcraft.crafter.run"),
  title: {
    default: "The Next Craft — Deck para patrocinadores",
    template: "%s — The Next Craft",
  },
};

export const viewport: Viewport = {
  themeColor: "#1A1A17",
  colorScheme: "dark",
};

export default function DeckRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${silkscreen.variable} ${ibmPlexMono.variable} ${borel.variable} deck-no-js h-full antialiased`}
    >
      <head>
        {/* Runs before first paint: drop the no-JS fallback class so the deck
         * renders as a single fullscreen slide immediately (no flash of all
         * slides). If JS is disabled this never runs and the stacked fallback
         * remains. */}
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: required to run synchronously before paint
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.remove("deck-no-js");`,
          }}
        />
      </head>
      <body className="min-h-full bg-[var(--void)] text-[var(--text)]">
        {children}
      </body>
    </html>
  );
}
