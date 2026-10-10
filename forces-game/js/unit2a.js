// Balanced Forces & Constant Velocity test review, part 1 (Test Q1–Q7, Q10, Q11).

// Small answer-choice graph with the t-axis wherever the sheet puts it. lines use the sheet's own coordinates (0-100 x 0-80).
function sheetGraph(lines, axisY = 42, axisX = 20, yl = 'v') {
  return `<svg viewBox="0 0 100 80" role="img" aria-label="graph"><line x1="${axisX}" y1="0" x2="${axisX}" y2="78" style="stroke:var(--ink)" stroke-width="3"/>
    <line x1="4" y1="${axisY}" x2="97" y2="${axisY}" style="stroke:var(--ink)" stroke-width="3"/>
    <text x="${axisX - 14}" y="14" style="fill:var(--muted);font:italic 11px var(--body)">${yl}</text><text x="88" y="${axisY - 5}" style="fill:var(--muted);font:italic 11px var(--body)">t</text>
    ${lines.map(([a, b, c, d]) => `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" style="stroke:var(--f-a)" stroke-width="3" stroke-linecap="round"/>`).join('')}</svg>`;
}

// Drag the line on an x-t graph and a v-t graph to see how each one shows velocity.
function vectorLab(el, api) {
  el.append(h('div', { class: 'q' }, 'Graph lab: make velocity show up on both kinds of graph.'),
    h('p', { class: 'ctx', html: 'Drag the two dots on the <b>position</b> graph, and drag the line on the <b>velocity</b> graph. Goal: make a <b>negative</b> velocity on each one.' }));
  const XF = frame({ x: [0, 10, 1], y: [-10, 10, 5], yl: 'x - position (m)' }), VF = frame({ x: [0, 10, 1], y: [-6, 6, 2], yl: 'v - velocity (m/s)' });
  const px = h('div', { class: 'panel' }), pv = h('div', { class: 'panel' }), rx = h('div', { class: 'readout' }), rv = h('div', { class: 'readout' });
  const g1 = h('div', { class: 'goal' }, 'Make the position graph show a negative velocity.'), g2 = h('div', { class: 'goal' }, 'Make the velocity graph show a negative velocity.');
  el.append(h('div', { class: 'sim' }, h('div', { style: 'display:flex;flex-direction:column;gap:8px;min-width:0' }, px, rx, g1), h('div', { style: 'display:flex;flex-direction:column;gap:8px;min-width:0' }, pv, rv, g2)));
  let A = [1, -4], B = [8, 6], v = 3, drag = null, ok1 = false, ok2 = false;
  px.innerHTML = `<svg viewBox="0 0 ${XF.W} ${XF.H}" class="plot" style="touch-action:none">${XF.s}<line class="ln" style="stroke:var(--f-a)" stroke-width="4"/><circle class="ha" r="9" style="fill:var(--f-a);stroke:var(--card);cursor:grab" stroke-width="3"/><circle class="hb" r="9" style="fill:var(--f-a);stroke:var(--card);cursor:grab" stroke-width="3"/></svg>`;
  pv.innerHTML = `<svg viewBox="0 0 ${VF.W} ${VF.H}" class="plot" style="touch-action:none;cursor:ns-resize">${VF.s}<line class="ln" style="stroke:var(--f-n)" stroke-width="5"/><rect class="hit" x="${VF.L}" y="${VF.T}" width="${VF.W - VF.L - VF.R}" height="${VF.H - VF.T - VF.B}" fill="transparent"/></svg>`;
  const sx = px.firstChild, sv = pv.firstChild;
  const data = (svg, F, e) => { const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse()); return F.inv(p.x, p.y); };
  sx.addEventListener('pointerdown', e => { if (e.target.classList.contains('ha')) drag = 'a'; else if (e.target.classList.contains('hb')) drag = 'b'; if (drag) sx.setPointerCapture(e.pointerId); });
  sx.addEventListener('pointermove', e => {
    if (!drag) return; let [t, x] = data(sx, XF, e); t = clamp(Math.round(t), 0, 10); x = clamp(Math.round(x), -10, 10);
    if (drag === 'a') A = [Math.min(t, B[0] - 1), x]; else B = [Math.max(t, A[0] + 1), x]; draw();
  });
  sx.addEventListener('pointerup', () => drag = null);
  let dv = false;
  sv.addEventListener('pointerdown', e => { dv = true; sv.setPointerCapture(e.pointerId); move(e); });
  sv.addEventListener('pointermove', e => dv && move(e)); sv.addEventListener('pointerup', () => dv = false);
  function move(e) { v = clamp(Math.round(data(sv, VF, e)[1] * 2) / 2, -6, 6); draw(); }
  function draw() {
    const l = sx.querySelector('.ln'); l.setAttribute('x1', XF.X(A[0])); l.setAttribute('y1', XF.Y(A[1])); l.setAttribute('x2', XF.X(B[0])); l.setAttribute('y2', XF.Y(B[1]));
    sx.querySelector('.ha').setAttribute('cx', XF.X(A[0])); sx.querySelector('.ha').setAttribute('cy', XF.Y(A[1]));
    sx.querySelector('.hb').setAttribute('cx', XF.X(B[0])); sx.querySelector('.hb').setAttribute('cy', XF.Y(B[1]));
    const m = (B[1] - A[1]) / (B[0] - A[0]);
    rx.innerHTML = `<span>v = slope = &Delta;x / &Delta;t = (${B[1]} - (${A[1]})) m / (${B[0]} - ${A[0]}) s</span><span class="big">v = ${fmt(m)} m/s</span><span>Magnitude: ${fmt(Math.abs(m))} m/s (how steep). Direction: ${m > 0 ? '+ (uphill line)' : m < 0 ? '- (downhill line)' : 'none, it\'s at rest (flat line)'}</span>`;
    const ln = sv.querySelector('.ln'); ln.setAttribute('x1', VF.X(0)); ln.setAttribute('x2', VF.X(10)); ln.setAttribute('y1', VF.Y(v)); ln.setAttribute('y2', VF.Y(v));
    rv.innerHTML = `<span class="big">v = ${fmt(v)} m/s</span><span>Magnitude: ${fmt(Math.abs(v))} m/s (distance from the t-axis). Direction: ${v > 0 ? '+ (above the axis)' : v < 0 ? '- (below the axis)' : 'none (on the axis = at rest)'}</span>`;
    if (m < 0 && !ok1) { ok1 = true; g1.classList.add('met'); g1.textContent = 'Got it: a downhill position graph = negative velocity.'; SFX.good(); }
    if (v < 0 && !ok2) { ok2 = true; g2.classList.add('met'); g2.textContent = 'Got it: below the t-axis = negative velocity.'; SFX.good(); }
    if (ok1 && ok2 && !el.querySelector('.next-row')) { api.right(15, rv); api.done('Position graph: velocity is the <b>slope</b> (steepness = magnitude, uphill/downhill = direction). Velocity graph: velocity is the <b>value</b> (distance from the axis = magnitude, above/below = direction).'); }
  }
  draw();
}

