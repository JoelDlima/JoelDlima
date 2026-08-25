# Maintenance notes

Only `README.md` renders on the profile. Everything else in this repo exists to
generate the card it embeds.

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
npm run bands      # rasterise the posters into .cache/png for eyeballing
npm run typecheck
```

`npm run data` shells out to `gh api`, so it uses whatever `gh` is already
authenticated as. No token plumbing.

## How it is built

No third-party card services. React components render to SVG at build time:

```
src/design/tokens.ts       palette, type scale, rhythm, motion — one source of truth
src/design/text.tsx        glyph outlining + the shared glyph registry
src/design/primitives.tsx  the component vocabulary every section is built from
src/design/render.tsx      the SVG shell, the spectrum, the stylesheet
src/sections/*.tsx         one file per section
src/poster.tsx             stacks the sections
src/render-all.tsx         writes assets/ and .cache/preview.html
```

**Everything is one SVG.** Identity, capability, work, track record, telemetry
and contact all sit in a single 900-wide poster — one frame, one gradient
travelling behind the whole thing, one entrance cascade running top to bottom.
Separate cards per section would each restart their own motion and drift out of
alignment with each other.

`README.md` picks between `profile-dark.svg` and `profile-light.svg` with
`<picture>` + `prefers-color-scheme`, so the card follows GitHub's own theme
rather than sitting on the page as a dark slab in light mode.

### How the sections stack

Each section is a pure function of the `y` it starts at, and returns the height
it actually used. `src/poster.tsx` lays them out by running total, so resizing or
reordering a section shifts everything below it automatically — no coordinate
further down ever needs re-deriving by hand.

Two sections measure themselves rather than declaring a constant, because their
content wraps: `capability` (chips flow and wrap, so row heights vary with how
many tools a domain lists) and `work` (descriptions wrap to as many lines as they
need). A constant there would silently drift out of date the first time a tool or
a sentence was added.

## The spectrum

Violet → blue → red → violet, travelling across the page on a 26s loop. It is
the visible spectrum in wavelength order, which is why the poster uses it rather
than an arbitrary set of accent colours.

`#spectrum` spans the poster **diagonally in user space**, so an element's hue
depends on where it sits — the whole poster reads as one gradient sampled in many
places rather than as several unrelated accents. `#spectrumH` spans a single
horizontal band, for bars and rules that should show the full sweep within their
own width.

Both hold **two** full turns and translate by exactly **one** turn per cycle, so
when the loop restarts the second turn is sitting precisely where the first began
and there is no visible jump.

This is SMIL (`<animateTransform>`) rather than CSS, because `gradientTransform`
is a presentation attribute that CSS `transform` does not map onto.

Hues are deliberately pulled off the obvious `#8B5CF6 / #3B82F6 / #EF4444`
framework defaults, which read as generic neon. Lower saturation gives ink rather
than glow.

## Typography

One family only: **JetBrains Mono**, in three weights (Regular, Bold, ExtraBold).
There used to be a second, serif display face for headlines — dropped in favour
of a single bold-mono register closer to a terminal or a dev-tool UI (Vercel,
GitHub itself). It also removed an entire class of bug: the old display face had
a different units-per-em from the mono face, and a size/em mismatch there showed
up as wrong letter-spacing rather than an obviously wrong size. One family means
one fixed 0.6em advance for every weight, so all layout math is exact arithmetic
with no font-specific cases.

`Display` still exists as its own component — sections read better calling
something named for what it does — but it is a thin wrapper over `Mono` with a
bolder default weight. See `src/design/text.tsx`.

## What cannot go in the SVG

GitHub proxies README images through `camo.githubusercontent.com` and renders
them inside an `<img>`, which puts the SVG in "secure animated mode":

| | |
|---|---|
| Scripts | Stripped. React runs at build time only. |
| External URLs | Blocked. No `@import`, no remote `<image>`, no linked webfonts. |
| Interactivity | An `<a>` inside is inert, and so is `currentColor`. |
| Animation | **Runs.** CSS keyframes and SMIL both play. |

**Links.** The four contacts are drawn *inside* the poster so you can read them,
**and** repeated underneath as clickable badges. There is no way to have both in
one element: `<object>`, `<embed>`, inline `<svg>` and `<map>` are all stripped
by the sanitiser.

**Fonts.** Rather than inlining a subsetted woff2 as a data URI, every glyph is
converted to outlines at build time. Nothing to verify, no `font-display` race
when the SVG is rasterised, and no fallback to get wrong.

Every unique glyph is emitted once into `<defs>` and placed with `<use>`.
Emitting a merged `<path>` per string instead is simpler but repeats the same
outlines hundreds of times across the poster — it cost roughly 300 KB across the
two theme files before the registry existed.

## The telemetry section: streaks, grid, and a snake

Current streak, longest streak, and a real contribution grid, built from the
daily calendar `data/github.json` already stores (368 days, fetched once via
GraphQL — nothing here is refetched). A three-segment marker travels the actual
route through the days that had commits, via `<animateMotion>` along a path
built from those days' cell centres in chronological order.

**The snake is three offset copies of the same motion, not one.** Trailing is
done with negative `begin` values (`-0.55s`, `-1.1s`) on duplicate
`<animateMotion>` elements sharing one `dur` and one `path` — a negative begin
means the animation is treated as already partway through when the document
starts, which is what makes segment 2 and 3 appear to be following segment 1
rather than all three moving in lockstep.

**Verifying SMIL motion cannot go through `element.transform.animVal`** — that
stays empty for `<animateMotion>` in every browser tested. `element.getCTM()`
does reflect it; sample that at a few `svg.setCurrentTime(t)` points to confirm
motion is actually wired up before trusting it.

If the account's contribution history is sparse (this one currently shows 12
active days across 368), the route will visibly jump between distant cells
rather than crawl continuously — that is the real gap between commits, not a
bug. A denser history renders as a denser, smoother route automatically; nothing
here is tuned to today's specific data.

## Two traps worth remembering

**React lowercases SVG elements outside the SVG namespace.** The tree must be
rendered through a real React `<svg>` root, not concatenated into one as a
string. Outside that namespace React treats `linearGradient`, `radialGradient`
and `clipPath` as unknown HTML elements and lowercases them, which silently kills
every gradient and clip in the file — it still renders, it just renders wrong.

**Glyph outlines are normalised to a 1000-unit em.** This matches JetBrains
Mono's own `unitsPerEm` today, but if a future face uses a different one, scaling
a normalised outline by `size / unitsPerEm` instead of the registry's fixed
constant renders it at the wrong size while still advancing the cursor by the
font's own width — it does not look like a scaling bug, it looks like wrong
letter-spacing.

## Rendering is deterministic

Both theme files are rendered from **one** component tree; colour resolves
through React context at render time, so the light and dark layouts cannot drift
apart. Nothing in the poster depends on `Math.random` — the snake's route comes
straight from the calendar dates, in order, so a rebuild with unchanged data
produces byte-identical output.

## Nothing is hidden by an attribute

Entrance animations start from `opacity: 0` inside `@keyframes` only — there is
no `opacity="0"` anywhere in the output. If a sanitiser ever strips `<style>`,
the poster still renders correctly; it is just static, never blank.

`transform-box: fill-box` is scoped to the classes that genuinely scale or rotate
about their own box, rather than applied with `*`. Applied globally it also
distorts plain translations that compose with an ancestor rotation.

`prefers-reduced-motion: reduce` collapses the entrance cascade to near-instant
and stops the ambient drift, but leaves the spectrum turning — that is the
design, not decoration, and removing it would leave the poster looking broken.

## Data decisions

| Field | How it is computed |
|---|---|
| current / longest streak | Computed once in `src/data/github.ts`, from the full daily calendar — longest run of consecutive active days across the whole fetched history; current run ending today **or** yesterday, so a day with no commits yet does not read as a broken streak |
| contributions · 12mo | GraphQL `contributionCalendar.totalContributions` |
| repositories | Owned, non-fork, non-archived |

Language-mix percentages and recent-push lists were both cut. Byte totals and a
follower count sat in an earlier version of this section and are gone too —
GitHub's own profile page already shows contribution activity, and a README
that recreates it in miniature is competing with GitHub rather than adding to
it.

## Refresh

`.github/workflows/refresh.yml` runs daily at 00:30 UTC (06:00 IST) and on any
push touching `src/` or the fonts. It commits `assets/` and `data/` only when the
rendered bytes actually change.

The default `GITHUB_TOKEN` is sufficient — the card reads public profile, repo
and language data only.

## Known caveats

- GitHub's image proxy caches SVGs, so a fresh commit can take a few minutes to
  appear on the profile.
- `resvg` (used by `npm run bands`) renders a static frame at t=0, so the snake
  and the spectrum both appear frozen there. To check motion, open
  `.cache/preview.html` in a real browser.
- JetBrains Mono has no `★` glyph; it renders as `.notdef`. Avoid it in labels.
