"""Repository observatory: who reaches these repos, and where they came from.

Two honest halves, because GitHub draws a hard line between them:

  Counted, never named   Views, unique visitors and clones come from the
                         traffic API as aggregates. GitHub does not expose
                         visitor identity to anyone, and a tracking pixel in a
                         README cannot recover it either: every image is
                         proxied through camo.githubusercontent.com, so the
                         only address a pixel ever sees is GitHub's own.

  Named, because public   Stars, forks and follows are public events with a
                         real account attached. Those people can be listed.

GitHub keeps traffic for 14 days only, so each run merges the fresh window
into data/traffic.json and the history accumulates past that limit.
"""
import datetime as dt
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gh import TOKEN, USER, esc, human, rest, rest_all  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "gen")
DATA = os.path.join(ROOT, "data")

BG = "#0d1117"
LINE = "#8ecae6"
TEXT = "#e6edf3"
MUTED = "#4a5563"
DIM = "#8b949e"
CYAN = "#8ecae6"
AMBER = "#f6bd60"
PURPLE = "#b8a1ff"
GREEN = "#3FCF8E"

MONO = ("'JetBrains Mono','Cascadia Code','Fira Code','SF Mono',"
        "'Roboto Mono',Consolas,'Liberation Mono',monospace")

SANS = ("Inter,'Inter Tight','SF Pro Text','Segoe UI Variable Text','Segoe UI',"
        "Roboto,'Helvetica Neue',Arial,sans-serif")

CHART_DAYS = 60
STAR_JSON = "application/vnd.github.star+json"


# --------------------------------------------------------------- frame

def shell(w, h, title, desc, body, defs=""):
    hlines = "".join('<path d="M0 %d H%d"/>' % (y, w) for y in range(30, h, 30))
    vlines = "".join('<path d="M%d 0 V%d"/>' % (x, h) for x in range(40, w, 40))
    return """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %(w)d %(h)d" width="%(w)d" height="%(h)d"
     role="img" aria-labelledby="obsTitle obsDesc">
  <title id="obsTitle">%(title)s</title>
  <desc id="obsDesc">%(desc)s</desc>
  <defs>
    <style><![CDATA[
      .m { font-family: %(mono)s; }
      .cap { font-size: 8px; letter-spacing: 2.4px; font-weight: 700; fill: %(muted)s; }
      .val { font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
      .lbl { font-size: 7px; letter-spacing: 1.5px; font-weight: 700; fill: %(dim)s; }
      .sub { font-family: %(sans)s; font-size: 8.5px; letter-spacing: 0.2px; fill: %(muted)s; }
      .row { font-family: %(sans)s; font-size: 10.5px; font-weight: 600; fill: %(text)s; }
      .tiny { font-size: 8px; fill: %(muted)s; }
      .rise { animation: rise .7s cubic-bezier(.2,.8,.3,1) both; }
      @keyframes rise { from { opacity: 0 } to { opacity: 1 } }
      @media (prefers-reduced-motion: reduce) { .rise { animation: none } }
    ]]></style>
    %(defs)s
    <clipPath id="frame"><rect width="%(w)d" height="%(h)d" rx="8"/></clipPath>
  </defs>
  <g clip-path="url(#frame)">
    <rect width="%(w)d" height="%(h)d" fill="%(bg)s"/>
    <g stroke="%(line)s" stroke-width="0.3" opacity="0.06">%(hl)s%(vl)s</g>
    <g stroke="%(line)s" stroke-width="1" fill="none" opacity="0.45">
      <path d="M10 22V10h12"/><path d="M%(r1)d 10h12v12"/>
      <path d="M%(r2)d %(b1)dv12h-12"/><path d="M22 %(b2)dH10v-12"/>
    </g>
%(body)s
  </g>
  <rect width="%(w1)d" height="%(h1)d" x="0.5" y="0.5" rx="8" fill="none"
        stroke="%(line)s" stroke-opacity="0.18"/>
</svg>
""" % {
        "w": w, "h": h, "w1": w - 1, "h1": h - 1,
        "r1": w - 22, "r2": w - 10, "b1": h - 22, "b2": h - 10,
        "title": esc(title), "desc": esc(desc), "body": body, "defs": defs,
        "mono": MONO, "sans": SANS, "bg": BG, "line": LINE, "muted": MUTED, "dim": DIM,
        "text": TEXT, "hl": hlines, "vl": vlines,
    }


