import { CornerMarks } from "./corner-marks";

export function About() {
  return (
    <section
      id="que-es"
      className="relative px-6 md:px-12 lg:px-24 py-32 lg:py-40 bg-[var(--paper)] overflow-hidden"
    >
      <CornerMarks />

      {/* Section number — watermark tecnico en fondo */}
      <span
        className="absolute right-0 top-1/2 -translate-y-1/2 font-mono font-bold leading-none select-none pointer-events-none text-[var(--blue)] translate-x-1/4"
        style={{ fontSize: "clamp(12rem, 30vw, 22rem)", opacity: 0.04 }}
        aria-hidden="true"
      >
        01
      </span>

      <div className="mx-auto max-w-7xl w-full flex flex-col gap-8 relative scroll-reveal">
        {/* Label + headline group — relacionados, gap pequeño */}
        <div className="flex flex-col gap-4">
          <p className="section-label">[01] — ¿QUÉ ES?</p>
          {/* Display headline — rompe el contenedor en desktop */}
          <h2
            className="font-sans font-extrabold leading-none text-[var(--blue)] lg:-mr-24"
            style={{
              fontSize: "clamp(2rem, 6vw, 4.5rem)",
              letterSpacing: "-0.03em",
              marginLeft: "-0.03em",
            }}
          >
            No es un evento.
            <br />
            Es 36 horas de construir.
          </h2>
        </div>

        {/* Body — columna izquierda, deja aire derecha */}
        <div className="flex flex-col gap-5 max-w-xl">
          <p
            className="font-sans text-[var(--ink)] leading-relaxed"
            style={{ fontSize: "clamp(1rem, 1.5vw, 1.125rem)" }}
          >
            The Next Craft es el hackathon presencial de Crafter Station × Next
            en Lima. 36 horas de trabajo real, en un solo lugar, con 150 hackers
            que vienen a resolver problemas de verdad.
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
        <p className="font-mono text-[var(--blue)] text-xs tracking-[0.05em] leading-[1.4] border-l-2 border-[var(--blue)] pl-4">
          &gt; solo cracks. solo producto.
        </p>
      </div>
    </section>
  );
}
