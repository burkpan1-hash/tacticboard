import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Plugin } from 'vite'

const here = path.dirname(fileURLToPath(import.meta.url))
const PRESETS_DIR = path.resolve(here, '../src/data/presets')
const SLUG_RE = /^[a-z0-9-]+$/

type PublishResult = { ok: true } | { ok: false; status: number; error: string }

// Draft presets (src/data/presets/*.ts, Preset.status per src/data/presets/types.ts)
// are static source files, not DB rows — "Yayınla" (Publish) flips one on disk
// during local dev. `configureServer` only runs under `vite`/`npm run dev`,
// never in the production build or the deployed Hono server, so this write
// path does not exist in prod — there is nothing to secure there. Reviewing a
// draft needs no endpoint at all: /sets/<slug> already renders drafts by
// direct URL (see the PRESETS comment in src/data/presets/index.ts).
export function publishPresetPlugin(): Plugin {
  return {
    name: 'publish-preset-dev-only',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__dev/publish-preset', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }
        let body = ''
        req.on('data', (chunk) => { body += chunk })
        req.on('end', () => {
          res.setHeader('Content-Type', 'application/json')
          let slug: unknown
          try {
            slug = JSON.parse(body).slug
          } catch {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'invalid JSON body' }))
            return
          }
          if (typeof slug !== 'string' || !SLUG_RE.test(slug)) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: 'invalid slug' }))
            return
          }
          const result = publishPresetFile(slug)
          res.statusCode = result.ok ? 200 : result.status
          res.end(JSON.stringify(result.ok ? { ok: true } : { error: result.error }))
        })
      })
    },
  }
}

function publishPresetFile(slug: string): PublishResult {
  const files = fs.readdirSync(PRESETS_DIR)
    .filter((f) => f.endsWith('.ts') && f !== 'index.ts' && f !== 'types.ts')

  for (const file of files) {
    const fullPath = path.join(PRESETS_DIR, file)
    const source = fs.readFileSync(fullPath, 'utf-8')

    // Every preset's own `slug` is the first property right after the opening
    // brace (see e.g. man-to-man-plays.ts). Anchoring on that — rather than a
    // bare `slug: '<slug>'` match — skips `family: { slug: '<slug>' }` blocks,
    // where a single-member family reuses the same slug as its one preset.
    const anchor = new RegExp(`export const \\w+: Preset = \\{\\s*\\n\\s*slug: '${slug}',`)
    const anchorMatch = anchor.exec(source)
    if (!anchorMatch) continue

    const anchorEnd = anchorMatch.index + anchorMatch[0].length
    const afterAnchor = source.slice(anchorEnd)
    // Bound the search to this preset's own object so a file with multiple
    // presets never patches the next one's status by mistake.
    const nextExport = /export const \w+: Preset = \{/.exec(afterAnchor)
    const objectEnd = nextExport ? nextExport.index : afterAnchor.length
    const objectBody = afterAnchor.slice(0, objectEnd)

    const statusMatch = /status: 'draft',/.exec(objectBody)
    if (!statusMatch) {
      return { ok: false, status: 409, error: `'${slug}' has no 'status: draft' — already published?` }
    }

    const patchedObjectBody =
      objectBody.slice(0, statusMatch.index) +
      "status: 'published'," +
      objectBody.slice(statusMatch.index + statusMatch[0].length)

    fs.writeFileSync(fullPath, source.slice(0, anchorEnd) + patchedObjectBody + afterAnchor.slice(objectEnd))
    return { ok: true }
  }

  return { ok: false, status: 404, error: `no preset file found with slug '${slug}'` }
}
