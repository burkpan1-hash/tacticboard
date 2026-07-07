import type { Preset } from './types'

// Man-to-Man Offense presets, one standalone play per set (speed-first pass —
// see project memory 2026-07-06: user asked for one variant per remaining
// set rather than a multi-finish family, to be refined later in the editor).
// Tactical reference only: basketballforcoaches.com/basketball-plays/ (under
// "Man-to-Man Basketball Plays"); article text and animations are original.
//
// Court: half, offense attacks the top basket (y≈0.06). Coordinates are
// normalized 0–1 on the 700×658 half-court. Every cut curves using 2+
// waypoints (a single waypoint is silently ignored by the arrow overlay).

export const backScreenPost: Preset = {
  slug: 'back-screen-post',
  title: 'Back Screen Post',
  category: 'Man-to-Man Offense',
  description:
    'A 3-out 2-in entry that hides a back screen inside a staggered dribble screen, springing the post open for a quick catch right at the rim.',
  readMinutes: 4,
  family: { slug: 'back-screen-post', title: 'Back Screen Post' },

  playData: {
    id: 'preset-back-screen-post',
    name: 'Back Screen Post (5)',
    courtType: 'half',
    players: [
      { id: 'o1', number: 1, team: 'offense' },
      { id: 'o2', number: 2, team: 'offense' },
      { id: 'o3', number: 3, team: 'offense' },
      { id: 'o4', number: 4, team: 'offense' },
      { id: 'o5', number: 5, team: 'offense' },
    ],
    // 3-out 2-in: 1 with the ball up top, 2 (best shooter) and 3 in the
    // corners, 4 and 5 on the elbows.
    initialPositions: {
      o1: { x: 0.50, y: 0.66 },
      o2: { x: 0.15, y: 0.16 },
      o3: { x: 0.85, y: 0.16 },
      o4: { x: 0.35, y: 0.42 },
      o5: { x: 0.65, y: 0.42 },
    },
    initialBall: { holderId: 'o1' },
    actions: [
      // 1. 1 dribbles hard toward the right elbow to build a real screening
      //    angle for the stagger.
      { id: 'a1', type: 'dribble', playerId: 'o1', toPosition: { x: 0.58, y: 0.54 }, waypoints: [{ x: 0.54, y: 0.60 }] },
      // 2. 4 and 5 stack on the right side and set a staggered screen for 1.
      {
        id: 'a2',
        type: 'group',
        name: 'Stagger set',
        actions: [
          { id: 'a2a', type: 'screen', screenerId: 'o4', screenPosition: { x: 0.46, y: 0.44 } },
          { id: 'a2b', type: 'screen', screenerId: 'o5', screenPosition: { x: 0.54, y: 0.40 } },
        ],
      },
      // 3. 1 curls off both screens to the left wing.
      { id: 'a3', type: 'dribble', playerId: 'o1', toPosition: { x: 0.20, y: 0.48 }, waypoints: [{ x: 0.58, y: 0.54 }, { x: 0.40, y: 0.44 }] },
      // 4. The instant 1 clears the stagger, 3 sprints in from the corner
      //    and sets a strong back screen on 5's defender.
      { id: 'a4', type: 'screen', screenerId: 'o3', screenPosition: { x: 0.58, y: 0.34 } },
      // 5. 5 rolls off the back screen straight to the rim.
      { id: 'a5', type: 'cut', playerId: 'o5', toPosition: { x: 0.50, y: 0.14 }, waypoints: [{ x: 0.66, y: 0.28 }, { x: 0.54, y: 0.18 }] },
      // 6. 1 fires the post entry for the layup.
      { id: 'a6', type: 'pass', fromId: 'o1', toId: 'o5' },
      { id: 'a7', type: 'shot', shooterId: 'o5' },
    ],
  },

  article: {
    intro:
      'Back Screen Post hides its real action inside a play that looks like a simple dribble-at stagger. While the defense is occupied fighting through screens for the ball handler, the corner shooter sneaks in behind them and springs the post loose for a catch right at the rim.',
    sections: [
      {
        heading: 'Setting Up in 3-Out 2-In',
        paragraphs: [
          'Start in a 3-out 2-in shape: the point guard up top with the ball, the two bigs on the elbows, and two shooters spread wide in the corners. Put your best post scorer at the 5 spot and your best shooter at the 2 — same side of the floor — because the whole sequence is built to get exactly those two players a look.',
        ],
      },
      {
        heading: 'The Stagger That Sets Up the Back Screen',
        paragraphs: [
          'The point guard dribbles hard toward one elbow to build a real screening angle, and the two bigs stack together to set a staggered screen. This part looks completely ordinary — a guard using a double screen to get to the wing — which is exactly the point: it buys time and occupies attention while the real action loads on the weak side.',
        ],
      },
      {
        heading: 'The Hidden Back Screen',
        paragraphs: [
          'The instant the ball handler clears the stagger, the corner player who has been standing still the whole time sprints hard and sets a surprise back screen on the post defender. Because that defender was watching the ball and the stagger, not the corner, the screen usually lands clean.',
          'The post rolls immediately off that back screen to the rim. If the entry pass is there, it is a point-blank finish; if the passing lane is denied, the post simply seals for deep position instead of forcing a bad pass.',
        ],
      },
      {
        heading: 'The Backup Read',
        paragraphs: [
          "If the ball can't get into the post, the same two big-man screeners flip roles and set a stagger for the corner shooter, who cuts to the top of the key for an open catch-and-shoot. So even when the primary action is taken away, the possession still ends in a quality shot rather than a reset.",
        ],
      },
      {
        heading: 'Coaching Points',
        paragraphs: [
          'Start the play with your best shooter on the same side as your best post scorer — the whole sequence depends on that spacing.',
          "If the screening player's defender sags into the lane to help on the post instead of chasing the stagger, that screener can pop straight to the top of the key off a quick re-screen for an open look.",
        ],
      },
      {
        heading: 'When to Use It',
        paragraphs: [
          'This is a strong half-court set against a defense that is used to fighting through ball screens and stops paying attention to the weak-side corner — the back screen depends entirely on that lapse in attention.',
        ],
      },
    ],
    keyTakeaways: [
      'Set up 3-out 2-in with your best post player and best shooter on the same side.',
      'The stagger for the ball handler is a decoy that buys time for the real action.',
      'The corner shooter sprints in for a surprise back screen on the post defender the moment the decoy clears.',
      'The post rolls hard to the rim off the back screen for a point-blank catch.',
      'If the post entry is denied, the same screeners flip into a stagger for the shooter at the top of the key.',
    ],
  },

  status: 'published',
}

