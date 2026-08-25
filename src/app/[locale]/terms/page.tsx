import type { Metadata } from "next";

import { setRequestLocale } from "next-intl/server";

const copy = {
  es: {
    title: "Terminos de participacion",
    intro:
      "Al confirmar tu registro para The Next Craft, aceptas estas condiciones:",
    items: [
      "Participaras de forma presencial, respetando las reglas, horarios, organizadores, mentores y demas participantes.",
      "El proyecto que presentes debe ser trabajo de tu equipo. Tu equipo conserva la propiedad intelectual de lo que construya.",
      "Autorizas el uso de tu nombre, imagen y material audiovisual del evento para comunicar y documentar The Next Craft.",
      "Tu documento de identidad se usa exclusivamente para validar tu acreditacion y se almacena cifrado.",
      "La foto que subas sera procesada por OpenAI para crear un retrato pixel art. La foto fuente se elimina cuando el badge termina de generarse.",
      "Los organizadores pueden retirar a quien incumpla estas reglas o ponga en riesgo la seguridad y convivencia del evento.",
    ],
  },
  en: {
    title: "Participation terms",
    intro:
      "By confirming your registration for The Next Craft, you agree to these terms:",
    items: [
      "You will participate in person and respect the rules, schedule, organizers, mentors, and other participants.",
      "The project you submit must be your team's work. Your team retains ownership of what it builds.",
      "You authorize use of your name, likeness, and event footage to communicate and document The Next Craft.",
      "Your identity document is used only for accreditation and is stored encrypted.",
      "Your uploaded photo will be processed by OpenAI to create pixel art. The source photo is deleted after successful badge generation.",
      "Organizers may remove anyone who breaks these rules or puts event safety and conduct at risk.",
    ],
  },
};

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/terms">): Promise<Metadata> {
  const { locale } = await params;
  return {
    title:
      locale === "en" ? "Participation terms" : "Terminos de participacion",
    description:
      locale === "en"
        ? "Participation and privacy terms for The Next Craft."
        : "Terminos de participacion y privacidad de The Next Craft.",
    robots: { index: false, follow: false },
  };
}

export default async function TermsPage({
  params,
}: PageProps<"/[locale]/terms">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = copy[locale === "en" ? "en" : "es"];
  return (
    <main
      id="main-content"
      className="relative min-h-screen px-5 py-12 md:py-20"
    >
      <div className="grid-bg" aria-hidden="true" />
      <article className="relative z-10 mx-auto max-w-3xl border border-[var(--line)] bg-[var(--screen-dim)] p-6 md:p-10">
        <p className="section-label">THE NEXT CRAFT · TERMS v2026-08-24</p>
        <h1 className="pixel-heading mt-5 break-words text-xl sm:text-3xl md:text-5xl">
          {t.title}
        </h1>
        <p className="mt-6 text-[var(--text-dim)]">{t.intro}</p>
        <ol className="mt-8 space-y-5">
          {t.items.map((item, index) => (
            <li
              key={item}
              className="flex gap-4 border-t border-[var(--border)] pt-5"
            >
              <span className="font-pixel text-sm text-[var(--bright)]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </article>
    </main>
  );
}
