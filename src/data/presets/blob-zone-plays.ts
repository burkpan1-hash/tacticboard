import type { Preset } from './types'

// BLOB (baseline out-of-bounds) 2-3 Zone presets, one standalone play per set
// (speed-first pass — see project memory 2026-07-06). Tactical reference
// only: basketballforcoaches.com/basketball-plays/ (under "BLOB 2-3 Zone
// Basketball Plays"); article text and animations are original.
//
// These attack a zone rather than a specific defender, so only offensive
// players are modeled. The inbounder starts just behind the baseline
// (y just above 0). Court: half, offense attacks the top basket (y≈0.06),
// coordinates normalized 0–1. Curved cuts use 2+ waypoints (a single
// waypoint is silently ignored by the arrow overlay).

export const belmontFlash: Preset = {
  slug: 'belmont-flash',
  title: 'Belmont Flash',
  category: 'BLOB 2-3 Zone Offense',
  description:
    'A wide-box baseline inbound that catches a zone\'s low defender off guard with a middle flash and a strong screen for a corner three.',
  readMinutes: 4,
  family: { slug: 'belmont-flash', title: 'Belmont Flash' },

  playData: {
    id: 'preset-belmont-flash',
    name: 'Belmont Flash (2)',
    courtType: 'half',
    players: [
      { id: 'o1', number: 1, team: 'offense' },
      { id: 'o2', number: 2, team: 'offense' },
      { id: 'o3', number: 3, team: 'offense' },
      { id: 'o4', number: 4, team: 'offense' },
      { id: 'o5', number: 5, team: 'offense' },
    ],
    // A box set pushed about a third wider than usual on every side.
    initialPositions: {
      o2: { x: 0.50, y: 0.02 },
      o4: { x: 0.20, y: 0.34 },
      o5: { x: 0.80, y: 0.34 },
      o1: { x: 0.30, y: 0.16 },
      o3: { x: 0.70, y: 0.16 },
    },
    initialBall: { holderId: 'o2' },
    actions: [
      { id: 'a1', type: 'cut', playerId: 'o3', toPosition: { x: 0.80, y: 0.30 } },
      { id: 'a2', type: 'pass', fromId: 'o2', toId: 'o3' },
      // 1 also cuts to the top in case the extra pass is needed.
      { id: 'a3', type: 'cut', playerId: 'o1', toPosition: { x: 0.50, y: 0.44 } },
      // 4 flashes to the middle of the key on 3's catch.
      { id: 'a4', type: 'cut', playerId: 'o4', toPosition: { x: 0.50, y: 0.24 } },
      { id: 'a5', type: 'pass', fromId: 'o3', toId: 'o4' },
      // 5 seals the ball-side low defender; 2 curls to the corner.
      { id: 'a6', type: 'screen', screenerId: 'o5', screenPosition: { x: 0.68, y: 0.18 } },
      { id: 'a7', type: 'cut', playerId: 'o2', toPosition: { x: 0.80, y: 0.18 }, waypoints: [{ x: 0.55, y: 0.10 }, { x: 0.70, y: 0.14 }] },
      { id: 'a8', type: 'pass', fromId: 'o4', toId: 'o2' },
      { id: 'a9', type: 'shot', shooterId: 'o2' },
    ],
  },

  article: {
    intro:
      'Belmont Flash catches a zone completely off balance by getting the ball to the middle of the key for just a moment — long enough for a screen and a curl to spring the inbounder open in the corner for three. It only works because the defense hasn\'t seen it before, so treat it like a surprise weapon.',
    sections: [
      {
        heading: 'Setting Up Wide',
        paragraphs: [
          'Start in a box set, but push every spot about three feet wider than usual — this small stretch is what opens the passing and cutting lanes the play depends on. Your best shooter inbounds the ball, with a strong screener on the ball-side low block and a good decision-maker on the weak-side low block.',
        ],
      },
      {
        heading: 'The Flash',
        paragraphs: [
          'The strong-side low player pops out to the wing for the inbounds pass, while the point guard also cuts to the top of the key in case an extra pass is needed to get the ball inside safely. The instant the wing catches the ball, the weak-side post flashes hard to the middle of the key to receive the next pass.',
        ],
      },
      {
        heading: 'The Screen and the Read',
        paragraphs: [
          'As the ball arrives in the middle of the key, the ball-side low post sets a strong screen on his own defender, and the inbounder — now released from the baseline — curls around it into the corner for the three.',
          'The middle player has to make the right read here: if the low zone defender fights over the top of the screen to chase the shooter, the screener himself will be wide open underneath for a bounce pass and layup instead.',
        ],
      },
      {
        heading: 'Coaching Points',
        paragraphs: [
          'This is a surprise play by design — running it too often lets defenses recognize the flash and take it away before the screen ever gets set.',
          'The player catching the ball in the middle of the key has the hardest job on the floor: read the low defender correctly and deliver the right pass, to the corner or underneath.',
          'If the screener does get the ball inside, he needs to finish strong — the low defender recovering from behind will often go for the foul.',
        ],
      },
    ],
    keyTakeaways: [
      'Push every spot in the box about three feet wider than a standard set.',
      'A flash to the middle of the key is the trigger for everything that follows.',
      'The read belongs to the middle player: corner three or short bounce pass underneath.',
      'Save this for a genuine surprise moment — it won\'t work run every game.',
      'Whoever scores inside must finish through contact; the recovering defender usually fouls.',
    ],
  },

  status: 'published',
}

