import { CornerMarks } from "./corner-marks";

export function FinalCta() {
  return (
    <section
      id="postular"
      className="relative blueprint-grid-inverse px-6 md:px-12 lg:px-24 py-24 bg-[var(--blue)]"
    >
      {/* Corner marks — white on blue */}
      <CornerMarks color="#ffffff" opacity={0.25} />

      <div className="mx-auto max-w-7xl w-full flex flex-col gap-8 scroll-reveal">
        {/* Terminal prompt */}
        <p className="font-mono text-xs leading-[1.4] text-white/50">
          the-next-craft$ submit --application
        </p>

        {/* Display headline */}
        {/*
          Hanging punctuation: text-indent negativo para colgar el ¿
          de modo que la C alinee con el P de Postula.
          La C de Construyes y la P de Postula son ambas letras de cuerpo recto;
          el ¿ es más estrecho y flota óptico sin el indent.
        */}
        <h2
          className="font-sans font-extrabold leading-none text-white"
          style={{
            fontSize: "clamp(3rem, 8vw, 6.5rem)",
            letterSpacing: "-0.04em",
            marginLeft: "-0.04em",
            textIndent: "-0.4em",
            paddingLeft: "0.4em",
          }}
        >
          ¿Construyes?
          <br />
          Postula.
        </h2>

        {/* Deadline */}
        <p className="font-mono text-sm font-medium tracking-[0.15em] uppercase text-white/70">
          DEADLINE: 10 JUL 2026 · 23:59 GMT-5
        </p>

        {/* CTA button */}
        <div className="flex flex-col items-start gap-4 pt-2">
          <a
            href="https://forms.crafterstation.com/the-next-craft"
            target="_blank"
            rel="noopener noreferrer"
            className="cta-btn font-mono font-semibold text-sm tracking-[0.12em] uppercase bg-white text-[var(--blue)] px-8 py-4 hover:bg-[var(--paper-dim)] transition-colors duration-150"
          >
            Postular ahora <span className="cta-arrow">→</span>
          </a>

          {/* Fine print */}
          <p className="font-mono text-xs leading-[1.4] text-white/50">
            150 cupos. Admisión selectiva. Gratis.
          </p>
        </div>
      </div>
    </section>
  );
}
