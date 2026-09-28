// Inertia Quest — reusable question widgets. Each takes (el, api, cfg).

// SVG arrow with arrowhead and an F-sub label. color is a CSS var name like '--f-g'.
function arrowSVG(x1, y1, x2, y2, color, sub, lx, ly, w = 5) {
  const a = Math.atan2(y2 - y1, x2 - x1), L = 14, s = 8;
  const bx = x2 - Math.cos(a) * L, by = y2 - Math.sin(a) * L;
  const p = [[x2, y2], [bx - Math.sin(a) * s, by + Math.cos(a) * s], [bx + Math.sin(a) * s, by - Math.cos(a) * s]];
  const label = sub == null ? '' : `<text x="${lx}" y="${ly}" style="fill:var(${color});font:700 17px var(--mono)">F<tspan dy="5" style="font-size:12px">${sub}</tspan></text>`;
  return `<g><line x1="${x1}" y1="${y1}" x2="${bx}" y2="${by}" style="stroke:var(${color})" stroke-width="${w}" stroke-linecap="round"/>` +
    `<polygon points="${p.map(q => q.join(',')).join(' ')}" style="fill:var(${color})"/>${label}</g>`;
}

// Small axes graph for answer choices. lines: [{d:'M..', dash:true, color:'--ink'}]
function graphSVG(lines, xl = 'Time (s)', yl = 'Force (N)', extra = '') {
  return `<svg viewBox="0 0 170 110" role="img" aria-label="graph">
  <line x1="24" y1="8" x2="24" y2="92" style="stroke:var(--ink)" stroke-width="2"/>
  <line x1="24" y1="92" x2="164" y2="92" style="stroke:var(--ink)" stroke-width="2"/>
  <text x="160" y="106" text-anchor="end" style="fill:var(--muted);font:10px var(--body)">${xl}</text>
  <text x="12" y="88" transform="rotate(-90 12 88)" style="fill:var(--muted);font:10px var(--body)">${yl}</text>
  ${extra}
  ${lines.map(l => `<path d="${l.d}" fill="none" style="stroke:var(${l.color || '--ink'})" stroke-width="${l.dash ? 3 : 2.5}" ${l.dash ? 'stroke-dasharray="2 5" stroke-linecap="round"' : ''}/>`).join('')}
</svg>`;
}

function stepHead(el, cfg) {
  if (cfg.ctx) el.append(h('p', { class: 'ctx', html: cfg.ctx }));
  if (cfg.q) el.append(h('div', { class: 'q', html: cfg.q }));
  if (cfg.media) el.append(typeof cfg.media === 'string' ? h('div', { html: cfg.media }) : cfg.media);
}
function feedback(el) {
  const fb = h('div', { class: 'pen bad', 'aria-live': 'polite' }); fb.hidden = true; el.append(fb);
  return html => { fb.hidden = !html; fb.innerHTML = html || ''; fb.style.animation = 'none'; void fb.offsetWidth; fb.style.animation = ''; };
}

// Multiple choice. opts: [{t, ok, why, svg}]
function MCQ(el, api, cfg) {
  stepHead(el, cfg);
  const opts = cfg.keepOrder ? cfg.opts : shuffle(cfg.opts);
  const box = h('div', { class: 'opts' }); el.append(box);
  const say = feedback(el);
  const buttons = opts.map(o => {
    const b = h('button', { class: 'opt', html: (o.svg || '') + `<span>${o.t}</span>` });
    b.onclick = () => {
      if (o.ok) {
        b.classList.add('right'); buttons.forEach(x => x.disabled = true); say('');
        api.right(cfg.xp || 10, b); api.done(cfg.explain);
      } else {
        b.classList.add('wrong'); b.disabled = true; api.wrong(b);
        say(o.why || 'Not quite. Try another one.');
        if (cfg.oneShot) {
          buttons.forEach((x, i) => { x.disabled = true; if (opts[i].ok) x.classList.add('right'); });
          api.done(cfg.explain);
        }
      }
    };
    box.append(b); return b;
  });
}

