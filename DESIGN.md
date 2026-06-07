# The Next Craft — Design Direction

> Fuente de verdad para todos los agentes. No desviarse sin actualizar este archivo.

## Concepto: "COMMODORE 64 MONO" (retro-computing B&N, negro vintage Apple '99)

La página es el **boot screen de un Commodore 64 en monitor monocromo**:
negro cálido vintage (tipo Apple de fines de los 90), grises platino y blanco
roto. Fuente pixel PETSCII para titulares y el nombre del evento en script de
letras unidas (el "hello." de Apple). En el header vive un **Commodore 64 en
3D real** (react-three-fiber) que gira solo y se puede arrastrar.

**Lo memorable**: el set Commodore 64 completo en 3D visto DE FRENTE con
"the next craft" en script escrito DENTRO de la pantalla del monitor (como el
"hello." del Mac), `READY.█` parpadeando, y botones marfil como las teclas
del hardware real.

## Reglas duras

- **Dark mode ÚNICO** (es un monitor encendido). `color-scheme: dark`.
- **B&N ESTRICTO**: negro cálido, grises platino, blanco roto. NINGÚN color
  (ni morado, ni azul, ni acentos). El marfil de keycaps es el único "tono".
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
| `--void` | `#1A1A17` | Fondo único de página (negro cálido vintage) |
| `--screen` | `#1A1A17` | Igual al fondo — un solo negro, sin marcos |
| `--screen-dim` | `#161613` | Paneles/cards (apenas más profundo) |
| `--line` | `#8C8A82` | Borde del monitor (gris platino), bordes de cards |
| `--bright` | `#E9E7DE` | Acentos: script, labels, links, READY. |
| `--text` | `#F2F0E9` | Texto cuerpo |
| `--text-dim` | `#A2A096` | Texto secundario |
| `--bone` | `#E6E3D8` | Keycaps/CTAs (marfil) |
| `--key-shadow` | `#8C8A82` | Sombra dura de keycaps |

Contraste: cuerpo siempre `--text`/`--text-dim` (AA garantizado en B&N).

## Tipografía (next/font/google)

- **Script**: `Borel` — SOLO "the next craft" (wordmark nav, hero, footer).
  Lowercase siempre, como el "hello." de Apple.
- **Display**: `Silkscreen` 400/700 — titulares pixel PETSCII, uppercase.
- **Cuerpo y todo lo demás**: `IBM Plex Mono` — párrafos, líneas BASIC,
  datos, countdown, botones. "Coded" pero legible; no hay sans humanista.

Escala: titulares pixel ~clamp(1.5rem→2.75rem) (la pixel font se ve enorme;
no necesita tamaños gigantes), script hero ~clamp(2.75rem→5.5rem). Labels
mono 11px tracking 0.18em.

## Motivos recurrentes

- **READY.** con cursor `█` parpadeante (hero y footer). Sin boot header.
- **Sin dividers**: nada de hairlines horizontales entre labels y contenido;
  la separación es espacio en blanco. (Bordes de cards y footer sí.)
- **Líneas BASIC como labels de sección**: `10 PRINT "MANIFIESTO"`,
  `20 PRINT "TL;DR"`, … `80 PRINT "ORGANIZERS"` (numeración 10–80, mono).
- **GOTO en CTAs secundarios**: `RUN POSTULAR` / `GOTO #tracks`.
- **Keycaps**: CTAs como teclas de marfil del C64 — extruidas, sombra dura
  `0 3px 0`, `:active` las hunde.
- **Sin marcos**: hero y FinalCta full-bleed sobre el mismo negro; solo
  scanlines sutiles como textura de pantalla.
- **3D**: `public/c64.glb` (Draco, ~2MB) — set completo de frente, estático
  (sin auto-rotate), drag para girar; wordmark en la pantalla vía drei <Html>.
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
2. Hero (`#hero`) — set C64 3D de frente con el wordmark en pantalla
   (negrita, centrado), READY.█, countdown, CTAs keycap (h1 sr-only;
   sin tagline visible)
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

- Skip link "Saltar al contenido". Focus visible: outline 2px blanco cálido.
- Countdown: `role="timer"`, estado EN VIVO con `role="status"`.
- 3D: `aria-hidden` en canvas (decorativo), fallback estático con
  reduced-motion; cursor █ y scanlines `aria-hidden`.
- Contraste AA en todo texto de lectura.
