import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import App from './App'
import { publishedPresets, publishedFamilies } from './data/presets'
import { PAGE_TITLE as SETS_INDEX_TITLE, PAGE_DESCRIPTION as SETS_INDEX_DESCRIPTION } from './pages/PresetsPage'

const TITLE_SUFFIX = ' — Basketball Tactic Board'

export interface StaticPage {
  url: string
  title: string
  description: string
}

// Every route that gets prerendered to static HTML at build time. Kept in one
// place so scripts/prerender.mjs never has to know how presets are structured
// — it only needs { url, title, description }.
export function getStaticPages(): StaticPage[] {
  const pages: StaticPage[] = [
    { url: '/sets', title: SETS_INDEX_TITLE, description: SETS_INDEX_DESCRIPTION },
  ]
  for (const { family, members } of publishedFamilies()) {
    // Single-member families reuse their one preset's slug as the family
    // slug (see the PresetFamily comment in data/presets/types.ts) — visiting
    // that URL always resolves to the preset itself (PresetPage checks
    // getPreset() first), so the hub is unreachable there. Only real
    // multi-member families get a hub page.
    if (members.length === 1 && members[0].slug === family.slug) continue
    pages.push({
      url: `/sets/${family.slug}`,
      title: `${family.title}${TITLE_SUFFIX}`,
      description: `${members.length} plays that open from the ${family.title} alignment.`,
    })
  }
  for (const preset of publishedPresets()) {
    pages.push({
      url: `/sets/${preset.slug}`,
      title: `${preset.title}${TITLE_SUFFIX}`,
      description: preset.description,
    })
  }
  return pages
}

// Renders the exact same tree the client hydrates, so there is nothing for
// hydrateRoot to mismatch on.
export function renderPage(url: string): string {
  return renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  )
}
