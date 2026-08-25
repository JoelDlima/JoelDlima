/**
 * Build entry point.
 *
 *   node . data    refresh data/github.json from the GitHub API
 *   node . render  render every component in src/components to assets/
 *   node . all     both, in order
 */
import { fetchSnapshot, saveSnapshot, DATA_FILE } from './data/github'
import { renderAll } from './render-all'

const cmd = process.argv[2] ?? 'all'

function refreshData() {
  process.stdout.write('· fetching GitHub snapshot… ')
  const snap = fetchSnapshot()
  saveSnapshot(snap)
  console.log(
    `ok (${snap.repos.length} repos, ${snap.totals.contributionsYear} contributions, ` +
      `${Object.keys(snap.languages).length} languages)`,
  )
  console.log(`  → ${DATA_FILE}`)
}

try {
  if (cmd === 'data') {
    refreshData()
  } else if (cmd === 'render') {
    renderAll()
  } else if (cmd === 'all') {
    refreshData()
    renderAll()
  } else {
    console.error(`Unknown command "${cmd}". Expected: data | render | all`)
    process.exit(1)
  }
} catch (err) {
  console.error(`\nBuild failed: ${err instanceof Error ? err.message : String(err)}`)
  process.exit(1)
}
