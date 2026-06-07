import { SectionHeader } from "./section-header";

export function About() {
  return (
    <section
      id="que-es"
      className="relative px-6 md:px-12 lg:px-24 py-24 lg:py-32 bg-[var(--void)] overflow-hidden"
    >
      <div className="mx-auto max-w-7xl w-full flex flex-col gap-10 relative scroll-reveal">
        <SectionHeader line="10" name="MANIFIESTO" />

        {/* Headline pixel PETSCII */}
        <h2
          className="pixel-heading"
          style={{ fontSize: "clamp(1.5rem, 4vw, 2.75rem)" }}
        >
          No es un evento.
          <br />
          Es 36 horas de construir.
        </h2>

        {/* Body */}
        <div className="flex flex-col gap-5 max-w-2xl">
          <p
            className="font-sans text-[var(--text)] leading-[1.75]"
            style={{ fontSize: "clamp(1rem, 1.5vw, 1.125rem)" }}
          >
            The Next Craft es el hackathon presencial de Crafter Station × Next
            en Lima. 36 horas de trabajo real, en un solo lugar, con 150 hackers
            que vienen a resolver problemas de verdad.
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

        {/* Cierre — output de programa */}
        <p className="font-mono text-sm text-[var(--bright)] tracking-[0.05em] leading-[1.4] border-l-2 border-[var(--line)] pl-4">
          &gt; solo cracks. solo producto.
        </p>
      </div>
    </section>
  );
}
