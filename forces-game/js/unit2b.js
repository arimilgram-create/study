// Balanced Forces & Constant Velocity test review, part 2 (Test Q8, Q9 x2, Q12, Q13) + test-day boss.

// ---------------- Test Q8: desk normal force ----------------
function deskPress(el, api) {
  el.append(h('div', { class: 'q' }, 'Press-down lab: push down on the 12 kg desk and watch the floor push back.'), h('p', { class: 'ctx', html: 'Slide your push up to <b>15 N</b>.' }));
  const scene = h('div', { class: 'panel' }), read = h('div', { class: 'readout' });
  const sl = h('input', { type: 'range', min: 0, max: 30, step: 1, value: 0, id: 'pressSlider' });
  el.append(h('div', { class: 'sim' }, scene, h('div', { style: 'display:flex;flex-direction:column;gap:10px;min-width:0' }, h('label', { for: 'pressSlider', class: 'hint' }, 'Your push down (N)'), sl, read)));
  const draw = () => {
    const P = +sl.value, FN = 120 + P, k = 0.32;
    scene.innerHTML = `<svg viewBox="0 0 360 300" role="img" aria-label="desk with forces">${deskSVG(180, 170)}
      ${P ? arrowSVG(150, 142 - P * k - 18, 150, 140, '--f-a', 'A', 112, 128) : ''}
      ${arrowSVG(208, 142, 208, 142 - FN * k, '--f-n', 'N', 216, 150 - FN * k)}${arrowSVG(180, 200, 180, 200 + 120 * k, '--f-g', 'g', 188, 200 + 120 * k)}</svg>`;
    read.innerHTML = `<span>&Sigma;F = F<sub>N</sub> + F<sub>g</sub> + F<sub>A</sub></span><span>0 N = F<sub>N</sub> + (-120 N) + (-${P} N)</span><span class="big">F<sub>N</sub> = ${FN} N</span>`;
    if (P >= 15 && !el.querySelector('.next-row')) { api.right(10, read); api.done('Your push down is one more force in the &Sigma;F equation. The floor has to push up harder to keep the desk balanced.'); }
  };
  sl.oninput = draw; draw();
}
Game.add({
  id: 'v6', section: 'unit2', tag: 'Test Q8', title: 'Desk Normal Force',
  blurb: 'A 12 kg desk: find the normal force, then push down on it with -15 N.',
  steps: [
    (el, api) => FBD(el, api, { ctx: 'A 12 kg school desk sits on the floor.', q: 'Build the desk\'s free body diagram.', scene: deskSVG(), palette: ['Fg', 'FN', 'FA', 'Ff'], need: { up: ['FN'], down: ['Fg'], left: [], right: [] }, explain: 'Gravity down, the floor pushes up. Balanced: it\'s at rest.' }),
    (el, api) => WORK(el, api, { q: 'Calculate the weight of the 12 kg desk.', eq: 'Fg', plug: 'F<sub>g</sub> = [[12]] kg &middot; ([[-10]] N/kg)', ans: -120, unit: 'N', finalLine: 'F<sub>g</sub> = -120 N' }),
    (el, api) => WORK(el, api, { q: 'Show your work for the normal force holding up the desk.', eq: 'net', form: '&Sigma;F = F<sub>g</sub> + F<sub>N</sub>', plug: '[[0]] N = ([[-120]] N) + F<sub>N</sub>', lhs: 'F<sub>N</sub> =', ans: 120, unit: 'N', finalLine: '120 N = F<sub>N</sub>', after: keyFor('8a'), signMsg: 'Right size! The floor pushes UP, so it\'s positive.' }),
    deskPress,
    (el, api) => MCQ(el, api, {
      q: 'What is different about the calculation when you push down on the desk with -15 N?',
      opts: [
        { t: 'The -15 N push is one more force in &Sigma;F, so F<sub>N</sub> has to be bigger.', ok: true },
        { t: 'Nothing changes. F<sub>N</sub> is still 120 N.', why: 'The floor now has to hold up the desk AND your push.' },
        { t: 'F<sub>N</sub> gets smaller: 120 - 15 = 105 N.', why: 'Pushing down makes the floor push back harder, not softer.' },
        { t: 'The desk\'s mass changes.', why: 'Mass doesn\'t change. You just added a force.' },
      ],
      explain: 'Add the push to the equation: &Sigma;F = F<sub>N</sub> + F<sub>g</sub> + F<sub>A</sub>.',
    }),
    (el, api) => WORK(el, api, { q: 'Calculate the new normal force while you push down with -15 N.', eq: 'net', form: '&Sigma;F = F<sub>g</sub> + F<sub>N</sub> + F<sub>A</sub>', plug: '[[0]] N = ([[-120]] N) + F<sub>N</sub> + ([[-15]] N)', lhs: 'F<sub>N</sub> =', ans: 135, unit: 'N', finalLine: '135 N = F<sub>N</sub>', after: keyFor('8b') }),
  ],
});

