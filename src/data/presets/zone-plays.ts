import type { Preset } from './types'

// 2-3 Zone Offense presets, one standalone play per set (speed-first pass —
// see project memory 2026-07-06: one variant per remaining set, refined
// later in the editor). Tactical reference only:
// basketballforcoaches.com/basketball-plays/ (under "2-3 Zone Basketball
// Plays"); article text and animations are original.
//
// These attack a zone rather than a specific defender, so only offensive
// players are modeled — the same convention as the man-to-man presets.
// Court: half, offense attacks the top basket (y≈0.06), coordinates
// normalized 0–1. Every cut curves using 2+ waypoints.

export const flare23: Preset = {
  slug: '23-flare',
  title: '23 Flare',
  category: '2-3 Zone Offense',
  description:
    'A quick hitter against a 2-3 zone that ball-reverses twice before springing the best shooter open on a flare screen at the top.',
  readMinutes: 4,
  family: { slug: '23-flare', title: '23 Flare' },

  playData: {
    id: 'preset-23-flare',
    name: '23 Flare (2)',
    courtType: 'half',
    players: [
      { id: 'o1', number: 1, team: 'offense' },
      { id: 'o2', number: 2, team: 'offense' },
      { id: 'o3', number: 3, team: 'offense' },
      { id: 'o4', number: 4, team: 'offense' },
      { id: 'o5', number: 5, team: 'offense' },
    ],
    // 1-3-1: 1 up top with the ball, 5 at the high post, 3 on the weak wing,
    // 2 on the strong wing (best shooter), 4 in the corner on 2's side.
    initialPositions: {
      o1: { x: 0.50, y: 0.66 },
      o2: { x: 0.72, y: 0.44 },
      o3: { x: 0.15, y: 0.30 },
      o4: { x: 0.85, y: 0.18 },
      o5: { x: 0.50, y: 0.40 },
    },
    initialBall: { holderId: 'o1' },
    actions: [
      { id: 'a1', type: 'dribble', playerId: 'o1', toPosition: { x: 0.44, y: 0.62 } },
      { id: 'a2', type: 'pass', fromId: 'o1', toId: 'o2' },
      // 5 steps to the strong-side elbow.
      { id: 'a3', type: 'cut', playerId: 'o5', toPosition: { x: 0.62, y: 0.38 } },
      { id: 'a4', type: 'pass', fromId: 'o2', toId: 'o4' },
      { id: 'a5', type: 'pass', fromId: 'o4', toId: 'o2' },
      // 4 walks his defender toward the rim and pins him there.
      { id: 'a6', type: 'screen', screenerId: 'o4', screenPosition: { x: 0.66, y: 0.14 } },
      // 2 dribbles at the top to drag his defender up and away.
      { id: 'a7', type: 'dribble', playerId: 'o2', toPosition: { x: 0.58, y: 0.56 } },
      { id: 'a8', type: 'pass', fromId: 'o2', toId: 'o1' },
      // 5 flares quickly off the ball to spring 2 open.
      { id: 'a9', type: 'screen', screenerId: 'o5', screenPosition: { x: 0.58, y: 0.48 } },
      { id: 'a10', type: 'cut', playerId: 'o2', toPosition: { x: 0.78, y: 0.42 }, waypoints: [{ x: 0.50, y: 0.50 }] },
      { id: 'a11', type: 'pass', fromId: 'o1', toId: 'o2' },
      { id: 'a12', type: 'shot', shooterId: 'o2' },
    ],
  },

  article: {
    intro:
      '23 Flare is a quick hitter built to spring a team\'s best shooter loose against a 2-3 zone using nothing but ball reversals and a well-timed flare screen. It only takes a few passes, which is exactly the point — it is meant to catch a zone off guard before it has fully organized.',
    sections: [
      {
        heading: 'Setting Up in 1-3-1',
        paragraphs: [
          'Line up in a 1-3-1 shape with your best shooter on the wing and a shooting threat in the corner on that same side. The point guard takes a few dribbles and enters the ball to that wing, then stays put at the top of the key.',
        ],
      },
      {
        heading: 'Moving the Zone with Reversals',
        paragraphs: [
          'The high post steps to the strong-side elbow as the wing swings the ball down to the corner and immediately gets it back — two quick touches that force the zone to shift and collapse toward the ball.',
          'The corner player, once the ball has left his hands, starts walking his defender toward the rim and pins him there — quietly taking a help defender out of the play before the real action even starts.',
        ],
      },
      {
        heading: 'The Flare Screen',
        paragraphs: [
          'The wing takes two or three hard dribbles back toward the top of the key, forcing his defender to follow and deny a direct shot. The instant he passes back to the point guard, the elbow player flares a screen — set quickly, so the defender is caught off guard — and the wing shooter flares away from it to the top for a clean look.',
          'The point guard delivers the pass over the top of the flare screen for the open three.',
        ],
      },
      {
        heading: 'Coaching Points',
        paragraphs: [
          'The flare screen has to be set fast — any hesitation and the defender sees it coming and fights through early.',
          'This is a one-or-twice-a-game play. Save it for a moment when you genuinely need a clean three-point look, not as a base offense.',
        ],
      },
    ],
    keyTakeaways: [
      'Set up in 1-3-1 with the best shooter and a corner threat on the same side.',
      'Two quick ball reversals collapse the zone toward the ball before the real action starts.',
      'The corner player quietly walks his defender to the rim to remove a help option.',
      'A fast flare screen sends the shooter away from the ball for an open catch at the top.',
      'Use this sparingly — it only works because the defense hasn\'t seen it before.',
    ],
  },

  status: 'published',
}

