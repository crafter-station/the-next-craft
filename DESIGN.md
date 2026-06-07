# The Next Craft — Design Direction

> Fuente de verdad para todos los agentes. No desviarse sin actualizar este archivo.

## Concepto: "Blueprint Terminal"

La página es el **plano de construcción** del evento. Papel blanco de blueprint
(grid técnico azul muy sutil), tinta azul Klein, y acentos de terminal. Híbrido:
editorial suizo (jerarquía tipográfica fuerte, grilla estricta, espacio negativo
generoso) × cultura hacker (monospace, prompts, brackets, coordenadas).

**Lo memorable**: blanco dominante + un solo azul eléctrico usado sin miedo
(bloques sólidos, no degradados), marcas de registro (+) en las esquinas de cada
sección como plano técnico, y labels monospace numerados (`01 — MANIFIESTO`).

## Reglas duras

- **Light mode ÚNICO.** No dark mode, no toggle. `color-scheme: light`.
- **NUNCA**: degradados morados, glassmorphism, sombras blandas genéricas,
  emojis decorativos, Inter/Roboto/Space Grotesk.
- Bordes: 1px sólidos azules o dotted. Radius: 0 (esquinas rectas, es un plano).
- Los degradados están prohibidos. Color plano siempre.

## Paleta (CSS vars en globals.css)

| Token | Valor | Uso |
|-------|-------|-----|
| `--paper` | `#FFFFFF` | Fondo dominante |
| `--paper-dim` | `#F4F7FE` | Fondos alternos de sección |
| `--blue` | `#002FA7` (Klein) | Tinta principal: texto display, bloques sólidos, bordes |
| `--blue-bright` | `#1D4ED8` | Interactivo: links, hover, focus |
| `--blue-grid` | `#002FA7` al 8% | Grid de blueprint de fondo |
| `--ink` | `#0A1633` | Texto cuerpo |
| `--ink-dim` | `#5B6478` | Texto secundario |

Texto sobre azul sólido: blanco puro.

## Tipografía (next/font/google)

- **Display**: `Bricolage Grotesque` — titulares, pesos 700–800, tracking apretado.
- **Mono**: `IBM Plex Mono` — labels, datos, countdown, prompts, botones.
- **Cuerpo**: `Bricolage Grotesque` 400/500.

Escala: hero ~clamp(3.5rem→7rem), h2 ~clamp(2rem→3.5rem). Labels mono uppercase
12px tracking 0.15em.

## Motivos recurrentes

- Marcas de registro `+` en esquinas de secciones (pseudo-elementos o spans).
- Labels de sección numerados: `[01] — ¿QUÉ ES?` en mono.
- Prompt de terminal: `the-next-craft$` en hero y footer.
- Flechas `→` en links y CTAs. Brackets `[ ]` en nav.
- Coordenadas de Lima `-12.0464, -77.0428` como detalle en footer/location.
- Grid blueprint de fondo: líneas de 1px cada 48px, azul al 6–8%.

## Contenido canónico (NO inventar otros datos)

- **Evento**: The Next Craft — hackathon por Crafter Station × Next
- **Tagline**: "De cero a producto en 36 horas."
- **Fecha**: 24–26 de julio, 2026 · **Lugar**: Lima, Perú (presencial)
- **Formato**: 36 horas · 150 hackers · equipos de 3–5
- **Premios**: $5,000 USD al equipo ganador + créditos de partners para todos
- **Deadline postulación**: 10 de julio, 2026 (23:59 GMT-5)
- **Tracks**:
  1. `AI CRAFT` — productos reales construidos con IA, no demos
  2. `OPEN WEB` — herramientas open source para la comunidad dev
  3. `LOCAL IMPACT` — tecnología para problemas de LATAM
- **Organizers** (sección propia): Shiara Arauzo (Lead Organizer), Railly Hugo
  (Crafter Station), + 4 cards placeholder con roles (Logistics, Partnerships,
  Community, Design) marcadas con comentario `// TODO: reemplazar con equipo real`.
- **Idioma**: español, tono directo estilo Platanus ("solo cracks", "a construir").
- **CTA**: "Postular →" (link `#` placeholder)

## Estructura de la página (one-pager)

1. Nav sticky (mono, brackets) — anchors a secciones; CTA "Postular →" en header
2. Hero (`#hero`) — nombre gigante, tagline, countdown vivo, CTAs (Postular + Ver tracks), prompt terminal
3. `[01]` ¿Qué es? (`#que-es`) — manifiesto
4. `[02]` TL;DR (`#tldr`) — grid de specs (fecha/lugar/formato/equipos)
5. `[03]` Tracks (`#tracks`) — 3 cards
6. `[04]` Agenda (`#agenda`) — timeline de 36h
7. `[05]` Premios (`#premios`)
8. `[06]` Sponsors (`#sponsors`) — Next (headline) + Crafter Station + partners
9. `[07]` FAQ (`#faq`) — accordion (Base UI)
10. `[08]` Organizers (`#organizers`) — cards del equipo (2 reales + 4 placeholder)
11. FinalCta (`#postular`) — bloque azul sólido, CTA "Postular ahora →" con link real a forms.crafterstation.com/the-next-craft
12. Footer — stats, links, coordenadas, prompt final

## CTA canónico

El botón de postulación apunta a `https://forms.crafterstation.com/the-next-craft` (link real, no placeholder). El link `#postular` en nav y hero lleva al bloque FinalCta donde está ese botón.
