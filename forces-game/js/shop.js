// Case shop: buy cases with XP or chips, watch them open, then keep, equip, or sell what you get.

const payMode = () => Game.payMode || 'xp';
const costOf = (c, n = 1) => payMode() === 'chips' ? c.chips * n : (c.id === 'rest' && Game.state.freeCase && n === 1 ? 0 : c.price * n);
const canPay = (c, n) => (payMode() === 'chips' ? Game.state.chips : Game.state.wallet) >= costOf(c, n);
function caseSVG(c) {
  return `<svg viewBox="0 0 120 90" role="img" aria-label="${c.name}"><rect x="8" y="22" width="104" height="60" rx="8" style="fill:var(${c.c})" stroke="#1b1f27" stroke-width="3"/>
    <rect class="lid" x="4" y="12" width="112" height="18" rx="5" style="fill:var(${c.c})" stroke="#1b1f27" stroke-width="3"/><rect x="52" y="10" width="16" height="72" fill="#1b1f27" opacity=".25"/>
    <text x="60" y="66" text-anchor="middle" fill="#fff" style="font:700 30px var(--display)">?</text></svg>`;
}
function tile(it, shiny) {
  return h('div', { class: 'tile' + (shiny ? ' shiny' : ''), style: `--rc:var(${RARITY[it.r].c})` }, h('div', { class: 'ti-icon', html: itemIcon(it) }), h('span', {}, shiny ? `${it.name} ✦` : it.name));
}
function addItem(it, shiny) {
  const s = Game.state, dup = (s.inv[it.id] || 0) > 0;
  s.inv[it.id] = (s.inv[it.id] || 0) + 1; if (shiny) s.shinyInv[it.id] = (s.shinyInv[it.id] || 0) + 1;
  s.recentIds = [it.id, ...(s.recentIds || []).filter(x => x !== it.id)].slice(0, 30);
  return dup;
}
// Sells one copy for chips. Returns the chips gained (0 if there was nothing to sell).
function tradeIn(id, shiny) {
  const s = Game.state, it = ITEM[id], n = s.inv[id] || 0, ns = s.shinyInv[id] || 0;
  if (it.noTrade || (shiny ? ns < 1 : n - ns < 1)) return 0;
  s.inv[id] = n - 1; if (shiny) s.shinyInv[id] = ns - 1;
  if (!s.inv[id] && s.equip[it.slot] === id) { delete s.equip[it.slot]; if (s.equip.shiny) s.equip.shiny[it.slot] = false; }
  if (shiny && !s.shinyInv[id] && s.equip.shiny) s.equip.shiny[it.slot] = false;
  const v = chipValue(it, shiny); s.chips += v; saveState(); Game.hud(); return v;
}
function equipItem(it, shiny) {
  const s = Game.state; s.equip[it.slot] = it.id; s.equip.shiny = s.equip.shiny || {}; s.equip.shiny[it.slot] = !!shiny; saveState(); Game.hud();
}

