// Unit 3: 2nd Law & Acceleration (from the unit summary): vectors, acceleration, v-t graphs, unbalanced FBDs, Newton's 2nd law, multistep problems.

// ---------- vector lab: tail to tip ----------
function vecLab(el, api) {
  el.append(h('div', { class: 'q' }, 'Vector lab: add the east and north vectors tail to tip.'),
    h('p', { class: 'ctx', html: 'Slide the two vectors. Goal: a <b>resultant of 5 m/s</b> pointing <b>53&deg; north of east</b>, the 3-4-5 triangle.' }));
  const scene = h('div', { class: 'panel' }), read = h('div', { class: 'readout' });
  const sE = h('input', { type: 'range', min: 0, max: 8, step: 1, value: 3, id: 'vecE', 'aria-label': 'East vector in m/s' });
  const sN = h('input', { type: 'range', min: 0, max: 8, step: 1, value: 0, id: 'vecN', 'aria-label': 'North vector in m/s' });
  const lE = h('label', { for: 'vecE', class: 'hint' }), lN = h('label', { for: 'vecN', class: 'hint' });
  const goal = h('div', { class: 'goal' }, 'Goal: resultant 5 m/s at 53° north of east.');
  el.append(h('div', { class: 'sim' }, scene, h('div', { style: 'display:flex;flex-direction:column;gap:10px;min-width:0' }, lE, sE, lN, sN, read)), goal);
  let won = false;
  const draw = () => {
    const E = +sE.value, N = +sN.value, R = Math.hypot(E, N), th = Math.atan2(N, E) * 180 / Math.PI;
    const k = 22, ox = 40, oy = 196, ex = ox + E * k, ny = oy - N * k;
    lE.textContent = `East (x): ${E} m/s`; lN.textContent = `North (y): ${N} m/s`;
    scene.innerHTML = `<svg viewBox="0 0 400 220" role="img" aria-label="Vectors added tail to tip">
      <line x1="${ox}" y1="${oy}" x2="${ox + 8 * k}" y2="${oy}" style="stroke:var(--line)" stroke-dasharray="4 4"/>
      ${E ? arrowSVG(ox, oy, ex, oy, '--f-a', null, 0, 0, 4, '') : ''}
      ${N ? arrowSVG(ex, oy, ex, ny, '--f-n', null, 0, 0, 4, '') : ''}
      ${R ? arrowSVG(ox, oy, ex, ny, '--pen', null, 0, 0, 5, '') : ''}
      <text x="${(ox + ex) / 2}" y="${oy + 18}" text-anchor="middle" style="fill:var(--f-a);font:700 13px var(--mono)">${E} east</text>
      ${N ? `<text x="${ex + 8}" y="${(oy + ny) / 2}" style="fill:var(--f-n);font:700 13px var(--mono)">${N} north</text>` : ''}
      <text x="${(ox + ex) / 2 - 60}" y="${(oy + ny) / 2 - 6}" style="fill:var(--pen);font:700 13px var(--mono)">R = ${R.toFixed(1)}</text></svg>`;
    read.innerHTML = `<span>R<sup>2</sup> = x<sup>2</sup> + y<sup>2</sup> = ${E}<sup>2</sup> + ${N}<sup>2</sup> = ${E * E + N * N}</span>
      <span class="big">R = ${R.toFixed(2)} m/s</span>
      <span>${R ? `&theta; = tan<sup>-1</sup>(y / x) = ${th.toFixed(1)}&deg; ${N ? 'north of east' : 'due east'}` : 'No resultant yet.'}</span>`;
    if (Math.abs(R - 5) < 0.05 && Math.abs(th - 53.13) < 0.5 && !won) {
      won = true; goal.classList.add('met'); goal.textContent = 'Got it: the 3-4-5 triangle. 5 m/s at 53° north of east.'; SFX.win();
      api.right(20, goal);
      api.done('Vectors add tail to tip: the resultant runs from where the first vector starts to where the last one ends. At right angles, Pythagoras gives the size and tan θ = y / x gives the direction.');
    }
  };
  sE.oninput = draw; sN.oninput = draw; draw();
}

