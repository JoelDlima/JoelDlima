# Setup

Everything in `assets/gen/` is generated and committed by GitHub Actions. The
README never fetches a stat card from a third-party server, which matters more
than it used to — see [Why nothing is rendered off-site](#why-nothing-is-rendered-off-site).

Files ship with placeholders already in place, so the README looks intact from
the first commit and fills in with real numbers once the workflows run.

---

## 1. Copy the files in

Into `github.com/JoelDlima/JoelDlima`, preserving paths:

```
README.md
SETUP.md
assets/                    hand-authored, unchanged
assets/gen/                generated — placeholders now, real cards after step 4
data/                      accumulated traffic history
scripts/gh.py
scripts/build_stats.py
scripts/build_observatory.py
.github/workflows/stats.yml
.github/workflows/observatory.yml
.github/workflows/snake.yml
```

---

## 2. Create the token

The workflows need a personal access token. The default `GITHUB_TOKEN` is not
enough for either job: it cannot answer the GraphQL contributions query, and it
only reaches the repository it runs in, while the observatory reads traffic
across every repo.

**Classic token** — the simpler route.
[Settings → Developer settings → Personal access tokens → Tokens (classic)](https://github.com/settings/tokens)

| Scope | Why |
|:--|:--|
| `repo` | Repository traffic, and private contributions in the totals |
| `read:user` | Profile, followers, contribution calendar |

Set an expiry you will actually notice — a token that dies quietly just makes
the cards stop moving.

**Fine-grained token** — if you prefer it. Grant access to *All repositories*, then:
Metadata → Read, Contents → Read, Administration → Read. Administration is the
one people miss; the traffic endpoints sit behind it.

If a scope is wrong, the scripts print the exact permission GitHub asked for
rather than a bare 403 — `gh.py` reads it back out of the
`x-accepted-github-permissions` response header.

---

## 3. Add it as a secret

Repository → Settings → Secrets and variables → Actions → **New repository secret**

```
Name:   TEST_123
Secret: <the token>
```

If you rename it, change `secrets.TEST_123` in both `stats.yml` and
`observatory.yml` to match.

Then Settings → Actions → General → Workflow permissions →
**Read and write permissions**. Without it the commit step cannot push.

---

## 4. Run them once

Actions tab → pick the workflow → **Run workflow**. In this order:

1. `profile stats` — writes `assets/gen/stats.svg`, `streak.svg`, `languages.svg`
2. `observatory` — writes `traffic.svg`, `sources.svg`, `audience.svg` and seeds `data/`
3. `contribution snake` — publishes to the `output` branch

Each ends with a commit only if something actually changed, so a quiet day
leaves no empty commit behind.

After that they run on their own: stats twice daily, observatory daily, snake
twice daily.

---

## 5. What to expect on day one

The observatory starts with whatever GitHub is currently holding — up to 14
days of backfill, and often much less on a repo that has just been touched.
The traffic chart says `COLLECTING` until two days are on record, then draws
itself and keeps growing. `data/traffic.json` is the reason it keeps growing:
GitHub drops traffic older than 14 days, and the merge step folds each fresh
window into the stored history rather than replacing it.

Do not delete `data/traffic.json`. It is the only copy of anything older than
a fortnight.

---

## What becomes public

A profile README repository has to be public for GitHub to render it, so
everything committed to `data/` is public too. Two consequences worth deciding
on deliberately.

**Your traffic numbers stop being private.** Normally repository traffic is
visible only to accounts with push access, through Insights -> Traffic.
Publishing the Observatory puts view counts, unique visitors and clone counts
on the page for anyone. That is the point of the section, but it is a choice —
drop section 09 from the README if you would rather it stayed yours.

**Private repository names never appear.** Once the token has All-repositories
access it can read traffic for private repos too. Those numbers are folded into
the daily totals, but the repo names and paths are deliberately dropped before
anything is written: `per_repo` and `paths_14d` list public repositories only,
and `collect_audience` skips private repos entirely. Otherwise the four
projects you keep private would be named in a public JSON file.

Referrers are kept for every repo, private included, because they are bare
hostnames like `Google` or `linkedin.com` and name nothing of yours.

---

## Why nothing is rendered off-site

Checked on 22 August 2026:

| Service | Status |
|:--|:--|
| `github-readme-stats.vercel.app` | `503 DEPLOYMENT_PAUSED` |
| `github-profile-trophy.vercel.app` | `402 DEPLOYMENT_DISABLED` |
| `streak-stats.demolab.com` | intermittent — one connection failure in four |

All three projects are actively maintained; it is the free hosted instances
that keep falling over under load. A README pointing at them shows broken
images on someone else's bad day, usually without the owner noticing.

The cards here are rendered by `scripts/` and committed, so they are as
available as the repository itself. Three third-party services are still
referenced, chosen because they were each responding and none of them carry a
number that matters: `komarev.com` (profile view counter), `shields.io`
(badges), `skillicons.dev` (stack icons), and the activity graph.

---

## Local runs

```bash
GH_TOKEN=ghp_xxx GH_USER=JoelDlima python scripts/build_stats.py
```

```bash
GH_TOKEN=ghp_xxx GH_USER=JoelDlima python scripts/build_observatory.py
```

Standard library only — nothing to install. Output lands in `assets/gen/`
exactly as it does on the runner.

---

## Changing the look

The palette is declared once at the top of each builder and matches the
hand-authored SVGs in `assets/`:

| Token | Hex | Used for |
|:--|:--|:--|
| `BG` | `#0d1117` | Card ground |
| `CYAN` | `#8ecae6` | Grid, views, primary metrics |
| `AMBER` | `#f6bd60` | Streaks, clones, peaks |
| `PURPLE` | `#b8a1ff` | Pull requests, forks |
| `GREEN` | `#3FCF8E` | Followers, unique visitors |

`shell()` in each builder draws the frame — ground, grid, corner brackets,
border — so a change there lands on every card at once.

### The one constraint that shapes everything

GitHub serves these SVGs with:

```
Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'; sandbox
```

Read it carefully, because it decides what is possible:

| Directive | Consequence |
|:--|:--|
| `style-src 'unsafe-inline'` | Inline CSS works — hence the animations and the whole look |
| no `img-src` | Falls back to `none`. **Every image is blocked, `data:` URIs included** |
| no `font-src` | Falls back to `none`. **Webfonts cannot be embedded, even as `data:`** |

GitHub allowlists `data:` in its main page CSP but deliberately leaves it out
for raw files, so nested images are a dead end no matter how they are encoded.
An early version of `audience.svg` inlined real avatars as base64 PNGs; they
would never have rendered. Rows now draw monogram discs from shapes and text,
which are always permitted — and the file went from 17.7 KB to 5.2 KB.

The same rule kills embedded fonts. `@font-face` with a `data:` URI is blocked
just as an external URL is, so the only typefaces available are the ones
already installed on the reader's machine. Both stacks are ordered accordingly:

```
MONO  JetBrains Mono -> Cascadia Code -> Fira Code -> SF Mono -> ... -> monospace
SANS  Inter -> Inter Tight -> SF Pro Text -> Segoe UI Variable -> ... -> sans-serif
```

Numbers and technical labels are mono; names and prose are sans. Readers with
JetBrains Mono or Inter installed see exactly that, and everyone else lands on
a close relative.

Two further things follow from the same constraint: no `@import`, and no
hotlinked images anywhere in `assets/`.
