// Case shop: spend XP or chips on cases, spin the reel, win cosmetics (some shiny). Duplicates trade in for chips.
const CHIP_VALUE = { common: 10, rare: 30, epic: 80, legendary: 250, mythic: 800 };
const chipValue = (it, shiny) => CHIP_VALUE[it.r] * (shiny ? 4 : 1);
const CASES = [
  { id: 'rest', name: 'Rest Case', price: 150, chips: 60, c: '--f-n', shiny: 1 / 14, blurb: 'The starter case. Mostly commons, small shot at something shiny.', odds: { common: 70, rare: 22, epic: 6.5, legendary: 1.3, mythic: 0.2 } },
  { id: 'velocity', name: 'Velocity Case', price: 250, chips: 100, c: '--f-lift', shiny: 1 / 8, pool: it => it.set === 'v', isNew: true, blurb: 'NEW. Only items from the Constant Velocity unit: Tom the Cat, Jayla\'s Boat, the Space Shuttle. Best shiny odds.', odds: { common: 50, rare: 30, epic: 14, legendary: 5, mythic: 1 } },
  { id: 'momentum', name: 'Momentum Case', price: 300, chips: 120, c: '--f-a', shiny: 1 / 12, blurb: 'Better odds at epics and legendaries.', odds: { common: 45, rare: 33, epic: 16, legendary: 5, mythic: 1 } },
  { id: 'newton', name: 'Newton Case', price: 600, chips: 240, c: '--pen', shiny: 1 / 10, blurb: 'No commons at all. Real odds at mythics.', odds: { rare: 45, epic: 35, legendary: 16, mythic: 4 } },
];
function rollRarity(odds) { let r = Math.random() * 100; for (const [k, w] of Object.entries(odds)) if ((r -= w) < 0) return k; return Object.keys(odds)[0]; }
const poolOf = c => ITEMS.filter(i => !c.pool || c.pool(i));
function rollItem(c) {
  const r = rollRarity(c.odds); let pool = poolOf(c).filter(i => i.r === r); if (!pool.length) pool = ITEMS.filter(i => i.r === r);
  return { it: pick(pool), shiny: Math.random() < c.shiny };
}
const payMode = () => Game.payMode || 'xp';
const costOf = (c, n = 1) => payMode() === 'chips' ? c.chips * n : (c.id === 'rest' && Game.state.freeCase && n === 1 ? 0 : c.price * n);
const canPay = (c, n) => (payMode() === 'chips' ? Game.state.chips : Game.state.wallet) >= costOf(c, n);
function caseSVG(c) {
  return `<svg viewBox="0 0 120 90" role="img" aria-label="${c.name}"><rect x="8" y="22" width="104" height="60" rx="8" style="fill:var(${c.c})" stroke="#1b1f27" stroke-width="3"/>
    <rect class="lid" x="4" y="12" width="112" height="18" rx="5" style="fill:var(${c.c})" stroke="#1b1f27" stroke-width="3"/><rect x="52" y="10" width="16" height="72" fill="#1b1f27" opacity=".25"/>
    <text x="60" y="66" text-anchor="middle" fill="#fff" style="font:700 30px var(--display)">?</text></svg>`;
}
function tile(it, shiny) {
  return h('div', { class: 'tile' + (shiny ? ' shiny' : ''), style: `--rc:var(${RARITY[it.r].c})` }, h('div', { class: 'ti-icon', html: itemIcon(it) }), h('span', {}, it.name));
}
function addItem(it, shiny) {
  const s = Game.state, dup = (s.inv[it.id] || 0) > 0;
  s.inv[it.id] = (s.inv[it.id] || 0) + 1; if (shiny) s.shinyInv[it.id] = (s.shinyInv[it.id] || 0) + 1;
  return dup;
}
// Sells one copy for chips. Returns chips gained (0 if nothing to sell).
function tradeIn(id, shiny) {
  const s = Game.state, it = ITEM[id], n = s.inv[id] || 0, ns = s.shinyInv[id] || 0;
  if (shiny ? ns < 1 : n - ns < 1) return 0;
  s.inv[id] = n - 1; if (shiny) s.shinyInv[id] = ns - 1;
  if (!s.inv[id] && s.equip[it.slot] === id) delete s.equip[it.slot];
  if (shiny && !s.shinyInv[id] && s.equip.shiny) s.equip.shiny[it.slot] = false;
  const v = chipValue(it, shiny); s.chips += v; saveState(); Game.hud(); return v;
}
function equipItem(it, shiny) {
  const s = Game.state; s.equip[it.slot] = it.id; s.equip.shiny = s.equip.shiny || {}; s.equip.shiny[it.slot] = !!shiny; saveState(); Game.hud();
}