export const lob32: Preset = {
  slug: '32-lob',
  title: '32 Lob',
  category: '2-3 Zone Offense',
  description:
    'A 3-out 2-in zone attack that hides a backdoor lob behind ball reversals, screening the weak-side low defender to spring an athletic finisher.',
  readMinutes: 4,
  family: { slug: '32-lob', title: '32 Lob' },

  playData: {
    id: 'preset-32-lob',
    name: '32 Lob (3)',
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
      o2: { x: 0.80, y: 0.34 },
      o3: { x: 0.20, y: 0.34 },
      o4: { x: 0.35, y: 0.20 },
      o5: { x: 0.65, y: 0.20 },
    },
    initialBall: { holderId: 'o1' },
    actions: [
      { id: 'a1', type: 'pass', fromId: 'o1', toId: 'o2' },
      // 2 dribbles to the corner to drag his defender with him.
      { id: 'a2', type: 'dribble', playerId: 'o2', toPosition: { x: 0.85, y: 0.18 } },
      // 3 slides to the weak-side corner behind the defense's sightline.
      { id: 'a3', type: 'cut', playerId: 'o3', toPosition: { x: 0.12, y: 0.16 } },
      { id: 'a4', type: 'pass', fromId: 'o2', toId: 'o1' },
      // 5 establishes position behind the low defender and nudges him up.
      { id: 'a5', type: 'screen', screenerId: 'o5', screenPosition: { x: 0.60, y: 0.16 } },
      // 3 cuts hard behind the screen for the lob.
      { id: 'a6', type: 'cut', playerId: 'o3', toPosition: { x: 0.56, y: 0.10 }, waypoints: [{ x: 0.30, y: 0.12 }, { x: 0.42, y: 0.08 }] },
      { id: 'a7', type: 'pass', fromId: 'o1', toId: 'o3' },
      { id: 'a8', type: 'shot', shooterId: 'o3' },
    ],
  },

  article: {
    intro:
      '32 Lob is designed for one moment: an athletic perimeter player catching a backdoor lob and finishing above the rim. Everything before that — the dribble to the corner, the slide to the weak side, the post nudging his defender up the lane — exists purely to set up that one pass.',
    sections: [
      {
        heading: 'Setting Up in 3-Out 2-In',
        paragraphs: [
          'Start in a 3-out 2-in shape. Your best passer runs the point, and the player who will finish the lob starts on the perimeter, away from the ball. Everything opens with a simple entry pass to the other perimeter player.',
        ],
      },
      {
        heading: 'Hiding the Cutter',
        paragraphs: [
          'The player who received the entry pass dribbles toward the corner, dragging his defender with him and forcing the zone to shift. While that\'s happening, the eventual lob-catcher slides down to the weak-side corner — directly behind the defense\'s sightline, where nobody is watching him.',
          'The ball comes right back out to the point guard, who now has a clean look at the whole floor.',
        ],
      },
      {
        heading: 'The Screen and the Lob',
        paragraphs: [
          'With the defense rotated to one side, the post player establishes position behind the low defender on the ball side and nudges him up the lane — opening a clean driving and passing lane along the baseline.',
          'The cutter explodes from the weak-side corner, running the baseline behind that screen, and the point guard delivers the lob for the finish at the rim.',
        ],
      },
      {
        heading: 'Coaching Points',
        paragraphs: [
          'This play is built on surprise — don\'t call it more than once or twice a game, or the defense will start anticipating the cutter\'s path.',
          'A well-thrown lob is a crowd-pleaser. If you have a player who can finish above the rim, this is a great way to shift momentum in a game.',
        ],
      },
    ],
    keyTakeaways: [
      'Start 3-out 2-in with the lob finisher away from the ball.',
      'A dribble to the corner and a return pass rotate the zone to one side.',
      'The weak-side cutter slides to the corner unseen while the zone shifts.',
      'The post nudges the low defender up the lane to clear the baseline.',
      'Save this play for one or two surprise chances per game.',
    ],
  },

  status: 'published',
}