export const doubleCurls: Preset = {
  slug: 'double-curls',
  title: 'Double Curls',
  category: 'Man-to-Man Offense',
  description:
    'A 1-4 high set that sends two different cutters curling to the rim off staggered screens before settling into a wing pick-and-roll.',
  readMinutes: 4,
  family: { slug: 'double-curls', title: 'Double Curls' },

  playData: {
    id: 'preset-double-curls',
    name: 'Double Curls (3)',
    courtType: 'half',
    players: [
      { id: 'o1', number: 1, team: 'offense' },
      { id: 'o2', number: 2, team: 'offense' },
      { id: 'o3', number: 3, team: 'offense' },
      { id: 'o4', number: 4, team: 'offense' },
      { id: 'o5', number: 5, team: 'offense' },
    ],
    initialPositions: {
      o1: { x: 0.50, y: 0.66 },
      o2: { x: 0.15, y: 0.30 },
      o3: { x: 0.85, y: 0.30 },
      o4: { x: 0.35, y: 0.42 },
      o5: { x: 0.65, y: 0.42 },
    },
    initialBall: { holderId: 'o1' },
    actions: [
      // 1. Entry pass to the wing.
      { id: 'a1', type: 'pass', fromId: 'o1', toId: 'o3' },
      // 2. 1 makes the classic UCLA cut off 5's screen, curling through the
      //    lane; if it isn't there, he clears to the weak-side corner.
      { id: 'a2', type: 'cut', playerId: 'o1', toPosition: { x: 0.15, y: 0.18 }, waypoints: [{ x: 0.58, y: 0.40 }, { x: 0.35, y: 0.14 }] },
      // 3. 4 and 5 stack up to set a staggered screen for 2.
      {
        id: 'a3',
        type: 'group',
        name: 'Stagger set',
        actions: [
          { id: 'a3a', type: 'screen', screenerId: 'o4', screenPosition: { x: 0.40, y: 0.40 } },
          { id: 'a3b', type: 'screen', screenerId: 'o5', screenPosition: { x: 0.48, y: 0.36 } },
        ],
      },
      // 4. 2 curls off the stagger toward the rim, clearing to the ball-side
      //    corner if the layup isn't there.
      { id: 'a4', type: 'cut', playerId: 'o2', toPosition: { x: 0.82, y: 0.20 }, waypoints: [{ x: 0.25, y: 0.34 }, { x: 0.55, y: 0.16 }] },
      // 5. 4 pops back out to the top to create space.
      { id: 'a5', type: 'cut', playerId: 'o4', toPosition: { x: 0.38, y: 0.58 } },
      // 6. 5 turns and sets a ball screen for 3 on the wing.
      { id: 'a6', type: 'screen', screenerId: 'o5', screenPosition: { x: 0.68, y: 0.32 } },
      // 7. 3 attacks the rim hard off the pick-and-roll.
      { id: 'a7', type: 'dribble', playerId: 'o3', toPosition: { x: 0.55, y: 0.16 }, waypoints: [{ x: 0.68, y: 0.30 }, { x: 0.60, y: 0.22 }] },
      { id: 'a8', type: 'shot', shooterId: 'o3' },
    ],
  },

  article: {
    intro:
      'Double Curls is a 1-4 high action built around two different cutters curling to the basket off screens, one right after the other, before the possession settles into a straightforward wing pick-and-roll. It keeps the paint clear for both curls and gives a team without any specialized skill set several ways to score.',
    sections: [
      {
        heading: 'Setting Up in 1-4 High',
        paragraphs: [
          'Start in a 1-4 high formation: the point guard up top with the ball, both bigs on the elbows, and the wings spread on either side. The point guard opens the play with a simple entry pass to one wing.',
        ],
      },
      {
        heading: 'The First Curl',
        paragraphs: [
          'As soon as the pass is thrown, the point guard makes a classic UCLA cut — using the near big as a screen — and curls hard through the lane looking for the return pass and an open layup. If it isn\'t there, he simply clears through to the weak-side corner and the play keeps moving.',
        ],
      },
      {
        heading: 'The Second Curl',
        paragraphs: [
          'While that first cut is clearing out, the two bigs come together to set a staggered screen for the other guard, who curls toward the rim the same way. This is the second bite at the same apple — a different cutter, same action, same defensive problem to solve. If the layup isn\'t open, that cutter clears to the ball-side corner.',
        ],
      },
      {
        heading: 'Falling Back to the Pick-and-Roll',
        paragraphs: [
          'After screening, the first big pops back out to the top of the key to keep the floor spaced, while the second big turns immediately into a ball screen for the wing player holding the ball. That player attacks the rim hard off the pick-and-roll, looking to score or create for a teammate — this is the play\'s reliable fallback when neither curl gets loose.',
        ],
      },
      {
        heading: 'Coaching Points',
        paragraphs: [
          'This action is valuable because it keeps both post defenders out of the paint for most of the possession — by the time the pick-and-roll happens, the only true rim protector left is the point guard\'s defender.',
          'Cutters curling to the rim should lead with the hand where they want the ball and call for it the instant they\'re open — the passer needs a clear target in a crowded lane.',
        ],
      },
      {
        heading: 'When to Use It',
        paragraphs: [
          'Double Curls suits a balanced roster with no specific go-to scorer — every player touches the ball in a scoring situation. Reserve the pick-and-roll ball handler spot for whichever wing makes the best decisions attacking a scrambled defense.',
        ],
      },
    ],
    keyTakeaways: [
      'Start in 1-4 high; the point guard enters the ball to a wing to begin the action.',
      'The point guard\'s UCLA cut off the big\'s screen is the first scoring look.',
      'A staggered screen sends the other guard curling to the rim as the second look.',
      'Both post defenders are pulled away from the paint by the two curls.',
      'The play always has a answer: it ends in a live wing pick-and-roll if neither curl scores.',
    ],
  },

  status: 'published',
}

