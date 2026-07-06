import type { Preset } from './types'

// BLOB (baseline out-of-bounds) Man-to-Man presets, one standalone play per
// set (speed-first pass — see project memory 2026-07-06). Tactical reference
// only: basketballforcoaches.com/basketball-plays/ (under "BLOB Man-to-Man
// Basketball Plays"); article text and animations are original.
//
// The inbounder starts just behind the baseline (y just above 0, the court's
// top edge in our coordinate system) holding the ball; play unfolds from
// there exactly like any other preset. Court: half, offense attacks the top
// basket (y≈0.06), coordinates normalized 0–1. Curved cuts use 2+ waypoints
// (a single waypoint is silently ignored by the arrow overlay).

export const fourLowFlex: Preset = {
  slug: '4-low-flex',
  title: '4-Low Flex',
  category: 'BLOB Man-to-Man Offense',
  description:
    'A 4-low baseline inbound that reverses the ball twice before a flex cut and a screen-the-screener pin down produce two clean scoring chances.',
  readMinutes: 4,
  family: { slug: '4-low-flex', title: '4-Low Flex' },

  playData: {
    id: 'preset-4-low-flex',
    name: '4-Low Flex (2)',
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
      o4: { x: 0.35, y: 0.20 },
      o5: { x: 0.20, y: 0.16 },
      o3: { x: 0.65, y: 0.20 },
      o1: { x: 0.85, y: 0.34 },
    },
    initialBall: { holderId: 'o2' },
    actions: [
      // 4 cuts to the top of the key for the inbounds lob.
      { id: 'a1', type: 'cut', playerId: 'o4', toPosition: { x: 0.42, y: 0.56 } },
      { id: 'a2', type: 'pass', fromId: 'o2', toId: 'o4' },
      // 3 waits a beat, then cuts to the top of the key too.
      { id: 'a3', type: 'cut', playerId: 'o3', toPosition: { x: 0.58, y: 0.56 } },
      { id: 'a4', type: 'pass', fromId: 'o4', toId: 'o3' },
      // 2 steps inbounds and sets a flex screen for 5's cut.
      { id: 'a5', type: 'screen', screenerId: 'o2', screenPosition: { x: 0.30, y: 0.14 } },
      { id: 'a6', type: 'cut', playerId: 'o5', toPosition: { x: 0.62, y: 0.16 }, waypoints: [{ x: 0.40, y: 0.12 }, { x: 0.50, y: 0.14 }] },
      // Screen-the-screener: 4 pins down for 2.
      { id: 'a7', type: 'screen', screenerId: 'o4', screenPosition: { x: 0.35, y: 0.30 } },
      { id: 'a8', type: 'cut', playerId: 'o2', toPosition: { x: 0.42, y: 0.56 }, waypoints: [{ x: 0.35, y: 0.34 }, { x: 0.38, y: 0.44 }] },
      { id: 'a9', type: 'pass', fromId: 'o3', toId: 'o2' },
      { id: 'a10', type: 'shot', shooterId: 'o2' },
    ],
  },

  article: {
    intro:
      '4-Low Flex is a baseline inbounds play that hides its real scoring action behind two unhurried ball reversals. By the time the flex screen and the screen-the-screener pin down happen, the defense has already been made to shift twice, and there are two genuine looks waiting.',
    sections: [
      {
        heading: 'Setting Up in 4-Low',
        paragraphs: [
          'Line up in a 4-low shape with both bigs on the ball side. Your best shooter inbounds the ball, and your best post player starts just outside the three-point line on that same side.',
        ],
      },
      {
        heading: 'Two Quiet Reversals',
        paragraphs: [
          'The inbounder throws a lob to the first big cutting to the top of the key. A beat later — the timing matters — the second perimeter player cuts to the top as well and receives the next pass. Two touches, two cuts, and the defense is already shifting before the real action begins.',
        ],
      },
      {
        heading: 'The Flex Screen',
        paragraphs: [
          'As soon as the ball has been reversed, the inbounder steps in from the baseline and sets a flex screen. The remaining big flex-cuts hard off it, looking for the return pass and an open layup right at the rim.',
        ],
      },
      {
        heading: 'Screen the Screener',
        paragraphs: [
          'If the flex cut isn\'t rewarded with a pass, the possession doesn\'t stall — the big who first caught the inbounds lob turns immediately into a pin down for the player who just set the flex screen, sending him back out to the top of the key for a clean catch-and-shoot.',
        ],
      },
      {
        heading: 'Coaching Points',
        paragraphs: [
          'The player making decisions with the ball at the top of the key has to read the floor and hit whoever is actually open, on target and on time — a well-run flex still needs a smart pass to finish it.',
          'Every screen in this play needs to be set with real contact and a wide base; a soft screen at any stage lets the defense recover before the cutter arrives.',
        ],
      },
    ],
    keyTakeaways: [
      'Set up 4-low with both bigs on the ball side and your best shooter inbounding.',
      'Two unhurried reversals get the ball to the top of the key before anything else happens.',
      'The flex screen and cut is the first scoring look, right at the rim.',
      'A screen-the-screener pin down turns the flex screener into a second shooter at the top of the key.',
      'Every screen must be set with real conviction — this play lives and dies on screen quality.',
    ],
  },

  status: 'draft',
}