// ---------------- Test Q9: Larry's shopping cart ----------------
const cartV = plotSVG({ x: [0, 6, 1], y: [-5, 5, 1], yl: 'v - velocity (m/s)' }, [[0, 3], [2.5, 3], [2.5, 0.5], [6, 0.5]]);
const cartFBD = v => v > 1 ? { up: ['FN', 34], down: ['Fg', 34], right: ['FA', 22], left: ['Ff', 22] } : { up: ['FN', 34], down: ['Fg', 34], right: ['FA', 52], left: ['Ff', 52] };
Game.add({
  id: 'v7', section: 'unit2', tag: 'Test Q9', title: 'Larry\'s Cart',
  blurb: 'Parking lot to grass: read the velocity graph, find displacement and force, draw the position graph.',
  steps: [
    (el, api) => NUM(el, api, {
      ctx: 'Larry pushes a shopping cart across the parking lot at a constant velocity with 12 N. Then he cuts across the grass, where friction rises to -80 N, and he pushes it at a slower constant velocity.',
      media: cartV, q: 'Read the graph: what is the cart\'s velocity in the <b>parking lot</b>?', ans: 3, unit: 'm/s', noWork: true, noLock: true,
      hint: 'Find the first flat line and read its value off the velocity axis.', explain: 'The first flat line sits at 3 m/s (from 0 to 2.5 s).' + keyFor('9a'),
    }),
    (el, api) => NUM(el, api, { media: cartV, q: 'And the cart\'s velocity on the <b>grass</b>?', ans: 0.5, tol: 0.05, unit: 'm/s', noWork: true, noLock: true, hint: 'The second flat line is between 0 and 1 m/s.', explain: 'The second flat line is at 0.5 m/s (from 2.5 to 6 s).' + keyFor('9a') }),
    (el, api) => WORK(el, api, { media: cartV, ctx: 'Total displacement: do it like the answer key, one part at a time. Part 1 is the parking lot (0 to 2.5 s).', q: 'Find &Delta;x<sub>1</sub>, the displacement in the parking lot.', eq: 'vavg', form: 'v = &Delta;x / t', plug: '[[3]] m/s = &Delta;x<sub>1</sub> / [[2.5]] s', lhs: '&Delta;x<sub>1</sub> =', ans: 7.5, unit: 'm', finalLine: '7.5 m = &Delta;x<sub>1</sub>', hint: 'Multiply both sides by the time.' }),
    (el, api) => WORK(el, api, { media: cartV, q: 'Find &Delta;x<sub>2</sub>, the displacement on the grass (2.5 s to 6 s, so 3.5 s).', eq: 'vavg', form: 'v = &Delta;x / t', plug: '[[0.5]] m/s = &Delta;x<sub>2</sub> / [[3.5]] s', lhs: '&Delta;x<sub>2</sub> =', ans: 1.75, tol: 0.011, unit: 'm', finalLine: '&Delta;x<sub>2</sub> = 1.75 m', hint: 'The grass part lasts 6 - 2.5 = 3.5 s.' }),
    (el, api) => WORK(el, api, { media: cartV, q: 'Now the total displacement for the whole motion.', eq: 'dxsum', form: '&Delta;x<sub>T</sub> = &Delta;x<sub>1</sub> + &Delta;x<sub>2</sub>', plug: '&Delta;x<sub>T</sub> = [[7.5]] m + [[1.75]] m', lhs: '&Delta;x<sub>T</sub> =', ans: 9.25, tol: 0.011, unit: 'm', finalLine: '&Delta;x<sub>T</sub> = 9.25 m', after: 'Same answer as the area under the v-t graph.' + keyFor('9b') }),
    (el, api) => WORK(el, api, {
      q: 'Calculate the force Larry needs to push the cart forward on the grass (friction = -80 N, constant velocity).', eq: 'net', form: 'F<sub>net,x</sub> = F<sub>A</sub> + F<sub>f</sub>',
      plug: '[[0]] N = F<sub>A</sub> + ([[-80]] N)', lhs: 'F<sub>A</sub> =', ans: 80, unit: 'N', finalLine: '80 N = F<sub>A</sub>', after: 'Slower, but still constant velocity, so still balanced.' + keyFor('9c'),
    }),
    (el, api) => GRAPHDRAW(el, api, {
      media: cartV, q: 'Draw the position graph for the whole motion.', x: [0, 6, 1], y: [0, 10, 1], snap: [0.5, 0.25], yl: 'x - position (m)',
      pts: [[0, 0], [2.5, 7.5], [6, 9.25]], hint: 'Two straight pieces: steep for 0-2.5 s (3 m/s), then shallow until 6 s (0.5 m/s). Where is the cart at 2.5 s and at 6 s?',
      explain: 'Steep line to 7.5 m at 2.5 s, then a shallow line to 9.25 m at 6 s. Each slope is the velocity.' + keyFor('9d'),
    }),
    (el, api) => motionPlayer(el, api, {
      q: 'Watch Larry\'s trip with both graphs and the FBD.', segs: [[0, 2.5, 3], [2.5, 6, 0.5]], x0: 0, track: [0, 10], icon: 'cart', fbd: cartFBD,
      xg: { x: [0, 6, 1], y: [0, 10, 2], yl: 'x - position (m)' }, vg: { x: [0, 6, 1], y: [-1, 4, 1], yl: 'v - velocity (m/s)' },
      note: 'Both parts are balanced (12 N vs 12 N, then 80 N vs 80 N). Bigger forces don\'t mean faster; they just balance a bigger friction.',
    }),
    (el, api) => WORK(el, api, { q: 'Calculate the average speed for the entire motion (9.25 m in 6 s).', eq: 'savg', plug: 's<sub>avg</sub> = [[9.25]] m / [[6]] s', ans: 1.54, tol: 0.011, unit: 'm/s', finalLine: 's<sub>avg</sub> = 1.54 m/s', after: keyFor('9e') }),
  ],
});

