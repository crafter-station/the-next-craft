import { getTranslations, setRequestLocale } from "next-intl/server";

import { About } from "@/components/landing/about";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { Nav } from "@/components/landing/nav";
import { Prizes } from "@/components/landing/prizes";
import { Schedule } from "@/components/landing/schedule";
import { Sponsors } from "@/components/landing/sponsors";
import { Tldr } from "@/components/landing/tldr";
import { Tracks } from "@/components/landing/tracks";

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "metadata" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "The Next Craft",
    startDate: "2026-07-24T18:00:00-05:00",
    endDate: "2026-07-26T13:00:00-05:00",
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
    organizer: {
      "@type": "Organization",
      name: "Crafter Station",
      url: "https://crafterstation.com",
    },
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
      <Nav />
      <main id="main-content">
        <Hero />
        <About />
        <Tldr />
        <Tracks />
        <Schedule />
        <Prizes />
        <Sponsors />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
