// Casino: trade cosmetics in for chips, then play Plinko, Rocket Crash and Coin Flip with play chips.
Game.casino = function (tab = 'trade') {
  const s = this.state, app = $('#app'); app.innerHTML = '';
  const bal = h('b', { class: 'chipbal' }, s.chips);
  const refresh = () => { bal.textContent = s.chips; this.hud(); saveState(); };
  const tabs = { trade: 'Trade-in', plinko: 'Gravity Plinko', rocket: 'Rocket Crash', coin: 'Coin Flip' };
  app.append(h('div', { class: 'lvl-head' }, h('button', { class: 'btn small', onclick: () => this.map() }, '< Map'), h('h2', {}, 'Casino'),
    h('span', { class: 'chip-pill' }, h('span', { class: 'chip-ico' }), bal, ' chips')));
  if (!s.chipBonus) app.append(h('div', { class: 'goal', style: 'margin-bottom:12px' }, 'First visit bonus: ', h('button', { class: 'btn small primary', onclick: () => { s.chips += 100; s.chipBonus = true; refresh(); SFX.win(); this.casino(tab); } }, 'Claim 100 free chips')));
  app.append(h('div', { class: 'row', style: 'margin-bottom:14px' }, Object.entries(tabs).map(([k, t]) => h('button', { class: 'btn small' + (k === tab ? ' on' : ''), onclick: () => this.casino(k) }, t))));
  const body = h('section', { class: 'step' }); app.append(body);
  ({ trade: tradePanel, plinko: plinko, rocket: rocket, coin: coinFlip })[tab](body, refresh);
  app.append(h('p', { class: 'hint casino-note' }, 'Chips are play money: no real money ever. Every game here shows its odds, and each one has a small house edge, so over many bets you\'re expected to lose a little. Real casinos work the same way. The surest way to get more chips is studying: XP buys cases, cases give items, items trade for chips.'));
  scrollTo(0, 0);
};

function betBox(refresh) {
  const s = Game.state;
  const inp = h('input', { type: 'number', min: 1, step: 1, value: Math.min(10, Math.max(1, s.chips)), class: 'betin', 'aria-label': 'Bet in chips', id: 'betInput' });
  const set = v => { inp.value = Math.max(1, Math.floor(v)); };
  const el = h('div', { class: 'bet' }, h('label', { for: 'betInput', class: 'k' }, 'Bet'), inp,
    ...[10, 50, 100].map(v => h('button', { class: 'btn small', onclick: () => set(v) }, String(v))),
    h('button', { class: 'btn small', onclick: () => set(+inp.value / 2) }, '1/2'), h('button', { class: 'btn small', onclick: () => set(+inp.value * 2) }, 'x2'),
    h('button', { class: 'btn small', onclick: () => set(s.chips) }, 'Max'));
  return { el, take() { const b = Math.floor(+inp.value); if (!(b >= 1)) return 0; if (b > s.chips) { xpPop('Not enough chips', inp, 'bad'); SFX.bad(); return 0; } s.chips -= b; refresh(); return b; } };
}
const win = (n, anchor, refresh) => { Game.state.chips += n; refresh(); if (n > 0) xpPop(`+${n} chips`, anchor, 'chip'); };