// ---------------- Test Q9 (second): remote control car ----------------
const rcX = plotSVG({ x: [0, 12, 1], y: [0, 10, 1], yl: 'x - position (m)' }, [[0, 9], [3, 3], [7, 3], [12, 8]]);
const rcFBD = v => v > 0 ? { up: ['FN', 34], down: ['Fg', 34], right: ['FA', 40], left: ['Ff', 40] } : v < 0 ? { up: ['FN', 34], down: ['Fg', 34], left: ['FA', 40], right: ['Ff', 40] } : { up: ['FN', 34], down: ['Fg', 34] };
const rcCar = '<g transform="translate(180 150)"><rect x="-52" y="-24" width="104" height="30" rx="8" style="fill:var(--f-n);stroke:var(--ink)" stroke-width="3"/><rect x="-26" y="-40" width="44" height="18" rx="5" style="fill:var(--card);stroke:var(--ink)" stroke-width="3"/><circle cx="-30" cy="12" r="12" style="fill:var(--ink)"/><circle cx="30" cy="12" r="12" style="fill:var(--ink)"/></g><line x1="100" y1="175" x2="260" y2="175" style="stroke:var(--muted)" stroke-width="3"/>';
Game.add({
  id: 'v8', section: 'unit2', tag: 'Test Q9b', title: 'RC Car Graphs',
  blurb: 'A remote control car\'s position graph: FBD, velocity graph, displacement, distance, change in velocity.',
  steps: [
    (el, api) => FBD(el, api, {
      ctx: 'A remote control car moves as shown in the position graph.', media: rcX, q: 'Build the free body diagram for when the car is moving to the <b>right</b> (7-12 s).',
      scene: rcCar, palette: ['Fg', 'FN', 'FA', 'Ff', 'Feng', 'Fair'], need: { up: ['FN'], down: ['Fg'], right: ['FA', 'Feng'], left: ['Ff', 'Fair'] },
      hint: 'It moves at a constant velocity, so the push forward must balance something backward.', explain: 'Constant velocity to the right: motor force right balances friction left; F<sub>N</sub> balances F<sub>g</sub>.' + keyFor('rc-a'),
    }),
    (el, api) => GRAPHDRAW(el, api, {
      media: rcX, q: 'Draw the velocity-time graph for the entire motion.', x: [0, 12, 1], y: [-3, 3, 1], yl: 'v - velocity (m/s)',
      pts: [[0, -2], [3, -2], [3, 0], [7, 0], [7, 1], [12, 1]],
      hint: 'Find each slope: 0-3 s goes from 9 m to 3 m. 3-7 s is flat. 7-12 s goes from 3 m to 8 m. Each piece is a flat line on the v-t graph.',
      explain: '0-3 s: (3 - 9) / 3 = -2 m/s. 3-7 s: 0 m/s. 7-12 s: (8 - 3) / 5 = +1 m/s.' + keyFor('rc-b'),
    }),
    (el, api) => motionPlayer(el, api, {
      q: 'Watch the car follow its position graph.', segs: [[0, 3, -2], [3, 7, 0], [7, 12, 1]], x0: 9, track: [0, 10], icon: 'car', fbd: rcFBD,
      xg: { x: [0, 12, 2], y: [0, 10, 2], yl: 'x - position (m)' }, vg: { x: [0, 12, 2], y: [-3, 3, 1], yl: 'v - velocity (m/s)' },
      note: 'Watch the FBD flip: when the car moves left, the motor pushes left and friction points right.',
    }),
    (el, api) => WORK(el, api, { media: rcX, q: 'Determine the displacement for the entire motion.', eq: 'dx', plug: '&Delta;x = [[8]] m - [[9]] m', lhs: '&Delta;x =', ans: -1, unit: 'm', finalLine: '&Delta;x = -1 m', after: 'It ended 1 m to the left of where it started. The key shows two ways to get it:' + keyFor('rc-c') }),
    (el, api) => WORK(el, api, { media: rcX, q: 'Determine the total distance traveled.', eq: 'dist', plug: 'd = [[6]] m + [[0]] m + [[5]] m', lhs: 'd =', ans: 11, unit: 'm', finalLine: 'd = 11 m', hint: 'Distance counts every meter, ignoring direction: 9 to 3, then sitting still, then 3 to 8.', after: 'Distance is always positive and counts both directions.' + keyFor('rc-d') }),
    (el, api) => WORK(el, api, { media: rcX, q: 'Determine the change in velocity from t<sub>i</sub> = 1 s to t<sub>f</sub> = 10 s.', eq: 'dv', plug: '&Delta;v = [[1]] m/s - ([[-2]] m/s)', lhs: '&Delta;v =', ans: 3, unit: 'm/s', finalLine: '&Delta;v = 3 m/s', hint: 'At 1 s it moves at -2 m/s. At 10 s it moves at +1 m/s.', after: keyFor('rc-e') }),
  ],
});