export const flexWarrior: Preset = {
  slug: 'flex-warrior',
  title: 'Flex Warrior',
  category: 'Man-to-Man Offense',
  description:
    'A horns-based flex action stacked with screen-the-screener continuations, giving disciplined shooters three separate looks in one possession.',
  readMinutes: 5,
  family: { slug: 'flex-warrior', title: 'Flex Warrior' },

  playData: {
    id: 'preset-flex-warrior',
    name: 'Flex Warrior (2)',
    courtType: 'half',
    players: [
      { id: 'o1', number: 1, team: 'offense' },
      { id: 'o2', number: 2, team: 'offense' },
      { id: 'o3', number: 3, team: 'offense' },
      { id: 'o4', number: 4, team: 'offense' },
      { id: 'o5', number: 5, team: 'offense' },
    ],
    // Horns: 1 up top with the ball, 4/5 on the elbows, 2/3 level with the
    // low blocks (lower than a standard horns wing).
    initialPositions: {
      o1: { x: 0.50, y: 0.66 },
      o2: { x: 0.85, y: 0.28 },
      o3: { x: 0.15, y: 0.28 },
      o4: { x: 0.35, y: 0.42 },
      o5: { x: 0.65, y: 0.42 },
    },
    initialBall: { holderId: 'o1' },
    actions: [
      // 1. Entry to the elbow on 2's side (best shooter side).
      { id: 'a1', type: 'pass', fromId: 'o1', toId: 'o5' },
      // 2. 1 cuts down the middle of the lane and sets a flex screen for 2.
      { id: 'a2', type: 'cut', playerId: 'o1', toPosition: { x: 0.58, y: 0.20 } },
      // 3. 2 cuts low off the flex screen for the layup look.
      { id: 'a3', type: 'cut', playerId: 'o2', toPosition: { x: 0.35, y: 0.16 }, waypoints: [{ x: 0.60, y: 0.22 }, { x: 0.45, y: 0.15 }] },
      // 4. 5 down screens for 1 — screen-the-screener.
      { id: 'a4', type: 'screen', screenerId: 'o5', screenPosition: { x: 0.55, y: 0.34 } },
      // 5. 1 curls off 5's screen to the slot for the catch-and-shoot look.
      { id: 'a5', type: 'cut', playerId: 'o1', toPosition: { x: 0.42, y: 0.44 }, waypoints: [{ x: 0.62, y: 0.30 }] },
      // 6. Immediately after, 5 sets a second screen for 2 out to the wing.
      { id: 'a6', type: 'screen', screenerId: 'o5', screenPosition: { x: 0.78, y: 0.30 } },
      // 7. 2 relocates out to the wing off 5's second screen.
      { id: 'a7', type: 'cut', playerId: 'o2', toPosition: { x: 0.85, y: 0.30 }, waypoints: [{ x: 0.60, y: 0.20 }] },
      // 8. If 1 isn't open, swing it to 2 on the wing.
      { id: 'a8', type: 'pass', fromId: 'o5', toId: 'o1' },
      { id: 'a9', type: 'pass', fromId: 'o1', toId: 'o2' },
      // 9. 5 seals for deep post position after the second screen.
      { id: 'a10', type: 'cut', playerId: 'o5', toPosition: { x: 0.62, y: 0.20 } },
      { id: 'a11', type: 'shot', shooterId: 'o2' },
    ],
  },

  article: {
    intro:
      'Flex Warrior stacks a classic flex cut on top of a screen-the-screener sequence, producing three separate live looks — a flex layup, a catch-and-shoot at the elbow, and a wing jumper — out of one horns alignment. It rewards teams that can screen with precise timing and shoot with discipline.',
    sections: [
      {
        heading: 'Setting Up in Horns',
        paragraphs: [
          'Begin in a horns set with both bigs on the elbows and the wing players pulled down level with the low blocks. The point guard enters the ball to whichever elbow has the better shooter waiting on the wing — that choice matters for everything that follows.',
        ],
      },
      {
        heading: 'The Flex Cut',
        paragraphs: [
          'After the entry pass, the passer cuts straight down the middle of the lane and sets a flex screen along the baseline. The wing player can read that screen and cut either high or low off it, looking for the direct pass from the elbow for an easy layup.',
        ],
      },
      {
        heading: 'Screen the Screener',
        paragraphs: [
          'If the flex layup isn\'t there, the elbow immediately turns the possession over to a screen-the-screener sequence: the remaining big sets a down screen for the player who just finished cutting through the flex, popping him out to the elbow or slot for a catch-and-shoot.',
          'Without pausing, that same big turns and sets a second screen — this time for the original wing cutter, sending him out to the perimeter for a third look if the ball needs to keep moving.',
        ],
      },
      {
        heading: 'The Final Option',
        paragraphs: [
          'After setting both screens, the big who did all the work seals hard for deep post position. If the wing shot isn\'t there either, dumping the ball inside for the score is the last read of the possession.',
        ],
      },
      {
        heading: 'Coaching Points',
        paragraphs: [
          'This play can be run to either side, but the point guard should always favor entering it toward the team\'s best scorer.',
          'Every screen depends on exact timing and angle — a screen set a beat late lets the defense recover before the cutter arrives.',
          'Shot selection matters more than usual here: players must be willing to pass up an okay look for a great one, since the possession is designed to generate three separate chances.',
        ],
      },
    ],
    keyTakeaways: [
      'Run it from horns, entering toward the elbow with the better shooter on the wing.',
      'The passer\'s flex cut and screen is the first scoring look.',
      'A screen-the-screener sequence turns one big into two more scoring opportunities.',
      'The screening big finishes by sealing deep in the post as the last option.',
      'Suited to older, more disciplined teams who can shoot and screen with precise timing.',
    ],
  },

  status: 'published',
}