// ---------- accelerating motion player: piecewise constant acceleration [t0, t1, v0, a] ----------
function accelPlayer(el, api, cfg) {
  stepHead(el, cfg);
  const segs = cfg.segs, T = segs[segs.length - 1][1], NS = 160;
  const segAt = t => segs.find(s => t >= s[0] && t < s[1]) || segs[segs.length - 1];
  const vAt = t => { const [t0, , v0, a] = segAt(t); return v0 + a * (t - t0); };
  const aAt = t => segAt(t)[3];
  const xAt = t => { let x = cfg.x0 || 0; for (const [t0, t1, v0, a] of segs) { if (t <= t0) break; const u = Math.min(t, t1) - t0; x += v0 * u + 0.5 * a * u * u; } return x; };
  const ts = Array.from({ length: NS + 1 }, (_, i) => T * i / NS);
  const vpts = ts.map(t => [t, vAt(t)]), xpts = ts.map(t => [t, xAt(t)]);
  const XF = frame(cfg.xg), VF = frame(cfg.vg), [m0, m1] = cfg.track;
  const track = h('div', { class: 'panel track' }), gx = h('div', { class: 'panel' }), gv = h('div', { class: 'panel' }), read = h('div', { class: 'readout' });
  const slider = h('input', { type: 'range', min: 0, max: T, step: T / 400, value: 0, 'aria-label': 'time' });
  const play = h('button', { class: 'btn primary small', onclick: () => { if (t >= T) t = 0; running = !running; SFX.click(); } });
  const again = h('button', { class: 'btn small', onclick: () => { t = 0; running = true; done = false; } }, 'Restart');
  slider.oninput = () => { t = +slider.value; running = false; };
  el.append(track, h('div', { class: 'sim' }, gx, gv), h('div', { class: 'row' }, play, again, h('div', { style: 'flex:1;min-width:140px' }, slider)), read);
  let t = 0, running = false, done = false; const rate = T / (cfg.seconds || 8);
  const TX = x => 30 + (x - m0) / (m1 - m0) * 340;
  const cur = (F, pts, val, col) => `<svg viewBox="0 0 ${F.W} ${F.H}" class="plot">${F.s}<polyline points="${polyPts(F, pts)}" fill="none" style="stroke:var(--line)" stroke-width="3" stroke-dasharray="4 4"/>
    <polyline points="${polyPts(F, pts.filter(p => p[0] <= t).concat([[t, val]]))}" fill="none" style="stroke:var(${col})" stroke-width="3.5" stroke-linejoin="round"/><circle cx="${F.X(t)}" cy="${F.Y(val)}" r="6" style="fill:var(${col});stroke:var(--card)" stroke-width="2"/></svg>`;
  setTimeout(() => { running = true; }, 400);
  loop(el, dt => {
    if (running) { t = Math.min(T, t + dt * rate); slider.value = t; if (t >= T) running = false; }
    play.textContent = running ? 'Pause' : t >= T ? 'Replay' : 'Play';
    const x = xAt(t), v = vAt(t), a = aAt(t);
    track.innerHTML = `<svg viewBox="0 0 400 86" role="img" aria-label="position track"><line x1="30" y1="50" x2="370" y2="50" style="stroke:var(--muted)" stroke-width="3"/>
      ${Array.from({ length: 11 }, (_, i) => { const m = m0 + i * (m1 - m0) / 10; return `<line x1="${TX(m)}" y1="46" x2="${TX(m)}" y2="54" style="stroke:var(--muted)"/><text x="${TX(m)}" y="70" text-anchor="middle" style="fill:var(--muted);font:10px var(--mono)">${fmt(m)}</text>`; }).join('')}
      <g transform="translate(${TX(x)} 38)">${ICONS[cfg.icon || 'car']}</g></svg>`;
    gx.innerHTML = cur(XF, xpts, x, '--f-a'); gv.innerHTML = cur(VF, vpts, v, '--f-n');
    const msg = Math.abs(a) < 1e-9 ? 'Constant velocity: a = 0, so the net force is zero.' : a * v < 0 ? 'Slowing down: a points opposite to v.' : 'Speeding up: a points the same way as v.';
    read.innerHTML = `<span class="big">t = ${t.toFixed(1)} s</span><span>v = ${fmt(v)} m/s</span><span>a = ${fmt(a)} m/s²</span><span>x = ${fmt(x)} m</span><span>${msg}</span>`;
    if (t >= T && !done) { done = true; api.right(cfg.xp || 15, read); api.done(cfg.note); }
  });
}

