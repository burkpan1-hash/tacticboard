import type { Preset } from './types'

// 1-4 Quick Floppy — authored from the public tactical concept (a floppy
// baseline-cut action is common basketball knowledge, not copyrightable).
// Article text and the animations are both original. Tactical reference:
// basketballforcoaches.com/basketball-plays/ ("1-4 Quick Floppy" section,
// under "Man-to-Man Basketball Plays") — see project memory for the URL.
//
// Court: half, offense attacks the top basket (y≈0.06). Coordinates are
// normalized 0–1 on the 700×658 half-court (see src/utils/courtCoords.ts).
//
// Like the UCLA family, these are independent, standalone plays sharing a
// `family`, not PlaySet `options` — each replays the same opening (both wings
// cut the baseline, the bigs set a stagger + single screen) as its own
// actions, then finishes on a different receiver. Every cut curves around
// its screener using 2+ waypoints (a single waypoint is silently ignored by
// the editor's arrow overlay — see project memory, 2026-07-04 bug fix note).

const FAMILY = { slug: '1-4-quick-floppy', title: '1-4 Quick Floppy' }

const PLAYERS = [
  { id: 'o1', number: 1, team: 'offense' as const },
  { id: 'o2', number: 2, team: 'offense' as const },
  { id: 'o3', number: 3, team: 'offense' as const },
  { id: 'o4', number: 4, team: 'offense' as const },
  { id: 'o5', number: 5, team: 'offense' as const },
]

// 1-4 low: point at the top with the ball, bigs at the low blocks, guards
// wide in the corners (lower than a standard 1-4 high) so both can run a full
// baseline cut underneath the rim.
const INITIAL_POSITIONS = {
  o1: { x: 0.50, y: 0.66 },
  o2: { x: 0.88, y: 0.30 },
  o3: { x: 0.12, y: 0.30 },
  o4: { x: 0.35, y: 0.22 },
  o5: { x: 0.65, y: 0.22 },
}

const SETUP_SECTIONS = [
  {
    heading: 'What Is the 1-4 Quick Floppy?',
    paragraphs: [
      'This is a quick-hitting entry out of a 1-4 low alignment: the point guard at the top with the ball, both bigs down at the low blocks, and both guards spread wide in the corners. The whole action takes only a few seconds — both guards cut the baseline underneath the rim, the bigs set a stagger screen on one side and a single screen on the other, and the point guard suddenly has four live targets.',
      'Because it is fast and hard to scout, it works well as a first-possession call or an after-timeout look, and it gives you a genuine choice of finishes rather than one predetermined shot.',
    ],
  },
  {
    heading: 'Setting Up the 1-4 Low',
    paragraphs: [
      'Start the point guard at the top of the key with the ball. Put your two bigs on the low blocks and your two guards wide in the corners, well below the wing — the corner spacing is what makes the baseline cut a real threat instead of a short shuffle.',
      'Hold the alignment until the point guard has the ball under control. Everything else in the play happens off his signal.',
    ],
  },
]

