import type { Metadata, Viewport } from "next";
import { Borel, IBM_Plex_Mono, Silkscreen } from "next/font/google";
import Script from "next/script";

import "../globals.css";

const silkscreen = Silkscreen({
  variable: "--font-marker",
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
  metadataBase: new URL("https://thenextcraft.org"),
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
      <body className="min-h-full bg-[var(--void)] text-[var(--text)]">
        {children}
        {/* Runs before hydration so JavaScript clients start in pager mode;
         * without JavaScript, the stacked fallback remains available. */}
        <Script id="enable-deck-pager" strategy="beforeInteractive">
          {`document.documentElement.classList.remove("deck-no-js");`}
        </Script>
      </body>
    </html>
  );
}
