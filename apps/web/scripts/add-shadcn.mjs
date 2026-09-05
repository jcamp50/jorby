// Pulls shadcn components from the public registry into src/components/ui.
// The shadcn CLI requires Node >=22.13; this does the same copy step on older Node.
// Usage: node scripts/add-shadcn.mjs button card input
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

const STYLE = 'new-york-v4'
const names = process.argv.slice(2)

if (names.length === 0) {
  console.error('usage: node scripts/add-shadcn.mjs <component...>')
  process.exit(1)
}

const deps = new Set()

for (const name of names) {
  const url = `https://ui.shadcn.com/r/styles/${STYLE}/${name}.json`
  const response = await fetch(url)
  if (!response.ok) {
    console.error(`${name}: ${response.status} ${response.statusText}`)
    process.exitCode = 1
    continue
  }
  const item = await response.json()
  for (const dep of item.dependencies ?? []) {
    deps.add(dep)
  }
  for (const file of item.files ?? []) {
    const target = join('src', file.target || `components/ui/${name}.tsx`)
    // The registry ships an unresolved "cn" alias that the CLI rewrites to the configured utils path.
    const content = file.content
      .replaceAll('from "cn"', 'from "@/lib/utils"')
      .replaceAll('"use client"\n\n', '')
    await mkdir(dirname(target), { recursive: true })
    await writeFile(target, content, 'utf8')
    console.log(`wrote ${target}`)
  }
}

if (deps.size > 0) {
  console.log(`\nnpm install ${[...deps].join(' ')}`)
}
