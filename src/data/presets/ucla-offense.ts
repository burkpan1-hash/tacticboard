import type { Preset } from './types'

// UCLA high-post offense — authored from the public tactical concept (the "UCLA
// cut" is common basketball knowledge, not copyrightable). Article text and the
// animations are both original. Tactical reference: hoopstudent.com/ucla-offense/
// ("1-4 high action" section) — see project memory for the full URL.
//
// Court: half, offense attacks the top basket (y≈0.06). Coordinates are
// normalized 0–1 on the 700×658 half-court (see src/utils/courtCoords.ts):
//   basket (0.5, 0.06) · free-throw line (0.5, 0.40) · elbows (0.34/0.66, 0.40)
//   · top of the three (0.5, 0.62).
//
// These three presets are independent, standalone plays, not PlaySet `options`
// on one play: a coach calls "run the layup", "run the flex", or "run the
// stagger" as separate calls, even though all three open from the same UCLA
// cut. They share a `family` (see types.ts) so the sets hub can group them
// under one "UCLA Offense" heading while each still gets its own page, URL,
// and full article. All three replay the same opening (pass, screen, cut) as
// their own actions — small duplication, but each preset needs to stand alone.
// Every cut below curves around its screener using 2+ waypoints: a single
// waypoint is silently ignored by the editor's static arrow overlay and falls
// back to a straight line (see project memory, 2026-07-04 bug fix note).

const FAMILY = { slug: 'ucla-offense', title: 'UCLA Offense (1-4 High)' }

const PLAYERS = [
  { id: 'o1', number: 1, team: 'offense' as const },
  { id: 'o2', number: 2, team: 'offense' as const },
  { id: 'o3', number: 3, team: 'offense' as const },
  { id: 'o4', number: 4, team: 'offense' as const },
  { id: 'o5', number: 5, team: 'offense' as const },
]

// 1-4 high: point up top with the ball, wings on the arc, bigs at the elbows.
const INITIAL_POSITIONS = {
  o1: { x: 0.50, y: 0.66 },
  o2: { x: 0.83, y: 0.50 },
  o3: { x: 0.17, y: 0.50 },
  o4: { x: 0.37, y: 0.42 },
  o5: { x: 0.63, y: 0.42 },
}

const SETUP_SECTIONS = [
  {
    heading: 'What Is the UCLA Offense?',
    paragraphs: [
      'The set begins from a 1-4 high alignment: the point guard at the top with the ball, two players on the wings, and two players at the elbows as high posts. Everything is built around one action — the UCLA cut, a back screen from a high post that frees the passer to cut to the rim.',
      'Because the spacing is clean and the movement is easy to teach, the UCLA works at every level, from youth ball all the way to the NBA, and it is the entry point for three related reads: a direct layup off the cut, a flex continuation, and a stagger-screen three.',
    ],
  },
  {
    heading: 'Setting Up the 1-4 High',
    paragraphs: [
      'Start the point guard at the top of the key with the ball. Place the two wings just above the three-point line on each side, and stand your two best screeners at the elbows, a step off the free-throw line. Those elbow players are the engine of the set — their job is to screen, not to post up.',
      'Spacing is what makes the cut hard to guard. If the wings drift too low or the elbow players sit too high, the driving lane to the rim disappears and the cutter has nowhere to go. Hold the alignment until the first pass is made.',
    ],
  },
]