// ---------------- Test Q12: soccer ball in the truck ----------------
function truckSim(el, api) {
  el.append(h('div', { class: 'q' }, 'The light turns green. Watch the soccer ball in the truck bed.'), h('p', { class: 'ctx' }, 'Try both camera views.'));
  const scene = h('div', { class: 'panel' }), read = h('div', { class: 'readout' });
  const go = h('button', { class: 'btn primary', onclick: () => { t = 0; running = true; hit = false; } }, 'Green light!');
  const cam = h('button', { class: 'btn small', onclick: () => { truckView = !truckView; SFX.click(); cam.textContent = truckView ? 'Camera: riding in the truck' : 'Camera: standing on the sidewalk'; } }, 'Camera: standing on the sidewalk');
  el.append(scene, h('div', { class: 'row' }, go, cam), read);
  let t = 0, running = false, hit = false, truckView = false, runs = 0;
  const A = 60, T0 = 40, B0 = 125, END = 2.6;
  loop(el, dt => {
    if (running) { t = Math.min(END, t + dt); if (t >= END) { running = false; runs++; } }
    const tx = T0 + 0.5 * A * t * t, tv = A * t;
    let bx = B0; if (tx + 14 >= B0 - 9) { hit = true; bx = tx + 23; }
    const cx = truckView ? T0 - tx : 0;
    const marks = Array.from({ length: 24 }, (_, i) => { const x = ((i * 40 + cx) % 960 + 960) % 960 - 40; return `<line x1="${x}" y1="140" x2="${x + 18}" y2="140" style="stroke:var(--muted)" stroke-width="3"/>`; }).join('');
    scene.innerHTML = `<svg viewBox="0 0 420 160" role="img" aria-label="truck and soccer ball">${marks}<line x1="0" y1="132" x2="420" y2="132" style="stroke:var(--muted)" stroke-width="2"/>
      <g transform="translate(${tx + cx} 0)"><rect x="0" y="88" width="104" height="30" style="fill:var(--f-g);stroke:var(--ink)" stroke-width="2.5"/><rect x="0" y="70" width="10" height="48" style="fill:var(--f-g);stroke:var(--ink)" stroke-width="2.5"/>
      <path d="M104 118 L104 64 L136 64 L152 90 L152 118 Z" style="fill:var(--f-g);stroke:var(--ink)" stroke-width="2.5"/><rect x="112" y="70" width="22" height="18" style="fill:var(--soft)"/>
      <circle cx="28" cy="122" r="12" style="fill:var(--ink)"/><circle cx="128" cy="122" r="12" style="fill:var(--ink)"/></g>
      <g transform="translate(${bx + cx} 79)"><circle r="9" fill="#fff" stroke="#1b1f27" stroke-width="2"/><path d="M-3 -3 L3 -3 L4 2 L0 5 L-4 2 Z" fill="#1b1f27"/></g></svg>`;
    read.innerHTML = `<span>Truck velocity: ${(tv / 20).toFixed(1)} m/s ${running && !hit ? '(speeding up)' : ''}</span><span class="big">Ball velocity (seen from the sidewalk): ${hit ? (tv / 20).toFixed(1) + ' m/s, the tailgate pushes it now' : '0 m/s'}</span><span>${!hit && t > 0 ? 'Nothing pushes the ball, so it stays put. The truck slides forward underneath it.' : ''}</span>`;
    if (runs >= 1 && !el.querySelector('.next-row')) { api.right(10, read); api.done('From the sidewalk the ball just sits still while the truck moves forward. No force pushed it backward. That\'s inertia.'); }
  });
}
Game.add({
  id: 'v9', section: 'unit2', tag: 'Test Q12', title: 'Truck & Soccer Ball',
  blurb: 'The light turns green and the ball rolls to the back of the truck. Force, or inertia?',
  steps: [
    truckSim,
    (el, api) => MCQ(el, api, {
      q: 'Which is the better explanation of why the ball moves to the back of the truck?', keepOrder: true,
      opts: [
        { t: 'a) A force acts on the ball toward the back of the truck.', why: 'Nothing is pushing it backward. From the sidewalk, the ball doesn\'t move back at all; the truck moves forward under it.' },
        { t: 'b) The ball\'s inertia causes this behavior.', ok: true },
      ],
      explain: 'The ball tends to stay at rest. The truck speeds up forward, so the back of the truck catches up to the ball. No backward force needed.' + keyFor('12'),
    }),
    (el, api) => MCQ(el, api, {
      q: 'Before the ball hits the tailgate, what does someone on the sidewalk see the ball do?',
      opts: [
        { t: 'Stay in the same spot', ok: true },
        { t: 'Roll backward down the street', why: 'Only relative to the truck. Relative to the ground it stays put.' },
        { t: 'Move forward with the truck', why: 'Nothing pushes it forward until the tailgate reaches it.' },
        { t: 'Bounce up', why: 'No vertical forces changed.' },
      ],
      explain: 'Objects at rest stay at rest unless an unbalanced force acts. The tailgate is the first thing to push it.',
    }),
  ],
});

