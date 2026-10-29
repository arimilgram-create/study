// Quiz Review: Acceleration & Newton's 2nd Law (the study guide). One station per question.
// The answers and work match the teacher's filled-in key, which is also on the Answer Key page.

// ---------- answer key ----------
const KEY2 = [
  { n: '1', title: 'Superman stops the runaway train', station: 'g1', parts: [
    { id: 'g-1a', q: 'What direction is the train accelerating?', w: ['<u>Left</u> (circled)'] },
    { id: 'g-1b', q: 'It was going 40 m/s. Superman stops it over 25 s. Calculate the acceleration.', w: ['v<sub>i</sub> = 40 m/s &nbsp; v<sub>f</sub> = 0 m/s &nbsp; t = 25 s', 'a = (v<sub>f</sub> - v<sub>i</sub>) / t', 'a = (0 - 40) / 25', 'a = -1.6 m/s²'] },
    { id: 'g-1c', q: 'Sketch the velocity-time graph.', w: ['a straight line from 40 m/s at 0 s down to 0 m/s at 25 s'], g: () => plotSVG(vtAxes([0, 30, 5], [-40, 40, 20]), [[0, 40], [25, 0]], '--pen') },
    { id: 'g-1d', q: 'Draw the free body diagram for the train as it accelerates.', w: ['F<sub>superman</sub> &larr; (long arrow, left)', 'F<sub>engine</sub> &rarr; (shorter arrow, right)', 'F<sub>N</sub> &uarr; &nbsp; F<sub>g</sub> &darr;'] },
    { id: 'g-1e', q: 'The train has a mass of 50,000 kg. Determine the net force.', w: ['m = 50,000 kg', 'a = F<sub>net</sub> / m', '-1.6 = F<sub>net</sub> / 50,000', '-80,000 N = F<sub>net</sub>'] },
    { id: 'g-1f', q: 'The engine keeps pushing forward with 15,000 N. How hard did Superman push?', w: ['F<sub>E</sub> = 15,000 N', 'F<sub>net</sub> = F<sub>SM</sub> + F<sub>E</sub>', '-80,000 = F<sub>SM</sub> + 15,000', '-95,000 N = F<sub>SM</sub>'] },
    { id: 'g-1g', q: 'Same forces, but half the mass. How would the acceleration change?', w: ['a = F<sub>net</sub> / m: mass &divide; 2, so a &times; 2 (inverse)', 'it would accelerate 2x as fast'] },
  ] },
  { n: '2', title: 'The stuntman cannon', station: 'g2', parts: [
    { id: 'g-2a', q: 'Draw the free body diagram for the stuntman (while being launched).', w: ['F<sub>A</sub> &uarr; (long) &nbsp; F<sub>g</sub> &darr;'] },
    { id: 'g-2b', q: 'Direction of the velocity, the net force, and the acceleration?', w: ['velocity: +', 'net force: +', 'acceleration: +'] },
    { id: 'g-2e', q: 'Weight 800 N, cannon force 3360 N. Calculate the net force.', w: ['F<sub>g</sub> = -800 N &nbsp; F<sub>A</sub> = 3360 N', 'F<sub>net</sub> = F<sub>A</sub> + F<sub>g</sub>', 'F<sub>net</sub> = 3360 + (-800)', 'F<sub>net</sub> = 2560 N'] },
    { id: 'g-2f', q: 'Calculate the acceleration of the stuntman.', w: ['F<sub>g</sub> = mg &nbsp; -800 = m &middot; (-10) &nbsp; 80 kg = m', 'a = F<sub>net</sub> / m', 'a = 2560 / 80', 'a = 32 m/s²'] },
    { id: 'g-2g', q: 'He is accelerated for .75 s. Determine his velocity at the end.', w: ['v<sub>i</sub> = 0 &nbsp; t = .75 &nbsp; v<sub>f</sub> = ?', 'a = (v<sub>f</sub> - v<sub>i</sub>) / t', '32 = (v<sub>f</sub> - 0) / .75', '24 m/s = v<sub>f</sub>'] },
    { id: 'g-2h', q: 'Circle the graph that best shows the motion.', w: ['graph a (circled): starts at 0 and rises'] },
  ] },
  { n: '3', title: 'The truck skids to a stop', station: 'g3', parts: [
    { id: 'g-3', q: 'A 1200 kg truck stops over 2.2 s with -10,200 N of braking force. Calculate its initial velocity.', w: ['F<sub>B</sub> = -10,200 N &larr; &nbsp; F<sub>N</sub> &uarr; &nbsp; F<sub>g</sub> &darr;', 'm = 1200 kg &nbsp; t = 2.2 s &nbsp; v<sub>f</sub> = 0 (stops) &nbsp; v<sub>i</sub> = ?', 'F<sub>net</sub> = F<sub>B</sub> &nbsp; F<sub>net</sub> = -10,200 N', 'a = F<sub>net</sub> / m &nbsp; a = -10,200 / 1200 &nbsp; a = -8.5 m/s²', 'a = (v<sub>f</sub> - v<sub>i</sub>) / t &nbsp; -8.5 = (0 - v<sub>i</sub>) / 2.2', '-18.7 = -v<sub>i</sub>', '18.7 m/s = v<sub>i</sub>'] },
  ] },
  { n: '4', title: 'Melinda\'s wheelbarrow', station: 'g4', parts: [
    { id: 'g-4', q: '170 kg, from rest to -1.2 m/s in 6 s, pulling with -285 N. Calculate the friction.', w: ['F<sub>A</sub> = -285 N &larr; &nbsp; F<sub>f</sub> = ? &rarr; &nbsp; F<sub>N</sub> &uarr; &nbsp; F<sub>g</sub> &darr;', 'm = 170 kg &nbsp; t = 6 s &nbsp; v<sub>i</sub> = 0 &nbsp; v<sub>f</sub> = -1.2 m/s', 'a = (v<sub>f</sub> - v<sub>i</sub>) / t &nbsp; a = (-1.2 - 0) / 6 &nbsp; a = -.2 m/s²', 'F<sub>net</sub> / m = a &nbsp; F<sub>net</sub> / 170 = -.2 &nbsp; F<sub>net</sub> = -34 N', 'F<sub>net</sub> = F<sub>f</sub> + F<sub>A</sub> &nbsp; -34 = F<sub>f</sub> + (-285)', '251 N = F<sub>f</sub>'] },
  ] },
  { n: '5', title: 'The crane lowers the iron', station: 'g5', parts: [
    { id: 'g-5a', q: 'The 20,000 N iron moves down at a constant -2 m/s. Calculate the crane\'s upward force.', w: ['F<sub>g</sub> = -20,000 N &nbsp; v = -2 m/s &nbsp; F<sub>net</sub> = 0 N (const. vel)', 'F<sub>net</sub> = F<sub>g</sub> + F<sub>A</sub>', '0 = -20,000 + F<sub>A</sub>', '20,000 N = F<sub>A</sub>'] },
    { id: 'g-5b', q: 'It must land no faster than -.15 m/s. The crane can pull 45,000 N. How much time is needed to slow down?', w: ['v<sub>f</sub> = -.15 m/s &nbsp; v<sub>i</sub> = -2 m/s &nbsp; F<sub>A</sub> = 45,000 N &nbsp; t = ?', 'F<sub>net</sub> = F<sub>A</sub> + F<sub>g</sub> &nbsp; F<sub>net</sub> = 45,000 + (-20,000) &nbsp; F<sub>net</sub> = 25,000 N', 'F<sub>g</sub> = mg &nbsp; -20,000 = m &middot; (-10) &nbsp; 2000 kg = m', 'a = F<sub>net</sub> / m &nbsp; a = 25,000 / 2000 &nbsp; a = 12.5 m/s²', 'a = (v<sub>f</sub> - v<sub>i</sub>) / t &nbsp; 12.5 = (-.15 - (-2)) / t', '12.5 = 1.85 / t &nbsp; t &middot; 12.5 = 1.85 &nbsp; t = 1.85 / 12.5', 't = .148 s'] },
    { id: 'g-5c', q: 'Circle the graph that best shows the motion of the iron.', w: ['graph b (circled): starts below the axis and rises toward 0'] },
  ] },
  { n: '6', title: 'Paulina\'s walk', station: 'g6', parts: [
    { id: 'g-6', q: '40 m west, then 30 m south. Draw the vector diagram and calculate the resultant displacement.', w: ['&Delta;x<sub>x</sub> = -40 m &nbsp; &Delta;x<sub>y</sub> = -30 m', '&Delta;x<sub>x</sub><sup>2</sup> + &Delta;x<sub>y</sub><sup>2</sup> = &Delta;x<sub>R</sub><sup>2</sup>', '(-40)<sup>2</sup> + (-30)<sup>2</sup> = &Delta;x<sub>R</sub><sup>2</sup>', '1600 + 900 = &Delta;x<sub>R</sub><sup>2</sup>', '&radic;2500 = &radic;&Delta;x<sub>R</sub><sup>2</sup>', '50 m = &Delta;x<sub>R</sub>'], g: () => walkSVG('ok') },
  ] },
  { n: '7', title: 'Five forces on one object', station: 'g7', parts: [
    { id: 'g-7', q: 'Calculate the magnitude of the net force and show its approximate direction.', w: ['F<sub>net,x</sub> = F<sub>1</sub> + F<sub>2</sub> + F<sub>4</sub> &nbsp; F<sub>net,x</sub> = -15 + (-5) + 8 &nbsp; F<sub>net,x</sub> = -12 N', 'F<sub>net,y</sub> = F<sub>3</sub> + F<sub>5</sub> &nbsp; F<sub>net,y</sub> = 15 + (-10) &nbsp; F<sub>net,y</sub> = 5 N', 'F<sub>net,R</sub><sup>2</sup> = F<sub>net,x</sub><sup>2</sup> + F<sub>net,y</sub><sup>2</sup>', 'F<sub>net,R</sub><sup>2</sup> = (-12)<sup>2</sup> + (5)<sup>2</sup> = 144 + 25', '&radic;F<sub>net,R</sub><sup>2</sup> = &radic;169 &nbsp; F<sub>net,R</sub> = 13 N', 'diagram: -12 N to the left and 5 N up, so the resultant points left and a little up'] },
  ] },
];
KEYSETS.quiz2 = { title: 'Acceleration & Newton\'s 2nd Law Quiz Review', short: '2nd Law quiz review', tag: 'Q', list: KEY2 };

