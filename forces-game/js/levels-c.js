// Stations for review questions 7–9.

// ---------------- Q7 ----------------
function wagonSVG(x = 180, y = 150, ground = true) {
  const st = 'style="fill:var(--card);stroke:var(--ink)" stroke-width="2.5"';
  return `<g transform="translate(${x} ${y})">
    <rect x="-45" y="-22" width="90" height="32" rx="4" ${st}/>
    <line x1="-40" y1="-12" x2="40" y2="-12" style="stroke:var(--line)" stroke-width="2"/>
    <line x1="45" y1="-6" x2="58" y2="-20" style="stroke:var(--ink)" stroke-width="3" stroke-linecap="round"/>
    <circle cx="-26" cy="18" r="10" ${st}/><circle cx="26" cy="18" r="10" ${st}/></g>
    ${ground ? `<line x1="100" y1="${y + 29}" x2="260" y2="${y + 29}" style="stroke:var(--f-lift)" stroke-width="4"/>` : ''}`;
}
function kidSVG(x, tall, lean) {
  const s = tall ? 1.5 : 1, g = 170;
  const hy = g - 62 * s, sh = g - 44 * s, hip = g - 22 * s;
  return `<g style="stroke:var(--ink)" stroke-width="3" stroke-linecap="round" fill="none">
    <circle cx="${x + lean}" cy="${hy}" r="${8 * s}" style="fill:var(--card)"/>
    <line x1="${x + lean * .8}" y1="${hy + 8 * s}" x2="${x}" y2="${hip}"/>
    <line x1="${x}" y1="${hip}" x2="${x - 8 * s}" y2="${g}"/><line x1="${x}" y1="${hip}" x2="${x + 8 * s}" y2="${g}"/>
    <line x1="${x + lean * .6}" y1="${sh}" x2="${x - 26}" y2="${140}"/></g>`;
}
function wagonSim(el, api) {
  el.append(h('div', { class: 'q' }, 'Tug lab: who can move Baby Franky\'s 10 kg wagon?'),
    h('p', { class: 'ctx' }, 'Try both Franky and Lola. Watch the arrows and the net force.'));
  const scene = h('div', { class: 'panel' }), read = h('div', { class: 'readout' });
  const SC = {
    franky: { who: 'Franky pulls 120 N', FA: 120, Ff: 120, tall: false, v0: 0 },
    lola: { who: 'Lola pulls 155 N', FA: 155, Ff: 155, tall: true, v0: 1.2 },
    slick: { who: 'What if? Lola on smooth pavement (100 N friction)', FA: 155, Ff: 100, tall: true, v0: 1.2 },
  };
  const btns = {};
  el.append(h('div', { class: 'sim' }, scene, read), h('div', { class: 'row' }, Object.entries(SC).map(([k, s]) => btns[k] = h('button', { class: 'btn small', onclick: () => set(k) }, s.who))));
  let cur = SC.franky, key = 'franky', v = 0, off = 0, t = 0; const tried = new Set(); let passed = false;
  function set(k) {
    key = k; cur = SC[k]; v = cur.v0; t = 0; tried.add(k); SFX.click();
    Object.entries(btns).forEach(([j, b]) => b.classList.toggle('on', j === k));
    if (!passed && tried.has('franky') && tried.has('lola')) { passed = true; api.right(15, read); api.done('Both cases have <b>balanced</b> forces (F<sub>net</sub> = 0). Franky\'s wagon stays at rest; Lola\'s keeps rolling at constant velocity. Same net force, different starting motion.'); }
  }
  set('franky');
  loop(el, dt => {
    t += dt;
    const net = cur.FA - cur.Ff, a = net / 10;
    v += a * dt; if (key === 'slick' && t > 2.4) { v = cur.v0; t = 0; }
    off = (off + v * 60 * dt) % 30;
    const jig = key === 'franky' ? Math.sin(performance.now() / 45) * 1.2 : 0;
    const wx = 170 + jig, k = 0.36;
    scene.innerHTML = `<svg viewBox="0 0 420 220" role="img" aria-label="Wagon being pulled">
      <line x1="0" y1="178" x2="420" y2="178" style="stroke:var(--f-lift)" stroke-width="4"/>
      ${Array.from({ length: 16 }, (_, i) => `<line x1="${i * 30 - off}" y1="190" x2="${i * 30 - off + 12}" y2="190" style="stroke:var(--muted)" stroke-width="2"/>`).join('')}
      ${wagonSVG(wx, 150, false)}
      <line x1="${wx + 58}" y1="130" x2="${cur.tall ? 324 : 334}" y2="140" style="stroke:var(--ink)" stroke-width="2"/>
      ${kidSVG(cur.tall ? 350 : 360, cur.tall, 8)}
      ${arrowSVG(wx + 50, 150, wx + 50 + cur.FA * k, 150, '--f-a', 'A', wx + 56, 138)}
      ${arrowSVG(wx - 50, 150, wx - 50 - cur.Ff * k, 150, '--f-f', 'f', wx - 64 - cur.Ff * k, 138)}
      ${arrowSVG(wx, 124, wx, 124 - 100 * k, '--f-n', 'N', wx + 8, 96)}
      ${arrowSVG(wx - 10, 170, wx - 10, 170 + 100 * k * .8, '--f-g', 'g', wx + 2, 214)}
    </svg>`;
    const state = Math.abs(net) > 0 ? 'speeding up (unbalanced)' : v === 0 ? 'at rest (balanced)' : 'constant velocity (balanced)';
    read.innerHTML = `<span class="big">${cur.who}</span><span>F<sub>net,x</sub> = F<sub>A</sub> + F<sub>f</sub></span><span>F<sub>net,x</sub> = ${cur.FA} N + (-${cur.Ff} N)</span><span class="big">F<sub>net,x</sub> = ${net} N</span><span>Speed: ${v.toFixed(2)} m/s</span><span>Motion: ${state}</span>`;
  });
}
Game.add({
  id: 'q7', tag: 'Review Q7', title: 'Franky\'s Wagon',
  blurb: 'Baby Franky can\'t budge it at 120 N. Big sister Lola pulls 155 N. Find friction and net force.',
  steps: [
    wagonSim,
    (el, api) => FBD(el, api, {
      ctx: 'Franky pulls his 10 kg wagon to the right with 120 N, but it <b>doesn\'t move</b>.', q: 'Build the wagon\'s free body diagram.',
      scene: wagonSVG(), palette: ['Fg', 'FN', 'FA', 'Ff', 'Fair', 'Feng'],
      need: { up: ['FN'], down: ['Fg'], left: ['Ff'], right: ['FA'] },
      hint: 'Hint: four forces. The grass does two different jobs.',
      explain: 'The grass pushes up (F<sub>N</sub>) and resists sliding (F<sub>f</sub>). Franky pulls (F<sub>A</sub>). Gravity pulls down (F<sub>g</sub>). Not moving means all balanced.',
    }),
    (el, api) => NUM(el, api, {
      q: 'Determine the force of friction on the wagon while Franky pulls with 120 N and it doesn\'t move.', ans: -120, unit: 'N',
      hint: 'Not moving means F<sub>net</sub> = 0. Use F<sub>net</sub> = F<sub>f</sub> + F<sub>A</sub>.',
      signMsg: 'Right size! But friction points left here, so it gets a negative sign.',
      explain: '<span class="eq">F<sub>net</sub> = F<sub>f</sub> + F<sub>A</sub></span><span class="eq">0 N = F<sub>f</sub> + 120 N</span><span class="eq">-120 N = F<sub>f</sub></span>',
    }),
    (el, api) => MCQ(el, api, {
      ctx: 'Lola pulls with 155 N. The wagon moves across the grass, with 155 N of friction resisting.',
      q: 'How does the wagon\'s FBD compare to Franky\'s?',
      opts: [
        { t: 'Same four forces: F<sub>A</sub> right and F<sub>f</sub> left are still equal (155 N each)', ok: true },
        { t: 'Add an extra "motion force" pointing right', why: 'There\'s no such thing. Only pushes and pulls from other objects count.' },
        { t: 'F<sub>A</sub> must be drawn longer than F<sub>f</sub>, since it moves', why: 'They\'re both 155 N, so equal arrows. Moving doesn\'t require an unbalanced force.' },
        { t: 'Remove friction since it\'s moving now', why: 'Friction acts while sliding too: 155 N of it here.' },
      ],
      explain: 'Moving at constant velocity uses the exact same balanced FBD as sitting still.',
    }),
    (el, api) => NUM(el, api, {
      q: 'Calculate the net force on the wagon in the x-direction while Lola pulls it.', ans: 0, unit: 'N',
      hint: 'F<sub>net,x</sub> = F<sub>f</sub> + F<sub>A</sub>. Friction points left (negative).',
      explain: '<span class="eq">F<sub>net,x</sub> = F<sub>f</sub> + F<sub>A</sub></span><span class="eq">F<sub>net,x</sub> = -155 N + 155 N</span><span class="eq">F<sub>net,x</sub> = 0 N</span>',
    }),
    (el, api) => MCQ(el, api, {
      q: 'Is the wagon speeding up, slowing down, or moving at constant velocity as Lola pulls it?', keepOrder: true,
      opts: [
        { t: 'Speeding up', why: 'Speeding up needs an unbalanced force forward. Here F<sub>net</sub> = 0.' },
        { t: 'Slowing down', why: 'Slowing down needs an unbalanced force backward. Here F<sub>net</sub> = 0.' },
        { t: 'Constant velocity', ok: true },
      ],
      explain: 'With zero net force, the forces are balanced, so it must be moving at a constant velocity.',
    }),
    (el, api) => NUM(el, api, {
      ctx: 'Bonus round.', q: 'How big is the normal force from the grass on the 10 kg wagon?', ans: 100, unit: 'N',
      hint: 'First find F<sub>g</sub> = mg. Then up and down must balance.',
      signMsg: 'Right size! The normal force points up, so it\'s positive.',
      explain: '<span class="eq">F<sub>g</sub> = 10 kg &middot; (-10 N/kg) = -100 N</span><span class="eq">0 N = F<sub>N</sub> + (-100 N)</span><span class="eq">F<sub>N</sub> = 100 N</span>',
    }),
  ],
});

