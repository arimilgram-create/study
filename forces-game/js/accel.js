// Acceleration Packet: everything in the acceleration packets, built from the unit summary.
// Where a packet has an answer key, the answers match it. Where it doesn't (the walkaround and the classic FBD sheet), answers are worked from the physics.

// ---------- free body diagram sprites ----------
const SPR = {
  ball: `<circle cx="180" cy="150" r="22" style="fill:var(--card);stroke:var(--ink)" stroke-width="2.5"/>`,
  block: `<rect x="140" y="134" width="80" height="26" rx="4" style="fill:var(--card);stroke:var(--ink)" stroke-width="2.5"/>`,
  hang: `<line x1="180" y1="0" x2="180" y2="128" style="stroke:var(--muted)" stroke-width="3"/><rect x="158" y="128" width="44" height="40" rx="5" style="fill:var(--card);stroke:var(--ink)" stroke-width="2.5"/>`,
  para: `<path d="M120 84 Q180 20 240 84 Z" style="fill:var(--f-n);stroke:var(--ink)" stroke-width="2.5"/><line x1="130" y1="84" x2="172" y2="150" style="stroke:var(--ink)" stroke-width="1.5"/><line x1="230" y1="84" x2="188" y2="150" style="stroke:var(--ink)" stroke-width="1.5"/><rect x="164" y="150" width="32" height="22" rx="4" style="fill:var(--card);stroke:var(--ink)" stroke-width="2.5"/>`,
};

// ---------- fan cart lab: predict the graph, then run it ----------
// Model: the fan's net force is 0.25 m/s² per unit of force while it's on (a = 0.25 F, sign = direction).
// After the duration ends the fan is off and the velocity stays constant.
function fanTrial(el, api, cfg) {
  const T = 5, A = 0.25 * cfg.F * cfg.dir, D = cfg.D;
  const vAt = t => cfg.v0 + A * Math.min(t, D);
  const shapes = {
    right: { v: vAt, ok: true },
    flat: { v: () => cfg.v0, why: 'Flat means no change in velocity. But the fan is pushing, so velocity must change.' },
    mirror: { v: t => -vAt(t), why: 'Wrong direction: the velocity has the wrong sign.' },
    nostop: { v: t => cfg.v0 + A * t, why: 'The fan only pushes for its duration. After that, velocity stops changing.' },
  };
  const sketch = fn => { const segs = []; let px = null, py = null; for (let i = 0; i <= 24; i++) { const t = T * i / 24, v = fn(t), x = 22 + t / T * 72, y = Math.max(6, Math.min(76, 42 - v * 16)); if (px !== null) segs.push([px, py, x, y]); px = x; py = y; } return sheetGraph(segs); };
  el.append(h('div', { class: 'q' }, cfg.title), h('p', { class: 'ctx', html: cfg.ctx }),
    h('div', { class: 'hint' }, `Fan settings: force ${cfg.F}, duration ${D} s, ${cfg.dir > 0 ? 'toward +x (right)' : 'toward -x (left)'}. ${cfg.v0 ? `Hand push ${cfg.v0 > 0 ? 'right' : 'left'} at ${Math.abs(cfg.v0)} m/s.` : 'Starts from rest.'}`),
    h('p', { class: 'hint', html: '<b>Predict first:</b> which v-t graph will the cart make?' }));
  const grid = h('div', { class: 'opts' }), pane = h('div');
  const order = shuffle(Object.keys(shapes));
  let picked = null, correctPick = false, running = false, finished = false, t = 0;
  const btns = order.map(k => { const b = h('button', { class: 'opt', html: sketch(shapes[k].v) + '<span>Graph</span>' }); b.onclick = () => choose(k, b); grid.append(b); return b; });
  el.append(grid, pane);
  const F = frame({ x: [0, T, 1], y: [-2, 2, 0.5], yl: 'v - velocity (m/s)', xl: 't - time (s)', w: 420, h: 230 });
  const samples = Array.from({ length: 121 }, (_, i) => [T * i / 120, vAt(T * i / 120)]);
  const panel = h('div', { class: 'panel' }), read = h('div', { class: 'readout' });
  function choose(k, b) {
    if (picked) return; picked = k; correctPick = !!shapes[k].ok;
    btns.forEach(x => x.disabled = true);
    b.classList.add(correctPick ? 'right' : 'wrong');
    if (!correctPick) { btns[order.indexOf('right')].classList.add('right', 'reveal'); api.wrong(b); say(shapes[k].why || ''); }
    else SFX.click();
    pane.append(panel, read); running = true;
  }
  const say = txt => { const p = h('div', { class: 'pen bad', html: txt }); pane.prepend(p); };
  loop(el, dt => {
    if (!running || finished) return;
    t = Math.min(T, t + dt * 0.7);
    const v = vAt(t);
    const phase = t >= D ? 'Fan off: constant velocity (balanced forces).' : Math.abs(v) < 1e-9 ? 'Starting to move.' : (v * A > 0 ? 'Speeding up: velocity and net force point the same way.' : 'Slowing down: velocity and net force point opposite ways.');
    panel.innerHTML = `<svg viewBox="0 0 ${F.W} ${F.H}" class="plot" role="img" aria-label="velocity versus time">${F.s}<polyline points="${polyPts(F, samples.filter(p => p[0] <= t).concat([[t, v]]))}" fill="none" style="stroke:var(--f-a)" stroke-width="3.5" stroke-linejoin="round"/><circle cx="${F.X(t)}" cy="${F.Y(v)}" r="6" style="fill:var(--f-a);stroke:var(--card)" stroke-width="2"/></svg>`;
    read.innerHTML = `<span class="big">t = ${t.toFixed(1)} s, v = ${fmt(v)} m/s</span><span>Net force while the fan is on: ${A > 0 ? 'right (+)' : 'left (-)'}</span><span>${phase}</span>`;
    if (t >= T) { finished = true; if (correctPick) api.right(12, read); api.done(cfg.note + (correctPick ? ' You predicted it.' : ' Your prediction was off. The graph above is what happens.')); }
  });
}