// ---------- net force lab: push against 10 N of friction ----------
function forceLab(el, api) {
  el.append(h('div', { class: 'q' }, 'Net force lab: push a cart against 10 N of friction.'),
    h('p', { class: 'ctx', html: 'Friction is always 10 N to the left while the cart moves. Set the push and the mass and watch &Sigma;F and a. Goal 1: <b>a = 2 m/s²</b>. Goal 2: keep the push at <b>20 N</b> and make the cart <b>10 kg</b>.' }));
  const scene = h('div', { class: 'panel' }), read = h('div', { class: 'readout' });
  const sF = h('input', { type: 'range', min: 0, max: 60, step: 1, value: 20, id: 'pushF', 'aria-label': 'Push force in newtons' });
  const sM = h('input', { type: 'range', min: 1, max: 10, step: 1, value: 5, id: 'cartM', 'aria-label': 'Mass in kilograms' });
  const lF = h('label', { for: 'pushF', class: 'hint' }), lM = h('label', { for: 'cartM', class: 'hint' });
  const g1 = h('div', { class: 'goal' }, 'Goal 1: a = 2 m/s².'), g2 = h('div', { class: 'goal' }, 'Goal 2: 20 N push on a 10 kg cart.');
  el.append(h('div', { class: 'sim' }, scene, h('div', { style: 'display:flex;flex-direction:column;gap:10px;min-width:0' }, lF, sF, lM, sM, read)), g1, g2);
  const FR = 10; let x = 0, v = 0, ok1 = false, ok2 = false, finished = false;
  loop(el, dt => {
    const F = +sF.value, m = +sM.value, moving = F > FR;
    const fr = moving ? FR : F, net = moving ? F - FR : 0, a = net / m;
    v = moving ? Math.min(12, v + a * dt) : 0;
    x = (x + v * 4 * dt) % 160;
    lF.textContent = `Push: ${F} N`; lM.textContent = `Mass: ${m} kg`;
    if (Math.abs(a - 2) < 0.01 && !ok1) { ok1 = true; g1.classList.add('met'); g1.textContent = 'Goal 1 met: a = 2 m/s². (10 N net ÷ 5 kg.)'; api.right(10, g1); }
    if (m === 10 && F === 20 && !ok2) { ok2 = true; g2.classList.add('met'); g2.textContent = 'Goal 2 met: a = 1 m/s². Double the mass, half the acceleration.'; api.right(10, g2); }
    if (ok1 && ok2 && !finished) { finished = true; api.done('a = ΣF / m. Keep the net force the same and double the mass, and a halves. Double the net force and a doubles.'); }
    const cx = 110 + x;
    scene.innerHTML = `<svg viewBox="0 0 440 200" role="img" aria-label="Cart with push, friction and net force">
      <line x1="0" y1="148" x2="440" y2="148" style="stroke:var(--muted)" stroke-width="3"/>
      ${Array.from({ length: 15 }, (_, i) => `<line x1="${i * 32 - (x % 32)}" y1="162" x2="${i * 32 - (x % 32) + 12}" y2="162" style="stroke:var(--line)" stroke-width="3"/>`).join('')}
      <g transform="translate(${cx} 0)"><rect x="-44" y="108" width="88" height="28" rx="4" style="fill:var(--card);stroke:var(--ink)" stroke-width="2.5"/>
        <circle cx="-26" cy="142" r="8" style="fill:var(--ink)"/><circle cx="26" cy="142" r="8" style="fill:var(--ink)"/></g>
      ${F ? arrowSVG(cx + 48, 122, cx + 48 + F * 1.5, 122, '--f-a', 'A', cx + 54 + F * 1.5, 118, 4, '') : ''}
      ${arrowSVG(cx - 48, 122, cx - 48 - fr * 1.5, 122, '--f-f', 'f', cx - 54 - fr * 1.5, 104, 4, '')}
      ${net ? arrowSVG(cx, 178, cx + net * 1.5, 178, '--pen', 'net', cx + net * 1.5 + 6, 184, 4, '') : ''}</svg>`;
    read.innerHTML = `<span>F<sub>f</sub> = -${fr} N</span>
      <span>&Sigma;F = F<sub>A</sub> + F<sub>f</sub> = ${F} + (-${fr}) = <b>${net} N</b></span>
      <span>a = &Sigma;F / m = ${net} N / ${m} kg</span>
      <span class="big">a = ${fmt(a)} m/s²${moving ? '' : ' (not moving: friction matches the push)'}</span>`;
  });
}

// ---------- stations ----------
Game.add({
  id: 'u1', section: 'unit3', tag: 'Unit 3.1', title: 'Tail to Tip',
  blurb: 'Adding vectors: the same way, opposite ways, and at right angles (Pythagoras and trig).',
  steps: [
    (el, api) => MCQ(el, api, {
      q: 'A box is pushed 3 N east and 4 N east at the same time. What is the resultant force?',
      opts: [
        { t: '7 N east', ok: true },
        { t: '1 N east', why: 'That would be subtracting. These point the same way, so they add.' },
        { t: '5 N east', why: '5 is the answer for vectors at right angles. These are on the same line.' },
        { t: '12 N east', why: 'Multiplying is not adding vectors.' },
      ],
      explain: 'Vectors pointing the same way: add the sizes. The resultant is <b>7 N east</b>.',
    }),
    (el, api) => MCQ(el, api, {
      q: 'Now 3 N east and 4 N <b>west</b>. What is the resultant?',
      opts: [
        { t: '1 N west', ok: true },
        { t: '7 N west', why: 'Opposite directions cancel each other out. You subtract.' },
        { t: '1 N east', why: 'The bigger force (4 N) wins, and it points west.' },
        { t: '5 N west', why: '5 is for right angles, not opposite directions.' },
      ],
      explain: '<span class="eq">4 N west - 3 N east = 1 N west</span>The bigger vector sets the direction.',
    }),
    vecLab,
    (el, api) => WORK(el, api, {
      q: 'Right angles: 3 m/s east and 4 m/s north. Find the resultant speed.',
      eq: 'pyth', form: 'R<sup>2</sup> = x<sup>2</sup> + y<sup>2</sup>', plug: 'R<sup>2</sup> = ([[3]] m/s)<sup>2</sup> + ([[4]] m/s)<sup>2</sup>', lhs: 'R =', ans: 5, unit: 'm/s', finalLine: 'R = 5 m/s',
      hint: 'Pythagoras: square each part, add them, then take the square root.',
      after: 'The 3-4-5 triangle: the square root of 25 is 5.',
    }),
    (el, api) => WORK(el, api, {
      q: 'Which way is it pointing? Find the angle &theta;, measured from east.',
      eq: 'tan', form: 'tan θ = y / x', plug: 'tan θ = ([[4]] m/s) / ([[3]] m/s)', lhs: 'θ =', ans: 53.1, tol: 0.2, unit: '°', finalLine: 'θ = 53.1° north of east',
      hint: 'Divide the north part by the east part, then press tan⁻¹ (arctan) on your calculator.',
      after: 'Pythagoras gives the size, and tan θ = y / x gives the direction.',
    }),
    (el, api) => MCQ(el, api, {
      q: 'Vocab check: what is a <b>resultant vector</b>?',
      opts: [
        { t: 'The vector sum of two or more vectors', ok: true },
        { t: 'A vector that points straight down', why: 'That\'s a weight vector, not a resultant.' },
        { t: 'The difference between two scalars', why: 'Resultants add vectors, and vectors have direction.' },
        { t: 'Any single force in a diagram', why: 'A single force is just one vector. The resultant is the total of all of them.' },
      ],
      explain: 'Tail to tip: put the vectors end to end. The resultant goes from the first tail to the last tip.',
    }),
  ],
});

