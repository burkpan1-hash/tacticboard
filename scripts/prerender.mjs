// Runs after `vite build` (client) and `vite build --ssr src/entry-server.tsx`
// (server). For every route in getStaticPages(), renders the real app tree to
// an HTML string and bakes it into a copy of dist/index.html, so Googlebot
// (and anyone with JS off) sees the actual article text without executing
// JS. Also regenerates dist/sitemap.xml from the same route list plus the
// small set of always-static pages. See docs/superpowers/specs/2026-07-01-hazir-setler-design.md
// ("Prerender — technical design") for the approach and why it's a custom
// script rather than react-snap or full per-request SSR.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distDir = path.join(projectRoot, 'dist')
const ssrEntry = path.join(projectRoot, 'dist-ssr', 'entry-server.js')

const SITE_URL = 'https://basketballtacticboard.com'

// Pages that always exist regardless of preset content — not part of
// getStaticPages() because entry-server.tsx only tracks the sets/preset
// routes (see its own comment). Kept in sync with the routes in src/App.tsx.
const STATIC_ROUTES = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/pricing', changefreq: 'monthly', priority: '0.5' },
  { loc: '/about', changefreq: 'yearly', priority: '0.3' },
  { loc: '/contact', changefreq: 'yearly', priority: '0.3' },
  { loc: '/privacy', changefreq: 'yearly', priority: '0.3' },
  { loc: '/terms', changefreq: 'yearly', priority: '0.3' },
  { loc: '/refund', changefreq: 'yearly', priority: '0.3' },
]

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escapeAttr(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

function replaceOne(html, pattern, replacement) {
  if (!pattern.test(html)) {
    throw new Error(`prerender.mjs: expected pattern not found in dist/index.html: ${pattern}`)
  }
  return html.replace(pattern, replacement)
}

function renderStaticPage(template, renderPage, { url, title, description }) {
  const appHtml = renderPage(url)
  const canonical = `${SITE_URL}${url}`
  const safeTitle = escapeHtml(title)
  const safeDescription = escapeAttr(description)

  let html = template
  html = replaceOne(html, /<div id="root"><\/div>/, `<div id="root">${appHtml}</div>`)
  html = replaceOne(html, /<title>.*?<\/title>/, `<title>${safeTitle}</title>`)
  html = replaceOne(html, /<meta name="description" content=".*?" \/>/, `<meta name="description" content="${safeDescription}" />`)
  html = replaceOne(html, /<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${canonical}" />`)
  html = replaceOne(html, /<meta property="og:title" content=".*?" \/>/, `<meta property="og:title" content="${safeTitle}" />`)
  html = replaceOne(html, /<meta property="og:description" content=".*?" \/>/, `<meta property="og:description" content="${safeDescription}" />`)
  html = replaceOne(html, /<meta property="og:url" content=".*?" \/>/, `<meta property="og:url" content="${canonical}" />`)
  return html
}

function writePage(url, html) {
  const outDir = path.join(distDir, url)
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'index.html'), html)
}

function buildSitemap(dynamicRoutes) {
  const routes = [...STATIC_ROUTES, ...dynamicRoutes]
  const body = routes
    .map(
      (r) =>
        `  <url>\n    <loc>${SITE_URL}${r.loc}</loc>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`
    )
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
}

async function main() {
  if (!fs.existsSync(ssrEntry)) {
    throw new Error(`prerender.mjs: ${ssrEntry} missing — run 'vite build --ssr src/entry-server.tsx --outDir dist-ssr' first`)
  }
  const { getStaticPages, renderPage } = await import(ssrEntry)
  const template = fs.readFileSync(path.join(distDir, 'index.html'), 'utf-8')

  const pages = getStaticPages()
  for (const page of pages) {
    const html = renderStaticPage(template, renderPage, page)
    writePage(page.url, html)
    console.log(`prerendered ${page.url}`)
  }

  const dynamicRoutes = pages.map((p) => ({
    loc: p.url,
    changefreq: 'monthly',
    priority: p.url === '/sets' ? '0.8' : '0.6',
  }))
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), buildSitemap(dynamicRoutes))
  console.log(`wrote sitemap.xml with ${STATIC_ROUTES.length + dynamicRoutes.length} urls`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