// ---------- stations ----------
Game.add({
  id: 'a1', section: 'accel', tag: 'Accel 1', title: 'Accelerating = Changing Velocity',
  blurb: 'Speeding up, slowing down, and turning all count. Then calculate a = Δv / t, with units.',
  steps: [
    (el, api) => MCQ(el, api, {
      q: 'Which of these can make a car accelerate: the gas pedal, the brake pedal, or the steering wheel?',
      opts: [
        { t: 'All three. Each one changes the velocity (speed or direction).', ok: true },
        { t: 'Only the gas pedal', why: 'The brake slows the car down, which is also a change in velocity.' },
        { t: 'Only the gas pedal and the brake', why: 'Turning the steering wheel changes direction, which is also a change in velocity.' },
        { t: 'None of them', why: 'Any change in velocity is acceleration.' },
      ],
      explain: 'Speeding up, slowing down, and turning are all changes in velocity, so all three are acceleration.',
    }),
    (el, api) => MCQ(el, api, {
      q: 'An object is accelerating if it is moving...',
      keepOrder: true,
      opts: [
        { t: 'A. with changing speed', why: 'That\'s true, but B is true too. Pick the choice that includes both.' },
        { t: 'B. in a circle', why: 'That\'s true, but A is true too. Pick the choice that includes both.' },
        { t: 'C. extremely fast', why: 'Speed alone doesn\'t mean acceleration. It has to be changing.' },
        { t: 'D. with constant velocity', why: 'Constant velocity means no change, so no acceleration.' },
        { t: 'E. Both A and B', ok: true },
      ],
      explain: 'Changing speed (A) and changing direction, like going in a circle (B), are both acceleration. When more than one choice is true, pick the one that includes them all.',
    }),
    (el, api) => MCQ(el, api, {
      q: 'An object is NOT accelerating. Which of these could it be doing?',
      keepOrder: true,
      opts: [
        { t: 'A. sitting at rest', why: 'That\'s true, but B is true too. Pick the choice that includes both.' },
        { t: 'B. moving in a straight line at a steady speed', why: 'That\'s true, but A is true too. Pick the choice that includes both.' },
        { t: 'C. going around a circle at a steady speed', why: 'The direction keeps changing, so the velocity changes. That is accelerating.' },
        { t: 'D. slowing down', why: 'Slowing down IS accelerating.' },
        { t: 'E. Both A and B', ok: true },
      ],
      explain: 'Not accelerating means the velocity is constant. At rest is a constant velocity of 0, and steady straight-line motion is constant too. So if something isn\'t accelerating, the only thing you know for sure is that its velocity is constant.',
    }),
    (el, api) => MCQ(el, api, {
      q: 'An object with an acceleration of 10 m/s² will...',
      opts: [
        { t: 'change its velocity by 10 m/s every second', ok: true },
        { t: 'move 10 meters every second', why: 'Acceleration is about changing velocity, not distance.' },
        { t: 'have a velocity of 10 m/s', why: 'Acceleration says how fast velocity changes, not what the velocity is.' },
        { t: 'move 100 meters in 10 seconds', why: 'That\'s a distance, not an acceleration.' },
      ],
      explain: 'a = Δv / t. At 10 m/s², the velocity goes up by 10 m/s each second.',
    }),
    (el, api) => WORK(el, api, {
      ctx: 'Ima Speedin puts the pedal down. Her speed: 0 mph at 0 s, 40 mph at 4 s.',
      q: 'Find her acceleration.', eq: 'accel', form: 'a = Δv / t', plug: 'a = ([[40]] mi/hr - [[0]] mi/hr) / [[4]] s', lhs: 'a =', ans: 10, unit: 'mi/hr/s', finalLine: 'a = 10 mi/hr/s',
      hint: 'Δv = 40 - 0. Divide by the time.', after: 'Her velocity goes up by 10 mph every second.',
    }),
    (el, api) => WORK(el, api, {
      ctx: 'Mr. Henderson\'s Porsche goes from 0 to 60 mph in 4 seconds.',
      q: 'Find its acceleration.', eq: 'accel', form: 'a = Δv / t', plug: 'a = ([[60]] mi/hr - [[0]] mi/hr) / [[4]] s', lhs: 'a =', ans: 15, unit: 'mi/hr/s', finalLine: 'a = 15 mi/hr/s',
      after: 'Units: mph is a velocity, so mph per second is an acceleration. (Not m/s², because the speed was in mph.)',
    }),
  ],
});

Game.add({
  id: 'a2', section: 'accel', tag: 'Accel 2', title: 'Which Way Is the Acceleration?',
  blurb: 'Acceleration points the way the net force points. Same as velocity when speeding up, opposite when slowing down.',
  steps: [
    (el, api) => MCQ(el, api, {
      q: 'Billy says positive acceleration means speeding up, and negative acceleration means slowing down. Is he right?',
      opts: [
        { t: 'Not quite. Positive acceleration means the net force points in the + direction. Whether that speeds the object up or slows it down depends on its velocity.', ok: true },
        { t: 'Yes, he is right.', why: 'Only if the object is moving in the + direction. If v is negative, a positive a slows it down.' },
        { t: 'No. Acceleration is always opposite the velocity.', why: 'That is only true when slowing down.' },
        { t: 'Yes, but only at rest.', why: 'At rest the object isn\'t moving, so it can\'t be speeding up or slowing down.' },
      ],
      explain: 'Positive a means the net force is +. Same sign as v: speeding up. Opposite sign: slowing down.',
    }),
    (el, api) => MCQ(el, api, {
      q: 'A northbound car skids to a stop to avoid a reckless driver. Which way is its acceleration?',
      opts: [
        { t: 'South', ok: true },
        { t: 'North', why: 'North is its velocity. It\'s slowing, so the acceleration is opposite.' },
        { t: 'Zero', why: 'Slowing down is a change in velocity, so the acceleration is not zero.' },
        { t: 'East', why: 'The car is moving north, not east.' },
      ],
      explain: 'Slowing down: a is opposite v. Moving north and slowing: a points south.',
    }),
    (el, api) => MCQ(el, api, {
      q: 'An Olympic diver is moving down after splashing into the water and slows down. Which way is her acceleration?',
      opts: [
        { t: 'Up', ok: true },
        { t: 'Down', why: 'Down is her velocity. Slowing down means the acceleration is opposite it.' },
        { t: 'Zero', why: 'She\'s slowing down, so her velocity is changing.' },
        { t: 'Sideways', why: 'Her motion is straight down.' },
      ],
      explain: 'Velocity down, slowing: the net force (and a) points up.',
    }),
    (el, api) => MCQ(el, api, {
      q: 'A Hot Wheels car moving to the right slows to a stop. Which way is its acceleration?',
      opts: [
        { t: 'Left', ok: true },
        { t: 'Right', why: 'Right is its velocity. Slowing down makes a opposite.' },
        { t: 'Up', why: 'The car isn\'t moving up or down.' },
        { t: 'Zero', why: 'It\'s slowing down, so a is not zero.' },
      ],
      explain: 'Velocity right, slowing: a points left.',
    }),
    (el, api) => MCQ(el, api, {
      q: 'A softball moving toward the umpire is caught by the catcher. Which way does the ball accelerate?',
      opts: [
        { t: 'Toward the batter (opposite its velocity)', ok: true },
        { t: 'Toward the umpire', why: 'That is the ball\'s velocity. It\'s slowing, so a must be opposite.' },
        { t: 'Up', why: 'The catcher\'s glove stops the ball horizontally.' },
        { t: 'Zero', why: 'The ball slows to a stop, so its velocity changes.' },
      ],
      explain: 'The catcher\'s hand puts a net force on the ball toward the batter. The acceleration matches the net force, so it points toward the batter.',
    }),
  ],
});