export const baselineSwing: Preset = {
  slug: 'baseline-swing',
  title: 'Baseline Swing',
  category: '2-3 Zone Offense',
  description:
    'A 4-out 1-in zone play that swings the ball fully across the floor before cutting the shooter baseline into the space the swing creates.',
  readMinutes: 4,
  family: { slug: 'baseline-swing', title: 'Baseline Swing' },

  playData: {
    id: 'preset-baseline-swing',
    name: 'Baseline Swing (4)',
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
      o2: { x: 0.15, y: 0.34 },
      o3: { x: 0.82, y: 0.34 },
      o4: { x: 0.88, y: 0.16 },
      o5: { x: 0.50, y: 0.40 },
    },
    initialBall: { holderId: 'o1' },
    actions: [
      { id: 'a1', type: 'pass', fromId: 'o1', toId: 'o3' },
      { id: 'a2', type: 'pass', fromId: 'o3', toId: 'o1' },
      // 2 slides up to open a lane for 3's baseline cut.
      { id: 'a3', type: 'cut', playerId: 'o2', toPosition: { x: 0.30, y: 0.40 } },
      // 3 cuts all the way across under the zone's high defenders.
      { id: 'a4', type: 'cut', playerId: 'o3', toPosition: { x: 0.15, y: 0.30 }, waypoints: [{ x: 0.50, y: 0.14 }, { x: 0.30, y: 0.20 }] },
      { id: 'a5', type: 'pass', fromId: 'o1', toId: 'o2' },
      { id: 'a6', type: 'pass', fromId: 'o2', toId: 'o3' },
      // 5 quietly screens for the corner shooter's baseline cut.
      { id: 'a7', type: 'screen', screenerId: 'o5', screenPosition: { x: 0.60, y: 0.18 } },
      { id: 'a8', type: 'cut', playerId: 'o4', toPosition: { x: 0.65, y: 0.14 }, waypoints: [{ x: 0.85, y: 0.14 }] },
      { id: 'a9', type: 'pass', fromId: 'o3', toId: 'o4' },
      { id: 'a10', type: 'shot', shooterId: 'o4' },
    ],
  },

  article: {
    intro:
      'Baseline Swing methodically reverses the ball from one side of the floor to the other, then uses the defensive rotation that reversal creates to spring a shooter open on the baseline for a clean midrange or three-point look.',
    sections: [
      {
        heading: 'Setting Up in 4-Out 1-In',
        paragraphs: [
          'Start in a 4-out 1-in alignment with your shooter in the corner. The point guard opens the play with a pass to the wing on that same side, then immediately gets it back.',
        ],
      },
      {
        heading: 'Clearing a Lane with the Cross-Court Cut',
        paragraphs: [
          'As the ball comes back to the point guard, the far wing slides up a step to open space, and the wing who just passed cuts all the way across the floor, running underneath the zone\'s high defenders to the opposite wing.',
          'This cross-court cut forces a defender who started the possession guarding the top of the floor to close out and pick him up on the far side — a rotation that is the whole key to the play.',
        ],
      },
      {
        heading: 'The Baseline Cut',
        paragraphs: [
          'With the ball swinging from the point guard to the far wing and finally to the cutter who just arrived, the low post quietly screens the baseline defender — without ever telegraphing it, so the defense doesn\'t fight through early.',
          'The corner shooter cuts hard and fast along the baseline behind that screen, catching the ball in the wide open space the reversal just created for a midrange or three-point shot.',
        ],
      },
      {
        heading: 'Coaching Points',
        paragraphs: [
          'The screener must not tip off the screen — a defender who sees it coming will fight through early and still contest the shot.',
          'The baseline cutter needs to move hard and quickly; a lazy cut gives the defense time to recover position before the catch.',
          'If you plan to run this regularly, make sure the shooter reps this specific catch-and-shoot in practice — it\'s a different rhythm than a standard spot-up.',
        ],
      },
    ],
    keyTakeaways: [
      'Set up 4-out 1-in with the shooter starting in the corner.',
      'A pass-and-return to the wing sets the reversal in motion.',
      'A full cross-court cut forces the defense to rotate and close out late.',
      'A quiet, well-timed screen frees the corner shooter for a hard baseline cut.',
      'The shot comes off the reversal\'s timing, so rep the catch-and-shoot specifically in practice.',
    ],
  },

  status: 'published',
}