Game.add({
  id: 'u2', section: 'unit3', tag: 'Unit 3.2', title: 'Speeding Up or Not?',
  blurb: 'Acceleration is any change in velocity: speed, direction, or both. Then calculate it.',
  steps: [
    (el, api) => SORT(el, api, {
      q: 'Accelerating (velocity changing) or not?',
      bins: ['Accelerating', 'Not accelerating'],
      cards: [
        { t: 'A car speeds up from a red light', bin: 0 },
        { t: 'A bus brakes for a stop sign', bin: 0, why: 'Slowing down is still acceleration: velocity is changing.' },
        { t: 'A car takes a corner at a steady 30 km/h', bin: 0, why: 'The direction of velocity is changing, so velocity is changing.' },
        { t: 'An ice skater spins in a circle at constant speed', bin: 0, why: 'Constant speed, but the direction keeps changing.' },
        { t: 'A dropped ball falls faster and faster', bin: 0 },
        { t: 'Cruise control holds 100 km/h on a straight highway', bin: 1, why: 'Speed and direction are both steady.' },
        { t: 'A hockey puck slides at a steady speed on frictionless ice', bin: 1, why: 'No net force, so no acceleration.' },
        { t: 'A train rolls at a steady 80 km/h on straight track', bin: 1 },
      ],
      explain: 'Acceleration = <b>any change in velocity</b>: speeding up, slowing down, or changing direction.',
    }),
    (el, api) => MCQ(el, api, {
      q: 'A car is moving forward (+) but slowing down. Which way does its acceleration point?',
      opts: [
        { t: 'Backward, opposite to its velocity', ok: true },
        { t: 'Forward, same as its velocity', why: 'That would make it speed up.' },
        { t: 'Zero', why: 'Slowing down means velocity is changing, so a is not zero.' },
        { t: 'Up', why: 'Here acceleration is along the road, not up.' },
      ],
      explain: 'Slowing down: a points <b>opposite</b> to v. Speeding up: a points the same way as v.',
    }),
    (el, api) => MCQ(el, api, {
      q: 'Vocab check: which symbol and SI unit go with acceleration?',
      opts: [
        { t: 'a, m/s²', ok: true },
        { t: 'v, m/s', why: 'v is velocity, a different quantity from acceleration.' },
        { t: 'F, N', why: 'F is force.' },
        { t: 'Δx, m', why: 'Δx is displacement.' },
      ],
      explain: 'a = Δv / t. Acceleration is a <b>vector</b>, so it has a direction. Also written m/s/s.',
    }),
    (el, api) => WORK(el, api, {
      q: 'A car goes from 0 to 20 m/s in 4 s. Find its acceleration.',
      eq: 'accel', form: 'a = Δv / t', plug: 'a = ([[20]] m/s - [[0]] m/s) / [[4]] s', lhs: 'a =', ans: 5, unit: 'm/s²', finalLine: 'a = 5 m/s²',
      hint: 'Δv = final velocity minus starting velocity.', after: 'Positive: it speeds up in the same direction as its velocity.',
    }),
    (el, api) => WORK(el, api, {
      q: 'A bike slows from 10 m/s (forward) to 2 m/s in 4 s. Find its acceleration, with the sign.',
      eq: 'accel', form: 'a = Δv / t', plug: 'a = ([[2]] m/s - [[10]] m/s) / [[4]] s', lhs: 'a =', ans: -2, unit: 'm/s²', finalLine: 'a = -2 m/s²',
      signMsg: 'Right size! It slowed down, so its acceleration points opposite to its velocity: negative.',
      hint: 'Δv = 2 - 10. Is that positive or negative?', after: 'Negative: opposite to the forward velocity, so it slows down.',
    }),
    (el, api) => MCQ(el, api, {
      q: 'A train has a very high top speed but low acceleration. What does that tell you?',
      opts: [
        { t: 'It takes a long time for its velocity to change', ok: true },
        { t: 'It can never go very fast', why: 'Top speed is about velocity, and that can be high.' },
        { t: 'Its velocity is zero', why: 'It has a high top speed, so its velocity can be big.' },
        { t: 'It has no mass', why: 'Trains have a lot of mass, which is why they change velocity slowly.' },
      ],
      explain: 'Acceleration is how quickly velocity changes. A train changes its velocity slowly.',
    }),
  ],
});

