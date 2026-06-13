import type { Metadata } from "next";

import { SectionHeader } from "@/components/landing/section-header";
import { Link } from "@/i18n/navigation";

export const metadata: Metadata = {
  title: "Brand Book",
  description:
    "Sistema visual de The Next Craft — concepto Commodore 64 Mono: paleta, tipografía, logo, elementos, motion y voz.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/brand" },
};

/* ─── Datos del sistema (espejo de globals.css / DESIGN.md) ──────────── */

const PALETTE = [
  { token: "--void", hex: "#1A1A17", uso: "Fondo único de página", dark: true },
  {
    token: "--screen-dim",
    hex: "#161613",
    uso: "Paneles / tablas",
    dark: true,
  },
  { token: "--line", hex: "#8C8A82", uso: "Bordes (gris platino)", dark: true },
  { token: "--text-dim", hex: "#A2A096", uso: "Texto secundario", dark: true },
  {
    token: "--bright",
    hex: "#E9E7DE",
    uso: "Acentos: script, labels, links, READY.",
    dark: false,
  },
  {
    token: "--bone",
    hex: "#E6E3D8",
    uso: "Keycaps / CTAs (marfil)",
    dark: false,
  },
  { token: "--text", hex: "#F2F0E9", uso: "Texto cuerpo", dark: false },
] as const;

const CONTRAST = [
  {
    pair: "--text sobre --void",
    ratio: "≈ 15 : 1",
    grade: "AAA",
    note: "Cuerpo y titulares",
  },
  {
    pair: "--text-dim sobre --void",
    ratio: "≈ 6.6 : 1",
    grade: "AA",
    note: "Solo texto secundario",
  },
  {
    pair: "--void sobre --bone",
    ratio: "≈ 13.5 : 1",
    grade: "AAA",
    note: "Texto en keycaps marfil",
  },
] as const;

const TYPE = [
  {
    name: "Borel",
    role: "Script / Wordmark",
    cls: "font-script",
    weights: "400",
    rule: 'SOLO "the next craft". Siempre minúsculas, color --bright. Nunca en párrafos ni títulos.',
    sample: "the next craft",
    sampleStyle: { fontSize: "clamp(2rem, 6vw, 3.5rem)" },
    sampleColor: "var(--bright)",
    source: "Google Fonts",
    href: "https://fonts.google.com/specimen/Borel",
  },
  {
    name: "Silkscreen",
    role: "Display / Pixel PETSCII",
    cls: "font-pixel",
    weights: "400 · 700",
    rule: "Titulares y labels cortos, uppercase. Nunca párrafos — la pixel se ve enorme.",
    sample: "READY PLAYER",
    sampleStyle: { fontSize: "clamp(1.25rem, 3.5vw, 2rem)" },
    sampleColor: "var(--text)",
    source: "Google Fonts",
    href: "https://fonts.google.com/specimen/Silkscreen",
  },
  {
    name: "IBM Plex Mono",
    role: "Cuerpo / Datos / BASIC",
    cls: "font-mono",
    weights: "400 · 500 · 600 · 700",
    rule: "Todo lo demás: párrafos, líneas BASIC, countdown, botones. Coded pero legible.",
    sample: '10 PRINT "DE CERO A PRODUCTO"',
    sampleStyle: { fontSize: "clamp(0.9rem, 2vw, 1.1rem)" },
    sampleColor: "var(--text)",
    source: "Google Fonts",
    href: "https://fonts.google.com/specimen/IBM+Plex+Mono",
  },
] as const;

const MOTION = [
  {
    name: "Paredes tipográficas",
    rule: "TRACKS: marquees alternos pixel hueco/sólido detrás del deck. AGENDA: la palabra se lee vertical en reposo (una letra por fila) y con el scroll cada fila viaja en horizontal a su velocidad mientras cada letra gira a su propio ritmo.",
  },
  {
    name: "Secciones pinneadas",
    rule: "Agenda y terminal final: la pantalla queda sticky y el scroll construye el contenido por umbrales. Todo cargado antes de soltar hacia la siguiente sección.",
  },
  {
    name: "Terminal que se tipea",
    rule: "Las líneas aparecen con wipe a pasos (clip-path + steps), como tipeo C64. El headline usa scramble binario→texto.",
  },
  {
    name: "Reglas duras",
    rule: "Solo transform y opacity (nunca layout). prefers-reduced-motion / sin JS = todo visible y estático, sin pins. Nada de cursor custom: estorba la selección.",
  },
] as const;

