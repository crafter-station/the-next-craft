import { About } from "@/components/landing/about";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { Nav } from "@/components/landing/nav";
import { Prizes } from "@/components/landing/prizes";
import { Schedule } from "@/components/landing/schedule";
import { SectionDivider } from "@/components/landing/section-divider";
import { Sponsors } from "@/components/landing/sponsors";
import { Tldr } from "@/components/landing/tldr";
import { Tracks } from "@/components/landing/tracks";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "The Next Craft",
  startDate: "2026-07-25T09:00:00-05:00",
  endDate: "2026-07-25T21:00:00-05:00",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
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
  description:
    "De cero a producto en 12 horas. Hackathon presencial en Lima, Bogotá y Guatemala — 25 de julio, 2026. 150 hackers, equipos de 3–5, $5,000 USD al ganador. Postula hasta el 10 de julio.",
  offers: {
    "@type": "Offer",
    price: 0,
    priceCurrency: "USD",
    url: "https://thenextcraft.crafter.run",
  },
};

export default function Home() {
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
        <SectionDivider word="READY" />
        <About />
        <Tldr />
        <SectionDivider word="A CONSTRUIR" reverse />
        <Tracks />
        <Schedule />
        <SectionDivider word="$5,000" />
        <Prizes />
        <Sponsors />
        <Faq />
        <SectionDivider word="SHIP IT" reverse />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
