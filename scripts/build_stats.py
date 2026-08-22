"""Generate the contribution / streak / language cards as local SVG.

The hosted instances of github-readme-stats and github-profile-trophy were
returning DEPLOYMENT_PAUSED and 402 respectively when this was written, so
nothing here depends on a third-party renderer. A workflow runs this and
commits the output; the README points at files inside this repository.
"""
import datetime as dt
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gh import USER, esc, graphql, human  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "gen")

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

# Fallback for languages GitHub does not hand us a colour for.
LANG_FALLBACK = "#7d8590"

# Config and packaging languages say nothing about what someone can build.
LANG_IGNORE = {"Batchfile", "Makefile", "Nix", "Dockerfile", "Shell", "PowerShell"}


def shell(w, h, title, desc, body, defs=""):
    """Common frame: ground, faint grid, corner brackets, accessible title."""
    hlines = "".join('<path d="M0 %d H%d"/>' % (y, w) for y in range(30, h, 30))
    vlines = "".join('<path d="M%d 0 V%d"/>' % (x, h) for x in range(40, w, 40))
    return """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %(w)d %(h)d" width="%(w)d" height="%(h)d"
     role="img" aria-labelledby="cardTitle cardDesc">
  <title id="cardTitle">%(title)s</title>
  <desc id="cardDesc">%(desc)s</desc>
  <defs>
    <style><![CDATA[
      .m { font-family: %(mono)s; }
      .cap { font-size: 8px; letter-spacing: 2.4px; font-weight: 700; fill: %(muted)s; }
      .val { font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
      .lbl { font-size: 7px; letter-spacing: 1.5px; font-weight: 700; fill: %(dim)s; }
      .sub { font-family: %(sans)s; font-size: 8.5px; letter-spacing: 0.2px; fill: %(muted)s; }
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
        "hl": hlines, "vl": vlines,
    }


def metric(x, y, value, label, colour, delay):
    return (
        '    <g class="rise" style="animation-delay:%.2fs">\n'
        '      <text class="m val" x="%d" y="%d" fill="%s">%s</text>\n'
        '      <text class="m lbl" x="%d" y="%d">%s</text>\n'
        '    </g>\n' % (delay, x, y, colour, esc(value), x, y + 13, esc(label.upper()))
    )


# --------------------------------------------------------------- queries

# privacy:PUBLIC is deliberate. This card renders onto a public profile, and
# without it the totals swing with whatever scope the token happens to have —
# a repo-scoped PAT would publish how many private repositories exist, while a
# public-only token would not. Pinning it keeps the output the same either way.
PROFILE_Q = """
query($login:String!){
  user(login:$login){
    login name createdAt
    followers{totalCount}
    following{totalCount}
    pullRequests{totalCount}
    issues{totalCount}
    repositories(first:100, ownerAffiliations:OWNER, isFork:false, privacy:PUBLIC,
                 orderBy:{field:PUSHED_AT,direction:DESC}){
      totalCount
      nodes{
        name stargazerCount forkCount isPrivate
        languages(first:12, orderBy:{field:SIZE,direction:DESC}){
          edges{ size node{ name color } }
        }
      }
    }
    contributionsCollection{
      totalCommitContributions
      restrictedContributionsCount
      totalPullRequestReviewContributions
    }
  }
}"""

CAL_Q = """
query($login:String!,$from:DateTime!,$to:DateTime!){
  user(login:$login){
    contributionsCollection(from:$from,to:$to){
      totalCommitContributions
      restrictedContributionsCount
      contributionCalendar{
        totalContributions
        weeks{ contributionDays{ date contributionCount } }
      }
    }
  }
}"""


# --------------------------------------------------------------- data

def calendar_days(created_at):
    """Every contribution day since signup, plus all-time commit totals.

    GraphQL caps one contributionsCollection query at a year, so this walks
    the account in yearly windows. Commits are summed in the same pass: an
    unqualified contributionsCollection only covers the last 12 months, and
    showing that next to an all-time contribution count reads as a
    contradiction on the same card.
    """
    start = dt.datetime.fromisoformat(created_at.replace("Z", "+00:00"))
    now = dt.datetime.now(dt.timezone.utc)
    days = {}
    total = 0
    commits = 0
    restricted = 0
    cursor = start
    while cursor < now:
        end = min(cursor + dt.timedelta(days=364), now)
        data = graphql(
            CAL_Q,
            login=USER,
            **{"from": cursor.isoformat().replace("+00:00", "Z"),
               "to": end.isoformat().replace("+00:00", "Z")}
        )
        cc = data["user"]["contributionsCollection"]
        commits += cc["totalCommitContributions"]
        restricted += cc["restrictedContributionsCount"]
        cal = cc["contributionCalendar"]
        total += cal["totalContributions"]
        for week in cal["weeks"]:
            for day in week["contributionDays"]:
                days[day["date"]] = day["contributionCount"]
        cursor = end + dt.timedelta(days=1)
    return days, total, commits + restricted


def streaks(days):
    """Current and longest run of consecutive contributing days.

    A zero on today does not break the run — the day is still in progress.
    """
    if not days:
        return (0, None, None), (0, None, None)

    dates = sorted(days)
    today = dt.date.today().isoformat()

    longest = 0
    l_start = l_end = None
    run = 0
    run_start = None
    prev = None

    for d in dates:
        if days[d] > 0:
            nxt = prev and (dt.date.fromisoformat(prev) + dt.timedelta(days=1)).isoformat()
            if prev is not None and d == nxt and run > 0:
                run += 1
            else:
                run, run_start = 1, d
            if run > longest:
                longest, l_start, l_end = run, run_start, d
        elif d != today:
            run, run_start = 0, None
        prev = d

    if run > 0:
        contributing = [d for d in dates if days[d] > 0]
        current = (run, run_start, contributing[-1])
    else:
        current = (0, None, None)
    return current, (longest, l_start, l_end)


def pretty(iso):
    if not iso:
        return "not yet"
    return dt.date.fromisoformat(iso).strftime("%b %d, %Y").replace(" 0", " ")


# --------------------------------------------------------------- cards

def card_index(u, commits):
    repos = u["repositories"]["nodes"]
    stars = sum(r["stargazerCount"] for r in repos)
    forks = sum(r["forkCount"] for r in repos)
    cc = u["contributionsCollection"]

    cells = [
        (human(commits), "commits", CYAN),
        (human(u["repositories"]["totalCount"]), "repositories", AMBER),
        (human(stars), "stars earned", AMBER),
        (human(u["pullRequests"]["totalCount"]), "pull requests", PURPLE),
        (human(u["issues"]["totalCount"]), "issues", PURPLE),
        (human(u["followers"]["totalCount"]), "followers", GREEN),
        (human(forks), "forks", GREEN),
        (human(cc["totalPullRequestReviewContributions"]), "reviews", CYAN),
    ]

    w = 460
    parts = [
        '    <text class="m cap" x="24" y="34">CONTRIBUTION INDEX</text>\n',
        '    <text class="m sub" x="24" y="48">@%s &#183; account opened %s</text>\n'
        % (esc(u["login"]), esc(pretty(u["createdAt"][:10]))),
        '    <path d="M24 60H%d" stroke="%s" stroke-opacity="0.14"/>\n' % (w - 24, LINE),
    ]
    for i, (value, label, colour) in enumerate(cells):
        col, row = i % 4, i // 4
        parts.append(metric(24 + col * 108, 100 + row * 56, value, label, colour, 0.05 * i))

    return shell(
        w, 200, "Contribution index",
        "%d commits, %d repositories, %d stars, %d followers."
        % (commits, u["repositories"]["totalCount"], stars, u["followers"]["totalCount"]),
        "".join(parts),
    )


def card_streak(current, longest, total, first_day):
    cur_n, cur_s, cur_e = current
    lng_n, lng_s, _ = longest
    w, h = 460, 200

    span = "%s &#8594; %s" % (esc(pretty(cur_s)), esc(pretty(cur_e))) if cur_n else "no active run"

    body = (
        '    <text class="m cap" x="24" y="34">CONSISTENCY</text>\n'
        '    <path d="M24 48H%d" stroke="%s" stroke-opacity="0.14"/>\n'
        '    <g class="rise" style="animation-delay:.10s">\n'
        '      <text class="m val" x="24" y="104" fill="%s">%s</text>\n'
        '      <text class="m lbl" x="24" y="118">TOTAL CONTRIBUTIONS</text>\n'
        '      <text class="m sub" x="24" y="134">since %s</text>\n'
        '    </g>\n'
        '    <g class="rise" style="animation-delay:.20s">\n'
        '      <text class="m val" x="%d" y="104" text-anchor="end" fill="%s">%d</text>\n'
        '      <text class="m lbl" x="%d" y="118" text-anchor="end">LONGEST STREAK</text>\n'
        '      <text class="m sub" x="%d" y="134" text-anchor="end">from %s</text>\n'
        '    </g>\n'
        '    <g transform="translate(230,92)">\n'
        '      <circle r="42" fill="none" stroke="%s" stroke-opacity="0.16" stroke-width="1.5"/>\n'
        '      <circle r="42" fill="none" stroke="%s" stroke-width="1.5" stroke-linecap="round"\n'
        '              stroke-dasharray="264" stroke-dashoffset="264" transform="rotate(-90)">\n'
        '        <animate attributeName="stroke-dashoffset" from="264" to="46" dur="1.1s"\n'
        '                 begin="0.2s" fill="freeze" calcMode="spline"\n'
        '                 keySplines="0.2 0.8 0.3 1"/>\n'
        '      </circle>\n'
        '      <text class="m" x="0" y="4" text-anchor="middle" font-size="32"\n'
        '            font-weight="700" fill="%s">%d</text>\n'
        '      <text class="m lbl" x="0" y="22" text-anchor="middle">CURRENT STREAK &#183; DAYS</text>\n'
        '      <text class="m sub" x="0" y="38" text-anchor="middle">%s</text>\n'
        '    </g>\n'
        % (w - 24, LINE,
           CYAN, esc(human(total)), esc(pretty(first_day)),
           w - 24, PURPLE, lng_n, w - 24, w - 24, esc(pretty(lng_s)),
           AMBER, AMBER, AMBER, cur_n, span)
    )

    return shell(
        w, h, "Contribution streaks",
        "Current streak %d days, longest streak %d days, %d contributions in total."
        % (cur_n, lng_n, total),
        body,
    )


def card_langs(u):
    totals = {}
    colours = {}
    for repo in u["repositories"]["nodes"]:
        for edge in repo["languages"]["edges"]:
            name = edge["node"]["name"]
            if name in LANG_IGNORE:
                continue
            totals[name] = totals.get(name, 0) + edge["size"]
            colours[name] = edge["node"]["color"] or LANG_FALLBACK

    grand = sum(totals.values()) or 1
    ranked = sorted(totals.items(), key=lambda kv: -kv[1])[:8]

    w, h = 900, 152
    bar_x, bar_w, bar_y = 24, w - 48, 62

    segs = []
    legend = []
    cursor = float(bar_x)
    for i, (name, size) in enumerate(ranked):
        frac = size / grand
        seg_w = max(2.0, frac * bar_w)
        colour = colours.get(name, LANG_FALLBACK)
        segs.append(
            '<rect x="%.1f" y="%d" width="%.1f" height="12" fill="%s">'
            '<animate attributeName="width" from="0" to="%.1f" dur="0.8s" begin="%.2fs" '
            'fill="freeze" calcMode="spline" keySplines="0.2 0.8 0.3 1"/></rect>'
            % (cursor, bar_y, seg_w, colour, seg_w, 0.06 * i)
        )
        cursor += seg_w

        col, row = i % 4, i // 4
        lx = 24 + col * 216
        ly = 108 + row * 22
        legend.append(
            '<g><rect x="%d" y="%d" width="8" height="8" rx="2" fill="%s"/>'
            '<text class="m" x="%d" y="%d" font-size="10" fill="%s">%s</text>'
            '<text class="m" x="%d" y="%d" font-size="10" text-anchor="end" fill="%s">%.1f%%</text></g>'
            % (lx, ly - 7, colour, lx + 14, ly, TEXT, esc(name), lx + 196, ly, MUTED, frac * 100)
        )

    body = (
        '    <text class="m cap" x="24" y="34">LANGUAGE DISTRIBUTION</text>\n'
        '    <text class="m sub" x="%d" y="34" text-anchor="end">BY BYTES &#183; %d SOURCE REPOSITORIES</text>\n'
        '    <path d="M24 46H%d" stroke="%s" stroke-opacity="0.14"/>\n'
        '    <g clip-path="url(#bar)">%s</g>\n'
        '    %s\n'
        % (w - 24, len(u["repositories"]["nodes"]), w - 24, LINE, "".join(segs), "".join(legend))
    )

    defs = ('<clipPath id="bar"><rect x="%d" y="%d" width="%d" height="12" rx="6"/></clipPath>'
            % (bar_x, bar_y, bar_w))

    return shell(
        w, h, "Language distribution",
        "Share of code by bytes across public source repositories: "
        + ", ".join("%s %.1f percent" % (n, t / grand * 100) for n, t in ranked) + ".",
        body, defs,
    )


def main():
    os.makedirs(OUT, exist_ok=True)
    u = graphql(PROFILE_Q, login=USER)["user"]
    print("profile: %s - %d source repos" % (u["login"], u["repositories"]["totalCount"]))

    days, total, commits = calendar_days(u["createdAt"])
    current, longest = streaks(days)
    contributing = [d for d, n in days.items() if n > 0]
    first = min(contributing) if contributing else u["createdAt"][:10]
    print("streak: current %dd - longest %dd - total %d - commits %d"
          % (current[0], longest[0], total, commits))

    cards = (
        ("stats.svg", card_index(u, commits)),
        ("streak.svg", card_streak(current, longest, total, first)),
        ("languages.svg", card_langs(u)),
    )
    for name, svg in cards:
        path = os.path.join(OUT, name)
        with open(path, "w", encoding="utf-8") as fh:
            fh.write(svg)
        print("wrote %s (%d bytes)" % (path, len(svg)))


if __name__ == "__main__":
    main()
