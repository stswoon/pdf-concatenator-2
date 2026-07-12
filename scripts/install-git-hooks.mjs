import { chmodSync, copyFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const gitDir = join(root, '.git')
const hooksDir = join(gitDir, 'hooks')
const hookSrc = join(root, 'scripts', 'pre-commit-hook')
const hookDest = join(hooksDir, 'pre-commit')

if (!existsSync(gitDir)) {
  console.warn('Not a git repository, skipping git hooks install')
  process.exit(0)
}

copyFileSync(hookSrc, hookDest)
chmodSync(hookDest, 0o755)
console.log('Installed pre-commit hook')