// Graph reading: sheet-style v-t graphs. Each graph has one correct combination.
const GRAPH_COMBOS = [
  { t: 'Velocity +, speeding up, acceleration +' },
  { t: 'Velocity +, slowing down, acceleration -' },
  { t: 'Velocity -, speeding up, acceleration -' },
  { t: 'Velocity -, slowing down, acceleration +' },
];
const graphQ = (svg, correct) => ({
  media: svg,
  q: 'Read the v-t graph. What is the velocity, is the object speeding up or slowing down, and which way is the acceleration?',
  opts: GRAPH_COMBOS.map((c, i) => ({ ...c, ok: i === correct, why: 'Check two things: is the line above or below the axis (the sign of v)? Is it moving toward the axis or away from it (speeding up or slowing down)?' })),
  explain: 'Above the axis = +. Moving away from the axis = speeding up. Moving toward the axis = slowing down. The acceleration sign is the sign that matches the net force.',
});
Game.add({
  id: 'a3', section: 'accel', tag: 'Accel 3', title: 'Speeding Up or Slowing Down?',
  blurb: 'Read four v-t graphs: which side of the axis, and moving toward or away from it.',
  steps: [
    (el, api) => MCQ(el, api, Object.assign(graphQ(sheetGraph([[20, 40, 94, 22]]), 0), { q: 'Graph A: ' + graphQ('', 0).q })),
    (el, api) => MCQ(el, api, Object.assign(graphQ(sheetGraph([[20, 62, 94, 46]]), 3), { q: 'Graph B: ' + graphQ('', 3).q })),
    (el, api) => MCQ(el, api, Object.assign(graphQ(sheetGraph([[20, 46, 94, 70]]), 2), { q: 'Graph C: ' + graphQ('', 2).q })),
    (el, api) => MCQ(el, api, Object.assign(graphQ(sheetGraph([[20, 22, 94, 40]]), 1), { q: 'Graph D: ' + graphQ('', 1).q })),
  ],
});

Game.add({
  id: 'a4', section: 'accel', tag: 'Accel 4', title: 'Acceleration from a v-t Graph',
  blurb: 'The slope of a v-t graph is the acceleration. Find it for each part, with the sign.',
  steps: [
    (el, api) => WORK(el, api, {
      media: plotSVG({ x: [0, 12, 2], y: [-4, 4, 2], yl: 'v - velocity (m/s)' }, [[0, 4], [8, 0], [12, -2]]),
      q: 'Find the acceleration from 0 to 8 s.', eq: 'accel', form: 'a = Δv / Δt', plug: 'a = ([[0]] m/s - [[4]] m/s) / ([[8]] s - [[0]] s)', lhs: 'a =', ans: -0.5, unit: 'm/s²', finalLine: 'a = -0.5 m/s²',
      signMsg: 'Right size! The velocity went down from +4, so the acceleration is negative.', hint: 'Rise over run. Rise is 0 - 4.',
    }),
    (el, api) => WORK(el, api, {
      media: plotSVG({ x: [0, 12, 2], y: [-4, 4, 2], yl: 'v - velocity (m/s)' }, [[0, 4], [8, 0], [12, -2]]),
      q: 'Now find the acceleration from 8 to 12 s.', eq: 'accel', form: 'a = Δv / Δt', plug: 'a = ([[-2]] m/s - [[0]] m/s) / ([[12]] s - [[8]] s)', lhs: 'a =', ans: -0.5, unit: 'm/s²', finalLine: 'a = -0.5 m/s²',
      after: 'Both parts have the same slope. A straight line means constant acceleration, so a = -0.5 m/s² the whole time.',
    }),
    (el, api) => MCQ(el, api, {
      q: 'In the first 8 seconds, the object is moving forward and slowing down. Then it keeps going and reverses. What does a straight line on a v-t graph tell you?',
      opts: [
        { t: 'The acceleration is constant', ok: true },
        { t: 'The velocity is constant', why: 'The line is sloped, so velocity is changing.' },
        { t: 'The displacement is zero', why: 'Displacement is the area under the graph, which isn\'t zero here.' },
        { t: 'The object is at rest', why: 'At rest would be a flat line on the axis.' },
      ],
      explain: 'Straight line = constant slope = constant acceleration.',
    }),
  ],
});

