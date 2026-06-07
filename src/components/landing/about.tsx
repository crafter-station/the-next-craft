export function About() {
  return (
    <section
      id="que-es"
      className="relative px-6 md:px-12 lg:px-24 py-24 bg-[var(--paper)]"
    >
      {/* Corner marks */}
      <span className="corner corner-tl" aria-hidden="true" />
      <span className="corner corner-tr" aria-hidden="true" />
      <span className="corner corner-bl" aria-hidden="true" />
      <span className="corner corner-br" aria-hidden="true" />

      <div className="mx-auto max-w-7xl w-full flex flex-col gap-12">
        {/* Section label */}
        <p className="section-label">[01] — ¿QUÉ ES?</p>

        {/* Display headline */}
        <h2
          className="font-sans font-extrabold leading-none tracking-tight text-[var(--blue)]"
          style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
        >
          No es un evento.
          <br />
          Es 36 horas de construir.
        </h2>

        {/* Body paragraphs */}
        <div className="flex flex-col gap-6 max-w-prose">
          <p
            className="font-sans text-[var(--ink)] leading-relaxed"
            style={{ fontSize: "clamp(1rem, 1.5vw, 1.125rem)" }}
          >
            The Next Craft es el hackathon presencial de Crafter Station × Next
            en Lima. Setenta y dos horas acotadas a treinta y seis de trabajo
            real, en un solo lugar, con cien cincuenta hackers que vienen a
            resolver problemas de verdad.
          </p>
          <p
            className="font-sans text-[var(--ink)] leading-relaxed"
            style={{ fontSize: "clamp(1rem, 1.5vw, 1.125rem)" }}
          >
            La admisión es selectiva. No hay cupo para espectadores ni espacio
            para slides bonitas. Se viene a shippear producto real: con
            usuarios, con datos, con algo que funcione al final del reloj.
          </p>
        </div>

        {/* Closing line */}
        <p className="font-mono text-[var(--blue)] text-sm border-l-2 border-[var(--blue)] pl-4">
          &gt; solo cracks. solo producto.
        </p>
      </div>
    </section>
  );
}