// ---------- the shop ----------
Game.shop = function (openContents) {
  const s = this.state, app = $('#app'); app.innerHTML = '';
  const pay = k => h('button', { class: 'btn small' + (payMode() === k ? ' on' : ''), onclick: () => { this.payMode = k; this.shop(openContents); } }, k === 'xp' ? `Pay with XP (${s.wallet})` : `Pay with chips (${s.chips})`);
  app.append(h('div', { class: 'lvl-head' }, h('button', { class: 'btn small', onclick: () => this.map() }, '< Map'), h('h2', {}, 'Case Shop'), pay('xp'), pay('chips')));
  const pity = s.pity || 0;
  app.append(h('div', { class: 'pity' },
    h('div', { class: 'bar' }, h('i', { style: `width:${Math.min(100, pity / PITY_AT * 100)}%` })),
    h('span', { class: 'mono' }, `Epic-or-better guaranteed in ${Math.max(0, PITY_AT - pity)} more cases. Chips to XP: 1 to 1 (Casino, Exchange tab).`)));
  app.append(h('div', { class: 'grid cases' }, CASES.map(c => {
    const contents = h('div', { class: 'contents' }); contents.hidden = openContents !== c.id;
    if (!contents.hidden) {
      const total = Object.values(c.odds).reduce((a, x) => a + x, 0);
      contents.append(...RARITY_LIST.filter(r => c.odds[r]).map(r => h('div', {},
        h('div', { class: 'rarity', style: `--rc:var(${RARITY[r].c})` }, `${RARITY[r].name} · ${(c.odds[r] / total * 100).toFixed(c.odds[r] / total < 0.01 ? 1 : 0)}%`),
        h('div', { class: 'mini-tiles' }, poolOf(c).filter(i => i.r === r).map(i => { const t = tile(i, false); if (s.inv[i.id]) t.classList.add('owned'); return t; })))));
      contents.append(h('p', { class: 'hint' }, `Bonus bag: ${Math.round(c.bonus * 100)}% chance of ${Math.round(c.chips * 0.4)}-${Math.round(c.chips)} chips with the item. Shiny: 1 in ${Math.round(1 / c.shiny)}, worth 4x chips and a glow.`));
    }
    const total = Object.values(c.odds).reduce((a, x) => a + x, 0);
    return h('div', { class: 'station case-card', style: `--cc:var(${c.c})` },
      c.isNew ? h('span', { class: 'new-badge' }, 'NEW') : null,
      h('div', { class: 'case-art', html: caseSVG(c) }), h('h2', {}, c.name), h('p', {}, c.blurb),
      h('ul', { class: 'odds' }, RARITY_LIST.filter(r => c.odds[r]).map(r => h('li', { style: `--rc:var(${RARITY[r].c})` },
        h('span', {}, RARITY[r].name), h('i', { style: `width:${Math.max(3, c.odds[r] / total * 100)}%` }), h('b', {}, `${(c.odds[r] / total * 100).toFixed(c.odds[r] / total < 0.01 ? 1 : 0)}%`)))),
      h('div', { class: 'row' },
        h('button', { class: 'btn primary', disabled: !canPay(c, 1), onclick: () => this.openCase(c, 1) }, costOf(c, 1) === 0 ? 'Open FREE' : `Open (${costOf(c, 1)})`),
        h('button', { class: 'btn', disabled: !canPay(c, 5), onclick: () => this.openCase(c, 5) }, `x5 (${costOf(c, 5)})`),
        h('button', { class: 'btn', disabled: !canPay(c, 10), onclick: () => this.openCase(c, 10) }, `x10 (${costOf(c, 10)})`)),
      h('button', { class: 'btn small ghost-link', onclick: () => this.shop(contents.hidden ? c.id : null) }, contents.hidden ? 'See what\'s inside' : 'Hide contents'), contents);
  })));
  const hist = s.hist || [];
  if (hist.length) app.append(h('div', { class: 'recent' }, h('span', { class: 'k' }, 'Recent pulls'),
    h('div', { class: 'recent-row' }, hist.map(x => h('span', { class: 'pill', style: `--rc:var(${RARITY[x.r].c})` }, `${x.shiny ? '✦ ' : ''}${x.name}`)))));
  const owned = ITEMS.filter(i => s.inv[i.id]).length;
  app.append(h('div', { class: 'row', style: 'margin-top:18px' }, h('span', { class: 'mono' }, `Collection: ${owned} / ${ITEMS.length}. Cases opened: ${s.opened}.`),
    h('button', { class: 'btn small', onclick: () => this.character('locker') }, 'Locker'), h('button', { class: 'btn small', onclick: () => this.casino() }, 'Casino')));
  scrollTo(0, 0);
};

// ---------- opening ----------
Game.openCase = function (c, n = 1) {
  const s = this.state; if (!canPay(c, n)) return;
  const cost = costOf(c, n);
  if (payMode() === 'chips') s.chips -= cost; else { s.wallet -= cost; if (c.id === 'rest' && n === 1) s.freeCase = false; }
  s.opened += n;
  const results = [];
  for (let i = 0; i < n; i++) {
    const drops = rollCase(c);
    s.pity = drops.some(d => d.kind === 'item' && HIGH.includes(d.it.r)) ? 0 : (s.pity || 0) + 1;
    for (const d of drops) { if (d.kind === 'item') d.dup = addItem(d.it, d.shiny); else s.chips += d.amount; pushHist(d, c); }
    results.push(drops);
  }
  saveState(); this.hud();
  this.stage(c, results);
};

