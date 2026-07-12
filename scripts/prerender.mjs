import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(root, 'dist')
const serverEntry = path.join(distDir, 'server', 'entry-server.js')
const indexPath = path.join(distDir, 'index.html')
const placeholder = '<!--ssg-html-->'

if (!fs.existsSync(serverEntry)) {
  console.error(`SSR bundle not found: ${serverEntry}`)
  process.exit(1)
}

const template = fs.readFileSync(indexPath, 'utf8')

if (!template.includes(placeholder)) {
  console.error(`Placeholder ${placeholder} not found in dist/index.html`)
  process.exit(1)
}

const { render } = await import(pathToFileURL(serverEntry).href)
const appHtml = render()
const html = template.replace(placeholder, appHtml)

fs.writeFileSync(indexPath, html)
console.log('Prerendered dist/index.html')