// ---------------- Test Q13: graph gauntlet ----------------
const q13V = plotSVG({ x: [0, 12, 1], y: [-5, 5, 1], yl: 'v - velocity (m/s)' }, [[0, 3], [4, 3], [4, -1], [12, -1]]);
Game.add({
  id: 'v10', section: 'unit2', tag: 'Test Q13', title: 'Graph Gauntlet',
  blurb: 'One velocity graph: distances, average speed, displacement, average velocity, and the position graph, the answer key\'s way.',
  steps: [
    (el, api) => WORK(el, api, { media: q13V, ctx: 'Average speed needs the total distance. Like the answer key, find each part\'s distance first.', q: 'Part 1 (0-4 s at 3 m/s): find d<sub>1</sub>.', eq: 'savg', form: 's<sub>1</sub> = d<sub>1</sub> / t<sub>1</sub>', plug: '[[3]] m/s = d<sub>1</sub> / [[4]] s', lhs: 'd<sub>1</sub> =', ans: 12, unit: 'm', finalLine: 'd<sub>1</sub> = 12 m' }),
    (el, api) => WORK(el, api, { media: q13V, q: 'Part 2 (4-12 s at 1 m/s backward): find d<sub>2</sub>. Distance uses speed, so no minus sign.', eq: 'savg', form: 's<sub>2</sub> = d<sub>2</sub> / t<sub>2</sub>', plug: '[[1]] m/s = d<sub>2</sub> / [[8]] s', lhs: 'd<sub>2</sub> =', ans: 8, unit: 'm', finalLine: '8 m = d<sub>2</sub>', hint: 'Part 2 lasts 12 - 4 = 8 s.' }),
    (el, api) => WORK(el, api, { media: q13V, q: 'Average speed for the whole motion: d<sub>T</sub> = 12 m + 8 m = 20 m, t<sub>T</sub> = 12 s.', eq: 'savg', plug: 's<sub>avg</sub> = [[20]] m / [[12]] s', ans: 1.67, tol: 0.011, unit: 'm/s', finalLine: 's<sub>avg</sub> = 1.67 m/s', after: keyFor('13a') }),
    (el, api) => WORK(el, api, { media: q13V, ctx: 'Average velocity needs displacement. Part 1 moves forward, so &Delta;x<sub>1</sub> = +12 m (same as d<sub>1</sub>).', q: 'Part 2: find &Delta;x<sub>2</sub>. Direction counts now: v<sub>2</sub> = -1 m/s.', eq: 'vavg', form: 'v<sub>2</sub> = &Delta;x<sub>2</sub> / t<sub>2</sub>', plug: '[[-1]] m/s = &Delta;x<sub>2</sub> / [[8]] s', lhs: '&Delta;x<sub>2</sub> =', ans: -8, unit: 'm', finalLine: '-8 m = &Delta;x<sub>2</sub>', signMsg: 'Right size! But it moves backward (below the axis), so &Delta;x<sub>2</sub> is negative.' }),
    (el, api) => WORK(el, api, { media: q13V, q: 'Average velocity for the whole motion: &Delta;x<sub>T</sub> = 12 m + (-8 m) = 4 m, t<sub>T</sub> = 12 s.', eq: 'vavg', plug: 'v<sub>avg</sub> = [[4]] m / [[12]] s', ans: 0.33, tol: 0.011, unit: 'm/s', finalLine: 'v<sub>avg</sub> = 0.33 m/s', after: 'Average velocity uses displacement (4 m). Average speed uses distance (20 m). That\'s why they\'re different.' + keyFor('13b') }),
    (el, api) => GRAPHDRAW(el, api, {
      media: q13V, q: 'Draw the position vs. time graph for this motion (start at 0 m).', x: [0, 12, 1], y: [0, 14, 2], snap: [1, 1], yl: 'x - position (m)',
      pts: [[0, 0], [4, 12], [12, 4]], hint: 'Rises 3 m every second for 4 s, then drops 1 m every second until 12 s.',
      explain: 'Up to 12 m at 4 s (slope +3), then down to 4 m at 12 s (slope -1).' + keyFor('13c'),
    }),
    (el, api) => WORK(el, api, { media: q13V, q: 'What is the displacement from 7 s to 10 s?', eq: 'vavg', form: 'v = &Delta;x / t', plug: '[[-1]] m/s = &Delta;x / [[3]] s', lhs: '&Delta;x =', ans: -3, unit: 'm', finalLine: '-3 m = &Delta;x', after: keyFor('13d') }),
  ],
});