export const boxFlash: Preset = {
  slug: 'box-flash',
  title: 'Box Flash',
  category: 'BLOB 2-3 Zone Offense',
  description:
    'A box-set baseline inbound that overloads one side of a 2-3 zone, forcing the defense to choose between a shooter on a double screen and a flashing playmaker.',
  readMinutes: 5,
  family: { slug: 'box-flash', title: 'Box Flash' },

  playData: {
    id: 'preset-box-flash',
    name: 'Box Flash (2)',
    courtType: 'half',
    players: [
      { id: 'o1', number: 1, team: 'offense' },
      { id: 'o2', number: 2, team: 'offense' },
      { id: 'o3', number: 3, team: 'offense' },
      { id: 'o4', number: 4, team: 'offense' },
      { id: 'o5', number: 5, team: 'offense' },
    ],
    initialPositions: {
      o2: { x: 0.50, y: 0.02 },
      o5: { x: 0.70, y: 0.16 },
      o4: { x: 0.30, y: 0.16 },
      o1: { x: 0.65, y: 0.30 },
      o3: { x: 0.35, y: 0.30 },
    },
    initialBall: { holderId: 'o2' },
    actions: [
      { id: 'a1', type: 'cut', playerId: 'o5', toPosition: { x: 0.82, y: 0.34 } },
      { id: 'a2', type: 'pass', fromId: 'o2', toId: 'o5' },
      // 1 pops high to the slot; 3 slides down to join 4.
      { id: 'a3', type: 'cut', playerId: 'o1', toPosition: { x: 0.50, y: 0.56 } },
      { id: 'a4', type: 'cut', playerId: 'o3', toPosition: { x: 0.60, y: 0.26 } },
      // 2 steps onto the court into the ball-side short corner.
      { id: 'a5', type: 'cut', playerId: 'o2', toPosition: { x: 0.78, y: 0.18 } },
      { id: 'a6', type: 'pass', fromId: 'o5', toId: 'o1' },
      {
        id: 'a7',
        type: 'group',
        name: 'Double screen',
        actions: [
          { id: 'a7a', type: 'screen', screenerId: 'o4', screenPosition: { x: 0.66, y: 0.20 } },
          { id: 'a7b', type: 'screen', screenerId: 'o3', screenPosition: { x: 0.72, y: 0.24 } },
        ],
      },
      { id: 'a8', type: 'cut', playerId: 'o2', toPosition: { x: 0.60, y: 0.36 }, waypoints: [{ x: 0.74, y: 0.20 }, { x: 0.68, y: 0.28 }] },
      { id: 'a9', type: 'dribble', playerId: 'o1', toPosition: { x: 0.46, y: 0.60 } },
      { id: 'a10', type: 'pass', fromId: 'o1', toId: 'o2' },
      { id: 'a11', type: 'shot', shooterId: 'o2' },
    ],
  },

  article: {
    intro:
      'Box Flash loads three or four different reads into a single baseline inbound, overloading one side of a 2-3 zone until it has to guess wrong. It suits teams of any level, since the primary read — a shooter running a double screen to the corner — is simple even though everything around it isn\'t.',
    sections: [
      {
        heading: 'Setting Up in the Box',
        paragraphs: [
          'Post players start on the two low blocks, guards on the two elbows. Put a strong catch-and-shoot threat at 2 and your best playmaker at 3 — the decisions made from that spot decide whether the possession ends in an open shot.',
        ],
      },
      {
        heading: 'Loading the Overload',
        paragraphs: [
          'The play begins with the ball-side post sprinting to the wing to receive the inbounds pass, while one guard pops high to the slot and the other slides down to team up with the weak-side post for a double screen. The inbounder steps onto the court and finds the ball-side short corner.',
        ],
      },
      {
        heading: 'The Double Screen',
        paragraphs: [
          'The ball moves from the wing to the guard at the top of the key, who takes a dribble to sharpen his passing angle. The shooter sprints off the double screen toward the corner, and the pass has to be on time and on target — this is the pass to rep hardest in practice.',
        ],
      },
      {
        heading: 'The Backup Reads',
        paragraphs: [
          "If the corner shot isn't there, the playmaker at the elbow flashes to the high post for a pass, with two more live options from there: attack a mismatch against a slower defender from the high post, or wait for the weak-side post to set a back screen and pop to the wing for a three after the backdoor cutter clears.",
        ],
      },
      {
        heading: 'Coaching Points',
        paragraphs: [
          'Put your best decision-maker at the 3 spot without exception — this play\'s entire value depends on what he sees and does from the high post.',
          'The post player setting the final back screen must stay shot-ready immediately after popping out; the defense\'s coverage on that screen determines whether he gets the ball.',
        ],
      },
    ],
    keyTakeaways: [
      'Set up in a standard box with a shooter at 2 and your best playmaker at 3.',
      'The double screen to the corner is the primary, most reliable read.',
      'The pass from the top of the key to the corner needs daily practice reps to be reliable.',
      'A flash to the high post gives the playmaker a mismatch or a backdoor-and-pop as backups.',
      'Every reads should be taught explicitly so players know what\'s open based on the coverage.',
    ],
  },

  status: 'published',
}