Game.add({
  id: 'v1', section: 'unit2', tag: 'Test Q1', title: 'Velocity Is a Vector',
  blurb: 'Magnitude and direction on position and velocity graphs. Drag the graphs, then write your own problem.',
  steps: [
    (el, api) => MCQ(el, api, {
      q: 'Velocity has both magnitude and direction. Does that make it a vector or a scalar?',
      opts: [
        { t: 'A vector', ok: true },
        { t: 'A scalar', why: 'Scalars only have a size (like speed or mass). Velocity also has a direction.' },
        { t: 'Both', why: 'It\'s one or the other. Having a direction makes it a vector.' },
        { t: 'Neither, it\'s a force', why: 'Velocity isn\'t a force. It\'s how fast and which way something moves.' },
      ],
      explain: 'Vector = magnitude + direction. Speed is the scalar version of velocity (no direction).',
    }),
    vectorLab,
    (el, api) => MCQ(el, api, {
      q: 'How do you find velocity\'s magnitude and direction from a <b>position-time</b> graph?',
      opts: [
        { t: 'Magnitude = how steep the slope is (&Delta;x/&Delta;t). Direction = the sign of the slope (uphill +, downhill -).', ok: true },
        { t: 'Magnitude = how high the line is. Direction = above or below the axis.', why: 'That\'s how you read a <i>velocity</i> graph. On a position graph, height is position, not velocity.' },
        { t: 'Magnitude = the area under the line.', why: 'Area isn\'t velocity on a position graph. Use the slope.' },
        { t: 'Read the last point on the graph.', why: 'The last point is just where it ended up (position).' },
      ],
      explain: 'On an x-t graph, velocity = slope = &Delta;x / &Delta;t. Steeper = faster; downhill = negative direction.',
    }),
    (el, api) => MCQ(el, api, {
      q: 'How do you find velocity\'s magnitude and direction from a <b>velocity-time</b> graph?',
      opts: [
        { t: 'Magnitude = how far the line is from the t-axis. Direction = above the axis (+) or below (-).', ok: true },
        { t: 'Magnitude = the slope of the line.', why: 'On a v-t graph the slope tells how velocity is changing, not the velocity itself.' },
        { t: 'You can\'t get direction from a velocity graph.', why: 'You can: above the axis is +, below is -.' },
        { t: 'Direction = whether the line goes up or down.', why: 'A line going down but still above the axis is still a + velocity, just getting smaller.' },
      ],
      explain: 'Read the value straight off the graph: its size is the magnitude, its sign is the direction.',
    }),
    (el, api) => { const d = pick([[24, 6], [30, 5], [18, 3], [45, 9]]); return WORK(el, api, {
      ctx: 'Test Q1d asks you to make up a velocity word problem. Here\'s one, solved the way the test wants it.',
      q: `A skateboarder rolls <b>${d[0]} m to the left</b> in ${d[1]} s. What is her velocity?`,
      eq: 'vavg', form: 'v<sub>avg</sub> = &Delta;x / t', plug: `v<sub>avg</sub> = [[${-d[0]}]] m / [[${d[1]}]] s`, ans: -d[0] / d[1], unit: 'm/s',
      signMsg: 'Right size! But she went LEFT, so &Delta;x is negative and so is v.',
      after: `Direction showed up as the minus sign on &Delta;x (left = -). That made the velocity -${d[0] / d[1]} m/s: ${d[0] / d[1]} m/s to the left.`,
    }); },
  ],
});