export const doublesZone: Preset = {
  slug: 'doubles',
  title: 'Doubles',
  category: '2-3 Zone Offense',
  description:
    'A 1-4 quick hitter that moves the zone with one pass-and-return, then springs the best shooter open on a double screen behind the defense.',
  readMinutes: 3,
  family: { slug: 'doubles', title: 'Doubles' },

  playData: {
    id: 'preset-doubles',
    name: 'Doubles (2)',
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
      o2: { x: 0.82, y: 0.34 },
      o3: { x: 0.35, y: 0.20 },
      o4: { x: 0.65, y: 0.20 },
      o5: { x: 0.15, y: 0.34 },
    },
    initialBall: { holderId: 'o1' },
    actions: [
      { id: 'a1', type: 'pass', fromId: 'o1', toId: 'o2' },
      { id: 'a2', type: 'pass', fromId: 'o2', toId: 'o1' },
      // 1 dribbles across the top for a better passing angle as 2 cuts.
      { id: 'a3', type: 'dribble', playerId: 'o1', toPosition: { x: 0.42, y: 0.60 } },
      {
        id: 'a4',
        type: 'group',
        name: 'Double screen',
        actions: [
          { id: 'a4a', type: 'screen', screenerId: 'o3', screenPosition: { x: 0.28, y: 0.22 } },
          { id: 'a4b', type: 'screen', screenerId: 'o4', screenPosition: { x: 0.36, y: 0.16 } },
        ],
      },
      { id: 'a5', type: 'cut', playerId: 'o2', toPosition: { x: 0.18, y: 0.14 }, waypoints: [{ x: 0.55, y: 0.20 }, { x: 0.34, y: 0.20 }] },
      { id: 'a6', type: 'pass', fromId: 'o1', toId: 'o2' },
      { id: 'a7', type: 'shot', shooterId: 'o2' },
    ],
  },

  article: {
    intro:
      'Doubles is one of the simplest quick hitters against a zone: one pass-and-return to shift the defense, one deep cut behind it, and a double screen to guarantee the team\'s best shooter comes open. It asks almost nothing of the other three players beyond setting a good screen.',
    sections: [
      {
        heading: 'Setting Up in 1-4',
        paragraphs: [
          'Begin in a 1-4 formation with your best shooter on the wing. The point guard starts the play with a simple pass to that shooter, who immediately gives it right back.',
        ],
      },
      {
        heading: 'The Deep Cut and Double Screen',
        paragraphs: [
          'As soon as the ball is back with the point guard, the shooter makes a deep cut behind the defense toward the opposite side of the floor. At the same moment, the two post players come together to set a double screen on the low defender guarding that space.',
          'The point guard dribbles across the top of the key while this happens — not to attack, but to open a better passing angle to wherever the shooter comes open.',
        ],
      },
      {
        heading: 'The Finish',
        paragraphs: [
          'With a double screen taking one defender out of the play entirely, the shooter is reliably open by the time he clears it. The point guard delivers the pass for a clean midrange or three-point shot, depending on the shooter\'s range and the team\'s age and skill level.',
        ],
      },
      {
        heading: 'Coaching Points',
        paragraphs: [
          'This play works equally well run to either side of the floor — mirror it based on where your best shooter is spaced.',
          'The exact timing of the point guard\'s pass matters more than anything else here; too early and the shooter hasn\'t cleared the screen, too late and the defense has recovered.',
        ],
      },
    ],
    keyTakeaways: [
      'Set up in 1-4 with the best shooter on the wing.',
      'A quick pass-and-return sets the deep cut in motion.',
      'The double screen is what guarantees the separation — coach it hard.',
      'The point guard\'s dribble across the top opens the passing angle, it isn\'t a drive.',
      'Works from either side of the floor; mirror based on personnel.',
    ],
  },

  status: 'published',
}