def metric(x, y, value, label, colour, delay):
    return (
        '    <g class="rise" style="animation-delay:%.2fs">\n'
        '      <text class="m val" x="%d" y="%d" fill="%s">%s</text>\n'
        '      <text class="m lbl" x="%d" y="%d">%s</text>\n'
        '    </g>\n' % (delay, x, y, colour, esc(value), x, y + 13, esc(label.upper()))
    )


# --------------------------------------------------------------- collect

def owned_repos():
    """Source repos owned by the user. Traffic needs push access, so forks of
    other people's work are skipped — the numbers there are not ours."""
    repos = rest_all("/users/{u}/repos", type="owner", sort="updated")
    return [r for r in repos if not r["fork"] and not r["archived"]]


def collect_traffic(repos):
    """Fresh 14-day window per repo, plus the rolling referrer and path lists.

    This profile repository is public, so everything written to data/ is public
    too. A private repo therefore contributes its numbers to the daily totals
    and nothing else: naming it in per_repo, or letting its path appear in
    paths_14d, would publish the existence of work that is private on purpose.
    Referrers are kept because they are bare hostnames.
    """
    daily = {}
    per_repo = {}
    referrers = {}
    paths = {}
    reachable = 0
    private_seen = 0

    for repo in repos:
        name = repo["name"]
        private = repo.get("private", False)
        try:
            views = rest("/repos/{u}/%s/traffic/views" % name, per="day")
            clones = rest("/repos/{u}/%s/traffic/clones" % name, per="day")
        except Exception as e:
            # 403 here means the token lacks traffic scope for this repo.
            print("  skip %s: %s" % (name, e), file=sys.stderr)
            continue
        reachable += 1

        for point in views.get("views", []):
            day = point["timestamp"][:10]
            slot = daily.setdefault(day, {"views": 0, "uniques": 0, "clones": 0, "clone_uniques": 0})
            slot["views"] += point["count"]
            slot["uniques"] += point["uniques"]
        for point in clones.get("clones", []):
            day = point["timestamp"][:10]
            slot = daily.setdefault(day, {"views": 0, "uniques": 0, "clones": 0, "clone_uniques": 0})
            slot["clones"] += point["count"]
            slot["clone_uniques"] += point["uniques"]

        if private:
            private_seen += 1
        else:
            per_repo[name] = {"views": views.get("count", 0), "uniques": views.get("uniques", 0)}

        try:
            for ref in rest("/repos/{u}/%s/traffic/popular/referrers" % name):
                slot = referrers.setdefault(ref["referrer"], {"count": 0, "uniques": 0})
                slot["count"] += ref["count"]
                slot["uniques"] += ref["uniques"]
            if not private:
                for p in rest("/repos/{u}/%s/traffic/popular/paths" % name):
                    slot = paths.setdefault(
                        p["path"], {"title": p.get("title", ""), "count": 0, "uniques": 0})
                    slot["count"] += p["count"]
                    slot["uniques"] += p["uniques"]
        except Exception as e:
            print("  referrers/paths unavailable for %s: %s" % (name, e), file=sys.stderr)

    if private_seen:
        print("  %d private repos counted in totals only, never named" % private_seen)

    return daily, per_repo, referrers, paths, reachable