// ---------- drawings ----------
const GSPR = {
  train: `<rect x="122" y="122" width="116" height="46" rx="7" style="fill:var(--card);stroke:var(--ink)" stroke-width="2.5"/><rect x="132" y="130" width="22" height="16" rx="3" style="fill:var(--line);stroke:var(--ink)" stroke-width="1.5"/><rect x="162" y="130" width="22" height="16" rx="3" style="fill:var(--line);stroke:var(--ink)" stroke-width="1.5"/><circle cx="144" cy="172" r="8" style="fill:var(--ink)"/><circle cx="216" cy="172" r="8" style="fill:var(--ink)"/>`,
  stunt: `<circle cx="180" cy="112" r="13" style="fill:var(--card);stroke:var(--ink)" stroke-width="2.5"/><path d="M180 125 V160 M180 135 L160 122 M180 135 L200 122 M180 160 L166 186 M180 160 L194 186" fill="none" style="stroke:var(--ink)" stroke-width="3" stroke-linecap="round"/>`,
  truck: `<rect x="126" y="126" width="74" height="40" rx="4" style="fill:var(--card);stroke:var(--ink)" stroke-width="2.5"/><path d="M200 140 H222 L236 154 V166 H200 Z" style="fill:var(--card);stroke:var(--ink)" stroke-width="2.5"/><circle cx="146" cy="170" r="8" style="fill:var(--ink)"/><circle cx="218" cy="170" r="8" style="fill:var(--ink)"/>`,
  barrow: `<path d="M138 132 H218 L204 160 H150 Z" style="fill:var(--card);stroke:var(--ink)" stroke-width="2.5"/><path d="M218 132 L246 124" style="stroke:var(--ink)" stroke-width="3" stroke-linecap="round"/><circle cx="160" cy="170" r="10" style="fill:var(--card);stroke:var(--ink)" stroke-width="2.5"/>`,
};
// An arrow from (x1, y1) to (x2, y2) with a drawn head, so many can sit on one page without marker ids.
function vArrow(x1, y1, x2, y2, col, w = 3) {
  const a = Math.atan2(y2 - y1, x2 - x1), L = 9, s = 0.45;
  const p = (r, d) => `${(x2 - L * Math.cos(a + d)).toFixed(1)},${(y2 - L * Math.sin(a + d)).toFixed(1)}`;
  return `<line x1="${x1}" y1="${y1}" x2="${(x2 - 6 * Math.cos(a)).toFixed(1)}" y2="${(y2 - 6 * Math.sin(a)).toFixed(1)}" style="stroke:var(${col})" stroke-width="${w}" stroke-linecap="round"/><polygon points="${x2},${y2} ${p(0, s)} ${p(0, -s)}" style="fill:var(${col})"/>`;
}
// Paulina's walk: 40 m west then 30 m south (1.6 px per m). Variants for the multiple-choice options.
function walkSVG(kind) {
  const W = vArrow, S = '--f-n', R = '--f-g';
  const d = {
    ok: W(104, 16, 40, 16, S) + W(40, 16, 40, 64, S) + W(104, 16, 40, 64, R),
    back: W(104, 16, 40, 16, S) + W(40, 16, 40, 64, S) + W(40, 64, 104, 16, R),
    tails: W(104, 16, 40, 16, S) + W(104, 16, 104, 64, S) + W(40, 16, 104, 64, R),
    wrongway: W(16, 64, 80, 64, S) + W(80, 64, 80, 16, S) + W(16, 64, 80, 16, R),
  }[kind];
  return `<svg viewBox="0 0 120 80" role="img" aria-label="vector diagram">${d}</svg>`;
}
const FIVE_SVG = `<svg viewBox="0 0 360 250" role="img" aria-label="Five forces on a ball: F1 15 N left, F2 5 N left, F3 15 N up, F4 8 N right, F5 10 N down.">
  ${vArrow(166, 135, 70, 135, '--f-a')}${vArrow(166, 118, 134, 118, '--f-a')}${vArrow(194, 125, 246, 125, '--f-a')}${vArrow(180, 111, 180, 22, '--f-a')}${vArrow(180, 139, 180, 214, '--f-a')}
  <circle cx="180" cy="125" r="15" style="fill:var(--card);stroke:var(--ink)" stroke-width="2.5"/>
  <g style="font:700 13px var(--mono);fill:var(--ink)"><text x="48" y="156">F₁ = 15 N</text><text x="112" y="108">F₂ = 5 N</text><text x="216" y="114">F₄ = 8 N</text><text x="190" y="30">F₃ = 15 N</text><text x="190" y="214">F₅ = 10 N</text></g>
</svg>`;
// Four sketch v-t graphs used on the sheet (a: from 0 rising, b: below the axis rising to 0, c: from 0 falling, d: above the axis falling to 0).
const VT4 = { a: [20, 42, 90, 10], b: [20, 74, 84, 42], c: [20, 42, 90, 74], d: [20, 10, 84, 42] };
const vtOpts = (right, why) => Object.entries(VT4).map(([k, seg]) => ({ t: k + '.', svg: sheetGraph([seg]), ok: k === right, why: why[k] }));
const gfbd = (scene, palette, need, ctx, q, explain, hint) => (el, api) => FBD(el, api, { ctx, q, scene, palette, need, hint, explain });