// ---------- trade-in ----------
function tradePanel(el, refresh) {
  const s = Game.state;
  const owned = ITEMS.filter(i => s.inv[i.id]);
  el.append(h('div', { class: 'q' }, 'Trade in items for chips'), h('p', { class: 'ctx', style: 'margin:0' }, `Values: ${Object.entries(CHIP_VALUE).map(([r, v]) => `${RARITY[r].name} ${v}`).join(', ')}. Shiny copies are worth 4x. Selling your last copy of something removes it from your locker.`));
  const dupVal = owned.reduce((a, i) => a + Math.max(0, s.inv[i.id] - (s.shinyInv[i.id] || 0) - ((s.shinyInv[i.id] || 0) ? 0 : 1)) * chipValue(i, false), 0);
  const sellDups = h('button', { class: 'btn primary', disabled: !dupVal, onclick: () => {
    let g = 0; owned.forEach(i => { const keep = (s.shinyInv[i.id] || 0) ? 0 : 1; while (s.inv[i.id] - (s.shinyInv[i.id] || 0) > keep) g += tradeIn(i.id, false); });
    xpPop(`+${g} chips`, sellDups, 'chip'); SFX.win(); refresh(); Game.casino('trade');
  } }, `Sell all duplicates (+${dupVal})`);
  el.append(h('div', { class: 'row' }, sellDups, h('button', { class: 'btn', onclick: () => Game.shop() }, 'Open more cases')));
  if (!owned.length) { el.append(h('p', {}, 'Your locker is empty. Open a case first!')); return; }
  const list = h('div', { class: 'trade-list' });
  owned.sort((a, b) => CHIP_VALUE[b.r] - CHIP_VALUE[a.r]).forEach(i => {
    const n = s.inv[i.id], ns = s.shinyInv[i.id] || 0;
    list.append(h('div', { class: 'trade-row', style: `--rc:var(${RARITY[i.r].c})` },
      h('div', { class: 'ti-icon sm' + (ns ? ' shiny' : ''), html: itemIcon(i) }),
      h('div', { class: 'trade-name' }, h('b', {}, i.name), h('span', {}, `${RARITY[i.r].name} x${n}${ns ? ` (${ns} shiny)` : ''}${s.equip[i.slot] === i.id ? ' - equipped' : ''}`)),
      h('div', { class: 'row' },
        n - ns > 0 ? h('button', { class: 'btn small', onclick: e => { const g = tradeIn(i.id, false); xpPop(`+${g} chips`, e.target, 'chip'); SFX.good(); refresh(); Game.casino('trade'); } }, `Sell 1 (+${chipValue(i, false)})`) : null,
        ns > 0 ? h('button', { class: 'btn small primary', onclick: e => { const g = tradeIn(i.id, true); xpPop(`+${g} chips`, e.target, 'chip'); SFX.good(); refresh(); Game.casino('trade'); } }, `Sell shiny (+${chipValue(i, true)})`) : null)));
  });
  el.append(list);
}

// ---------- Gravity Plinko ----------
const PLINKO_MULT = [8, 3, 1.4, 0.7, 0.4, 0.7, 1.4, 3, 8];
function plinko(el, refresh) {
  el.append(h('div', { class: 'q' }, 'Gravity Plinko'), h('p', { class: 'ctx', style: 'margin:0' }, 'Gravity pulls the ball down; every peg knocks it left or right, 50/50. 8 rows = 256 possible paths. Only 1 path reaches each 8x slot. 70 paths end in the middle.'));
  const bet = betBox(refresh), cv = h('canvas', { 'aria-label': 'Plinko board' }), log = h('div', { class: 'readout' });
  const drop = h('button', { class: 'btn primary', onclick: () => { const b = bet.take(); if (!b) return; balls.push(newBall(b)); SFX.click(); } }, 'Drop ball');
  el.append(bet.el, h('div', { class: 'row' }, drop, h('span', { class: 'hint' }, 'Drop as many balls as you like.')), h('div', { class: 'panel plinko-wrap' }, cv), log);
  const W = 360, H = 400, ctx = hiDPI(cv, W, H), R = 8, DX = 36, DY = 38, TOP = 40; const balls = [], hist = [];
  const pathPts = rights => { const pts = [[W / 2, 8]]; let r = 0; for (let i = 0; i < R; i++) { r += rights[i]; pts.push([W / 2 + (2 * r - (i + 1)) * DX / 2, TOP + (i + 1) * DY - 12]); } pts.push([pts[R][0], H - 30]); return pts; };
  function newBall(b) { const rights = Array.from({ length: R }, () => Math.random() < .5 ? 1 : 0); return { b, pts: pathPts(rights), slot: rights.reduce((a, c) => a + c, 0), seg: 0, u: 0 }; }
  loop(el, dt => {
    const ink = css('--ink'), mut = css('--muted'), soft = css('--soft');
    ctx.fillStyle = soft; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = mut; for (let i = 0; i < R; i++) for (let j = 0; j <= i + 1; j++) { ctx.beginPath(); ctx.arc(W / 2 + (j - (i + 1) / 2) * DX, TOP + i * DY + 14, 4, 0, 7); ctx.fill(); }
    PLINKO_MULT.forEach((m, k) => {
      const x = W / 2 + (k - 4) * DX; ctx.fillStyle = m >= 3 ? css('--r-myth') : m >= 1.4 ? css('--r-leg') : m >= 0.7 ? css('--r-rare') : css('--r-common');
      ctx.fillRect(x - DX / 2 + 2, H - 30, DX - 4, 26); ctx.fillStyle = '#fff'; ctx.font = '700 11px ' + css('--mono'); ctx.textAlign = 'center'; ctx.fillText(m + 'x', x, H - 13);
    });
    for (let i = balls.length - 1; i >= 0; i--) {
      const B = balls[i]; B.u += dt / 0.13;
      while (B.u >= 1 && B.seg < B.pts.length - 2) { B.u -= 1; B.seg++; SFX.tick(); }
      const [a, c] = [B.pts[B.seg], B.pts[B.seg + 1]], u = Math.min(1, B.u);
      const x = a[0] + (c[0] - a[0]) * u, y = a[1] + (c[1] - a[1]) * u * u - Math.sin(Math.PI * u) * 8;
      ctx.fillStyle = css('--f-a'); ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill(); ctx.stroke();
      if (B.seg >= B.pts.length - 2 && B.u >= 1) {
        const m = PLINKO_MULT[B.slot], pay = Math.round(B.b * m); win(pay, drop, refresh); hist.unshift(`${B.b} chips -> ${m}x = ${pay}`); hist.length = Math.min(hist.length, 5);
        if (m >= 3) { SFX.win(); confetti(m >= 8 ? 1.5 : .7); } else if (m >= 1) SFX.good(); else SFX.bad();
        balls.splice(i, 1);
      }
    }
    log.innerHTML = hist.length ? hist.map((x, i) => `<span${i ? '' : ' class="big"'}>${x}</span>`).join('') : '<span>Results show up here.</span>';
  });
}