Game.shop = function (openContents) {
  const s = this.state, app = $('#app'); app.innerHTML = '';
  const pay = k => h('button', { class: 'btn small' + (payMode() === k ? ' on' : ''), onclick: () => { this.payMode = k; this.shop(); } }, k === 'xp' ? `Pay with XP (${s.wallet})` : `Pay with chips (${s.chips})`);
  app.append(h('div', { class: 'lvl-head' }, h('button', { class: 'btn small', onclick: () => this.map() }, '< Map'), h('h2', {}, 'Case Shop'), pay('xp'), pay('chips')));
  app.append(h('p', { class: 'ctx', style: 'margin:0 0 16px' }, 'Spend XP from studying (or chips from the casino). Every pull is a cosmetic for your character. Some come out SHINY. Duplicates stay in your locker so you can trade them in for chips.'));
  app.append(h('div', { class: 'grid cases' }, CASES.map(c => {
    const p1 = costOf(c, 1), p5 = costOf(c, 5), unit = payMode() === 'chips' ? 'chips' : 'XP';
    const contents = h('div', { class: 'contents' }); contents.hidden = openContents !== c.id;
    if (!contents.hidden) contents.append(...Object.keys(RARITY).filter(r => c.odds[r]).map(r => h('div', {},
      h('div', { class: 'rarity', style: `--rc:var(${RARITY[r].c})` }, `${RARITY[r].name} (${c.odds[r]}%)`),
      h('div', { class: 'mini-tiles' }, poolOf(c).filter(i => i.r === r).map(i => { const t = tile(i); if (s.inv[i.id]) t.classList.add('owned'); return t; })))));
    return h('div', { class: 'station case-card', style: `--cc:var(${c.c})` },
      c.isNew ? h('span', { class: 'new-badge' }, 'NEW') : null,
      h('div', { class: 'case-art', html: caseSVG(c) }), h('h2', {}, c.name), h('p', {}, c.blurb),
      h('ul', { class: 'odds' }, Object.entries(c.odds).map(([r, w]) => h('li', { style: `color:var(${RARITY[r].c})` }, h('span', {}, RARITY[r].name), h('b', {}, w + '%'))),
        h('li', { class: 'shiny-odds' }, h('span', {}, 'Shiny chance'), h('b', {}, `1 in ${Math.round(1 / c.shiny)}`))),
      h('div', { class: 'row' },
        h('button', { class: 'btn primary', disabled: !canPay(c, 1), onclick: () => this.openCase(c, 1) }, p1 === 0 ? 'Open FREE' : `Open (${p1} ${unit})`),
        h('button', { class: 'btn', disabled: !canPay(c, 5), onclick: () => this.openCase(c, 5) }, `x5 (${p5})`)),
      h('button', { class: 'btn small ghost-link', onclick: () => this.shop(contents.hidden ? c.id : null) }, contents.hidden ? 'See what\'s inside' : 'Hide contents'), contents);
  })));
  const owned = ITEMS.filter(i => s.inv[i.id]).length;
  app.append(h('div', { class: 'row', style: 'margin-top:18px' }, h('span', { class: 'mono' }, `Collection: ${owned} / ${ITEMS.length}. Cases opened: ${s.opened}.`),
    h('button', { class: 'btn small', onclick: () => this.character('locker') }, 'Locker'), h('button', { class: 'btn small', onclick: () => this.casino() }, 'Casino')));
  scrollTo(0, 0);
};

Game.openCase = function (c, n = 1) {
  const s = this.state; if (!canPay(c, n)) return;
  const cost = costOf(c, n);
  if (payMode() === 'chips') s.chips -= cost; else { s.wallet -= cost; if (c.id === 'rest' && n === 1) s.freeCase = false; }
  s.opened += n;
  const wins = Array.from({ length: n }, () => { const w = rollItem(c); w.dup = addItem(w.it, w.shiny); return w; });
  saveState(); this.hud();
  const app = $('#app'); app.innerHTML = '';
  const stage = h('section', { class: 'step' });
  app.append(h('div', { class: 'lvl-head' }, h('button', { class: 'btn small', onclick: () => this.shop() }, '< Shop'), h('h2', {}, `Opening: ${c.name}${n > 1 ? ' x' + n : ''}`)), stage);
  const art = h('div', { class: 'case-art opening', html: caseSVG(c) });
  stage.append(art); SFX.click();
  setTimeout(() => { if (!stage.isConnected) return; art.remove(); n === 1 ? this.reel(c, wins[0], stage) : this.multi(c, wins, stage); }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 50 : 750);
};

function flash(rc) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const f = h('div', { class: 'flash', style: `--rc:var(${rc})` }); document.body.append(f); setTimeout(() => f.remove(), 900);
}
function celebrate(w) {
  const big = w.it.r === 'legendary' || w.it.r === 'mythic';
  if (big || w.shiny) { flash(RARITY[w.it.r].c); tone([523, 659, 784, 1047, 784, 1047, 1319, 1568, 2093], 0.08); confetti(big ? 2.2 : 1.4); }
  else if (w.it.r === 'epic') { flash(RARITY.epic.c); SFX.win(); confetti(1); }
  else { SFX.good(); }
}

