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

// Presets that are really the same named set with different finishes (e.g. the
// UCLA cut into a layup vs. into a flex continuation vs. into a stagger three)
// are independent, standalone Presets — not PlaySet `options` — because each is
// something a coach calls as its own play. `family` just groups them under one
// shared title on the sets hub; it has no effect on playData.
export interface PresetFamily {
  slug: string
  title: string
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
  family?: PresetFamily
}

// Per-locale override of a preset's text content, looked up by slug. `title`
// and `family.title` are deliberately not translated — play names (e.g.
// "Duke", "23 Flare", "UCLA") are proper nouns kept in English across every
// language, same convention coaches use internationally. Everything else
// (the descriptive category label, the meta description, and the full
// article) is translated. Missing locales/slugs fall back to the English
// Preset fields — see `localizePreset` in `src/data/presets/translations`.
export interface PresetTranslation {
  category: string
  description: string
  article: PresetArticle
}

export type PresetTranslationTable = Record<string, PresetTranslation> // keyed by preset slug