export const pistonElevator: Preset = {
  slug: 'piston-elevator',
  title: 'Piston Elevator',
  category: 'Man-to-Man Offense',
  description:
    'A quick-hitting 1-4 high action that disguises a shooter\'s elevator-screen three behind what looks like an ordinary guard exchange.',
  readMinutes: 4,
  family: { slug: 'piston-elevator', title: 'Piston Elevator' },

  playData: {
    id: 'preset-piston-elevator',
    name: 'Piston Elevator (2)',
    courtType: 'half',
    players: [
      { id: 'o1', number: 1, team: 'offense' },
      { id: 'o2', number: 2, team: 'offense' },
      { id: 'o3', number: 3, team: 'offense' },
      { id: 'o4', number: 4, team: 'offense' },
      { id: 'o5', number: 5, team: 'offense' },
    ],
    initialPositions: {
      o1: { x: 0.50, y: 0.66 },
      o2: { x: 0.85, y: 0.28 },
      o3: { x: 0.15, y: 0.28 },
      o4: { x: 0.35, y: 0.42 },
      o5: { x: 0.65, y: 0.42 },
    },
    initialBall: { holderId: 'o1' },
    actions: [
      // 1. 1 dribbles toward 3's side, away from the elevator shooter (2).
      { id: 'a1', type: 'dribble', playerId: 'o1', toPosition: { x: 0.28, y: 0.56 } },
      // 2. 3 Iverson-cuts over the top of both elbow screens to the far side.
      { id: 'a2', type: 'cut', playerId: 'o3', toPosition: { x: 0.82, y: 0.30 }, waypoints: [{ x: 0.35, y: 0.20 }, { x: 0.62, y: 0.22 }] },
      // 3. 2 baseline-cuts to the middle of the key, waiting a beat before
      //    bursting through the elevator.
      { id: 'a3', type: 'cut', playerId: 'o2', toPosition: { x: 0.50, y: 0.30 }, waypoints: [{ x: 0.70, y: 0.16 }] },
      // 4. 4 and 5 immediately close the elevator gate around 2.
      {
        id: 'a4',
        type: 'group',
        name: 'Elevator closes',
        actions: [
          { id: 'a4a', type: 'screen', screenerId: 'o4', screenPosition: { x: 0.42, y: 0.36 } },
          { id: 'a4b', type: 'screen', screenerId: 'o5', screenPosition: { x: 0.58, y: 0.36 } },
        ],
      },
      // 5. 2 shoots straight up through the elevator to the top of the key.
      { id: 'a5', type: 'cut', playerId: 'o2', toPosition: { x: 0.50, y: 0.56 }, waypoints: [{ x: 0.50, y: 0.42 }] },
      // 6. Catch-and-shoot three.
      { id: 'a6', type: 'pass', fromId: 'o1', toId: 'o2' },
      { id: 'a7', type: 'shot', shooterId: 'o2' },
    ],
  },

  article: {
    intro:
      'Piston Elevator is built to get a team\'s best shooter a clean, unhurried three-point look in just a few seconds. It disguises the real action behind what looks like a routine guard exchange, so the defense is still reacting to the decoy when the shooter bursts through the elevator screen.',
    sections: [
      {
        heading: 'Setting Up in 1-4 High',
        paragraphs: [
          'Start in a 1-4 high formation with both bigs on the elbows. Put your best catch-and-shoot threat on the wing that will run the baseline cut — this play exists to get that one player a clean look.',
        ],
      },
      {
        heading: 'The Decoy Exchange',
        paragraphs: [
          'The point guard dribbles toward one side of the floor, and the wing on that side Iverson-cuts over the top of both elbow screens to the opposite side. This looks like a simple guard exchange, and that is exactly the point — it keeps the defense\'s eyes on the ball while the real action loads on the other side.',
        ],
      },
      {
        heading: 'The Elevator Screen',
        paragraphs: [
          'While the exchange is happening, the shooter baseline-cuts to the middle of the key. He should wait an extra beat before starting the cut, because there must be no hesitation once he changes direction — he needs to burst through the elevator at full speed.',
          'The instant he clears, both bigs step together and close the "gate" around his defender, forming an elevator screen. The shooter shoots straight up through the gate to the top of the key for a catch-and-shoot three.',
        ],
      },
      {
        heading: 'Coaching Points',
        paragraphs: [
          'The point guard must always dribble away from the better shooter — whichever wing he dribbles toward goes over the top of the screens, not through the elevator.',
          'There should be no slowdown in the key: a hard change of direction and a full-speed burst through the gate is what makes the screen effective.',
          'The two screeners must time the close of the gate precisely — closing too early or too late gives the defender a driving lane to escape.',
          'If the defender guarding a screener reads the pass and jumps the passing lane, that screener should dive to the rim for an easy layup instead.',
        ],
      },
      {
        heading: 'When to Use It',
        paragraphs: [
          'This is an ideal quick-hitting call for a sideline out-of-bounds look or a first-possession three, especially against a defense prone to ball-watching during guard exchanges.',
        ],
      },
    ],
    keyTakeaways: [
      'Set up in 1-4 high with the best shooter on the wing that will baseline-cut.',
      'The point guard always dribbles away from that shooter — never toward him.',
      'The guard exchange is a decoy that buys time for the real action.',
      'The shooter waits a beat, then bursts full-speed through the closing elevator screen.',
      'A jumped passing lane on a screener should trigger an automatic dive to the rim.',
    ],
  },

  status: 'published',
}