export const uclaLayup: Preset = {
  slug: 'ucla-offense-layup',
  title: 'UCLA Offense (1-4 High): Layup off the Cut',
  category: 'Man-to-Man Offense',
  description:
    'The core UCLA cut from a 1-4 high alignment: a back-screen from the elbow that turns a routine wing entry pass into an instant point-blank layup.',
  readMinutes: 5,
  family: FAMILY,

  playData: {
    id: 'preset-ucla-offense-layup',
    name: 'UCLA Offense — Layup off the Cut',
    courtType: 'half',
    players: PLAYERS,
    initialPositions: INITIAL_POSITIONS,
    initialBall: { holderId: 'o1' },
    actions: [
      // 1. Point guard enters the ball to the right wing.
      { id: 'a1', type: 'pass', fromId: 'o1', toId: 'o2' },
      // 2. Ball-side elbow (o5) steps up and sets a back screen on o1's defender.
      { id: 'a2', type: 'screen', screenerId: 'o5', screenPosition: { x: 0.56, y: 0.50 } },
      // 3. The UCLA cut: o1 curls off the screen — the path bows out to the
      //    screen's right (brushing the screener's shoulder) before curling
      //    back toward the rim, so it never runs straight through the screen
      //    spot. The screener o5 pops back out to the vacated top spot at the
      //    same time.
      {
        id: 'g1',
        type: 'group',
        name: 'UCLA cut',
        actions: [
          { id: 'a3', type: 'cut', playerId: 'o1', toPosition: { x: 0.44, y: 0.16 }, waypoints: [{ x: 0.64, y: 0.58 }, { x: 0.58, y: 0.36 }] },
          { id: 'a4', type: 'cut', playerId: 'o5', toPosition: { x: 0.50, y: 0.66 } },
        ],
      },
      // 4. Wing feeds the cutter at the rim.
      { id: 'a5', type: 'pass', fromId: 'o2', toId: 'o1' },
      // 5. Layup.
      { id: 'a6', type: 'shot', shooterId: 'o1' },
    ],
  },

  article: {
    intro:
      'This is the first and most direct read out of the UCLA offense — often called the UCLA cut series or simply the 1-4 high. It grew out of the dynasty John Wooden built at UCLA in the 1960s and 70s, and its signature is deceptively simple: a single back-screen cut that turns a routine wing pass into an instant layup. It is one of three standalone calls that share this alignment; if the defense takes this one away, the flex continuation and the stagger three are the other two.',
    sections: [
      ...SETUP_SECTIONS,
      {
        heading: 'The UCLA Cut, Step by Step',
        paragraphs: [
          'The point guard passes to a wing. The ball-side elbow player immediately steps up and sets a back screen on the point guard’s defender. The passer — now without the ball — cuts hard off that screen straight to the ball-side block, looking for a return pass and a layup.',
          'As the cutter clears, the screener pops back toward the top of the key. That keeps the floor balanced and gives the ball-handler a safe reset outlet. This is the heart of the set: a guard who just gave up the ball suddenly appears at the rim with a step on his defender.',
        ],
      },
      {
        heading: 'Why the Layup Is the First Read',
        paragraphs: [
          'Take the layup every time it is there — it is the highest-percentage shot the set produces, and it is on the board before the defense has had a chance to help. Teach the cutter to look for the ball immediately on clearing the screen rather than assuming he needs to keep moving.',
          'If the defender fights over the screen and beats the cutter to the block, do not force it — this is exactly the moment the offense is designed to keep giving reads. Call this set on its own when you just need a quick, simple scoring action; call the flex or stagger variants from the same family when you want the possession to keep developing after the first look is covered.',
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
          'This is a strong quick-hitter for teams with a smart passing guard and a big who can screen and finish. Call it early in a possession or out of a timeout when you want one clean, fast scoring chance.',
          'It is less effective if your elbow players cannot set a legal screen, or if your guards will not sprint their cuts. Like every set, it lives on execution and timing more than on the diagram itself.',
        ],
      },
    ],
    keyTakeaways: [
      'Line up 1-4 high: point at the top, wings on the arc, bigs at the elbows.',
      'The core action is a back screen from the elbow that frees the passer to cut to the rim.',
      'Sprint the cut and set a patient screen — timing is everything.',
      'The screener pops to the top to keep spacing and provide a reset outlet.',
      'If the layup is covered, the flex continuation and the stagger three (same family) keep the possession alive.',
    ],
  },

  status: 'published',
}

