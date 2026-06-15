// Feature flags — flip a value and redeploy to turn a feature on/off
// without deleting any code.

// GUIDES_ENABLED: the /guides coaching-content section.
//
// It exists primarily to satisfy AdSense's "publisher content" requirement.
// To remove the whole section later: set this to `false` and redeploy.
//   • /guides and /guides/:slug routes stop existing (they fall through to 404)
//   • the "Guides" links in the HomePage header and footer disappear
// Nothing else changes, and you can turn it back on anytime by setting `true`.
//
// To delete it for good instead of hiding it, remove:
//   src/config/features.ts, src/data/guides.ts,
//   src/pages/GuidesPage.tsx, src/pages/GuideArticlePage.tsx,
//   the guide routes/import in src/App.tsx, and the two Guides links in
//   src/pages/HomePage.tsx.
export const GUIDES_ENABLED = true