export const boxGate: Preset = {
  slug: 'box-gate',
  title: 'Box Gate',
  category: 'BLOB Man-to-Man Offense',
  description:
    'A box-set inbound stacking a back screen, a gate screen, and a cross screen — three layers of misdirection that end with the center sealed deep in the post.',
  readMinutes: 4,
  family: { slug: 'box-gate', title: 'Box Gate' },

  playData: {
    id: 'preset-box-gate',
    name: 'Box Gate (5)',
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
      o2: { x: 0.20, y: 0.16 },
      o5: { x: 0.80, y: 0.16 },
      o3: { x: 0.35, y: 0.30 },
      o4: { x: 0.65, y: 0.30 },
    },
    initialBall: { holderId: 'o1' },
    actions: [
      // 2 sets a back screen for 5.
      { id: 'a1', type: 'screen', screenerId: 'o2', screenPosition: { x: 0.68, y: 0.18 } },
      { id: 'a2', type: 'cut', playerId: 'o5', toPosition: { x: 0.50, y: 0.12 } },
      // 3 and 4 form the gate screen at the top of the key.
      {
        id: 'a3',
        type: 'group',
        name: 'Gate screen',
        actions: [
          { id: 'a3a', type: 'screen', screenerId: 'o3', screenPosition: { x: 0.42, y: 0.30 } },
          { id: 'a3b', type: 'screen', screenerId: 'o4', screenPosition: { x: 0.50, y: 0.30 } },
        ],
      },
      { id: 'a4', type: 'cut', playerId: 'o2', toPosition: { x: 0.28, y: 0.42 }, waypoints: [{ x: 0.55, y: 0.28 }, { x: 0.35, y: 0.38 }] },
      { id: 'a5', type: 'pass', fromId: 'o1', toId: 'o2' },
      // 3 and 4 clear to the top of the key.
      {
        id: 'a6',
        type: 'group',
        name: 'Clear out',
        actions: [
          { id: 'a6a', type: 'cut', playerId: 'o3', toPosition: { x: 0.38, y: 0.58 } },
          { id: 'a6b', type: 'cut', playerId: 'o4', toPosition: { x: 0.58, y: 0.58 } },
        ],
      },
      // 1 steps inbounds and sets a cross screen for 5.
      { id: 'a7', type: 'cut', playerId: 'o1', toPosition: { x: 0.50, y: 0.16 } },
      { id: 'a8', type: 'screen', screenerId: 'o1', screenPosition: { x: 0.68, y: 0.18 } },
      { id: 'a9', type: 'cut', playerId: 'o5', toPosition: { x: 0.68, y: 0.14 } },
      { id: 'a10', type: 'pass', fromId: 'o2', toId: 'o5' },
      { id: 'a11', type: 'shot', shooterId: 'o5' },
    ],
  },

  article: {
    intro:
      'Box Gate layers three different screens on top of each other — a back screen, a gate screen, and a cross screen — so that even if the first two reads are covered, the center ends up sealed deep in the post with the ball on its way to him.',
    sections: [
      {
        heading: 'Setting Up in the Box',
        paragraphs: [
          'Start in a box formation. Put your best shooter on the weak-side low block, your best post-up threat on the weak-side elbow, and have the point guard inbound the ball.',
        ],
      },
      {
        heading: 'The Back Screen',
        paragraphs: [
          'The shooter sets a simple back screen for the center, who cuts hard to the rim looking for the ball. This is a genuine first look — the point guard should hit it immediately if the defense is caught flat-footed.',
        ],
      },
      {
        heading: 'The Gate Screen',
        paragraphs: [
          'The instant that back screen is set, the shooter sprints through a gate formed by the two remaining players and pops out to the wing for a catch-and-shoot. The two gate-setters have to time their arrival together — moving too early tips the defense off to what\'s coming.',
        ],
      },
      {
        heading: 'The Cross Screen Finish',
        paragraphs: [
          'After screening, both gate-setters clear out to the top of the key, and the point guard — now empty-handed after the inbounds pass — steps in from the baseline and sets a cross screen. The center uses it to duck in and seal deep position on the ball-side low block for the easy score.',
        ],
      },
      {
        heading: 'Coaching Points',
        paragraphs: [
          'The point guard should be the one to inbound the ball specifically so that the eventual help defender on the cross screen is a smaller player, not a true rim protector.',
          'The gate-setters must arrive at the exact same moment the shooter is ready to sprint through — arriving early or late defeats the purpose of the gate.',
          'Any pass to the shooter coming off a screen should go to his inside shoulder; a pass to the outside makes the catch-and-shoot far harder to execute.',
        ],
      },
    ],
    keyTakeaways: [
      'Set up in a box with the shooter on the weak-side block and the point guard inbounding.',
      'The back screen for the center is a live first option, not just a decoy.',
      'The gate screen requires the two screeners to arrive in perfect sync with the cutter.',
      'The point guard becomes a screener himself after inbounding, setting up the cross-screen finish.',
      'The play is designed to have a real answer at every layer — back screen, gate, then cross screen.',
    ],
  },

  status: 'draft',
}