// ---------------- Test Q2: Tom the cat ----------------
function catLift(el, api) {
  el.append(h('div', { class: 'q' }, 'Cat lab: hold Tom still, then lift him at a constant velocity.'), h('p', { class: 'ctx' }, 'Watch the applied force (F_A) each time.'));
  const scene = h('div', { class: 'panel' }), read = h('div', { class: 'readout' });
  const M = { rest: ['Hold at rest', 0], v2: ['Lift at constant 2 m/s', 2], v5: ['Lift at constant 5 m/s', 5] }; const b = {};
  el.append(h('div', { class: 'sim' }, scene, h('div', { style: 'display:flex;flex-direction:column;gap:10px;min-width:0' }, h('div', { class: 'row' }, Object.entries(M).map(([k, m]) => b[k] = h('button', { class: 'btn small', onclick: () => set(k) }, m[0]))), read)));
  let mode = 'rest', y = 0, tried = new Set(['rest']);
  function set(k) { mode = k; tried.add(k); SFX.click(); if (y > 120) y = 0; Object.entries(b).forEach(([j, x]) => x.classList.toggle('on', j === k)); }
  set('rest');
  loop(el, dt => {
    y += M[mode][1] * 18 * dt; if (y > 130) y = 0;
    const cy = 200 - y;
    scene.innerHTML = `<svg viewBox="0 0 300 260" role="img" aria-label="Tom the cat being lifted"><line x1="0" y1="250" x2="300" y2="250" style="stroke:var(--muted)" stroke-width="3"/>
      <g transform="translate(120 ${cy})"><ellipse cx="0" cy="12" rx="26" ry="18" fill="#f08c00" stroke="#1b1f27" stroke-width="2.5"/><circle cx="0" cy="-14" r="16" fill="#f08c00" stroke="#1b1f27" stroke-width="2.5"/>
      <path d="M-13 -24 L-9 -38 L-2 -28 M13 -24 L9 -38 L2 -28" fill="#f08c00" stroke="#1b1f27" stroke-width="2.5"/><circle cx="-6" cy="-15" r="2.4" fill="#1b1f27"/><circle cx="6" cy="-15" r="2.4" fill="#1b1f27"/>
      <path d="M24 18 Q44 8 36 -8" fill="none" stroke="#1b1f27" stroke-width="3"/></g>
      ${arrowSVG(210, cy, 210, cy - 54, '--f-a', 'A', 218, cy - 40)}${arrowSVG(210, cy + 10, 210, cy + 64, '--f-g', 'g', 218, cy + 60)}</svg>`;
    read.innerHTML = `<span>F<sub>g</sub> = 4.5 kg &middot; (-10 N/kg) = -45 N</span><span class="big">F<sub>A</sub> = 45 N</span><span>&Sigma;F = 45 N + (-45 N) = 0 N</span><span>${M[mode][1] ? `Moving up at a constant ${M[mode][1]} m/s` : 'At rest'}</span>`;
    if (tried.size >= 2 && !el.querySelector('.next-row')) { api.right(10, read); api.done('Same 45 N whether he\'s at rest or rising at a constant velocity. Constant velocity = balanced, no matter how fast.'); }
  });
}
Game.add({
  id: 'v2', section: 'unit2', tag: 'Test Q2', title: 'Tom the Cat',
  blurb: 'A 4.5 kg cat: his weight, lifting him at constant velocity, and a trip to Pluto.',
  steps: [
    (el, api) => WORK(el, api, { q: 'Tom is a 4.5 kg cat. Calculate his weight on Earth.', eq: 'Fg', plug: 'F<sub>g</sub> = [[4.5]] kg &middot; ([[-10]] N/kg)', ans: -45, unit: 'N', finalLine: 'F<sub>g</sub> = -45 N' }),
    catLift,
    (el, api) => MCQ(el, api, {
      q: 'Compared to holding Tom at rest, how much <b>more</b> applied force does it take to lift him at a constant velocity of 2 m/s?',
      opts: [
        { t: '0 N more. Both take 45 N.', ok: true },
        { t: '20 N more', why: 'Velocity doesn\'t add force. Constant velocity means balanced forces, same as at rest.' },
        { t: '45 N more (90 N total)', why: '90 N up vs 45 N down would make him speed up, not move at a constant velocity.' },
        { t: 'Just a tiny bit more, like 46 N', why: 'Only to <i>start</i> him moving. Once he\'s at a constant 2 m/s, it\'s exactly 45 N.' },
      ],
      explain: 'At rest and at constant velocity, &Sigma;F = 0, so F<sub>A</sub> = 45 N both times.',
    }),
    (el, api) => MCQ(el, api, {
      ctx: 'I took Tom the cat to Pluto, where g = -0.63 N/kg.', q: 'What is Tom\'s change in mass?',
      opts: [
        { t: '0 kg. He\'s still 4.5 kg.', ok: true },
        { t: 'He loses about 4.2 kg', why: 'Mass is the amount of cat. That doesn\'t change by moving him.' },
        { t: 'He gains mass', why: 'Mass doesn\'t depend on location.' },
        { t: 'His mass becomes 0.63 kg', why: '0.63 is Pluto\'s gravitational field, in N/kg.' },
      ],
      explain: 'Change in mass = 0 kg. Only his weight changes.',
    }),
    (el, api) => WORK(el, api, { q: 'Calculate Tom\'s weight on Pluto (g = -0.63 N/kg).', eq: 'Fg', plug: 'F<sub>g</sub> = [[4.5]] kg &middot; ([[-0.63]] N/kg)', ans: -2.835, tol: 0.01, unit: 'N', finalLine: 'F<sub>g</sub> = -2.835 N' }),
    (el, api) => WORK(el, api, {
      q: 'Now calculate Tom\'s <b>change in weight</b> from Earth (-45 N) to Pluto (-2.835 N).',
      eq: 'dFg', form: '&Delta;F<sub>g</sub> = F<sub>g,Pluto</sub> - F<sub>g,Earth</sub>', plug: '&Delta;F<sub>g</sub> = [[-2.835]] N - ([[-45]] N)', ans: 42.165, tol: 0.01, unit: 'N', absOk: true,
      finalLine: '&Delta;F<sub>g</sub> = 42.165 N', after: 'Positive because his weight got <i>less negative</i>: its size dropped by 42.165 N, from 45 N to 2.835 N.',
    }),
  ],
});