export const cross: Preset = {
  slug: 'cross',
  title: 'Cross',
  category: 'BLOB 2-3 Zone Offense',
  description:
    'A minimal 1-4 high baseline inbound that spreads four scorers low and forces a 2-3 zone\'s three defenders to guard all of them.',
  readMinutes: 3,
  family: { slug: 'cross', title: 'Cross' },

  playData: {
    id: 'preset-cross',
    name: 'Cross (5)',
    courtType: 'half',
    players: [
      { id: 'o1', number: 1, team: 'offense' },
      { id: 'o2', number: 2, team: 'offense' },
      { id: 'o3', number: 3, team: 'offense' },
      { id: 'o4', number: 4, team: 'offense' },
      { id: 'o5', number: 5, team: 'offense' },
    ],
    initialPositions: {
      o1: { x: 0.50, y: 0.02 },
      o4: { x: 0.35, y: 0.40 },
      o5: { x: 0.65, y: 0.40 },
      o2: { x: 0.15, y: 0.30 },
      o3: { x: 0.85, y: 0.30 },
    },
    initialBall: { holderId: 'o1' },
    actions: [
      {
        id: 'a1',
        type: 'group',
        name: 'Corners cut',
        actions: [
          { id: 'a1a', type: 'cut', playerId: 'o2', toPosition: { x: 0.15, y: 0.16 } },
          { id: 'a1b', type: 'cut', playerId: 'o3', toPosition: { x: 0.85, y: 0.16 } },
        ],
      },
      {
        id: 'a2',
        type: 'group',
        name: 'Bigs cross',
        actions: [
          { id: 'a2a', type: 'cut', playerId: 'o4', toPosition: { x: 0.62, y: 0.14 } },
          { id: 'a2b', type: 'cut', playerId: 'o5', toPosition: { x: 0.38, y: 0.14 } },
        ],
      },
      { id: 'a3', type: 'pass', fromId: 'o1', toId: 'o5' },
      { id: 'a4', type: 'shot', shooterId: 'o5' },
    ],
  },

  article: {
    intro:
      'Cross may be the simplest play in this whole collection, and that\'s exactly why it works so well at every level. Four scorers spread low, forcing a 2-3 zone\'s three low-and-mid defenders to cover ground they simply can\'t — as long as the spacing is even, someone has to be open.',
    sections: [
      {
        heading: 'Setting Up in 1-4 High',
        paragraphs: [
          'Start in a 1-4 high formation: posts on the elbows, your two best shooters on the wings, point guard inbounding. Nothing about the setup is unusual — the whole play is in the movement.',
        ],
      },
      {
        heading: 'Spreading Four Scorers Low',
        paragraphs: [
          'Both wings cut hard to their own corners, calling loudly for the ball the whole way — this is what drags both low wing defenders out of position. A second later, both posts cross paths and cut to the opposite low blocks from where they started.',
          'By the time this settles, four separate scoring options are spread evenly along the baseline, and a 2-3 zone only has three defenders down low to guard all of them.',
        ],
      },
      {
        heading: 'The Read',
        paragraphs: [
          'The inbounder simply reads where the defenders committed and delivers the ball to whichever of the four is left open. Since the defense is outnumbered by design, this read is more about discipline and patience than difficulty.',
        ],
      },
      {
        heading: 'Coaching Points',
        paragraphs: [
          'If a corner shooter catches and shoots, the player in the opposite corner has to sprint back immediately to prevent a fast break the other way.',
          'The inbounder should watch the player cutting to the far corner first — the ball-side low defender will almost always deny that direct pass, so it\'s really the weak-side low defender who has to be moved before the post players can get open.',
          'Every cutter calling loudly for the ball is what actually drags the defenders out of position — a silent cut doesn\'t have the same effect.',
          'The inbounder must never give away the pass with his eyes before he throws it.',
        ],
      },
    ],
    keyTakeaways: [
      'Set up in 1-4 high with two shooters on the wings and two posts on the elbows.',
      'Both wings cut to the corners; both posts cross to the opposite low blocks a beat later.',
      'Four scorers end up low, outnumbering the zone\'s three low-and-mid defenders.',
      'The inbounder simply reads and delivers to whoever the defense leaves open.',
      'Loud, constant calls for the ball on every cut are what actually moves the defense.',
    ],
  },

  status: 'published',
}

