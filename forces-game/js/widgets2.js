// Inertia Quest — "Lock In" show-your-work widget, graph drawing, motion player.

// ---------- equation bank (from the review sheets) ----------
const EQS = {
  Fg: 'F<sub>g</sub> = m &middot; g',
  net: '&Sigma;F = F<sub>1</sub> + F<sub>2</sub> + ...',
  vavg: 'v<sub>avg</sub> = &Delta;x / t',
  savg: 's<sub>avg</sub> = d / t',
  dx: '&Delta;x = x<sub>f</sub> - x<sub>i</sub>',
  dv: '&Delta;v = v<sub>f</sub> - v<sub>i</sub>',
  dist: 'd = d<sub>1</sub> + d<sub>2</sub> + ...',
  dFg: '&Delta;F<sub>g</sub> = F<sub>g,final</sub> - F<sub>g,initial</sub>',
  area: '&Delta;x = v &middot; t (area under a v-t graph)',
  dm: '&Delta;m = m<sub>f</sub> - m<sub>i</sub>',
  accel: 'a = &Delta;v / t',
  a2: 'a = &Sigma;F / m',
  pyth: 'R<sup>2</sup> = x<sup>2</sup> + y<sup>2</sup>',
  tan: 'tan &theta; = y / x',
  vavg2: 'v<sub>avg</sub> = (v<sub>f</sub> + v<sub>i</sub>) / 2',
  dvt: '&Delta;v = a &middot; t',
  tri: '&Delta;x = &frac12; &middot; base &middot; height (area under v-t)',
  dxavg: '&Delta;x = v<sub>avg</sub> &middot; t',
  dxsum: '&Delta;x<sub>T</sub> = &Delta;x<sub>1</sub> + &Delta;x<sub>2</sub> + ...',
};
const UNITS = ['N', 'kg', 'N/kg', 'm', 's', 'm/s', 'm/s²', '°'];
const LOCK_LINES = ['Equation first. Every time.', 'Write it like the test is tomorrow.', 'No equation, no points. Lock in.', 'Equation, plug in, answer with units.', 'This is how you get full credit.', 'Show the work. Get the points.'];
const lockSVG = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="4" y="10" width="16" height="12" rx="2.5" fill="currentColor"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.6"/></svg>';
function lockBanner(text) {
  return h('div', { class: 'lockin', html: `${lockSVG}<span><b>LOCK IN.</b> ${text || pick(LOCK_LINES)}</span>` });
}

