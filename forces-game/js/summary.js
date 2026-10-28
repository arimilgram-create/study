// Summary Extras: the parts of the 2nd Law & Acceleration unit summary that no other station covered yet.
// Vocab terms, parallel and perpendicular vectors, the change formula, the Hot Wheels track (Physics Classroom Q10), and a cart on a hill.

const TRACK_SVG = `<svg viewBox="0 0 280 160" role="img" aria-label="Hot Wheels track. The car starts at A, goes down the hill past X to B, then along the short straight past Y, around the curve, and back along the bottom past Z to C.">
  <rect x="2" y="10" width="8" height="122" style="fill:var(--muted)"/>
  <path d="M25 25 L140 82 L190 82 A26 26 0 0 1 190 134 L80 134" fill="none" style="stroke:var(--ink)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
  <g style="font:700 15px var(--mono);fill:var(--ink)"><text x="14" y="16">A</text><text x="78" y="40">X</text><text x="134" y="100">B</text><text x="180" y="66">Y</text><text x="164" y="154">Z</text><text x="66" y="154">C</text></g>
  <g style="fill:var(--f-a)"><circle cx="82" cy="53" r="5"/><circle cx="190" cy="82" r="5"/><circle cx="175" cy="134" r="5"/></g>
</svg>`;

const HILL_SVG = `<svg viewBox="0 0 280 140" role="img" aria-label="A cart on a hill that rises to the upper right. Friction is ignored.">
  <line x1="20" y1="120" x2="260" y2="120" style="stroke:var(--muted)" stroke-width="3"/>
  <path d="M20 120 L260 40" fill="none" style="stroke:var(--muted)" stroke-width="4"/>
  <g transform="rotate(-18.4 140 72)"><rect x="118" y="64" width="44" height="16" rx="3" style="fill:var(--card);stroke:var(--ink)" stroke-width="2.5"/></g>
</svg>`;

const trackStep = (q, opts, explain) => (el, api) => MCQ(el, api, { media: TRACK_SVG, q, opts, explain });
const hillStep = (q, opts, explain) => (el, api) => MCQ(el, api, { media: HILL_SVG, q, opts, explain });

Game.add({
  id: 'sum1', section: 'summary', tag: 'Summary 1', title: 'Vocab Check',
  blurb: 'Acceleration, its symbol and unit, what counts as accelerating, and Newton\'s 2nd law in words.',
  steps: [
    (el, api) => MCQ(el, api, {
      q: 'What is the <b>symbol</b> and <b>SI unit</b> for acceleration?',
      opts: [
        { t: 'a, m/s² (also written m/s/s)', ok: true },
        { t: 'v, m/s', why: 'v is velocity. Acceleration is the rate that velocity changes.' },
        { t: 'Δx, m', why: 'Δx is a change in position.' },
        { t: 'F, N', why: 'F is force. Force is not acceleration.' },
      ],
      explain: 'Acceleration is <b>a</b>, measured in <b>m/s²</b> (or m/s/s). It is the rate of change of velocity.',
    }),
    (el, api) => MCQ(el, api, {
      q: 'Which one is <b>accelerating</b> in physics?',
      opts: [
        { t: 'Turning a corner at a steady speed', ok: true },
        { t: 'Cruising at a constant 60 mi/hr in a straight line', why: 'Constant velocity means no acceleration.' },
        { t: 'Sitting still at a red light', why: 'At rest with no change in velocity, there is no acceleration.' },
        { t: 'Rolling down a track at a steady speed', why: 'Steady speed in a straight line is not accelerating.' },
      ],
      explain: 'Speeding up, slowing down, and turning are all accelerating, because the <b>velocity changes</b>. Velocity includes direction, so turning counts.',
    }),
    (el, api) => MCQ(el, api, {
      q: 'Which statement describes the direction of acceleration?',
      opts: [
        { t: 'Same direction as the velocity when speeding up. Opposite when slowing down.', ok: true },
        { t: 'Always the same direction as the velocity.', why: 'That is only true when speeding up.' },
        { t: 'Always opposite the velocity.', why: 'That is only true when slowing down.' },
        { t: 'Always straight down.', why: 'Acceleration follows the net force, not gravity alone.' },
      ],
      explain: 'Acceleration points the same way the net force points. Speeding up: same as velocity. Slowing down: opposite.',
    }),
    (el, api) => MCQ(el, api, {
      q: 'Newton\'s 2nd Law: a = ΣF / m. Which sentence is correct?',
      opts: [
        { t: 'Acceleration is directly proportional to the net force and inversely proportional to the mass.', ok: true },
        { t: 'Acceleration is inversely proportional to the net force and directly proportional to the mass.', why: 'Check the equation: force is on top, mass is on the bottom.' },
        { t: 'Acceleration equals mass times net force.', why: 'That would be F = m · a, but the equation divides force by mass.' },
        { t: 'Acceleration equals net force times time.', why: 'Time is not in this equation.' },
      ],
      explain: 'Double the net force and the acceleration doubles. Double the mass and the acceleration is cut in half.',
    }),
  ],
});