Game.add({
  id: 'a5', section: 'accel', tag: 'Accel 5', title: 'Acceleration Word Problems',
  blurb: 'Boats, softballs, race cars, Tesla, and Gronk. Each one: equation, plug in, answer with units.',
  steps: [
    (el, api) => WORK(el, api, {
      ctx: 'A boat is going 7 m/s. Two seconds later it is going 13 m/s, and it keeps accelerating.',
      q: 'What is the rate it is accelerating at?', eq: 'accel', form: 'a = (v<sub>f</sub> - v<sub>i</sub>) / t', plug: 'a = ([[13]] m/s - [[7]] m/s) / [[2]] s', lhs: 'a =', ans: 3, unit: 'm/s²', finalLine: 'a = 3 m/s²',
    }),
    (el, api) => WORK(el, api, {
      ctx: 'The boat keeps the same 3 m/s² acceleration. It goes from 13 m/s to 25 m/s.',
      q: 'How long does that take?', eq: 'accel', form: 'a = (v<sub>f</sub> - v<sub>i</sub>) / t', plug: '[[3]] m/s² = ([[25]] m/s - [[13]] m/s) / t', lhs: 't =', ans: 4, unit: 's', finalLine: 't = 4 s',
      hint: 'Rearrange: t = (v_f - v_i) / a.',
    }),
    (el, api) => WORK(el, api, {
      ctx: 'A softball is moving at 24 m/s toward the glove. The glove stops it in 0.15 s.',
      q: 'Find the acceleration of the softball.', eq: 'accel', form: 'a = (v<sub>f</sub> - v<sub>i</sub>) / t', plug: 'a = ([[0]] m/s - [[24]] m/s) / [[0.15]] s', lhs: 'a =', ans: -160, unit: 'm/s²', finalLine: 'a = -160 m/s²',
      signMsg: 'Right size! The ball was moving positive, and it stopped, so a points the other way: negative.',
      after: 'Negative: opposite to the ball\'s velocity. That\'s why the glove hurts.',
    }),
    (el, api) => WORK(el, api, {
      ctx: 'To pass a slower driver, Anna accelerates from 45 m/s at 0.75 m/s² for 8 s.',
      q: 'How fast is she going after 8 s?', eq: 'vf', form: 'v<sub>f</sub> = v<sub>i</sub> + a · t', plug: 'v<sub>f</sub> = [[45]] m/s + ([[0.75]] m/s²)([[8]] s)', lhs: 'v<sub>f</sub> =', ans: 51, unit: 'm/s', finalLine: 'v<sub>f</sub> = 51 m/s',
    }),
    (el, api) => WORK(el, api, {
      ctx: 'A Tesla accelerates at 11.79 m/s² from rest. 60 mph = 26.82 m/s.',
      q: 'How long does it take to go from 0 to 60 mph?', eq: 'accel', form: 'a = (v<sub>f</sub> - v<sub>i</sub>) / t', plug: '[[11.79]] m/s² = ([[26.82]] m/s - [[0]] m/s) / t', lhs: 't =', ans: 2.27, tol: 0.02, unit: 's', finalLine: 't = 2.27 s',
    }),
    (el, api) => WORK(el, api, {
      ctx: 'Regina jogs at 3 m/s. In 10 s she speeds up to 5 m/s, in the same direction.',
      q: 'Find her acceleration. Positive or negative?', eq: 'accel', form: 'a = (v<sub>f</sub> - v<sub>i</sub>) / t', plug: 'a = ([[5]] m/s - [[3]] m/s) / [[10]] s', lhs: 'a =', ans: 0.2, unit: 'm/s²', finalLine: 'a = +0.2 m/s²',
      after: 'Positive, and she is speeding up (both v and a are positive).',
    }),
    (el, api) => WORK(el, api, {
      ctx: 'Brady throws a pass to the left. Gronk catches it, and it stops in 0.28 s with an acceleration of 96 m/s² to the right (+).',
      q: 'Find the ball\'s velocity just before Gronk catches it.', eq: 'accel', form: 'a = (v<sub>f</sub> - v<sub>i</sub>) / t', plug: '[[96]] m/s² = ([[0]] m/s - v<sub>i</sub>) / [[0.28]] s', lhs: 'v<sub>i</sub> =', ans: -26.88, tol: 0.05, unit: 'm/s', finalLine: 'v<sub>i</sub> = -26.88 m/s',
      hint: 'Multiply both sides by 0.28, then solve for v_i.', after: 'Negative: it was moving left. The positive acceleration points right, against its motion, so it slows down.',
    }),
  ],
});

// ---------- Fan cart lab ----------
Game.add({
  id: 'a6', section: 'accel', tag: 'Accel 6', title: 'Fan Cart Lab',
  blurb: 'Predict the velocity-time graph, then run the fan. Trials A to E from your lab sheet.',
  steps: [
    (el, api) => fanTrial(el, api, { title: 'Trial A', F: 1, D: 3, dir: 1, v0: 0, ctx: 'Start the fan cart from rest. Force setting 1, duration 3 s, moving toward +x.', note: 'Velocity goes positive and the cart speeds up at 0.25 m/s² for 3 s, reaching 0.75 m/s. Then the fan is off, and velocity stays at 0.75 m/s.' }),
    (el, api) => fanTrial(el, api, { title: 'Trial B', F: 3, D: 2, dir: 1, v0: 0, ctx: 'Start from rest. Force setting 3, duration 2 s, toward +x. Same setup as A, but a stronger push.', note: 'Three times the force means three times the acceleration (0.75 m/s²). The cart reaches 1.5 m/s in 2 s. A steeper slope means more force.' }),
    (el, api) => fanTrial(el, api, { title: 'Trial C', F: 3, D: 2, dir: -1, v0: 0, ctx: 'Same settings as B, but the cart starts on the other side and moves toward -x. Keep the cart facing the same way.', note: 'Velocity is negative, and the net force is toward -x, so the cart speeds up to the left, reaching -1.5 m/s. It\'s the same shape as B, mirrored below the axis.' }),
    (el, api) => fanTrial(el, api, { title: 'Trial D', F: 3, D: 2, dir: -1, v0: 0.5, ctx: 'The fan pushes toward -x. When the countdown ends, you give the cart a brief push to the right.', note: 'The cart starts moving right (+) while the net force points left (-). It slows down, stops at about 0.67 s, then speeds up to the left while the fan is still on. It ends at -1.0 m/s and holds that.' }),
    (el, api) => fanTrial(el, api, { title: 'Trial E', F: 3, D: 2, dir: 1, v0: -0.5, ctx: 'The fan pushes toward +x. When the countdown ends, you give the cart a brief push to the left.', note: 'The cart starts moving left (-) while the net force points right (+). It slows down, stops, then speeds up to the right and ends at +1.0 m/s.' }),
    (el, api) => MCQ(el, api, {
      q: 'In Trial D, why does the cart turn around after it stops?',
      opts: [
        { t: 'The fan is still pushing left, so the net force stays left, and the cart speeds up to the left.', ok: true },
        { t: 'Your hand pushes it back again.', why: 'The hand push was brief. Only the fan is still on.' },
        { t: 'Friction makes it reverse.', why: 'Friction opposes motion, so it can\'t push the cart back the other way.' },
        { t: 'It doesn\'t turn around.', why: 'Its velocity does change sign, because the net force is still on.' },
      ],
      explain: 'The net force never changed sign while the fan was on, so velocity keeps changing toward the net force.',
    }),
    (el, api) => MCQ(el, api, {
      q: 'Across all the trials, when is the cart speeding up?',
      opts: [
        { t: 'When its velocity and the net force point the same way', ok: true },
        { t: 'Whenever it is moving', why: 'Moving at a steady speed isn\'t speeding up.' },
        { t: 'When its velocity and the net force point opposite ways', why: 'That\'s slowing down.' },
        { t: 'Only when the hand pushes it', why: 'The fan provides the net force.' },
      ],
      explain: 'Speeding up = velocity and net force same direction. Slowing down = opposite. Balanced = constant velocity.',
    }),
    (el, api) => MCQ(el, api, {
      q: 'What does the v-t graph look like after the fan turns off?',
      opts: [
        { t: 'A flat line: constant velocity, because the net force is zero', ok: true },
        { t: 'A line sloping down', why: 'A sloped line means a net force. With the fan off, the net force is zero.' },
        { t: 'A line sloping up', why: 'Same reason: no net force, so no change in velocity.' },
        { t: 'A line that goes to zero', why: 'Nothing is stopping the cart, so its velocity doesn\'t go to zero.' },
      ],
      explain: 'ΣF = 0 means constant velocity. Flat line on the v-t graph.',
    }),
  ],
});

