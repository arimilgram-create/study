// Case shop: spend XP on cases, spin the reel, win cosmetics.
const CASES = [
  { id: 'rest', name: 'Rest Case', price: 150, c: '--f-n', blurb: 'The starter case. Mostly commons, small shot at something shiny.', odds: { common: 70, rare: 22, epic: 6.5, legendary: 1.3, mythic: 0.2 } },
  { id: 'momentum', name: 'Momentum Case', price: 300, c: '--f-a', blurb: 'Better odds at epics and legendaries.', odds: { common: 45, rare: 33, epic: 16, legendary: 5, mythic: 1 } },
  { id: 'newton', name: 'Newton Case', price: 600, c: '--pen', blurb: 'No commons at all. Real odds at mythics.', odds: { rare: 45, epic: 35, legendary: 16, mythic: 4 } },
];
function rollRarity(odds) { let r = Math.random() * 100; for (const [k, w] of Object.entries(odds)) if ((r -= w) < 0) return k; return Object.keys(odds)[0]; }
const rollItem = c => pick(ITEMS.filter(i => i.r === rollRarity(c.odds)));
const priceOf = c => c.id === 'rest' && Game.state.freeCase ? 0 : c.price;
function caseSVG(c) {
  return `<svg viewBox="0 0 120 90" role="img" aria-label="${c.name}"><rect x="8" y="22" width="104" height="60" rx="8" style="fill:var(${c.c})" stroke="#1b1f27" stroke-width="3"/>
    <rect x="4" y="12" width="112" height="18" rx="5" style="fill:var(${c.c})" stroke="#1b1f27" stroke-width="3"/><rect x="52" y="10" width="16" height="72" fill="#1b1f27" opacity=".25"/>
    <text x="60" y="66" text-anchor="middle" fill="#fff" style="font:700 30px var(--display)">?</text></svg>`;
}
function tile(it) {
  return h('div', { class: 'tile', style: `--rc:var(${RARITY[it.r].c})` }, h('div', { class: 'ti-icon', html: itemIcon(it) }), h('span', {}, it.name));
}

Game.shop = function () {
  const s = this.state, app = $('#app'); app.innerHTML = '';
  app.append(h('div', { class: 'lvl-head' }, h('button', { class: 'btn small', onclick: () => this.map() }, '< Map'),
    h('h2', {}, 'Case Shop'), h('span', { class: 'mono' }, `XP to spend: ${s.wallet}`)));
  app.append(h('p', { class: 'ctx', style: 'margin:0 0 16px' }, 'Spend the XP you earn studying. Every case holds cosmetics for your character: hats, outfits, sidekicks, titles, arrow skins for your FBDs, confetti, and backgrounds. Duplicates turn back into XP.'));
  app.append(h('div', { class: 'grid cases' }, CASES.map(c => {
    const p = priceOf(c);
    return h('div', { class: 'station case-card', style: `--cc:var(${c.c})` },
      h('div', { class: 'case-art', html: caseSVG(c) }), h('h2', {}, c.name), h('p', {}, c.blurb),
      h('ul', { class: 'odds' }, Object.entries(c.odds).map(([r, w]) => h('li', { style: `color:var(${RARITY[r].c})` }, h('span', {}, RARITY[r].name), h('b', {}, w + '%')))),
      h('button', { class: 'btn primary', disabled: s.wallet < p, onclick: () => this.openCase(c) }, p === 0 ? 'Open FREE' : `Open for ${p} XP`));
  })));
  const owned = ITEMS.filter(i => s.inv[i.id]).length;
  app.append(h('div', { class: 'row', style: 'margin-top:18px' }, h('span', { class: 'mono' }, `Collection: ${owned} / ${ITEMS.length} items. Cases opened: ${s.opened}.`),
    h('button', { class: 'btn small', onclick: () => this.character('locker') }, 'Go to your locker')));
  scrollTo(0, 0);
};

Game.openCase = function (c) {
  const s = this.state, p = priceOf(c);
  if (s.wallet < p) return;
  s.wallet -= p; if (c.id === 'rest') s.freeCase = false; s.opened++;
  const win = rollItem(c), dup = !!s.inv[win.id];
  s.inv[win.id] = (s.inv[win.id] || 0) + 1;
  if (dup) s.wallet += RARITY[win.r].refund;
  saveState(); this.hud(); SFX.click();

  const app = $('#app'); app.innerHTML = '';
  const STEP = 128, N = 60, WIN = 52;
  const strip = h('div', { class: 'strip' });
  for (let i = 0; i < N; i++) strip.append(tile(i === WIN ? win : rollItem(c)));
  const reel = h('div', { class: 'reel', title: 'Tap to skip' }, strip, h('div', { class: 'marker' }));
  const out = h('div', { class: 'reel-out' });
  app.append(h('div', { class: 'lvl-head' }, h('button', { class: 'btn small', onclick: () => this.shop() }, '< Shop'), h('h2', {}, `Opening: ${c.name}`)),
    h('section', { class: 'step' }, reel, out));
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const W = reel.clientWidth, target = WIN * STEP + 60 - W / 2 + (Math.random() - .5) * 90;
  const dur = reduce ? 400 : 5200, t0 = performance.now(); let lastIdx = -1, done = false;
  reel.onclick = () => { if (!done) finish(); };
  function frame(t) {
    if (done || !reel.isConnected) return;
    const k = Math.min(1, (t - t0) / dur), x = target * (1 - Math.pow(1 - k, 4));
    strip.style.transform = `translateX(${-x}px)`;
    const idx = Math.floor((x + W / 2) / STEP); if (idx !== lastIdx) { lastIdx = idx; SFX.tick(); }
    if (k < 1) requestAnimationFrame(frame); else finish();
  }
  requestAnimationFrame(frame);
  const finish = () => {
    done = true; strip.style.transform = `translateX(${-target}px)`;
    strip.children[WIN].classList.add('won');
    const big = win.r === 'legendary' || win.r === 'mythic';
    SFX.win(); confetti(big ? 2 : 1);
    const equipped = s.equip[win.slot] === win.id;
    out.append(h('div', { class: 'drop', style: `--rc:var(${RARITY[win.r].c})` },
      h('div', { class: 'drop-icon', html: itemIcon(win) }),
      h('div', { class: 'drop-info' },
        h('span', { class: 'rarity' }, `${RARITY[win.r].name} ${SLOTS[win.slot].replace(/s$/, '')}`),
        h('h2', {}, win.name), h('p', { html: win.d }),
        h('p', { class: 'mono' }, dup ? `Duplicate! Converted to +${RARITY[win.r].refund} XP.` : 'NEW! Added to your locker.'),
        h('div', { class: 'row' },
          !dup || !equipped ? h('button', { class: 'btn primary', onclick: e => { s.equip[win.slot] = win.id; saveState(); this.hud(); SFX.good(); e.target.disabled = true; e.target.textContent = 'Equipped!'; } }, 'Equip it') : null,
          h('button', { class: 'btn', disabled: s.wallet < priceOf(c), onclick: () => this.openCase(c) }, `Open another (${priceOf(c) || 'FREE'}${priceOf(c) ? ' XP' : ''})`),
          h('button', { class: 'btn', onclick: () => this.character('locker') }, 'Locker'),
          h('button', { class: 'btn', onclick: () => this.shop() }, 'Shop')))));
  };
};
