import { useTranslations } from "next-intl";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { SectionHeader } from "./section-header";

type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export function Faq() {
  const t = useTranslations("faq");
  const items = t.raw("items") as readonly FaqItem[];

  return (
    <section
      id="faq"
      className="relative px-6 md:px-12 lg:px-24 py-24 bg-[var(--void)]"
    >
      <div className="mx-auto max-w-7xl w-full flex flex-col gap-8 scroll-reveal">
        <SectionHeader line="70" name={t("label")} />

        {/* Accordion */}
        <Accordion className="w-full" defaultValue={[]}>
          {items.map(({ id, question, answer }) => (
            <AccordionItem
              key={id}
              value={id}
              className="border-b border-[var(--line)]/35 border-t-0 border-l-0 border-r-0 first:border-t first:border-[var(--line)]/35"
            >
              <AccordionTrigger
                className={`
                  group/faq-trigger
                  w-full flex items-center justify-between gap-4
                  py-5 px-0
                  font-sans text-sm font-medium text-left
                  text-[var(--text)]
                  hover:no-underline hover:text-[var(--bright)]
                  focus-visible:ring-0 focus-visible:border-transparent
                  focus-visible:text-[var(--bright)]
                  focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--bright)] focus-visible:outline-offset-2
                  transition-colors duration-150
                  rounded-none border-none bg-transparent
                  [&_[data-slot=accordion-trigger-icon]]:text-[var(--bright)]
                  [&_[data-slot=accordion-trigger-icon]]:shrink-0
                `}
              >
                <span className="flex items-baseline gap-3 min-w-0">
                  <span className="shrink-0 font-mono text-xs font-semibold tracking-[0.12em] text-[var(--bright)] select-none">
                    {id}
                  </span>
                  <span className="leading-snug whitespace-nowrap overflow-hidden text-ellipsis">
                    {question}
                  </span>
                </span>
              </AccordionTrigger>

              <AccordionContent className="pb-0">
                <p className="max-w-prose pb-6 text-[var(--text-dim)] text-sm leading-[1.65] pl-[calc(2ch+0.75rem)]">
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
