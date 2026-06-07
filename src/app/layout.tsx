import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const bricolage = Bricolage_Grotesque({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
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
  themeColor: "#002FA7",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${bricolage.variable} ${ibmPlexMono.variable} h-full antialiased scroll-pt-20`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