Game.add({
  id: 'g1', section: 'quiz2', tag: 'Q1', title: 'Superman vs the Runaway Train',
  blurb: 'Direction of acceleration, a = Δv / t, the v-t graph, the FBD, net force, and how hard Superman pushed.',
  steps: [
    (el, api) => MCQ(el, api, {
      ctx: 'Superman is stopping a runaway train that is rolling to the right. Its motor is stuck on and its brakes have failed.',
      q: 'What direction is the train accelerating?', keepOrder: true,
      opts: [
        { t: 'Right', why: 'Right is its velocity. It is slowing down, so the acceleration points the other way.' },
        { t: 'Left', ok: true },
        { t: 'It is not accelerating', why: 'Slowing down is a change in velocity, so it is accelerating.' },
      ],
      explain: 'Moving right and slowing down: the acceleration is opposite the velocity, so it points <b>left</b>.' + keyFor('g-1a'),
    }),
    (el, api) => WORK(el, api, {
      q: 'Before Superman hit it, the train was going 40 m/s. He stops it over 25 s. Calculate the acceleration.',
      eq: 'accel', form: 'a = (v<sub>f</sub> - v<sub>i</sub>) / t', plug: 'a = ([[0]] m/s - [[40]] m/s) / [[25]] s', lhs: 'a =', ans: -1.6, tol: 0.02, unit: 'm/s²', finalLine: 'a = -1.6 m/s²',
      hint: 'It stops, so v<sub>f</sub> = 0. Final minus initial, then divide by the time.',
      after: keyFor('g-1b'),
    }),
    (el, api) => GRAPHDRAW(el, api, {
      q: 'Sketch the <b>velocity-time</b> graph for the train while Superman stops it.', x: [0, 30, 5], y: [-40, 40, 20], snap: [5, 10], yl: 'v - velocity (m/s)',
      pts: [[0, 40], [25, 0]], hint: 'It starts at 40 m/s at t = 0, and it is stopped (0 m/s) at 25 s.',
      explain: 'A straight line from 40 m/s at 0 s down to 0 m/s at 25 s. The slope is the acceleration, -1.6 m/s².' + keyFor('g-1c'),
    }),
    gfbd(GSPR.train, ['Fg', 'FN', 'FA', 'Feng', 'Ff'], { up: ['FN'], down: ['Fg'], left: ['FA'], right: ['Feng'] },
      'The engine is stuck on and still pushing right. Use F<sub>A</sub> for Superman\'s push.', 'Draw the free body diagram for the train as it accelerates.',
      'Superman pushes left, the engine pushes right, the track pushes up, and gravity pulls down. Superman\'s arrow should be longer, because the net force points left.' + keyFor('g-1d'),
      'Two horizontal forces: the engine pushes right and Superman pushes left. Then add the two vertical ones.'),
    (el, api) => WORK(el, api, {
      q: 'The train has a mass of 50,000 kg. Determine the net force acting on it.',
      eq: 'a2', form: 'a = F<sub>net</sub> / m', plug: '[[-1.6]] m/s² = F<sub>net</sub> / [[50000]] kg', lhs: 'F<sub>net</sub> =', ans: -80000, tol: 1, unit: 'N', finalLine: 'F<sub>net</sub> = -80,000 N',
      hint: 'Multiply both sides by the mass: -1.6 × 50,000.',
      after: keyFor('g-1e'),
    }),
    (el, api) => WORK(el, api, {
      q: 'The engine was stuck on, pushing forward with 15,000 N the whole time. How hard did Superman push to stop the train?',
      eq: 'net', form: 'F<sub>net</sub> = F<sub>superman</sub> + F<sub>engine</sub>', plug: '[[-80000]] N = F<sub>superman</sub> + [[15000]] N', lhs: 'F<sub>superman</sub> =', ans: -95000, tol: 1, unit: 'N', finalLine: 'F<sub>superman</sub> = -95,000 N',
      hint: 'Subtract the engine\'s 15,000 N from both sides: -80,000 - 15,000.',
      after: 'Superman has to cancel the engine <i>and</i> supply the -80,000 N net force.' + keyFor('g-1f'),
    }),
    (el, api) => MCQ(el, api, {
      q: 'If the same forces acted on the train but its mass was only <b>half</b>, how would the acceleration change?',
      opts: [
        { t: 'It would accelerate 2x as fast', ok: true },
        { t: 'It would accelerate half as fast', why: 'Less mass means less inertia, so more acceleration, not less.' },
        { t: 'It would stay the same', why: 'a = F<sub>net</sub> / m, so changing m changes a.' },
        { t: 'It would accelerate 4x as fast', why: 'Only the mass changed, by a factor of 2, so a changes by 2.' },
      ],
      explain: 'a = F<sub>net</sub> / m: acceleration and mass are <b>inversely</b> proportional. Half the mass, double the acceleration.' + keyFor('g-1g'),
    }),
  ],
});

