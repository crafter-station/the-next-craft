import type { Metadata } from "next";
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
  title: "The Next Craft — Hackathon por Crafter Station × Next",
  description:
    "De cero a producto en 36 horas. 24–26 de julio, 2026 · Lima, Perú.",
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
