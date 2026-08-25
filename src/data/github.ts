/**
 * Live GitHub data.
 *
 * Runs at build time (locally, or in the scheduled workflow) and writes
 * data/github.json. Rendering reads only that file, so a rendered profile is
 * always reproducible offline and an API outage can never blank the README.
 */
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { DATA_DIR } from '../paths'

export const DATA_FILE = path.join(DATA_DIR, 'github.json')

export const USER = 'JoelDlima'

export interface RepoFacts {
  name: string
  description: string | null
  language: string | null
  stars: number
  forks: number
  homepage: string | null
  pushedAt: string
  isFork: boolean
  topics: string[]
  languages: Record<string, number>
}

export interface Snapshot {
  generatedAt: string
  user: {
    name: string
    login: string
    followers: number
    following: number
    publicRepos: number
    createdAt: string
  }
  totals: {
    stars: number
    forks: number
    /** Contributions in the trailing 12 months, from the GraphQL calendar. */
    contributionsYear: number
    commitsYear: number
    prs: number
    issues: number
    reviews: number
    currentStreak: number
    longestStreak: number
  }
  /** Bytes per language across owned, non-fork repositories. */
  languages: Record<string, number>
  repos: RepoFacts[]
  /** Trailing 12 months of daily contribution counts, oldest first. */
  calendar: { date: string; count: number }[]
}

// ---------------------------------------------------------------------------

/** `gh api` inherits the user's existing auth, so no token plumbing is needed. */
function gh<T>(endpoint: string, args: string[] = []): T {
  const out = execFileSync('gh', ['api', endpoint, ...args], {
    encoding: 'utf8',
    maxBuffer: 32 * 1024 * 1024,
  })
  return JSON.parse(out) as T
}

function ghGraphQL<T>(query: string, vars: Record<string, string> = {}): T {
  const args = ['api', 'graphql', '-f', `query=${query}`]
  for (const [k, v] of Object.entries(vars)) args.push('-f', `${k}=${v}`)
  const out = execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 })
  return JSON.parse(out) as T
}

const CONTRIB_QUERY = `query($login:String!){
  user(login:$login){
    contributionsCollection{
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      totalPullRequestReviewContributions
      contributionCalendar{
        totalContributions
        weeks{ contributionDays{ date contributionCount } }
      }
    }
  }
}`

interface ContribResponse {
  data: {
    user: {
      contributionsCollection: {
        totalCommitContributions: number
        totalPullRequestContributions: number
        totalIssueContributions: number
        totalPullRequestReviewContributions: number
        contributionCalendar: {
          totalContributions: number
          weeks: { contributionDays: { date: string; contributionCount: number }[] }[]
        }
      }
    }
  }
}

/** Streaks are computed here rather than trusted to a third-party service. */
function streaks(calendar: { date: string; count: number }[]) {
  let longest = 0
  let run = 0
  for (const day of calendar) {
    run = day.count > 0 ? run + 1 : 0
    if (run > longest) longest = run
  }

  // Today counts only if it already has activity; an empty today does not
  // break a streak that was alive yesterday.
  let current = 0
  for (let i = calendar.length - 1; i >= 0; i--) {
    const day = calendar[i]!
    if (day.count > 0) current++
    else if (i === calendar.length - 1) continue
    else break
  }
  return { current, longest }
}

export function fetchSnapshot(): Snapshot {
  const user = gh<{
    name: string
    login: string
    followers: number
    following: number
    public_repos: number
    created_at: string
  }>(`/users/${USER}`)

  const rawRepos = gh<
    {
      name: string
      description: string | null
      language: string | null
      stargazers_count: number
      forks_count: number
      homepage: string | null
      pushed_at: string
      fork: boolean
      topics: string[]
      archived: boolean
    }[]
  >(`/users/${USER}/repos?per_page=100&sort=pushed`)

  const repos: RepoFacts[] = []
  const languages: Record<string, number> = {}

  for (const r of rawRepos) {
    if (r.archived) continue
    let langs: Record<string, number> = {}
    try {
      langs = gh<Record<string, number>>(`/repos/${USER}/${r.name}/languages`)
    } catch {
      // A repo can vanish or go private between the list call and this one.
      // A missing language breakdown is not worth failing the whole build over.
    }
    // Forks would otherwise drown out what Joel actually wrote.
    if (!r.fork) {
      for (const [lang, bytes] of Object.entries(langs)) {
        languages[lang] = (languages[lang] ?? 0) + bytes
      }
    }
    repos.push({
      name: r.name,
      description: r.description,
      language: r.language,
      stars: r.stargazers_count,
      forks: r.forks_count,
      homepage: r.homepage || null,
      pushedAt: r.pushed_at,
      isFork: r.fork,
      topics: r.topics ?? [],
      languages: langs,
    })
  }

  const contrib = ghGraphQL<ContribResponse>(CONTRIB_QUERY, { login: USER }).data.user
    .contributionsCollection

  const calendar = contrib.contributionCalendar.weeks
    .flatMap((w) => w.contributionDays)
    .map((d) => ({ date: d.date, count: d.contributionCount }))

  const { current, longest } = streaks(calendar)

  return {
    generatedAt: new Date().toISOString(),
    user: {
      name: user.name,
      login: user.login,
      followers: user.followers,
      following: user.following,
      publicRepos: user.public_repos,
      createdAt: user.created_at,
    },
    totals: {
      stars: repos.filter((r) => !r.isFork).reduce((a, r) => a + r.stars, 0),
      forks: repos.filter((r) => !r.isFork).reduce((a, r) => a + r.forks, 0),
      contributionsYear: contrib.contributionCalendar.totalContributions,
      commitsYear: contrib.totalCommitContributions,
      prs: contrib.totalPullRequestContributions,
      issues: contrib.totalIssueContributions,
      reviews: contrib.totalPullRequestReviewContributions,
      currentStreak: current,
      longestStreak: longest,
    },
    languages,
    repos,
    calendar,
  }
}

export function loadSnapshot(): Snapshot {
  if (!fs.existsSync(DATA_FILE)) {
    throw new Error(`Missing ${DATA_FILE}. Run: npm run data`)
  }
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')) as Snapshot
}

export function saveSnapshot(snap: Snapshot) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true })
  fs.writeFileSync(DATA_FILE, `${JSON.stringify(snap, null, 2)}\n`)
}