export const doubleSkip: Preset = {
  slug: 'double-skip',
  title: 'Double Skip',
  category: 'BLOB 2-3 Zone Offense',
  description:
    'A 1-4 high baseline inbound that skips the ball twice from side to side before a double flare screen frees the inbounder for a corner three, out of the zone\'s sight.',
  readMinutes: 5,
  family: { slug: 'double-skip', title: 'Double Skip' },

  playData: {
    id: 'preset-double-skip',
    name: 'Double Skip (2)',
    courtType: 'half',
    players: [
      { id: 'o1', number: 1, team: 'offense' },
      { id: 'o2', number: 2, team: 'offense' },
      { id: 'o3', number: 3, team: 'offense' },
      { id: 'o4', number: 4, team: 'offense' },
      { id: 'o5', number: 5, team: 'offense' },
    ],
    // Posts start on the wings of the 1-4 high, not the elbows.
    initialPositions: {
      o2: { x: 0.50, y: 0.02 },
      o5: { x: 0.80, y: 0.34 },
      o4: { x: 0.20, y: 0.34 },
      o3: { x: 0.65, y: 0.44 },
      o1: { x: 0.50, y: 0.56 },
    },
    initialBall: { holderId: 'o2' },
    actions: [
      {
        id: 'a1',
        type: 'group',
        name: 'Strong side fills',
        actions: [
          { id: 'a1a', type: 'cut', playerId: 'o5', toPosition: { x: 0.85, y: 0.16 } },
          { id: 'a1b', type: 'cut', playerId: 'o3', toPosition: { x: 0.72, y: 0.20 } },
        ],
      },
      { id: 'a2', type: 'pass', fromId: 'o2', toId: 'o5' },
      // 1 screens in on the top zone defender to protect the skip pass.
      { id: 'a3', type: 'screen', screenerId: 'o1', screenPosition: { x: 0.50, y: 0.44 } },
      { id: 'a4', type: 'pass', fromId: 'o5', toId: 'o4' },
      { id: 'a5', type: 'cut', playerId: 'o1', toPosition: { x: 0.50, y: 0.58 } },
      {
        id: 'a6',
        type: 'group',
        name: 'Flare screens',
        actions: [
          { id: 'a6a', type: 'screen', screenerId: 'o3', screenPosition: { x: 0.62, y: 0.20 } },
          { id: 'a6b', type: 'screen', screenerId: 'o5', screenPosition: { x: 0.72, y: 0.16 } },
        ],
      },
      { id: 'a7', type: 'cut', playerId: 'o2', toPosition: { x: 0.75, y: 0.34 }, waypoints: [{ x: 0.55, y: 0.10 }, { x: 0.65, y: 0.20 }] },
      { id: 'a8', type: 'pass', fromId: 'o4', toId: 'o2' },
      { id: 'a9', type: 'shot', shooterId: 'o2' },
    ],
  },

  article: {
    intro:
      'Double Skip moves the ball from side to side twice before springing its real weapon: the inbounder himself, running to the opposite wing behind a double flare screen the zone never sees coming because it happens completely out of its sightline.',
    sections: [
      {
        heading: 'Setting Up in 1-4 High',
        paragraphs: [
          'Start in a 1-4 high formation, but put both posts on the wings rather than the elbows. Your best shooter is the one inbounding the ball, and your posts need to be capable of making a strong, accurate skip pass.',
        ],
      },
      {
        heading: 'The First Skip',
        paragraphs: [
          'One post sprints to the strong-side corner while a guard sprints to the strong-side short corner at the same time, and the inbounder enters the ball to the corner. A guard can screen in on the top zone defender to make the coming skip pass safer, and then the corner post fires a skip pass all the way across to the post on the far wing.',
        ],
      },
      {
        heading: 'The Double Flare',
        paragraphs: [
          'As the skip pass travels, the screener spaces up to the top of the key. The guard who set up the first skip now sprints up to flare-screen the top zone defender, while the post in the strong-side corner simultaneously screens in on the bottom wing defender — two screens landing at once, both away from where the ball is about to go.',
          'The inbounder, completely out of the zone\'s sightline behind those two screens, sprints behind the bottom wing defender and arrives on the wing just as the second skip pass gets there for an open three.',
        ],
      },
      {
        heading: 'Coaching Points',
        paragraphs: [
          'The timing of the two flare screens is everything — they need to land at almost the exact moment the second skip pass is released, or the defense sees it developing too early.',
          'Either post can also use a simple dribble to make his own skip pass easier and safer if the direct pass isn\'t there.',
          'If either wing defender fights over the top of a flare screen, that screener can slip it and show himself for an easier pass instead.',
        ],
      },
    ],
    keyTakeaways: [
      'Set up 1-4 high with both posts starting on the wings, not the elbows.',
      'Two skip passes move the ball fully across the floor before the real action starts.',
      'A double flare screen frees the inbounder completely out of the zone\'s sightline.',
      'Screen timing has to match the second skip pass almost exactly.',
      'Screeners should be taught to slip and show themselves if a defender fights over the top.',
    ],
  },

  status: 'published',
}