export const pickOverload: Preset = {
  slug: 'pick-overload',
  title: 'Pick Overload',
  category: '2-3 Zone Offense',
  description:
    'A 1-3-1 attack that overloads one side of the zone with a ball screen, forcing two defenders to guard three shooters.',
  readMinutes: 4,
  family: { slug: 'pick-overload', title: 'Pick Overload' },

  playData: {
    id: 'preset-pick-overload',
    name: 'Pick Overload (2)',
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
      o2: { x: 0.80, y: 0.40 },
      o3: { x: 0.20, y: 0.40 },
      o4: { x: 0.15, y: 0.16 },
      o5: { x: 0.50, y: 0.40 },
    },
    initialBall: { holderId: 'o1' },
    actions: [
      // 1 dribbles at the high defender to drag him to the wing.
      { id: 'a1', type: 'dribble', playerId: 'o1', toPosition: { x: 0.62, y: 0.58 } },
      // 3 slides down toward the corner to make room on the wing.
      { id: 'a2', type: 'cut', playerId: 'o3', toPosition: { x: 0.15, y: 0.20 } },
      // 5 steps out and screens the high defender.
      { id: 'a3', type: 'screen', screenerId: 'o5', screenPosition: { x: 0.58, y: 0.50 } },
      { id: 'a4', type: 'dribble', playerId: 'o1', toPosition: { x: 0.56, y: 0.40 }, waypoints: [{ x: 0.60, y: 0.52 }] },
      // 3 deep-cuts along the baseline to the far corner.
      { id: 'a5', type: 'cut', playerId: 'o3', toPosition: { x: 0.85, y: 0.16 }, waypoints: [{ x: 0.50, y: 0.14 }, { x: 0.68, y: 0.12 }] },
      // The second defender rotates to stop the drive, so 1 kicks out.
      { id: 'a6', type: 'pass', fromId: 'o1', toId: 'o2' },
      { id: 'a7', type: 'shot', shooterId: 'o2' },
    ],
  },

  article: {
    intro:
      'Pick Overload attacks a 2-3 zone by loading three shooters onto one side of the floor behind a ball screen, forcing two defenders to cover three good options at once. The math is simple: someone is left open, and the point guard\'s job is just to find who.',
    sections: [
      {
        heading: 'Setting Up in 1-3-1',
        paragraphs: [
          'Line up in a 1-3-1 with two reliable three-point shooters on the wings. The point guard dribbles toward either side of the floor, dragging the zone\'s high defender out to the wing, while the far wing slides down toward the corner to create more room on the strong side.',
        ],
      },
      {
        heading: 'The Ball Screen',
        paragraphs: [
          'The high post steps out and sets a ball screen on the defender who has been dragged to the wing. The point guard uses it to attack toward the high post — if the second-level defender doesn\'t rotate over to cut off the drive, the point guard can finish himself with a floater or a midrange pull-up.',
        ],
      },
      {
        heading: 'The Overload Read',
        paragraphs: [
          'As the point guard uses the screen, the far wing deep-cuts along the baseline to the opposite corner — spacing the floor so that, if the defense does rotate to stop the drive (which it usually will), only one defender is left to contest two shooters.',
          'If the wing defender steps up to stop the ball, the point guard kicks out for an open three. If the low defender then flies out to that shooter, the ball keeps moving to the corner for an even easier look — the overload means the defense is always one body short.',
        ],
      },
      {
        heading: 'Coaching Points',
        paragraphs: [
          'It doesn\'t matter which side you run this on — both wings should be in a shooting-ready position at all times.',
          'The two post players are responsible for offensive rebounding on the eventual shot, since the guards are all spaced to the perimeter.',
        ],
      },
    ],
    keyTakeaways: [
      'Set up 1-3-1 with two knockdown shooters on the wings.',
      'A ball screen from the high post creates the initial driving lane.',
      'A deep baseline cut to the far corner overloads one side with three scorers.',
      'The zone can only cover two of three options — read which defender rotates and go the other way.',
      'Both posts crash the boards since the perimeter is fully spaced out.',
    ],
  },

  status: 'published',
}