// ---------- Newton's 2nd law calculations (proportional reasoning and multi-step) ----------
Game.add({
  id: 'n1', section: 'accel', tag: 'Newton 1', title: 'Newton\'s 2nd Law Calcs',
  blurb: 'ΣF = m · a. Calculate force, mass, and acceleration, then use proportional reasoning.',
  steps: [
    (el, api) => WORK(el, api, {
      ctx: 'Drew pushes a 50 kg crate with a net force of 75 N.',
      q: 'Determine the acceleration of the crate.', eq: 'a2', form: 'a = ΣF / m', plug: 'a = ([[75]] N) / ([[50]] kg)', lhs: 'a =', ans: 1.5, unit: 'm/s²', finalLine: 'a = 1.5 m/s²',
    }),
    (el, api) => WORK(el, api, {
      ctx: 'A 0.125 kg baseball is accelerated at 120 m/s².',
      q: 'How much net force is needed?', eq: 'ma', form: 'ΣF = m · a', plug: 'ΣF = ([[0.125]] kg)([[120]] m/s²)', lhs: 'ΣF =', ans: 15, unit: 'N', finalLine: 'ΣF = 15 N',
    }),
    (el, api) => WORK(el, api, {
      ctx: 'The thrusters on the International Space Station push with 167,840 N of net force, which gives only 0.4 m/s² of acceleration.',
      q: 'What is the mass of the ISS?', eq: 'ma', form: 'ΣF = m · a', plug: '[[167840]] N = m · ([[0.4]] m/s²)', lhs: 'm =', ans: 419600, tol: 1, unit: 'kg', finalLine: 'm = 419,600 kg',
      hint: 'Divide both sides by 0.4 m/s².',
    }),
    (el, api) => WORK(el, api, {
      ctx: 'The ISS has a 0.4 m/s² acceleration. The thrusters burn for 10 s.',
      q: 'How much does its velocity change?', eq: 'dvt', form: 'Δv = a · t', plug: 'Δv = ([[0.4]] m/s²)([[10]] s)', lhs: 'Δv =', ans: 4, unit: 'm/s', finalLine: 'Δv = 4 m/s',
    }),
    (el, api) => WORK(el, api, {
      ctx: 'Baby Henry kicks a soccer ball with all his force, and it accelerates at 4 m/s². Edgar then kicks the same ball with 6x more force.',
      q: 'Find the new acceleration.', eq: 'a2', form: 'a = ΣF / m', plug: 'a = ([[6]] × [[4]] m/s²)', lhs: 'a =', ans: 24, unit: 'm/s²', finalLine: 'a = 24 m/s²',
      hint: 'Same mass, 6 times the force: the acceleration is 6 times bigger.',
    }),
    (el, api) => WORK(el, api, {
      ctx: 'A dump truck accelerates at 3 m/s² empty. When full, its mass doubles, and the force stays the same.',
      q: 'How fast can it accelerate when full?', eq: 'a2', form: 'a = ΣF / m', plug: 'a = (3 m/s²)(1 / [[2]])', lhs: 'a =', ans: 1.5, unit: 'm/s²', finalLine: 'a = 1.5 m/s²',
      hint: 'Double the mass with the same force: a is cut in half.',
    }),
    (el, api) => WORK(el, api, {
      ctx: 'Nathan pushes off 2x harder than Carla, but has 4x her mass. Carla accelerates at 5 m/s².',
      q: 'How fast does Nathan accelerate?', eq: 'a2', form: 'a = ΣF / m', plug: 'a = ([[2]] × 5 m/s²) / [[4]]', lhs: 'a =', ans: 2.5, unit: 'm/s²', finalLine: 'a = 2.5 m/s²',
      hint: 'Force 2x bigger, mass 4x bigger. Multiply the force ratio by the acceleration, then divide by the mass ratio.',
    }),
    (el, api) => WORK(el, api, {
      ctx: 'A 1000 kg car accelerates at 3.5 m/s². The engine pushes forward with 5000 N.',
      q: 'Find the net force on the car.', eq: 'ma', form: 'ΣF = m · a', plug: 'ΣF = ([[1000]] kg)([[3.5]] m/s²)', lhs: 'ΣF =', ans: 3500, unit: 'N', finalLine: 'ΣF = 3500 N',
    }),
    (el, api) => WORK(el, api, {
      ctx: 'Same car: the engine pushes forward with 5000 N, and the net force is 3500 N forward.',
      q: 'How much friction acts on the car? (Negative = backward.)', eq: 'net', form: 'ΣF = F<sub>A</sub> + F<sub>f</sub>', plug: '[[3500]] N = ([[5000]] N) + F<sub>f</sub>', lhs: 'F<sub>f</sub> =', ans: -1500, unit: 'N', finalLine: 'F<sub>f</sub> = -1500 N',
      signMsg: 'Right size! Friction points backward, so it\'s negative.', after: 'Friction is 1500 N backward.',
    }),
    (el, api) => WORK(el, api, {
      ctx: 'A skydiver (50 kg) falls from rest and reaches 50 m/s after 25 s.',
      q: 'Find his acceleration.', eq: 'accel', form: 'a = Δv / t', plug: 'a = ([[50]] m/s - [[0]] m/s) / [[25]] s', lhs: 'a =', ans: 2, unit: 'm/s²', finalLine: 'a = 2 m/s² (down)',
    }),
    (el, api) => WORK(el, api, {
      ctx: 'Skydiver: weight = 500 N down (g ≈ 10 m/s²), and he accelerates down at 2 m/s² (net force 100 N down). Treat air resistance as constant.',
      q: 'Find the air resistance on him.', eq: 'net', form: 'ΣF = F<sub>g</sub> + F<sub>air</sub>', plug: '[[500]] N - F<sub>air</sub> = [[100]] N', lhs: 'F<sub>air</sub> =', ans: 400, unit: 'N', finalLine: 'F<sub>air</sub> = 400 N (up)',
      hint: 'Gravity is 500 N down. Air pushes up. The net is only 100 N down.',
      after: 'The air pushes up with 400 N, so the net force is 500 - 400 = 100 N down.',
    }),
  ],
});