Game.add({
  id: 'g2', section: 'quiz2', tag: 'Q2', title: 'The Stuntman Cannon',
  blurb: 'While he is being launched: the FBD, the signs, net force, mass from weight, acceleration, final velocity, and the graph.',
  steps: [
    gfbd(GSPR.stunt, ['Fg', 'FN', 'FA', 'Fair'], { up: ['FA'], down: ['Fg'] },
      'A stuntman launches himself straight up with a cannon. These questions are about while he is <b>being launched</b>, not when he is in the air.',
      'Draw the free body diagram for the stuntman while the cannon launches him.',
      'The cannon pushes up (F<sub>A</sub>, the long arrow) and gravity pulls down. He speeds up upward, so F<sub>A</sub> is bigger.' + keyFor('g-2a'),
      'Inside the cannon, two things act on him: the cannon and gravity.'),
    (el, api) => MCQ(el, api, {
      q: 'While he is being launched, what are the directions of his <b>velocity</b>, the <b>net force</b>, and his <b>acceleration</b>?',
      opts: [
        { t: 'velocity +, net force +, acceleration +', ok: true },
        { t: 'velocity +, net force 0, acceleration 0', why: 'He speeds up inside the cannon, so there is a net force and an acceleration.' },
        { t: 'velocity +, net force -, acceleration -', why: 'A net force down would slow him down. The cannon is speeding him up.' },
        { t: 'velocity -, net force +, acceleration +', why: 'He moves up, so his velocity is +.' },
      ],
      explain: 'Moving up (+) and speeding up: the net force and the acceleration point the same way as the velocity, so all three are +.' + keyFor('g-2b'),
    }),
    (el, api) => WORK(el, api, {
      q: 'The stuntman weighs 800 N, and the cannon pushes him with 3360 N. Calculate the net force on him.',
      eq: 'net', form: 'F<sub>net</sub> = F<sub>A</sub> + F<sub>g</sub>', plug: 'F<sub>net</sub> = [[3360]] N + ([[-800]] N)', lhs: 'F<sub>net</sub> =', ans: 2560, unit: 'N', finalLine: 'F<sub>net</sub> = 2560 N',
      hint: 'Weight points down, so it goes in as -800 N.',
      after: keyFor('g-2e'),
    }),
    (el, api) => WORK(el, api, {
      q: 'To find his acceleration you need his mass. Use his weight to find it.',
      eq: 'Fg', form: 'F<sub>g</sub> = m &middot; g', plug: '[[-800]] N = m &middot; ([[-10]] N/kg)', lhs: 'm =', ans: 80, unit: 'kg', finalLine: 'm = 80 kg',
      hint: 'Divide -800 by -10.',
    }),
    (el, api) => WORK(el, api, {
      q: 'Now calculate the acceleration of the stuntman.',
      eq: 'a2', form: 'a = F<sub>net</sub> / m', plug: 'a = [[2560]] N / [[80]] kg', lhs: 'a =', ans: 32, unit: 'm/s²', finalLine: 'a = 32 m/s²',
      hint: 'Use the net force (2560 N), not the cannon\'s force.',
      after: keyFor('g-2f'),
    }),
    (el, api) => WORK(el, api, {
      q: 'He is accelerated for 0.75 s, starting from rest. Determine his velocity at the end of being launched.',
      eq: 'accel', form: 'a = (v<sub>f</sub> - v<sub>i</sub>) / t', plug: '[[32]] m/s² = (v<sub>f</sub> - [[0]] m/s) / [[0.75]] s', lhs: 'v<sub>f</sub> =', ans: 24, unit: 'm/s', finalLine: 'v<sub>f</sub> = 24 m/s',
      hint: 'Multiply both sides by 0.75 s.',
      after: keyFor('g-2g'),
    }),
    (el, api) => MCQ(el, api, {
      q: 'Which graph best shows the motion of the stuntman while he is launched?', keepOrder: true,
      opts: vtOpts('a', { b: 'Below the axis is a negative velocity. He moves up (+).', c: 'This one is negative and speeding up. He moves up.', d: 'This one is slowing down. The cannon speeds him up.' }),
      explain: 'He starts at rest and speeds up in the + direction: a line starting at 0 and rising.' + keyFor('g-2h'),
    }),
  ],
});