Game.add({
  id: 'sum2', section: 'summary', tag: 'Summary 2', title: 'Parallel vs Perpendicular',
  blurb: 'Vectors on the same line add or subtract. Vectors at right angles need Pythagoras.',
  steps: [
    (el, api) => MCQ(el, api, {
      q: 'Which pair of vectors is <b>perpendicular</b>?',
      opts: [
        { t: '3 N east and 4 N north', ok: true },
        { t: '3 N east and 4 N east', why: 'Same line, same direction. That is parallel, so you add.' },
        { t: '3 N east and 4 N west', why: 'Same line, opposite directions. That is parallel too, so you subtract.' },
        { t: '3 N north and 4 N north', why: 'Both point north. That is parallel.' },
      ],
      explain: 'Perpendicular vectors meet at a right angle. You can\'t just add them. Use Pythagoras: R² = x² + y².',
    }),
    (el, api) => MCQ(el, api, {
      q: 'Parallel vectors: 6 N west and 2 N east. What is the resultant?',
      opts: [
        { t: '4 N west', ok: true },
        { t: '8 N west', why: 'These point opposite ways, so you subtract. Adding gives the wrong answer.' },
        { t: '4 N east', why: 'The bigger force (6 N) wins, and it points west.' },
        { t: '8 N east', why: 'Wrong direction and wrong size.' },
      ],
      explain: '<span class="eq">6 N west - 2 N east = 4 N west</span>Parallel vectors on the same line add or subtract. The bigger one sets the direction.',
    }),
    (el, api) => WORK(el, api, {
      q: 'Perpendicular vectors: a boat moves 6 m/s north while a current pushes it 8 m/s east. Find the resultant speed.',
      eq: 'pyth', form: 'R<sup>2</sup> = x<sup>2</sup> + y<sup>2</sup>', plug: 'R<sup>2</sup> = ([[8]] m/s)<sup>2</sup> + ([[6]] m/s)<sup>2</sup>', lhs: 'R =', ans: 10, unit: 'm/s', finalLine: 'R = 10 m/s',
      hint: 'Square each part, add them, then take the square root.',
      after: 'The 6-8-10 triangle. Same idea as the 3-4-5 triangle.',
    }),
  ],
});

Game.add({
  id: 'sum3', section: 'summary', tag: 'Summary 3', title: 'The Change Formula',
  blurb: 'ΔQ means final minus initial, for any quantity Q: position, velocity, mass, or force.',
  steps: [
    (el, api) => MCQ(el, api, {
      q: 'In <b>ΔQ = Q<sub>f</sub> - Q<sub>i</sub></b>, what does the Δ mean?',
      opts: [
        { t: 'The change in Q: final value minus starting value', ok: true },
        { t: 'Starting value minus final value', why: 'That flips the sign. The ending value always comes first.' },
        { t: 'Q multiplied by time', why: 'Δ means change, not multiply.' },
        { t: 'The total of all the Q values', why: 'That would be a sum. Δ means change.' },
      ],
      explain: 'Δ (delta) always means <b>final minus initial</b>. The sign tells you the direction of the change.',
    }),
    (el, api) => WORK(el, api, {
      q: 'Q is the net force. It changes from +12 N to -5 N. Find ΔQ.',
      eq: 'dQ', form: 'ΔQ = Q<sub>f</sub> - Q<sub>i</sub>', plug: 'ΔQ = ([[-5]] N) - ([[12]] N)', lhs: 'ΔQ =', ans: -17, unit: 'N', finalLine: 'ΔQ = -17 N',
      hint: 'Final minus initial. Watch the negative sign on the -5.',
      after: 'The net force dropped by 17 N. The negative sign means it went down in the + direction.',
    }),
  ],
});

