# Maintenance notes

Only `README.md` renders on the profile. Everything else in this repo exists to
generate what it embeds.

## Repo requirement

For this to show at <https://github.com/JoelDlima>, the repo must be **named
exactly `JoelDlima`** (repo name == username), public, with `README.md` at the
root.

## Commands

```bash
npm install
npm run fonts      # one-time; the faces are committed, so normally a no-op
npm run data       # refresh data/github.json from the GitHub API
npm run render     # re-render assets/ from the current snapshot
npm run build      # data + render
npm run typecheck
```

`npm run data` shells out to `gh api`, so it uses whatever `gh` is already
authenticated as. No token plumbing.

## How it is built

No third-party card services. React components render to SVG at build time:

```
src/design/tokens.ts       workbench palette, type scale, rhythm — one source of truth
src/design/text.tsx        glyph outlining + the shared glyph registry
src/design/primitives.tsx  the component vocabulary every card is built from
src/design/render.tsx      card shell, badge shell, stylesheet
src/design/calendar.tsx    contribution-grid geometry shared by the snake card and figures
src/data/github.ts         loads + derives streaks etc. from the snapshot
src/cards/*.tsx            one file per card: intro, now (bench status), snake-card
src/links.ts               contact destinations shared by badges and README copy
src/render-all.tsx         writes assets/ and .cache/preview.html
```

**The profile is a bento of discrete cards, not one poster.** The README composes
separate SVGs as markdown-level elements — hero → linked work table → bench
status → snake → contact badges — each with its own entrance cascade. This is a
deliberate inversion of an earlier one-poster design: separate cards let the
README reorder, drop or add elements without re-rendering everything, keep each
file small enough that GitHub's image proxy serves it fast, and give the page
real markdown structure (headings, a clickable work table) between the images.

## The identity: the workbench

One idea carries the whole page — Joel builds hardware, so the profile reads
like his bench at night:

- **Carbon-black surfaces** (`#0C0C0E`) with warm-white ink.
- **A single amber-phosphor accent** (`#FFB627`) — the colour instruments use
  to mark what is live. Deliberately single-accent: one hue marked "energised"
  reads as intent; three read as a theme store. Also deliberately *not* the
  violet-gradient look most student profiles have, and not greyscale-space
  either (an unrelated reference profile went starfield; this is its own thing).
- **Light theme is the same bench in daylight**: warm paper (`#FAF8F3`),
  burnt-amber ink (`#9A6100`, ≥4.5:1 contrast — bright phosphor fails on paper).

The component vocabulary speaks bench: `Trace` (signal line), `EdgeConnectors`
(pad rings where traces meet the edge), `Blip` (breathing live-dot),
`Cursor` (terminal caret), `BarRow`/`StackRun` (instrument readouts).

### The daily-updating panel

The `now` card is the honest equivalent of a moon-phase widget: three gauges
whose values move with real dates. Internship progress computes from the actual
appointment window at build time, so the nightly refresh advances it one day;
the graduation countdown counts to the real date; contributions come from the
live snapshot. Nothing decorative moves for motion's sake.

## Typography

One family only: **JetBrains Mono**, in three weights (Regular, Bold,
ExtraBold), fixed 0.6em advance per weight — layout math is exact arithmetic
with no font-specific cases.

Every glyph is converted to outlines at build time and emitted once into
`<defs>`, placed with `<use>`. Nothing to verify, no `font-display` race when
the SVG is rasterised, no fallback to get wrong.

JetBrains Mono has no `★` glyph; it renders as `.notdef`. Avoid it in labels.

## What cannot go in the SVG

GitHub proxies README images through `camo.githubusercontent.com` and renders
them inside an `<img>`, which puts the SVG in "secure animated mode":

| | |
|---|---|
| Scripts | Stripped. React runs at build time only. |
| External URLs | Blocked. No `@import`, no remote `<image>`, no linked webfonts. |
| Interactivity | An `<a>` inside is inert, and so is `currentColor`. |
| Animation | **Runs.** CSS keyframes and SMIL both play. |

**Links.** This constraint is exactly why the README is a bento: links live in
the *markdown* layer — the selected-work table, the contact badges wrapped in
`<a>` — while the cards stay pure visuals. There is no way to have links inside
an SVG behind `<img>`: `<object>`, `<embed>`, inline `<svg>` and `<map>` are all
stripped, and an `<a>` inside the file is inert.