Game.add({
  id: 'g3', section: 'quiz2', tag: 'Q3', title: 'The Truck Skids to a Stop',
  blurb: 'A 1200 kg truck brakes with -10,200 N for 2.2 s. Work backward to its starting velocity.',
  steps: [
    gfbd(GSPR.truck, ['Fg', 'FN', 'FA', 'Ff', 'Feng'], { up: ['FN'], down: ['Fg'], left: ['Ff'] },
      'A 1200 kg truck is moving right and skids to a stop. Its brakes apply -10,200 N of stopping force (use F<sub>f</sub> for the brakes).',
      'Draw the free body diagram while it skids.',
      'The brakes push left (F<sub>B</sub>), the road pushes up, and gravity pulls down. No engine force while it skids.' + keyFor('g-3'),
      'It is skidding, so nothing pushes it forward.'),
    (el, api) => MCQ(el, api, {
      q: 'What is the net force on the truck while it skids?',
      opts: [
        { t: '-10,200 N: F<sub>N</sub> and F<sub>g</sub> cancel, so the brakes are the net force', ok: true },
        { t: '0 N, because it ends up stopped', why: 'It is still moving and slowing down while it skids, so the net force is not zero.' },
        { t: '+10,200 N', why: 'The brakes push opposite the motion, which is the negative direction.' },
        { t: '-10,200 N plus the truck\'s weight', why: 'Weight is vertical and is cancelled by the normal force. Only horizontal forces change its speed.' },
      ],
      explain: 'Up and down cancel. The only horizontal force is the brakes, so F<sub>net</sub> = F<sub>B</sub> = -10,200 N.',
    }),
    (el, api) => WORK(el, api, {
      q: 'Calculate the truck\'s acceleration while it skids.',
      eq: 'a2', form: 'a = F<sub>net</sub> / m', plug: 'a = [[-10200]] N / [[1200]] kg', lhs: 'a =', ans: -8.5, unit: 'm/s²', finalLine: 'a = -8.5 m/s²',
      hint: 'Divide the net force by the mass.',
    }),
    (el, api) => WORK(el, api, {
      q: 'It takes 2.2 s to stop. Calculate the initial velocity of the truck before it hit the brakes.',
      eq: 'accel', form: 'a = (v<sub>f</sub> - v<sub>i</sub>) / t', plug: '[[-8.5]] m/s² = ([[0]] m/s - v<sub>i</sub>) / [[2.2]] s', lhs: 'v<sub>i</sub> =', ans: 18.7, unit: 'm/s', finalLine: 'v<sub>i</sub> = 18.7 m/s',
      hint: 'Multiply both sides by 2.2 s: -18.7 = -v<sub>i</sub>.',
      after: keyFor('g-3'),
    }),
  ],
});

Game.add({
  id: 'g4', section: 'quiz2', tag: 'Q4', title: 'Melinda\'s Wheelbarrow',
  blurb: 'Backing up a 170 kg wheelbarrow: acceleration, net force, then the friction she pulls against.',
  steps: [
    gfbd(GSPR.barrow, ['Fg', 'FN', 'FA', 'Ff'], { up: ['FN'], down: ['Fg'], left: ['FA'], right: ['Ff'] },
      'Melinda is backing up (moving left, -) her wheelbarrow full of bricks. She pulls with F<sub>A</sub> = -285 N.',
      'Draw the free body diagram while she speeds it up.',
      'She pulls left (F<sub>A</sub> = -285 N), friction pushes right against the motion, the ground pushes up, and gravity pulls down.' + keyFor('g-4'),
      'Friction always points against the motion. She is moving left.'),
    (el, api) => WORK(el, api, {
      q: 'It takes her 6 s to get the wheelbarrow from rest to -1.2 m/s. Calculate the acceleration.',
      eq: 'accel', form: 'a = (v<sub>f</sub> - v<sub>i</sub>) / t', plug: 'a = ([[-1.2]] m/s - [[0]] m/s) / [[6]] s', lhs: 'a =', ans: -0.2, tol: 0.005, unit: 'm/s²', finalLine: 'a = -0.2 m/s²',
      hint: 'Final minus initial: -1.2 - 0. Then divide by 6.',
    }),
    (el, api) => WORK(el, api, {
      q: 'The wheelbarrow and bricks have a mass of 170 kg. Calculate the net force.',
      eq: 'a2', form: 'a = F<sub>net</sub> / m', plug: '[[-0.2]] m/s² = F<sub>net</sub> / [[170]] kg', lhs: 'F<sub>net</sub> =', ans: -34, unit: 'N', finalLine: 'F<sub>net</sub> = -34 N',
      hint: 'Multiply both sides by 170.',
    }),
    (el, api) => WORK(el, api, {
      q: 'She pulls with -285 N. Calculate the friction she has to pull against.',
      eq: 'net', form: 'F<sub>net</sub> = F<sub>f</sub> + F<sub>A</sub>', plug: '[[-34]] N = F<sub>f</sub> + ([[-285]] N)', lhs: 'F<sub>f</sub> =', ans: 251, unit: 'N', finalLine: 'F<sub>f</sub> = 251 N',
      hint: 'Add 285 to both sides: -34 + 285.',
      after: 'Positive: friction points right, against her backward motion.' + keyFor('g-4'),
    }),
  ],
});