// ---------- Newton's 2nd law diagrams (figure blanks) ----------
Game.add({
  id: 'n2', section: 'accel', tag: 'Newton 2', title: 'Newton\'s 2nd Law: Fill in the Blanks',
  blurb: 'Free body diagrams with blanks: find the mass, net force, and acceleration for an elephant, a parachute, a car, a sled, and more.',
  steps: [
    (el, api) => WORK(el, api, {
      ctx: 'An elephant (10000 kg) accelerates at 8.0 m/s² down.',
      q: 'Find the net force on it.', eq: 'ma', form: 'ΣF = m · a', plug: 'ΣF = ([[10000]] kg)([[8]] m/s²)', lhs: 'ΣF =', ans: 80000, unit: 'N', finalLine: 'ΣF = 80,000 N down',
    }),
    (el, api) => WORK(el, api, {
      ctx: 'A parachute (800 kg with rider) accelerates at 6.0 m/s² up.',
      q: 'Find the net force on it.', eq: 'ma', form: 'ΣF = m · a', plug: 'ΣF = ([[800]] kg)([[6]] m/s²)', lhs: 'ΣF =', ans: 4800, unit: 'N', finalLine: 'ΣF = 4800 N up',
    }),
    (el, api) => WORK(el, api, {
      ctx: 'A car has F<sub>grav</sub> = 10000 N. Use g = 10 m/s².',
      q: 'Find its mass.', eq: 'Fg', form: 'F<sub>g</sub> = m · g', plug: '[[10000]] N = m · ([[10]] m/s²)', lhs: 'm =', ans: 1000, unit: 'kg', finalLine: 'm = 1000 kg',
    }),
    (el, api) => WORK(el, api, {
      ctx: 'That car\'s only horizontal force is friction, 9000 N to the left, and its mass is 1000 kg.',
      q: 'Find its acceleration (speed = magnitude).', eq: 'a2', form: 'a = ΣF / m', plug: 'a = ([[9000]] N) / ([[1000]] kg)', lhs: 'a =', ans: 9, unit: 'm/s²', finalLine: 'a = 9 m/s² (left)',
      after: 'The only horizontal force is friction, so the net force is 9000 N left, and the car accelerates left at 9 m/s².',
    }),
    (el, api) => WORK(el, api, {
      ctx: 'A wheelbarrow: F<sub>norm</sub> = F<sub>grav</sub> = 9000 N. Use g = 10 m/s².',
      q: 'Find its mass.', eq: 'Fg', form: 'F<sub>g</sub> = m · g', plug: '[[9000]] N = m · ([[10]] m/s²)', lhs: 'm =', ans: 900, unit: 'kg', finalLine: 'm = 900 kg',
    }),
    (el, api) => WORK(el, api, {
      ctx: 'The wheelbarrow (900 kg) accelerates at 1.50 m/s² to the right.',
      q: 'Find the net force.', eq: 'ma', form: 'ΣF = m · a', plug: 'ΣF = ([[900]] kg)([[1.5]] m/s²)', lhs: 'ΣF =', ans: 1350, unit: 'N', finalLine: 'ΣF = 1350 N right',
    }),
    (el, api) => WORK(el, api, {
      ctx: 'A sled (F<sub>norm</sub> = F<sub>grav</sub> = 600 N, so m = 60 kg) has only friction, 100 N to the left.',
      q: 'Find its acceleration (magnitude).', eq: 'a2', form: 'a = ΣF / m', plug: 'a = ([[100]] N) / ([[60]] kg)', lhs: 'a =', ans: 1.67, tol: 0.01, unit: 'm/s²', finalLine: 'a = 1.67 m/s² (left)',
    }),
    (el, api) => WORK(el, api, {
      ctx: 'A 2000 kg cart is pushed right by F<sub>app</sub> = 14000 N, and it accelerates at 2.0 m/s² to the right.',
      q: 'Find the net force.', eq: 'ma', form: 'ΣF = m · a', plug: 'ΣF = ([[2000]] kg)([[2]] m/s²)', lhs: 'ΣF =', ans: 4000, unit: 'N', finalLine: 'ΣF = 4000 N right',
    }),
    (el, api) => WORK(el, api, {
      ctx: 'Same cart: F<sub>app</sub> = 14000 N right, ΣF = 4000 N right.',
      q: 'Find the friction.', eq: 'net', form: 'ΣF = F<sub>app</sub> + F<sub>f</sub>', plug: '[[4000]] N = ([[14000]] N) + F<sub>f</sub>', lhs: 'F<sub>f</sub> =', ans: -10000, unit: 'N', finalLine: 'F<sub>f</sub> = -10000 N (10000 N left)',
      signMsg: 'Right size! Friction is to the left, so it\'s negative.',
    }),
  ],
});