export const uclaFlexCut: Preset = {
  slug: 'ucla-offense-flex',
  title: 'UCLA Offense (1-4 High): Flex Continuation',
  category: 'Man-to-Man Offense',
  description:
    'When the UCLA cut is covered, the possession keeps going: the cutter clears to the weak-side block and sets a flex screen for a second, point-blank rim look.',
  readMinutes: 4,
  family: FAMILY,

  playData: {
    id: 'preset-ucla-offense-flex',
    name: 'UCLA Offense — Flex Continuation',
    courtType: 'half',
    players: PLAYERS,
    initialPositions: INITIAL_POSITIONS,
    initialBall: { holderId: 'o1' },
    actions: [
      // 1–3: same UCLA cut opening as the layup call (see that preset for the
      // step-by-step breakdown) — this call is what happens next.
      { id: 'a1', type: 'pass', fromId: 'o1', toId: 'o2' },
      { id: 'a2', type: 'screen', screenerId: 'o5', screenPosition: { x: 0.56, y: 0.50 } },
      {
        id: 'g1',
        type: 'group',
        name: 'UCLA cut',
        actions: [
          { id: 'a3', type: 'cut', playerId: 'o1', toPosition: { x: 0.44, y: 0.16 }, waypoints: [{ x: 0.64, y: 0.58 }, { x: 0.58, y: 0.36 }] },
          { id: 'a4', type: 'cut', playerId: 'o5', toPosition: { x: 0.50, y: 0.66 } },
        ],
      },
      // 4. The cutter isn't open at the rim — instead of resetting, he keeps
      //    going, clearing all the way to the weak-side low block.
      { id: 'a5', type: 'cut', playerId: 'o1', toPosition: { x: 0.16, y: 0.20 }, waypoints: [{ x: 0.34, y: 0.13 }, { x: 0.22, y: 0.12 }] },
      // 5. From the block, he sets a flex screen for the weak-side wing.
      { id: 'a6', type: 'screen', screenerId: 'o1', screenPosition: { x: 0.22, y: 0.17 } },
      // 6. The weak-side wing cuts the baseline off that screen to the rim.
      { id: 'a7', type: 'cut', playerId: 'o3', toPosition: { x: 0.40, y: 0.10 }, waypoints: [{ x: 0.12, y: 0.32 }, { x: 0.18, y: 0.10 }] },
      // 7. Ball-side wing feeds the flex cutter.
      { id: 'a8', type: 'pass', fromId: 'o2', toId: 'o3' },
      // 8. Layup.
      { id: 'a9', type: 'shot', shooterId: 'o3' },
    ],
  },

  article: {
    intro:
      'This is the second read in the UCLA offense family — what happens when the direct layup off the UCLA cut is not there. Rather than reset the possession, the cutter turns himself into a screener, and a second player gets a point-blank look off a flex cut. It shares its opening with the layup call and the stagger three; run whichever one fits the moment.',
    sections: [
      {
        heading: 'Where This Continuation Starts',
        paragraphs: [
          'The setup is the same 1-4 high alignment as the rest of the family: point at the top, wings on the arc, bigs at the elbows. The point guard passes to a wing, the ball-side elbow sets a back screen, and the passer cuts hard to the ball-side block looking for the layup.',
          'This call is what you run when that first cutter is covered. Instead of curling back out to reset, he keeps sprinting through the lane all the way to the weak-side low block — that continued movement is what sets up the next action.',
        ],
      },
      {
        heading: 'The Flex Screen, Step by Step',
        paragraphs: [
          'From the weak-side block, the original cutter sets a flex screen — a back screen along the baseline. The player on the weak-side wing reads that screen and cuts hard along the baseline underneath the rim.',
          'The ball-side wing, still holding the ball from the original entry pass, delivers it to the flex cutter as he clears the screen. Because the cutter is moving toward the rim and the screen has removed his defender from the play, this is usually a clean catch at the front of the rim.',
        ],
      },
      {
        heading: 'Why It Works',
        paragraphs: [
          'The defense just spent a possession chasing the first cutter and is not set to help on a second action — the flex screen exploits exactly that scramble. It also rewards a cutter who sprints: the harder he runs the first cut, the more momentum he carries into setting the second screen.',
        ],
      },
      {
        heading: 'Coaching Points',
        paragraphs: [
          'The screener must get all the way to the block before setting the screen — a flex screen set too high in the lane gives the cutter\'s defender room to fight over the top.',
          'The flex cutter should hug the baseline, not cut through the middle of the lane, so the screen actually shields him from his defender the whole way to the rim.',
        ],
      },
      {
        heading: 'When to Use It',
        paragraphs: [
          'Call this when you expect the first cutter to be denied — against a defense that switches or that has a rangy defender who can chase over screens. It is also a good "second side" action late in the shot clock, since it keeps the ball moving instead of resetting to the top.',
        ],
      },
    ],
    keyTakeaways: [
      'Shares the same UCLA cut opening as the layup call — this is what happens when that first look is covered.',
      'The original cutter does not stop at the block; he becomes the screener for a second player.',
      'The flex screen must be set right at the block, and the cutter must hug the baseline.',
      'This is the family\'s "second side" read — it keeps the possession alive instead of resetting.',
      'If the flex cut is covered too, the stagger three (same family) is the next read.',
    ],
  },

  status: 'published',
}