Game.add({
  id: 'u3', section: 'unit3', tag: 'Unit 3.3', title: 'Velocity-Time Graphs',
  blurb: 'Slope is acceleration. Area is displacement. Watch a car speed up, then read its graph.',
  steps: [
    (el, api) => MCQ(el, api, {
      q: 'On a velocity-time graph, the <b>slope</b> of the line tells you...',
      opts: [
        { t: 'the acceleration', ok: true },
        { t: 'the displacement', why: 'Displacement is the area under the graph.' },
        { t: 'the mass', why: 'Mass doesn\'t appear on a v-t graph.' },
        { t: 'the velocity', why: 'The height of the line is velocity. The slope is how that changes.' },
      ],
      explain: 'Slope = Δv / Δt = a. Area under the graph = displacement.',
    }),
    (el, api) => accelPlayer(el, api, {
      q: 'Watch a car speed up from rest to 20 m/s, then cruise. Both graphs draw as it goes.',
      segs: [[0, 4, 0, 5], [4, 8, 20, 0]], x0: 0, track: [0, 130], icon: 'car', seconds: 8,
      xg: { x: [0, 8, 1], y: [0, 130, 20], yl: 'x - position (m)' },
      vg: { x: [0, 8, 1], y: [0, 24, 4], yl: 'v - velocity (m/s)' },
      note: 'Part 1 (0-4 s): the v-t line climbs, so a = 5 m/s². Part 2 (4-8 s): flat, so a = 0.',
    }),
    (el, api) => WORK(el, api, {
      media: plotSVG({ x: [0, 8, 1], y: [0, 24, 4], yl: 'v - velocity (m/s)' }, [[0, 0], [4, 20], [8, 20]]),
      q: 'Use the slope of the first part of the graph to find the acceleration.',
      eq: 'accel', form: 'a = Δv / Δt', plug: 'a = ([[20]] m/s - [[0]] m/s) / ([[4]] s - [[0]] s)', lhs: 'a =', ans: 5, unit: 'm/s²', finalLine: 'a = 5 m/s²',
      hint: 'Rise over run: how much did velocity change, divided by how long it took?', after: 'Slope = rise / run = acceleration.',
    }),
    (el, api) => WORK(el, api, {
      media: plotSVG({ x: [0, 8, 1], y: [0, 24, 4], yl: 'v - velocity (m/s)' }, [[0, 0], [4, 20], [8, 20]]),
      q: 'Displacement for the first 4 seconds is the area under the line (a triangle).',
      eq: 'tri', form: 'Δx = ½ · base · height', plug: 'Δx = ½ ([[4]] s)([[20]] m/s)', lhs: 'Δx =', ans: 40, unit: 'm', finalLine: 'Δx = 40 m',
      hint: 'Triangle area = ½ × base × height. The base is the time, the height is the velocity.', after: 'It moved 40 m in the first 4 s.',
    }),
    (el, api) => GRAPHDRAW(el, api, {
      q: 'Draw the v-t graph for a bike that speeds up from 2 m/s to 10 m/s in 4 s, then keeps 10 m/s for 4 more seconds.',
      x: [0, 8, 1], y: [0, 12, 2], snap: [1, 1], yl: 'v - velocity (m/s)',
      pts: [[0, 2], [4, 10], [8, 10]],
      hint: 'Click the starting velocity at t = 0, the velocity at 4 s, and the end at 8 s.',
      explain: 'Slope up from 2 to 10 m/s over 4 s: a = (10 - 2) / 4 = 2 m/s². Then flat at 10 m/s: a = 0.',
    }),
    (el, api) => MCQ(el, api, {
      q: 'A v-t line slopes <b>downward</b> but stays <b>above</b> the t-axis. The object is...',
      opts: [
        { t: 'still moving forward, but slowing down', ok: true },
        { t: 'speeding up in reverse', why: 'Above the axis means forward (positive velocity).' },
        { t: 'at rest', why: 'At rest would be a flat line on the axis.' },
        { t: 'at constant velocity', why: 'A sloped line means velocity is changing.' },
      ],
      explain: 'Above the axis = forward. A downward slope = velocity dropping = negative acceleration.',
    }),
  ],
});

