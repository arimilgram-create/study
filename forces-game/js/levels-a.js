// Stations for review questions 1–3.

// ---- shared scene art ----
function bananasSVG(cx = 180, cy = 150, s = 1) {
  const one = (dx, rot) => `<path transform="translate(${cx + dx * s} ${cy}) rotate(${rot}) scale(${s})" d="M-6 -28 Q-26 6 -4 30 Q10 34 14 26 Q-6 8 4 -26 Z" fill="#f2c230" stroke="#6b4e00" stroke-width="2"/>`;
  return `<line x1="${cx}" y1="${cy - 46 * s}" x2="${cx}" y2="${cy - 30 * s}" stroke="#6b4e00" stroke-width="4"/>` + one(-16, -18) + one(0, 0) + one(16, 18);
}
function planeSVG(dir = 1, ground = true, speed = false) {
  const st = 'style="fill:var(--card);stroke:var(--ink)" stroke-width="2.5" stroke-linejoin="round"';
  const lines = speed ? [-72, -84].map((x, i) => `<line x1="${x}" y1="${-2 + i * 8}" x2="${x - 22}" y2="${-2 + i * 8}" style="stroke:var(--muted)" stroke-width="2" stroke-linecap="round"/>`).join('') : '';
  const wheels = ground ? `<line x1="-30" y1="10" x2="-30" y2="22" style="stroke:var(--ink)" stroke-width="2.5"/><line x1="30" y1="10" x2="30" y2="22" style="stroke:var(--ink)" stroke-width="2.5"/>
    <circle cx="-30" cy="24" r="5" ${st}/><circle cx="30" cy="24" r="5" ${st}/>` : '';
  return `<g transform="translate(180 150) scale(${dir} 1)">${lines}
    <path d="M-44 -2 L-56 -30 L-44 -30 L-26 -4 Z" ${st}/>
    <path d="M-54 -4 L36 -8 Q56 -6 58 2 Q56 10 36 10 L-50 10 Z" ${st}/>
    <path d="M-6 3 L-24 24 L-10 24 L16 4 Z" ${st}/>
    ${[-20, -8, 4, 16, 28].map(x => `<circle cx="${x}" cy="-1" r="2.6" style="fill:var(--f-n)"/>`).join('')}
    ${wheels}</g>
    ${ground ? '<line x1="104" y1="180" x2="256" y2="180" style="stroke:var(--muted)" stroke-width="3"/>' : ''}`;
}
const allForces = ['Fg', 'FN', 'FA', 'Ff', 'Fair', 'Flift', 'Feng'];

// ---------------- Q1 ----------------
Game.add({
  id: 'q1', tag: 'Review Q1', title: 'Mass or Weight?',
  blurb: 'Speed-sort clues into Mass or Weight. Kilograms, Newtons, scalars, vectors.',
  steps: [
    (el, api) => SORT(el, api, {
      q: 'Sort each clue: is it about <b>mass</b> or <b>weight</b>?',
      bins: ['Mass', 'Weight'],
      cards: [
        { t: 'Measured in kilograms (kg)', bin: 0 },
        { t: 'Measured in Newtons (N)', bin: 1, why: 'Weight is a force, and forces are measured in Newtons.' },
        { t: 'A scalar (no direction)', bin: 0, why: 'Mass is just an amount. It has no direction.' },
        { t: 'A vector (has direction)', bin: 1, why: 'Weight points down, toward the planet.' },
        { t: 'The amount of stuff (matter) in an object', bin: 0 },
        { t: 'The force of gravity acting on an object', bin: 1 },
        { t: 'Changes when you travel to Mars', bin: 1, why: 'Mars has a weaker gravitational field, so F<sub>g</sub> = mg gets smaller. Your stuff does not.' },
        { t: 'Stays the same on the Moon', bin: 0, why: 'You have the same amount of matter anywhere in the universe.' },
        { t: 'F<sub>g</sub> = m &middot; g', bin: 1, why: 'F<sub>g</sub> is the force of gravity: weight.' },
        { t: 'A bunch of bananas: 2 kg', bin: 0 },
        { t: 'A bunch of bananas: -20 N', bin: 1, why: 'Newtons with a sign (direction) = a force = weight.' },
        { t: 'Would be about zero far out in deep space', bin: 1, why: 'Far from any planet there is almost no gravitational field, so almost no weight. Mass is unchanged.' },
      ],
      explain: 'Mass = amount of stuff (scalar, kg). Weight = force of gravity (vector, N). They connect through F<sub>g</sub> = mg.',
    }),
    (el, api) => MCQ(el, api, {
      q: 'Which statement correctly connects mass and weight?',
      opts: [
        { t: 'F<sub>g</sub> = mg, so at the same location, more mass means more weight.', ok: true },
        { t: 'They are the same thing, just measured in different units.', why: 'Nope. Mass is an amount of matter. Weight is a force (a push/pull) caused by gravity.' },
        { t: 'Your weight is the same on every planet.', why: 'Weight depends on g, and g is different on each planet.' },
        { t: 'Mass changes when g changes.', why: 'Mass never depends on g. Only weight does.' },
      ],
      explain: 'Directly related by F<sub>g</sub> = mg. On Earth g = -10 N/kg, so every 1 kg weighs 10 N.',
    }),
    (el, api) => NUM(el, api, {
      q: 'Your backpack has a mass of <b>6 kg</b>. What is its weight on Earth?',
      ctx: 'Use F<sub>g</sub> = m &middot; g with g = -10 N/kg.',
      ans: -60, unit: 'N',
      explain: '<span class="eq">F<sub>g</sub> = m &middot; g</span><span class="eq">F<sub>g</sub> = 6 kg &middot; (-10 N/kg)</span><span class="eq">F<sub>g</sub> = -60 N</span>Negative because gravity points down.',
    }),
    (el, api) => MCQ(el, api, {
      q: 'A 70 kg astronaut flies to the Moon (weaker gravitational field). What happens?',
      opts: [
        { t: 'Mass stays 70 kg. Weight gets smaller.', ok: true },
        { t: 'Mass and weight both get smaller.', why: 'The astronaut didn\'t lose any matter on the trip!' },
        { t: 'Mass gets smaller. Weight stays the same.', why: 'Backwards. Mass is the amount of stuff, which does not change.' },
        { t: 'Nothing changes at all.', why: 'Weight = mg, and the Moon\'s g is much smaller than Earth\'s.' },
      ],
      explain: 'Same stuff, weaker pull. That\'s why astronauts bounce around on the Moon.',
    }),
  ],
});