export const uclaStaggerThree: Preset = {
  slug: 'ucla-offense-stagger',
  title: 'UCLA Offense (1-4 High): Stagger Three',
  category: 'Man-to-Man Offense',
  description:
    'The third read off the UCLA cut: a two-man stagger screen from both elbows that frees the original cutter for a clean catch-and-shoot three.',
  readMinutes: 4,
  family: FAMILY,

  playData: {
    id: 'preset-ucla-offense-stagger',
    name: 'UCLA Offense — Stagger Three',
    courtType: 'half',
    players: PLAYERS,
    initialPositions: INITIAL_POSITIONS,
    initialBall: { holderId: 'o1' },
    actions: [
      // 1–3: same UCLA cut opening as the other two calls in this family.
      { id: 'a1', type: 'pass', fromId: 'o1', toId: 'o2' },
      { id: 'a2', type: 'screen', screenerId: 'o5', screenPosition: { x: 0.56, y: 0.50 } },
      {
        id: 'g1',
        type: 'group',
        name: 'UCLA cut',
        actions: [
          { id: 'a3', type: 'cut', playerId: 'o1', toPosition: { x: 0.44, y: 0.16 }, waypoints: [{ x: 0.64, y: 0.58 }, { x: 0.58, y: 0.36 }] },
          { id: 'a4', type: 'cut', playerId: 'o5', toPosition: { x: 0.50, y: 0.66 } },
        ],
      },
      // 4–7: same flex continuation as the flex-cut call — the weak-side wing
      // cuts off the flex screen but is covered too (a denied read, not a score).
      { id: 'a5', type: 'cut', playerId: 'o1', toPosition: { x: 0.16, y: 0.20 }, waypoints: [{ x: 0.34, y: 0.13 }, { x: 0.22, y: 0.12 }] },
      { id: 'a6', type: 'screen', screenerId: 'o1', screenPosition: { x: 0.22, y: 0.17 } },
      { id: 'a7', type: 'cut', playerId: 'o3', toPosition: { x: 0.40, y: 0.10 }, waypoints: [{ x: 0.12, y: 0.32 }, { x: 0.18, y: 0.10 }] },
      // 8. Both elbow players now set a two-man stagger screen for the
      //    original cutter, who has been standing at the weak-side block.
      { id: 'a8', type: 'screen', screenerId: 'o4', screenPosition: { x: 0.30, y: 0.44 } },
      { id: 'a9', type: 'screen', screenerId: 'o5', screenPosition: { x: 0.42, y: 0.54 } },
      // 9. He curls off both screens back out to the top of the key.
      { id: 'a10', type: 'cut', playerId: 'o1', toPosition: { x: 0.50, y: 0.62 }, waypoints: [{ x: 0.18, y: 0.38 }, { x: 0.28, y: 0.52 }] },
      // 10. Ball-side wing swings it to him on top.
      { id: 'a11', type: 'pass', fromId: 'o2', toId: 'o1' },
      // 11. Open three.
      { id: 'a12', type: 'shot', shooterId: 'o1' },
    ],
  },

  article: {
    intro:
      'This is the third and deepest read in the UCLA offense family — the counter for when both rim looks (the direct layup and the flex cut) have been taken away. The original cutter, who has been screening for two actions by this point, releases off a two-man stagger screen and gets a clean look from three. It shares its opening with the layup and flex-cut calls in the same family.',
    sections: [
      {
        heading: 'Where This Continuation Starts',
        paragraphs: [
          'This call plays out the full family sequence: the entry pass, the UCLA cut to the rim, and — when that is covered — the flex screen continuation, where the original cutter sets a baseline screen for the weak-side wing. Only when that second look is denied too does the stagger action begin.',
          'By this point in the possession, the original cutter has been at the weak-side low block for two actions. That position is exactly where a stagger screen sequence needs him to start from.',
        ],
      },
      {
        heading: 'The Stagger Screen, Step by Step',
        paragraphs: [
          'Both elbow players — one of whom already set the very first back screen — now screen for the original cutter in sequence, forming a stagger (two screens set close together along his path back to the top).',
          'The cutter reads both screens and curls out to the top of the key. The wing who has held the ball since the opening entry pass delivers it to him in rhythm for a catch-and-shoot three.',
        ],
      },
      {
        heading: 'Why It Works',
        paragraphs: [
          'By the third action, the defense has been in constant motion — fighting through a back screen, then a flex screen, and now a stagger. A stagger screen is hard to defend cleanly even fresh; against a defense that has already rotated twice, it reliably produces a clean look.',
          'It also rewards patience: a possession that could have ended in a contested early shot instead produces an open three by working through all three of the family\'s reads in order.',
        ],
      },
      {
        heading: 'Coaching Points',
        paragraphs: [
          'The two screeners should stack their screens close together (a true stagger, not two separated picks) so the defender only gets one chance to fight through, not two clean looks.',
          'The cutter must sell the flex screen fully before releasing to the stagger — a cutter who peeks at the top too early tips off the defense and lets a defender cheat over both screens.',
        ],
      },
      {
        heading: 'When to Use It',
        paragraphs: [
          'This is a late-clock or "run the whole thing" call — use it when you want to work all three UCLA family reads in one possession rather than picking just one. It is especially effective against a scrambling, switch-everything defense that is already out of position by the third action.',
        ],
      },
    ],
    keyTakeaways: [
      'The deepest read in the family — plays out the layup look, then the flex look, then this stagger look, in order.',
      'Both elbow players screen for the original cutter, who has been the screener for the previous two actions.',
      'Stack the two stagger screens close together so the defender only gets one read, not two.',
      'Rewards a defense that has already rotated twice — a great late-clock or "full possession" call.',
      'Pairs with the layup and flex-cut presets in the same UCLA Offense family.',
    ],
  },

  status: 'published',
}