// ---------------- Test Q3, Q4, Q6: graph detective ----------------
Game.add({
  id: 'v3', section: 'unit2', tag: 'Test Q3 Q4 Q6', title: 'Graph Detective',
  blurb: 'Pick the right graphs, then help Victoria see that balanced forces can still mean motion.',
  steps: [
    (el, api) => MCQ(el, api, {
      q: 'Which velocity graph shows a <b>negative</b> velocity that is <b>changing in magnitude</b>?', keepOrder: true,
      opts: [
        { t: 'a.', svg: sheetGraph([[20, 29, 94, 29]]), why: 'Above the axis = positive. And flat = not changing.' },
        { t: 'b.', svg: sheetGraph([[20, 58, 94, 58]]), why: 'Negative, but flat: the magnitude stays the same.' },
        { t: 'c.', svg: sheetGraph([[19, 49, 96, 74]]), ok: true },
        { t: 'd.', svg: sheetGraph([[22, 36, 92, 14]]), why: 'Changing, but above the axis, so positive.' },
      ],
      explain: 'Graph c is below the axis (negative) and keeps getting farther from it (magnitude increasing).',
    }),
    (el, api) => MCQ(el, api, {
      q: 'Which position graph shows a <b>constant positive</b> velocity?', keepOrder: true,
      opts: [
        { t: 'a.', svg: sheetGraph([[18, 46, 92, 29]], 69, 16, 'x'), ok: true },
        { t: 'b.', svg: sheetGraph([[16, 20, 74, 63]], 69, 16, 'x'), why: 'Downhill slope = negative velocity.' },
        { t: 'c.', svg: sheetGraph([[16, 36, 90, 36]], 69, 16, 'x'), why: 'Flat position line = not moving (v = 0).' },
        { t: 'd.', svg: sheetGraph([[16, 70, 90, 70]], 39, 16, 'x'), why: 'Flat again: at rest, just at a negative position.' },
      ],
      explain: 'Straight uphill line on an x-t graph = constant positive velocity.',
    }),
    (el, api) => MCQ(el, api, {
      ctx: 'Victoria looks at this cart\'s free body diagram (only F<sub>N</sub> up and F<sub>g</sub> down, equal size) and says its position graph <b>must</b> be a flat line, at rest.',
      media: `<div style="max-width:220px">${miniFBD({ up: ['FN', 46], down: ['Fg', 46] })}</div>`,
      q: 'Could the cart be moving instead?',
      opts: [
        { t: 'Yes. Balanced forces mean constant velocity, and that includes cruising at a steady speed.', ok: true },
        { t: 'No. With no forward force, it can\'t be moving.', why: 'That\'s the old misconception! Moving objects don\'t need a forward force to keep moving (inertia).' },
        { t: 'Only if it\'s slowing down.', why: 'Slowing down needs an unbalanced force. These forces are balanced.' },
        { t: 'Only if it\'s speeding up.', why: 'Speeding up needs an unbalanced force too.' },
      ],
      explain: 'Balanced forces = no change in velocity. It could be at rest, or rolling at a constant velocity (like on a frictionless track).',
    }),
    (el, api) => GRAPHDRAW(el, api, {
      q: 'Draw a position graph that also works for Victoria\'s cart, but is <b>not</b> at rest.', mode: 'anyLine',
      x: [0, 10, 1], y: [0, 10, 1], yl: 'x - position (m)', tip: 'Tap two or more points to draw your line.',
      hint: 'Constant velocity means one straight line that is not flat.',
      explain: 'Any straight, sloped line works. It means constant velocity, which balanced forces allow. Victoria\'s flat line works too: it\'s just the v = 0 case.',
    }),
    (el, api) => MCQ(el, api, {
      q: 'What do the <b>velocity</b> graphs look like for Victoria\'s motion (at rest) and yours (constant velocity)?',
      opts: [
        { t: 'Hers: flat ON the t-axis (v = 0). Yours: flat line above or below the axis.', ok: true, svg: sheetGraph([[20, 42, 94, 42], [20, 24, 94, 24]]) },
        { t: 'Both are sloped lines.', why: 'Sloped v-t lines mean changing velocity. Both of these motions have constant velocity.', svg: sheetGraph([[20, 60, 94, 20], [20, 42, 94, 10]]) },
        { t: 'Hers flat at 0. Yours slopes upward.', why: 'Yours has constant velocity, so its v-t line is flat too.', svg: sheetGraph([[20, 42, 94, 42], [20, 60, 94, 12]]) },
        { t: 'They look the same as the position graphs.', why: 'A sloped x-t line becomes a flat v-t line.', svg: sheetGraph([[20, 30, 94, 30], [20, 70, 94, 20]]) },
      ],
      explain: 'Constant velocity on a v-t graph is always a flat line. At rest = flat line on the axis.',
    }),
  ],
});