// ---------------- Q2 ----------------
function forceProbe(el, api) {
  el.append(h('div', { class: 'q' }, 'Force probe lab: play with the bananas and watch the scale graph.'),
    h('p', { class: 'ctx', html: 'Try every button. Your mission: <b>lift at constant velocity</b> for a bit and watch what the scale reads.' }));
  const scene = h('div', { class: 'panel' });
  const graph = h('canvas', { 'aria-label': 'Live graph of scale force versus time' });
  const read = h('div', { class: 'readout' });
  el.append(h('div', { class: 'sim' }, scene, h('div', { class: 'panel' }, graph, read)));
  const modes = { still: 'Hold still', lift: 'Lift at constant velocity', lower: 'Lower at constant velocity', yank: 'Yank up fast!' };
  const btns = {};
  const bar = h('div', { class: 'row' }, Object.entries(modes).map(([k, t]) => btns[k] = h('button', { class: 'btn small', onclick: () => set(k) }, t)));
  const goal = h('div', { class: 'goal' }, 'Goal: lift at constant velocity for 1.5 seconds. (At the top already? Lower them first.)');
  el.append(bar, goal);

  const m = 2; let y = 0.1, v = 0, vt = 0, mode = 'still', yankT = 0, liftT = 0, won = false;
  const hist = []; const W = 340, H = 210;
  const ctx = hiDPI(graph, W, H);
  function set(k) { mode = k; SFX.click(); Object.entries(btns).forEach(([j, b]) => b.classList.toggle('on', j === k)); if (k === 'yank') yankT = 0.35; }
  set('still');
  loop(el, dt => {
    if (mode === 'still') vt = 0; else if (mode === 'lift') vt = 0.25; else if (mode === 'lower') vt = -0.25;
    else { vt = yankT > 0 ? 1.4 : 0; yankT -= dt; if (yankT <= 0 && Math.abs(v) < 0.02) set('still'); }
    if ((y >= 0.6 && vt > 0) || (y <= 0 && vt < 0)) { vt = 0; if (mode !== 'yank') set('still'); }
    const a = clamp((vt - v) / 0.12, -8, 8);
    v += a * dt; y = clamp(y + v * dt, 0, 0.6);
    const Fs = m * (10 + a);
    if (mode === 'lift' && Math.abs(a) < 0.1) liftT += dt;
    if (liftT > 1.5 && !won) { won = true; goal.classList.add('met'); goal.textContent = 'Goal met! The scale read 20 N the whole time it moved up at constant velocity.'; api.right(20, goal); api.done('Constant velocity means balanced forces: F<sub>net</sub> = 0, so the scale still reads <b>20 N</b>, the same as holding still. Only <i>speeding up</i> or <i>slowing down</i> pushes the reading above or below 20 N.'); }
    hist.push(Fs); if (hist.length > 360) hist.shift();
    drawScene(Fs); drawGraph();
    read.innerHTML = `<span class="big">Scale reads: ${Fs.toFixed(1)} N</span><span>F<sub>net</sub> = ${Fs.toFixed(1)} + (-20.0) = ${(Fs - 20).toFixed(1)} N</span><span>${Math.abs(v) < 0.02 ? 'At rest' : Math.abs(a) < 0.1 ? 'Constant velocity ' + (v > 0 ? 'up' : 'down') : a > 0 ? 'Changing speed (net force up)' : 'Changing speed (net force down)'}</span>`;
  });
  function drawScene(Fs) {
    const off = 210 - y * 150, stretch = 26 + (Fs - 20) * 1.2;
    scene.innerHTML = `<svg viewBox="0 0 220 300" role="img" aria-label="Bananas hanging from a spring scale">
      <line x1="110" y1="0" x2="110" y2="${off - 100}" style="stroke:var(--muted)" stroke-width="3"/>
      <rect x="92" y="${off - 100}" width="36" height="70" rx="8" style="fill:var(--card);stroke:var(--ink)" stroke-width="2.5"/>
      <line x1="110" y1="${off - 92}" x2="110" y2="${off - 92 + stretch}" style="stroke:var(--f-s)" stroke-width="5"/>
      <text x="134" y="${off - 60}" style="fill:var(--f-s);font:700 13px var(--mono)">${Fs.toFixed(0)} N</text>
      <line x1="110" y1="${off - 30}" x2="110" y2="${off - 2}" style="stroke:var(--ink)" stroke-width="2.5"/>
      ${bananasSVG(110, off + 36, 0.9)}
      ${arrowSVG(64, off + 30, 64, off + 30 - Fs * 2.6, '--f-s', 'scale', 16, off + 10 - Fs * 1.3, 4)}
      ${arrowSVG(64, off + 40, 64, off + 40 + 52, '--f-g', 'g', 20, off + 80, 4)}
    </svg>`;
  }
  function drawGraph() {
    const ink = css('--ink'), mut = css('--muted'), line = css('--f-s');
    const x0 = 40, y0 = H - 26, yTop = 10, sy = v => y0 - (v / 40) * (y0 - yTop);
    ctx.clearRect(0, 0, W, H); ctx.font = '11px ' + css('--mono');
    ctx.strokeStyle = mut; ctx.fillStyle = mut; ctx.lineWidth = 1;
    [0, 10, 20, 30, 40].forEach(t => { ctx.globalAlpha = t === 20 ? 0.9 : 0.3; ctx.setLineDash(t === 20 ? [5, 4] : []); ctx.beginPath(); ctx.moveTo(x0, sy(t)); ctx.lineTo(W - 6, sy(t)); ctx.stroke(); ctx.globalAlpha = 1; ctx.fillText(t + ' N', 2, sy(t) + 4); });
    ctx.setLineDash([]); ctx.strokeStyle = ink; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x0, yTop); ctx.lineTo(x0, y0); ctx.lineTo(W - 6, y0); ctx.stroke();
    ctx.fillStyle = mut; ctx.fillText('Time (s)', W - 60, H - 8);
    ctx.strokeStyle = line; ctx.lineWidth = 3; ctx.beginPath();
    hist.forEach((f, i) => { const x = x0 + (i / 360) * (W - 6 - x0); i ? ctx.lineTo(x, sy(clamp(f, 0, 40))) : ctx.moveTo(x, sy(clamp(f, 0, 40))); });
    ctx.stroke();
  }
}

