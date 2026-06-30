# Deck routes live outside `[locale]`

The whole app uses next-intl with `localePrefix: "always"`, so normally every route is `/[locale]/...`. Sponsor decks are single-language artifacts sent to one company, so we serve them at `/deck/<slug>` (no locale prefix) from `src/app/deck/[slug]/`, and exclude `deck` from the proxy middleware matcher (`/((?!api|deck|_next|_vercel|.*\..*).*)`). The deck's language is whatever the author writes in the MDX; we do not translate decks.

Consequence: a future reader will see a route bypassing the i18n convention and may try to "fix" it by moving it under `[locale]` — that would re-introduce the unwanted `/es` / `/en` redirect for a single-language artifact. This is deliberate.