// ---------- Rocket Crash ----------
function rocket(el, refresh) {
  el.append(h('div', { class: 'q' }, 'Rocket Crash'), h('p', { class: 'ctx', style: 'margin:0' }, 'Thrust beats gravity, so the rocket speeds up and the multiplier climbs. The engine can cut out at any moment. Cash out before it crashes. Chance it reaches 2x: about 48%. Reaches 10x: about 10%.'));
  const bet = betBox(refresh), cv = h('canvas', { 'aria-label': 'Rocket multiplier graph' }), info = h('div', { class: 'readout' });
  const auto = h('input', { type: 'number', min: 1.1, step: 0.1, placeholder: 'off', class: 'betin', id: 'autoCash', 'aria-label': 'Auto cash out multiplier' });
  const launch = h('button', { class: 'btn primary', onclick: start }, 'Launch'), cash = h('button', { class: 'btn', disabled: true, onclick: cashOut }, 'Cash out');
  el.append(bet.el, h('div', { class: 'bet' }, h('label', { for: 'autoCash', class: 'k' }, 'Auto cash out at'), auto, h('span', { class: 'hint' }, 'x (optional)')), h('div', { class: 'row' }, launch, cash), h('div', { class: 'panel' }, cv), info);
  const W = 360, H = 240, ctx = hiDPI(cv, W, H); let state = 'idle', t = 0, m = 1, crashAt = 1, b = 0, msg = 'Set a bet and launch.', trail = []; const hist = [];
  const stars = Array.from({ length: 50 }, () => [Math.random() * W, Math.random() * H]);
  function start() {
    if (state === 'flying') return; b = bet.take(); if (!b) return;
    const r = Math.random(); crashAt = Math.min(100, Math.max(1, Math.floor(0.97 / (1 - r) * 100) / 100));
    state = 'flying'; t = 0; m = 1; trail = []; msg = 'Climbing...'; launch.disabled = true; cash.disabled = false; SFX.whoosh();
  }
  function cashOut() {
    if (state !== 'flying') return; const pay = Math.floor(b * m); state = 'cashed'; win(pay, cash, refresh);
    msg = `Cashed out at ${m.toFixed(2)}x: +${pay} chips. (It would have crashed at ${crashAt.toFixed(2)}x.)`; SFX.win(); if (m >= 5) confetti(1); end();
  }
  function end() { launch.disabled = false; cash.disabled = true; hist.unshift(crashAt); hist.length = Math.min(hist.length, 8); }
  loop(el, dt => {
    if (state === 'flying') {
      t += dt; m = Math.exp(0.16 * t); trail.push([t, m]);
      const a = +auto.value; if (a >= 1.01 && m >= a && a < crashAt) { m = a; cashOut(); }
      else if (m >= crashAt) { m = crashAt; state = 'crashed'; msg = `CRASHED at ${crashAt.toFixed(2)}x. Lost ${b} chips.`; SFX.boom(); end(); }
    }
    ctx.fillStyle = '#0d1530'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#ffffff55'; stars.forEach(([x, y]) => ctx.fillRect(x, (y + t * 30) % H, 2, 2));
    const tm = Math.max(8, t + 1), mm = Math.max(2, m * 1.2), X = tt => 30 + tt / tm * (W - 50), Y = v => H - 24 - (v - 1) / (mm - 1) * (H - 50);
    ctx.strokeStyle = '#ffffff33'; ctx.lineWidth = 1; ctx.font = '10px ' + css('--mono'); ctx.fillStyle = '#ffffff99';
    [1, 2, 5, 10, 20, 50].filter(v => v <= mm).forEach(v => { ctx.beginPath(); ctx.moveTo(30, Y(v)); ctx.lineTo(W - 10, Y(v)); ctx.stroke(); ctx.fillText(v + 'x', 2, Y(v) + 3); });
    ctx.strokeStyle = state === 'crashed' ? '#ff6b61' : '#ffd43b'; ctx.lineWidth = 3; ctx.beginPath(); trail.forEach(([tt, v], i) => i ? ctx.lineTo(X(tt), Y(v)) : ctx.moveTo(X(tt), Y(v))); ctx.stroke();
    const [rx, ry] = trail.length ? [X(trail[trail.length - 1][0]), Y(trail[trail.length - 1][1])] : [X(0), Y(1)];
    ctx.save(); ctx.translate(rx, ry); ctx.rotate(-0.6);
    if (state === 'crashed') { ctx.fillStyle = '#ffa94d'; for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.arc(Math.cos(i) * 12, Math.sin(i * 1.7) * 12, 6, 0, 7); ctx.fill(); } }
    else { ctx.fillStyle = '#f8f9fa'; ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-8, -6); ctx.lineTo(-8, 6); ctx.closePath(); ctx.fill(); if (state === 'flying') { ctx.fillStyle = '#ffa94d'; ctx.beginPath(); ctx.moveTo(-8, -4); ctx.lineTo(-20 - Math.random() * 6, 0); ctx.lineTo(-8, 4); ctx.fill(); } }
    ctx.restore();
    ctx.fillStyle = state === 'crashed' ? '#ff6b61' : '#fff'; ctx.font = '700 28px ' + css('--mono'); ctx.textAlign = 'right'; ctx.fillText(m.toFixed(2) + 'x', W - 14, 36); ctx.textAlign = 'left';
    if (state === 'flying') cash.textContent = `Cash out (${Math.floor(b * m)})`; else cash.textContent = 'Cash out';
    info.innerHTML = `<span class="big">${msg}</span><span>Last crashes: ${hist.map(v => v.toFixed(2) + 'x').join(', ') || 'none yet'}</span>`;
  });
}