const ref20 = '<line x1="24" y1="50" x2="164" y2="50" style="stroke:var(--muted)" stroke-dasharray="3 3"/><text x="21" y="53" text-anchor="end" style="fill:var(--muted);font:9px var(--mono)">20</text>';
Game.add({
  id: 'q2', tag: 'Review Q2', title: 'Banana Scale',
  blurb: 'Hang 2 kg of bananas from a spring scale. Draw the FBD, then run a live force-probe graph.',
  steps: [
    (el, api) => FBD(el, api, {
      ctx: 'A 2 kg bunch of bananas hangs <b>at rest</b> from a spring scale.',
      q: 'Build the free body diagram for the bananas.',
      scene: bananasSVG(), palette: ['Fg', 'FN', 'FA', 'Ff', 'Fs'],
      need: { up: ['Fs', 'FA'], down: ['Fg'], left: [], right: [] },
      hint: 'Hint: nothing touches the bananas except the scale hook.',
      explain: 'The scale pulls up, gravity pulls down. At rest means they are balanced: same size, opposite directions.',
    }),
    (el, api) => NUM(el, api, {
      q: 'Calculate the weight of the 2 kg bananas.', ans: -20, unit: 'N',
      explain: '<span class="eq">F<sub>g</sub> = m &middot; g</span><span class="eq">F<sub>g</sub> = 2 kg &middot; (-10 N/kg)</span><span class="eq">F<sub>g</sub> = -20 N</span>',
    }),
    (el, api) => MCQ(el, api, {
      q: 'The bananas are held at rest. What does the scale read?',
      opts: [
        { t: '20 N', ok: true },
        { t: '0 N, because nothing is moving', why: 'At rest means the <i>net</i> force is 0. The scale still has to pull up to cancel gravity.' },
        { t: '2 kg', why: 'A spring scale measures force (the pull on the hook), so it reads in Newtons.' },
        { t: 'More than 20 N, so it can hold them up', why: 'If it pulled more than 20 N, the net force would be up and the bananas would start moving up.' },
      ],
      explain: 'The scale reads the upward force it applies. At rest:<span class="eq">F<sub>net</sub> = F<sub>s</sub> + F<sub>g</sub></span><span class="eq">0 N = F<sub>s</sub> + (-20 N)</span><span class="eq">20 N = F<sub>scale</sub></span>',
    }),
    forceProbe,
    (el, api) => MCQ(el, api, {
      q: 'Quiz version: which graph shows the scale force while the bananas are lifted upward at a <b>constant velocity</b>?',
      opts: [
        { t: 'Flat line at 20 N', ok: true, svg: graphSVG([{ d: 'M24 50 L164 50', color: '--f-s' }], undefined, undefined, ref20) },
        { t: 'Rising line', why: 'A rising force would mean the bananas keep speeding up more and more.', svg: graphSVG([{ d: 'M24 80 L164 20', color: '--f-s' }], undefined, undefined, ref20) },
        { t: 'Flat line above 20 N', why: 'More than 20 N means a net force up, so the bananas would be speeding up, not constant velocity.', svg: graphSVG([{ d: 'M24 28 L164 28', color: '--f-s' }], undefined, undefined, ref20) },
        { t: 'Flat line near 0 N', why: 'Then gravity would win and the bananas would fall.', svg: graphSVG([{ d: 'M24 86 L164 86', color: '--f-s' }], undefined, undefined, ref20) },
      ],
      explain: 'Constant velocity = balanced forces, so the scale matches gravity: a flat line at 20 N.',
    }),
  ],
});