export const boxFloppyGate: Preset = {
  slug: 'box-floppy-gate',
  title: 'Box Floppy Gate',
  category: 'BLOB Man-to-Man Offense',
  description:
    'A simple, youth-friendly baseline inbound built entirely around one gate screen at the low block for the team\'s best shooter.',
  readMinutes: 3,
  family: { slug: 'box-floppy-gate', title: 'Box Floppy Gate' },

  playData: {
    id: 'preset-box-floppy-gate',
    name: 'Box Floppy Gate (2)',
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
      o4: { x: 0.25, y: 0.16 },
      o3: { x: 0.65, y: 0.30 },
      o1: { x: 0.75, y: 0.44 },
      o5: { x: 0.75, y: 0.16 },
    },
    initialBall: { holderId: 'o2' },
    actions: [
      // 4 steps off the block to receive the inbounds pass.
      { id: 'a1', type: 'cut', playerId: 'o4', toPosition: { x: 0.30, y: 0.30 } },
      { id: 'a2', type: 'pass', fromId: 'o2', toId: 'o4' },
      { id: 'a3', type: 'pass', fromId: 'o4', toId: 'o3' },
      { id: 'a4', type: 'pass', fromId: 'o3', toId: 'o1' },
      // 2 walks his defender into the middle of the key while the ball swings.
      { id: 'a5', type: 'cut', playerId: 'o2', toPosition: { x: 0.42, y: 0.20 } },
      // 4 and 3 form the gate at the low block.
      {
        id: 'a6',
        type: 'group',
        name: 'Gate at the block',
        actions: [
          { id: 'a6a', type: 'screen', screenerId: 'o4', screenPosition: { x: 0.35, y: 0.16 } },
          { id: 'a6b', type: 'screen', screenerId: 'o3', screenPosition: { x: 0.50, y: 0.16 } },
        ],
      },
      { id: 'a7', type: 'cut', playerId: 'o2', toPosition: { x: 0.58, y: 0.30 }, waypoints: [{ x: 0.42, y: 0.14 }, { x: 0.52, y: 0.20 }] },
      { id: 'a8', type: 'pass', fromId: 'o1', toId: 'o2' },
      { id: 'a9', type: 'shot', shooterId: 'o2' },
    ],
  },

  article: {
    intro:
      'Box Floppy Gate strips a baseline inbound down to the essentials: swing the ball around the horn, walk the shooter into the middle of the key, then spring him open with one clean gate screen at the low block. Its simplicity is exactly why it works so well for younger teams.',
    sections: [
      {
        heading: 'Setting Up in the Box',
        paragraphs: [
          'Start in a box formation with your best shooter inbounding the ball. Everything else is basic movement — a low post steps out to receive the first pass, then the ball swings twice more around the perimeter.',
        ],
      },
      {
        heading: 'Walking Into the Gate',
        paragraphs: [
          'While the ball is swinging around the horn, the shooter — who just threw the inbounds pass — walks his own defender into the middle of the key. There\'s no need to rush this part; the goal is just to be in position when the gate forms.',
          'Two teammates then set a gate screen right at the low block, and the shooter sprints through it to get open. A small, legal nudge on the defender just before cutting through helps create separation — teach this carefully so it doesn\'t turn into a pushing foul.',
        ],
      },
      {
        heading: 'The Backup Read',
        paragraphs: [
          'The gate screen is the play\'s primary and most reliable option. Only after you\'ve run this a few times and started to notice defenders cheating the gate should you add the backup single screen on the opposite low block as a second read.',
        ],
      },
      {
        heading: 'Coaching Points',
        paragraphs: [
          'Whoever ends up with the ball at the top of the key is responsible for using a dribble to improve the passing angle before delivering the pass.',
          'This is an excellent play for youth basketball specifically because it only asks players to execute one clean action well, rather than stringing together several complex reads.',
        ],
      },
    ],
    keyTakeaways: [
      'Set up in the box with the best shooter inbounding.',
      'Two simple perimeter passes are all it takes to set the defense before the real action.',
      'The gate screen at the low block is the play\'s one true engine — coach it until it\'s automatic.',
      'A legal, small nudge before cutting through the gate creates real separation.',
      'Add the backup single screen only after the defense starts cheating the primary gate read.',
    ],
  },

  status: 'draft',
}