Game.add({
  id: 'g5', section: 'quiz2', tag: 'Q5', title: 'The Crane and the Iron',
  blurb: 'Lowering 20,000 N of iron at constant velocity, then slowing it down in time so it doesn\'t get damaged.',
  steps: [
    (el, api) => MCQ(el, api, {
      ctx: 'A crane is lowering a pile of iron that weighs 20,000 N. The iron moves downward at a constant -2 m/s.',
      q: 'What is the net force on the iron?',
      opts: [
        { t: '0 N, because it moves at a constant velocity', ok: true },
        { t: '-20,000 N, because it is moving down', why: 'Moving down does not need a net force. Constant velocity means balanced.' },
        { t: '+20,000 N', why: 'That is the crane\'s force. The net force adds the crane and gravity.' },
        { t: '-2 N', why: '-2 m/s is a velocity, not a force.' },
      ],
      explain: 'Constant velocity means balanced forces, so F<sub>net</sub> = 0 N.',
    }),
    (el, api) => WORK(el, api, {
      q: 'Show your calculation of the upward force applied by the crane during this time.',
      eq: 'net', form: 'F<sub>net</sub> = F<sub>g</sub> + F<sub>A</sub>', plug: '[[0]] N = ([[-20000]] N) + F<sub>A</sub>', lhs: 'F<sub>A</sub> =', ans: 20000, tol: 1, unit: 'N', finalLine: 'F<sub>A</sub> = 20,000 N',
      hint: 'Add 20,000 to both sides.',
      after: keyFor('g-5a'),
    }),
    gfbd(SPR.hang, ['Fg', 'FN', 'FA', 'Fair'], { up: ['FA'], down: ['Fg'] },
      'To avoid damage, the iron has to be slowed down before it lands. The crane pulls up with its maximum, 45,000 N.',
      'Draw the free body diagram while the crane slows the iron down.',
      'The crane pulls up (F<sub>A</sub> = 45,000 N, the longer arrow) and gravity pulls down (20,000 N). The net force is up while it moves down, so it slows down.',
      'Use F<sub>A</sub> for the crane.'),
    (el, api) => WORK(el, api, {
      q: 'Calculate the net force on the iron while the crane pulls with 45,000 N.',
      eq: 'net', form: 'F<sub>net</sub> = F<sub>A</sub> + F<sub>g</sub>', plug: 'F<sub>net</sub> = [[45000]] N + ([[-20000]] N)', lhs: 'F<sub>net</sub> =', ans: 25000, tol: 1, unit: 'N', finalLine: 'F<sub>net</sub> = 25,000 N',
      hint: 'Gravity goes in as negative.',
    }),
    (el, api) => WORK(el, api, {
      q: 'Find the mass of the iron from its weight.',
      eq: 'Fg', form: 'F<sub>g</sub> = m &middot; g', plug: '[[-20000]] N = m &middot; ([[-10]] N/kg)', lhs: 'm =', ans: 2000, tol: 1, unit: 'kg', finalLine: 'm = 2000 kg',
      hint: 'Divide -20,000 by -10.',
    }),
    (el, api) => WORK(el, api, {
      q: 'Calculate the acceleration of the iron.',
      eq: 'a2', form: 'a = F<sub>net</sub> / m', plug: 'a = [[25000]] N / [[2000]] kg', lhs: 'a =', ans: 12.5, unit: 'm/s²', finalLine: 'a = 12.5 m/s²',
      hint: 'Net force divided by mass.',
    }),
    (el, api) => WORK(el, api, {
      q: 'It must hit the ground going no faster than -0.15 m/s. How much time must the operator allow for slowing it down from -2 m/s?',
      eq: 'accel', form: 'a = (v<sub>f</sub> - v<sub>i</sub>) / t', plug: '[[12.5]] m/s² = ([[-0.15]] m/s - ([[-2]] m/s)) / t', lhs: 't =', ans: 0.148, tol: 0.003, unit: 's', finalLine: 't = 0.148 s',
      hint: '-0.15 - (-2) = 1.85. Then t = 1.85 / 12.5.',
      after: keyFor('g-5b'),
    }),
    (el, api) => MCQ(el, api, {
      q: 'Which graph best shows the motion of the iron while it is slowed down?', keepOrder: true,
      opts: vtOpts('b', { a: 'Above the axis means moving up. The iron moves down.', c: 'This one moves down but speeds up. The crane slows it down.', d: 'Above the axis means moving up. The iron moves down.' }),
      explain: 'Moving down (below the axis) and slowing down (getting closer to 0): a line below the axis rising toward it.' + keyFor('g-5c'),
    }),
  ],
});

