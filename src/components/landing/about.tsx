import { ScrambleText } from "@/components/effects/scramble-text";

export function About() {
  return (
    <section
      id="que-es"
      className="relative px-6 md:px-12 lg:px-24 py-24 lg:py-32 bg-[var(--void)] overflow-hidden"
    >
      <div className="mx-auto max-w-7xl w-full flex flex-col gap-10 relative scroll-reveal">
        {/* Headline pixel PETSCII — decode binario→texto */}
        <ScrambleText
          as="h2"
          text={"No es un evento.\nSon 12 horas de construir."}
          className="pixel-heading whitespace-pre-line"
          style={{ fontSize: "clamp(1.5rem, 4vw, 2.75rem)" }}
        />

        {/* Body */}
        <div className="flex flex-col gap-5 max-w-2xl">
          <p
            className="font-sans text-[var(--text)] leading-[1.75]"
            style={{ fontSize: "clamp(1rem, 1.5vw, 1.125rem)" }}
          >
            The Next Craft es el hackathon presencial de Crafter Station × Next.
            12 horas de trabajo real, en simultáneo en Lima, Bogotá y Guatemala,
            con 120 hackers que vienen a resolver problemas de verdad.
          </p>
          <p
            className="font-sans text-[var(--text)] leading-[1.75]"
            style={{ fontSize: "clamp(1rem, 1.5vw, 1.125rem)" }}
          >
            La admisión es selectiva. No hay cupo para espectadores ni espacio
            para slides bonitas. Se viene a shippear producto real: con
            usuarios, con datos, con algo que funcione al final del reloj.
          </p>
        </div>
      </div>
    </section>
  );
}
