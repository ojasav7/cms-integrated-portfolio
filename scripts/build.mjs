/**
 * Cross-platform build script.
 *
 * Runs `vite build` followed by `tsc --noEmit` (the same steps as the old
 * `"build": "vite build && tsc --noEmit"` script).
 *
 * npm 11 on Windows runs lifecycle scripts through PowerShell 5.1, which
 * does not support the `&&` operator, so the two steps are chained in
 * plain Node instead of shell syntax. This works identically on Windows,
 * macOS, Linux and CI regardless of the configured script shell.
 */
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)

/** Run a Node entry point with the given args, forwarding its exit code. */
function run(entryPath, args) {
  const result = spawnSync(process.execPath, [entryPath, ...args], {
    stdio: 'inherit',
  })
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

// Resolve vite's CLI entry from its package.json `bin` field.
const vitePkgPath = require.resolve('vite/package.json')
const vitePkg = JSON.parse(readFileSync(vitePkgPath, 'utf8'))
const viteBin = typeof vitePkg.bin === 'string' ? vitePkg.bin : vitePkg.bin.vite
const viteCli = join(dirname(vitePkgPath), viteBin)

// `npm run build -- --mode production` forwards extra args to vite.
run(viteCli, ['build', ...process.argv.slice(2)])
run(require.resolve('typescript/bin/tsc'), ['--noEmit'])