Game.add({
  id: 'u4', section: 'unit3', tag: 'Unit 3.4', title: 'Newton\'s 2nd Law',
  blurb: 'a = ΣF / m. Unbalanced forces accelerate things. Change the push and the mass and watch.',
  steps: [
    (el, api) => WORK(el, api, {
      ctx: 'A 5 kg cart is pushed right with 40 N. Friction pushes back with 10 N, to the left.',
      q: 'Find the net force.',
      eq: 'net', form: 'ΣF = F<sub>1</sub> + F<sub>2</sub>', plug: 'ΣF = ([[40]] N) + ([[-10]] N)', lhs: 'ΣF =', ans: 30, unit: 'N', finalLine: 'ΣF = 30 N',
      hint: 'Right is +, left is -. Add the two forces.', after: 'Unbalanced: 30 N to the right, so the cart accelerates to the right.',
    }),
    (el, api) => WORK(el, api, {
      q: 'Now use Newton\'s 2nd law to find the acceleration.',
      eq: 'a2', form: 'a = ΣF / m', plug: 'a = ([[30]] N) / ([[5]] kg)', lhs: 'a =', ans: 6, unit: 'm/s²', finalLine: 'a = 6 m/s²',
      hint: 'Divide the net force by the mass.', after: 'Units check: N / kg = (kg·m/s²) / kg = m/s².',
    }),
    forceLab,
    (el, api) => MCQ(el, api, {
      q: 'Newton\'s 2nd law says...',
      opts: [
        { t: 'Acceleration is directly proportional to net force and inversely proportional to mass', ok: true },
        { t: 'Acceleration is proportional to mass and inversely proportional to net force', why: 'Flipped. More force means more acceleration; more mass means less.' },
        { t: 'An object at rest stays at rest', why: 'That\'s the 1st law, about balanced forces.' },
        { t: 'Every action has an equal and opposite reaction', why: 'That\'s the 3rd law.' },
      ],
      explain: 'a = ΣF / m. Double the net force and a doubles. Double the mass and a halves.',
    }),
    (el, api) => MCQ(el, api, {
      q: 'Double the net force on the same cart. What happens to its acceleration?',
      opts: [
        { t: 'It doubles', ok: true },
        { t: 'It halves', why: 'That happens when you double the mass.' },
        { t: 'It stays the same', why: 'a depends on net force, so it changes.' },
        { t: 'It quadruples', why: 'Only the force doubled, so a doubles.' },
      ],
      explain: 'a is directly proportional to ΣF.',
    }),
    (el, api) => MCQ(el, api, {
      q: 'Keep the net force the same, but double the mass. What happens to acceleration?',
      opts: [
        { t: 'It halves', ok: true },
        { t: 'It doubles', why: 'More mass means more inertia, so less acceleration.' },
        { t: 'It stays the same', why: 'Mass affects acceleration.' },
        { t: 'It becomes zero', why: 'Only zero net force gives zero acceleration.' },
      ],
      explain: 'a is inversely proportional to m.',
    }),
    (el, api) => MCQ(el, api, {
      q: 'Which units make a = ΣF / m come out in m/s²?',
      opts: [
        { t: 'N and kg', ok: true },
        { t: 'm and s', why: 'Those are distance and time.' },
        { t: 'kg and s', why: 'Mass and time don\'t give acceleration.' },
        { t: 'N and s', why: 'Time doesn\'t go in the denominator here.' },
      ],
      explain: '1 N = 1 kg·m/s². So N ÷ kg = m/s².',
    }),
    (el, api) => FBD(el, api, {
      ctx: 'The cart from before, moving right and speeding up.', q: 'Draw the free body diagram with the unbalanced forces.',
      scene: wagonSVG(180, 150, true), palette: ['Fg', 'FN', 'FA', 'Ff'], need: { up: ['FN'], down: ['Fg'], left: ['Ff'], right: ['FA'] },
      hint: 'Up and down balance. Left and right don\'t, so there\'s a net force.',
      explain: 'Up and down are balanced, so no vertical acceleration. Right has 40 N and left has 10 N, so the net force is 30 N to the right.',
    }),
  ],
});