export const floppyPerimeterCatch: Preset = {
  slug: '1-4-quick-floppy-perimeter',
  title: '1-4 Quick Floppy: Perimeter Catch-and-Shoot',
  category: 'Man-to-Man Offense',
  description:
    'A 1-4 low quick hitter: both guards cut the baseline off a stagger and a single screen, and the point guard finds the popping shooter for a catch-and-shoot.',
  readMinutes: 5,
  family: FAMILY,

  playData: {
    id: 'preset-floppy-1-4-perimeter',
    name: '1-4 Quick Floppy — Perimeter Catch (2)',
    courtType: 'half',
    players: PLAYERS,
    initialPositions: INITIAL_POSITIONS,
    initialBall: { holderId: 'o1' },
    actions: [
      // 1. Both corner guards cut the baseline underneath the rim — o2 cuts
      //    all the way to the middle, o3 cuts a shorter path to just inside
      //    the paint (where he'll set part of a stagger screen).
      {
        id: 'a1',
        type: 'group',
        name: 'Baseline cut',
        actions: [
          { id: 'a1a', type: 'cut', playerId: 'o2', toPosition: { x: 0.50, y: 0.14 }, waypoints: [{ x: 0.75, y: 0.16 }, { x: 0.60, y: 0.12 }] },
          { id: 'a1b', type: 'cut', playerId: 'o3', toPosition: { x: 0.34, y: 0.26 }, waypoints: [{ x: 0.18, y: 0.26 }, { x: 0.26, y: 0.25 }] },
        ],
      },
      // 2. The bigs step a foot outside their blocks and set two screens: o4
      //    stacks with o3 to form a stagger on the left, o5 sets a single
      //    screen alone on the right.
      {
        id: 'a2',
        type: 'group',
        name: 'Screens set',
        actions: [
          { id: 'a2a', type: 'screen', screenerId: 'o4', screenPosition: { x: 0.22, y: 0.18 } },
          { id: 'a2b', type: 'screen', screenerId: 'o5', screenPosition: { x: 0.76, y: 0.20 } },
        ],
      },
      // 3. o2 reads the stagger and curls off both screens (o4 then o3) to
      //    the left perimeter.
      { id: 'a3', type: 'cut', playerId: 'o2', toPosition: { x: 0.18, y: 0.42 }, waypoints: [{ x: 0.30, y: 0.16 }, { x: 0.20, y: 0.30 }] },
      // 4. Once o2's defender has fought through the stagger, o3 — who just
      //    helped screen — releases off o5's single screen to the right
      //    perimeter (a screen-the-screener continuation).
      { id: 'a4', type: 'cut', playerId: 'o3', toPosition: { x: 0.82, y: 0.42 }, waypoints: [{ x: 0.55, y: 0.15 }, { x: 0.85, y: 0.25 }] },
      // 5. Both bigs duck into the lane after screening, giving the point
      //    guard a second pair of options.
      {
        id: 'a5',
        type: 'group',
        name: 'Duck in',
        actions: [
          { id: 'a5a', type: 'cut', playerId: 'o4', toPosition: { x: 0.42, y: 0.20 } },
          { id: 'a5b', type: 'cut', playerId: 'o5', toPosition: { x: 0.58, y: 0.20 } },
        ],
      },
      // 6. Point guard finds the popping shooter on the left.
      { id: 'a6', type: 'pass', fromId: 'o1', toId: 'o2' },
      // 7. Catch-and-shoot.
      { id: 'a7', type: 'shot', shooterId: 'o2' },
    ],
  },

  article: {
    intro:
      'The 1-4 Quick Floppy is built to manufacture an open catch-and-shoot in the first few seconds of a possession. Both guards cut the baseline at once, the bigs turn a simple down screen into a stagger on one side and a single screen on the other, and by the time the dust settles the point guard is looking at four live targets. This guide covers the setup, the baseline cut and screening sequence, and the read that ends in a perimeter catch-and-shoot.',
    sections: [
      ...SETUP_SECTIONS,
      {
        heading: 'The Baseline Cut and Screening Sequence',
        paragraphs: [
          'On the point guard\'s signal, both corner guards cut the baseline underneath the rim. The ball-side guard (o2 here) runs all the way to the middle of the lane; the weak-side guard (o3) cuts a shorter path, stopping just inside the paint on his own side — that stopping point is exactly where he is about to become a screener.',
          'Both bigs step a foot outside their blocks to screen. On the side where the weak-side guard stopped, he and that big stack together into a stagger (two screens set close together); on the other side, the remaining big sets a single screen alone.',
        ],
      },
      {
        heading: 'Reading the Stagger',
        paragraphs: [
          'The guard in the middle of the lane reads both screens and picks one. In this line, he curls off the stagger — the tougher screen to fight through — and pops all the way out to that side\'s perimeter for a clean catch.',
          'The guard who helped set the stagger is not done: once his man has fought through, he releases off the single screen on the opposite side and pops out there too. That is a screen-the-screener wrinkle, and it is what turns two guards cutting under the rim into two separate catch-and-shoot threats on either wing.',
        ],
      },
      {
        heading: 'Why the Point Guard Loves This Read',
        paragraphs: [
          'By the time both guards have popped and both bigs have ducked into the lane behind their screens, the point guard is looking at four live targets — two shooters on the wings and two bigs sealing smaller defenders in the paint. This preset ends on the simplest of those reads: catch-and-shoot off the stagger.',
          'Because the defense has to fight through a stagger, a single screen, and two duck-ins almost simultaneously, someone is almost always open — the skill is in the point guard recognizing which one, fast.',
        ],
      },
      {
        heading: 'Coaching Points',
        paragraphs: [
          'The weak-side guard must actually stop and set a real screen before releasing to the other side — a rushed, half-hearted stagger screen lets the defense fight through both at once.',
          'Corner spacing at the start is what makes the baseline cut dangerous. If the guards start too close to the lane, there is no cut to speak of and the defense never has to react.',
        ],
      },
      {
        heading: 'When to Use It',
        paragraphs: [
          'This is an excellent first-possession or after-timeout call — it is fast, it is hard to scout from one look, and it produces a real shot in under ten seconds. It rewards a team with two guards who can both shoot off the catch.',
          'It asks a lot of the bigs (screen, screen again, then duck in) and of the point guard\'s decision-making under a fast-developing picture, so rep it until the timing is automatic before running it live.',
        ],
      },
    ],
    keyTakeaways: [
      'Set up 1-4 low: point at the top, bigs on the blocks, guards wide in the corners.',
      'Both guards cut the baseline at once; the weak-side guard stops inside the paint to become a screener.',
      'The bigs form a stagger on one side and a single screen on the other.',
      'The middle guard picks a screen and pops; the screener-guard then releases off the other screen too.',
      'Both bigs duck in after screening — the point guard ends up with four options, not one.',
    ],
  },

  status: 'published',
}

