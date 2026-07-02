# Hazır Setler (Preset Plays) — Design Spec

**Date:** 2026-07-01
**Status:** Approved (design), pending spec review
**Related:** AdSense "low value content" rejection (2026-07-01); backlog "Hazır Setler" idea

## Problem

AdSense rejected the site for "low value content / thin content." Root causes:
the site is primarily an interactive tool with only 3 text guides, a broken
sitemap that omits content pages, and no prerendering (Googlebot sees an empty
SPA shell). We need substantial, **original**, crawlable content.

## Solution

Ship a library of **preset plays**. Each preset is a single content unit that
combines:

1. A **playable animation** (built in our own editor) — the differentiator; no
   competing coaching-article site has inline animated, playable diagrams.
2. An **original written article** — the part AdSense counts as content.

Presets are authored by Claude from public coaching sources used as *reference
only* (tactical structure is fact, not copyrightable). Article text and diagrams
are produced from scratch — never copied — so output is original and
AdSense-safe. Scraping/republishing source text or images is explicitly out of
scope (it is the exact violation that caused the rejection).

The existing `/guides` system is evolved into this format; the 3 current guides
either gain animations over time or are replaced. Nothing is kept as pure text
for its own sake.

## Content Model

A preset lives as a source file under `src/data/presets/` (not the DB — static
files are what prerendering and AdSense require):

```
Preset {
  slug: string
  title: string
  category: string        // e.g. "Man-to-Man", "2-3 Zone", "BLOB"
  courtType: 'half' | 'full'
  playData: PlaySet       // players (normalized positions), ball, typed actions,
                          // groups — the same format the editor produces
  article: {              // original prose, rendered as static HTML
    intro: string
    sections: { heading: string; paragraphs: string[] }[]
    keyTakeaways: string[]
  }
  status: 'draft' | 'published'
}
```

`PlaySet` and `Action` types already exist in `src/models/types.ts`
(pass/cut/dribble/screen/shot/handoff/defense-move/double-team/ball-force +
`ActionGroup` for simultaneous steps). Presets reuse them verbatim, so an
authored preset opens in the editor with zero conversion.

## Options (branching reads) — approved 2026-07-01

Real sets are not one linear ending; they branch ("if the cut is open → layup,
else → continue to the corner"). We model these as **Options**.

Decisions (confirmed with user):
- **Name:** "Option". The pre-existing per-action `optionText` (a playback text
  badge) is unrelated and gets renamed user-facing to "Note".
- **Branch model:** each option branches from its **own** point on the primary
  line; no nesting. The primary line is "Option 1" (editable name).
- **Editor:** a **pill/tab bar** — `[ Option 1 ] [ Option 2 ] [ + Option ]`.
  "+ Option" branches at the current step (`activeStep`) off the primary line
  and starts an empty tail to record the divergence. On an option tab, actions
  before the branch point are the shared trunk (read-only context); actions
  after are that option's own.
- **Playback / set page:** named buttons; each plays the composed line (trunk +
  that option's tail) from the start.

Data model (backward compatible — existing sets have no `options`):

```
PlaySet {
  ...
  actions: ActionItem[]        // the primary line = "Option 1" (the trunk)
  primaryName?: string         // editable label for Option 1 (default "Option 1")
  options?: PlayOption[]        // extra branches; absent ⇒ single line, bar hidden
}
PlayOption { id; name; branchAfter: number; actions: ActionItem[] }
```

`branchAfter` = count of primary actions shared before this option diverges.
Composed line for an option = `actions.slice(0, branchAfter)` ++ `option.actions`.
The existing `stateEngine` (which already takes an `ActionItem[]`) is fed this
composed array, so the core playback/animation code is unchanged.

Store gains `activeOptionId` (null = primary) and routes all action CRUD to the
active line. Rendering, `ActionPanel`, and playback read a composed
`lineActions` derived from `(activeSet, activeOptionId)`.

**Out of scope (flagged):** export (frozen — separate approval); inline on-page
player. Export currently renders one line; option-aware export is deferred.

## Set Page (`/guides/:slug`, evolved)

- **Top:** the playable animation, rendered from `playData`, with playback
  controls (play/step) — the same playback visuals the editor/export use.
- **Below:** the original article (intro, sections, key takeaways) as real HTML.
- **"Editörde Aç" (Open in Editor)** button → loads the preset into the editor.
- Per-page `<title>`/meta description already handled (see current
  `GuideArticlePage`), extended to presets.

## Authoring Flow (Claude ↔ user)

1. User sends a source link (one set at a time).
2. Claude fetches it, extracts the tactical structure (positions + movement
   sequence), and **authors from scratch**: `playData` JSON + original article.
3. Saved to `src/data/presets/<slug>.ts` as `status: 'draft'`.
4. User opens it from a **"Hazır Set Taslakları" (Preset Drafts)** list in the
   editor, reviews the animation, fixes anything wrong (or leaves it as-is).
5. User clicks **"Yayınla" (Publish)** → the reviewed `playData` is written back
   and `status` flips to `published`.

**Honest constraint:** "Publish → instantly live" is not fully automatic. For
AdSense to read the text, content must be a static file that gets prerendered
and redeployed. So the real loop is: review/approve in editor → change lands in
the repo → deploy. A DB-driven "live button" is intentionally rejected because
Googlebot would not see DB-rendered text.

## Crawlability (the reason this exists)

- **Prerender:** guide/preset pages are rendered to static HTML at build time
  (e.g. `react-snap` / a vite prerender step). Googlebot must see article text
  without executing JS.
- **Sitemap:** generated at build to include every published preset slug + the
  guides index; drop `/login` and `/register`. (Current `public/sitemap.xml` is
  hand-written and omits all content.)

## Scope

### Phase 1 (this spec)
1. Preset data format + `src/data/presets/` + loader (replaces/extends
   `src/data/guides.ts`).
2. Set page: animation player + article + "Editörde Aç".
3. Editor: "Hazır Set Taslakları" open list + "Yayınla" action.
4. Prerender setup (presets + articles → static HTML).
5. Auto-generated sitemap covering all published presets.
6. **Pilot:** one full preset end-to-end (a set the user picks), to validate the
   whole loop before producing at volume.

### Out of scope (later)
- About + Contact pages (separate AdSense checklist item — tracked separately).
- Community marketplace (user-published sets) — separate backlog item.
- Home page descriptive-text expansion.

## Success Criteria

- A published preset page serves the article as static HTML (verify: view-source
  shows the prose without JS).
- The sitemap lists every published preset.
- The user can build/review/publish a preset without hand-editing JSON.
- All preset article text is original (no copied source text/images).
```