// ---------- FBD walkaround: speeding up or slowing down ----------
function fbdStep(scene, palette, need, ctx, q, explain, hint) {
  return (el, api) => FBD(el, api, { ctx, q, scene, palette, need, hint, explain });
}
Game.add({
  id: 'f1', section: 'accel', tag: 'FBD 1', title: 'FBD Walkaround',
  blurb: 'Parachutes, a sliding block, a cart and hanging mass, a ball, and a string. Draw each free body diagram and say whether it\'s speeding up or slowing down.',
  steps: [
    fbdStep(SPR.para, ['Fg', 'Fair', 'FN'], { up: ['Fair'], down: ['Fg'] }, 'Parachute: dropped from as high as you can. Velocity down, speeding up.', 'Draw the free body diagram when the parachute first starts falling and speeds up.', 'Net force down. Air resistance is still small.', 'Gravity is bigger than air resistance.'),
    fbdStep(SPR.para, ['Fg', 'Fair', 'FN'], { up: ['Fair'], down: ['Fg'] }, 'Parachute: air resistance is strong enough that it falls at a constant velocity (terminal velocity).', 'Draw the free body diagram at terminal velocity.', 'Balanced: velocity is constant, so the forces are equal in size.', 'Make the two arrows the same length.'),
    fbdStep(SPR.para, ['Fg', 'Fair', 'FN'], { up: ['FN', 'Fair'], down: ['Fg'] }, 'Parachute: hitting the ground and stopping. Velocity is still down, but it\'s slowing down very quickly.', 'Draw the free body diagram during the instant it is stopped by the ground.', 'Velocity down, slowing down, so the net force and acceleration are up. The ground pushes up hard.', 'The ground\'s push (F<sub>N</sub>) is much bigger than gravity.'),
    fbdStep(SPR.block, ['Fg', 'FN', 'FA', 'Ff'], { up: ['FN'], down: ['Fg'], left: ['Ff'], right: ['FA'] }, 'Pass the block: a student pushes it so it speeds up to the right.', 'Draw the free body diagram while it speeds up.', 'Push (F<sub>A</sub>) is bigger than friction. Net force right: speeding up to the right.', 'Up and down balance. Left and right don\'t.'),
    fbdStep(SPR.block, ['Fg', 'FN', 'FA', 'Ff'], { up: ['FN'], down: ['Fg'], left: ['Ff', 'FA'] }, 'Pass the block: the block is moving right, and the other student\'s hand stops it.', 'Draw the free body diagram while the block is being stopped.', 'Velocity right, slowing down: the net force is left. Friction and the hand both push left.', 'Both the hand and friction act to the left.'),
    fbdStep(wagonSVG(180, 150, false), ['Fg', 'FN', 'Ften', 'Ff'], { up: ['FN'], down: ['Fg'], left: ['Ff'], right: ['Ften'] }, 'Cart and hanging mass: the hanging mass pulls the cart toward the pulley with the rope. The cart is moving toward the pulley and speeding up.', 'Draw the free body diagram for the cart only, before the hanging mass hits the ground.', 'Velocity toward the pulley, speeding up: the rope pull is bigger than friction.', 'The rope pulls the cart with F<sub>tens</sub> toward the pulley.'),
    fbdStep(SPR.hang, ['Fg', 'Ften', 'FN'], { up: ['Ften'], down: ['Fg'] }, 'Cart and hanging mass: the hanging mass falls, speeding up.', 'Draw the free body diagram for the hanging mass only.', 'Velocity down, speeding up: gravity is bigger than the rope\'s pull.', 'The rope pulls up. Gravity pulls down, and it\'s bigger.'),
    fbdStep(SPR.ball, ['Fg', 'FA'], { up: ['FA'], down: ['Fg'] }, 'Free falling ball: the ball is in the hand, being thrown up. Velocity up, speeding up.', 'Draw the free body diagram while the ball is in the hand.', 'The hand pushes up, bigger than gravity: net force up, speeding up.', 'Your hand is the force F<sub>A</sub>.'),
    fbdStep(SPR.ball, ['Fg', 'FA'], { down: ['Fg'] }, 'Free falling ball: the ball is in the air, going up, slowing down.', 'Draw the free body diagram while the ball is in the air going up. Ignore air resistance.', 'Only gravity acts. The net force is down, which slows the ball going up.', 'Only one force acts. Don\'t add a force "in the direction of motion".'),
    fbdStep(SPR.hang, ['Fg', 'Ften', 'FN'], { up: ['Ften'], down: ['Fg'] }, 'Lifting by a string: the kilogram is accelerating upward from rest, speeding up.', 'Draw the free body diagram during the upward acceleration.', 'Velocity up, speeding up: the string pulls up harder than gravity pulls down.', 'Make F<sub>tens</sub> longer than F<sub>g</sub>.'),
  ],
});

// ---------- classic FBDs ----------
Game.add({
  id: 'f2', section: 'accel', tag: 'FBD 2', title: 'Classic Free Body Diagrams',
  blurb: 'A book on a table, a crate pushed at constant velocity, a sledder slowing down, a ball at its peak, an elevator, and a crate accelerated across the floor.',
  steps: [
    fbdStep(SPR.block, ['Fg', 'FN', 'Ff', 'FA'], { up: ['FN'], down: ['Fg'] }, 'A physics book rests on a level table.', 'Draw the free body diagram.', 'The table pushes up (F<sub>N</sub>) and gravity pulls down. Balanced, at rest.', 'No friction, no push: only the two vertical forces.'),
    fbdStep(SPR.block, ['Fg', 'FN', 'FA', 'Ff'], { up: ['FN'], down: ['Fg'], left: ['FA'], right: ['Ff'] }, 'A large crate is being pushed leftward at a constant velocity.', 'Draw the free body diagram.', 'Constant velocity: balanced. Push left equals friction right.', 'Friction always opposes the motion.'),
    fbdStep(SPR.block, ['Fg', 'FN', 'Ff', 'FA'], { up: ['FN'], down: ['Fg'], left: ['Ff'] }, 'A sledder has reached the bottom of a hill and is coasting right while slowing down.', 'Draw the free body diagram.', 'Coasting right and slowing: the only horizontal force is friction, pointing left.', 'No push. Only friction acts sideways.'),
    fbdStep(SPR.ball, ['Fg', 'FN', 'Fair'], { down: ['Fg'] }, 'A ball is moving upward toward its peak. Ignore air resistance.', 'Draw the free body diagram.', 'Only gravity. At the peak its velocity is zero, but the net force is still down.', 'Velocity can be zero while the acceleration is not.'),
    fbdStep(SPR.hang, ['Fg', 'Ften', 'FN'], { up: ['Ften'], down: ['Fg'] }, 'An elevator is rising at a constant velocity. It is not touching the shaft.', 'Draw the free body diagram.', 'Constant velocity: the cable tension equals gravity.', 'The two arrows are the same length.'),
    fbdStep(SPR.block, ['Fg', 'FN', 'FA', 'Ff'], { up: ['FN'], down: ['Fg'], right: ['FA'], left: ['Ff'] }, 'A force is applied to accelerate a crate across a rough horizontal surface.', 'Draw the free body diagram.', 'Net force points right (the applied force is bigger than friction), so it speeds up to the right.', 'Friction is still there, on the left.'),
  ],
});

