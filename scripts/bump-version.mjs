import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pkgPath = join(root, 'package.json')
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))

const parts = pkg.version.split('.').map((part) => Number.parseInt(part, 10))
if (parts.length !== 3 || parts.some(Number.isNaN)) {
  console.error(`Invalid version in package.json: ${pkg.version}`)
  process.exit(1)
}

const [major, minor, patch] = parts
pkg.version = `${major}.${minor}.${patch + 1}`

writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`)
execFileSync('git', ['add', 'package.json'], { cwd: root, stdio: 'inherit' })
console.log(`Bumped version to ${pkg.version}`)
