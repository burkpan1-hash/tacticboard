import type { Preset, PresetFamily } from './types'
import { uclaLayup, uclaFlexCut, uclaStaggerThree } from './ucla-offense'
import { floppyPerimeterCatch, floppyDuckInLayup } from './floppy-1-4'
import { backScreenPost, doubleCurls, flexWarrior, pistonElevator, xCross } from './man-to-man-plays'
import { flare23, lob32, baselineSwing, doublesZone, pickOverload, skipper, swinger } from './zone-plays'
import { fourLowFlex, boxGate, boxFloppyGate, duke, ramRed, stackDouble, twoInside } from './blob-man-plays'
import { belmontFlash, boxFlash, cross, doubleSkip, hawk, sideCrossElevator, stackZone } from './blob-zone-plays'

// Registry of all preset plays. Add a new file under src/data/presets/ and
// register it here. Only `published` presets appear in the public list and
// sitemap; `draft` presets are reachable by direct URL for review.
export const PRESETS: Preset[] = [
  uclaLayup,
  uclaFlexCut,
  uclaStaggerThree,
  floppyPerimeterCatch,
  floppyDuckInLayup,
  backScreenPost,
  doubleCurls,
  flexWarrior,
  pistonElevator,
  xCross,
  flare23,
  lob32,
  baselineSwing,
  doublesZone,
  pickOverload,
  skipper,
  swinger,
  fourLowFlex,
  boxGate,
  boxFloppyGate,
  duke,
  ramRed,
  stackDouble,
  twoInside,
  belmontFlash,
  boxFlash,
  cross,
  doubleSkip,
  hawk,
  sideCrossElevator,
  stackZone,
]

export function getPreset(slug: string): Preset | undefined {
  return PRESETS.find((p) => p.slug === slug)
}

export function publishedPresets(): Preset[] {
  return PRESETS.filter((p) => p.status === 'published')
}

// A family groups several standalone presets under one shared title on the
// sets hub (e.g. "UCLA Offense" → layup / flex / stagger). `slug` is looked up
// against the same `/sets/:slug` route a single preset uses — if it doesn't
// match a preset, it's tried as a family slug instead.
export function getFamily(slug: string): PresetFamily | undefined {
  return PRESETS.find((p) => p.family?.slug === slug)?.family
}

export function familyMembers(slug: string): Preset[] {
  return PRESETS.filter((p) => p.family?.slug === slug)
}

// Every family present in the registry, each with its member presets, in
// registry order — the listing the sets hub (`/sets`) renders.
export function allFamilies(): { family: PresetFamily; members: Preset[] }[] {
  const seen = new Map<string, { family: PresetFamily; members: Preset[] }>()
  for (const preset of PRESETS) {
    if (!preset.family) continue
    const existing = seen.get(preset.family.slug)
    if (existing) existing.members.push(preset)
    else seen.set(preset.family.slug, { family: preset.family, members: [preset] })
  }
  return [...seen.values()]
}

export type { Preset, PresetFamily } from './types'