export const hawk: Preset = {
  slug: 'hawk',
  title: 'Hawk',
  category: 'BLOB 2-3 Zone Offense',
  description:
    'A quick-hitting baseline inbound that seals two zone defenders at once, leaving either a corner three or a short jumper on the block.',
  readMinutes: 3,
  family: { slug: 'hawk', title: 'Hawk' },

  playData: {
    id: 'preset-hawk',
    name: 'Hawk (2)',
    courtType: 'half',
    players: [
      { id: 'o1', number: 1, team: 'offense' },
      { id: 'o2', number: 2, team: 'offense' },
      { id: 'o3', number: 3, team: 'offense' },
      { id: 'o4', number: 4, team: 'offense' },
      { id: 'o5', number: 5, team: 'offense' },
    ],
    // Three players along the free-throw line extended, one in the ball-side corner.
    initialPositions: {
      o1: { x: 0.50, y: 0.02 },
      o2: { x: 0.35, y: 0.34 },
      o4: { x: 0.50, y: 0.34 },
      o5: { x: 0.65, y: 0.34 },
      o3: { x: 0.85, y: 0.20 },
    },
    initialBall: { holderId: 'o1' },
    actions: [
      // 5 cuts down the key, sealing the middle zone defender.
      { id: 'a1', type: 'cut', playerId: 'o5', toPosition: { x: 0.55, y: 0.14 } },
      // 4 walks his defender closer to the basket with a screen.
      { id: 'a2', type: 'screen', screenerId: 'o4', screenPosition: { x: 0.68, y: 0.18 } },
      { id: 'a3', type: 'cut', playerId: 'o2', toPosition: { x: 0.78, y: 0.16 }, waypoints: [{ x: 0.55, y: 0.30 }, { x: 0.68, y: 0.22 }] },
      { id: 'a4', type: 'pass', fromId: 'o1', toId: 'o2' },
      // 1 cuts to the ball-side slot to occupy the point defender.
      { id: 'a5', type: 'cut', playerId: 'o1', toPosition: { x: 0.42, y: 0.20 } },
      { id: 'a6', type: 'shot', shooterId: 'o2' },
    ],
  },

  article: {
    intro:
      'Hawk is a fast, no-frills baseline inbound built to seal two zone defenders at almost the same moment — one shooter ends up open in the corner, and if the zone cheats to stop that, a post player is left with a clean midrange look on the block instead.',
    sections: [
      {
        heading: 'Setting Up',
        paragraphs: [
          'Line up in an irregular shape: three players along the free-throw line extended and one already in the ball-side corner. Put your best three-point shooter at 2, a post who can hit a midrange shot at 4, and your strongest screener at 5.',
        ],
      },
      {
        heading: 'Two Seals at Once',
        paragraphs: [
          'The instant the ball is live, the screener cuts down the middle of the key and seals the zone\'s middle defender, while at the same moment the post walks his own defender closer to the basket with a screening action of his own. Both seals happen together — the timing here is the whole play.',
        ],
      },
      {
        heading: 'The Corner Cut',
        paragraphs: [
          'The shooter cuts to the ball-side corner without ever making it obvious — facing the middle of the floor and even faking a screening motion before breaking to the corner. If both seals have done their job, he\'s open for the catch and the three.',
          'If the bottom wing defender cheats over to deny that corner shot instead, the post player who set the second seal is left open for an easy catch-and-shoot midrange jumper right where he\'s standing.',
        ],
      },
      {
        heading: 'Coaching Points',
        paragraphs: [
          'Timing is everything: both seals need to land at the same instant, and the shooter has to break for the corner immediately once they do.',
          'The shooter should disguise the cut until the last possible moment — squaring up early gives the defense time to recognize where he\'s going.',
          'This is a special-occasion play. Running it on every baseline inbound lets the defense catch on and take away both reads.',
        ],
      },
    ],
    keyTakeaways: [
      'Set up with three players along the free-throw line extended and one already in the corner.',
      'Two simultaneous seals — one on the middle defender, one on the bottom wing defender — are the engine of the play.',
      'The corner three is the primary read if both seals land on time.',
      'A cheating bottom defender leaves the post open for an easy midrange jumper instead.',
      'Save this quick hitter for a specific moment; it loses its edge if overused.',
    ],
  },

  status: 'published',
}

