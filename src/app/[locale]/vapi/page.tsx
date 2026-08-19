import type { Metadata } from "next";
import Image from "next/image";

import { setRequestLocale } from "next-intl/server";

import { VapiCountdown } from "@/components/events/vapi-countdown";

const EVENT_URL = "https://luma.com/tncvapi";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/vapi">): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === "en";

  return {
    title: isEnglish ? "Vapi event countdown" : "Cuenta regresiva Vapi",
    description: isEnglish
      ? "We start August 19 at 19:00 UTC-5."
      : "Empezamos el 19 de agosto a las 19:00 UTC-5.",
    openGraph: {
      images: ["/brand-assets/events/vapi-luma-square.png"],
    },
  };
}

export default async function VapiEventPage({
  params,
}: PageProps<"/[locale]/vapi">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isEnglish = locale === "en";

  return (
    <main
      id="main-content"
      className="relative flex min-h-svh items-center overflow-hidden bg-[var(--void)] px-5 py-8 sm:px-8 lg:px-12"
    >
      <div className="grid-bg" aria-hidden="true" />

      <div className="relative z-10 mx-auto grid w-full max-w-[1480px] items-center gap-8 lg:grid-cols-[minmax(320px,0.82fr)_minmax(520px,1.18fr)] lg:gap-16 xl:gap-24">
        <div className="reveal reveal-d0 mx-auto w-full max-w-[620px] lg:mx-0">
          <Image
            src="/brand-assets/events/vapi-luma-square.png"
            alt={
              isEnglish
                ? "Vapi and The Next Craft event: What if your app could call you?"
                : "Evento de Vapi y The Next Craft: ¿Y si tu app pudiera llamarte?"
            }
            width={1080}
            height={1080}
            priority
            sizes="(max-width: 1023px) min(88vw, 620px), 42vw"
            className="h-auto w-full"
          />
        </div>

        <section
          className="reveal reveal-d1 w-full"
          aria-labelledby="event-title"
        >
          <h1 id="event-title" className="sr-only">
            {isEnglish
              ? "What if your app could call you?"
              : "¿Y si tu app pudiera llamarte?"}
          </h1>
          <VapiCountdown locale={locale} />

          <div className="mt-7 flex flex-wrap items-center gap-5 sm:mt-9">
            <a
              href={EVENT_URL}
              target="_blank"
              rel="noreferrer"
              className="cta-btn keycap inline-flex items-center font-mono text-sm font-semibold uppercase tracking-[0.12em] px-5 py-3"
            >
              {isEnglish ? "View event" : "Ver evento"}
              <span className="cta-arrow ml-2" aria-hidden="true">
                ↗
              </span>
            </a>
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-[var(--text-dim)]">
              19 AGO · 19:00 UTC-5
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