// ---------------- Q8 ----------------
Game.add({
  id: 'q8', tag: 'Review Q8', title: 'Inertia or Force?',
  blurb: 'Myth-busting speed round. Is it a force at work, or just inertia?',
  steps: [
    (el, api) => SORT(el, api, {
      q: 'Is each motion explained by <b>inertia</b> or by <b>a force</b> acting right now?',
      bins: ['Inertia', 'A force'],
      cards: [
        { t: 'A cannonball keeps rolling down the hallway after the bat stops touching it', bin: 0, why: 'The bat\'s force ended when contact ended. Inertia keeps it rolling.' },
        { t: 'The cannonball slows down and stops on the carpet', bin: 1, why: 'Slowing down is a change in velocity, so a force (friction) is acting.' },
        { t: 'A hockey puck glides across smooth ice at a steady speed', bin: 0, why: 'Steady speed in a straight line needs no net force.' },
        { t: 'Your body lurches forward when the bus slams its brakes', bin: 0, why: 'The bus stopped; you kept going. Nothing pushed you forward.' },
        { t: 'A tossed ball curves down toward the ground', bin: 1, why: 'Gravity is changing its direction and speed.' },
        { t: 'Dishes stay put when a tablecloth is yanked out fast', bin: 0, why: 'At rest stays at rest. The quick yank barely has time to affect them.' },
        { t: 'The Moon curves around Earth instead of going straight', bin: 1, why: 'Gravity bends its path. Without it, straight line.' },
        { t: 'A space probe coasts through deep space with its engines off', bin: 0, why: 'No forces, so constant velocity forever.' },
        { t: 'A soccer ball changes direction when it\'s kicked', bin: 1 },
        { t: 'A car speeds up when the light turns green', bin: 1, why: 'Speeding up means an unbalanced force forward.' },
      ],
      explain: 'Rule of thumb: <b>changing</b> velocity (speeding up, slowing down, turning) = a force. <b>Keeping</b> velocity = inertia.',
    }),
    (el, api) => MCQ(el, api, {
      ctx: 'Your friend watches the cannonball roll at constant velocity down the hallway after being hit by a bat.',
      q: 'They say: "It keeps rolling because the force from the bat is still pushing it." Best response?',
      opts: [
        { t: 'The bat\'s force only acts while it touches the ball. After that, inertia keeps it rolling at constant velocity.', ok: true },
        { t: 'True, and the bat\'s force slowly wears off, which is why it eventually stops.', why: 'Forces aren\'t stored in objects. It eventually stops because of friction, a new force.' },
        { t: 'Actually the floor pushes it forward.', why: 'The floor pushes up (normal force) and resists with friction. Nothing pushes it forward.' },
        { t: 'Air pushes it from behind.', why: 'Air resistance pushes against the motion, not along with it.' },
      ],
      explain: 'Once the ball is moving, its inertia keeps it moving at constant velocity unless a force is added to stop it.',
    }),
    (el, api) => MCQ(el, api, {
      q: 'Which pair is described correctly?',
      opts: [
        { t: 'Inertia: an object\'s tendency to keep its velocity. Force: a push or pull that can change velocity.', ok: true },
        { t: 'Inertia: a force that keeps things moving. Force: what makes things stop.', why: 'Inertia isn\'t a force at all, and forces can start, stop, or turn things.' },
        { t: 'Inertia and force are the same idea.', why: 'Inertia belongs to the object (depends on its mass). A force comes from an interaction with another object.' },
        { t: 'Inertia only applies to objects at rest.', why: 'Moving objects have inertia too. That\'s why you lurch forward when the bus stops.' },
      ],
      explain: 'More mass = more inertia. Forces are measured in Newtons; inertia is not a force.',
    }),
  ],
});