// Turns "a [[3]] b" into a template with numeric blanks.
function blanksOf(tpl) { const out = []; tpl.replace(/\[\[(-?[\d.]+)\]\]/g, (_, v) => out.push(+v)); return out; }
// Wraps standalone numbers (outside tags/entities/subscripts) of an answer-key line in [[ ]].
function autoBlanks(line) {
  let inSub = false;
  return line.split(/(<[^>]+>|&[#\w]+;)/).map(part => {
    if (part.startsWith('<')) { if (/^<(sub|tspan)/i.test(part)) inSub = true; if (/^<\/(sub|tspan)/i.test(part)) inSub = false; return part; }
    if (part.startsWith('&') || inSub) return part;
    return part.replace(/(^|[\s(=+*·])(-?\d+(?:\.\d+)?)(?![\d.])/g, (m, pre, n) => `${pre}[[${n}]]`);
  }).join('');
}
const eqLines = html => (html || '').match(/<span class="eq">.*?<\/span>/g)?.map(s => s.replace(/^<span class="eq">|<\/span>$/g, '')) || [];
function classifyEq(line) {
  if (/m\s*&middot;\s*g/.test(line) && !/\d/.test(line.replace(/<[^>]+>|&[#\w]+;/g, ''))) return 'Fg';
  if (/^(&Sigma;F|F<sub>net)/.test(line)) return 'net';
  if (/^v<sub>avg/.test(line)) return 'vavg';
  if (/^s<sub>avg/.test(line)) return 'savg';
  if (/^&Delta;x = x/.test(line)) return 'dx';
  if (/^&Delta;x = v/.test(line)) return 'area';
  if (/^&Delta;v/.test(line)) return 'dv';
  if (/^d = d/.test(line)) return 'dist';
  return null;
}
// Old NUM configs whose explanation is "equation / plug in / answer" become Lock In questions automatically.
function autoWork(cfg) {
  if (cfg.noWork || cfg.work) return cfg.work ? Object.assign({}, cfg, cfg.work) : null;
  const L = eqLines(cfg.explain); if (L.length < 3) return null;
  const eq = classifyEq(L[0]); const plug = autoBlanks(L[1]);
  if (!eq || !blanksOf(plug).length) return null;
  const rest = cfg.explain.replace(/<span class="eq">.*?<\/span>/g, '').trim();
  return Object.assign({}, cfg, { eq, form: L[0], plug, finalLine: L[2], after: rest });
}

// ---------- WORK: equation -> plug in -> answer with units ----------
function WORK(el, api, cfg) {
  stepHead(el, cfg);
  el.append(lockBanner(cfg.lock));
  const paper = h('div', { class: 'paper' }); el.append(paper);
  const say = feedback(el);
  let reveals = 0, auto = false; const one = !!cfg.oneShot;
  const row = (n, title) => {
    const r = h('div', { class: 'wrow' }, h('div', { class: 'wnum' }, n), h('div', { class: 'wbody' }, h('div', { class: 'wtitle' }, title)));
    paper.append(r); return r.lastChild;
  };
  const written = (body, html) => { body.querySelectorAll('.wctl').forEach(x => x.remove()); body.append(h('div', { class: 'whand', html })); };
  const fail = (target, msg, tries, reveal) => {
    api.wrong(target);
    if (one || tries >= 2) { reveals++; if (one) auto = true; say(msg + (one ? '' : `<br>${REVEAL} Here's that line. Copy it onto your paper.`)); reveal(); return true; }
    say(msg + ONE_MORE); return false;
  };

  // Step 1: the equation
  function step1() {
    const body = row('1', 'Write the equation');
    const keys = shuffle([cfg.eq, ...shuffle(Object.keys(EQS).filter(k => k !== cfg.eq)).slice(0, 3)]);
    let tries = 0;
    const box = h('div', { class: 'wctl eqopts' }, keys.map(k => {
      const b = h('button', { class: 'eqchip', html: EQS[k] });
      b.onclick = () => {
        if (k === cfg.eq) { say(''); api.right(5, b); written(body, cfg.form || EQS[k]); step2(); return; }
        b.disabled = true; tries++;
        fail(b, 'That equation doesn\'t connect what you know to what you need. What are you solving for?', tries, () => { written(body, cfg.form || EQS[cfg.eq]); step2(); });
      };
      return b;
    }));
    body.append(box);
  }
  // Step 2: plug in values
  const plugDone = () => cfg.plug.replace(/\[\[(-?[\d.]+)\]\]/g, '$1');
  const finalLine = () => cfg.finalLine || `${cfg.lhs ? cfg.lhs + ' ' : ''}${cfg.ans} ${cfg.unit}`;
  function step2() {
    const body = row('2', 'Plug in the values (with units)');
    if (auto) { written(body, plugDone()); return step3(); }
    const want = blanksOf(cfg.plug); let tries = 0, k = 0, last = null;
    const inputs = [];
    const html = cfg.plug.replace(/\[\[(-?[\d.]+)\]\]/g, () => `<input class="blank" data-i="${k++}" type="text" inputmode="decimal" autocomplete="off" aria-label="blank ${k}">`);
    const line = h('div', { class: 'wctl plugline', html });
    line.querySelectorAll('input').forEach(i => { inputs.push(i); i.addEventListener('focus', () => last = i); i.addEventListener('keydown', e => { if (e.key === 'Enter') check(); }); });
    const flip = h('button', { class: 'btn small', title: 'Flip the sign of the box you are typing in', onclick: () => { const i = last || inputs[0]; i.value = i.value.trim().startsWith('-') ? i.value.trim().slice(1) : '-' + i.value.trim(); i.focus(); } }, '+/-');
    const go = h('button', { class: 'btn primary small', onclick: check }, 'Check line');
    body.append(line, h('div', { class: 'wctl row' }, go, flip));
    setTimeout(() => inputs[0]?.focus({ preventScroll: true }), 60);
    function check() {
      const vals = inputs.map(i => parseFloat(i.value.replace(/[−–]/g, '-').replace(/[^0-9.\-]/g, '')));
      if (vals.some(v => !isFinite(v))) { say('Fill in every box first.'); return; }
      const bad = vals.map((v, j) => Math.abs(v - want[j]) > Math.max(0.011, Math.abs(want[j]) * 0.002));
      inputs.forEach((i, j) => i.classList.toggle('bad', bad[j]));
      if (!bad.some(Boolean)) { say(''); api.right(8, go); written(body, cfg.plug.replace(/\[\[(-?[\d.]+)\]\]/g, '$1')); step3(); return; }
      tries++;
      const signOnly = vals.every((v, j) => !bad[j] || Math.abs(-v - want[j]) < 0.011);
      fail(line, signOnly ? 'Check your signs. Down and left are negative.' : 'Some values went in the wrong place. Match each number to what it stands for.', tries,
        () => { written(body, cfg.plug.replace(/\[\[(-?[\d.]+)\]\]/g, '$1')); step3(); });
    }
  }
  // Step 3: answer with units
  function step3() {
    const body = row('3', 'Answer with units');
    if (auto) { written(body, finalLine()); return finish(); }
    const inp = h('input', { type: 'text', inputmode: 'decimal', autocomplete: 'off', class: 'ansbox', 'aria-label': 'Answer' });
    const unit = h('select', { class: 'unitsel', 'aria-label': 'Unit' }, h('option', { value: '' }, 'unit?'), UNITS.map(u => h('option', { value: u }, u)));
    const flip = h('button', { class: 'btn small', onclick: () => { inp.value = inp.value.trim().startsWith('-') ? inp.value.trim().slice(1) : '-' + inp.value.trim(); inp.focus(); } }, '+/-');
    const go = h('button', { class: 'btn primary small', onclick: check }, 'Check answer');
    body.append(h('div', { class: 'wctl row' }, h('span', { class: 'wlhs', html: cfg.lhs || '' }), inp, unit, flip, go));
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
    setTimeout(() => inp.focus({ preventScroll: true }), 60);
    let tries = 0;
    function check() {
      const v = parseFloat(inp.value.replace(/[−–]/g, '-').replace(/[^0-9.\-]/g, ''));
      if (!isFinite(v)) { say('Type the number first.'); return; }
      const tol = cfg.tol ?? 0.05, a = cfg.ans;
      const numOk = Math.abs(v - a) <= tol || (cfg.absOk && Math.abs(Math.abs(v) - Math.abs(a)) <= tol);
      const unitOk = unit.value === cfg.unit;
      const final = finalLine();
      if (numOk && unitOk) { say(''); api.right(10, go); written(body, final); finish(); return; }
      tries++;
      let msg = !numOk && a !== 0 && Math.abs(-v - a) <= tol ? (cfg.signMsg || 'Right size, wrong sign! Down and left are negative.') : !numOk ? (cfg.hint || 'Recheck your math from line 2.') : '';
      if (numOk && !unitOk) msg = 'Number is right, but <b>units</b>! An answer without the right unit loses points on the test.';
      else if (!unitOk) msg += ' Also check the unit.';
      fail(numOk ? unit : inp, msg, tries, () => { written(body, final); finish(); });
    }
  }
  function finish() {
    if (!reveals && !one) {
      Game.state.workStreak = (Game.state.workStreak || 0) + 1; saveState();
      api.right(5, paper);
      el.append(h('div', { class: 'fullwork', html: `${lockSVG}<span><b>Full work shown.</b> Equation, values, answer with units: full credit. Full-work streak: ${Game.state.workStreak}</span>` }));
    } else if (!one) { Game.state.workStreak = 0; saveState(); }
    api.done(cfg.after || cfg.explainAfter || '');
  }
  step1();
}
// NUM upgrade: calculation questions with a worked answer key become Lock In questions.
const NUM_PLAIN = NUM;
NUM = function (el, api, cfg) {
  const w = autoWork(cfg);
  if (w) return WORK(el, api, w);
  if (!cfg.noLock) el.append(lockBanner(cfg.lock));
  return NUM_PLAIN(el, api, cfg);
};

// ---------- graph frame (shared by plots, graph drawing, motion player) ----------
const fmt = v => String(+(+v).toFixed(2));
function frame(c) {
  const W = c.w || 360, H = c.h || 250, L = 50, R = 14, T = 14, B = 38;
  const [x0, x1, xs] = c.x, [y0, y1, ys] = c.y;
  const X = t => L + (t - x0) / (x1 - x0) * (W - L - R), Y = v => T + (y1 - v) / (y1 - y0) * (H - T - B);
  const ay = Y(Math.max(y0, Math.min(0, y1))), ax = X(Math.max(x0, Math.min(0, x1)));
  let s = '';
  for (let t = x0; t <= x1 + 1e-9; t += xs) s += `<line x1="${X(t)}" y1="${T}" x2="${X(t)}" y2="${H - B}" style="stroke:var(--line)"/><text x="${X(t)}" y="${H - B + 14}" text-anchor="middle" style="fill:var(--muted);font:10px var(--mono)">${fmt(t)}</text>`;
  for (let v = y0; v <= y1 + 1e-9; v += ys) s += `<line x1="${L}" y1="${Y(v)}" x2="${W - R}" y2="${Y(v)}" style="stroke:var(--line)"/><text x="${L - 6}" y="${Y(v) + 3.5}" text-anchor="end" style="fill:var(--muted);font:10px var(--mono)">${fmt(v)}</text>`;
  s += `<line x1="${L}" y1="${ay}" x2="${W - R}" y2="${ay}" style="stroke:var(--ink)" stroke-width="2"/><line x1="${ax}" y1="${T}" x2="${ax}" y2="${H - B}" style="stroke:var(--ink)" stroke-width="2"/>`;
  s += `<text x="${(L + W - R) / 2}" y="${H - 6}" text-anchor="middle" style="fill:var(--muted);font:11px var(--body)">${c.xl || 't - time (s)'}</text><text x="12" y="${(T + H - B) / 2}" text-anchor="middle" transform="rotate(-90 12 ${(T + H - B) / 2})" style="fill:var(--muted);font:11px var(--body)">${c.yl || ''}</text>`;
  return { s, X, Y, W, H, L, R, T, B, inv: (px, py) => [x0 + (px - L) / (W - L - R) * (x1 - x0), y1 - (py - T) / (H - T - B) * (y1 - y0)] };
}
const polyPts = (F, pts) => pts.map(([t, v]) => `${F.X(t).toFixed(1)},${F.Y(v).toFixed(1)}`).join(' ');
// Read-only plot of a piecewise-linear graph.
function plotSVG(c, pts, color = '--f-a') {
  const F = frame(c);
  return `<svg viewBox="0 0 ${F.W} ${F.H}" class="plot" role="img" aria-label="${c.yl || 'graph'}">${F.s}<polyline points="${polyPts(F, pts)}" fill="none" style="stroke:var(${color})" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/></svg>`;
}
function simplify(pts) {
  const p = pts.filter((q, i) => !i || q[0] !== pts[i - 1][0] || q[1] !== pts[i - 1][1]);
  const out = [];
  p.forEach(q => {
    while (out.length >= 2) { const [a, b] = out.slice(-2); const cr = (b[0] - a[0]) * (q[1] - a[1]) - (b[1] - a[1]) * (q[0] - a[0]); const dot = (b[0] - a[0]) * (q[0] - b[0]) + (b[1] - a[1]) * (q[1] - b[1]); if (Math.abs(cr) < 1e-6 && dot >= 0) out.pop(); else break; }
    out.push(q);
  });
  return out;
}

// ---------- GRAPHDRAW: tap the grid to plot a graph ----------
function GRAPHDRAW(el, api, cfg) {
  stepHead(el, cfg);
  const F = frame(cfg), [sx, sy] = cfg.snap || [cfg.x[2], cfg.y[2]];
  const wrap = h('div', { class: 'gdraw', html: `<svg viewBox="0 0 ${F.W} ${F.H}" role="application" aria-label="Graph grid. Tap to place points.">${F.s}
    <polyline class="ans" fill="none" style="stroke:var(--pen)" stroke-width="3" stroke-dasharray="7 5"/>
    <polyline class="user" fill="none" style="stroke:var(--f-a)" stroke-width="3.5" stroke-linejoin="round"/>
    <g class="dots"></g><g class="cross" style="pointer-events:none"><circle r="6" fill="none" style="stroke:var(--accent)" stroke-width="2"/><text style="fill:var(--accent);font:700 11px var(--mono)"></text></g></svg>` });
  const svg = wrap.firstElementChild, user = svg.querySelector('.user'), dots = svg.querySelector('.dots'), cross = svg.querySelector('.cross');
  const say = feedback(el);
  let pts = [], tries = 0, locked = false;
  const undo = h('button', { class: 'btn small', onclick: () => { pts.pop(); draw(); } }, 'Undo');
  const clear = h('button', { class: 'btn small', onclick: () => { pts = []; draw(); } }, 'Clear');
  const go = h('button', { class: 'btn primary', onclick: check }, 'Check graph');
  el.append(h('div', { class: 'hint' }, cfg.tip || 'Tap the grid to place points in time order. The line connects them. For a sudden jump on a velocity graph, place two points at the same time.'), wrap, h('div', { class: 'row' }, go, undo, clear));
  const toData = e => {
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
    let [t, v] = F.inv(pt.x, pt.y);
    t = clamp(Math.round(t / sx) * sx, cfg.x[0], cfg.x[1]); v = clamp(Math.round(v / sy) * sy, cfg.y[0], cfg.y[1]);
    return [+t.toFixed(3), +v.toFixed(3)];
  };
  svg.addEventListener('pointermove', e => {
    if (locked) return; const [t, v] = toData(e);
    cross.style.display = ''; cross.firstChild.setAttribute('cx', F.X(t)); cross.firstChild.setAttribute('cy', F.Y(v));
    const tx = cross.lastChild; tx.setAttribute('x', Math.min(F.X(t) + 8, F.W - 80)); tx.setAttribute('y', Math.max(F.Y(v) - 8, 12)); tx.textContent = `(${fmt(t)}, ${fmt(v)})`;
  });
  svg.addEventListener('pointerleave', () => cross.style.display = 'none');
  svg.addEventListener('click', e => {
    if (locked) return; const p = toData(e), last = pts[pts.length - 1];
    if (last && p[0] < last[0]) { say('Time only moves forward. Place points from left to right.'); return; }
    if (last && p[0] === last[0] && p[1] === last[1]) return;
    pts.push(p); SFX.click(); say(''); draw();
  });
  function draw() {
    user.setAttribute('points', polyPts(F, pts));
    dots.innerHTML = pts.map(([t, v]) => `<circle cx="${F.X(t)}" cy="${F.Y(v)}" r="5" style="fill:var(--f-a);stroke:var(--card)" stroke-width="2"/>`).join('');
  }
  function check() {
    if (pts.length < 2) { say('Place at least two points.'); return; }
    const u = simplify(pts); let ok;
    if (cfg.mode === 'anyLine') ok = u.length === 2 && u[1][0] > u[0][0] && Math.abs(u[1][1] - u[0][1]) > 1e-9;
    else { const w = simplify(cfg.pts); ok = u.length === w.length && u.every((q, i) => Math.abs(q[0] - w[i][0]) <= sx / 2 + 1e-9 && Math.abs(q[1] - w[i][1]) <= sy / 2 + 1e-9); }
    if (ok) { locked = true; go.disabled = undo.disabled = clear.disabled = true; say(''); api.right(cfg.xp || 25, go); api.done(cfg.explain); return; }
    api.wrong(wrap); tries++;
    if (tries >= 2 || cfg.oneShot) {
      locked = true; go.disabled = undo.disabled = clear.disabled = true;
      if (cfg.pts) svg.querySelector('.ans').setAttribute('points', polyPts(F, cfg.pts));
      say(`${REVEAL} The dashed purple line is the correct graph.`); api.done(cfg.explain); return;
    }
    say((cfg.hint || 'Not quite. Check each corner point: what time is it, and what is the value there?') + ONE_MORE);
  }
}

// ---------- motion player: animates a piecewise constant-velocity motion with live graphs ----------
const ICONS = {
  car: '<rect x="-16" y="-10" width="32" height="12" rx="3" style="fill:var(--f-n);stroke:var(--ink)" stroke-width="2"/><circle cx="-9" cy="4" r="4.5" style="fill:var(--ink)"/><circle cx="9" cy="4" r="4.5" style="fill:var(--ink)"/>',
  cart: '<path d="M-16 -12 L-11 2 L12 2 L16 -10 Z" style="fill:var(--card);stroke:var(--ink)" stroke-width="2"/><line x1="-16" y1="-12" x2="-21" y2="-16" style="stroke:var(--ink)" stroke-width="2"/><circle cx="-8" cy="6" r="3.5" style="fill:var(--ink)"/><circle cx="9" cy="6" r="3.5" style="fill:var(--ink)"/>',
  boat: '<path d="M-20 -4 L20 -4 L14 6 L-16 6 Z" style="fill:var(--f-n);stroke:var(--ink)" stroke-width="2"/><rect x="-4" y="-12" width="10" height="8" style="fill:var(--card);stroke:var(--ink)" stroke-width="2"/>',
  dot: '<circle r="9" style="fill:var(--f-a);stroke:var(--ink)" stroke-width="2"/>',
};
function motionPlayer(el, api, cfg) {
  stepHead(el, cfg);
  const segs = cfg.segs, T = segs[segs.length - 1][1];
  const vAt = t => (segs.find(s => t >= s[0] && t < s[1]) || segs[segs.length - 1])[2];
  const xAt = t => { let x = cfg.x0; for (const [a, b, v] of segs) { if (t <= a) break; x += v * (Math.min(t, b) - a); } return x; };
  const knots = [0, ...segs.map(s => s[1])];
  const xpts = knots.map(t => [t, xAt(t)]), vpts = segs.flatMap(([a, b, v]) => [[a, v], [b, v]]);
  const XF = frame(cfg.xg), VF = frame(cfg.vg), [m0, m1] = cfg.track;
  const track = h('div', { class: 'panel track' }), gx = h('div', { class: 'panel' }), gv = h('div', { class: 'panel' }), read = h('div', { class: 'readout' });
  const fbd = cfg.fbd ? h('div', { class: 'panel mini-fbd' }) : null;
  const slider = h('input', { type: 'range', min: 0, max: T, step: T / 400, value: 0, 'aria-label': 'time' });
  const play = h('button', { class: 'btn primary small', onclick: () => { if (t >= T) t = 0; running = !running; } });
  el.append(track, h('div', { class: 'sim' }, gx, gv), h('div', { class: 'row' }, play, h('button', { class: 'btn small', onclick: () => { t = 0; running = true; } }, 'Restart'), h('div', { style: 'flex:1;min-width:140px' }, slider)), h('div', { class: 'sim' }, read, fbd));
  slider.oninput = () => { t = +slider.value; running = false; };
  let t = 0, running = false, done = false; const rate = T / (cfg.seconds || 7);
  const TX = x => 30 + (x - m0) / (m1 - m0) * 340;
  loop(el, dt => {
    if (running) { t = Math.min(T, t + dt * rate); slider.value = t; if (t >= T) running = false; }
    play.textContent = running ? 'Pause' : t >= T ? 'Replay' : 'Play';
    const x = xAt(t), v = vAt(t);
    track.innerHTML = `<svg viewBox="0 0 400 86" role="img" aria-label="position track"><line x1="30" y1="50" x2="370" y2="50" style="stroke:var(--muted)" stroke-width="3"/>
      ${Array.from({ length: 11 }, (_, i) => { const m = m0 + i * (m1 - m0) / 10; return `<line x1="${TX(m)}" y1="46" x2="${TX(m)}" y2="54" style="stroke:var(--muted)"/><text x="${TX(m)}" y="70" text-anchor="middle" style="fill:var(--muted);font:10px var(--mono)">${fmt(m)}</text>`; }).join('')}
      <text x="384" y="74" style="fill:var(--muted);font:10px var(--mono)">m</text>
      <g transform="translate(${TX(x)} 38) scale(${v < 0 ? -1 : 1} 1)">${ICONS[cfg.icon || 'dot']}</g>
      ${Math.abs(v) > 1e-9 ? arrowSVG(TX(x), 16, TX(x) + Math.sign(v) * 28, 16, '--ink', null, 0, 0, 2, null) : ''}</svg>`;
    const cur = (F, pts, val, col) => `<svg viewBox="0 0 ${F.W} ${F.H}" class="plot">${F.s}<polyline points="${polyPts(F, pts)}" fill="none" style="stroke:var(--line)" stroke-width="3" stroke-dasharray="4 4"/>
      <polyline points="${polyPts(F, pts.filter(p => p[0] <= t).concat([[t, val]]))}" fill="none" style="stroke:var(${col})" stroke-width="3.5" stroke-linejoin="round"/><circle cx="${F.X(t)}" cy="${F.Y(val)}" r="6" style="fill:var(${col});stroke:var(--card)" stroke-width="2"/></svg>`;
    gx.innerHTML = cur(XF, xpts, x, '--f-a'); gv.innerHTML = cur(VF, vpts, v, '--f-n');
    const motion = Math.abs(v) < 1e-9 ? 'at rest' : `moving ${v > 0 ? 'right (+)' : 'left (-)'} at a constant ${fmt(Math.abs(v))} m/s`;
    read.innerHTML = `<span class="big">t = ${t.toFixed(1)} s</span><span>x = ${fmt(x)} m</span><span>v = ${fmt(v)} m/s</span><span>${motion}</span>`;
    if (fbd) fbd.innerHTML = miniFBD(cfg.fbd(v)) + `<div class="hint" style="text-align:center">FBD right now: ${Math.abs(v) < 1e-9 ? 'balanced, at rest' : 'balanced, constant velocity'}</div>`;
    if (t >= T && !done) { done = true; api.right(cfg.xp || 10, read); api.done(cfg.note); }
  });
  setTimeout(() => { running = true; }, 400);
}