export const duke: Preset = {
  slug: 'duke',
  title: 'Duke',
  category: 'BLOB Man-to-Man Offense',
  description:
    'A layered baseline inbound with a screen for nearly every perimeter player, finishing in a Ram Screen pick-and-roll with ideal spacing.',
  readMinutes: 5,
  family: { slug: 'duke', title: 'Duke' },

  playData: {
    id: 'preset-duke',
    name: 'Duke (2)',
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
      o3: { x: 0.30, y: 0.16 },
      o4: { x: 0.50, y: 0.16 },
      o5: { x: 0.70, y: 0.16 },
      o1: { x: 0.50, y: 0.40 },
    },
    initialBall: { holderId: 'o2' },
    actions: [
      // 5 screens for 3, who pops to the corner.
      { id: 'a1', type: 'screen', screenerId: 'o5', screenPosition: { x: 0.40, y: 0.20 } },
      { id: 'a2', type: 'cut', playerId: 'o3', toPosition: { x: 0.15, y: 0.20 } },
      { id: 'a3', type: 'pass', fromId: 'o2', toId: 'o3' },
      // A beat later, 4 down screens for 1.
      { id: 'a4', type: 'screen', screenerId: 'o4', screenPosition: { x: 0.42, y: 0.34 } },
      { id: 'a5', type: 'cut', playerId: 'o1', toPosition: { x: 0.50, y: 0.56 } },
      // 4 immediately sets a second screen for 2, cutting in from the inbounds spot.
      { id: 'a6', type: 'screen', screenerId: 'o4', screenPosition: { x: 0.50, y: 0.20 } },
      { id: 'a7', type: 'cut', playerId: 'o2', toPosition: { x: 0.65, y: 0.34 } },
      { id: 'a8', type: 'pass', fromId: 'o3', toId: 'o1' },
      { id: 'a9', type: 'pass', fromId: 'o1', toId: 'o2' },
      // 4 sets the final Ram Screen, freeing 2 to attack the rim.
      { id: 'a10', type: 'screen', screenerId: 'o4', screenPosition: { x: 0.60, y: 0.20 } },
      { id: 'a11', type: 'screen', screenerId: 'o5', screenPosition: { x: 0.60, y: 0.32 } },
      { id: 'a12', type: 'dribble', playerId: 'o2', toPosition: { x: 0.50, y: 0.14 }, waypoints: [{ x: 0.60, y: 0.28 }, { x: 0.54, y: 0.18 }] },
      { id: 'a13', type: 'shot', shooterId: 'o2' },
    ],
  },

  article: {
    intro:
      'Duke keeps the ball moving through a chain of screens for almost every perimeter player before it ever settles, finishing with the signature Ram Screen — a screen set on the roll man\'s own defender that leaves the ball handler with a completely unguarded driving lane.',
    sections: [
      {
        heading: 'Setting Up',
        paragraphs: [
          'Line up with one player at the free-throw line and three lined up on and between the low blocks; the inbounder stands out of bounds under the basket. This play works best when three different players — 1, 2, and 3 — can all hit an open outside shot, so any early look should be taken if it\'s there.',
        ],
      },
      {
        heading: 'Screens for Everyone',
        paragraphs: [
          'The center opens the play by screening for the low corner player, who pops to the corner for the first live catch. A beat later — timing matters here — the best screener sets a down screen for the free-throw-line player, sending him to the top of the key, then immediately turns and sets a second screen for the inbounder himself, who cuts in from the baseline to the wing.',
          'By now the ball has swung from the corner to the top of the key and out to the wing — three different players have each been screened open in sequence.',
        ],
      },
      {
        heading: 'The Ram Screen',
        paragraphs: [
          'Once the wing player has the ball, the screener sets one final cross screen — this time for the post player. From there, the post has a real choice: post up on the low block for a quick pass and score, or sprint up and set a screen directly on the wing defender.',
          'That second option is the Ram Screen, and it\'s what makes Duke dangerous. Because the post\'s own defender was just used to screen him, that defender is trailing the play and can\'t help on the screen — leaving the wing player with a clean driving lane and a post defender closing out late.',
        ],
      },
      {
        heading: 'Coaching Points',
        paragraphs: [
          'Every player coming off a screen in this play should be thinking catch-and-shoot first — with this many screens running, someone is reliably open.',
          'The Ram Screen only works because of the defender who gets used up screening the post — teach the post player to sprint into that final screen with real pace, not a jog.',
        ],
      },
    ],
    keyTakeaways: [
      'Duke chains four separate screens together before the ball ever stops moving.',
      'Take any of the first three catch-and-shoot looks if the defense gives it to you.',
      'The final action — the Ram Screen — uses the post defender\'s own screening assignment against him.',
      'The Ram Screen leaves the ball handler a clean driving lane with no one able to help.',
      'Every player should be shot-ready on the catch; this play is built to produce an open look somewhere.',
    ],
  },

  status: 'draft',
}