export const sideCrossElevator: Preset = {
  slug: 'side-cross-elevator',
  title: 'Side Cross Elevator',
  category: 'BLOB 2-3 Zone Offense',
  description:
    'A ball-side box inbound that screens both zone wing defenders in sequence, springing the best shooter open in the strong-side corner.',
  readMinutes: 3,
  family: { slug: 'side-cross-elevator', title: 'Side Cross Elevator' },

  playData: {
    id: 'preset-side-cross-elevator',
    name: 'Side Cross Elevator (2)',
    courtType: 'half',
    players: [
      { id: 'o1', number: 1, team: 'offense' },
      { id: 'o2', number: 2, team: 'offense' },
      { id: 'o3', number: 3, team: 'offense' },
      { id: 'o4', number: 4, team: 'offense' },
      { id: 'o5', number: 5, team: 'offense' },
    ],
    // Box pushed toward the ball side; 4 and 5 start outside the zone's wing defenders.
    initialPositions: {
      o1: { x: 0.50, y: 0.02 },
      o5: { x: 0.80, y: 0.30 },
      o4: { x: 0.85, y: 0.44 },
      o2: { x: 0.35, y: 0.30 },
      o3: { x: 0.15, y: 0.16 },
    },
    initialBall: { holderId: 'o1' },
    actions: [
      { id: 'a1', type: 'screen', screenerId: 'o5', screenPosition: { x: 0.70, y: 0.34 } },
      { id: 'a2', type: 'screen', screenerId: 'o4', screenPosition: { x: 0.66, y: 0.20 } },
      { id: 'a3', type: 'cut', playerId: 'o2', toPosition: { x: 0.82, y: 0.16 }, waypoints: [{ x: 0.45, y: 0.28 }, { x: 0.65, y: 0.20 }] },
      { id: 'a4', type: 'pass', fromId: 'o1', toId: 'o2' },
      { id: 'a5', type: 'shot', shooterId: 'o2' },
    ],
  },

  article: {
    intro:
      'Side Cross Elevator is a compact, effective way to spring a shooter open in the strong-side corner by screening a zone\'s two wing defenders one right after the other — the second screener runs directly off the first, elevator-style, without ever telegraphing what\'s coming.',
    sections: [
      {
        heading: 'Setting Up',
        paragraphs: [
          'Push a standard box formation toward the ball side, and start both post players outside the zone\'s two wing defenders rather than in their usual spots. Neither post should face the direction he\'s about to screen — giving that away early is the easiest way to lose the advantage.',
        ],
      },
      {
        heading: 'The Chained Screens',
        paragraphs: [
          'The first post sprints up and sets a screen directly on the top wing defender. The instant that screen lands, the second post runs off his teammate\'s back and sets his own screen on the bottom wing defender — one screen leading straight into the next.',
        ],
      },
      {
        heading: 'The Corner Cut',
        paragraphs: [
          'The shooter watches for the first screen to land, then sprints off the second screener\'s back to the corner, ready to shoot the moment he arrives. The inbounder delivers the pass for the three.',
        ],
      },
      {
        heading: 'Coaching Points',
        paragraphs: [
          'If the top defender ducks under the first screen to jam the shooter\'s path, have the shooter go over the top of it instead and still get to the corner.',
          'If both wing defenders fight over the top of their screens, use the weak-side player as a safety valve, and teach both screeners to slip and show themselves to the inbounder if that happens.',
          'Neither screener should square up toward his assignment before the play starts — that\'s the single easiest way to give this away.',
        ],
      },
    ],
    keyTakeaways: [
      'Push the box toward the ball side, with both posts starting outside the zone\'s wing defenders.',
      'One screen runs directly into the next — the second screener works off the first one\'s back.',
      'The shooter reads the first screen landing before breaking for the corner off the second.',
      'Teach an over-the-top counter for when a defender ducks under the first screen.',
      'Disguise is everything — neither screener should face his target before the play begins.',
    ],
  },

  status: 'published',
}