Game.add({
  id: 'u5', section: 'unit3', tag: 'Unit 3.5', title: 'Multistep Wagon',
  blurb: 'One problem, five steps: net force, acceleration, velocity, and displacement.',
  steps: [
    (el, api) => WORK(el, api, {
      ctx: 'A 10 kg wagon sits at rest. Lola pulls it right with 60 N. Friction pushes back with 20 N.',
      q: 'Step 1: find the net force.',
      eq: 'net', form: 'ΣF = F<sub>A</sub> + F<sub>f</sub>', plug: 'ΣF = ([[60]] N) + ([[-20]] N)', lhs: 'ΣF =', ans: 40, unit: 'N', finalLine: 'ΣF = 40 N',
      hint: 'The pull is right (+), friction is left (-).', after: '40 N to the right. The forces are unbalanced, so the wagon accelerates.',
    }),
    (el, api) => WORK(el, api, {
      q: 'Step 2: find the acceleration.',
      eq: 'a2', form: 'a = ΣF / m', plug: 'a = ([[40]] N) / ([[10]] kg)', lhs: 'a =', ans: 4, unit: 'm/s²', finalLine: 'a = 4 m/s²',
      hint: 'Net force divided by mass.',
    }),
    (el, api) => WORK(el, api, {
      q: 'Step 3: it starts from rest. What is its velocity after 3 s?',
      eq: 'dvt', form: 'Δv = a · t', plug: 'Δv = ([[4]] m/s²)([[3]] s)', lhs: 'Δv =', ans: 12, unit: 'm/s', finalLine: 'Δv = 12 m/s',
      hint: 'Δv = v<sub>f</sub> - v<sub>i</sub>. It starts at 0, so Δv = v<sub>f</sub>.', after: 'Starting from 0 m/s, the final velocity is 12 m/s.',
    }),
    (el, api) => WORK(el, api, {
      q: 'Step 4: find the average velocity over those 3 seconds (from 0 to 12 m/s).',
      eq: 'vavg2', form: 'v<sub>avg</sub> = (v<sub>f</sub> + v<sub>i</sub>) / 2', plug: 'v<sub>avg</sub> = ([[12]] m/s + [[0]] m/s) / [[2]]', lhs: 'v<sub>avg</sub> =', ans: 6, unit: 'm/s', finalLine: 'v<sub>avg</sub> = 6 m/s',
      hint: 'This shortcut only works when the acceleration is constant.',
    }),
    (el, api) => WORK(el, api, {
      q: 'Step 5: how far did it travel in those 3 seconds?',
      eq: 'dxavg', form: 'Δx = v<sub>avg</sub> · t', plug: 'Δx = ([[6]] m/s)([[3]] s)', lhs: 'Δx =', ans: 18, unit: 'm', finalLine: 'Δx = 18 m',
      after: 'Check: 0.5 × 4 m/s² × (3 s)² = 18 m. Same answer.',
    }),
  ],
});

