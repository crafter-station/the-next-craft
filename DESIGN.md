# The Next Craft — Design Direction

> Fuente de verdad para todos los agentes. No desviarse sin actualizar este archivo.

## Concepto: "COMMODORE 64 BOOT" (retro-computing '82)

La página es el **boot screen de un Commodore 64**: azul-violeta profundo con
borde lavanda, fuente pixel PETSCII para titulares, y el nombre del evento en
script de letras unidas (el "hello." de Apple, pero en lavanda C64). En el
header vive un **Commodore 64 en 3D real** (react-three-fiber) que gira solo y
se puede arrastrar.

**Lo memorable**: el hero como pantalla C64 encendida (borde lavanda grueso,
`**** THE NEXT CRAFT 64 ****`, `READY.█` parpadeando), el C64 girando en 3D,
"the next craft" en script conectado encima, y botones beige como las teclas
del hardware real.

## Reglas duras

- **Dark mode ÚNICO** (es un monitor encendido). `color-scheme: dark`.
- El acento es lavanda/azul C64. El beige hardware SOLO para keycaps/CTAs y
  detalles. Ningún otro color.
- **NUNCA**: degradados de color, glassmorphism, sombras difusas grandes,
  emojis decorativos, Inter/Roboto/Space Grotesk.
- Pixel font (Silkscreen) SOLO en titulares y labels cortos — nunca párrafos.
- Radius: 4–10px (plástico moldeado suave). Sombras duras tipo keycap
  (`0 3px 0`), nunca blur.
- Texturas permitidas: scanlines sutiles SOLO dentro de "pantallas"
  (hero, paneles CRT). Decorativas, `aria-hidden`.

## Paleta (CSS vars en globals.css)

| Token | Valor | Uso |
|-------|-------|-----|
| `--void` | `#14102B` | Fondo de página (apagado, alrededor del monitor) |
| `--boot` | `#40318D` | Azul boot screen — hero, paneles, bloques |
| `--boot-dim` | `#2A2160` | Variante oscura de paneles/secciones alternas |
| `--lav` | `#7869C4` | Borde del monitor, acentos, bordes de cards |
| `--lav-bright` | `#A99BE8` | Links, hover, script, labels sobre oscuro |
| `--text` | `#EAE7F8` | Texto cuerpo sobre oscuro |
| `--text-dim` | `#A9A3CC` | Texto secundario |
| `--bone` | `#D9D0BC` | Keycaps/CTAs (beige hardware), texto sobre boot |
| `--key-shadow` | `#8F8670` | Sombra dura de keycaps |

Contraste: cuerpo siempre `--text`/`--text-dim`; lavanda solo para display
grande, labels y bordes (AA en tamaños usados).

## Tipografía (next/font/google)

- **Script**: `Borel` — SOLO "the next craft" (wordmark nav, hero, footer).
  Lowercase siempre, como el "hello." de Apple.
- **Display**: `Silkscreen` 400/700 — titulares pixel PETSCII, uppercase.
- **Cuerpo**: `Archivo` 400/500/600 — párrafos y UI.
- **Mono**: `IBM Plex Mono` — líneas BASIC, datos, countdown, botones.

Escala: titulares pixel ~clamp(1.5rem→2.75rem) (la pixel font se ve enorme;
no necesita tamaños gigantes), script hero ~clamp(2.75rem→5.5rem). Labels
mono 11px tracking 0.18em.

## Motivos recurrentes

- **Boot header**: `**** THE NEXT CRAFT 64 ****` + `64K RAM SYSTEM · 36 HOURS
  FREE` + `READY.` con cursor `█` parpadeante (hero y footer).
- **Líneas BASIC como labels de sección**: `10 PRINT "MANIFIESTO"`,
  `20 PRINT "TL;DR"`, … `80 PRINT "ORGANIZERS"` (numeración 10–80, mono).
- **GOTO en CTAs secundarios**: `RUN POSTULAR` / `GOTO #tracks`.
- **Keycaps**: CTAs como teclas beige del C64 — extruidas, sombra dura
  `0 3px 0`, `:active` las hunde.
- **Marco de monitor**: secciones-pantalla con borde lavanda grueso y
  scanlines sutiles.
- **3D**: `public/c64.glb` (Draco) — auto-rotate lento + drag, lazy con
  fallback `LOADING…`, estático con reduced-motion.
- Coordenadas de Lima `-12.0464, -77.0428` en footer.
- Cierre del footer: "hecho a mano, no vibecodeado."

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
- **Organizers**: Shiara Arauzo (Lead Organizer), Railly Hugo (Crafter
  Station), + 4 cards placeholder con roles (Logistics, Partnerships,
  Community, Design) marcadas con `// TODO: reemplazar con equipo real`.
- **Idioma**: español, tono directo estilo Platanus ("solo cracks", "a
  construir").
- **CTA**: registro por WhatsApp — `wa.me/$NEXT_PUBLIC_WHATSAPP_NUMBER` con
  mensaje prellenado "Hola, quiero postular a The Next Craft" (trabajo de
  feat/whatsapp-registration incorporado aquí para no perderlo).

## Estructura de la página (one-pager)

1. Nav sticky (wordmark script + links mono + CTA keycap)
2. Hero (`#hero`) — pantalla C64: boot header, script "the next craft",
   C64 3D, READY.█, countdown, CTAs keycap
3. `10` ¿Qué es? (`#que-es`) — manifiesto
4. `20` TL;DR (`#tldr`) — specs grid
5. `30` Tracks (`#tracks`) — 3 cards
6. `40` Agenda (`#agenda`) — timeline 36h
7. `50` Premios (`#premios`) — $5,000 en panel pantalla
8. `60` Sponsors (`#sponsors`) — Next (headline) + Crafter Station + partners
9. `70` FAQ (`#faq`) — accordion (Base UI)
10. `80` Organizers (`#organizers`) — equipo (2 reales + 4 placeholder)
11. FinalCta (`#postular`) — pantalla C64 final, `RUN POSTULAR`, CTA WhatsApp
12. Footer — boot screen de despedida: stats, links, coordenadas, READY.█

## Accesibilidad (no regresionar)

- Skip link "Saltar al contenido". Focus visible: outline 2px lavanda bright.
- Countdown: `role="timer"`, estado EN VIVO con `role="status"`.
- 3D: `aria-hidden` en canvas (decorativo), fallback estático con
  reduced-motion; cursor █ y scanlines `aria-hidden`.
- Contraste AA en todo texto de lectura.
