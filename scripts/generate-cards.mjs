#!/usr/bin/env node
/**
 * Master card generator for Joel D'Lima.
 * Generates assets/profile-dark.svg and assets/profile-light.svg
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { posterCard } from "./lib/cards.mjs";
import { CONTACTS } from "./lib/icons.mjs";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const ASSETS = join(ROOT, "assets");
const DATA = join(ROOT, "data");
const THEMES = ["dark", "light"];

const PROFILE = {
  name: "Joel Dlima",
};

const FONT_FILE = "jetbrains-mono-bold.woff2";

function computeStreaks(days) {
  let longest = { length: 0, start: null, end: null };
  let run = { length: 0, start: null, end: null };

  for (const day of days) {
    if (day.count > 0) {
      run = {
        length: run.length + 1,
        start: run.length === 0 ? day.date : run.start,
        end: day.date,
      };
      if (run.length > longest.length) longest = { ...run };
    } else {
      run = { length: 0, start: null, end: null };
    }
  }

  const recent = new Set([days.at(-1)?.date, days.at(-2)?.date].filter(Boolean));
  const current = run.length > 0 && recent.has(run.end) ? run : { length: 0, start: null, end: null };
  return { current, longest };
}

function sliceLastYear(days) {
  const window = days.slice(-371);
  const firstSunday = window.findIndex((d) => new Date(`${d.date}T00:00:00Z`).getUTCDay() === 0);
  return firstSunday === -1 ? window : window.slice(firstSunday);
}

function buildStats(githubData) {
  const allDays = githubData.calendar;
  const lastYear = sliceLastYear(allDays);

  const weeks = [];
  for (let i = 0; i < lastYear.length; i += 7) {
    weeks.push(lastYear.slice(i, i + 7).reduce((sum, d) => sum + d.count, 0));
  }

  // Real language breakdown: raw bytes per language from the GitHub API.
  const rawBytes = githubData.languages || {};
  const totalBytes = Object.values(rawBytes).reduce((a, b) => a + b, 0) || 1;
  const byBytes = Object.entries(rawBytes)
    .map(([name, bytes]) => ({ name, bytes }))
    .sort((a, b) => b.bytes - a.bytes)
    .slice(0, 5);

  // Real repo counts per primary language.
  const reposByLang = {};
  for (const repo of githubData.repos || []) {
    if (repo.language) {
      reposByLang[repo.language] = (reposByLang[repo.language] || 0) + 1;
    }
  }

  return {
    login: githubData.user.login,
    calendar: lastYear,
    total: githubData.totals.contributionsYear || lastYear.reduce((s, d) => s + d.count, 0),
    activeDays: lastYear.filter((d) => d.count > 0).length,
    bestWeek: Math.max(1, ...weeks),
    weeks,
    repoCount: (githubData.repos || []).length,
    ...computeStreaks(allDays),
    byBytes,
    reposByLang,
    languageBytes: totalBytes,
  };
}

async function main() {
  await mkdir(ASSETS, { recursive: true });

  const githubJsonRaw = await readFile(join(DATA, "github.json"), "utf8");
  const githubData = JSON.parse(githubJsonRaw);
  const stats = buildStats(githubData);

  console.log(
    `Loaded stats for @${stats.login}: ${stats.total} contributions, ` +
      `${stats.activeDays} active days, best week ${stats.bestWeek}`,
  );

  const font = (await readFile(join(ASSETS, FONT_FILE))).toString("base64");

  for (const theme of THEMES) {
    const data = { profile: PROFILE, links: CONTACTS, stats, font };
    const svg = posterCard(data, theme);
    await writeFile(join(ASSETS, `profile-${theme}.svg`), svg, "utf8");
    console.log(`Generated assets/profile-${theme}.svg (${svg.length} bytes)`);
  }
}

main().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