Game.reel = function (c, w, stage) {
  const STEP = 128, N = 64, WIN = 56, strip = h('div', { class: 'strip' });
  for (let i = 0; i < N; i++) { if (i === WIN) strip.append(tile(w.it, w.shiny)); else { const r = rollItem(c); strip.append(tile(r.it, r.shiny)); } }
  const reel = h('div', { class: 'reel', title: 'Tap to skip' }, strip, h('div', { class: 'marker' }));
  const out = h('div', { class: 'reel-out' });
  stage.append(reel, out);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const W = reel.clientWidth, target = WIN * STEP + 60 - W / 2 + (Math.random() - .5) * 96;
  const dur = reduce ? 400 : 6000, t0 = performance.now(); let lastIdx = -1, done = false;
  const finish = () => {
    if (done) return; done = true; strip.style.transform = `translateX(${-target}px)`;
    strip.children[WIN].classList.add('won'); celebrate(w); out.append(this.dropCard(c, w));
  };
  reel.onclick = finish;
  (function frame(t) {
    if (done || !reel.isConnected) return;
    const k = Math.min(1, (t - t0) / dur), x = target * (1 - Math.pow(1 - k, 4.2));
    strip.style.transform = `translateX(${-x}px)`;
    const idx = Math.floor((x + W / 2) / STEP); if (idx !== lastIdx) { lastIdx = idx; SFX.tick(); }
    if (k < 1) requestAnimationFrame(frame); else finish();
  })(t0);
};

Game.dropCard = function (c, w) {
  const s = this.state, it = w.it, val = chipValue(it, w.shiny);
  const card = h('div', { class: 'drop' + (w.shiny ? ' shiny' : ''), style: `--rc:var(${RARITY[it.r].c})` },
    h('div', { class: 'drop-icon', html: itemIcon(it) }),
    h('div', { class: 'drop-info' },
      h('span', { class: 'rarity' }, `${w.shiny ? 'SHINY ' : ''}${RARITY[it.r].name} ${SLOTS[it.slot].replace(/s$/, '')}`),
      h('h2', {}, it.name), h('p', { html: it.d }),
      h('p', { class: 'mono' }, `${w.dup ? 'Duplicate. ' : 'NEW! '}Trade-in value: ${val} chips.`),
      h('div', { class: 'row' },
        h('button', { class: 'btn primary', onclick: e => { equipItem(it, w.shiny); SFX.good(); e.target.disabled = true; e.target.textContent = 'Equipped!'; } }, 'Equip it'),
        h('button', { class: 'btn', onclick: e => { const g = tradeIn(it.id, w.shiny); if (g) { xpPop(`+${g} chips`, e.target, 'chip'); SFX.good(); e.target.disabled = true; e.target.textContent = `Traded: +${g} chips`; } } }, `Trade in (+${val})`),
        h('button', { class: 'btn', disabled: !canPay(c, 1), onclick: () => this.openCase(c, 1) }, `Open another (${costOf(c, 1) || 'FREE'})`),
        h('button', { class: 'btn', onclick: () => this.shop() }, 'Shop'))));
  return card;
};

Game.multi = function (c, wins, stage) {
  const grid = h('div', { class: 'multi' }); stage.append(grid);
  const cards = wins.map(w => { const f = h('div', { class: 'flip', style: `--rc:var(${RARITY[w.it.r].c});--cc:var(${c.c})` }, h('div', { class: 'flip-in' }, h('div', { class: 'flip-back', html: caseSVG(c) }), h('div', { class: 'flip-front' }, tile(w.it, w.shiny)))); grid.append(f); return f; });
  const order = wins.map((w, i) => i).sort((a, b) => Object.keys(RARITY).indexOf(wins[a].it.r) - Object.keys(RARITY).indexOf(wins[b].it.r));
  let k = 0; const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const next = () => {
    if (!stage.isConnected) return;
    if (k < order.length) { const i = order[k++]; cards[i].classList.add('open'); SFX.tick(); if (k === order.length) celebrate(wins[i]); else if (wins[i].it.r !== 'common') tone([660 + k * 80], 0.06); setTimeout(next, reduce ? 60 : 520); return; }
    const total = wins.reduce((a, w) => a + chipValue(w.it, w.shiny), 0);
    const tradeAll = h('button', { class: 'btn', onclick: () => { let g = 0; wins.forEach(w => g += tradeIn(w.it.id, w.shiny)); xpPop(`+${g} chips`, tradeAll, 'chip'); SFX.good(); tradeAll.disabled = true; tradeAll.textContent = `Traded: +${g} chips`; } }, `Trade in all 5 (+${total} chips)`);
    stage.append(h('div', { class: 'row', style: 'justify-content:center;margin-top:14px' }, tradeAll,
      h('button', { class: 'btn primary', disabled: !canPay(c, 5), onclick: () => this.openCase(c, 5) }, `Open 5 more (${costOf(c, 5)})`),
      h('button', { class: 'btn', onclick: () => this.character('locker') }, 'Locker'), h('button', { class: 'btn', onclick: () => this.shop() }, 'Shop')));
  };
  setTimeout(next, 300);
};