// ---------- unit boss ----------
const BOSS3_GENS = [
  () => { const v0 = pick([0, 2, 4, 5]), vf = pick([10, 12, 16, 20, 24]), t = pick([2, 4, 5]); const a = +((vf - v0) / t).toFixed(2); return { num: { q: `A cyclist speeds up from ${v0} m/s to ${vf} m/s in ${t} s. What is her acceleration?`, ans: a, tol: 0.02, unit: 'm/s²', explain: eqs('a = &Delta;v / t', `a = (${vf} m/s - ${v0} m/s) / ${t} s`, `a = ${a} m/s²`) } }; },
  () => { const m = pick([2, 4, 5, 8]), F = pick([12, 20, 30, 40]), a = +(F / m).toFixed(2); return { num: { q: `A ${m} kg cart has a net force of ${F} N. What is its acceleration?`, ans: a, tol: 0.02, unit: 'm/s²', explain: eqs('a = &Sigma;F / m', `a = ${F} N / ${m} kg`, `a = ${a} m/s²`) } }; },
  () => { const F = pick([30, 40, 50]), f = pick([8, 10, 12]); return { num: { q: `You push a box right with ${F} N. Friction is ${f} N to the left. What is the net force?`, ans: F - f, unit: 'N', explain: eqs('&Sigma;F = F<sub>A</sub> + F<sub>f</sub>', `&Sigma;F = ${F} N + (-${f} N)`, `&Sigma;F = ${F - f} N`) } }; },
  () => { const a = pick([2, 3, 4, 5]), t = pick([3, 4, 5, 6]); return { num: { q: `A go-kart starts from rest and accelerates at ${a} m/s² for ${t} s. What is its final velocity?`, ans: a * t, unit: 'm/s', explain: eqs('&Delta;v = a &middot; t', `&Delta;v = ${a} m/s² &middot; ${t} s`, `v<sub>f</sub> = ${a * t} m/s`) } }; },
  () => { const vi = pick([4, 6, 10]), vf = pick([12, 14, 18]); return { num: { q: `An object speeds up from ${vi} m/s to ${vf} m/s at constant acceleration. What is its average velocity?`, ans: (vi + vf) / 2, unit: 'm/s', explain: eqs('v<sub>avg</sub> = (v<sub>f</sub> + v<sub>i</sub>) / 2', `v<sub>avg</sub> = (${vf} + ${vi}) / 2`, `v<sub>avg</sub> = ${(vi + vf) / 2} m/s`) } }; },
  () => { const v = pick([5, 10, 20]), t = pick([2, 4]); return { num: { q: `A car moves at a constant ${v} m/s for ${t} s. What is its displacement (the area under the v-t graph)?`, ans: v * t, unit: 'm', explain: eqs('&Delta;x = v &middot; t', `&Delta;x = ${v} m/s &middot; ${t} s`, `&Delta;x = ${v * t} m`) } }; },
  () => ({ mcq: { q: 'Doubling the net force on the same cart does what to its acceleration?', opts: [{ t: 'Doubles it', ok: true }, { t: 'Halves it', why: 'Acceleration is directly proportional to net force.' }, { t: 'No change', why: 'a = ΣF / m: more force, more acceleration.' }, { t: 'Quadruples it', why: 'Only the net force doubled, so a doubles.' }], explain: 'a is directly proportional to ΣF.' } }),
  () => ({ mcq: { q: 'Same net force, but double the mass. What happens to acceleration?', opts: [{ t: 'Halves', ok: true }, { t: 'Doubles', why: 'More mass, more inertia. a = ΣF / m.' }, { t: 'No change', why: 'Mass changes the result.' }, { t: 'Becomes zero', why: 'Only zero net force gives zero acceleration.' }], explain: 'a is inversely proportional to m.' } }),
  () => ({ mcq: { q: 'The slope of a velocity-time graph is...', opts: [{ t: 'the acceleration', ok: true }, { t: 'the displacement', why: 'Displacement is the area under the graph.' }, { t: 'the mass', why: 'Mass doesn\'t appear on this graph.' }, { t: 'the velocity', why: 'Velocity is the height of the line.' }], explain: 'Slope = Δv / Δt = a.' } }),
  () => ({ mcq: { q: 'The area under a velocity-time graph is...', opts: [{ t: 'the displacement', ok: true }, { t: 'the acceleration', why: 'Acceleration is the slope.' }, { t: 'the mass', why: 'Mass isn\'t on this graph.' }, { t: 'the velocity', why: 'Velocity is the height of the line.' }], explain: 'Area under v-t = displacement.' } }),
  () => ({ mcq: { q: 'A car drives around a curve at a steady 30 km/h. Is it accelerating?', opts: [{ t: 'Yes, its direction is changing', ok: true }, { t: 'No, its speed is constant', why: 'Acceleration is any change in velocity, and velocity includes direction.' }, { t: 'Only if it brakes', why: 'Turning alone counts.' }, { t: 'Only if it\'s going uphill', why: 'Hills aren\'t needed for acceleration.' }], explain: 'Changing direction = changing velocity = acceleration.' } }),
  () => ({ mcq: { q: 'A 3 N push east and a 4 N push north. What is the resultant?', opts: [{ t: '5 N', ok: true }, { t: '7 N', why: '7 is only for vectors pointing the same way.' }, { t: '1 N', why: '1 is for opposite directions.' }, { t: '12 N', why: 'Multiplying isn\'t adding vectors.' }], explain: 'Pythagoras: √(3² + 4²) = 5 N.' } }),
  () => ({ mcq: { q: 'You\'re slowing down while moving forward. Your acceleration points...', opts: [{ t: 'backward, opposite your velocity', ok: true }, { t: 'forward', why: 'Forward would make you speed up.' }, { t: 'up', why: 'Here acceleration is along the road.' }, { t: 'zero', why: 'Slowing down means velocity is changing.' }], explain: 'Slowing down: a is opposite v.' } }),
  () => ({ mcq: { q: 'Which pair of units gives acceleration?', opts: [{ t: 'N and kg', ok: true }, { t: 'm and s', why: 'Those are distance and time.' }, { t: 'kg and s', why: 'Mass and time don\'t give acceleration.' }, { t: 'N and s', why: 'Time doesn\'t go in the denominator.' }], explain: '1 N = 1 kg·m/s², so N/kg = m/s².' } }),
  () => ({ mcq: { q: 'A v-t line slopes downward but stays above the axis. The object is...', opts: [{ t: 'still moving forward, but slowing down', ok: true }, { t: 'speeding up in reverse', why: 'Above the axis means forward.' }, { t: 'at rest', why: 'At rest is a flat line on the axis.' }, { t: 'at constant velocity', why: 'A sloped line means changing velocity.' }], explain: 'Above the axis = forward. Downward slope = negative acceleration.' } }),
  () => ({ mcq: { q: 'Which is Newton\'s 2nd law?', opts: [{ t: 'a = ΣF / m', ok: true }, { t: 'F<sub>g</sub> = m · g', why: 'That\'s weight.' }, { t: 'Δv = v<sub>f</sub> - v<sub>i</sub>', why: 'That\'s the definition of change in velocity.' }, { t: 'v<sub>avg</sub> = Δx / t', why: 'That\'s average velocity.' }], explain: 'a = ΣF / m: acceleration equals net force over mass.' } }),
  () => ({ mcq: { q: 'You push a box with 20 N and friction is 20 N in the opposite direction. The box...', opts: [{ t: 'moves at constant velocity (or stays at rest)', ok: true }, { t: 'speeds up', why: 'Speeding up needs an unbalanced force.' }, { t: 'slows down', why: 'Slowing down needs more friction than push.' }, { t: 'accelerates backward', why: 'The forces balance, so there is no net force.' }], explain: 'ΣF = 0, so a = 0.' } }),
];
Game.add({
  id: 'boss3', boss: true, section: 'unit3', tag: 'Unit 3 Boss', title: '2nd Law Showdown',
  blurb: '10 random questions from the whole unit. Calculations need the equation, the plug-in, and the units. Three hearts.',
  steps: (store => Array.from({ length: 10 }, (_, k) => bossStep(k, BOSS3_GENS, store)))({}),
});