export const floppyDuckInLayup: Preset = {
  slug: '1-4-quick-floppy-duckin',
  title: '1-4 Quick Floppy: Duck-In Layup',
  category: 'Man-to-Man Offense',
  description:
    'The same 1-4 low quick hitter, but the point guard skips the perimeter and hits the ducking-in big for an immediate layup while the defense is still fighting through screens.',
  readMinutes: 4,
  family: FAMILY,

  playData: {
    id: 'preset-floppy-1-4-duckin',
    name: '1-4 Quick Floppy — Duck-In Layup (5)',
    courtType: 'half',
    players: PLAYERS,
    initialPositions: INITIAL_POSITIONS,
    initialBall: { holderId: 'o1' },
    actions: [
      // 1–5: identical opening to the perimeter-catch call in this family —
      // baseline cut, stagger + single screen, both guards popping.
      {
        id: 'a1',
        type: 'group',
        name: 'Baseline cut',
        actions: [
          { id: 'a1a', type: 'cut', playerId: 'o2', toPosition: { x: 0.50, y: 0.14 }, waypoints: [{ x: 0.75, y: 0.16 }, { x: 0.60, y: 0.12 }] },
          { id: 'a1b', type: 'cut', playerId: 'o3', toPosition: { x: 0.34, y: 0.26 }, waypoints: [{ x: 0.18, y: 0.26 }, { x: 0.26, y: 0.25 }] },
        ],
      },
      {
        id: 'a2',
        type: 'group',
        name: 'Screens set',
        actions: [
          { id: 'a2a', type: 'screen', screenerId: 'o4', screenPosition: { x: 0.22, y: 0.18 } },
          { id: 'a2b', type: 'screen', screenerId: 'o5', screenPosition: { x: 0.76, y: 0.20 } },
        ],
      },
      { id: 'a3', type: 'cut', playerId: 'o2', toPosition: { x: 0.18, y: 0.42 }, waypoints: [{ x: 0.30, y: 0.16 }, { x: 0.20, y: 0.30 }] },
      { id: 'a4', type: 'cut', playerId: 'o3', toPosition: { x: 0.82, y: 0.42 }, waypoints: [{ x: 0.55, y: 0.15 }, { x: 0.85, y: 0.25 }] },
      // 6. Both bigs duck in — but this time the defense has sold out on the
      //    perimeter cutters, so the point guard skips them entirely.
      {
        id: 'a5',
        type: 'group',
        name: 'Duck in',
        actions: [
          { id: 'a5a', type: 'cut', playerId: 'o4', toPosition: { x: 0.42, y: 0.20 } },
          { id: 'a5b', type: 'cut', playerId: 'o5', toPosition: { x: 0.58, y: 0.20 } },
        ],
      },
      // 7. Quick pass to the ducking-in big before his defender can recover.
      { id: 'a6', type: 'pass', fromId: 'o1', toId: 'o5' },
      // 8. Layup.
      { id: 'a7', type: 'shot', shooterId: 'o5' },
    ],
  },

  article: {
    intro:
      'This is the other side of the same 1-4 Quick Floppy read: instead of finding a shooter on the perimeter, the point guard hits the ducking-in big for a layup while the defense is still untangling itself from the stagger and single screen. It shares its opening with the perimeter-catch call in the same family — the difference is only in who the point guard decides to feed.',
    sections: [
      {
        heading: 'Where This Read Comes From',
        paragraphs: [
          'The setup and the first few seconds are identical to the rest of the family: 1-4 low alignment, both guards cut the baseline, the bigs turn their screens into a stagger on one side and a single screen on the other, and both guards pop to the perimeter.',
          'The wrinkle is what happens to the screeners. The moment a big finishes screening, he is taught to duck hard into the lane looking for the ball — and if his defender helped even a step onto the perimeter cutter, that duck-in is wide open.',
        ],
      },
      {
        heading: 'Why the Duck-In Is Often the Better Look',
        paragraphs: [
          'A defense that has just fought through a stagger and a single screen is almost never in rebalanced helpside position. If either big\'s defender cheats even slightly toward the perimeter shooter he just helped screen for, the duck-in has a straight line to the rim.',
          'This is also simply a higher-value shot than a contested perimeter catch — a point guard who has both reads available should treat the duck-in as the first look, not the backup plan.',
        ],
      },
      {
        heading: 'Coaching Points',
        paragraphs: [
          'Teach the bigs to duck in hard and target the space in front of the rim, not just drift — a lazy duck-in gives the defense time to recover position.',
          'The point guard has to see this early: the passing window from the top of the key to a cutting big in the lane closes fast, so hesitation turns a layup into a turnover.',
        ],
      },
      {
        heading: 'When to Use It',
        paragraphs: [
          'Call this specifically against a defense that likes to help off bigs to chase cutters through screens — the more aggressively they help on the perimeter, the more open the duck-in becomes.',
          'It is a lower-risk finish than the perimeter catch in one sense (closer to the rim) but demands quicker recognition from the point guard, since the window is short.',
        ],
      },
    ],
    keyTakeaways: [
      'Shares the same baseline-cut-and-screen opening as the perimeter-catch call in this family.',
      'Both bigs duck hard into the lane immediately after setting their screens.',
      'A defense that helps onto the perimeter cutters leaves the duck-in wide open.',
      'Treat the duck-in as a first-look read, not a backup — it is usually the higher-value shot.',
      'Success depends on quick recognition from the point guard; the passing window closes fast.',
    ],
  },

  status: 'published',
}