// ---------- packet boss ----------
const BOSS4_GENS = [
  () => { const v0 = pick([0, 2, 4, 5]), vf = pick([10, 12, 16, 20, 24]), t = pick([2, 4, 5]); const a = +((vf - v0) / t).toFixed(2); return { num: { q: `A cyclist speeds up from ${v0} m/s to ${vf} m/s in ${t} s. What is her acceleration?`, ans: a, tol: 0.02, unit: 'm/s²', explain: eqs('a = &Delta;v / t', `a = (${vf} m/s - ${v0} m/s) / ${t} s`, `a = ${a} m/s²`) } }; },
  () => { const m = pick([2, 4, 5, 8]), F = pick([12, 20, 30, 40]), a = +(F / m).toFixed(2); return { num: { q: `A ${m} kg cart has a net force of ${F} N. What is its acceleration?`, ans: a, tol: 0.02, unit: 'm/s²', explain: eqs('a = &Sigma;F / m', `a = ${F} N / ${m} kg`, `a = ${a} m/s²`) } }; },
  () => { const m = pick([2, 5, 10]), a = pick([2, 3, 4]); return { num: { q: `A ${m} kg object accelerates at ${a} m/s². What is the net force?`, ans: m * a, unit: 'N', explain: eqs('&Sigma;F = m · a', `&Sigma;F = ${m} kg · ${a} m/s²`, `&Sigma;F = ${m * a} N`) } }; },
  () => { const a0 = pick([2, 3, 4]), X = pick([2, 3, 6]), Y = pick([2, 4]); return { num: { q: `An object accelerates at ${a0} m/s². The force is ${X}x bigger and the mass is ${Y}x bigger. What is the new acceleration?`, ans: +(a0 * X / Y).toFixed(2), tol: 0.02, unit: 'm/s²', explain: eqs('a = &Sigma;F / m', `a = (${X} × ${a0}) / ${Y}`, `a = ${+(a0 * X / Y).toFixed(2)} m/s²`) } }; },
  () => { const FA = pick([50, 80, 120]), net = pick([10, 20, 30]); return { num: { q: `A push of ${FA} N right gives a net force of ${net} N right. What is friction?`, ans: net - FA, unit: 'N', signMsg: 'Right size! Friction points left, so it\'s negative.', explain: eqs('&Sigma;F = F<sub>A</sub> + F<sub>f</sub>', `${net} N = ${FA} N + F<sub>f</sub>`, `F<sub>f</sub> = ${net - FA} N`) } }; },
  () => { const a = pick([2, 3, 4, 5]), t = pick([3, 4, 5, 6]); return { num: { q: `A go-kart starts from rest and accelerates at ${a} m/s² for ${t} s. What is its final velocity?`, ans: a * t, unit: 'm/s', explain: eqs('v<sub>f</sub> = v<sub>i</sub> + a · t', `v<sub>f</sub> = 0 + ${a} m/s² · ${t} s`, `v<sub>f</sub> = ${a * t} m/s`) } }; },
  () => { const vi = pick([4, 6, 10]), vf = pick([12, 14, 18]); return { num: { q: `An object speeds up from ${vi} m/s to ${vf} m/s at constant acceleration. What is its average velocity?`, ans: (vi + vf) / 2, unit: 'm/s', explain: eqs('v<sub>avg</sub> = (v<sub>f</sub> + v<sub>i</sub>) / 2', `v<sub>avg</sub> = (${vf} + ${vi}) / 2`, `v<sub>avg</sub> = ${(vi + vf) / 2} m/s`) } }; },
  () => ({ mcq: { q: 'Doubling the net force on the same cart does what to its acceleration?', opts: [{ t: 'Doubles it', ok: true }, { t: 'Halves it', why: 'Acceleration is directly proportional to net force.' }, { t: 'No change', why: 'More force, more acceleration.' }, { t: 'Quadruples it', why: 'Only the force doubled, so a doubles.' }], explain: 'a is directly proportional to ΣF.' } }),
  () => ({ mcq: { q: 'Same net force, but double the mass. What happens to acceleration?', opts: [{ t: 'Halves', ok: true }, { t: 'Doubles', why: 'More mass, more inertia.' }, { t: 'No change', why: 'Mass changes the result.' }, { t: 'Becomes zero', why: 'Only zero net force gives zero acceleration.' }], explain: 'a is inversely proportional to m.' } }),
  () => ({ mcq: { q: 'You are moving right and slowing down. Your acceleration points...', opts: [{ t: 'left', ok: true }, { t: 'right', why: 'Right is your velocity. Slowing down makes a opposite.' }, { t: 'up', why: 'Here the motion is horizontal.' }, { t: 'zero', why: 'Slowing down means velocity is changing.' }], explain: 'Slowing down: a is opposite v.' } }),
  () => ({ mcq: { q: 'A v-t graph line is above the axis and moving toward the axis. The object is...', opts: [{ t: 'moving forward and slowing down', ok: true }, { t: 'moving forward and speeding up', why: 'Moving toward the axis means the speed is dropping.' }, { t: 'moving backward and slowing down', why: 'Above the axis is forward.' }, { t: 'at rest', why: 'At rest is a flat line on the axis.' }], explain: 'Above the axis = forward. Toward the axis = slowing down.' } }),
  () => ({ mcq: { q: 'A line below the axis that moves away from the axis means...', opts: [{ t: 'moving backward and speeding up', ok: true }, { t: 'moving backward and slowing down', why: 'Moving away from the axis means speeding up.' }, { t: 'moving forward and speeding up', why: 'Below the axis is backward.' }, { t: 'constant velocity', why: 'A sloped line means changing velocity.' }], explain: 'Below = -. Away from the axis = speeding up.' } }),
  () => ({ mcq: { q: 'A skydiver reaches terminal velocity. The forces on him are...', opts: [{ t: 'balanced, with air resistance equal to his weight', ok: true }, { t: 'unbalanced, with gravity bigger', why: 'Then he would still be speeding up.' }, { t: 'unbalanced, with air resistance bigger', why: 'Then he would be slowing down.' }, { t: 'zero, because he is falling', why: 'Falling doesn\'t mean no forces.' }], explain: 'Constant velocity means ΣF = 0.' } }),
  () => ({ mcq: { q: 'Which units make a = ΣF / m come out in m/s²?', opts: [{ t: 'N and kg', ok: true }, { t: 'm and s', why: 'Those are distance and time.' }, { t: 'kg and s', why: 'Mass and time don\'t give acceleration.' }, { t: 'N and s', why: 'Time isn\'t in the denominator.' }], explain: '1 N = 1 kg·m/s², so N ÷ kg = m/s².' } }),
  () => ({ mcq: { q: 'A velocity-time graph has a flat line on the t-axis, at zero. The object is...', opts: [{ t: 'at rest, with no net force', ok: true }, { t: 'speeding up', why: 'Speeding up means the line rises.' }, { t: 'moving at a steady speed (not zero)', why: 'A steady speed that isn\'t zero is a flat line above or below the axis, not on it.' }, { t: 'slowing down', why: 'Slowing down means the line falls toward zero.' }], explain: 'Flat on the axis = at rest = no net force.' } }),
  () => { const m = pick([0.5, 2, 5]); return { num: { q: `What is the weight of a ${m} kg object? (g = 10 m/s²)`, ans: -10 * m, unit: 'N', explain: eqs('F<sub>g</sub> = m · g', `F<sub>g</sub> = ${m} kg · (-10 m/s²)`, `F<sub>g</sub> = ${-10 * m} N`) } }; },
];
Game.add({
  id: 'boss4', boss: true, section: 'accel', tag: 'Packet Boss', title: 'Acceleration Showdown',
  blurb: '10 random questions from the whole packet. Calculations need the equation, plug-in, and units. Three hearts.',
  steps: (store => Array.from({ length: 10 }, (_, k) => bossStep(k, BOSS4_GENS, store)))({}),
});
