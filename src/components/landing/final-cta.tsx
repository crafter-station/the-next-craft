import { ScrambleText } from "@/components/effects/scramble-text";

// Registro por WhatsApp — único canal (ver docs/whatsapp-registration.md)
const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "51999999999";
const WA_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hola, quiero postular a The Next Craft",
)}`;

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

          {/* Headline pixel — decode binario→texto */}
          <ScrambleText
            as="h2"
            text={"¿Construyes?\nPostula."}
            className="pixel-heading whitespace-pre-line"
            style={{ fontSize: "clamp(1.75rem, 5vw, 3.5rem)" }}
            noise="glitch"
          />

          {/* Deadline */}
          <p className="font-mono text-sm font-medium tracking-[0.15em] uppercase text-[var(--text-dim)]">
            DEADLINE: 10 JUL 2026 · 23:59 GMT-5
          </p>

          {/* CTA — keycap */}
          <div className="flex flex-col items-start gap-4 pt-1">
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              data-magnetic
              className="cta-btn keycap font-mono font-semibold text-sm tracking-[0.12em] uppercase px-8 py-4 transition-colors duration-150"
            >
              Postular por WhatsApp <span className="cta-arrow">→</span>
            </a>

            {/* Fine print */}
            <p className="font-mono text-xs leading-[1.5] text-[var(--text-dim)]">
              150 cupos. Admisión selectiva. Gratis. 7 preguntas, 90 segundos.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