// The full show: the case shakes, the lid pops, then the reel or the card grid, then the reveal.
Game.stage = async function (c, results) {
  const app = $('#app'); app.innerHTML = '';
  const ctl = { skip: false }, reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stage = h('section', { class: 'stage' });
  app.append(h('div', { class: 'lvl-head' }, h('button', { class: 'btn small', onclick: () => this.shop() }, '< Shop'),
    h('h2', {}, `${c.name}${results.length > 1 ? ` x${results.length}` : ''}`),
    h('button', { class: 'btn small', onclick: () => { ctl.skip = true; } }, 'Skip')), stage);
  const wait = ms => new Promise(res => setTimeout(res, ctl.skip || reduce ? 0 : ms));
  const art = h('div', { class: 'case-art big', html: caseSVG(c) });
  stage.append(art);
  const top = results.flat().reduce((best, d) => d.kind === 'item' && RARITY_LIST.indexOf(d.it.r) > RARITY_LIST.indexOf(best) ? d.it.r : best, 'common');
  for (let i = 0; i < 7 && !ctl.skip && !reduce; i++) { FX.shake(art, 0.5 + i * 0.25 * (RARITY_LIST.indexOf(top) + 1) / 3); await wait(110); }
  art.classList.add('open'); SFX.boom(); FX.flash(`var(${c.c})`, 600); FX.burst([css(c.c)], 40, innerWidth / 2, innerHeight * 0.3);
  await wait(650); art.remove();
  if (results.length === 1) await this.reel(c, results[0], stage, ctl);
  else await this.multi(c, results, stage, ctl);
};

Game.reel = function (c, drops, stage, ctl) {
  return new Promise(resolve => {
    const item = drops.find(d => d.kind === 'item'), STEP = 128, N = 64, WIN = 56;
    const strip = h('div', { class: 'strip' });
    for (let i = 0; i < N; i++) {
      if (i === WIN) { strip.append(tile(item.it, item.shiny)); continue; }
      const r = rollRarity(c.odds), p = poolOf(c).filter(x => x.r === r);
      strip.append(tile(pick(p.length ? p : ITEMS.filter(x => x.r === r)), false));
    }
    const reel = h('div', { class: 'reel', title: 'Tap to skip' }, strip, h('div', { class: 'marker' }));
    stage.append(reel);
    const W = reel.clientWidth || 360, target = WIN * STEP + STEP / 2 - W / 2 + (Math.random() - 0.5) * 80;
    const dur = matchMedia('(prefers-reduced-motion: reduce)').matches ? 300 : 5200, t0 = performance.now();
    let last = -1, done = false;
    const finish = () => {
      if (done) return; done = true;
      strip.style.transform = `translateX(${-target}px)`; strip.children[WIN].classList.add('won');
      reel.classList.add('settled');
      revealFX(item, stage);
      stage.append(this.dropCard(c, drops, stage));
      resolve();
    };
    reel.onclick = () => { ctl.skip = true; finish(); };
    const frame = t => {
      if (done) return;
      if (ctl.skip || !reel.isConnected) return finish();
      const k = Math.min(1, (t - t0) / dur), x = target * (1 - Math.pow(1 - k, 4));
      strip.style.transform = `translateX(${-x}px)`;
      const idx = Math.floor((x + W / 2) / STEP); if (idx !== last) { last = idx; SFX.tick(); }
      if (k < 1) requestAnimationFrame(frame); else finish();
    };
    requestAnimationFrame(frame);
  });
};