// ---------- Coin Flip ----------
function coinFlip(el, refresh) {
  el.append(h('div', { class: 'q' }, 'Newton\'s Coin'), h('p', { class: 'ctx', style: 'margin:0' }, 'Pick a side. 50/50 chance. Pays 1.95x your bet.'));
  const bet = betBox(refresh), res = h('div', { class: 'readout' });
  const heads = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#fcc419" stroke="#b08900" stroke-width="5"/><circle cx="50" cy="44" r="16" fill="#f1f3f5" stroke="#b08900" stroke-width="3"/><path d="M30 80 Q50 58 70 80" fill="#f1f3f5" stroke="#b08900" stroke-width="3"/><text x="50" y="96" text-anchor="middle" font-size="9" fill="#7a5c00">NEWTON</text></svg>';
  const tails = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#fcc419" stroke="#b08900" stroke-width="5"/><circle cx="50" cy="54" r="20" fill="#e03131" stroke="#7a5c00" stroke-width="3"/><path d="M50 34 L52 24" stroke="#7a5c00" stroke-width="3"/><path d="M53 28 Q64 20 68 30 Q58 33 53 28 Z" fill="#2b8a3e"/><text x="50" y="96" text-anchor="middle" font-size="9" fill="#7a5c00">APPLE</text></svg>';
  const coin = h('div', { class: 'coin' }, h('div', { class: 'coin-face', html: heads }), h('div', { class: 'coin-face back', html: tails }));
  let busy = false, rot = 0;
  const play = side => {
    if (busy) return; const b = bet.take(); if (!b) return; busy = true;
    const out = Math.random() < .5 ? 'heads' : 'tails'; rot += 1800 + (out === 'heads' ? (rot % 360 ? 180 : 0) : (rot % 360 ? 0 : 180));
    coin.style.transform = `rotateY(${rot}deg)`; SFX.whoosh();
    setTimeout(() => {
      busy = false;
      if (out === side) { const p = Math.floor(b * 1.95); win(p, coin, refresh); res.innerHTML = `<span class="big">${out.toUpperCase()}! You win ${p} chips.</span>`; SFX.win(); }
      else { res.innerHTML = `<span class="big">${out.toUpperCase()}. You lose ${b} chips.</span>`; SFX.bad(); }
    }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 50 : 1300);
  };
  el.append(bet.el, h('div', { class: 'coin-stage' }, coin), h('div', { class: 'row', style: 'justify-content:center' },
    h('button', { class: 'btn primary', onclick: () => play('heads') }, 'Heads (Newton)'), h('button', { class: 'btn primary', onclick: () => play('tails') }, 'Tails (Apple)')), res);
}