// Numeric answer with sign. ans in given unit.
function NUM(el, api, cfg) {
  stepHead(el, cfg);
  const inp = h('input', { type: 'text', inputmode: 'decimal', autocomplete: 'off', placeholder: 'e.g. -20', 'aria-label': 'Your answer' });
  const flip = h('button', { class: 'btn small', title: 'Flip sign', onclick: () => { inp.value = inp.value.trim().startsWith('-') ? inp.value.trim().slice(1) : '-' + inp.value.trim(); inp.focus(); } }, '+/-');
  const go = h('button', { class: 'btn primary', onclick: check }, 'Check');
  el.append(h('div', { class: 'num-row' }, inp, h('span', { class: 'unit' }, cfg.unit || 'N'), flip, go));
  const say = feedback(el);
  let tries = 0;
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
  setTimeout(() => inp.focus({ preventScroll: true }), 50);
  function check() {
    const raw = inp.value.replace(/[−–]/g, '-').replace(/[^0-9.\-+]/g, '');
    const v = parseFloat(raw);
    if (!isFinite(v)) { say('Type a number first (use - for down or left).'); return; }
    const tol = cfg.tol ?? 0.05;
    if (Math.abs(v - cfg.ans) <= tol) {
      inp.disabled = go.disabled = flip.disabled = true; say('');
      api.right(cfg.xp || 15, go); api.done(cfg.explain); return;
    }
    tries++; api.wrong(inp);
    let msg;
    if (cfg.ans !== 0 && Math.abs(-v - cfg.ans) <= tol) msg = cfg.signMsg || 'Right size, wrong sign! Down and left are negative. Up and right are positive.';
    else if (cfg.ans !== 0 && (Math.abs(v * 10 - cfg.ans) <= tol || Math.abs(v / 10 - cfg.ans) <= tol || Math.abs(-v * 10 - cfg.ans) <= tol || Math.abs(-v / 10 - cfg.ans) <= tol)) msg = 'Off by a factor of 10. Did you multiply by g = -10 N/kg?';
    else msg = cfg.hint || 'Not yet. Write the equation, plug in the values, then solve.';
    if (tries >= 3 || cfg.oneShot) {
      msg += `<br>The answer is <b>${cfg.ans} ${cfg.unit || 'N'}</b>.`;
      inp.disabled = go.disabled = flip.disabled = true; say(msg); api.done(cfg.explain); return;
    }
    say(msg);
  }
}

// Free body diagram builder. need: {up:[keys], down:[], left:[], right:[]}; [] means no force there.
const DIRS = {
  up: { rect: [120, 6, 120, 84], from: [180, 104], to: [180, 26], lab: [194, 40], name: 'up' },
  down: { rect: [120, 204, 120, 90], from: [180, 196], to: [180, 276], lab: [194, 272], name: 'down' },
  left: { rect: [6, 104, 110, 92], from: [124, 150], to: [26, 150], lab: [30, 136], name: 'left' },
  right: { rect: [244, 104, 110, 92], from: [236, 150], to: [334, 150], lab: [276, 136], name: 'right' },
};
function FBD(el, api, cfg) {
  stepHead(el, cfg);
  const placed = { up: null, down: null, left: null, right: null };
  let sel = null, locked = false;
  const svg = h('div', { html: `<svg viewBox="0 0 360 300" role="group" aria-label="Free body diagram. Choose a force, then tap a direction.">
    <g class="scene">${cfg.scene}</g><circle cx="180" cy="150" r="4" style="fill:var(--ink)"/>
    ${Object.entries(DIRS).map(([k, d]) => `<g class="zone" data-dir="${k}" tabindex="0" role="button" aria-label="${k} slot">
      <rect x="${d.rect[0]}" y="${d.rect[1]}" width="${d.rect[2]}" height="${d.rect[3]}" rx="10"/><g class="arr"></g>
      <text class="plus" x="${d.rect[0] + d.rect[2] / 2}" y="${d.rect[1] + d.rect[3] / 2 + 6}" text-anchor="middle" style="fill:var(--muted);font:700 18px var(--mono)">+</text></g>`).join('')}
  </svg>` }).firstElementChild;
  const chips = h('div', { class: 'chips' });
  const side = h('div', { style: 'display:flex;flex-direction:column;gap:12px;min-width:0' },
    h('div', { class: 'hint' }, '1. Tap a force.  2. Tap the direction it points. Tap an arrow again to remove it.'), chips);
  el.append(h('div', { class: 'fbd' }, svg, side));
  const say = feedback(el);
  const check = h('button', { class: 'btn primary', onclick: doCheck }, 'Check my FBD');
  const reset = h('button', { class: 'btn', onclick: () => { for (const k in placed) placed[k] = null; draw(); } }, 'Clear');
  side.append(h('div', { class: 'row' }, check, reset));

  const keys = cfg.palette || ['Fg', 'FN', 'FA', 'Ff', 'Fair', 'Flift', 'Feng', 'Fs'];
  const chipEls = keys.map(k => {
    const f = FORCES[k];
    const c = h('button', { class: 'chip', style: `--c:var(${f.c})`, html: `<b>${f.label}</b><small>${f.name}</small>` });
    c.onclick = () => { if (locked) return; sel = sel === k ? null : k; SFX.click(); paint(); };
    chips.append(c); return c;
  });
  function paint() {
    chipEls.forEach((c, i) => c.classList.toggle('sel', keys[i] === sel));
    svg.classList.toggle('armed', !!sel);
  }
  function draw() {
    svg.querySelectorAll('.zone').forEach(z => {
      const k = z.dataset.dir, d = DIRS[k], f = placed[k];
      z.classList.remove('badz');
      z.querySelector('.plus').style.display = f ? 'none' : '';
      z.querySelector('.arr').innerHTML = f ? arrowSVG(...d.from, ...d.to, FORCES[f].c, FORCES[f].sub, ...d.lab) : '';
      z.setAttribute('aria-label', `${k}: ${f ? FORCES[f].name : 'empty'}`);
    });
  }
  function tapZone(z) {
    if (locked) return;
    const k = z.dataset.dir;
    if (sel) { placed[k] = sel; sel = null; SFX.whoosh(); } else if (placed[k]) { placed[k] = null; SFX.click(); }
    else { say('Pick a force from the list first.'); return; }
    say(''); paint(); draw();
  }
  svg.querySelectorAll('.zone').forEach(z => {
    z.addEventListener('click', () => tapZone(z));
    z.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tapZone(z); } });
  });
  function doCheck() {
    const problems = [];
    for (const k in DIRS) {
      const need = cfg.need[k] || [], got = placed[k];
      let bad = false;
      if (!need.length && got) { bad = true; problems.push(`Nothing should point <b>${k}</b>. Remove that ${FORCES[got].label}.`); }
      else if (need.length && !got) { bad = true; problems.push(`Something is missing pointing <b>${k}</b>.`); }
      else if (got && !need.includes(got)) { bad = true; problems.push(`${FORCES[got].label} doesn't point <b>${k}</b> here.`); }
      if (bad) svg.querySelector(`[data-dir="${k}"]`).classList.add('badz');
    }
    if (problems.length) { api.wrong(svg); say(problems.join('<br>') + (cfg.hint ? '<br>' + cfg.hint : '')); return; }
    locked = true; check.disabled = reset.disabled = true; chipEls.forEach(c => c.disabled = true); sel = null; paint();
    say(''); api.right(cfg.xp || 20, check); api.done(cfg.explain);
  }
  draw();
}

