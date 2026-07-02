import type { Preset } from './types'
import { uclaOffense } from './ucla-offense'

// Registry of all preset plays. Add a new file under src/data/presets/ and
// register it here. Only `published` presets appear in the public list and
// sitemap; `draft` presets are reachable by direct URL for review.
export const PRESETS: Preset[] = [
  uclaOffense,
]

export function getPreset(slug: string): Preset | undefined {
  return PRESETS.find((p) => p.slug === slug)
}

export function publishedPresets(): Preset[] {
  return PRESETS.filter((p) => p.status === 'published')
}

export type { Preset } from './types'
