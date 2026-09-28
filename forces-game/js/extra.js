// Extra Practice stations (extra review sheet): Mr. C's desk, the Mars platypus, Magnus's barbell.

// ---------------- X1: Mr. C's desk ----------------
function deskSVG(x = 180, y = 150, ground = true) {
  const st = 'style="fill:var(--card);stroke:var(--ink)" stroke-width="2.5"';
  return `<g transform="translate(${x} ${y})"><rect x="-50" y="-28" width="100" height="10" rx="2" ${st}/>
    <rect x="-44" y="-18" width="8" height="46" ${st}/><rect x="36" y="-18" width="8" height="46" ${st}/>
    <rect x="2" y="-18" width="34" height="22" ${st}/><line x1="13" y1="-7" x2="25" y2="-7" style="stroke:var(--ink)" stroke-width="2.5"/></g>
    ${ground ? `<line x1="100" y1="${y + 29}" x2="260" y2="${y + 29}" style="stroke:var(--muted)" stroke-width="3"/>` : ''}`;
}
function pusherSVG(x, tall, handX) {
  const s = tall ? 1.35 : 1.1, g = 178, hip = [x, g - 30 * s], sh = [x + 14 * s, g - 58 * s], hd = [x + 22 * s, g - 72 * s];
  return `<g style="stroke:var(--ink)" stroke-width="3" stroke-linecap="round" fill="none">
    <circle cx="${hd[0]}" cy="${hd[1]}" r="${9 * s}" style="fill:var(--card)"/>
    <line x1="${hip[0]}" y1="${hip[1]}" x2="${sh[0]}" y2="${sh[1]}"/><line x1="${hip[0]}" y1="${hip[1]}" x2="${x - 16 * s}" y2="${g}"/><line x1="${hip[0]}" y1="${hip[1]}" x2="${x + 6 * s}" y2="${g}"/>
    <line x1="${sh[0]}" y1="${sh[1]}" x2="${handX}" y2="130"/><line x1="${sh[0]}" y1="${sh[1]}" x2="${handX}" y2="138"/></g>`;
}
function miniFBD(f) { // f: {up:[forceKey, length], ...}
  const D = { up: [0, -1, 6, 10], down: [0, 1, 6, 0], left: [-1, 0, 0, -8], right: [1, 0, -22, -8] };
  let s = '<svg viewBox="0 0 220 160" role="img" aria-label="free body diagram"><rect x="92" y="66" width="36" height="24" rx="3" style="fill:var(--card);stroke:var(--ink)" stroke-width="2"/>';
  for (const k in f) {
    const [key, len] = f[k], [dx, dy, ox, oy] = D[k], x1 = 110 + dx * 18, y1 = 78 + dy * 12, x2 = x1 + dx * len, y2 = y1 + dy * len;
    s += arrowSVG(x1, y1, x2, y2, FORCES[key].c, FORCES[key].sub, x2 + ox, y2 + oy, 4);
  }
  return s + '</svg>';
}
function deskSim(el, api) {
  el.append(h('div', { class: 'q' }, 'Desk-shoving lab: pick who pushes and set the push force.'),
    h('p', { class: 'ctx' }, 'Watch the friction arrow. Complete both goals.'));
  const WHO = { c: { name: 'Mr. C', max: 350, tall: false }, s: { name: 'Mr. Smalley', max: 600, tall: true } };
  const scene = h('div', { class: 'panel' }), read = h('div', { class: 'readout' });
  const slider = h('input', { type: 'range', min: 0, max: 350, step: 10, value: 200, id: 'pushSlider' });
  const lab = h('label', { for: 'pushSlider', class: 'hint' });
  const wb = {};
  const g1 = h('div', { class: 'goal' }, 'Goal 1: Mr. C pushes as hard as he can (350 N) for a second.');
  const g2 = h('div', { class: 'goal' }, 'Goal 2: Mr. Smalley gets the desk moving, then pushes it at constant velocity with exactly 400 N for 2 seconds.');
  el.append(h('div', { class: 'sim' }, scene, h('div', { style: 'display:flex;flex-direction:column;gap:10px;min-width:0' },
    h('div', { class: 'row' }, Object.entries(WHO).map(([k, w]) => wb[k] = h('button', { class: 'btn small', onclick: () => pickWho(k) }, w.name))), lab, slider, read)), g1, g2);
  let cur = 'c', v = 0, off = 0, restT = 0, cruiseT = 0, ok1 = false, ok2 = false, msg = '';
  function pickWho(k) {
    cur = k; SFX.click(); slider.max = WHO[k].max; if (+slider.value > WHO[k].max) slider.value = WHO[k].max;
    Object.entries(wb).forEach(([j, b]) => b.classList.toggle('on', j === k));
  }
  pickWho('c');
  loop(el, dt => {
    const P = +slider.value; let Ff, net;
    lab.textContent = `${WHO[cur].name} pushes with ${P} N (max ${WHO[cur].max} N)`;
    if (v <= 0) { v = 0; if (P > 420) { Ff = -400; net = P - 400; } else { Ff = -P; net = 0; } }
    else { Ff = -400; net = P - 400; }
    v = Math.max(0, v + net / 60 * dt);
    if (v > 2.6) { v = 0; msg = 'Whoa! Way too fast. The desk smashed into the wall. Once it moves, ease off.'; SFX.boom(); }
    off = (off + v * 50 * dt) % 30;
    if (cur === 'c' && P === 350 && v === 0) restT += dt; else restT = 0;
    if (cur === 's' && v > 0 && P === 400) cruiseT += dt; else cruiseT = 0;
    if (restT > 1 && !ok1) { ok1 = true; g1.classList.add('met'); g1.textContent = 'Goal 1 met: at 350 N the desk stays put. Friction matches him: -350 N.'; api.right(10, g1); }
    if (cruiseT > 2 && !ok2) { ok2 = true; g2.classList.add('met'); g2.textContent = 'Goal 2 met: 400 N push vs. 400 N friction = balanced = constant velocity.'; api.right(15, g2); }
    if (ok1 && ok2 && !el.querySelector('.next-row')) api.done('Stuck or sliding at constant velocity, the push and friction are <b>balanced</b>. Notice it took a bigger shove to <i>start</i> it, but only 400 N to <i>keep</i> it moving.');
    const stuck = v === 0 && cur === 's' && P > 350 ? 'Still stuck! Getting it started takes more than 420 N.' : '';
    const state = v === 0 ? 'at rest' : Math.abs(net) < 1 ? 'constant velocity' : net > 0 ? 'speeding up' : 'slowing down';
    const k = 0.1, dx = 250;
    scene.innerHTML = `<svg viewBox="0 0 420 220" role="img" aria-label="Desk being pushed">
      <line x1="0" y1="179" x2="420" y2="179" style="stroke:var(--muted)" stroke-width="3"/>
      ${Array.from({ length: 16 }, (_, i) => `<line x1="${i * 30 - off}" y1="192" x2="${i * 30 - off + 12}" y2="192" style="stroke:var(--line)" stroke-width="3"/>`).join('')}
      ${deskSVG(dx, 150, false)}${pusherSVG(dx - 100, WHO[cur].tall, dx - 50)}
      ${P ? arrowSVG(dx + 52, 136, dx + 52 + P * k, 136, '--f-a', 'A', dx + 56, 124) : ''}
      ${Ff ? arrowSVG(dx - 52, 166, dx - 52 + Ff * k, 166, '--f-f', 'f', dx - 58 + Ff * k, 158) : ''}
    </svg>`;
    read.innerHTML = `<span>F<sub>f</sub> = ${Ff} N ${v > 0 ? '(sliding)' : '(matches the push)'}</span><span>&Sigma;F = F<sub>A</sub> + F<sub>f</sub> = ${P} + (${Ff}) = <b>${net} N</b></span><span class="big">v = ${v.toFixed(2)} m/s, ${state}</span><span>${stuck || msg}</span>`;
    if (v > 0) msg = '';
  });
}
Game.add({
  id: 'x1', section: 'extra', tag: 'Extra 1', title: 'Mr. C\'s Desk',
  blurb: 'Mr. C can\'t budge his desk against 350 N of friction. Mr. Smalley slides it at constant velocity.',
  steps: [
    (el, api) => FBD(el, api, {
      ctx: 'Mr. C pushes his desk as hard as he can, but there\'s too much friction (350 N) and it <b>doesn\'t move</b>.', q: 'Build the desk\'s free body diagram.',
      scene: deskSVG(), palette: ['Fg', 'FN', 'FA', 'Ff', 'Fair', 'Feng'],
      need: { up: ['FN'], down: ['Fg'], left: ['Ff'], right: ['FA'] },
      hint: 'Hint: four forces. Mr. C pushes to the right.',
      explain: 'F<sub>N</sub> up balances F<sub>g</sub> down. Mr. C\'s F<sub>A</sub> to the right balances friction to the left.',
    }),
    (el, api) => NUM(el, api, {
      q: 'Determine the applied force from Mr. C acting on the desk.', ans: 350, unit: 'N',
      hint: 'It doesn\'t move, so &Sigma;F = 0. Use &Sigma;F = F<sub>A</sub> + F<sub>f</sub> with F<sub>f</sub> = -350 N.',
      signMsg: 'Right size! Mr. C pushes to the right, so it\'s positive.',
      explain: '<span class="eq">&Sigma;F = F<sub>A</sub> + F<sub>f</sub></span><span class="eq">0 = F<sub>A</sub> + (-350 N)</span><span class="eq">350 N = F<sub>A</sub></span>',
    }),
    deskSim,
    (el, api) => MCQ(el, api, {
      ctx: 'Mr. Smalley gets the desk moving, then pushes it forward at a <b>constant velocity</b> with 400 N.',
      q: 'Which free body diagram is correct for the moving desk?',
      opts: [
        { t: 'All four balanced', ok: true, svg: miniFBD({ up: ['FN', 44], down: ['Fg', 44], left: ['Ff', 52], right: ['FA', 52] }) },
        { t: 'Push bigger than friction', why: 'An unbalanced push would make the desk speed up. Constant velocity means balanced.', svg: miniFBD({ up: ['FN', 44], down: ['Fg', 44], left: ['Ff', 26], right: ['FA', 60] }) },
        { t: 'No friction while it moves', why: 'Friction keeps acting while the desk slides across the floor.', svg: miniFBD({ up: ['FN', 44], down: ['Fg', 44], right: ['FA', 52] }) },
        { t: 'No normal force', why: 'The floor is still holding the desk up.', svg: miniFBD({ down: ['Fg', 44], left: ['Ff', 52], right: ['FA', 52] }) },
      ],
      explain: 'Same four forces as when it was stuck, and still balanced. That\'s why it cruises at constant velocity.',
    }),
    (el, api) => NUM(el, api, {
      q: 'Show your calculation: what is the friction acting on the desk while Mr. Smalley pushes it at constant velocity?', ans: -400, unit: 'N',
      hint: 'Constant velocity means &Sigma;F = 0. Use &Sigma;F = F<sub>A</sub> + F<sub>f</sub>.',
      signMsg: 'Right size! Friction points backward (left), so it\'s negative.',
      explain: '<span class="eq">&Sigma;F = F<sub>A</sub> + F<sub>f</sub></span><span class="eq">0 = 400 N + F<sub>f</sub></span><span class="eq">-400 N = F<sub>f</sub></span>',
    }),
  ],
});

