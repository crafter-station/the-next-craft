import { About } from "@/components/landing/about";
import { BlueprintRuler } from "@/components/landing/blueprint-ruler";
import { Faq } from "@/components/landing/faq";
import { FinalCta } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";
import { Hero } from "@/components/landing/hero";
import { Nav } from "@/components/landing/nav";
import { Organizers } from "@/components/landing/organizers";
import { Prizes } from "@/components/landing/prizes";
import { Schedule } from "@/components/landing/schedule";
import { Sponsors } from "@/components/landing/sponsors";
import { Tldr } from "@/components/landing/tldr";
import { Tracks } from "@/components/landing/tracks";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "The Next Craft",
  startDate: "2026-07-24T18:00:00-05:00",
  endDate: "2026-07-26T13:00:00-05:00",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  eventStatus: "https://schema.org/EventScheduled",
  location: {
    "@type": "Place",
    name: "Lima, Perú",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Lima",
      addressCountry: "PE",
    },
  },
  organizer: {
    "@type": "Organization",
    name: "Crafter Station",
    url: "https://crafterstation.com",
  },
  description:
    "De cero a producto en 36 horas. Hackathon presencial en Lima, Perú — 24–26 de julio, 2026. 150 hackers, equipos de 3–5, $5,000 USD al ganador. Postula hasta el 10 de julio.",
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
      <BlueprintRuler />
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
        <Organizers />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