Game.multi = function (c, results, stage, ctl) {
  return new Promise(resolve => {
    const flat = results.map(drops => drops.find(d => d.kind === 'item'));
    const grid = h('div', { class: 'multi' }), bar = h('div', { class: 'row', style: 'justify-content:center;margin-top:12px' });
    let opened = 0, finished = false;
    const cards = flat.map((d, i) => {
      const card = h('button', { class: 'flip ' + (d.dup ? 'dup' : 'new') + (d.shiny ? ' shiny' : ''), 'aria-label': `Reveal card ${i + 1}`, style: `--rc:var(${RARITY[d.it.r].c});--cc:var(${c.c})`, onclick: () => reveal(i) },
        h('div', { class: 'flip-in' }, h('div', { class: 'flip-back', html: caseSVG(c) }), h('div', { class: 'flip-front' }, tile(d.it, d.shiny))));
      grid.append(card); return card;
    });
    stage.append(grid);
    const revealAll = h('button', { class: 'btn primary', onclick: () => { ctl.skip = true; cards.forEach((_, i) => reveal(i, true)); } }, 'Reveal all');
    bar.append(revealAll); stage.append(bar);
    function reveal(i, quiet) {
      if (cards[i].classList.contains('open')) return;
      cards[i].classList.add('open'); opened++; if (!quiet) SFX.tick();
      if (opened === flat.length && !finished) finishAll();
    }
    const finishAll = () => {
      finished = true; bar.remove();
      const best = flat.reduce((b, d) => RARITY_LIST.indexOf(d.it.r) > RARITY_LIST.indexOf(b.it.r) || (d.shiny && !b.shiny && d.it.r === b.it.r) ? d : b, flat[0]);
      revealFX(best, stage);
      const total = flat.reduce((a, d) => a + chipValue(d.it, d.shiny), 0), bonus = results.flat().filter(d => d.kind === 'chips').reduce((a, d) => a + d.amount, 0);
      const dupes = flat.filter(d => d.dup).length;
      const tradeAll = h('button', { class: 'btn', disabled: !dupes, onclick: () => {
        let g = 0; flat.forEach(d => { if (d.dup) g += tradeIn(d.it.id, d.shiny); });
        xpPop(`+${g} chips`, tradeAll, 'chip'); SFX.good(); tradeAll.textContent = `Sold ${dupes} duplicates for ${g}`; tradeAll.disabled = true;
      } }, dupes ? `Sell ${dupes} duplicate${dupes > 1 ? 's' : ''}` : 'No duplicates');
      stage.append(h('div', { class: 'summary pop' },
        h('div', {}, h('b', {}, `${flat.length} pulls`), h('span', { class: 'mono' }, ` · value ${total} chips${bonus ? ` · bonus bags +${bonus} chips` : ''}`)),
        h('div', { class: 'row', style: 'justify-content:center' }, tradeAll,
          h('button', { class: 'btn', disabled: !canPay(c, 5), onclick: () => this.openCase(c, 5) }, `Open 5 more (${costOf(c, 5)})`),
          h('button', { class: 'btn', disabled: !canPay(c, 10), onclick: () => this.openCase(c, 10) }, `Open 10 more (${costOf(c, 10)})`),
          h('button', { class: 'btn', onclick: () => this.character('locker') }, 'Locker'),
          h('button', { class: 'btn', onclick: () => this.shop() }, 'Shop'))));
      resolve();
    };
  });
};

Game.dropCard = function (c, drops, stage) {
  const s = this.state, d = drops.find(x => x.kind === 'item'), it = d.it, val = chipValue(it, d.shiny);
  const bonus = drops.filter(x => x.kind === 'chips').reduce((a, x) => a + x.amount, 0);
  const equipped = s.equip[it.slot] === it.id, equippedShiny = !!(s.equip.shiny || {})[it.slot];
  return h('div', { class: 'drop pop' + (d.shiny ? ' shiny' : ''), style: `--rc:var(${RARITY[it.r].c})` },
    h('div', { class: 'drop-icon', html: itemIcon(it) }),
    h('div', { class: 'drop-info' },
      h('span', { class: 'rarity' }, `${d.shiny ? 'SHINY ' : ''}${RARITY[it.r].name} ${SLOTS[it.slot].replace(/s$/, '')}`),
      h('h2', {}, it.name), h('p', { html: it.d }),
      h('p', { class: 'perk' }, perkText(it, d.shiny)),
      h('p', { class: 'mono' }, `${d.dup ? 'Duplicate. ' : 'NEW! '}Trade-in: ${val} chips${bonus ? ` · bonus bag: +${bonus} chips` : ''}`),
      h('div', { class: 'row' },
        h('button', { class: 'btn primary', disabled: equipped && equippedShiny === !!d.shiny, onclick: e => { equipItem(it, d.shiny); SFX.good(); e.currentTarget.textContent = d.shiny ? 'Equipped shiny!' : 'Equipped!'; e.currentTarget.disabled = true; } },
          equipped && equippedShiny === !!d.shiny ? 'Equipped' : d.shiny ? 'Equip shiny' : 'Equip it'),
        h('button', { class: 'btn', onclick: e => { const g = tradeIn(it.id, d.shiny); xpPop(`+${g} chips`, e.currentTarget, 'chip'); SFX.good(); e.currentTarget.textContent = `Sold for ${g}`; e.currentTarget.disabled = true; } }, `Sell (+${val})`),
        h('button', { class: 'btn', disabled: !canPay(c, 1), onclick: () => this.openCase(c, 1) }, `Open again (${costOf(c, 1) || 'FREE'})`),
        h('button', { class: 'btn', onclick: () => this.shop() }, 'Shop')))
  );
};