export const stackZone: Preset = {
  slug: 'stack',
  title: 'Stack',
  category: 'BLOB 2-3 Zone Offense',
  description:
    'A youth-friendly baseline inbound out of a simple stack that clears two low zone defenders to open a gap for a quick midrange shot.',
  readMinutes: 3,
  family: { slug: 'stack', title: 'Stack' },

  playData: {
    id: 'preset-stack',
    name: 'Stack (4)',
    courtType: 'half',
    players: [
      { id: 'o1', number: 1, team: 'offense' },
      { id: 'o2', number: 2, team: 'offense' },
      { id: 'o3', number: 3, team: 'offense' },
      { id: 'o4', number: 4, team: 'offense' },
      { id: 'o5', number: 5, team: 'offense' },
    ],
    // Stack formation on the ball-side edge of the key.
    initialPositions: {
      o1: { x: 0.50, y: 0.02 },
      o2: { x: 0.65, y: 0.16 },
      o5: { x: 0.65, y: 0.24 },
      o4: { x: 0.65, y: 0.32 },
      o3: { x: 0.65, y: 0.40 },
    },
    initialBall: { holderId: 'o1' },
    actions: [
      { id: 'a1', type: 'cut', playerId: 'o2', toPosition: { x: 0.85, y: 0.16 } },
      { id: 'a2', type: 'screen', screenerId: 'o5', screenPosition: { x: 0.50, y: 0.20 } },
      { id: 'a3', type: 'cut', playerId: 'o4', toPosition: { x: 0.50, y: 0.30 } },
      { id: 'a4', type: 'cut', playerId: 'o3', toPosition: { x: 0.50, y: 0.56 } },
      { id: 'a5', type: 'pass', fromId: 'o1', toId: 'o4' },
      { id: 'a6', type: 'shot', shooterId: 'o4' },
    ],
  },

  article: {
    intro:
      'Stack is one of the most common baseline inbounds at the youth level, and for good reason: it clears out two low zone defenders and leaves a simple gap in the middle of the key for a quick midrange shot, without asking anyone to do anything complicated.',
    sections: [
      {
        heading: 'Setting Up',
        paragraphs: [
          'Line everyone up in a simple vertical stack on the ball-side edge of the key. Put your best three-point shooter at the bottom of the stack and a post capable of a short midrange shot one spot above him.',
        ],
      },
      {
        heading: 'Clearing the Gap',
        paragraphs: [
          'The bottom of the stack cuts immediately to the corner, calling loudly for the ball the whole way to drag the low wing defender out with him. At the same time, the middle player of the stack steps toward the middle of the key and screens the zone\'s middle defender.',
          'The top of the stack clears all the way out to the top of the key — both to drag the top defender away and to stay in a safe position defensively.',
        ],
      },
      {
        heading: 'Stepping Into the Gap',
        paragraphs: [
          'With the low wing defender pulled to the corner and the middle defender screened, a clean gap opens in the middle of the key. The remaining post steps into it, hands ready, and catches the pass for an immediate midrange shot — there\'s no time to take a dribble or bring the ball down.',
          'If the low wing defender manages to stay home and cut off that pass instead, the shooter is left open in the corner for the three.',
        ],
      },
      {
        heading: 'Coaching Points',
        paragraphs: [
          'Timing decides everything: the post stepping into the gap has to wait for it to actually open before calling for the ball.',
          'That post needs both hands up and ready the instant he steps in — there isn\'t enough time in this play for a dribble or a low pickup.',
          'The corner cutter must call loudly the entire way; a silent cut doesn\'t drag the defender the way a loud one does.',
        ],
      },
    ],
    keyTakeaways: [
      'Stack everyone vertically on the ball-side edge of the key.',
      'A corner cut and a middle screen work together to open one clean gap.',
      'The post stepping into the gap must be catch-and-shoot ready with no dribble.',
      'A wing defender who stays home to deny the gap pass leaves the shooter open in the corner instead.',
      'This play\'s simplicity is exactly what makes it so reliable at the youth level.',
    ],
  },

  status: 'published',
}