export const skipper: Preset = {
  slug: 'skipper',
  title: 'Skipper',
  category: '2-3 Zone Offense',
  description:
    'A 1-3-1 quick hitter that hides a screen for the corner shooter behind a strong skip pass, best suited to teams that can throw it accurately.',
  readMinutes: 3,
  family: { slug: 'skipper', title: 'Skipper' },

  playData: {
    id: 'preset-skipper',
    name: 'Skipper (2)',
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
      o2: { x: 0.65, y: 0.54 },
      o3: { x: 0.82, y: 0.34 },
      o4: { x: 0.15, y: 0.34 },
      o5: { x: 0.65, y: 0.20 },
    },
    initialBall: { holderId: 'o1' },
    actions: [
      { id: 'a1', type: 'pass', fromId: 'o1', toId: 'o3' },
      // 5 sets a screen on the back side, timed to the pass about to happen.
      { id: 'a2', type: 'screen', screenerId: 'o5', screenPosition: { x: 0.72, y: 0.20 } },
      { id: 'a3', type: 'cut', playerId: 'o2', toPosition: { x: 0.88, y: 0.16 }, waypoints: [{ x: 0.70, y: 0.30 }] },
      { id: 'a4', type: 'pass', fromId: 'o3', toId: 'o2' },
      { id: 'a5', type: 'shot', shooterId: 'o2' },
    ],
  },

  article: {
    intro:
      'Skipper is a bare-bones quick hitter: one entry pass, one backside screen, and one skip pass for a corner three. It is short enough to run at any point in a possession, but the skip pass makes it a better fit for older, more experienced teams.',
    sections: [
      {
        heading: 'Setting Up in 1-3-1',
        paragraphs: [
          'Start in a 1-3-1 with the low post on the same side as your best three-point shooter. The point guard opens the play with a simple entry pass to the wing on that side.',
        ],
      },
      {
        heading: 'The Hidden Screen',
        paragraphs: [
          'The low post sets a screen on the backside of the defender guarding the far corner — but only at the last moment, right as the entry pass is about to be thrown. Setting it too early tips the defense off and lets them fight through before the shooter even moves.',
          'Behind that screen, the shooter slides down to the corner, completely clear of his primary defender.',
        ],
      },
      {
        heading: 'The Skip Pass',
        paragraphs: [
          'The wing who caught the entry pass fires a strong, direct skip pass across the zone to the shooter in the corner. This pass has to be thrown well — a lazy, looping pass gives a zone defender time to fly across and tip or contest it.',
        ],
      },
      {
        heading: 'Coaching Points',
        paragraphs: [
          'Time the screen to the pass, not before — the surprise is the entire point of the play.',
          'Coach the skip pass as an overhead pass specifically, so it can\'t be tipped by a defender closing the passing lane. Rep this in practice before running it in a game.',
        ],
      },
      {
        heading: 'When to Use It',
        paragraphs: [
          'Skipper asks a lot of the passer, so it suits high-school-and-up teams more than very young ones. Younger teams may struggle to execute the skip pass cleanly enough to make the play worthwhile.',
        ],
      },
    ],
    keyTakeaways: [
      'Set up 1-3-1 with the low post on the shooter\'s side.',
      'The backside screen must be timed to the pass, not set early.',
      'The shooter slides to the corner completely hidden from his defender.',
      'The skip pass should be a strong overhead pass, not a lazy lob.',
      'Best suited to high-school-and-older teams who can execute the skip pass reliably.',
    ],
  },

  status: 'published',
}