const VOICE_DO = [
  "Español, tono directo: «a construir», «producto real».",
  "Labels y comandos en MAYÚSCULA (BASIC).",
  "Hablar de usuarios reales, no de gloria.",
];

const VOICE_DONT = [
  "Frases excluyentes tipo «solo cracks».",
  "Arrogancia o hype vacío.",
  "Emojis decorativos en el copy.",
  "Inventar datos fuera del contenido canónico.",
];

const NEVER = [
  "Degradados de color",
  "Glassmorphism",
  "Sombras difusas grandes (blur)",
  "Emojis decorativos",
  "Inter / Roboto / Space Grotesk",
  "Cualquier color (morado, azul, acentos)",
  "Pixel font en párrafos",
  "Border radius en contenedores",
  "Cursor custom que tape el nativo",
  "Hairlines entre label y contenido",
];

/* ─── Bloques reutilizables ──────────────────────────────────────────── */

/* Tabla fusionada: contenedor con borde superior/izquierdo; cada celda
   aporta el derecho/inferior → retícula de 1px compartido, sin radius */
const TABLE = "border-t border-l border-[var(--line)] bg-[var(--screen-dim)]";
const CELL = "border-r border-b border-[var(--line)]";

function Section({
  line,
  name,
  children,
}: {
  line: string;
  name: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-6 md:px-12 lg:px-24 py-14 bg-[var(--void)]">
      <div className="mx-auto max-w-5xl w-full flex flex-col gap-7">
        <SectionHeader line={line} name={name} />
        {children}
      </div>
    </section>
  );
}

