import type { Preset } from './types'

// UCLA high-post offense — authored from the public tactical concept (the "UCLA
// cut" is common basketball knowledge, not copyrightable). Article text and the
// animation are both original.
//
// Court: half, offense attacks the top basket (y≈0.06). Coordinates are
// normalized 0–1 on the 700×658 half-court (see src/utils/courtCoords.ts):
//   basket (0.5, 0.06) · free-throw line (0.5, 0.40) · elbows (0.34/0.66, 0.40)
//   · top of the three (0.5, 0.62).

export const uclaOffense: Preset = {
  slug: 'ucla-offense',
  title: 'UCLA Offense (1-4 High)',
  category: 'Man-to-Man Offense',
  description:
    'A step-by-step coaching guide to the UCLA offense: the 1-4 high alignment, the signature back-screen UCLA cut, the reads that flow out of it, and when to run it.',
  readMinutes: 6,

  playData: {
    id: 'preset-ucla-offense',
    name: 'UCLA Offense (1-4 High)',
    courtType: 'half',
    players: [
      { id: 'o1', number: 1, team: 'offense' },
      { id: 'o2', number: 2, team: 'offense' },
      { id: 'o3', number: 3, team: 'offense' },
      { id: 'o4', number: 4, team: 'offense' },
      { id: 'o5', number: 5, team: 'offense' },
    ],
    // 1-4 high: point up top with the ball, wings on the arc, bigs at the elbows.
    initialPositions: {
      o1: { x: 0.50, y: 0.66 },
      o2: { x: 0.83, y: 0.50 },
      o3: { x: 0.17, y: 0.50 },
      o4: { x: 0.37, y: 0.42 },
      o5: { x: 0.63, y: 0.42 },
    },
    initialBall: { holderId: 'o1' },
    primaryName: 'Layup off the cut',
    // Primary line ("Option 1"): the cut is open → return pass → layup.
    actions: [
      // 1. Point guard enters the ball to the right wing.
      { id: 'a1', type: 'pass', fromId: 'o1', toId: 'o2' },
      // 2. Ball-side elbow (o5) steps up and sets a back screen on o1's defender,
      //    well clear of o1's own spot (0.50, 0.66) so the two don't overlap.
      { id: 'a2', type: 'screen', screenerId: 'o5', screenPosition: { x: 0.50, y: 0.50 } },
      // 3. The UCLA cut: o1 cuts off the screen to the ball-side block while the
      //    screener o5 pops back out to the (now vacated) top spot to keep spacing
      //    (one simultaneous step). Endpoints are kept well separated from the
      //    screen spot and from each other so the crossing paths stay readable.
      {
        id: 'g1',
        type: 'group',
        name: 'UCLA cut',
        actions: [
          { id: 'a3', type: 'cut', playerId: 'o1', toPosition: { x: 0.56, y: 0.16 }, waypoints: [{ x: 0.52, y: 0.48 }] },
          { id: 'a4', type: 'cut', playerId: 'o5', toPosition: { x: 0.50, y: 0.66 } },
        ],
      },
      // 4. Wing feeds the cutter at the rim.
      { id: 'a5', type: 'pass', fromId: 'o2', toId: 'o1' },
      // 5. Layup.
      { id: 'a6', type: 'shot', shooterId: 'o1' },
    ],
    // Options branch after the UCLA cut (share actions 1–3 = pass, screen, cut).
    options: [
      {
        // Cut covered → o1 clears to the weak-side corner, ball swings to the top
        // and back to o1 for a corner three.
        id: 'opt-corner',
        name: 'Corner three',
        branchAfter: 3,
        actions: [
          { id: 'c1', type: 'cut', playerId: 'o1', toPosition: { x: 0.10, y: 0.30 }, waypoints: [{ x: 0.35, y: 0.20 }] },
          { id: 'c2', type: 'pass', fromId: 'o2', toId: 'o5' },
          { id: 'c3', type: 'pass', fromId: 'o5', toId: 'o1' },
          { id: 'c4', type: 'shot', shooterId: 'o1' },
        ],
      },
      {
        // Cut covered → the popped big comes back to set a side ball screen for
        // the wing, who attacks the middle for a pull-up.
        id: 'opt-ballscreen',
        name: 'Side ball screen',
        branchAfter: 3,
        actions: [
          { id: 's1', type: 'screen', screenerId: 'o5', screenPosition: { x: 0.72, y: 0.46 } },
          { id: 's2', type: 'dribble', playerId: 'o2', toPosition: { x: 0.50, y: 0.40 }, waypoints: [{ x: 0.64, y: 0.44 }] },
          { id: 's3', type: 'shot', shooterId: 'o2' },
        ],
      },
    ],
  },

  article: {
    intro:
      'The UCLA offense — often called the UCLA cut series or simply the 1-4 high — is one of the most enduring sets in the game. It grew out of the dynasty John Wooden built at UCLA in the 1960s and 70s, and its signature is deceptively simple: a single back-screen cut that turns a routine wing pass into an instant layup. This guide walks through how to line the set up, how the UCLA cut works step by step, the reads that come off it, and when to lean on it.',
    sections: [
      {
        heading: 'What Is the UCLA Offense?',
        paragraphs: [
          'The set begins from a 1-4 high alignment: the point guard at the top with the ball, two players on the wings, and two players at the elbows as high posts. Everything is built around one action — the UCLA cut — and the counters that flow out of it when the defense takes the first option away.',
          'Because the spacing is clean and the movement is easy to teach, the UCLA works at every level, from youth ball all the way to the NBA. It is equally useful as a stand-alone play and as the opening action of a larger continuity offense.',
        ],
      },
      {
        heading: 'Setting Up the 1-4 High',
        paragraphs: [
          'Start the point guard at the top of the key with the ball. Place the two wings just above the three-point line on each side, and stand your two best screeners at the elbows, a step off the free-throw line. Those elbow players are the engine of the set — their job is to screen, not to post up.',
          'Spacing is what makes the cut hard to guard. If the wings drift too low or the elbow players sit too high, the driving lane to the rim disappears and the cutter has nowhere to go. Hold the alignment until the first pass is made.',
        ],
      },
      {
        heading: 'The UCLA Cut, Step by Step',
        paragraphs: [
          'The point guard passes to a wing. The ball-side elbow player immediately steps up and sets a back screen on the point guard’s defender. The passer — now without the ball — cuts hard off that screen straight to the ball-side block, looking for a return pass and a layup.',
          'As the cutter clears, the screener pops back toward the top of the key. That keeps the floor balanced and gives the ball-handler a safe reset outlet. This is the heart of the set: a guard who just gave up the ball suddenly appears at the rim with a step on his defender.',
        ],
      },
      {
        heading: 'Reading the Defense',
        paragraphs: [
          'If the layup is there, take it — that is always the first option. If the defender fights over the screen and beats the cutter to the block, the cutter clears through to the weak-side corner and the offense flows into a second action, often a screen for the wing or a ball screen with the player who popped to the top.',
          'Teach players to read the cut rather than force it. The real value of the UCLA cut is that it makes the defense choose: help on the rim and you give up the perimeter; chase the cutter and you give up the screener. Every choice the defense makes opens something else.',
        ],
      },
      {
        heading: 'Coaching Points',
        paragraphs: [
          'Set the back screen with a wide, patient base. A cutter who leaves before the screen arrives kills the timing and turns a great look into a broken possession.',
          'The cutter must sprint, not jog — the whole threat depends on beating the defender to the spot. Keep the weak side spaced so help defenders cannot sag into the lane, and run the set from both sides so the defense can never load up to one side.',
        ],
      },
      {
        heading: 'When to Use It',
        paragraphs: [
          'The UCLA offense is a strong primary set for teams with a smart passing guard and bigs who can screen and finish around the rim. It is also an excellent entry into a larger offense — many teams run the UCLA cut as the first action and let it flow into their motion or ball-screen game.',
          'It is less effective if your elbow players cannot set a legal screen, or if your guards will not sprint their cuts. Like every set, it lives on execution and timing more than on the diagram itself.',
        ],
      },
    ],
    keyTakeaways: [
      'Line up 1-4 high: point at the top, wings on the arc, bigs at the elbows.',
      'The core action is a back screen from the elbow that frees the passer to cut to the rim.',
      'The layup is the first read; every counter flows from how the defense guards the cut.',
      'The screener pops to the top to keep spacing and provide a reset outlet.',
      'Sprint the cut and set a patient screen — timing is everything.',
    ],
  },

  status: 'draft',
}
