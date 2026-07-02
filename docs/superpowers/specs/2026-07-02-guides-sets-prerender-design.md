# Guides + Sets Prerender — Design Spec

**Date:** 2026-07-02
**Status:** Approved (design), pending spec review
**Related:** AdSense "low value content" rejection (2026-07-01); follow-up to
[2026-07-01-hazir-setler-design.md](2026-07-01-hazir-setler-design.md)

## Problem

The site is a client-side-only React SPA. `/guides`, `/guides/:slug`, and
`/sets/:slug` carry the original written content AdSense wants, but Googlebot
(and any non-JS crawler/social-link scraper) sees only an empty
`<div id="root"></div>` on first load — the article text isn't in the HTML
until client JS runs. This is the single most critical technical gap
identified after the rejection (see `project-adsense-content` memory).

Separately, every page currently shares one hardcoded
`<link rel="canonical" href="https://basketballtacticboard.com/" />` from
`index.html`, telling crawlers every route is a duplicate of the homepage.
That gets fixed as part of this work since the same script sets it per page.

## Scope

In scope: `/guides`, `/guides/:slug` (6 articles), `/sets/:slug` (published
presets only — `publishedPresets()`, currently just `ucla-offense`).

Out of scope (explicitly deferred, tracked elsewhere): home page and legal
pages (`/`, `/pricing`, `/privacy`, `/terms`, `/refund`) stay client-rendered;
`sitemap.xml` update is a separate follow-up task already listed in
`project-adsense-content` memory; draft presets are never prerendered (no
publish flow exists yet).

## Why build-time SSR, not react-snap or full SSR

Both `/guides/:slug` and `/sets/:slug` render trees are already SSR-safe:
no Konva/canvas on these routes (the editor is a separate route), no
`window`/`document`/`localStorage` access outside `useEffect`, and
`i18next-browser-languagedetector` (8.2.1) guards every browser API with
`typeof window/document/navigator === 'undefined'` checks — it falls back to
`fallbackLng: 'en'` cleanly under Node.

Given that, a small custom SSR-render script wins over the alternatives:

- **react-snap** (Puppeteer-based DOM snapshot): needs Chromium in the
  production Docker image (`node:22-alpine` has none today — this would add
  ~300MB and new system deps), has known rough edges with Vite's ESM
  `type="module"` output, and re-runs a full headless browser on every build.
- **Full SSR** (render every route per-request): unnecessary complexity for
  routes that don't need it (editor, auth) and would require handling
  session/cookie state in the render path for no benefit here.
- **Custom SSR entry + build-time render (chosen):** zero new dependencies
  (`react-dom/server` and `react-router-dom/server` already ship with
  existing deps), no Docker image change, and it slots into the existing
  Hono static-file serving with no server code changes (verified: `@hono/
  node-server`'s `serveStatic` resolves a directory request to that
  directory's `index.html` automatically — see
  `node_modules/@hono/node-server/dist/serve-static.mjs`).

## Design

### 1. `src/entry-server.tsx` (new)

Exports `renderPage(url: string): { html: string }` that wraps the *same*
`<App/>` component used by the client in `<StaticRouter location={url}>`
(from `react-router-dom/server`) and calls `renderToString` (from
`react-dom/server` — not `renderToStaticMarkup`, which strips the markers
`hydrateRoot` needs). Using the identical `App` tree as the client guarantees
the hydration diff matches.

### 2. `scripts/prerender.mjs` (new)

Runs after both builds. For each target page:

- `/guides` — the index/listing page
- `/guides/<slug>` for every entry in `GUIDES` (`src/data/guides.ts`)
- `/sets/<slug>` for every entry in `publishedPresets()`
  (`src/data/presets/`)

it does:

1. Import the SSR bundle's `renderPage` from the `vite build --ssr` output.
2. Call `renderPage(url)` to get the rendered markup.
3. Take `dist/index.html` as a template and replace:
   - the contents of `<div id="root">…</div>` with the rendered markup
   - `<title>` with `"<page title> — Basketball Tactic Board"`
   - `meta[name="description"]` with the page's description
   - `link[rel="canonical"]` `href` with the page's full URL
   - `og:title`, `og:description`, `og:url` with the same page-specific
     values (helps social-link previews for shared set/guide links, no
     extra data needed since title/description are already computed)
4. Write the result to `dist/guides/index.html`,
   `dist/guides/<slug>/index.html`, `dist/sets/<slug>/index.html`
   (creating directories as needed).

Title/description text mirrors exactly what `GuideArticlePage.tsx` /
`PresetPage.tsx` already set client-side via `useEffect` on mount — that
effect still runs after hydration and is now redundant-but-harmless (sets
the same values again). No changes to those components' effects.

### 3. Build script (`package.json`)

```
"build": "tsc -b && vite build && vite build --ssr src/entry-server.tsx --outDir dist-ssr && node scripts/prerender.mjs"
```

`Dockerfile` is unchanged: it already only copies `./dist` out of the
builder stage, so `dist-ssr` (intermediate SSR bundle) is simply discarded
with the rest of the builder image.

### 4. Client hydration (`src/main.tsx`)

Replace the unconditional `ReactDOM.createRoot(...).render(...)` with:

```ts
const container = document.getElementById('root')!
if (container.hasChildNodes()) {
  ReactDOM.hydrateRoot(container, app)
} else {
  ReactDOM.createRoot(container).render(app)
}
```

Routes without prerendered HTML (`/`, `/editor/:id`, `/login`, etc.) still
get an empty root from the Hono catch-all (`dist/index.html`) and take the
`createRoot` branch exactly as today — no behavior change for them.

### 5. Server (`server/index.ts`)

No changes. Confirmed via source read that `serveStatic({ root: './dist' })`
already resolves `/sets/ucla-offense` → `dist/sets/ucla-offense/` (directory)
→ appends `index.html` automatically, before falling through to the SPA
catch-all.

## Verification

This cannot be checked with `npm run dev` — prerendering only happens inside
`vite build`; the dev server always renders client-side live regardless of
this change. Verification path:

1. `npm run build`; confirm `dist/guides/index.html`,
   `dist/guides/<slug>/index.html` (all 6), `dist/sets/ucla-offense/index.html`
   exist and contain the actual article text (grep for known body copy, not
   just the shell).
2. Run the prod server locally against the build
   (`NODE_ENV=production node_modules/.bin/tsx server/index.ts`) and `curl`
   the same routes — confirms a non-JS client sees real content, matching
   what Googlebot's initial HTML fetch sees.
3. Open the same URLs in a real browser: no hydration-mismatch errors in the
   console, and interactivity still works (language switcher, "Open in
   Editor & Play" buttons, options pill bar on `/sets/ucla-offense`).
4. Confirm `/`, `/editor/:id`, `/login` etc. are visually/functionally
   unchanged (no prerendered directory exists for them, so they still fall
   through to the SPA catch-all).
5. `npm run test` (vitest) and `tsc -b` both pass.

## Follow-ups (not in this change)

- `sitemap.xml`: add `/guides` + all guide/preset slugs, drop `/login` +
  `/register`. Tracked in `project-adsense-content` memory as its own step.
- About + Contact pages, "Yayınla" (draft→published) UI flow, inline
  on-page player for sets — all separately tracked, unaffected by this spec.