export const xCross: Preset = {
  slug: 'x-cross',
  title: 'X-Cross',
  category: 'Man-to-Man Offense',
  description:
    'A high 2-3 set named for its crossing guard cuts, offering a full progression of scoring reads that ends in a staggered screen for the top of the key.',
  readMinutes: 5,
  family: { slug: 'x-cross', title: 'X-Cross' },

  playData: {
    id: 'preset-x-cross',
    name: 'X-Cross (2)',
    courtType: 'half',
    players: [
      { id: 'o1', number: 1, team: 'offense' },
      { id: 'o2', number: 2, team: 'offense' },
      { id: 'o3', number: 3, team: 'offense' },
      { id: 'o4', number: 4, team: 'offense' },
      { id: 'o5', number: 5, team: 'offense' },
    ],
    // High 2-3: 1/2 up top, 3 on the wing, 4 on the block, 5 at the high post.
    initialPositions: {
      o1: { x: 0.38, y: 0.62 },
      o2: { x: 0.62, y: 0.62 },
      o3: { x: 0.85, y: 0.30 },
      o4: { x: 0.20, y: 0.20 },
      o5: { x: 0.50, y: 0.36 },
    },
    initialBall: { holderId: 'o1' },
    actions: [
      // 1. Entry pass to the wing.
      { id: 'a1', type: 'pass', fromId: 'o1', toId: 'o3' },
      // 2. 1 cuts off 5 toward the opposite block first, then 2 follows —
      //    the crossing action that gives the play its name.
      { id: 'a2', type: 'cut', playerId: 'o1', toPosition: { x: 0.72, y: 0.18 }, waypoints: [{ x: 0.50, y: 0.34 }, { x: 0.62, y: 0.20 }] },
      { id: 'a3', type: 'cut', playerId: 'o2', toPosition: { x: 0.30, y: 0.22 }, waypoints: [{ x: 0.50, y: 0.38 }, { x: 0.38, y: 0.24 }] },
      // 3. 4 cuts to the top of the key off 5 as a screen; 1 pops out wide.
      { id: 'a4', type: 'cut', playerId: 'o4', toPosition: { x: 0.42, y: 0.58 }, waypoints: [{ x: 0.48, y: 0.32 }] },
      { id: 'a5', type: 'cut', playerId: 'o1', toPosition: { x: 0.85, y: 0.42 } },
      // 4. Swing the ball around: 3 to 4, 4 to 1.
      { id: 'a6', type: 'pass', fromId: 'o3', toId: 'o4' },
      { id: 'a7', type: 'pass', fromId: 'o4', toId: 'o1' },
      // 5. 3 cuts baseline off a flex screen from 2, looking for the layup.
      { id: 'a8', type: 'screen', screenerId: 'o2', screenPosition: { x: 0.55, y: 0.18 } },
      { id: 'a9', type: 'cut', playerId: 'o3', toPosition: { x: 0.30, y: 0.16 }, waypoints: [{ x: 0.72, y: 0.16 }, { x: 0.55, y: 0.20 }] },
      // 6. If 3 isn't open, 4 and 5 set a staggered down screen for 2, who
      //    pops to the top of the key for the shot.
      {
        id: 'a10',
        type: 'group',
        name: 'Stagger for 2',
        actions: [
          { id: 'a10a', type: 'screen', screenerId: 'o4', screenPosition: { x: 0.42, y: 0.32 } },
          { id: 'a10b', type: 'screen', screenerId: 'o5', screenPosition: { x: 0.50, y: 0.36 } },
        ],
      },
      { id: 'a11', type: 'cut', playerId: 'o2', toPosition: { x: 0.55, y: 0.58 }, waypoints: [{ x: 0.30, y: 0.24 }] },
      { id: 'a12', type: 'pass', fromId: 'o1', toId: 'o2' },
      { id: 'a13', type: 'shot', shooterId: 'o2' },
    ],
  },

  article: {
    intro:
      'X-Cross takes its name from the crossing cuts the two guards make right at the start, and it stays busy from there — a full progression of screens and reads that gives nearly every player on the floor a chance to score before it\'s over.',
    sections: [
      {
        heading: 'Setting Up in High 2-3',
        paragraphs: [
          'Start in a high 2-3 alignment: both guards up top, one wing out to the side, one big on the block, and the other at the high post. Either guard can start the play with an entry pass to the wing.',
        ],
      },
      {
        heading: 'The Crossing Cuts',
        paragraphs: [
          'After the entry pass, both guards cut off the high-post screener toward the opposite block, one right after the other — the first guard always cuts first, with the second following close behind. The wing who threw the pass watches both cutters and looks to hit either one for an open layup underneath.',
        ],
      },
      {
        heading: 'Reloading the Top of the Key',
        paragraphs: [
          'If neither cutter is open, the possession keeps moving: the block player cuts to the top of the key using the high post as a screen, while the first crossing guard pops out wide to the opposite wing. The ball swings from the wing to the top of the key and back out to that popped-out guard — three quick passes that completely reset the defense\'s shape.',
        ],
      },
      {
        heading: 'The Flex Read and the Fallback',
        paragraphs: [
          'The moment the ball reaches the wing again, the original passer cuts baseline off a flex screen, looking for a return pass and an easy layup underneath. If that isn\'t open, the two remaining bigs set a staggered down screen for the last guard, who pops all the way out to the top of the key for the shot.',
        ],
      },
      {
        heading: 'Coaching Points',
        paragraphs: [
          'The high-post screener must hold his position throughout — since three different cutters use him as a screen, drifting even a step risks a moving-screen call.',
          'Whenever possible, the first pass to the wing should go to the player you most want coming off the late flex screen — that assignment is set from the opening pass.',
        ],
      },
      {
        heading: 'When to Use It',
        paragraphs: [
          'X-Cross is a good possession-long call when you want to probe a defense with several different actions in one look rather than committing early to a single read — there is a genuine shot available at almost every stage.',
        ],
      },
    ],
    keyTakeaways: [
      'Set up in high 2-3 with a stationary player at the high post.',
      'The two guards cross-cut off that high post, one after the other, for the first layup look.',
      'Three quick passes reload the top of the key after the crossing cuts clear.',
      'A flex screen underneath gives the original passer a second layup chance.',
      'A staggered down screen for the top of the key is the play\'s reliable last option.',
    ],
  },

  status: 'published',
}
