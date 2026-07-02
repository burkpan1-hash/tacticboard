import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import App from './App'
import { GUIDES } from './data/guides'
import { publishedPresets } from './data/presets'
import { PAGE_TITLE as GUIDES_INDEX_TITLE, PAGE_DESCRIPTION as GUIDES_INDEX_DESCRIPTION } from './pages/GuidesPage'

const TITLE_SUFFIX = ' — Basketball Tactic Board'

export interface StaticPage {
  url: string
  title: string
  description: string
}

// Every route that gets prerendered to static HTML at build time. Kept in one
// place so scripts/prerender.mjs never has to know how guides/presets are
// structured — it only needs { url, title, description }.
export function getStaticPages(): StaticPage[] {
  const pages: StaticPage[] = [
    { url: '/guides', title: GUIDES_INDEX_TITLE, description: GUIDES_INDEX_DESCRIPTION },
  ]
  for (const guide of GUIDES) {
    pages.push({
      url: `/guides/${guide.slug}`,
      title: `${guide.title}${TITLE_SUFFIX}`,
      description: guide.description,
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
