import type { Preset } from '../types'
import { tr } from './tr'
import { de } from './de'
import { it } from './it'
import { fr } from './fr'
import { es } from './es'

const TABLES = { tr, de, it, fr, es } as const

// Returns `preset` with its translatable fields (category, description,
// article) swapped for the given locale's version. Falls back to the
// original English preset if no translation exists yet for this
// locale/slug, so drafts stay renderable while translations roll in.
// `title` and `family.title` are never swapped — see PresetTranslation.
export function localizePreset(preset: Preset, locale: string): Preset {
  const table = (TABLES as Record<string, typeof tr>)[locale]
  const t = table?.[preset.slug]
  if (!t) return preset
  return { ...preset, category: t.category, description: t.description, article: t.article }
}