**Dark/light per element.** Cards that read well in both themes (snake) ship
both themes and swap via `<picture>` + `prefers-color-scheme`. Cards whose dark
version works on both GitHub themes ship dark only — fewer bytes, one less
thing to drift.

## The snake

Standalone card, built from the daily calendar `data/github.json` already
stores (fetched once via GraphQL — nothing here is refetched at runtime). A
three-segment marker travels the actual route through the days that had
commits, via `<animateMotion>` along a path built from those days' cell centres
in chronological order.

**The snake is three offset copies of the same motion, not one.** Spacing is
done with negative `begin` values on duplicate `<animateMotion>` elements
sharing one `dur` and one path — a negative begin means the animation is
treated as already partway through when the document starts. Measured detail
worth keeping: a *more* negative begin sits **further along the path** at any
instant, so offsets are assigned back-to-front — the largest, brightest segment
carries the most-negative begin and leads. Assign them the other way and the
snake swims tail-first (bright dot dragging, faint dots pointing).

**Verifying SMIL motion cannot go through `element.transform.animVal`** — that
stays empty for `<animateMotion>` in every browser tested. `element.getCTM()`
does reflect it; sample it at a few `svg.setCurrentTime(t)` points to confirm
motion is actually wired before trusting it.

If the contribution history is sparse, the route visibly jumps between distant
cells rather than crawling continuously — that is the real gap between commits,
not a bug. A denser history renders denser automatically; nothing here is tuned
to today's specific data.

## Two traps worth remembering

**React lowercases SVG elements outside the SVG namespace.** Trees must render
through a real React `<svg>` root. Outside that namespace React treats
`linearGradient`, `radialGradient` and `clipPath` as unknown HTML elements and
lowercases them, which silently kills every gradient and clip in the file — it
still renders, it just renders wrong.

**Glyph outlines are normalised to a 1000-unit em.** This matches JetBrains
Mono's own `unitsPerEm` today, but if a future face differs, scaling by
`size / unitsPerEm` instead of the registry's fixed constant renders glyphs at
the wrong size while still advancing the cursor by the font's width — it does
not look like a scaling bug, it looks like wrong letter-spacing.

## Rendering is deterministic

Each card renders from **one** component tree; colour resolves through React
context at render time, so light and dark layouts cannot drift apart. Nothing
depends on `Math.random` — the snake's route comes straight from the calendar
dates, in order — so a rebuild with unchanged data produces byte-identical
output. That matters because the refresh workflow only commits when bytes
actually change.

## Nothing is hidden by an attribute

Entrance animations start from `opacity: 0` inside `@keyframes` only — there is
no `opacity="0"` anywhere in the output. If a sanitiser ever strips `<style>`,
every card still renders correctly; it is just static, never blank.

## Data decisions

| Field | How it is computed |
|---|---|
| current / longest streak | Computed once in `src/data/github.ts` from the full daily calendar — longest run of consecutive active days across the fetched history; current run ending today **or** yesterday, so a day with no commits yet does not read as broken |
| internship progress | Days elapsed inside the appointment window in `src/data/profile.ts`, computed at build time |
| graduation countdown | Fixed target date in `profile.ts`, computed at build time |
| contributions · trailing year | GraphQL `contributionCalendar.totalContributions` |

Follower counts, language-mix bars, byte totals and recent-push lists were all
cut across earlier iterations and stay cut — GitHub's own chrome already shows
that data, and a README recreating it competes with GitHub rather than adding
to it.

## Refresh

`.github/workflows/refresh.yml` runs daily at 00:30 UTC (06:00 IST) and on any
push touching `src/` or the fonts. It commits `assets/` and `data/` only when
the rendered bytes actually change — which is what makes the bench-status card
advance daily without manual runs.

The default `GITHUB_TOKEN` is sufficient — the pipeline reads public profile,
repo and calendar data only.

## Known caveats

- GitHub's image proxy caches SVGs, so a fresh commit can take a few minutes to
  appear on the profile.
- To check animation, open `.cache/preview.html` in a real browser; static
  rasterisers show frame zero only.