// ---------------- Test Q5: Jayla's boat ----------------
const boatFBD = v => ({ up: ['FN', 36], down: ['Fg', 36], right: ['Feng', 44], left: ['Ff', 44] });
Game.add({
  id: 'v4', section: 'unit2', tag: 'Test Q5', title: 'Jayla\'s Boat',
  blurb: 'A boat crosses a 600 m lake at a constant 15 m/s. FBD, time, both graphs, and the slow trip back.',
  steps: [
    (el, api) => MCQ(el, api, {
      q: 'Jayla drives her boat at a constant 15 m/s across the lake. Which FBD best describes the forces on her boat?', keepOrder: true,
      opts: [
        { t: 'a. Engine arrow longer than friction', svg: miniFBD({ up: ['FN', 42], down: ['Fg', 42], right: ['Feng', 58], left: ['Ff', 30] }), why: 'A longer engine arrow means unbalanced forces: the boat would speed up.' },
        { t: 'b. Engine only', svg: miniFBD({ right: ['Feng', 52] }), why: 'Missing gravity, the water pushing up, and friction from the water.' },
        { t: 'c. No friction', svg: miniFBD({ up: ['FN', 42], down: ['Fg', 42], right: ['Feng', 52] }), why: 'The water resists the boat. With no friction the engine would keep speeding it up.' },
        { t: 'd. All four balanced', svg: miniFBD({ up: ['FN', 42], down: ['Fg', 42], right: ['Feng', 50], left: ['Ff', 50] }), ok: true },
      ],
      explain: 'Constant 15 m/s = balanced. Engine forward equals friction backward; the water\'s push up equals gravity.',
    }),
    (el, api) => motionPlayer(el, api, {
      q: 'Watch the trip across the 600 m lake and both graphs being drawn.',
      segs: [[0, 40, 15]], x0: 0, track: [0, 600], icon: 'boat', fbd: boatFBD,
      xg: { x: [0, 40, 5], y: [0, 600, 100], yl: 'x - position (m)' }, vg: { x: [0, 40, 5], y: [0, 20, 5], yl: 'v - velocity (m/s)' },
      note: 'Constant velocity: a straight sloped line on the position graph, a flat line on the velocity graph.',
    }),
    (el, api) => WORK(el, api, {
      q: 'Calculate how long it takes her to drive across the 600 m wide lake at 15 m/s.',
      eq: 'vavg', form: 'v<sub>avg</sub> = &Delta;x / t', plug: '[[15]] m/s = [[600]] m / t', lhs: 't =', ans: 40, unit: 's', finalLine: 't = 40 s',
      after: 'Rearranged: t = &Delta;x / v = 600 m / 15 m/s = 40 s.',
    }),
    (el, api) => GRAPHDRAW(el, api, {
      q: 'Draw the <b>position-time</b> graph for her trip across.', x: [0, 50, 5], y: [0, 700, 100], snap: [5, 50], yl: 'x - position (m)',
      pts: [[0, 0], [40, 600]], hint: 'Where is she at t = 0? Where is she when she arrives?',
      explain: 'A straight line from (0 s, 0 m) to (40 s, 600 m). Slope = 600 m / 40 s = 15 m/s.',
    }),
    (el, api) => GRAPHDRAW(el, api, {
      q: 'Now draw the <b>velocity-time</b> graph for the same trip.', x: [0, 50, 5], y: [0, 20, 5], snap: [5, 2.5], yl: 'v - velocity (m/s)',
      pts: [[0, 15], [40, 15]], hint: 'Her velocity is the same the whole time she crosses.',
      explain: 'A flat line at 15 m/s from 0 to 40 s.',
    }),
    (el, api) => MCQ(el, api, {
      q: 'On the way back she travels <b>1/4 as fast</b>. How does the return time proportionally compare to the first trip?',
      opts: [
        { t: '4 times as long (160 s)', ok: true },
        { t: '1/4 as long (10 s)', why: 'Slower means MORE time, not less.' },
        { t: 'The same time', why: 'Same distance at a lower speed takes longer.' },
        { t: '2 times as long', why: 'Speed and time are inversely proportional: 1/4 the speed means 4x the time.' },
      ],
      explain: 'Same distance: time is inversely proportional to speed. 1/4 the speed = 4x the time.<span class="eq">t = 600 m / 3.75 m/s = 160 s</span>',
    }),
  ],
});