def merge_history(fresh_daily, per_repo, referrers, paths):
    """Fold the fresh window into stored history so it outlives 14 days."""
    path = os.path.join(DATA, "traffic.json")
    if os.path.exists(path):
        with open(path, encoding="utf-8") as fh:
            store = json.load(fh)
    else:
        store = {"tracked_since": min(fresh_daily) if fresh_daily else dt.date.today().isoformat(),
                 "daily": {}}

    # The last 14 days are authoritative, so overwrite rather than add —
    # adding would double-count every day on every run.
    store["daily"].update(fresh_daily)
    store["per_repo"] = per_repo
    # Referrers and paths are a rolling 14-day window, not a running total.
    store["referrers_14d"] = referrers
    store["paths_14d"] = paths
    store["updated"] = dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")
    if store["daily"]:
        earliest = min(store["daily"])
        known = store.get("tracked_since")
        # The shipped seed file carries a null here, and so does any store
        # written before the first day of traffic landed.
        store["tracked_since"] = min(known, earliest) if known else earliest

    os.makedirs(DATA, exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(store, fh, indent=2, sort_keys=True)
    return store


def collect_audience(repos):
    """The named half: who starred, forked or followed."""
    stars = []
    forks = []
    for repo in repos:
        name = repo["name"]
        # Same reasoning as collect_traffic: audience.json is public, and a
        # private repo's name must not appear in it.
        if repo.get("private", False):
            continue
        if repo["stargazers_count"]:
            for s in rest_all("/repos/{u}/%s/stargazers" % name, cap=200, accept=STAR_JSON):
                user = s.get("user") or s
                stars.append({"login": user["login"], "avatar": user["avatar_url"],
                              "at": s.get("starred_at", ""), "repo": name})
        if repo["forks_count"]:
            for f in rest_all("/repos/{u}/%s/forks" % name, cap=100):
                owner = f["owner"]
                if owner["login"] == USER:
                    continue
                forks.append({"login": owner["login"], "avatar": owner["avatar_url"],
                              "at": f["created_at"], "repo": name})

    followers = [{"login": f["login"], "avatar": f["avatar_url"]}
                 for f in rest_all("/users/{u}/followers", cap=300)]

    path = os.path.join(DATA, "audience.json")
    seen = {}
    if os.path.exists(path):
        with open(path, encoding="utf-8") as fh:
            seen = json.load(fh).get("first_seen", {})

    # Followers carry no timestamp, so stamp the first run that saw them.
    today = dt.date.today().isoformat()
    for f in followers:
        seen.setdefault("follower:" + f["login"], today)
        f["at"] = seen["follower:" + f["login"]]

    stars.sort(key=lambda s: s["at"], reverse=True)
    forks.sort(key=lambda f: f["at"], reverse=True)
    followers.sort(key=lambda f: f["at"], reverse=True)

    os.makedirs(DATA, exist_ok=True)
    with open(path, "w", encoding="utf-8") as fh:
        json.dump({"updated": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
                   "first_seen": seen,
                   "stargazers": stars, "forkers": forks,
                   "followers": [f["login"] for f in followers]},
                  fh, indent=2, sort_keys=True)

    return stars, forks, followers


def monogram(login):
    """Initials for the avatar disc.

    Raster avatars are not an option. GitHub serves these SVGs with
    `Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'`,
    and with no img-src of its own that falls back to 'none' — which blocks
    data: URIs as well as remote ones. Inline CSS survives, so shapes and text
    render and images do not. Letters drawn as text always show up.
    """
    cleaned = [c for c in login if c.isalnum()]
    if not cleaned:
        return "?"
    if len(cleaned) == 1:
        return cleaned[0].upper()
    # A digit as the second glyph reads as noise; prefer a letter when there is one.
    tail = next((c for c in cleaned[1:] if c.isalpha()), cleaned[1])
    return (cleaned[0] + tail).upper()


# --------------------------------------------------------------- cards

def card_traffic(store, repo_count, reachable):
    daily = store.get("daily", {})
    w, h = 900, 260
    total_views = sum(d["views"] for d in daily.values())
    total_uniques = sum(d["uniques"] for d in daily.values())
    total_clones = sum(d["clones"] for d in daily.values())
    since = store.get("tracked_since", "")

    parts = [
        '    <text class="m cap" x="24" y="34">REPOSITORY TRAFFIC</text>\n',
        '    <text class="m sub" x="%d" y="34" text-anchor="end">'
        '%d OF %d REPOSITORIES REPORTING &#183; SINCE %s</text>\n'
        % (w - 24, reachable, repo_count, esc(pretty(since))),
        '    <path d="M24 46H%d" stroke="%s" stroke-opacity="0.14"/>\n' % (w - 24, LINE),
    ]

    cells = [
        (human(total_views), "page views", CYAN),
        (human(total_uniques), "unique visitors", GREEN),
        (human(total_clones), "clones", AMBER),
        (str(len(daily)), "days recorded", PURPLE),
    ]
    for i, (value, label, colour) in enumerate(cells):
        parts.append(metric(24 + i * 150, 88, value, label, colour, 0.06 * i))

    # Sparkline of the most recent window.
    days = sorted(daily)[-CHART_DAYS:]
    cx, cy, cw, ch = 24, 130, w - 48, 96

    if len(days) < 2:
        parts.append(
            '    <rect x="%d" y="%d" width="%d" height="%d" rx="6" fill="none" '
            'stroke="%s" stroke-opacity="0.12" stroke-dasharray="3 3"/>\n'
            '    <text class="m sub" x="%d" y="%d" text-anchor="middle">'
            'COLLECTING &#183; THE CHART DRAWS ITSELF ONCE TWO DAYS ARE ON RECORD</text>\n'
            % (cx, cy, cw, ch, LINE, cx + cw // 2, cy + ch // 2))
    else:
        peak = max(max(daily[d]["views"] for d in days), 1)
        step = cw / (len(days) - 1)

        def points(key):
            return [(cx + i * step, cy + ch - (daily[d][key] / peak) * (ch - 12))
                    for i, d in enumerate(days)]

        view_pts = points("views")
        uniq_pts = points("uniques")
        line = " ".join("%.1f,%.1f" % p for p in view_pts)
        area = "%.1f,%.1f " % (cx, cy + ch) + line + " %.1f,%.1f" % (cx + cw, cy + ch)

        parts.append(
            '    <g stroke="%s" stroke-width="0.3" opacity="0.10">%s</g>\n'
            % (LINE, "".join('<path d="M%d %d H%d"/>' % (cx, cy + int(ch * f), cx + cw)
                             for f in (0, 0.25, 0.5, 0.75, 1))))
        parts.append(
            '    <polygon points="%s" fill="url(#fade)" opacity="0">\n'
            '      <animate attributeName="opacity" to="1" dur="0.9s" begin="0.2s" fill="freeze"/>\n'
            '    </polygon>\n' % area)
        parts.append(
            '    <polyline points="%s" fill="none" stroke="%s" stroke-width="1.6" '
            'stroke-linejoin="round" stroke-linecap="round" pathLength="1" '
            'stroke-dasharray="1" stroke-dashoffset="1">\n'
            '      <animate attributeName="stroke-dashoffset" to="0" dur="1.2s" '
            'begin="0.1s" fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.3 1"/>\n'
            '    </polyline>\n' % (line, CYAN))
        parts.append(
            '    <polyline points="%s" fill="none" stroke="%s" stroke-width="1.1" '
            'stroke-dasharray="3 3" opacity="0">\n'
            '      <animate attributeName="opacity" to="0.85" dur="0.6s" begin="0.9s" fill="freeze"/>\n'
            '    </polyline>\n' % (" ".join("%.1f,%.1f" % p for p in uniq_pts), GREEN))

        peak_i = max(range(len(days)), key=lambda i: daily[days[i]]["views"])
        px, py = view_pts[peak_i]
        parts.append(
            '    <circle cx="%.1f" cy="%.1f" r="2.6" fill="%s"/>\n'
            '    <text class="m tiny" x="%.1f" y="%.1f" text-anchor="middle" fill="%s">%d</text>\n'
            % (px, py, AMBER, px, py - 8, AMBER, daily[days[peak_i]]["views"]))

        parts.append(
            '    <text class="m tiny" x="%d" y="%d">%s</text>\n'
            '    <text class="m tiny" x="%d" y="%d" text-anchor="end">%s</text>\n'
            % (cx, cy + ch + 14, esc(pretty(days[0])), cx + cw, cy + ch + 14, esc(pretty(days[-1]))))
        parts.append(
            '    <g transform="translate(%d,%d)">\n'
            '      <rect width="8" height="2" y="-3" fill="%s"/>'
            '<text class="m tiny" x="13" y="0">VIEWS</text>\n'
            '      <rect width="8" height="2" x="58" y="-3" fill="%s"/>'
            '<text class="m tiny" x="71" y="0">UNIQUE</text>\n'
            '    </g>\n' % (cx + cw // 2 - 50, cy + ch + 14, CYAN, GREEN))

    defs = ('<linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">'
            '<stop offset="0" stop-color="%s" stop-opacity="0.30"/>'
            '<stop offset="1" stop-color="%s" stop-opacity="0"/></linearGradient>' % (CYAN, CYAN))

    return shell(
        w, h, "Repository traffic",
        "%d page views from %d unique visitors and %d clones across %d days on record."
        % (total_views, total_uniques, total_clones, len(daily)),
        "".join(parts), defs)


def card_sources(store):
    w, h = 440, 236
    refs = sorted(store.get("referrers_14d", {}).items(), key=lambda kv: -kv[1]["uniques"])[:6]
    peak = max([r[1]["uniques"] for r in refs] or [1])

    parts = [
        '    <text class="m cap" x="24" y="34">ARRIVAL PATHS</text>\n',
        '    <text class="m sub" x="%d" y="34" text-anchor="end">ROLLING 14 DAYS</text>\n' % (w - 24),
        '    <path d="M24 46H%d" stroke="%s" stroke-opacity="0.14"/>\n' % (w - 24, LINE),
    ]

    if not refs:
        parts.append(
            '    <text class="m sub" x="%d" y="130" text-anchor="middle">'
            'NO REFERRERS RECORDED YET</text>\n' % (w // 2))
    else:
        for i, (name, stat) in enumerate(refs):
            y = 72 + i * 28
            bar = max(3.0, (stat["uniques"] / peak) * 250)
            parts.append(
                '    <g class="rise" style="animation-delay:%.2fs">\n'
                '      <text class="m row" x="24" y="%d">%s</text>\n'
                '      <text class="m tiny" x="%d" y="%d" text-anchor="end">%s / %s</text>\n'
                '      <rect x="24" y="%d" width="%.1f" height="3" rx="1.5" fill="%s" opacity="0.75"/>\n'
                '      <rect x="24" y="%d" width="250" height="3" rx="1.5" fill="%s" opacity="0.10"/>\n'
                '    </g>\n'
                % (0.05 * i, y, esc(name[:26]), w - 24, y, human(stat["uniques"]),
                   human(stat["count"]), y + 6, bar, CYAN, y + 6, LINE))
        parts.append(
            '    <text class="m tiny" x="%d" y="%d" text-anchor="end">UNIQUE / TOTAL</text>\n'
            % (w - 24, 60))

    return shell(w, h, "Arrival paths",
                 "Where visitors came from over the last 14 days: "
                 + (", ".join("%s %d unique" % (n, s["uniques"]) for n, s in refs) or "nothing recorded yet")
                 + ".", "".join(parts))


def card_audience(stars, forks, followers):
    w, h = 440, 236
    events = []
    for s in stars[:8]:
        events.append(("starred", s["login"], s["avatar"], s["at"][:10], s["repo"], AMBER))
    for f in forks[:4]:
        events.append(("forked", f["login"], f["avatar"], f["at"][:10], f["repo"], PURPLE))
    for f in followers[:8]:
        events.append(("followed", f["login"], f["avatar"], f["at"][:10], "", GREEN))
    events.sort(key=lambda e: e[3], reverse=True)
    events = events[:5]

    parts = [
        '    <text class="m cap" x="24" y="34">NAMED AUDIENCE</text>\n',
        '    <text class="m sub" x="%d" y="34" text-anchor="end">%s STARS &#183; %s FOLLOWERS</text>\n'
        % (w - 24, human(len(stars)), human(len(followers))),
        '    <path d="M24 46H%d" stroke="%s" stroke-opacity="0.14"/>\n' % (w - 24, LINE),
    ]

    if not events:
        parts.append(
            '    <text class="m sub" x="%d" y="130" text-anchor="middle">'
            'NO STARS, FORKS OR FOLLOWS YET</text>\n' % (w // 2))
    else:
        for i, (kind, login, _avatar, when, repo, colour) in enumerate(events):
            y = 68 + i * 34
            initials = monogram(login)
            parts.append(
                '    <g class="rise" style="animation-delay:%.2fs">\n'
                '      <circle cx="35" cy="%d" r="11" fill="%s" opacity="0.16"/>\n'
                '      <circle cx="35" cy="%d" r="11" fill="none" stroke="%s" stroke-opacity="0.45"/>\n'
                '      <text class="m" x="35" y="%d" text-anchor="middle" font-size="%d"\n'
                '            font-weight="700" fill="%s">%s</text>\n'
                '      <text class="m row" x="56" y="%d">%s</text>\n'
                '      <text class="m tiny" x="56" y="%d" fill="%s">%s%s</text>\n'
                '      <text class="m tiny" x="%d" y="%d" text-anchor="end">%s</text>\n'
                '    </g>\n'
                % (0.06 * i,
                   y + 3, colour,
                   y + 3, colour,
                   y + 7, 9 if len(initials) > 1 else 11, colour, esc(initials),
                   y + 1, esc("@" + login),
                   y + 12, colour, esc(kind.upper()), esc(" " + repo if repo else ""),
                   w - 24, y + 1, esc(pretty(when))))

    parts.append(
        '    <text class="m tiny" x="24" y="%d">STARS, FORKS AND FOLLOWS ARE PUBLIC. '
        'PLAIN VISITORS ARE NOT.</text>\n' % (h - 18))

    return shell(w, h, "Named audience",
                 "Most recent public interactions: "
                 + (", ".join("%s %s" % (e[1], e[0]) for e in events) or "none yet") + ".",
                 "".join(parts))


def pretty(iso):
    if not iso:
        return "unknown"
    try:
        return dt.date.fromisoformat(iso[:10]).strftime("%b %d, %Y").replace(" 0", " ")
    except ValueError:
        return iso


# --------------------------------------------------------------- entry

def main():
    # Repo listing works unauthenticated, traffic does not. Without this the
    # run "succeeds" with every repo skipped and a chart of nothing.
    if not TOKEN:
        raise SystemExit(
            "No token. The traffic API needs push access on each repository.\n"
            "Set GH_TOKEN to a PAT with the repo scope (or Administration: Read\n"
            "on a fine-grained token). See SETUP.md, step 2."
        )

    os.makedirs(OUT, exist_ok=True)
    repos = owned_repos()
    print("scanning %d owned source repositories" % len(repos))

    daily, per_repo, referrers, paths, reachable = collect_traffic(repos)

    # A token can authenticate perfectly and still be refused every traffic
    # endpoint. Without this the run "succeeds", commits an empty chart, and
    # the only clue is a number that never moves.
    if repos and not reachable:
        raise SystemExit(
            "Authenticated, but every repository refused the traffic API.\n"
            "The token is missing administration=read. On a fine-grained token:\n"
            "  Repository access: All repositories\n"
            "  Permissions: Administration -> Read\n"
            "Nothing was written. See SETUP.md, step 2."
        )

    store = merge_history(daily, per_repo, referrers, paths)
    print("traffic: %d days on record, %d repos reporting" % (len(store["daily"]), reachable))

    stars, forks, followers = collect_audience(repos)
    print("audience: %d stars, %d forks, %d followers" % (len(stars), len(forks), len(followers)))

    cards = (
        ("traffic.svg", card_traffic(store, len(repos), reachable)),
        ("sources.svg", card_sources(store)),
        ("audience.svg", card_audience(stars, forks, followers)),
    )
    for name, svg in cards:
        path = os.path.join(OUT, name)
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(svg)
        print("wrote %s (%d bytes)" % (path, len(svg)))


if __name__ == "__main__":
    main()