// ---------------- X2: Mars & the platypus ----------------
const PLACES = { Earth: { g: 10, sky: '#a5d8ff', ground: '#51cf66' }, Mars: { g: 3.7, sky: '#f0b27a', ground: '#b5532a' }, Moon: { g: 1.6, sky: '#15192a', ground: '#adb5bd' } };
const THINGS = { person: { name: 'You (90 kg)', m: 90 }, platypus: { name: 'Platypus (8 kg)', m: 8 }, bananas: { name: 'Bananas (2 kg)', m: 2 }, barbell: { name: 'Barbell (100 kg)', m: 100 } };
function planetScale(el, api) {
  el.append(h('div', { class: 'q' }, 'Planet scale: swap what\'s on the scale and where the scale is.'),
    h('p', { class: 'ctx' }, 'Watch the value of g while you swap objects on Mars.'));
  const scene = h('div', { class: 'panel' }), read = h('div', { class: 'readout' });
  let place = 'Mars', thing = 'person', passed = false; const tried = { Mars: new Set(['person']) };
  const pb = {}, tb = {};
  el.append(h('div', { class: 'sim' }, scene, h('div', { style: 'display:flex;flex-direction:column;gap:10px;min-width:0' },
    h('div', { class: 'hint' }, 'Location'), h('div', { class: 'row' }, Object.keys(PLACES).map(p => pb[p] = h('button', { class: 'btn small', onclick: () => { place = p; draw(); } }, p))),
    h('div', { class: 'hint' }, 'On the scale'), h('div', { class: 'row' }, Object.entries(THINGS).map(([k, t]) => tb[k] = h('button', { class: 'btn small', onclick: () => { thing = k; draw(); } }, t.name))), read)));
  function draw() {
    SFX.click(); (tried[place] = tried[place] || new Set()).add(thing);
    Object.entries(pb).forEach(([k, b]) => b.classList.toggle('on', k === place)); Object.entries(tb).forEach(([k, b]) => b.classList.toggle('on', k === thing));
    const P = PLACES[place], T = THINGS[thing], W = +(T.m * P.g).toFixed(1);
    const obj = thing === 'person' ? avatarSVG(Game.state.avatar, Game.state.equip).replace('<svg ', '<svg x="130" y="74" width="100" height="112" ')
      : thing === 'platypus' ? `<g transform="translate(180 170) scale(2.2)">${petSVG('platypus')}</g>`
      : thing === 'bananas' ? bananasSVG(180, 150, 1.1)
      : `<line x1="104" y1="170" x2="256" y2="170" stroke="#495057" stroke-width="6"/><rect x="108" y="146" width="14" height="48" rx="3" fill="#212529"/><rect x="238" y="146" width="14" height="48" rx="3" fill="#212529"/>`;
    scene.innerHTML = `<svg viewBox="0 0 360 240" role="img" aria-label="${T.name} on a scale on ${place}">
      <rect width="360" height="240" fill="${P.sky}"/><rect y="202" width="360" height="38" fill="${P.ground}"/>
      <rect x="10" y="10" width="150" height="30" rx="6" fill="rgba(0,0,0,.6)"/><text x="20" y="31" fill="#fff" style="font:700 15px var(--mono)">g = -${P.g} N/kg</text>
      ${obj}
      <rect x="126" y="190" width="108" height="14" rx="4" fill="#f8f9fa" stroke="#1b1f27" stroke-width="2.5"/>
      <rect x="152" y="206" width="56" height="22" rx="4" fill="#1b1f27"/><text x="180" y="222" text-anchor="middle" fill="#8ce99a" style="font:700 12px var(--mono)">${W} N</text></svg>`;
    read.innerHTML = `<span class="big">g = -${P.g} N/kg</span><span>(set by ${place})</span><span>F<sub>g</sub> = m &middot; g</span><span>F<sub>g</sub> = ${T.m} kg &middot; (-${P.g} N/kg)</span><span class="big">F<sub>g</sub> = -${W} N</span><span>Mass: ${T.m} kg everywhere</span>`;
    if (!passed && tried.Mars.size >= 2) { passed = true; api.right(15, read); api.done('Swapping the object on Mars changed the <b>weight</b>, but <b>g stayed -3.7 N/kg</b>. The gravitational field is determined by the location, not by the object placed there.'); }
  }
  draw();
}
Game.add({
  id: 'x2', section: 'extra', tag: 'Extra 2', title: 'Mars & the Platypus',
  blurb: 'Weigh a 90 kg person on Mars, swap in an 8 kg platypus, then bring the platypus home to Earth.',
  steps: [
    (el, api) => NUM(el, api, {
      q: 'Calculate the weight of a 90 kg person on Mars, where the gravitational field is -3.7 N/kg.', ans: -333, tol: 0.5, unit: 'N',
      explain: '<span class="eq">F<sub>g</sub> = m &middot; g</span><span class="eq">F<sub>g</sub> = 90 kg &middot; (-3.7 N/kg)</span><span class="eq">F<sub>g</sub> = -333 N</span>',
    }),
    planetScale,
    (el, api) => MCQ(el, api, {
      q: 'We replace the person on Mars with an 8 kg platypus. What is the gravitational field at that location now?',
      opts: [
        { t: '-3.7 N/kg', ok: true },
        { t: '-29.6 N/kg', why: '-29.6 is the platypus\'s <i>weight</i> in Newtons (8 &middot; -3.7), not the field.' },
        { t: '-41.6 N/kg', why: 'That\'s 333 &divide; 8, mixing the person\'s weight with the platypus\'s mass.' },
        { t: '-10 N/kg', why: 'That\'s Earth\'s field. We\'re still on Mars.' },
      ],
      explain: 'g = -3.7 N/kg. It\'s determined by the location, not by the object placed there.',
    }),
    (el, api) => NUM(el, api, {
      q: 'How much would the 8 kg platypus weigh on Earth?', ans: -80, unit: 'N',
      explain: '<span class="eq">F<sub>g</sub> = m &middot; g</span><span class="eq">F<sub>g</sub> = 8 kg &middot; (-10 N/kg)</span><span class="eq">F<sub>g</sub> = -80 N</span>',
    }),
    (el, api) => MCQ(el, api, {
      q: 'What is the platypus\'s mass on Mars compared to on Earth?',
      opts: [
        { t: '8 kg in both places', ok: true },
        { t: 'Less on Mars', why: 'Its weight is less on Mars. Its mass (amount of platypus) is the same.' },
        { t: 'More on Mars', why: 'Mass doesn\'t depend on the planet.' },
        { t: '0 kg on Mars', why: 'The platypus didn\'t vanish! Mass is the amount of matter.' },
      ],
      explain: 'Mass stays 8 kg. Only weight changes: -80 N on Earth, -29.6 N on Mars.',
    }),
  ],
});

