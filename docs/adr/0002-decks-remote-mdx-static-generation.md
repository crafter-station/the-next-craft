# Decks use remote MDX compiled at build, statically generated

A deck is a folder of `NN-name.mdx` slides with frontmatter (`title`) plus a required `deck.json`. We read the folder with `fs` + `gray-matter` and compile each slide with `next-mdx-remote/rsc`, rather than using `@next/mdx` file-based routing. Reason: we glob a folder of unknown filenames and need first-class frontmatter and a closed component vocabulary injected via the `components` map — `@next/mdx` is built around importing a specific known file and doesn't fit "enumerate a folder at build time."

Decks are fully statically generated: `generateStaticParams` enumerates folders under `src/content/decks/` (those with a `deck.json`), with `dynamicParams = false`, so all `fs` reads happen at build time and Vercel serves static HTML — no runtime filesystem access. `outputFileTracingIncludes` pins the content dir as a safeguard.

Consequences: (1) slide MDX cannot use bare `import` statements — all components come from the injected map (intentional: keeps slide chrome unbreakable). (2) A new deck requires a redeploy, which is acceptable since adding a deck is already a git commit.
