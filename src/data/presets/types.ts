import type { PlaySet } from '../../models/types'

// A preset play = a playable animation (built in our own editor, same PlaySet
// format the editor produces) + an original written article. The animation is
// the differentiator; the article is the crawlable, AdSense-countable content.
// All article text is original — source coaching sites are used only as tactical
// reference, never copied.

export interface PresetSection {
  heading: string
  paragraphs: string[]
}

export interface PresetArticle {
  intro: string
  sections: PresetSection[]
  keyTakeaways: string[]
}

export interface Preset {
  slug: string
  title: string
  category: string          // e.g. "Man-to-Man Offense", "2-3 Zone", "BLOB"
  description: string       // meta description + list card blurb
  readMinutes: number
  playData: PlaySet         // opens in the editor with zero conversion
  article: PresetArticle
  status: 'draft' | 'published'
}
