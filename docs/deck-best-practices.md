# The Next Craft - Deck Best Practices

This is the source of truth for sponsor and partner decks under `src/content/decks/`.

Use it when creating a new deck, editing an existing partner proposal, or deciding how to repeat language across Main Partner / Title Partner decks.

## Core Principle

The decks do not sell logo placement. They sell builder adoption with proof.

Every strong deck should answer:

- Why this partner, why now?
- What does the partner get to own?
- How do builders actually use the partner's product during the event?
- What proof, assets, feedback, and pipeline does the partner walk away with?
- What is the clean ask?

## Canonical Deck Types

### General Sponsor Deck

Use for broad fundraising conversations where the partner category is not fixed yet.

Current examples: `src/content/decks/main/`, `src/content/decks/en/`.

Recommended flow:

- Cover.
- What The Next Craft is.
- Why the moment matters.
- Event facts.
- Track record / credibility.
- Backed by / organizers.
- Capacity and city footprint.
- Tracks.
- Agenda.
- Official prize pool.
- Audience.
- Sponsorship tiers.
- What cash sponsorship covers: operations + official prizes.
- Why sponsor.
- Close.

### Main Partner / Title Partner Deck

Use when the deck is written for a specific strategic partner.

Current examples: `vapi`, `mistral`, `apify`, `you`, `fal`, `upch`.

Recommended flow:

- Cover with partner name and specific thesis.
- Why this partner, why now.
- What The Next Craft is.
- Event facts and audience.
- Track record / credibility.
- Why LatAm or why this builder segment.
- The partner-owned track or challenge.
- Example builds teams could ship.
- Product stack / starter kits / integration paths.
- Activation plan.
- Workshop, mentor, judge, optional bonus prize, or office-hours plan.
- Outcomes and success metrics.
- Investment.
- What is included.
- Close.

## Main Partner Positioning

Main Partner decks should make the partner feel like part of the event architecture, not a sponsor added at the end.

Use this framing:

- `As Main Partner, [Partner] owns the [Track / Challenge] across the hackathon.`
- `[Partner] becomes the fast path for teams building [specific category].`
- `Teams use [Partner] while shipping real products, not after the event.`
- `The output is usage, demos, repos, content, feedback, and pipeline.`

Avoid this framing:

- `Logo on website` as the main value.
- Generic awareness language.
- Vague promises like `massive exposure` or `huge community impact`.
- Overclaiming revenue, leads, or guaranteed conversions.

## Repeated Partner Offer

For strategic partners, keep the ask simple and consistent unless there is a concrete reason to change it.

Preferred structure:

- Preferred: `$5K Main Partner` or `$5K Title Partner`.
- Alternative: `$2.5K Track Partner`.
- In-kind: credits, tools, mentors, judges, swag, venues, workshops, amplification, or optional track-specific prizes.

Canonical wording:

```mdx
<DataGrid>
  <DataCell label="Preferred" value="$5K Main Partner - Own the [category] track across the full hackathon" />
  <DataCell label="Alternative" value="$2.5K Track Partner - Dedicated [Partner] challenge, credits and judging" />
  <DataCell label="In-kind" value="Credits, tools, mentors, swag or bonus prizes make the activation stronger" />
</DataGrid>
```

Use `Title Partner` when the partner is positioned above the track level and owns a broader event narrative. Use `Main Partner` when the partner owns a flagship category or track but the event remains The Next Craft first.

## What Main Partner Includes

Every Main Partner deck should include a concrete benefits slide. Keep it operational.

Recommended benefit labels:

- Position.
- Naming.
- Activation.
- Visibility.
- Content.
- Usage.
- Feedback.
- Examples.
- Community.
- Pipeline.

Example:

```mdx
<BenefitGrid
  items={[
    { label: "Position", value: "Fast path for the [Partner] track" },
    { label: "Naming", value: "Featured naming across the track, kickoff, demos and recap" },
    { label: "Activation", value: "Workshop, credits, office hours, judging, optional bonus prize" },
    { label: "Visibility", value: "Opening, track intro, submissions, demos, recap" },
    { label: "Content", value: "Built with [Partner] recap assets" },
  ]}
/>
```

## Activation Plan

The activation slide is the most important slide in a partner deck. It should show how the partnership becomes real on event day.

Always specify:

- Track or challenge name.
- Credits or access required.
- Starter kits or ready-to-fork examples.
- Workshop or onboarding session.
- Mentor, judge, or office-hours guest.
- Optional partner bonus prize or recognition.
- Content outputs after the event.
- Pipeline or follow-up path for promising teams.

Strong wording:

- `Crafter Station can handle the track page, starter kits, builder instructions and recap content so [Partner] can plug in with credits, one workshop, one mentor or judge, and amplification.`
- `Cash funds the multi-city production and official prize pool. Credits, mentors, bonus prizes and swag strengthen the builder activation.`

## Success Metrics

Metrics must be observable during or shortly after the event.

Good metrics:

- Accounts activated.
- Teams using the product.
- Submissions powered by the product.
- API calls, minutes, runs, datasets, credits used, or other product-native usage.
- Working demos.
- Repos or reusable examples.
- Demo clips.
- Workshop attendance.
- Technical feedback.
- Promising builders or teams for follow-up.

Avoid metrics that cannot be responsibly guaranteed:

- Revenue.
- Qualified pipeline value.
- Conversion rate.
- Long-term retention.
- Press coverage.

## Copy Rules

### Tone

Use direct, builder-first language.

Good:

- `300 builders shipping real products in 12 hours.`
- `The rule is simple: someone should be able to use it and get something done.`
- `No inflated promises. Just real usage signals.`
- `Sponsorship buys a banner. Main partnership buys the narrative.`

Avoid:

- Corporate filler.
- Hype without proof.
- Founder-bro language.
- Exclusionary language like `solo cracks`.
- Generic event language that could apply to any hackathon.

### Language

Use English for international partner decks unless the partner conversation is clearly Spanish-first.

Use Spanish for local sponsor decks and event-facing fundraising unless the deck folder is explicitly English.

### Claims

Stay within canonical event facts from `DESIGN.md`:

- The Next Craft.
- Organized by Crafter Station x Next Fellow.
- August 1, 2026.
- 12 hours, 09:00-21:00.
- 300 hackers.
- Teams of 3-5.
- Five cities: Lima, Bogota, Ciudad de Guatemala, Arequipa, El Salvador.
- Core bar: a real product used by someone before the close.

Do not invent sponsors, venues, confirmed speakers, confirmed mentors, or hard attendance beyond the canonical facts. The official cash prize pool is $2,200: $1,000, $800, and $400.

## Slide Component Rules

Deck slides are MDX files. Do not import components inside slides. Components are injected by the deck renderer.

Use the existing vocabulary:

- `SlideTitle` for the main slide title and BASIC-style line label.
- `Lead` for the slide's main sentence.
- `DataGrid` / `DataCell` for pricing, facts, or sponsorship tiers.
- `BenefitGrid` for partner benefits, outcomes, and included items.
- `FlowMap` for a three-step thesis or causal chain.
- `ContrastGrid` for before/after or generic sponsor vs strategic partner comparisons.
- `ChipGrid` for product capabilities or stack tags.
- `PhaseTimeline` / `Timeline` for agenda and event flow.

Keep each slide focused. If a slide needs more than one `Lead`, one grid, and one closing sentence, split it.

## Visual Rules

Decks should preserve the project design direction from `DESIGN.md`.

- Strict black-and-white / C64 mono style.
- Pixel headings for short slide titles only.
- IBM Plex Mono for readable body copy.
- No colorful gradients.
- No glassmorphism.
- No emoji as decoration.
- No generic SaaS deck visuals.
- Use short labels and concrete values.
- Let spacing do the work; avoid cramming.

## Metadata Rules

Every deck requires a `deck.json`.

For partner decks:

```json
{
  "title": "The Next Craft ft. [Partner] - Main Partner Deck",
  "description": "A Main Partner proposal for [Partner] to [specific outcome] for 200 LatAm builders.",
  "icon": "/brand-assets/[partner]/[asset]"
}
```

Use `Title Partner Deck` only when the proposal is intentionally above the normal Main Partner tier.

## New Partner Deck Checklist

Before shipping a partner deck, verify:

- The deck has a specific thesis for that partner.
- The partner owns a track, challenge, workflow, or event narrative.
- The activation plan is concrete enough to execute.
- The investment slide has a clean preferred ask and fallback.
- The benefits slide explains what is included.
- The success metrics are observable and not overpromised.
- Canonical event facts match `DESIGN.md`.
- The copy says `builder adoption with proof`, not just `brand visibility`.
- Slides use existing MDX deck components.
- The deck can be understood without a live narrator.