// ---------------- Q9 ----------------
function terryLift(el, api) {
  el.append(h('div', { class: 'q' }, 'Shelf challenge: help Terry lift the 23.5 kg box of books onto the shelf.'),
    h('p', { class: 'ctx', html: 'Pick how hard Terry lifts. The box weighs 235 N. Arrive at the shelf at <b>1.0 m/s or slower</b> or the books go flying. Keys: 1, 2, 3.' }));
  const cv = h('canvas', { 'aria-label': 'Terry lifting a box toward a shelf' }), gv = h('canvas', { 'aria-label': 'Velocity versus time graph' });
  const read = h('div', { class: 'readout' }), goal = h('div', { class: 'goal' }, 'Goal: box on the shelf, arriving gently.');
  const MODES = { less: ['1', 'LESS than gravity (200 N)', 200], equal: ['2', 'EQUAL to gravity (235 N)', 235], more: ['3', 'MORE than gravity (300 N)', 300] };
  const btns = {};
  el.append(h('div', { class: 'sim' }, h('div', { class: 'panel' }, cv), h('div', { style: 'display:flex;flex-direction:column;gap:10px;min-width:0' },
    h('div', { class: 'row' }, Object.entries(MODES).map(([k, m]) => btns[k] = h('button', { class: 'btn small', onclick: () => set(k) }, `${m[0]}. ${m[1]}`))),
    h('div', { class: 'panel' }, gv), read, goal, h('div', { class: 'row' }, h('button', { class: 'btn small', onclick: () => reset() }, 'Reset box')))));
  const W = 360, H = 330, ctx = hiDPI(cv, W, H), GW = 340, GH = 130, g2 = hiDPI(gv, GW, GH);
  const m = 23.5, SHELF = 1.6, floorY = 262, px = 100;
  let mode = 'equal', y = 0, v = 0, state = 'play', tMore = 0, hist = [], msg = '', bx = 148, passed = false, timer = 0;
  function set(k) { if (state !== 'play') return; mode = k; SFX.click(); Object.entries(btns).forEach(([j, b]) => b.classList.toggle('on', j === k)); }
  function reset() { y = 0; v = 0; state = 'play'; tMore = 0; hist = []; bx = 148; msg = ''; mode = 'less'; set('equal'); }
  const onKey = e => { if (!el.isConnected) return document.removeEventListener('keydown', onKey); const k = { 1: 'less', 2: 'equal', 3: 'more' }[e.key]; if (k) set(k); };
  document.addEventListener('keydown', onKey);
  reset();
  loop(el, dt => {
    const FA = MODES[mode][2];
    let FN = 0, a = 0;
    if (state === 'play') {
      a = (FA - 235) / m;
      if (y <= 0 && a <= 0 && v <= 0) { a = 0; v = 0; y = 0; FN = 235 - FA; }
      v += a * dt; y += v * dt; if (y < 0) { y = 0; v = 0; }
      if (mode === 'more' && (y > 0 || a > 0)) tMore += dt;
      if (y >= SHELF) {
        if (v <= 1.0) {
          state = 'won'; y = SHELF; SFX.win(); confetti();
          msg = `Nice landing at ${v.toFixed(2)} m/s! You lifted MORE than gravity for only ${tMore.toFixed(1)} s. The rest was inertia.`;
          goal.classList.add('met'); goal.textContent = 'Goal met: box on the shelf!'; v = 0;
          if (!passed) { passed = true; api.right(30, goal); api.done('Terry only needs a force <b>greater</b> than gravity for a moment to get the box moving. After that, an <b>equal</b> force (balanced, F<sub>net</sub> = 0) keeps it moving up at constant velocity. Look at the flat part of your velocity graph.'); }
        } else { state = 'crash'; timer = 1.6; SFX.boom(); msg = `CRASH at ${v.toFixed(2)} m/s! Books everywhere. Terry's plan of pushing MORE the whole way is too much.`; }
      }
      hist.push(v); if (hist.length > 480) hist.shift();
    } else if (state === 'won') { bx = Math.min(268, bx + 120 * dt); }
    else if (state === 'crash') { timer -= dt; if (timer <= 0) reset(); }
    draw(FA, FN); graph();
    const net = state === 'play' ? FA - 235 + FN : 0;
    const motion = state !== 'play' ? '' : Math.abs(v) < 0.005 ? 'at rest' : Math.abs(a) < 0.01 ? 'constant velocity upward' : a > 0 ? 'speeding up' : 'slowing down';
    read.innerHTML = `<span>F<sub>net</sub> = F<sub>A</sub> + F<sub>g</sub>${FN ? ' + F<sub>N</sub>' : ''} = ${FA} + (-235)${FN ? ' + ' + FN : ''} = <b>${net > 0 ? '+' : ''}${net} N</b></span><span class="big">v = ${v.toFixed(2)} m/s ${motion}</span><span>Height: ${y.toFixed(2)} / ${SHELF} m</span><span>${msg}</span>`;
  });
  function draw(FA, FN) {
    const ink = css('--ink'), mut = css('--muted'), soft = css('--soft'), card = css('--card');
    ctx.fillStyle = soft; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = mut; ctx.fillRect(0, floorY, W, 4);
    const sy = floorY - SHELF * px; ctx.fillStyle = css('--f-eng'); ctx.fillRect(250, sy, 110, 8); ctx.fillRect(350, sy, 8, floorY - sy);
    ctx.font = '12px ' + css('--mono'); ctx.fillStyle = mut; ctx.fillText('shelf 1.6 m', 262, sy + 24);
    const by = floorY - y * px - 40;
    // Terry
    ctx.strokeStyle = ink; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.fillStyle = card;
    ctx.beginPath(); ctx.arc(96, floorY - 132, 13, 0, 7); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(96, floorY - 119); ctx.lineTo(96, floorY - 60); ctx.lineTo(80, floorY); ctx.moveTo(96, floorY - 60); ctx.lineTo(112, floorY);
    if (state !== 'won' || bx < 170) { ctx.moveTo(96, floorY - 104); ctx.lineTo(bx, by + 24); ctx.moveTo(96, floorY - 98); ctx.lineTo(bx, by + 32); }
    ctx.stroke();
    // box
    ctx.fillStyle = card; ctx.lineWidth = 2.5; ctx.fillRect(bx, by, 44, 40); ctx.strokeRect(bx, by, 44, 40);
    [css('--f-n'), css('--f-g'), css('--f-lift')].forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(bx + 6 + i * 12, by + 6, 9, 28); });
    if (state === 'play') {
      const ax = bx + 62;
      arrow(ax, by + 20, by + 20 - FA / 5, css('--f-a'), 'FA ' + FA);
      arrow(ax + 16, by + 20, by + 20 + 235 / 5, css('--f-g'), 'Fg -235');
      if (FN) arrow(bx + 22, by + 40, by + 40 - FN / 3, css('--f-n'), 'FN');
    }
  }
  function arrow(x, y1, y2, c, label) {
    const s = Math.sign(y2 - y1); ctx.strokeStyle = ctx.fillStyle = c; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2 - s * 8); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y2); ctx.lineTo(x - 6, y2 - s * 10); ctx.lineTo(x + 6, y2 - s * 10); ctx.fill();
    ctx.font = '700 11px ' + css('--mono'); ctx.fillText(label, x + 8, y2 + (s > 0 ? 0 : 10));
  }
  function graph() {
    const ink = css('--ink'), mut = css('--muted');
    const x0 = 34, y0 = GH - 18, top = 8, sy = vv => y0 - (clamp(vv, -1, 3) + 1) / 4 * (y0 - top);
    g2.clearRect(0, 0, GW, GH); g2.font = '10px ' + css('--mono'); g2.fillStyle = mut; g2.strokeStyle = mut; g2.lineWidth = 1;
    [0, 1, 2, 3].forEach(t => { g2.globalAlpha = .35; g2.beginPath(); g2.moveTo(x0, sy(t)); g2.lineTo(GW - 4, sy(t)); g2.stroke(); g2.globalAlpha = 1; g2.fillText(t + '', 22, sy(t) + 3); });
    g2.fillText('v (m/s)', x0 + 6, 12); g2.fillText('time', GW - 34, GH - 4);
    g2.strokeStyle = ink; g2.lineWidth = 2; g2.beginPath(); g2.moveTo(x0, top); g2.lineTo(x0, y0); g2.stroke();
    g2.strokeStyle = css('--f-a'); g2.lineWidth = 2.5; g2.beginPath();
    hist.forEach((vv, i) => { const x = x0 + i / 480 * (GW - 4 - x0); i ? g2.lineTo(x, sy(vv)) : g2.moveTo(x, sy(vv)); }); g2.stroke();
    g2.setLineDash([4, 4]); g2.strokeStyle = css('--bad'); g2.beginPath(); g2.moveTo(x0, sy(1)); g2.lineTo(GW - 4, sy(1)); g2.stroke(); g2.setLineDash([]);
  }
}
Game.add({
  id: 'q9', tag: 'Review Q9', title: 'Terry\'s Heavy Box',
  blurb: 'Terry thinks you must push harder than gravity the whole way up. Prove them wrong on the shelf.',
  steps: [
    terryLift,
    (el, api) => MCQ(el, api, {
      ctx: 'Terry: "I have to push up with more than gravity for the <i>entire</i> lift. Less than gravity and it moves down; equal to gravity and it stops moving up."',
      q: 'Do you agree with Terry?',
      opts: [
        { t: 'Disagree. More than gravity is only needed briefly to start it moving. Then an equal force keeps it moving up at constant velocity.', ok: true },
        { t: 'Agree. If the forces are equal, the box has to stop.', why: 'Equal forces = balanced = constant velocity. It keeps whatever velocity it has, including moving up.' },
        { t: 'Agree. A box moving up must have a net force up.', why: 'Only if it\'s speeding up. Moving up at constant speed means F<sub>net</sub> = 0.' },
        { t: 'Disagree. Terry never needs more than gravity at all.', why: 'Starting from rest, the box has to speed up, which takes a net force up for a moment.' },
      ],
      explain: 'Once it\'s moving upward, the box\'s inertia keeps it going as long as the forces are balanced.',
    }),
    (el, api) => NUM(el, api, {
      q: 'The box of books has a mass of 23.5 kg. Calculate its weight.', ans: -235, unit: 'N',
      explain: '<span class="eq">F<sub>g</sub> = m &middot; g</span><span class="eq">F<sub>g</sub> = 23.5 kg &middot; (-10 N/kg)</span><span class="eq">F<sub>g</sub> = -235 N</span>',
    }),
    (el, api) => NUM(el, api, {
      q: 'To get it started, Terry lifts with 300 N. What is the net force on the box?', ans: 65, unit: 'N',
      hint: 'F<sub>net</sub> = F<sub>g</sub> + F<sub>A</sub>. Gravity is negative.',
      explain: '<span class="eq">&Sigma;F = F<sub>g</sub> + F<sub>A</sub></span><span class="eq">&Sigma;F = -235 N + 300 N</span><span class="eq">&Sigma;F = +65 N</span>The upward applied force is greater than the weight, so there is an upward net force that lifts the box.',
    }),
    (el, api) => MCQ(el, api, {
      q: 'Now the box is rising at a steady 0.5 m/s. How hard is Terry lifting?',
      opts: [
        { t: '235 N, exactly equal to the weight', ok: true },
        { t: '300 N, still more than the weight', why: 'Then there\'d be a +65 N net force and the box would keep speeding up.' },
        { t: '0 N, inertia does all the work', why: 'Gravity is still pulling down 235 N. Without Terry, the net force is down and the box slows and falls.' },
        { t: 'Less than 235 N', why: 'Then the net force points down and the box slows down.' },
      ],
      explain: 'Constant velocity means balanced: F<sub>A</sub> = 235 N up cancels F<sub>g</sub> = -235 N.',
    }),
  ],
});