Game.add({
  id: 'sum4', section: 'summary', tag: 'Summary 4', title: 'Hot Wheels Track',
  blurb: 'The car speeds up going down the hill, then slows down from B to C. Find the velocity and acceleration at X, Y, and Z.',
  steps: [
    trackStep('The car speeds up going down the hill. At <b>X</b>, which way is its <b>velocity</b>?', [
      { t: 'Down the hill, to the right', ok: true },
      { t: 'Up the hill, to the left', why: 'The car starts at A and goes downhill toward B.' },
      { t: 'To the left', why: 'The car moves from A toward B, which is to the right.' },
      { t: 'Zero', why: 'The car is moving at X.' },
    ], 'At X the car is moving down the hill, speeding up. Velocity points down the hill, to the right.'),
    trackStep('And at <b>X</b>, which way is its <b>acceleration</b>?', [
      { t: 'Down the hill, to the right (same as velocity)', ok: true },
      { t: 'Up the hill, to the left', why: 'That would slow the car down. It is speeding up at X.' },
      { t: 'Zero', why: 'The car is speeding up, so there is acceleration.' },
      { t: 'Straight up', why: 'Gravity is not pushing up the hill.' },
    ], 'Speeding up at X: acceleration points the same way as velocity, down the hill.'),
    trackStep('At <b>Y</b>, on the short straight after B, which way is the <b>velocity</b>?', [
      { t: 'To the right', ok: true },
      { t: 'To the left', why: 'The car is still heading away from A, so it moves right.' },
      { t: 'Zero', why: 'The car is still moving.' },
      { t: 'Up', why: 'Y is on a flat section, so the car is moving sideways.' },
    ], 'The car is still moving right at Y.'),
    trackStep('And at <b>Y</b>, which way is the <b>acceleration</b>?', [
      { t: 'To the left (opposite the velocity)', ok: true },
      { t: 'To the right, the same as the velocity', why: 'That would mean speeding up. The car slows down from B to C.' },
      { t: 'Zero, because it is on a straight section', why: 'Being on a straight section doesn\'t stop it from slowing down.' },
      { t: 'Up', why: 'The track pushes up on the car, but that doesn\'t change its speed along the track.' },
    ], 'The car is slowing down from B to C, so acceleration points opposite the velocity: left.'),
    trackStep('At <b>Z</b>, on the bottom straight, which way is the <b>velocity</b>?', [
      { t: 'To the left, toward C', ok: true },
      { t: 'To the right', why: 'After the curve, the car heads back to the left.' },
      { t: 'Zero', why: 'The car is still moving.' },
      { t: 'Down', why: 'The bottom track is flat. The car is moving sideways.' },
    ], 'After the loop the car is heading left toward C.'),
    trackStep('And at <b>Z</b>, which way is the <b>acceleration</b>?', [
      { t: 'To the right (opposite the velocity)', ok: true },
      { t: 'To the left, the same as the velocity', why: 'That would mean speeding up. The car is slowing down.' },
      { t: 'Zero', why: 'The car is slowing down, so there is acceleration.' },
      { t: 'Down', why: 'Down is not along the track here. The acceleration points sideways, opposite the velocity.' },
    ], 'Slowing down from B to C: acceleration opposes velocity, so it points right at Z.'),
  ],
});

Game.add({
  id: 'sum5', section: 'summary', tag: 'Summary 5', title: 'Cart on a Hill',
  blurb: 'A cart goes up a hill, rolls back down, and gets caught. Which way is the net force each time? (Friction ignored.)',
  steps: [
    hillStep('You push the cart up the hill. It is moving up and slowing down, before the highest point. Which way is the <b>net force</b>?', [
      { t: 'Down the hill, opposite the velocity', ok: true },
      { t: 'Up the hill, the same as the velocity', why: 'That would make it speed up. It is slowing down.' },
      { t: 'Zero, because it is still moving', why: 'Moving does not mean zero net force. It is slowing down, so there is a net force.' },
      { t: 'Straight up', why: 'The only push along the hill is gravity pulling down the slope.' },
    ], 'Slowing down while moving up: net force points down the hill, opposite the velocity.'),
    hillStep('It rolls back down and is speeding up. Which way is the <b>net force</b>?', [
      { t: 'Down the hill, the same as the velocity', ok: true },
      { t: 'Up the hill, opposite the velocity', why: 'That would slow it down. It is speeding up.' },
      { t: 'Zero', why: 'Speeding up means there is a net force.' },
      { t: 'Straight up', why: 'Gravity pulls down the slope.' },
    ], 'Speeding up while moving down: net force points down the hill, the same as the velocity.'),
    hillStep('You catch the cart while it is still moving down toward the bottom, and stop it with your hand. Which way is the <b>net force</b>?', [
      { t: 'Up the hill, opposite the velocity', ok: true },
      { t: 'Down the hill, the same as the velocity', why: 'That would speed it up. Your hand is slowing it down.' },
      { t: 'Zero, since it stops', why: 'It is not stopped yet. While you stop it, it is still moving, so there is a net force.' },
      { t: 'Straight down', why: 'Your hand pushes up the slope, not down.' },
    ], 'Your hand is slowing the cart down while it still moves down. Net force points up the hill, opposite the velocity.'),
  ],
});
