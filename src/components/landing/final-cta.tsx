import { CornerMarks } from "./corner-marks";

export function FinalCta() {
  return (
    <section
      id="postular"
      className="relative blueprint-grid-inverse px-6 md:px-12 lg:px-24 py-24 bg-[var(--blue)]"
    >
      {/* Corner marks — white on blue */}
      <CornerMarks color="#ffffff" opacity={0.25} />

      <div className="mx-auto max-w-7xl w-full flex flex-col gap-10">
        {/* Terminal prompt */}
        <p className="font-mono text-xs text-white/50">
          the-next-craft$ submit --application
        </p>

        {/* Display headline */}
        <h2
          className="font-sans font-extrabold leading-none tracking-tight text-white"
          style={{ fontSize: "clamp(3rem, 8vw, 6.5rem)" }}
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
            className="font-mono font-semibold text-sm tracking-widest uppercase bg-white text-[var(--blue)] px-8 py-4 hover:bg-[var(--paper-dim)] transition-colors duration-150"
          >
            Postular ahora →
          </a>

          {/* Fine print */}
          <p className="font-mono text-xs text-white/50">
            150 cupos. Admisión selectiva. Gratis.
          </p>
        </div>
      </div>
    </section>
  );
}
