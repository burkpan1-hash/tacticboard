// Coaching guides — original long-form content.
//
// WHY this file exists: AdSense rejects tool/app sites for "Google-served ads
// on screens without publisher-content". These guides give the site genuine,
// crawlable, original text content so ads can run on content pages (NOT on the
// editor/tool screens). Keep every article original — never copy/paste from
// other coaching sites (duplicate content = another rejection).

export interface GuideSection {
  heading: string
  paragraphs: string[]
}

export interface Guide {
  slug: string
  title: string
  category: 'Defense' | 'Offense' | 'Fundamentals'
  /** Short summary used on the index card and as the page meta description. */
  description: string
  readMinutes: number
  /** Lead paragraph shown under the title. */
  intro: string
  sections: GuideSection[]
  keyTakeaways: string[]
}

export const GUIDES: Guide[] = [
  {
    slug: 'how-to-run-a-2-3-zone-defense',
    title: 'How to Run a 2-3 Zone Defense',
    category: 'Defense',
    description:
      'A step-by-step coaching guide to setting up and running the 2-3 zone defense: the initial alignment, how to shift with the ball, defending the high post and short corner, and rebounding out of a zone.',
    readMinutes: 7,
    intro:
      'The 2-3 zone is one of the most widely used defenses in basketball, from youth leagues all the way up to the college game. It is popular for good reason: it protects the paint, hides slower or foul-prone players, and forces opponents to beat you with outside shooting rather than easy drives to the rim. This guide walks through how to set the zone up, how it should move as the ball moves, and the mistakes that quietly turn a good zone into a bad one.',
    sections: [
      {
        heading: 'What Is the 2-3 Zone?',
        paragraphs: [
          'In a zone defense, players guard areas of the floor rather than a specific opponent. The 2-3 zone gets its name from its shape: two defenders near the top of the key and three defenders spread across the baseline. The two top defenders are usually your guards, and the three baseline defenders are typically your forwards and center.',
          'The whole point of the alignment is to pack the middle of the floor. With three big bodies sitting along the baseline and two guards pressuring the top, the lane is crowded and difficult to drive into. Teams that struggle to shoot from the perimeter often have a hard time scoring against a well-drilled 2-3.',
        ],
      },
      {
        heading: 'Setting Up the Initial Alignment',
        paragraphs: [
          'Start the two top defenders around the free-throw line extended, splitting the distance between the ball and the elbows. They are responsible for the point guard, the wings, and contesting top-of-the-key shots. The center sits in the middle of the lane, protecting the rim and the high post. The two baseline forwards start near the blocks, ready to slide out to the corners and wings.',
          'A common coaching cue is "ball-you-basket" — every defender should be able to see both the ball and the basket they are protecting. If a defender turns and loses sight of the ball, the zone breaks down because nobody rotates on time.',
        ],
      },
      {
        heading: 'Shifting With the Ball',
        paragraphs: [
          'A zone is not a stationary wall — it slides toward the ball on every pass. When the ball is at the top, the two guards pressure it and the back three stay balanced. When the ball moves to the wing, the nearest top defender takes the ball, the nearest baseline defender bumps out to help, and the center slides toward the ball-side block.',
          'The hardest shift is when the ball goes to the corner. The ball-side forward closes out on the shooter, the center drops to protect the block, and the weak-side forward pinches into the middle to cover the rim. The back of the zone should move like it is connected by a string — when one player slides, everyone slides.',
        ],
      },
      {
        heading: 'Defending the High Post and Short Corner',
        paragraphs: [
          'Smart offenses attack a 2-3 zone by putting a player in the high post (around the free-throw line) and another in the short corner (between the block and the corner). These are the soft spots of the zone — the gaps between defenders.',
          'When the ball gets into the high post, the center steps up to contest while the two guards collapse down to deny the easy pass and shot. Against the short corner, the ball-side forward must be disciplined: closing out too hard gives up a baseline drive, while closing out too soft gives up an open mid-range shot. Reps in practice are what build this judgment.',
        ],
      },
      {
        heading: 'Rebounding Out of a Zone',
        paragraphs: [
          'The biggest weakness of any zone is rebounding. Because players are guarding space instead of a person, it is easy to lose track of who you are supposed to box out. Many teams that defend well in the zone still give up second-chance points because nobody finds a body when the shot goes up.',
          'Drill the habit relentlessly: on every shot, each defender turns and makes contact with the nearest opponent before going to get the ball. The three baseline defenders own the area around the rim, and the two guards are responsible for chasing down long rebounds that carom out to the perimeter.',
        ],
      },
      {
        heading: 'When to Use the 2-3 Zone',
        paragraphs: [
          'The 2-3 zone is most effective against teams that cannot shoot consistently from outside, teams that rely on dribble penetration, or when you need to protect a key player who is in foul trouble. It can also slow the tempo of the game and frustrate an opponent that wants to run.',
          'It is less effective against great shooting teams and against patient offenses that move the ball quickly from side to side. If the other team is knocking down open threes, you may need to extend the zone, switch to a different look, or go to man-to-man.',
        ],
      },
      {
        heading: 'Common Mistakes',
        paragraphs: [
          'Standing still instead of shifting on every pass. A zone that does not move gives up wide-open shots in the gaps.',
          'Watching the ball and forgetting to box out, which leads to easy offensive rebounds.',
          'Closing out out of control, allowing straight-line drives right through the middle of the zone.',
          'Failing to communicate. Zone defense lives and dies on talk — "ball", "shot", "screen", and "help" should be constant.',
        ],
      },
    ],
    keyTakeaways: [
      'Two defenders up top, three across the baseline — pack the paint and force outside shots.',
      'Slide toward the ball on every pass; the back line moves as one connected unit.',
      'The high post and short corner are the soft spots — defend them with disciplined closeouts.',
      'Box out by area on every shot; rebounding is the zone\'s biggest weakness.',
      'Use it against weak-shooting, drive-heavy teams; reconsider against hot shooters.',
    ],
  },
  {
    slug: 'pick-and-roll-complete-guide',
    title: 'Pick and Roll: A Complete Guide',
    category: 'Offense',
    description:
      'Everything you need to coach the pick and roll: the roles of the ball handler and screener, how to set a legal screen, reading drop, hedge, switch and blitz coverages, and the roll versus the pop.',
    readMinutes: 8,
    intro:
      'The pick and roll is the most common action in modern basketball. At every level, from middle school to the professional game, two players running a simple screen-and-roll create more good shots than almost any other play. The action is easy to start and nearly impossible to fully stop, because every way the defense chooses to guard it opens up something else. This guide breaks down how to run it and, more importantly, how to read what the defense gives you.',
    sections: [
      {
        heading: 'What Is the Pick and Roll?',
        paragraphs: [
          'The pick and roll is a two-player action. One player (the screener) sets a screen, or "pick", on the defender guarding the player with the ball. The ball handler uses that screen to turn the corner and attack. After setting the screen, the screener "rolls" toward the basket looking for a pass.',
          'The reason it works is simple math: a single screen forces two defenders to make a decision about one ball handler, which leaves one offensive player temporarily unguarded. The offense\'s job is to find and use that advantage before the defense recovers.',
        ],
      },
      {
        heading: 'The Two Roles',
        paragraphs: [
          'The ball handler is the engine of the action. A good ball handler comes off the screen with pace, keeps the dribble alive, and reads the defense before deciding whether to score, pass to the roller, or kick out to a shooter. Patience matters — rushing the read is the most common way to waste a good screen.',
          'The screener has two jobs that are easy to forget. First, set a screen that actually contacts the defender and gives the ball handler room. Second, roll hard to the rim with hands ready. A lazy roll lets one defender guard both players, which kills the entire advantage.',
        ],
      },
      {
        heading: 'Setting a Legal Screen',
        paragraphs: [
          'A legal screen requires the screener to be stationary at the moment of contact, with feet roughly shoulder-width apart and arms in tight. Moving into the defender, sticking out a hip or leg, or leaning in are all offensive fouls that will get called consistently as players get older.',
          'Angle is everything. The screener should set the pick so that the open side points where you want the ball handler to go — usually toward the middle of the floor, where more passing options are available. Communicating the angle with a simple call or hand signal keeps both players on the same page.',
        ],
      },
      {
        heading: 'Reading the Defense',
        paragraphs: [
          'Drop coverage: the screener\'s defender sags back toward the rim to protect against the drive. This gives the ball handler an open mid-range pull-up jumper. If they can shoot it, take it.',
          'Hedge or show: the screener\'s defender jumps out hard to briefly stop the ball, then recovers. The read here is to use a hesitation, split the two defenders, or hit the roller early as the big recovers.',
          'Switch: the two defenders simply trade assignments. This often creates a mismatch — a smaller defender on your screener near the rim, or a slower defender on a quick guard. Attack the mismatch immediately before help arrives.',
          'Blitz or trap: two defenders aggressively double the ball handler. The correct read is to pass out of the trap quickly, usually to the rolling screener, who now attacks a 4-on-3 with a numbers advantage.',
        ],
      },
      {
        heading: 'The Roll vs. the Pop',
        paragraphs: [
          'After setting the screen, the screener has two options. The roll is a hard cut to the basket, which is ideal when the screener is a strong finisher and the lane is open. The pop is stepping out to open space for a jump shot, which is ideal when the screener can shoot and the defense is collapsing inside.',
          'The best screeners can do both, and choosing between them based on personnel and the defense\'s coverage makes the action far harder to guard. A team with a rolling big and a popping big forces the defense to defend two completely different actions out of the same look.',
        ],
      },
      {
        heading: 'Spacing Around the Action',
        paragraphs: [
          'A pick and roll is only as good as the spacing around it. The three players not involved in the action must stay spread out — typically in the corners and on the weak-side wing — so their defenders cannot easily help on the ball without giving up an open shot.',
          'When spacing is poor, help defenders clog the lane and the entire advantage disappears. When spacing is good, every defensive rotation leaves someone open, and the ball handler simply reads which help defender moved and passes to the player they left.',
        ],
      },
      {
        heading: 'Common Mistakes',
        paragraphs: [
          'Setting a moving screen, which turns a great action into an offensive foul.',
          'The screener rolling slowly or not at all, allowing one defender to guard two players.',
          'The ball handler picking up the dribble too early and losing the ability to read the defense.',
          'Poor spacing that lets help defenders crowd the lane and erase the advantage.',
        ],
      },
    ],
    keyTakeaways: [
      'The pick and roll forces two defenders to guard one ball handler, creating an advantage.',
      'Set a legal, stationary screen at the right angle, then roll hard with hands ready.',
      'Read the coverage: shoot vs. drop, split vs. hedge, attack the switch, pass out of the trap.',
      'Roll to finish or pop to shoot, based on personnel and what the defense gives you.',
      'Great spacing around the action is what makes it impossible to fully defend.',
    ],
  },
  {
    slug: 'building-a-fast-break-offense',
    title: 'Building a Fast Break Offense',
    category: 'Offense',
    description:
      'How to build a fast break offense that scores in transition: starting the break off defense and rebounding, the outlet pass, filling the lanes, the trailer and secondary break, and making the right read on numbers advantages.',
    readMinutes: 7,
    intro:
      'Fast break points are some of the easiest baskets in basketball. Before the defense can set up and get organized, a team that pushes the ball quickly can attack a scrambling, outnumbered defense. But a good fast break is not just "run fast" — it is an organized system that starts the moment your team gains possession. This guide explains how to build one that produces high-percentage shots instead of turnovers.',
    sections: [
      {
        heading: 'Why the Fast Break Works',
        paragraphs: [
          'Defenses are at their strongest when they are set: matched up, in their stance, and ready to help each other. The fast break attacks before any of that can happen. By pushing the ball up the floor in the first few seconds, you force defenders to make decisions while running backward and out of position.',
          'A team committed to running also wears opponents down over the course of a game. Constant transition pressure forces the defense to sprint back on every possession, which tires legs and leads to breakdowns late in halves.',
        ],
      },
      {
        heading: 'It Starts With Defense and Rebounding',
        paragraphs: [
          'Every fast break begins with a stop. Defensive rebounds, steals, and blocked balls are the fuel for transition offense. This is why great running teams are usually great defensive-rebounding teams first — you cannot run if you do not get the ball.',
          'The instant a player secures the rebound, the mindset has to flip from defense to offense. The rebounder looks up immediately, and teammates start sprinting before the ball even comes down. Speed in the first two seconds is what separates a real fast break from a slow walk up the floor.',
        ],
      },
      {
        heading: 'The Outlet Pass',
        paragraphs: [
          'The outlet pass is the first pass that starts the break. After the rebound, the player pivots toward the sideline and looks to hit a guard who has sprinted to the outlet area, near the free-throw line extended on the wing.',
          'A quick, accurate outlet turns a defensive rebound into an instant offensive opportunity. A slow or careless outlet — or one thrown into traffic — gives the defense time to recover and can lead to a turnover. Guards must sprint to get open and call for the ball loudly.',
        ],
      },
      {
        heading: 'Filling the Lanes',
        paragraphs: [
          'The classic fast break fills three lanes: the ball handler pushes the middle of the floor, and two wings sprint the sidelines as wide as possible. Width is the key — the wider the wings run, the more the defense is stretched and the harder it is to guard everyone.',
          'The ball handler\'s job in the middle is to read the defense and make the right decision near the foul line: keep it and finish, or pass to whichever wing the defense fails to pick up. Running the lanes hard, even when you do not get the ball, is what creates the advantage for a teammate.',
        ],
      },
      {
        heading: 'The Trailer and Secondary Break',
        paragraphs: [
          'Not every fast break ends with a layup in the first wave. The trailer — usually a big who rebounded or ran a step behind the play — arrives a beat later and becomes a key option. A trailing big can catch for a layup, set a quick ball screen, or pop to the top for an open shot.',
          'When the initial break does not produce a clean look, the team flows into a "secondary break": a quick, organized set run before the defense is fully matched up. This keeps the pressure on and prevents the offense from grinding to a halt in the half court.',
        ],
      },
      {
        heading: 'Making the Right Read',
        paragraphs: [
          'The whole point of the break is to play with a numbers advantage. On a 2-on-1, the ball handler attacks the single defender and forces them to commit before passing to the open teammate for a layup. On a 3-on-2, the ball handler attacks the front defender, draws a second, and finds the open player created by the rotation.',
          'The discipline is knowing when to pull it out. If the defense gets back and the numbers are even (or against you), the smart play is to slow down and run your offense rather than force a bad shot or a wild turnover. Great fast-break teams know the difference.',
        ],
      },
      {
        heading: 'Common Mistakes',
        paragraphs: [
          'Out-running the ball or charging into a set defense and forcing a bad shot.',
          'A slow or sloppy outlet pass that lets the defense recover.',
          'Wings running too narrow, which makes it easy for one defender to guard two players.',
          'No trailer or secondary action, so the offense stalls when the first wave is stopped.',
        ],
      },
    ],
    keyTakeaways: [
      'Every fast break starts with a defensive stop and an immediate, accurate outlet pass.',
      'Fill three lanes and run the wings wide to stretch the defense.',
      'Use the trailer and a secondary break so the offense keeps flowing when the first wave is stopped.',
      'Play the numbers: attack the defender, force a commitment, then hit the open teammate.',
      'Know when to pull it out — a set defense means run your half-court offense instead.',
    ],
  },
]

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug)
}

export function relatedGuides(slug: string, limit = 2): Guide[] {
  return GUIDES.filter((g) => g.slug !== slug).slice(0, limit)
}
