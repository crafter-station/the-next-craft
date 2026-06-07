export default function Home() {
  return (
    <main className="blueprint-grid min-h-screen bg-[var(--paper)] text-[var(--ink)] px-6 md:px-12 lg:px-24 py-24 flex flex-col gap-24">
      {/* Smoke test: label de sección */}
      <p className="section-label">[00] — DESIGN SYSTEM</p>

      {/* Display gigante */}
      <div className="flex flex-col gap-4">
        <h1
          className="font-sans font-extrabold leading-none tracking-tight text-[var(--blue)]"
          style={{
            fontSize: "clamp(3.5rem, 10vw, 7rem)",
          }}
        >
          The Next
          <br />
          Craft
        </h1>
        <p className="font-mono text-lg text-[var(--ink-dim)]">
          De cero a producto en 36 horas.
        </p>
        <p className="section-label text-[var(--ink-dim)]">
          24–26 jul, 2026 · Lima, Perú
        </p>
      </div>

      {/* Bloque azul sólido con texto blanco */}
      <div className="crosshair bg-[var(--blue)] text-white px-8 py-12 flex flex-col gap-3 max-w-xl">
        <span className="section-label text-white/60">[PALETA]</span>
        <p className="font-sans font-bold text-2xl">Azul Klein #002FA7</p>
        <p className="font-mono text-sm text-white/70">
          Color plano. Sin degradados. Sin glassmorphism.
        </p>
      </div>

      {/* Tokens tipográficos */}
      <div className="flex flex-col gap-6 border-l-2 border-[var(--blue)] pl-8">
        <span className="section-label">[TIPOGRAFÍA]</span>
        <p className="font-sans font-extrabold text-4xl text-[var(--blue)]">
          Bricolage Grotesque 800
        </p>
        <p className="font-sans font-medium text-xl text-[var(--ink)]">
          Bricolage Grotesque 500 — cuerpo
        </p>
        <p className="font-mono text-base text-[var(--ink-dim)]">
          IBM Plex Mono — labels, datos, prompts
        </p>
        <p className="font-mono text-sm text-[var(--blue-bright)]">
          the-next-craft$ _
        </p>
      </div>

      {/* CTA */}
      <div className="flex flex-col gap-4 items-start">
        <span className="section-label">[CTA]</span>
        <a
          href="/postular"
          className="font-mono font-semibold text-sm tracking-widest uppercase border border-[var(--blue)] text-[var(--blue)] px-6 py-3 hover:bg-[var(--blue)] hover:text-white transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[var(--blue-bright)]"
        >
          Postular →
        </a>
      </div>

      {/* Grid spacing demo */}
      <div className="flex flex-col gap-2">
        <span className="section-label">[GRID — 48px]</span>
        <p className="font-mono text-xs text-[var(--ink-dim)]">
          Blueprint grid: 1px · rgb(0 47 167 / 8%) · 48px
        </p>
      </div>
    </main>
  );
}