export const swinger: Preset = {
  slug: 'swinger',
  title: 'Swinger',
  category: '2-3 Zone Offense',
  description:
    'A 1-3-1 play built around a blindside ball screen for the point guard, giving him three simultaneous scoring reads once the zone commits.',
  readMinutes: 4,
  family: { slug: 'swinger', title: 'Swinger' },

  playData: {
    id: 'preset-swinger',
    name: 'Swinger (1)',
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
      o2: { x: 0.75, y: 0.40 },
      o3: { x: 0.15, y: 0.34 },
      o4: { x: 0.85, y: 0.34 },
      o5: { x: 0.50, y: 0.40 },
    },
    initialBall: { holderId: 'o1' },
    actions: [
      { id: 'a1', type: 'pass', fromId: 'o1', toId: 'o2' },
      { id: 'a2', type: 'pass', fromId: 'o2', toId: 'o1' },
      // 5 sets a blindside screen on the zone's top defender as the pass is made.
      { id: 'a3', type: 'screen', screenerId: 'o5', screenPosition: { x: 0.50, y: 0.52 } },
      { id: 'a4', type: 'dribble', playerId: 'o1', toPosition: { x: 0.50, y: 0.20 }, waypoints: [{ x: 0.50, y: 0.46 }] },
      {
        id: 'a5',
        type: 'group',
        name: 'Corners fill',
        actions: [
          { id: 'a5a', type: 'cut', playerId: 'o3', toPosition: { x: 0.15, y: 0.16 } },
          { id: 'a5b', type: 'cut', playerId: 'o4', toPosition: { x: 0.72, y: 0.14 } },
        ],
      },
      // Option 1: nobody steps up — 1 pulls up.
      { id: 'a6', type: 'shot', shooterId: 'o1' },
    ],
  },

  article: {
    intro:
      'Swinger sets up a blindside pick-and-roll for the point guard at the top of the key, then gives him a genuine three-way read once the defense has to react. It asks a lot of decision-making from one player, but rewards it with a play that is almost impossible for a zone to cover cleanly.',
    sections: [
      {
        heading: 'Setting Up in 1-3-1',
        paragraphs: [
          'Run this with your best decision-maker at the point. Start in a 1-3-1, and open the play with a pass to the wing to shift the defense, followed immediately by a return pass back to the point guard.',
        ],
      },
      {
        heading: 'The Blindside Screen',
        paragraphs: [
          'As that return pass is thrown, the high post sets a blindside screen on the defender at the top of the zone — set on a good angle, not just to the side, so the defender can\'t simply slip underneath it. The point guard uses the screen immediately and attacks toward the rim.',
        ],
      },
      {
        heading: 'Three Reads at Once',
        paragraphs: [
          'While the point guard is driving, both wings fill the corners — one sliding down, the other finding a gap along the baseline. This gives the point guard three live options depending entirely on how the defense reacts:',
          'If no defender steps up to stop the ball, he simply pulls up for the jump shot. If the baseline defender steps out to contest, he kicks to the corner for a three. If the screener\'s defender steps out instead, he drops a bounce pass to the other corner for a baseline layup.',
        ],
      },
      {
        heading: 'Coaching Points',
        paragraphs: [
          'The screen angle matters more than anything else in this play — a screen set flat to the side lets defenders slip underneath and recover, killing the drive before it starts.',
          'Both corner players need to be in a low, ready stance the instant the point guard picks up his dribble, since either pass can arrive on short notice.',
        ],
      },
    ],
    keyTakeaways: [
      'Run this with your best decision-maker at the point guard spot.',
      'A pass-and-return sets up a blindside ball screen from the high post.',
      'The screen angle must let the point guard attack the rim directly.',
      'Both corners fill space during the drive to create three simultaneous reads.',
      'The point guard reads the defense: pull up, kick to the corner, or bounce pass for the layup.',
    ],
  },

  status: 'published',
}