export const ramRed: Preset = {
  slug: 'ram-red',
  title: 'Ram Red',
  category: 'BLOB Man-to-Man Offense',
  description:
    'A box-set inbound with a double-screen curl, a staggered re-screen, and a screen-the-screener pick-and-roll for the point guard as the ultimate release valve.',
  readMinutes: 5,
  family: { slug: 'ram-red', title: 'Ram Red' },

  playData: {
    id: 'preset-ram-red',
    name: 'Ram Red (1)',
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
      o2: { x: 0.35, y: 0.30 },
      o5: { x: 0.65, y: 0.16 },
      o4: { x: 0.35, y: 0.16 },
      o3: { x: 0.75, y: 0.34 },
    },
    initialBall: { holderId: 'o1' },
    actions: [
      // 5 slides to the high post; 4 joins to form a double screen.
      { id: 'a1', type: 'screen', screenerId: 'o5', screenPosition: { x: 0.58, y: 0.34 } },
      { id: 'a2', type: 'screen', screenerId: 'o4', screenPosition: { x: 0.46, y: 0.34 } },
      { id: 'a3', type: 'cut', playerId: 'o2', toPosition: { x: 0.75, y: 0.30 }, waypoints: [{ x: 0.40, y: 0.20 }, { x: 0.55, y: 0.24 }] },
      // 3 steps toward the rim, then pops back out calling for the ball.
      { id: 'a4', type: 'cut', playerId: 'o3', toPosition: { x: 0.80, y: 0.34 }, waypoints: [{ x: 0.72, y: 0.20 }, { x: 0.76, y: 0.28 }] },
      // Nothing open — 1 inbounds to 2.
      { id: 'a5', type: 'pass', fromId: 'o1', toId: 'o2' },
      // Staggered down screen sends 1 to the top of the key.
      { id: 'a6', type: 'screen', screenerId: 'o4', screenPosition: { x: 0.42, y: 0.44 } },
      { id: 'a7', type: 'screen', screenerId: 'o5', screenPosition: { x: 0.50, y: 0.40 } },
      { id: 'a8', type: 'cut', playerId: 'o1', toPosition: { x: 0.50, y: 0.58 }, waypoints: [{ x: 0.46, y: 0.48 }] },
      { id: 'a9', type: 'dribble', playerId: 'o2', toPosition: { x: 0.65, y: 0.28 } },
      { id: 'a10', type: 'pass', fromId: 'o2', toId: 'o1' },
      // Screen the screener: 4 screens 5's defender, then 5 sprints up to screen for 1.
      { id: 'a11', type: 'screen', screenerId: 'o4', screenPosition: { x: 0.58, y: 0.36 } },
      { id: 'a12', type: 'screen', screenerId: 'o5', screenPosition: { x: 0.50, y: 0.50 } },
      { id: 'a13', type: 'cut', playerId: 'o4', toPosition: { x: 0.30, y: 0.16 } },
      { id: 'a14', type: 'dribble', playerId: 'o1', toPosition: { x: 0.50, y: 0.16 }, waypoints: [{ x: 0.50, y: 0.46 }] },
      { id: 'a15', type: 'shot', shooterId: 'o1' },
    ],
  },

  article: {
    intro:
      'Ram Red gives a box-set inbound three genuine scoring layers, each one a fallback for the last: a tight curl off a double screen, a post duck-in, and — if neither is there — a screen-the-screener pick-and-roll for the point guard with spacing that\'s almost impossible to defend well.',
    sections: [
      {
        heading: 'Setting Up in the Box',
        paragraphs: [
          'Start in a box formation with your best shooter on the weak-side elbow, and have your best pick-and-roll ball handler inbound the ball. The post player you want to eventually screen the pick should start on the ball-side low block.',
        ],
      },
      {
        heading: 'The Double-Screen Curl',
        paragraphs: [
          'One big slides up to the high post and the other joins him there, forming a double screen. The shooter curls tightly off both of them, looking for a catch-and-shoot on the wing — and if his defender helps too far off the roll man, that roll man ducks straight to the rim for a layup instead.',
          'At the same time, the third perimeter player takes a couple of steps toward the rim and pops back out calling for the ball — a small movement whose only job is to keep his own defender occupied and out of the paint.',
        ],
      },
      {
        heading: 'Resetting Through a Staggered Screen',
        paragraphs: [
          'If nothing is open right away, the inbounder simply passes to the shooter and the whole shape resets: both bigs set a staggered down screen — spaced apart on purpose, not stacked together — for the point guard, who pops out to the top of the key to reset the offense.',
        ],
      },
      {
        heading: 'Screen the Screener',
        paragraphs: [
          'This is where Ram Red earns its name. Once the point guard has the ball back at the top, one big screens the other big\'s defender, freeing that second big to sprint up and set the real ball screen for the point guard. Because that screener\'s own defender just got hung up, there\'s no one left to hedge or trap the pick-and-roll.',
          'With ideal spacing on both wings, the point guard attacks the rim off a completely clean screen, reading the help defense to either finish or find an open shooter.',
        ],
      },
      {
        heading: 'Coaching Points',
        paragraphs: [
          'The whole point of screening the screener is to remove any possibility of the defense hedging or trapping the final pick-and-roll — that\'s worth extra practice reps on its own.',
          'The point guard should try to catch the reset pass in the ball-side slot rather than dead center, since that gives noticeably more room to operate off the final screen.',
          'Every screen in this play must be set and held — a lazy screen anywhere in the chain lets a defender fight through and recover in time to help.',
        ],
      },
    ],
    keyTakeaways: [
      'Set up in the box with the shooter on the weak-side elbow and the P&R ball handler inbounding.',
      'The double-screen curl is the first read, with a post duck-in as its built-in backup.',
      'A staggered screen resets the offense cleanly if the first action is covered.',
      'Screening the screener\'s defender is what removes any possible hedge or trap on the final pick-and-roll.',
      'Demand strong, held screens throughout — this play depends on it more than most.',
    ],
  },

  status: 'draft',
}