// Two-bin sorting game. cards: [{t, bin (0|1), why}]
function SORT(el, api, cfg) {
  stepHead(el, cfg);
  const cards = shuffle(cfg.cards); let i = 0, busy = false;
  const meter = h('div', { class: 'meter' }, h('i', { style: 'width:0%' }));
  const deck = h('div', { class: 'card-deck' });
  const count = h('div', { class: 'mono hint' });
  const bins = cfg.bins.map((b, j) => h('button', { class: 'btn' + (j ? ' primary' : ''), onclick: () => answer(j) }, (j ? '' : '< ') + b + (j ? ' >' : '')));
  el.append(h('div', { class: 'sorter' }, meter, count, deck, h('div', { class: 'bins' }, bins), h('div', { class: 'hint' }, 'Keyboard: left and right arrow keys')));
  const say = feedback(el);
  const onKey = e => {
    if (!el.isConnected) return document.removeEventListener('keydown', onKey);
    if (e.key === 'ArrowLeft') answer(0); if (e.key === 'ArrowRight') answer(1);
  };
  document.addEventListener('keydown', onKey);
  function show() {
    deck.innerHTML = ''; count.textContent = `Card ${i + 1} of ${cards.length}`;
    deck.append(h('div', { class: 'sort-card', html: cards[i].t }));
  }
  function answer(j) {
    if (busy || i >= cards.length) return; busy = true;
    const c = cards[i], card = deck.firstElementChild;
    const ok = c.bin === j;
    if (ok) { api.right(cfg.xp || 5, bins[j]); say(''); }
    else { api.wrong(card); say(`That one is <b>${cfg.bins[c.bin]}</b>. ${c.why || ''}`); }
    setTimeout(() => {
      card.classList.add(c.bin ? 'fly-r' : 'fly-l');
      setTimeout(() => {
        i++; meter.firstChild.style.width = (100 * i / cards.length) + '%'; busy = false;
        if (i < cards.length) show();
        else { document.removeEventListener('keydown', onKey); bins.forEach(b => b.disabled = true); deck.innerHTML = ''; count.textContent = 'Deck cleared!'; api.done(cfg.explain); }
      }, 330);
    }, ok ? 120 : 1200);
  }
  show();
}