// ---------------- Test-day boss ----------------
const BOSS2_GENS = [
  () => { const [d, v] = pick([[120, 3], [300, 5], [450, 15], [900, 6], [240, 8]]); return { num: { q: `A cyclist rides ${d} m at a constant ${v} m/s. How long does it take?`, ans: d / v, unit: 's', explain: eqs('v<sub>avg</sub> = &Delta;x / t', `${v} m/s = ${d} m / t`, `t = ${d / v} s`) } }; },
  () => { const [d, t] = pick([[100, 20], [450, 90], [36, 8], [1200, 300]]); return { num: { q: `A runner covers ${d} m in ${t} s. What is her average speed?`, ans: +(d / t).toFixed(2), tol: 0.02, unit: 'm/s', explain: eqs('s<sub>avg</sub> = d / t', `s<sub>avg</sub> = ${d} m / ${t} s`, `s<sub>avg</sub> = ${+(d / t).toFixed(2)} m/s`) } }; },
  () => { const [d, t] = pick([[30, 6], [48, 8], [20, 5]]); return { num: { q: `A cart rolls ${d} m to the <b>left</b> in ${t} s. What is its velocity?`, ans: -d / t, unit: 'm/s', explain: eqs('v<sub>avg</sub> = &Delta;x / t', `v<sub>avg</sub> = -${d} m / ${t} s`, `v<sub>avg</sub> = ${-d / t} m/s`) } }; },
  () => { const [xf, xi] = pick([[2, 9], [12, 4], [5, 5], [1, 7]]); return { num: { q: `An object starts at x = ${xi} m and ends at x = ${xf} m. What is its displacement?`, ans: xf - xi, unit: 'm', explain: eqs('&Delta;x = x<sub>f</sub> - x<sub>i</sub>', `&Delta;x = ${xf} m - ${xi} m`, `&Delta;x = ${xf - xi} m`) } }; },
  () => { const [vf, vi] = pick([[4, -2], [-3, 1], [5, 2]]); return { num: { q: `Velocity changes from ${vi} m/s to ${vf} m/s. What is the change in velocity?`, ans: vf - vi, unit: 'm/s', explain: eqs('&Delta;v = v<sub>f</sub> - v<sub>i</sub>', `&Delta;v = ${vf} m/s - (${vi} m/s)`, `&Delta;v = ${vf - vi} m/s`) } }; },
  () => { const [m, P] = pick([[12, 15], [8, 20], [20, 10]]); return { num: { q: `You push down with -${P} N on a ${m} kg desk. What is the normal force?`, ans: m * 10 + P, unit: 'N', explain: eqs('&Sigma;F = F<sub>N</sub> + F<sub>g</sub> + F<sub>A</sub>', `0 N = F<sub>N</sub> + (-${m * 10} N) + (-${P} N)`, `F<sub>N</sub> = ${m * 10 + P} N`) } }; },
  () => { const m = pick([4.5, 7, 15]); return { num: { q: `What is the weight of a ${m} kg cat on Earth?`, ans: -10 * m, unit: 'N', explain: eqs('F<sub>g</sub> = m &middot; g', `F<sub>g</sub> = ${m} kg &middot; (-10 N/kg)`, `F<sub>g</sub> = ${-10 * m} N`) } }; },
  () => ({ mcq: { q: 'A flat line on a <b>position</b>-time graph means...', opts: [{ t: 'At rest', ok: true }, { t: 'Constant velocity', why: 'That\'s a flat line on a velocity graph.' }, { t: 'Speeding up', why: 'Position isn\'t changing at all.' }, { t: 'Moving backward', why: 'A backward motion is a downhill line.' }], explain: 'Position not changing = v = 0.' } }),
  () => ({ mcq: { q: 'A flat line <b>below</b> the t-axis on a velocity-time graph means...', opts: [{ t: 'Constant negative velocity', ok: true }, { t: 'At rest', why: 'At rest is a flat line ON the axis.' }, { t: 'Slowing down', why: 'Flat = velocity isn\'t changing.' }, { t: 'Negative position', why: 'A v-t graph shows velocity, not position.' }], explain: 'Below the axis = negative direction; flat = constant.' } }),
  () => ({ mcq: { q: 'You walk 50 m east, then 50 m west back to the start. Your displacement and distance are...', opts: [{ t: 'Displacement 0 m, distance 100 m', ok: true }, { t: 'Both 100 m', why: 'Displacement is start to finish: you ended where you began.' }, { t: 'Both 0 m', why: 'You still walked 100 m of distance.' }, { t: 'Displacement 100 m, distance 0 m', why: 'Flipped.' }], explain: 'Displacement = change in position. Distance = total ground covered.' } }),
  () => ({ mcq: { q: 'You run twice as fast over the same distance. Your time is...', opts: [{ t: 'Half as long', ok: true }, { t: 'Twice as long', why: 'Faster means less time.' }, { t: 'The same', why: 'Speed changed, so time changes.' }, { t: '4 times shorter', why: 'Time is inversely proportional to speed: 2x speed, 1/2 time.' }], explain: 'Same distance: t is inversely proportional to v.' } }),
  () => ({ mcq: { q: 'A box moves at a constant 20 m/s. The forces on it must be...', opts: [{ t: 'Balanced', ok: true }, { t: 'Unbalanced forward', why: 'That would speed it up.' }, { t: 'Zero, no forces at all', why: 'There can be forces, as long as they balance.' }, { t: 'Unbalanced backward', why: 'That would slow it down.' }], explain: 'Constant velocity = balanced forces = &Sigma;F = 0.' } }),
  () => ({ mcq: { q: 'Lifting a box at a constant 3 m/s vs. a constant 1 m/s: which takes more applied force?', opts: [{ t: 'Neither, they\'re equal', ok: true }, { t: '3 m/s', why: 'Constant velocity is balanced at any speed.' }, { t: '1 m/s', why: 'Speed doesn\'t change the balance.' }, { t: 'It depends on the time', why: 'Only the weight matters at constant velocity.' }], explain: 'Both: F<sub>A</sub> = |F<sub>g</sub>|.' } }),
  () => ({ mcq: { q: 'What\'s the difference between speed and velocity?', opts: [{ t: 'Velocity has a direction; speed doesn\'t', ok: true }, { t: 'Speed is always bigger', why: 'Speed is the size of velocity.' }, { t: 'There\'s no difference', why: 'Velocity is a vector, speed is a scalar.' }, { t: 'Velocity is measured in N', why: 'Both use m/s.' }], explain: 'Speed = scalar, velocity = vector.' } }),
];
Game.add({
  id: 'boss2', boss: true, section: 'unit2', tag: 'Test-Day Boss', title: 'Constant Velocity Showdown',
  blurb: '10 random test-style questions. Every calculation is Lock In style: equation, plug in, answer with units. Three hearts.',
  steps: (store => Array.from({ length: 10 }, (_, k) => bossStep(k, BOSS2_GENS, store)))({}),
});
