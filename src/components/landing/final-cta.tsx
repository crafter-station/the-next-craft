// Registro por WhatsApp — único canal (ver docs/whatsapp-registration.md).
// Mientras no exista el número de producción (env vacía), el CTA cae al form
// viejo: el número de prueba de Meta solo atiende a 5 testers registrados.
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
const CTA_HREF = WHATSAPP_NUMBER
  ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      "Hola, quiero postular a The Next Craft",
    )}`
  : "https://forms.crafterstation.com/the-next-craft";
const CTA_LABEL = WHATSAPP_NUMBER ? "Postular por WhatsApp" : "Postular ahora";

export function FinalCta() {
  return (
    <section
      id="postular"
      className="relative px-4 sm:px-6 md:px-12 lg:px-24 py-16 bg-[var(--void)]"
    >
      {/* Pantalla C64 final */}
      <div className="relative mx-auto max-w-6xl overflow-hidden">
        <div
          className="scanlines absolute inset-0 pointer-events-none z-10"
          aria-hidden="true"
        />

        <div className="relative flex flex-col gap-7 px-6 py-12 md:px-12 md:py-16 scroll-reveal">
          {/* Comando de cierre */}
          <p
            className="font-mono text-sm leading-[1.4] text-[var(--bright)]"
            aria-hidden="true"
          >
            RUN POSTULAR
            <span className="cursor-blink">█</span>
          </p>

          {/* Headline pixel */}
          <h2
            className="pixel-heading"
            style={{ fontSize: "clamp(1.75rem, 5vw, 3.5rem)" }}
          >
            ¿Construyes?
            <br />
            Postula.
          </h2>

          {/* Deadline */}
          <p className="font-mono text-sm font-medium tracking-[0.15em] uppercase text-[var(--text-dim)]">
            DEADLINE: 10 JUL 2026 · 23:59 GMT-5
          </p>

          {/* CTA — keycap */}
          <div className="flex flex-col items-start gap-4 pt-1">
            <a
              href={CTA_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-btn keycap font-mono font-semibold text-sm tracking-[0.12em] uppercase px-8 py-4 transition-colors duration-150"
            >
              {CTA_LABEL} <span className="cta-arrow">→</span>
            </a>

            {/* Fine print */}
            <p className="font-mono text-xs leading-[1.5] text-[var(--text-dim)]">
              150 cupos. Admisión selectiva. Gratis.
              {WHATSAPP_NUMBER ? " 7 preguntas, 90 segundos." : ""}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
