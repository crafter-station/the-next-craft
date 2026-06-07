import type { Metadata, Viewport } from "next";
import { Archivo, Borel, IBM_Plex_Mono, Silkscreen } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

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
    default: "The Next Craft — Hackathon por Crafter Station × Next",
    template: "%s · The Next Craft",
  },
  description:
    "De cero a producto en 36 horas. Hackathon presencial en Lima, Perú — 24–26 de julio, 2026. 150 hackers, equipos de 3–5, $5,000 USD al ganador. Postula hasta el 10 de julio.",
  keywords: [
    "hackathon",
    "Lima",
    "Perú",
    "Crafter Station",
    "Next.js",
    "programación",
    "LATAM",
    "2026",
  ],
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: "https://thenextcraft.crafter.run",
    siteName: "The Next Craft",
    title: "The Next Craft — Hackathon por Crafter Station × Next",
    description:
      "De cero a producto en 36 horas. Hackathon presencial en Lima, Perú — 24–26 de julio, 2026. 150 hackers, equipos de 3–5, $5,000 USD al ganador. Postula hasta el 10 de julio.",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Next Craft — Hackathon por Crafter Station × Next",
    description:
      "De cero a producto en 36 horas. Hackathon presencial en Lima, Perú — 24–26 de julio, 2026. 150 hackers, equipos de 3–5, $5,000 USD al ganador. Postula hasta el 10 de julio.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  themeColor: "#1A1A17",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${archivo.variable} ${silkscreen.variable} ${ibmPlexMono.variable} ${borel.variable} h-full antialiased scroll-pt-20`}
    >
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:bg-[var(--bright)] focus:text-[var(--void)] focus:font-mono focus:text-sm focus:px-4 focus:py-2 focus:outline-none"
        >
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
