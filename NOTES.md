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

Two faces, split strictly by role. **Bodoni Moda** carries identity, section
titles and headline figures; **JetBrains Mono** carries anything with a data
texture — chips, labels, descriptions, dates, percentages. Nothing sits in
between. The contrast between a high-contrast didone and a monospace is the
poster's main typographic idea; Bodoni's thick/thin strokes are also what make
the gradient read as light moving across the letters rather than a flat wash.

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

Both faces go through one glyph registry: each unique glyph is emitted once into
`<defs>` and placed with `<use>`, with kerning applied to the cursor. The current
poster is 181 defs serving 2,743 references. Emitting a merged `<path>` per
string instead took the two files from 158 KB to 458 KB.

## Two traps worth remembering

**React lowercases SVG elements outside the SVG namespace.** The tree must be
rendered through a real React `<svg>` root, not concatenated into one as a
string. Outside that namespace React treats `linearGradient`, `radialGradient`
and `clipPath` as unknown HTML elements and lowercases them, which silently kills
every gradient and clip in the file — it still renders, it just renders wrong.

**Glyph outlines are normalised to a 1000-unit em, which is not every font's own
`unitsPerEm`.** JetBrains Mono is 1000; Bodoni Moda is 2000. Scaling a normalised
outline by `size / unitsPerEm` renders Bodoni at half size while still advancing
the cursor by the full width. It does not look like a scaling bug — it looks like
wildly loose letter-spacing.

One more, smaller: `opentype.js` cannot shape Bodoni Moda through `font.getPath`
(`lookupType: 6 substFormat: 2 is not yet supported`). Glyphs are walked directly
instead, which sidesteps the feature tables and still applies pair kerning — the
only shaping a Latin display line needs.

## Rendering is deterministic

The waveform in the masthead disc comes from fixed harmonics, not `Math.random`.
Random values would rewrite both SVGs on every run and make the daily workflow
commit pure noise.

Both theme files are rendered from **one** component tree; colour resolves
through React context at render time, so the light and dark layouts cannot drift
apart.

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
| source written | Language bytes across owned, non-fork repos, markup and build config excluded |
| languages | Count of real languages after that same exclusion — **not** the number of segments in the band, which only matches when nothing spilled into "other" |
| repositories | Owned, non-fork, non-archived |
| recent pushes | Four most recently pushed owned repos |

Excluded as markup or build config: HTML, CSS, SCSS, Sass, Less, MDX, TeX, Roff,
CMake, Makefile, Dockerfile, Batchfile, Procfile, Nix, Jupyter Notebook, EJS,
Handlebars, Pug, Blade, Mustache, Vim Script, Gnuplot, RTF, Shell, PowerShell.
Counting HTML and CSS as "languages written" flatters everyone equally and tells
a reader nothing.

### Why there is no contribution heatmap or streak

The obvious things to put in a telemetry section are a 12-month contribution grid
and a streak counter. Measured, they are actively misleading here: the account
shows **12 active days across 368** with a longest streak of **2**, because work
happens in bursts and most of it sits in private repos. A grid of that renders as
a near-empty field and reads as inactivity rather than as the missing data it
actually is.

Volume of code, language mix and recent pushes are all measurable, all honest,
and all point the right way.

If contribution volume rises later — or if **Settings → Profile → Include private
contributions on my profile** is enabled, which publishes the counts without
exposing the repos — a heatmap becomes worth adding. `data/github.json` already
carries the full daily calendar and computed streaks, so nothing needs
re-fetching.

## Refresh

`.github/workflows/refresh.yml` runs daily at 00:30 UTC (06:00 IST) and on any
push touching `src/` or the fonts. It commits `assets/` and `data/` only when the
rendered bytes actually change.

The default `GITHUB_TOKEN` is sufficient — the card reads public profile, repo
and language data only.

## Known caveats

- GitHub's image proxy caches SVGs, so a fresh commit can take a few minutes to
  appear on the profile.
- `resvg` (used by `npm run bands`) renders a static frame at t=0, so animation
  never shows there. To check motion, open `.cache/preview.html` in a browser.
- JetBrains Mono has no `★` glyph; it renders as `.notdef`. Avoid it in labels.