// ---------------- Test Q7, Q10, Q11: race day ----------------
function raceSim(el, api) {
  el.append(h('div', { class: 'q' }, '600 m race: CeeCee runs 1.25 times faster than Molly.'), h('p', { class: 'ctx' }, 'Molly runs 6 m/s. CeeCee runs 1.25 x 6 = 7.5 m/s. Start the race and compare their times.'));
  const scene = h('div', { class: 'panel' }), read = h('div', { class: 'readout' });
  const go = h('button', { class: 'btn primary', onclick: () => { t = 0; running = true; fin = {}; } }, 'Start race');
  el.append(scene, h('div', { class: 'row' }, go), read);
  const R = [['CeeCee', 7.5, '--f-f'], ['Molly', 6, '--f-n']]; let t = 0, running = false, fin = {};
  loop(el, dt => {
    if (running) { t += dt * 12; R.forEach(([n, v]) => { if (!fin[n] && v * t >= 600) { fin[n] = 600 / v; SFX.click(); } }); if (fin.Molly) running = false; }
    scene.innerHTML = `<svg viewBox="0 0 400 120" role="img" aria-label="race">${R.map(([n, v, c], i) => {
      const x = 30 + Math.min(600, v * t) / 600 * 330, y = 34 + i * 46;
      return `<line x1="30" y1="${y + 14}" x2="360" y2="${y + 14}" style="stroke:var(--line)" stroke-width="2"/><circle cx="${x}" cy="${y}" r="10" style="fill:var(${c});stroke:var(--ink)" stroke-width="2"/><text x="${x}" y="${y - 15}" text-anchor="middle" style="fill:var(--ink);font:700 11px var(--body)">${n}</text>`;
    }).join('')}<line x1="360" y1="10" x2="360" y2="112" style="stroke:var(--ink)" stroke-width="3" stroke-dasharray="6 4"/><text x="364" y="20" style="fill:var(--muted);font:10px var(--mono)">600 m</text></svg>`;
    read.innerHTML = `<span class="big">Clock: ${Math.min(t, 100).toFixed(1)} s</span>${R.map(([n, v]) => `<span>${n} (${v} m/s): ${fin[n] ? `finished in ${fin[n]} s` : 'running...'}</span>`).join('')}${fin.Molly ? '<span>CeeCee\'s time / Molly\'s time = 80 / 100 = 0.8</span>' : ''}`;
    if (fin.Molly && !el.querySelector('.next-row')) { api.right(10, read); api.done('1.25x the speed gives 1/1.25 = 0.8 of the time. Molly takes 1.25 times as long as CeeCee.'); }
  });
}
Game.add({
  id: 'v5', section: 'unit2', tag: 'Test Q7 Q10 Q11', title: 'Race Day',
  blurb: 'CeeCee vs. Molly, Sally\'s trip to the store, and a space shuttle to the Moon.',
  steps: [
    raceSim,
    (el, api) => MCQ(el, api, {
      q: 'CeeCee runs 1.25 times faster than Molly in the 600 m race. How do their finishing times compare?',
      opts: [
        { t: 'CeeCee\'s time is 1/1.25 = 0.8 of Molly\'s. (Molly takes 1.25x as long.)', ok: true },
        { t: 'CeeCee\'s time is 1.25x Molly\'s.', why: 'Faster runner = shorter time. You flipped it.' },
        { t: 'They finish at the same time.', why: 'Same distance, different speeds, different times.' },
        { t: 'CeeCee finishes 1.25 seconds sooner.', why: 'It\'s a ratio, not a fixed number of seconds.' },
      ],
      explain: 'Same distance: time is inversely proportional to speed. t<sub>CeeCee</sub> = t<sub>Molly</sub> / 1.25 = 0.8 t<sub>Molly</sub>.',
    }),
    (el, api) => MCQ(el, api, {
      q: 'Sally runs to the store, then walks back home. The trip to the store takes 1/5 the time of the walk home. Compare the magnitudes of her velocities.',
      opts: [
        { t: 'Her running velocity is 5 times her walking velocity.', ok: true },
        { t: 'Her running velocity is 1/5 of her walking velocity.', why: 'Less time over the same distance means FASTER.' },
        { t: 'They\'re the same.', why: 'Same distance, but different times means different speeds.' },
        { t: '25 times bigger.', why: 'It\'s directly the inverse of the time ratio: 5x.' },
      ],
      explain: 'Same distance, 1/5 the time = 5x the speed. (The directions are opposite, so the velocities have opposite signs.)',
    }),
    (el, api) => WORK(el, api, {
      q: 'Enid drives the space shuttle at 7000 m/s. How long will it take her to get to the Moon, 384,000,000 m away?',
      eq: 'vavg', form: 'v<sub>avg</sub> = &Delta;x / t', plug: '[[7000]] m/s = [[384000000]] m / t', lhs: 't =', ans: 54857.14, tol: 1, unit: 's',
      finalLine: 't = 54,857 s', hint: 'Rearrange: t = &Delta;x / v. Then divide.',
      after: 'That\'s about 15.2 hours (54,857 s / 3600 s per hour).',
    }),
  ],
});
