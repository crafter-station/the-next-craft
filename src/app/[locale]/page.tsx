import { getTranslations, setRequestLocale } from "next-intl/server";

import { About } from "@/components/landing/about";
import { C64Stage } from "@/components/landing/c64-stage";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { Nav } from "@/components/landing/nav";
import { Prizes } from "@/components/landing/prizes";
import { Schedule } from "@/components/landing/schedule";
import { SectionTitle } from "@/components/landing/section-title";
import { Sponsors } from "@/components/landing/sponsors";
import { Tldr } from "@/components/landing/tldr";
import { Tracks } from "@/components/landing/tracks";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "metadata" });
  const tSections = await getTranslations({ locale, namespace: "sections" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "The Next Craft",
    startDate: "2026-07-25T09:00:00-05:00",
    endDate: "2026-07-25T21:00:00-05:00",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    inLanguage: locale,
    location: [
      {
        "@type": "Place",
        name: "Lima, Perú",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Lima",
          addressCountry: "PE",
        },
      },
      {
        "@type": "Place",
        name: "Bogotá, Colombia",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Bogotá",
          addressCountry: "CO",
        },
      },
      {
        "@type": "Place",
        name: "Ciudad de Guatemala, Guatemala",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Ciudad de Guatemala",
          addressCountry: "GT",
        },
      },
    ],
    organizer: [
      {
        "@type": "Organization",
        name: "Crafter Station",
        url: "https://crafterstation.com",
      },
      {
        "@type": "Organization",
        name: "Next Fellow",
        url: "https://nextfellow.ai",
      },
    ],
    description: t("description"),
    offers: {
      "@type": "Offer",
      price: 0,
      priceCurrency: "USD",
      url: `https://thenextcraft.crafter.run/${locale}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: structured data JSON-LD requires dangerouslySetInnerHTML
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Canvas fijo: la computadora viaja entre los [data-c64-anchor] */}
      <C64Stage />
      <Nav />
      <main id="main-content">
        <Hero />
        <SectionTitle line="10" name={tSections("manifesto")} />
        <About />
        <Tldr />
        {/* Tracks abre con su propio takeover tipográfico (sin SectionTitle) */}
        <Tracks />
        <Schedule />
        <SectionTitle line="50" name={tSections("prizes")} />
        <Prizes />
        <Sponsors />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