// ---------------- Q3 ----------------
Game.add({
  id: 'q3', tag: 'Review Q3', title: 'FBD Hangar',
  blurb: 'Three planes: parked, taxiing left, cruising right. Build each free body diagram.',
  steps: [
    (el, api) => FBD(el, api, {
      ctx: 'Plane A is <b>at rest</b> on the runway.', q: 'Build its free body diagram.',
      scene: planeSVG(1, true), palette: allForces,
      need: { up: ['FN'], down: ['Fg'], left: [], right: [] },
      hint: 'Hint: at rest, nothing is pushing it sideways.',
      explain: 'Gravity pulls down, the runway pushes up (normal force). No sideways forces because it is just sitting there.',
    }),
    (el, api) => FBD(el, api, {
      ctx: 'Plane B rolls across the runway at a <b>constant velocity of 10 mph to the left</b>.', q: 'Build its free body diagram.',
      scene: planeSVG(-1, true, true), palette: allForces,
      need: { up: ['FN'], down: ['Fg'], left: ['FA', 'Feng'], right: ['Ff', 'Fair'] },
      hint: 'Hint: constant velocity means balanced. If something resists the motion, something else must push it along.',
      explain: 'Up/down: F<sub>N</sub> balances F<sub>g</sub>. Sideways: the push (F<sub>A</sub>) to the left balances friction to the right. Balanced = constant velocity.',
    }),
    (el, api) => FBD(el, api, {
      ctx: 'Plane C flies through the air at a <b>constant velocity of 300 mph to the right</b>.', q: 'Build its free body diagram.',
      scene: planeSVG(1, false, true), palette: allForces,
      need: { up: ['Flift', 'Fair'], down: ['Fg'], left: ['Fair'], right: ['Feng', 'FA'] },
      hint: 'Hint: no runway up here, so no normal force and no rolling friction. The air does two jobs.',
      explain: 'Air lift up balances gravity. Engine thrust right balances air resistance left. All balanced, so it cruises at constant velocity.',
    }),
    (el, api) => MCQ(el, api, {
      q: 'What is the net force on each of the three planes?',
      opts: [
        { t: '0 N for all three', ok: true },
        { t: 'Biggest for the 300 mph plane', why: 'Speed doesn\'t need force. Only <i>changing</i> velocity does. 300 mph at constant velocity = balanced.' },
        { t: 'Only the parked plane has 0 N', why: 'The moving planes are at constant velocity, so they are balanced too.' },
        { t: 'Pointing in the direction each plane moves', why: 'That\'s the classic misconception! Moving at constant velocity needs zero net force.' },
      ],
      explain: 'At rest or constant velocity means balanced forces, so F<sub>net</sub> = 0. That\'s Newton\'s First Law.',
    }),
  ],
});