// ---------------- X3: Magnus's barbell ----------------
function barbellSim(el, api) {
  el.append(h('div', { class: 'q' }, 'Barbell lab: run each part of Magnus\'s lift and watch the two arrows.'),
    h('p', { class: 'ctx' }, 'The barbell weighs 1000 N. Try Lift, Hold and Lower. Drop is there for comparison.'));
  const scene = h('div', { class: 'panel' }), read = h('div', { class: 'readout' });
  const PH = { lift: ['1. Lift (constant velocity)', 1000], hold: ['2. Hold at the top', 1000], lower: ['3. Lower (speeding up)', 600], drop: ['Just drop it', 0] };
  const pb = {};
  el.append(h('div', { class: 'sim' }, scene, h('div', { style: 'display:flex;flex-direction:column;gap:10px;min-width:0' },
    h('div', { class: 'row' }, Object.entries(PH).map(([k, p]) => pb[k] = h('button', { class: 'btn small', onclick: () => go(k) }, p[0]))), read)));
  let ph = 'rest', hb = 90, v = 0, t = 0, passed = false; const tried = new Set();
  function go(k) {
    if (k !== 'lift' && hb < 195) return; // hold, lower and drop start from the top
    ph = k; t = 0; tried.add(k); SFX.click(); if (k === 'lift') v = 60;
    Object.entries(pb).forEach(([j, b]) => b.classList.toggle('on', j === k));
  }
  loop(el, dt => {
    t += dt;
    if (ph === 'lift') { v = 60; hb += v * dt; if (hb >= 200) { hb = 200; go('hold'); } }
    else if (ph === 'lower') { v -= 120 * dt; hb += v * dt; if (hb <= 90) { hb = 90; v = 0; ph = 'rest'; } }
    else if (ph === 'drop') { v -= 300 * dt; hb += v * dt; if (hb <= 26) { hb = 26; v = 0; SFX.boom(); ph = 'dropped'; t = 0; } }
    else if (ph === 'dropped') { if (t > 1.2) { hb = 90; ph = 'rest'; } }
    else v = 0;
    const FA = ph === 'lower' ? 600 : ph === 'drop' || ph === 'dropped' ? 0 : 1000;
    const net = ph === 'dropped' ? 0 : FA - 1000;
    if (!passed && tried.has('lift') && tried.has('hold') && tried.has('lower')) { passed = true; api.right(15, read); api.done('Notice which arrows changed size and which never did. Keep that in mind for the ranking.'); }
    const by = 240 - hb, armsUp = ph === 'drop' || ph === 'dropped', hy = armsUp ? 40 : by;
    const k = 0.07, fx = 340;
    scene.innerHTML = `<svg viewBox="0 0 420 260" role="img" aria-label="Magnus lifting a barbell">
      <line x1="0" y1="242" x2="420" y2="242" style="stroke:var(--muted)" stroke-width="3"/>
      <g style="stroke:var(--ink)" stroke-width="4" stroke-linecap="round" fill="none">
        <circle cx="140" cy="68" r="15" style="fill:var(--card)"/>
        <line x1="140" y1="83" x2="140" y2="170"/><line x1="140" y1="170" x2="120" y2="240"/><line x1="140" y1="170" x2="160" y2="240"/>
        <path d="M140 100 Q112 ${(100 + hy) / 2} 112 ${hy}"/><path d="M140 100 Q168 ${(100 + hy) / 2} 168 ${hy}"/></g>
      <line x1="70" y1="${by}" x2="210" y2="${by}" stroke="#495057" stroke-width="6"/>
      <rect x="74" y="${by - 24}" width="14" height="48" rx="3" fill="#212529"/><rect x="192" y="${by - 24}" width="14" height="48" rx="3" fill="#212529"/>
      <text x="${fx - 60}" y="24" style="fill:var(--muted);font:12px var(--body)">barbell FBD</text>
      <rect x="${fx - 16}" y="124" width="32" height="12" rx="3" style="fill:var(--card);stroke:var(--ink)" stroke-width="2"/>
      ${FA ? arrowSVG(fx, 124, fx, 124 - FA * k, '--f-a', 'A', fx + 8, 124 - FA * k + 10) : ''}
      ${arrowSVG(fx, 136, fx, 136 + 1000 * k, '--f-g', 'g', fx + 8, 136 + 1000 * k)}
    </svg>`;
    const motion = { lift: 'moving up at constant velocity', hold: 'at rest at the top', lower: 'speeding up downward', drop: 'free fall!', dropped: 'CLANG. On the floor.', rest: 'at rest' }[ph];
    read.innerHTML = `<span>F<sub>g</sub> = -1000 N (always)</span><span>F<sub>A</sub> (Magnus) = ${FA} N</span><span>&Sigma;F = ${FA} + (-1000) = <b>${net} N</b></span><span class="big">${motion}</span><span class="note hint">${hb < 195 && ph !== 'lift' ? 'Lift to the top to unlock Hold, Lower and Drop.' : ''}</span>`;
  });
}
Game.add({
  id: 'x3', section: 'extra', tag: 'Extra 3', title: 'Magnus\'s Barbell',
  blurb: 'Lift, hold, lower. Rank six forces from least to greatest using < and =.',
  steps: [
    barbellSim,
    (el, api) => RANK(el, api, {
      ctx: 'Magnus lifts a huge barbell at a constant velocity, holds it at rest over his head for 4 seconds, then lowers it and it speeds up on the way down (but not as fast as if he dropped it).',
      q: 'Put these in order from least to greatest magnitude.',
      items: [
        { k: 'A', t: 'Gravity on the barbell when it is over his head', v: 1000 },
        { k: 'B', t: 'Gravity on the barbell on its way down', v: 1000 },
        { k: 'C', t: 'Net force on the barbell on the way up', v: 0 },
        { k: 'D', t: 'Magnus\'s applied force on the way up', v: 1000 },
        { k: 'E', t: 'Magnus\'s applied force at the highest point', v: 1000 },
        { k: 'F', t: 'Magnus\'s applied force on the way down', v: 600 },
      ],
      explain: '<span class="eq">C &lt; F &lt; A = B = D = E</span>C is 0 (constant velocity = balanced). F is less than gravity because the barbell speeds up downward, but more than 0 because it falls slower than a drop. Gravity never changes (A = B), and at constant velocity or at rest Magnus pushes exactly the weight (D = E).',
    }),
    (el, api) => MCQ(el, api, {
      q: 'Why is F (Magnus\'s force on the way down) less than gravity but more than zero?',
      opts: [
        { t: 'It speeds up downward, so the net force is down (F<sub>A</sub> < F<sub>g</sub>). But it\'s slower than a drop, so he still pushes up some.', ok: true },
        { t: 'He stops pushing once it moves down.', why: 'Then it would be a free fall. It speeds up slower than that.' },
        { t: 'Gravity gets weaker as it gets lower.', why: 'Gravity on the barbell is the same the whole time (A = B).' },
        { t: 'It\'s moving down, so he must push down.', why: 'He\'s still pushing up, just less than the weight.' },
      ],
      explain: 'Speeding up = unbalanced forces. Down is winning, but only a little.',
    }),
    (el, api) => MCQ(el, api, {
      q: 'Why is D (applied force on the way up) equal to the barbell\'s weight?',
      opts: [
        { t: 'It moves up at constant velocity, so the forces are balanced.', ok: true },
        { t: 'It\'s a coincidence.', why: 'It\'s required: constant velocity means F<sub>net</sub> = 0.' },
        { t: 'Moving up always needs a force bigger than gravity.', why: 'That\'s Terry\'s mistake! Only speeding up needs more.' },
        { t: 'Because he\'s about to hold it.', why: 'What\'s coming next doesn\'t matter. Right now it moves at constant velocity.' },
      ],
      explain: 'Constant velocity (going up) and at rest (holding) are both balanced: F<sub>A</sub> = |F<sub>g</sub>|.',
    }),
  ],
});
