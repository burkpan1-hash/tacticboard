// Feature flags — flip a value and redeploy to turn a feature on/off
// without deleting any code.

// SETS_ENABLED: the /sets preset-plays content section ("Hazır Setler").
//
// It exists primarily to satisfy AdSense's "publisher content" requirement.
// To remove the whole section later: set this to `false` and redeploy.
//   • /sets, /sets/:slug routes stop existing (they fall through to 404)
//   • the "Plays" links in the HomePage header and footer disappear
// Nothing else changes, and you can turn it back on anytime by setting `true`.
export const SETS_ENABLED = true
