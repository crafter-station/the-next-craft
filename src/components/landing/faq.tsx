import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { CornerMarks } from "./corner-marks";

const FAQS = [
  {
    id: "Q01",
    question: "¿Quién puede postular?",
    answer:
      "Cualquiera que construya: devs, diseñadores, PMs. La admisión es selectiva: importa lo que has hecho, no tu CV.",
  },
  {
    id: "Q02",
    question: "¿Cuánto cuesta?",
    answer: "Nada. Entrar es gratis. Lo difícil es entrar.",
  },
  {
    id: "Q03",
    question: "¿Puedo postular sin equipo?",
    answer: "Sí. Habrá formación de equipos en el kickoff. Equipos de 3 a 5.",
  },
  {
    id: "Q04",
    question: "¿Qué tengo que llevar?",
    answer:
      "Laptop, cargador y ganas. Comida, café y energía corren por nuestra cuenta.",
  },
  {
    id: "Q05",
    question: "¿Puedo usar IA?",
    answer:
      "Obvio. Es 2026. Pero el código se escribe durante las 36 horas — nada de proyectos precocinados.",
  },
  {
    id: "Q06",
    question: "¿De quién es la propiedad intelectual?",
    answer: "Tuya. 100%. Nosotros solo queremos verte shippear.",
  },
  {
    id: "Q07",
    question: "¿Es presencial?",
    answer: "Sí, en Lima. No hay modalidad remota — la gracia es estar ahí.",
  },
  {
    id: "Q08",
    question: "¿Cómo evalúa el jurado?",
    answer: "Demo en vivo de 3 minutos. Producto funcionando > pitch bonito.",
  },
] as const;

export function Faq() {
  return (
    <section
      id="faq"
      className="relative px-6 md:px-12 lg:px-24 py-24 bg-[var(--paper)]"
    >
      <CornerMarks />

      <div className="mx-auto max-w-7xl w-full flex flex-col gap-12">
        {/* Section label */}
        <p className="section-label">[07] — FAQ</p>

        {/* Accordion */}
        <Accordion className="w-full" defaultValue={[]}>
          {FAQS.map(({ id, question, answer }) => (
            <AccordionItem
              key={id}
              value={id}
              className="border-b border-[var(--blue)] border-t-0 border-l-0 border-r-0 first:border-t first:border-[var(--blue)]"
            >
              <AccordionTrigger
                className={`
                  group/faq-trigger
                  w-full flex items-center justify-between gap-4
                  py-5 px-0
                  font-mono text-sm font-medium text-left
                  text-[var(--ink)]
                  hover:no-underline hover:text-[var(--blue)]
                  focus-visible:outline-none focus-visible:text-[var(--blue)]
                  transition-colors duration-150
                  rounded-none border-none bg-transparent
                  [&_[data-slot=accordion-trigger-icon]]:text-[var(--blue)]
                  [&_[data-slot=accordion-trigger-icon]]:shrink-0
                `}
              >
                <span className="flex items-baseline gap-3 min-w-0">
                  <span className="shrink-0 font-mono text-xs font-semibold tracking-[0.1em] text-[var(--blue)] select-none">
                    {id}
                  </span>
                  <span className="leading-snug">{question}</span>
                </span>
              </AccordionTrigger>

              <AccordionContent className="pb-0">
                <p className="max-w-prose pb-6 text-[var(--ink-dim)] text-sm leading-relaxed pl-[calc(2ch+0.75rem)]">
                  {answer}
                </p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
