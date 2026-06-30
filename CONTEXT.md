# The Next Craft

Landing + WhatsApp registration bot for the The Next Craft hackathon, plus sponsor/partner pitch decks. This glossary defines the project's ubiquitous language.

## Decks

Static sponsor/partner pitch decks rendered from MDX, styled like the landing (Commodore 64 Mono). Each deck is a self-contained, single-language artifact served at `/deck/<slug>` and built from a folder of MDX slides.

**Deck**:
A presentation sent to one sponsor/partner. Physically a folder under `src/content/decks/<slug>/`. The folder name is the deck slug and the URL is `/deck/<slug>`.
_Avoid_: presentation, pitch (use "deck")

**Slide**:
A single full-viewport screen within a deck. Physically one `.mdx` file in the deck folder, named `NN-name.mdx` (e.g. `01-slide-hello.mdx`). Ordering is by the `NN` filename prefix.
_Avoid_: page, section, screen

**Slug**:
The deck folder name, used as the URL segment (`fal`, `main`, `codex`). Unique per deck.

**deck.json**:
Required per-deck config file in the deck folder. Holds deck-level metadata (`title`, `description`, optional per-sponsor overrides). Drives the route's page `<title>`/OG. A folder without `deck.json` is not a valid deck and is excluded from `generateStaticParams`.

**Frontmatter**:
Per-slide YAML metadata at the top of each `.mdx` file (e.g. `title`). Parsed at build time; drives the index/navigation, not rendered as body content.
_Avoid_: metadata block, header

**Index**:
The full-screen in-deck navigation overlay listing every slide by `title`, allowing jump-to-any-slide; opened via the `INDEX` keycap (top-right) or keyboard. There is no slide counter and no progress bar — position is communicated only through the index.
_Avoid_: table of contents, menu

**Pager**:
The client-side shell (`DeckPager`) that holds the active slide index and handles ← → / swipe / index navigation. Wraps server-rendered slides and toggles their visibility; it does not compile MDX.
_Avoid_: carousel, slider

**Slide component**:
One of the fixed vocabulary of React components authors compose inside slide MDX. The vocabulary is closed — authors do not write arbitrary JSX/imports. Members: `SlideTitle`, `Lead`, `DataGrid`/`DataCell`, `TrackCard`, `Timeline`/`TimelineRow`, `Stat`, `BulletList`, `Keycap`, `Ready`, `Wordmark`, `SponsorTier`. Plain markdown elements are auto-styled (no component needed).
_Avoid_: widget, block