Game.add({
  id: 'g6', section: 'quiz2', tag: 'Q6', title: 'Paulina\'s Walk',
  blurb: '40 m west, then 30 m south. Pick the vector diagram, then find the resultant with Pythagoras.',
  steps: [
    (el, api) => MCQ(el, api, {
      q: 'Paulina walks 40 m west and then 30 m south. Which vector diagram correctly adds the two displacements? (Blue = her walks, red = resultant.)', keepOrder: true,
      opts: [
        { t: 'a.', svg: walkSVG('ok'), ok: true },
        { t: 'b.', svg: walkSVG('back'), why: 'The resultant points backward. It should go from where she started to where she ended.' },
        { t: 'c.', svg: walkSVG('tails'), why: 'The vectors start at the same point. Add them tail to tip: the second starts where the first ends.' },
        { t: 'd.', svg: walkSVG('wrongway'), why: 'These go east and north. She walked west, then south.' },
      ],
      explain: 'Tail to tip: 40 m west, then 30 m south starting from the end of the first arrow. The resultant goes from the first tail to the last tip.' + keyFor('g-6'),
    }),
    (el, api) => WORK(el, api, {
      q: 'Calculate the magnitude of her resultant displacement.',
      eq: 'pyth', form: '&Delta;x<sub>x</sub><sup>2</sup> + &Delta;x<sub>y</sub><sup>2</sup> = &Delta;x<sub>R</sub><sup>2</sup>', plug: '([[-40]] m)<sup>2</sup> + ([[-30]] m)<sup>2</sup> = &Delta;x<sub>R</sub><sup>2</sup>', lhs: '&Delta;x<sub>R</sub> =', ans: 50, unit: 'm', finalLine: '&Delta;x<sub>R</sub> = 50 m',
      hint: '1600 + 900 = 2500. Then take the square root.',
      after: keyFor('g-6'),
    }),
  ],
});

Game.add({
  id: 'g7', section: 'quiz2', tag: 'Q7', title: 'Five Forces, One Object',
  blurb: 'Add the x forces, add the y forces, then combine them with Pythagoras.',
  steps: [
    (el, api) => WORK(el, api, {
      media: FIVE_SVG, q: 'Start with the horizontal forces. Calculate F<sub>net,x</sub>.',
      eq: 'net', form: 'F<sub>net,x</sub> = F<sub>1</sub> + F<sub>2</sub> + F<sub>4</sub>', plug: 'F<sub>net,x</sub> = ([[-15]] N) + ([[-5]] N) + [[8]] N', lhs: 'F<sub>net,x</sub> =', ans: -12, unit: 'N', finalLine: 'F<sub>net,x</sub> = -12 N',
      hint: 'Left is negative: -15 + (-5) + 8.',
    }),
    (el, api) => WORK(el, api, {
      media: FIVE_SVG, q: 'Now the vertical forces. Calculate F<sub>net,y</sub>.',
      eq: 'net', form: 'F<sub>net,y</sub> = F<sub>3</sub> + F<sub>5</sub>', plug: 'F<sub>net,y</sub> = [[15]] N + ([[-10]] N)', lhs: 'F<sub>net,y</sub> =', ans: 5, unit: 'N', finalLine: 'F<sub>net,y</sub> = 5 N',
      hint: 'Down is negative: 15 + (-10).',
    }),
    (el, api) => WORK(el, api, {
      q: 'F<sub>net,x</sub> = -12 N and F<sub>net,y</sub> = 5 N are at right angles. Calculate the magnitude of the net force.',
      eq: 'pyth', form: 'F<sub>net,R</sub><sup>2</sup> = F<sub>net,x</sub><sup>2</sup> + F<sub>net,y</sub><sup>2</sup>', plug: 'F<sub>net,R</sub><sup>2</sup> = ([[-12]] N)<sup>2</sup> + ([[5]] N)<sup>2</sup>', lhs: 'F<sub>net,R</sub> =', ans: 13, unit: 'N', finalLine: 'F<sub>net,R</sub> = 13 N',
      hint: '144 + 25 = 169. The square root of 169 is 13.',
      after: keyFor('g-7'),
    }),
    (el, api) => MCQ(el, api, {
      q: 'Which way does the 13 N net force point, approximately?',
      opts: [
        { t: 'Left and a little up', svg: `<svg viewBox="0 0 80 50" role="img" aria-label="arrow left and a little up">${vArrow(70, 34, 12, 14, '--f-g')}</svg>`, ok: true },
        { t: 'Right and a little up', svg: `<svg viewBox="0 0 80 50" role="img" aria-label="arrow right and a little up">${vArrow(10, 34, 68, 14, '--f-g')}</svg>`, why: 'F<sub>net,x</sub> is -12 N, so it points left.' },
        { t: 'Left and a little down', svg: `<svg viewBox="0 0 80 50" role="img" aria-label="arrow left and a little down">${vArrow(70, 14, 12, 34, '--f-g')}</svg>`, why: 'F<sub>net,y</sub> is +5 N, so it points up.' },
        { t: 'Up and a little left', svg: `<svg viewBox="0 0 80 50" role="img" aria-label="arrow up and a little left">${vArrow(48, 46, 30, 4, '--f-g')}</svg>`, why: 'The left part (12 N) is bigger than the up part (5 N), so it points mostly left.' },
      ],
      explain: '-12 N left and +5 N up: mostly left, tilted a little up. (tan θ = 5 / 12, so about 23° above the left direction.)',
    }),
  ],
});

