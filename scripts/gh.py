"""Minimal GitHub API client — stdlib only, no pip install on the runner.

Every generator in scripts/ goes through here so retry, auth and error
handling live in exactly one place.
"""
import json
import os
import sys
import time
import urllib.error
import urllib.request

API = "https://api.github.com"
GRAPHQL = "https://api.github.com/graphql"

TOKEN = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN") or ""
USER = os.environ.get("GH_USER") or "JoelDlima"


def _headers(accept="application/vnd.github+json"):
    h = {
        "Accept": accept,
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": f"{USER}-profile-readme",
    }
    if TOKEN:
        h["Authorization"] = f"Bearer {TOKEN}"
    return h


def _request(url, data=None, tries=4, accept="application/vnd.github+json"):
    """GET (or POST when data is given) with backoff on 5xx and secondary limits."""
    body = json.dumps(data).encode() if data is not None else None
    headers = _headers(accept)
    if body:
        headers["Content-Type"] = "application/json"

    last = None
    for attempt in range(tries):
        req = urllib.request.Request(url, data=body, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=30) as r:
                return json.loads(r.read().decode())
        except urllib.error.HTTPError as e:
            last = e
            # 403/429 with a reset header means rate limited, not broken.
            if e.code in (403, 429):
                reset = e.headers.get("x-ratelimit-reset")
                remaining = e.headers.get("x-ratelimit-remaining")
                if remaining == "0" and reset:
                    wait = max(0, int(reset) - int(time.time())) + 2
                    if wait > 900:
                        raise RuntimeError(f"rate limit resets in {wait}s — too long to wait")
                    print(f"  rate limited, sleeping {wait}s", file=sys.stderr)
                    time.sleep(wait)
                    continue
            if e.code in (500, 502, 503, 504):
                time.sleep(2 ** attempt)
                continue
            if e.code in (403, 404):
                # GitHub names the permission it wanted; repeat it verbatim so a
                # scope problem does not turn into a guessing game.
                needed = e.headers.get("x-accepted-github-permissions")
                if needed:
                    raise RuntimeError(
                        f"HTTP {e.code} on {url} - token is missing: {needed}"
                    ) from None
            raise
        except (urllib.error.URLError, TimeoutError) as e:
            last = e
            time.sleep(2 ** attempt)
    raise RuntimeError(f"{url} failed after {tries} tries: {last}")


def rest(path, accept="application/vnd.github+json", **params):
    """rest('/users/{u}/followers', per_page=100) -> parsed JSON."""
    url = API + path.format(u=USER)
    if params:
        url += "?" + "&".join(f"{k}={v}" for k, v in params.items())
    return _request(url, accept=accept)


def rest_all(path, cap=1000, accept="application/vnd.github+json", **params):
    """Follow pagination until exhausted or cap reached."""
    params.setdefault("per_page", 100)
    out, page = [], 1
    while len(out) < cap:
        chunk = rest(path, accept=accept, page=page, **params)
        if not isinstance(chunk, list) or not chunk:
            break
        out.extend(chunk)
        if len(chunk) < int(params["per_page"]):
            break
        page += 1
    return out[:cap]


def fetch_bytes(url, timeout=20):
    """Raw GET, used for avatar images that get inlined as data URIs.

    An SVG referenced by <img> cannot load external resources, so every
    avatar has to be embedded in the file itself.
    """
    req = urllib.request.Request(url, headers={"User-Agent": f"{USER}-profile-readme"})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.read()
    except Exception as e:  # a missing avatar must never fail the build
        print(f"  avatar fetch failed ({url}): {e}", file=sys.stderr)
        return None


def graphql(query, **variables):
    if not TOKEN:
        raise RuntimeError("GraphQL needs a token - set GH_TOKEN")
    res = _request(GRAPHQL, {"query": query, "variables": variables})
    if "errors" in res:
        raise RuntimeError(json.dumps(res["errors"], indent=2))
    return res["data"]


def esc(text):
    """XML-escape a value for safe interpolation into generated SVG."""
    return (
        str(text)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
        .replace("'", "&apos;")
    )


def human(n):
    """1234 -> 1.2k"""
    n = int(n)
    if n < 1000:
        return str(n)
    if n < 1_000_000:
        s = f"{n / 1000:.1f}".rstrip("0").rstrip(".")
        return f"{s}k"
    s = f"{n / 1_000_000:.1f}".rstrip("0").rstrip(".")
    return f"{s}M"