export default function BrandBook() {
  return (
    <>
      {/* Barra superior mínima */}
      <header className="sticky top-0 z-50 bg-[var(--void)]/95 backdrop-blur-[2px] border-b border-[var(--line)]/40">
        <nav className="mx-auto max-w-5xl px-6 md:px-12 h-14 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="font-script text-base leading-none text-[var(--bright)] hover:text-[var(--text)] transition-colors duration-150 shrink-0 pt-2"
          >
            the next craft
          </Link>
          <Link
            href="/"
            className="nav-link font-mono text-[11px] uppercase tracking-[0.14em] leading-[1.4] px-2.5 py-3"
          >
            ← Inicio
          </Link>
        </nav>
      </header>

      <main id="main-content">
        {/* ── Portada ───────────────────────────────────────────────── */}
        <section className="relative px-6 md:px-12 lg:px-24 pt-20 pb-16 bg-[var(--void)] overflow-hidden">
          <div
            className="scanlines pointer-events-none absolute inset-0 z-0"
            aria-hidden="true"
          />
          <div className="relative z-10 mx-auto max-w-5xl w-full flex flex-col gap-5">
            <p className="section-label">10 PRINT &quot;BRAND BOOK&quot;</p>
            <h1
              className="pixel-heading"
              style={{ fontSize: "clamp(1.75rem, 6vw, 3.5rem)" }}
            >
              Commodore 64 Mono
            </h1>
            <p className="font-mono text-[var(--text-dim)] max-w-2xl leading-relaxed">
              El sistema visual de The Next Craft: el boot screen de un
              Commodore 64 en monitor monocromo. Negro cálido vintage, grises
              platino, blanco roto. Cero color salvo el marfil de las teclas.
              Todo contenedor es una tabla: bordes de 1px compartidos, sin
              radius.
            </p>
            <p className="font-mono text-[var(--bright)] text-sm">
              READY.<span className="cursor-blink">█</span>
            </p>
          </div>
        </section>

        {/* ── 20 · Logo / Wordmark ─────────────────────────────────── */}
        <Section line="20" name="LOGO / WORDMARK">
          <div className={TABLE}>
            <div
              className={`${CELL} px-6 md:px-10 py-12 flex items-center justify-center`}
            >
              <span
                className="font-script text-[var(--bright)] leading-none pt-2"
                style={{ fontSize: "clamp(2.5rem, 9vw, 5rem)" }}
              >
                the next craft
              </span>
            </div>

            <div className="grid md:grid-cols-2">
              <div className={`${CELL} px-6 py-6 flex flex-col gap-3`}>
                <p className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--bright)]">
                  Reglas
                </p>
                <ul className="font-mono text-sm text-[var(--text-dim)] flex flex-col gap-2 leading-relaxed list-none p-0 m-0">
                  <li>· Fuente Borel (script), siempre minúsculas.</li>
                  <li>· Color --bright sobre fondo --void.</li>
                  <li>
                    · Área de respeto: la altura de una «t» en todos los lados.
                  </li>
                  <li>· Centrado óptico con pt-2 (la script cuelga alto).</li>
                </ul>
              </div>

              <div className={`${CELL} px-6 py-6 flex flex-col gap-3`}>
                <p className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--bright)]">
                  Usos incorrectos
                </p>
                <ul className="font-mono text-sm text-[var(--text-dim)] flex flex-col gap-2 leading-relaxed list-none p-0 m-0">
                  <li>
                    <span className="text-[var(--text)]">✗</span> Title Case:{" "}
                    <span className="line-through">The Next Craft</span>
                  </li>
                  <li>
                    <span className="text-[var(--text)]">✗</span> En pixel o
                    mono:{" "}
                    <span className="font-pixel text-xs">THE NEXT CRAFT</span>
                  </li>
                  <li>
                    <span className="text-[var(--text)]">✗</span> Con color o
                    degradado.
                  </li>
                  <li>
                    <span className="text-[var(--text)]">✗</span> Estirado,
                    rotado o con sombra blur.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Section>

        {/* ── 30 · Color ───────────────────────────────────────────── */}
        <Section line="30" name="COLOR">
          <p className="font-mono text-[var(--text-dim)] max-w-2xl leading-relaxed">
            B&amp;N estricto. Negro cálido, grises platino, blanco roto. El
            marfil de keycaps es el único «tono». Ningún color de acento.
          </p>

          <ul
            className={`grid grid-cols-2 md:grid-cols-3 list-none p-0 m-0 ${TABLE}`}
          >
            {PALETTE.map(({ token, hex, uso, dark }) => (
              <li key={token} className={`${CELL} flex flex-col`}>
                <div
                  className="h-24 w-full flex items-end p-3"
                  style={{ backgroundColor: `var(${token})` }}
                >
                  <span
                    className="font-mono text-[11px] font-semibold tracking-wide"
                    style={{ color: dark ? "var(--text)" : "var(--void)" }}
                  >
                    {hex}
                  </span>
                </div>
                <div className="px-4 py-3 flex flex-col gap-1">
                  <p className="font-mono text-xs font-semibold text-[var(--text)]">
                    {token}
                  </p>
                  <p className="font-mono text-[11px] text-[var(--text-dim)] leading-snug">
                    {uso}
                  </p>
                </div>
              </li>
            ))}
            {/* Rellenos para cerrar la retícula: 7 colores → 8 celdas en
                2 cols (mobile) y 9 en 3 cols (md) */}
            <li className={CELL} aria-hidden="true" />
            <li className={`${CELL} hidden md:block`} aria-hidden="true" />
          </ul>

          <div className={TABLE}>
            <div className={`${CELL} px-6 py-5 flex flex-col gap-3`}>
              <p className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--bright)]">
                Contraste (WCAG)
              </p>
              <ul className="flex flex-col gap-2 list-none p-0 m-0">
                {CONTRAST.map(({ pair, ratio, grade, note }) => (
                  <li
                    key={pair}
                    className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-sm"
                  >
                    <span className="text-[var(--text)]">{pair}</span>
                    <span className="text-[var(--text-dim)] tabular-nums">
                      {ratio}
                    </span>
                    <span className="text-[var(--bright)] text-xs font-semibold">
                      {grade}
                    </span>
                    <span className="text-[var(--text-dim)] text-xs">
                      — {note}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        {/* ── 40 · Tipografía ──────────────────────────────────────── */}
        <Section line="40" name="TIPOGRAFÍA">
          <div className={TABLE}>
            {TYPE.map(
              ({
                name,
                role,
                cls,
                weights,
                rule,
                sample,
                sampleStyle,
                sampleColor,
                source,
                href,
              }) => (
                <div
                  key={name}
                  className={`${CELL} px-6 md:px-8 py-7 flex flex-col gap-5`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="font-mono text-sm font-semibold text-[var(--text)]">
                      {name}
                    </p>
                    <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--text-dim)]">
                      {role} · {weights}
                    </p>
                  </div>
                  <p
                    className={`${cls} leading-tight`}
                    style={{ ...sampleStyle, color: sampleColor }}
                  >
                    {sample}
                  </p>
                  <p className="font-mono text-[11px] text-[var(--text-dim)] leading-relaxed">
                    {rule}
                  </p>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="nav-link font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--text-dim)] self-start"
                  >
                    {source} ↗
                  </a>
                </div>
              ),
            )}
          </div>
        </Section>

        {/* ── 50 · Elementos ───────────────────────────────────────── */}
        <Section line="50" name="ELEMENTOS">
          <div className={`grid md:grid-cols-2 ${TABLE}`}>
            {/* READY. */}
            <div className={`${CELL} px-6 py-7 flex flex-col gap-3`}>
              <p className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--bright)]">
                Cursor de boot
              </p>
              <p className="font-mono text-[var(--bright)] text-lg">
                READY.<span className="cursor-blink">█</span>
              </p>
              <p className="font-mono text-[11px] text-[var(--text-dim)]">
                Hero y footer. Cursor █ parpadeante, sin boot header.
              </p>
            </div>

            {/* Labels BASIC */}
            <div className={`${CELL} px-6 py-7 flex flex-col gap-3`}>
              <p className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--bright)]">
                Labels de sección
              </p>
              <p className="section-label">
                <span className="text-[var(--text-dim)]">30 </span>PRINT
                &quot;TRACK&quot;
              </p>
              <p className="font-mono text-[11px] text-[var(--text-dim)]">
                Líneas BASIC numeradas 10–110 como apertura de cada sección.
              </p>
            </div>

            {/* Keycaps */}
            <div className={`${CELL} px-6 py-7 flex flex-col gap-4`}>
              <p className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--bright)]">
                Keycaps (CTAs)
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="cta-btn keycap font-mono text-xs font-semibold tracking-[0.12em] uppercase px-4 py-2 inline-block">
                  Postular <span className="cta-arrow">→</span>
                </span>
                <span className="cta-btn keycap-ghost font-mono text-xs font-semibold tracking-[0.12em] uppercase px-4 py-2 inline-block">
                  GOTO #tracks
                </span>
              </div>
              <p className="font-mono text-[11px] text-[var(--text-dim)]">
                Teclas marfil extruidas, sombra dura 0 3px 0. :active las hunde.
                El radius vive SOLO aquí (plástico moldeado).
              </p>
            </div>

            {/* Scanlines */}
            <div className={`${CELL} flex flex-col`}>
              <div className="relative h-28 bg-[var(--screen-dim)]">
                <div
                  className="scanlines absolute inset-0"
                  aria-hidden="true"
                />
                <span className="absolute bottom-3 left-4 font-mono text-[11px] text-[var(--text-dim)]">
                  .scanlines
                </span>
              </div>
              <div className="px-6 py-4">
                <p className="font-mono text-[11px] text-[var(--text-dim)]">
                  Textura de pantalla sutil, SOLO dentro de «pantallas».
                  Decorativa, aria-hidden.
                </p>
              </div>
            </div>

            {/* Tablas fusionadas */}
            <div className={`${CELL} px-6 py-7 flex flex-col gap-3`}>
              <p className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--bright)]">
                Tablas fusionadas
              </p>
              <div className="grid grid-cols-3 border-t border-l border-[var(--line)]">
                {["FECHA", "LUGAR", "CUPOS", "25 JUL", "3 SEDES", "120"].map(
                  (t) => (
                    <span
                      key={t}
                      className="border-r border-b border-[var(--line)] px-2 py-2 font-mono text-[10px] text-[var(--text-dim)]"
                    >
                      {t}
                    </span>
                  ),
                )}
              </div>
              <p className="font-mono text-[11px] text-[var(--text-dim)]">
                Contenedores = tablas: bordes 1px compartidos (border-t/l en el
                contenedor, border-r/b en cada celda). Sin gap, sin radius.
              </p>
            </div>

            {/* Paredes tipográficas */}
            <div className={`${CELL} px-6 py-7 flex flex-col gap-3`}>
              <p className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--bright)]">
                Paredes tipográficas
              </p>
              <p
                className="font-pixel font-bold text-[var(--text)] opacity-30 leading-none select-none"
                style={{ fontSize: "clamp(1.25rem, 3vw, 1.75rem)" }}
                aria-hidden="true"
              >
                AGENDA AGENDA AG
              </p>
              <p className="font-mono text-[11px] text-[var(--text-dim)]">
                La palabra de la sección repetida como fondo, pixel font tenue
                (opacidad 16–30%). Siempre aria-hidden, siempre detrás del
                contenido.
              </p>
            </div>
          </div>
        </Section>

        {/* ── 60 · Motion ──────────────────────────────────────────── */}
        <Section line="60" name="MOTION / SCROLL">
          <p className="font-mono text-[var(--text-dim)] max-w-2xl leading-relaxed">
            El scroll es el playhead: las secciones cinemáticas se pinnean y el
            progreso construye el contenido. Nada se mueve solo si el usuario no
            scrollea.
          </p>
          <div className={`grid md:grid-cols-2 ${TABLE}`}>
            {MOTION.map(({ name, rule }) => (
              <div
                key={name}
                className={`${CELL} px-6 py-7 flex flex-col gap-3`}
              >
                <p className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--bright)]">
                  {name}
                </p>
                <p className="font-mono text-[11px] text-[var(--text-dim)] leading-relaxed">
                  {rule}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 70 · Voz y tono ──────────────────────────────────────── */}
        <Section line="70" name="VOZ Y TONO">
          <div className={`grid md:grid-cols-2 ${TABLE}`}>
            <div className={`${CELL} px-6 py-6 flex flex-col gap-3`}>
              <p className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--bright)]">
                Sí
              </p>
              <ul className="font-mono text-sm text-[var(--text-dim)] flex flex-col gap-2 leading-relaxed list-none p-0 m-0">
                {VOICE_DO.map((t) => (
                  <li key={t}>
                    <span className="text-[var(--text)]">·</span> {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className={`${CELL} px-6 py-6 flex flex-col gap-3`}>
              <p className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--bright)]">
                No
              </p>
              <ul className="font-mono text-sm text-[var(--text-dim)] flex flex-col gap-2 leading-relaxed list-none p-0 m-0">
                {VOICE_DONT.map((t) => (
                  <li key={t}>
                    <span className="text-[var(--text)]">✗</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        {/* ── 80 · Imágenes ────────────────────────────────────────── */}
        <Section line="80" name="IMÁGENES">
          <p className="font-mono text-[var(--text-dim)] max-w-2xl leading-relaxed">
            La imagen central es el set Commodore 64 completo en 3D
            (public/c64.glb), visto de frente, con el wordmark escrito dentro de
            la pantalla del monitor. Estático, drag para girar.
          </p>

          <div className={`grid md:grid-cols-3 ${TABLE}`}>
            <div className={`${CELL} px-6 py-6 flex flex-col gap-2`}>
              <p className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--bright)]">
                Sujeto
              </p>
              <p className="font-mono text-sm text-[var(--text-dim)] leading-relaxed">
                Hardware retro de frente, encuadre limpio sobre el mismo negro.
                Sin marcos.
              </p>
            </div>
            <div className={`${CELL} px-6 py-6 flex flex-col gap-2`}>
              <p className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--bright)]">
                Tratamiento
              </p>
              <p className="font-mono text-sm text-[var(--text-dim)] leading-relaxed">
                Monocromo cálido, scanlines sutiles dentro de pantallas.
                Iluminación tibia (#E9E7DE).
              </p>
            </div>
            <div className={`${CELL} px-6 py-6 flex flex-col gap-2`}>
              <p className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--bright)]">
                Radius / sombra
              </p>
              <p className="font-mono text-sm text-[var(--text-dim)] leading-relaxed">
                Contenedores sin radius — tablas de bordes compartidos. El
                radius queda solo en keycaps. Sombras duras, nunca blur.
              </p>
            </div>
          </div>

          <div className={TABLE}>
            <div className={`${CELL} px-6 py-6 flex flex-col gap-3`}>
              <p className="font-mono text-[11px] font-semibold tracking-[0.18em] uppercase text-[var(--bright)]">
                Nunca
              </p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 list-none p-0 m-0">
                {NEVER.map((t) => (
                  <li
                    key={t}
                    className="font-mono text-sm text-[var(--text-dim)]"
                  >
                    <span className="text-[var(--text)]">✗</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>

        {/* ── Cierre ───────────────────────────────────────────────── */}
        <footer className="px-6 md:px-12 lg:px-24 py-14 bg-[var(--void)] border-t border-[var(--line)]/40">
          <div className="mx-auto max-w-5xl w-full flex flex-col gap-2">
            <p className="font-script text-[var(--bright)] text-2xl leading-none pt-2">
              the next craft
            </p>
            <p className="font-mono text-[11px] text-[var(--text-dim)]">
              Fuente de verdad: DESIGN.md + globals.css.
            </p>
            <p className="font-mono text-[var(--bright)] text-sm mt-2">
              READY.<span className="cursor-blink">█</span>
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