// ---------- boss: random versions of the quiz review questions ----------
const GUIDE_GENS = [
  () => { const v = pick([20, 30, 40, 50]), t = pick([10, 20, 25]); const a = +(-v / t).toFixed(2); return { num: { q: `A train rolling at ${v} m/s is stopped over ${t} s. What is its acceleration?`, ans: a, tol: 0.02, unit: 'm/s²', explain: eqs('a = (v<sub>f</sub> - v<sub>i</sub>) / t', `a = (0 m/s - ${v} m/s) / ${t} s`, `a = ${a} m/s²`) } }; },
  () => { const m = pick([1000, 2000, 5000]), a = pick([-1.5, -2, -3]); return { num: { q: `A ${m} kg vehicle accelerates at ${a} m/s². What is the net force on it?`, ans: m * a, tol: 1, unit: 'N', explain: eqs('a = F<sub>net</sub> / m', `${a} m/s² = F<sub>net</sub> / ${m} kg`, `F<sub>net</sub> = ${m * a} N`) } }; },
  () => { const W = pick([600, 700, 900]), F = pick([2000, 2500, 3000]); return { num: { q: `A stuntman weighs ${W} N. The cannon pushes him up with ${F} N. What is the net force?`, ans: F - W, unit: 'N', explain: eqs('F<sub>net</sub> = F<sub>A</sub> + F<sub>g</sub>', `F<sub>net</sub> = ${F} N + (-${W} N)`, `F<sub>net</sub> = ${F - W} N`) } }; },
  () => { const W = pick([500, 800, 1200, 20000]); return { num: { q: `An object weighs ${W} N on Earth. What is its mass?`, ans: W / 10, tol: 0.05, unit: 'kg', explain: eqs('F<sub>g</sub> = m · g', `-${W} N = m · (-10 N/kg)`, `m = ${W / 10} kg`) } }; },
  () => { const a = pick([8, 12, 20, 32]), t = pick([0.5, 0.75, 1.5]); return { num: { q: `Starting from rest, a stuntman accelerates at ${a} m/s² for ${t} s. What is his final velocity?`, ans: a * t, tol: 0.05, unit: 'm/s', explain: eqs('a = (v<sub>f</sub> - v<sub>i</sub>) / t', `${a} m/s² = (v<sub>f</sub> - 0) / ${t} s`, `v<sub>f</sub> = ${a * t} m/s`) } }; },
  () => { const m = pick([100, 150, 200]), a = pick([-0.2, -0.5]), FA = pick([-200, -300]); const Fn = +(m * a).toFixed(2), Ff = +(Fn - FA).toFixed(2); return { num: { q: `A ${m} kg cart is pulled backward with ${FA} N and accelerates at ${a} m/s². How much friction acts on it?`, ans: Ff, tol: 0.5, unit: 'N', explain: eqs(`F<sub>net</sub> = m · a = ${m} · (${a}) = ${Fn} N`, 'F<sub>net</sub> = F<sub>f</sub> + F<sub>A</sub>', `${Fn} N = F<sub>f</sub> + (${FA} N)`, `F<sub>f</sub> = ${Ff} N`) } }; },
  () => { const [x, y, r] = pick([[6, 8, 10], [9, 12, 15], [5, 12, 13], [8, 15, 17]]); return { num: { q: `Someone walks ${x} m west and then ${y} m south. What is the magnitude of the resultant displacement?`, ans: r, unit: 'm', explain: eqs('&Delta;x<sub>R</sub><sup>2</sup> = &Delta;x<sub>x</sub><sup>2</sup> + &Delta;x<sub>y</sub><sup>2</sup>', `&Delta;x<sub>R</sub><sup>2</sup> = (-${x})<sup>2</sup> + (-${y})<sup>2</sup> = ${x * x + y * y}`, `&Delta;x<sub>R</sub> = ${r} m`) } }; },
  () => { const m = pick([1000, 1500, 2000]), F = pick([-6000, -9000, -12000]), t = pick([2, 3]); const a = F / m, vi = +(-a * t).toFixed(2); return { num: { q: `A ${m} kg truck brakes with ${F} N and stops in ${t} s. How fast was it going before braking?`, ans: vi, tol: 0.05, unit: 'm/s', explain: eqs(`a = F<sub>net</sub> / m = ${F} / ${m} = ${a} m/s²`, `${a} = (0 - v<sub>i</sub>) / ${t}`, `v<sub>i</sub> = ${vi} m/s`) } }; },
  () => ({ mcq: { q: 'A car moving right slows to a stop. Which way does it accelerate?', opts: [{ t: 'Left', ok: true }, { t: 'Right', why: 'Right is its velocity. Slowing down makes a opposite.' }, { t: 'It is not accelerating', why: 'Slowing down is a change in velocity.' }, { t: 'Up', why: 'The motion is horizontal.' }], explain: 'Slowing down: acceleration points opposite the velocity.' } }),
  () => ({ mcq: { q: 'Same net force, but the mass is cut in half. The acceleration...', opts: [{ t: 'doubles', ok: true }, { t: 'halves', why: 'Less mass means more acceleration.' }, { t: 'stays the same', why: 'a = F<sub>net</sub> / m depends on m.' }, { t: 'quadruples', why: 'Mass changed by 2, so a changes by 2.' }], explain: 'a = F<sub>net</sub> / m: mass and acceleration are inversely proportional.' } }),
  () => ({ mcq: { q: 'A crane lowers a 5000 N load at a constant -1 m/s. How hard does the crane pull up?', opts: [{ t: '5000 N, equal to the weight', ok: true }, { t: 'Less than 5000 N, since it moves down', why: 'Then the net force would be down and it would speed up.' }, { t: 'More than 5000 N', why: 'Then the net force would be up and it would slow down.' }, { t: '0 N', why: 'Then it would be in free fall.' }], explain: 'Constant velocity: F<sub>net</sub> = 0, so the crane balances the weight.' } }),
  () => ({ mcq: { q: 'Something moving down (negative) is slowing down. Its v-t graph is...', opts: [{ t: 'below the axis, rising toward it', ok: true }, { t: 'below the axis, falling away from it', why: 'Moving away from the axis means speeding up.' }, { t: 'above the axis, falling toward it', why: 'Above the axis means moving up (+).' }, { t: 'flat on the axis', why: 'That would be at rest.' }], explain: 'Negative velocity = below the axis. Slowing down = getting closer to 0.' } }),
  () => ({ mcq: { q: 'While a cannon launches a stuntman upward, the net force on him points...', opts: [{ t: 'up', ok: true }, { t: 'down', why: 'He is speeding up upward, so the net force is up.' }, { t: 'nowhere, it is zero', why: 'He speeds up, so the forces are unbalanced.' }, { t: 'sideways', why: 'Everything here is vertical.' }], explain: 'Speeding up upward: net force and acceleration point up.' } }),
];
Game.add({
  id: 'gboss', boss: true, section: 'quiz2', tag: 'Quiz Boss', title: 'Quiz Review Showdown',
  blurb: '10 random questions in the style of the quiz review. Three hearts, timed.',
  steps: (store => Array.from({ length: 10 }, (_, k) => bossStep(k, GUIDE_GENS, store)))({}),
});