export const stackDouble: Preset = {
  slug: 'stack-double',
  title: 'Stack Double',
  category: 'BLOB Man-to-Man Offense',
  description:
    'A stack-formation inbound that clears out the baseline before a staggered screen frees the shooter on the wing for a midrange or three-point look.',
  readMinutes: 4,
  family: { slug: 'stack-double', title: 'Stack Double' },

  playData: {
    id: 'preset-stack-double',
    name: 'Stack Double (1)',
    courtType: 'half',
    players: [
      { id: 'o1', number: 1, team: 'offense' },
      { id: 'o2', number: 2, team: 'offense' },
      { id: 'o3', number: 3, team: 'offense' },
      { id: 'o4', number: 4, team: 'offense' },
      { id: 'o5', number: 5, team: 'offense' },
    ],
    initialPositions: {
      o1: { x: 0.30, y: 0.30 },
      o2: { x: 0.72, y: 0.16 },
      o5: { x: 0.68, y: 0.24 },
      o4: { x: 0.65, y: 0.32 },
      o3: { x: 0.62, y: 0.02 },
    },
    initialBall: { holderId: 'o3' },
    actions: [
      { id: 'a1', type: 'cut', playerId: 'o4', toPosition: { x: 0.75, y: 0.44 } },
      { id: 'a2', type: 'pass', fromId: 'o3', toId: 'o4' },
      // 2 drags his defender lower, calling for the ball as a decoy.
      { id: 'a3', type: 'cut', playerId: 'o2', toPosition: { x: 0.72, y: 0.10 } },
      // 3 sprints the baseline and clears to the weak-side wing.
      { id: 'a4', type: 'cut', playerId: 'o3', toPosition: { x: 0.15, y: 0.34 }, waypoints: [{ x: 0.40, y: 0.05 }, { x: 0.20, y: 0.18 }] },
      { id: 'a5', type: 'cut', playerId: 'o1', toPosition: { x: 0.50, y: 0.56 } },
      { id: 'a6', type: 'pass', fromId: 'o4', toId: 'o1' },
      // 1 fake-dribbles the opposite way to open the passing lane to 2.
      { id: 'a7', type: 'dribble', playerId: 'o1', toPosition: { x: 0.38, y: 0.56 } },
      {
        id: 'a8',
        type: 'group',
        name: 'Staggered screen',
        actions: [
          { id: 'a8a', type: 'screen', screenerId: 'o4', screenPosition: { x: 0.60, y: 0.28 } },
          { id: 'a8b', type: 'screen', screenerId: 'o5', screenPosition: { x: 0.68, y: 0.22 } },
        ],
      },
      { id: 'a9', type: 'cut', playerId: 'o2', toPosition: { x: 0.80, y: 0.34 }, waypoints: [{ x: 0.65, y: 0.20 }, { x: 0.75, y: 0.26 }] },
      { id: 'a10', type: 'pass', fromId: 'o1', toId: 'o2' },
      { id: 'a11', type: 'shot', shooterId: 'o2' },
    ],
  },

  article: {
    intro:
      'Stack Double takes the common stack inbound formation and uses it to sell one thing while setting up another: a low decoy call for the ball, a full baseline clear-out, and a fake dribble — all to hide a staggered screen that frees the shooter cleanly on the wing.',
    sections: [
      {
        heading: 'Setting Up in the Stack',
        paragraphs: [
          'Everyone but the point guard lines up in a vertical stack to one side of the lane; the point guard starts alone on the weak-side elbow. Put your best shooter at the bottom of the stack, closest to the block.',
        ],
      },
      {
        heading: 'Selling the Decoy',
        paragraphs: [
          'The play opens with the top of the stack popping out to the perimeter to receive the inbounds pass. At the same moment, the shooter at the bottom of the stack takes a couple of steps toward the hoop and calls for the ball — a pure decoy meant to drag his defender down and away from where the real action will happen.',
          'The inbounder then sprints the length of the baseline and clears all the way out to the weak-side wing, completely emptying that side of the floor.',
        ],
      },
      {
        heading: 'The Fake and the Staggered Screen',
        paragraphs: [
          'The point guard cuts to the top of the key, catches the ball, and immediately takes a dribble in the opposite direction from where the shooter will come open — selling a fake that gets defenders moving toward the middle of the floor.',
          'While that\'s happening, the two remaining post players set a staggered screen for the shooter, who reads his defender\'s path and cuts out to the wing for the catch — a clean midrange or three-point look depending on his range.',
        ],
      },
      {
        heading: 'Coaching Points',
        paragraphs: [
          'The point guard\'s fake dribble toward the emptied side of the floor has to be sold convincingly — a half-hearted fake won\'t actually move the defenders.',
          'No player should face the direction they\'re about to cut at the start of the play; squaring up early gives away the whole design before it even begins.',
        ],
      },
    ],
    keyTakeaways: [
      'Stack everyone but the point guard to one side; he starts alone on the weak-side elbow.',
      'The bottom-of-stack shooter\'s call for the ball early on is a decoy, not a real option.',
      'A full baseline clear-out by the inbounder empties the floor for what follows.',
      'The point guard\'s fake dribble the opposite way is what actually opens the passing lane.',
      'A staggered screen is the mechanism that frees the shooter — coach it like the play\'s real engine.',
    ],
  },

  status: 'draft',
}

