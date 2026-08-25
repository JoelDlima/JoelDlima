/**
 * Project paths.
 *
 * Everything is bundled into .cache/cli.mjs before it runs, so `import.meta.url`
 * points at the bundle rather than at the source file that wrote the constant.
 * Walking up to the nearest package.json gives the same answer either way.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

function findRoot(start: string): string {
  let dir = start
  for (;;) {
    if (fs.existsSync(path.join(dir, 'package.json'))) return dir
    const parent = path.dirname(dir)
    if (parent === dir) throw new Error(`No package.json above ${start}`)
    dir = parent
  }
}

export const ROOT = findRoot(path.dirname(fileURLToPath(import.meta.url)))
export const ASSETS_DIR = path.join(ROOT, 'assets')
export const DATA_DIR = path.join(ROOT, 'data')
export const FONT_DIR = path.join(ROOT, 'build', 'fonts')
export const CACHE_DIR = path.join(ROOT, '.cache')