export const twoInside: Preset = {
  slug: 'two-inside',
  title: 'Two Inside',
  category: 'BLOB Man-to-Man Offense',
  description:
    'A box-set inbound built purely to get the ball to a post player inside, using two decoy guard cuts and a screen-the-screener action to clear the lane.',
  readMinutes: 3,
  family: { slug: 'two-inside', title: 'Two Inside' },

  playData: {
    id: 'preset-two-inside',
    name: 'Two Inside (2)',
    courtType: 'half',
    players: [
      { id: 'o1', number: 1, team: 'offense' },
      { id: 'o2', number: 2, team: 'offense' },
      { id: 'o3', number: 3, team: 'offense' },
      { id: 'o4', number: 4, team: 'offense' },
      { id: 'o5', number: 5, team: 'offense' },
    ],
    initialPositions: {
      o3: { x: 0.50, y: 0.02 },
      o4: { x: 0.35, y: 0.16 },
      o5: { x: 0.65, y: 0.16 },
      o1: { x: 0.35, y: 0.34 },
      o2: { x: 0.65, y: 0.34 },
    },
    initialBall: { holderId: 'o3' },
    actions: [
      // 4 sets an up-screen for 1, who pops to the corner.
      { id: 'a1', type: 'screen', screenerId: 'o4', screenPosition: { x: 0.35, y: 0.24 } },
      { id: 'a2', type: 'cut', playerId: 'o1', toPosition: { x: 0.15, y: 0.18 } },
      // 2 cuts to the ball-side slot, calling for the ball to occupy his man.
      { id: 'a3', type: 'cut', playerId: 'o2', toPosition: { x: 0.50, y: 0.30 } },
      // 5 waits, then cuts across the lane to screen 4's defender.
      { id: 'a4', type: 'screen', screenerId: 'o5', screenPosition: { x: 0.30, y: 0.18 } },
      // Screen the screener: 4 cuts to the weak side of the rim.
      { id: 'a5', type: 'cut', playerId: 'o4', toPosition: { x: 0.62, y: 0.12 } },
      { id: 'a6', type: 'pass', fromId: 'o3', toId: 'o4' },
      { id: 'a7', type: 'shot', shooterId: 'o4' },
    ],
  },

  article: {
    intro:
      'Two Inside has one job: get the basketball to a post player with a size advantage, right at the rim. The two guards never touch the ball at all — they simply move to keep their own defenders busy while a screen-the-screener action clears a lane for the post.',
    sections: [
      {
        heading: 'Setting Up in the Box',
        paragraphs: [
          'Line up in a box with both posts down low and both guards at the high post elbows. This play is at its best with a genuine size mismatch inside, so save it for whenever one of your bigs has a real height advantage.',
        ],
      },
      {
        heading: 'Two Decoy Cuts',
        paragraphs: [
          'One post sets an up-screen for a guard, who pops out to the corner — occupying his defender out on the perimeter. At the same time, the other guard cuts to the ball-side slot, calling for the ball even though he won\'t receive it. Both of these cuts exist purely to drag defenders out of the paint.',
        ],
      },
      {
        heading: 'Screen the Screener',
        paragraphs: [
          'The second post waits a beat, facing the guard in the slot so the coming action isn\'t telegraphed, then cuts hard across the lane to set a strong screen on the first post\'s defender. That screen is what frees the first post to cut to the weak side of the rim, completely clear for the pass and the layup.',
        ],
      },
      {
        heading: 'Coaching Points',
        paragraphs: [
          'Both guards need to call for the ball on their cuts even knowing they won\'t get it — a silent decoy cut doesn\'t drag the defense the same way a loud one does.',
          'The screener has to start by looking toward the guard in the slot, not the post he\'s about to screen for — otherwise the defense reads the screen-the-screener action before it happens.',
        ],
      },
    ],
    keyTakeaways: [
      'Set up in the box with both posts low and both guards at the elbows.',
      'This play is built for a real size mismatch — save it for that matchup.',
      'Both guards\' cuts are pure decoys meant to occupy their defenders.',
      'The screen-the-screener action is the entire engine of the play — it\'s what actually frees the post.',
      'The screener must disguise his intentions by looking away from his real target until the last moment.',
    ],
  },

  status: 'draft',
}
