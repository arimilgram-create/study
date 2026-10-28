// Casino: play money only. Every game shows its odds and its expected return.
// Chips come from trade-ins and bonus bags, and convert to spendable XP at CHIP_TO_XP.

const CASINO_TABS = [['plinko', 'Plinko'], ['mines', 'Mines'], ['rocket', 'Rocket Crash'], ['ladder', 'Coin Ladder'], ['trade', 'Trade-in'], ['exchange', 'Chips to XP']];

Game.casino = function (tab = 'plinko') {
  const s = Game.state, app = $('#app'); app.innerHTML = '';
  const bal = h('b', { class: 'chipbal' }, s.chips);
  const refresh = () => { bal.textContent = Game.state.chips; Game.hud(); saveState(); };
  app.append(h('div', { class: 'lvl-head' }, h('button', { class: 'btn small', onclick: () => this.map() }, '< Map'), h('h2', {}, 'Casino'),
    h('span', { class: 'chip-pill' }, h('span', { class: 'chip-ico' }), bal, ' chips')));
  if (!s.chipBonus) app.append(h('div', { class: 'goal', style: 'margin-bottom:12px' }, 'First visit bonus: ',
    h('button', { class: 'btn small primary', onclick: () => { s.chips += 100; s.chipBonus = true; refresh(); SFX.win(); this.casino(tab); } }, 'Claim 100 free chips')));
  app.append(h('div', { class: 'row tabs' }, CASINO_TABS.map(([k, t]) => h('button', { class: 'btn small' + (k === tab ? ' on' : ''), onclick: () => this.casino(k) }, t))));
  const body = h('section', { class: 'step casino-' + tab }); app.append(body);
  ({ plinko, mines, rocket, ladder, trade: tradePanel, exchange: exchangePanel })[tab](body, refresh);
  app.append(h('p', { class: 'hint casino-note' }, 'Chips are play money only. Every game has a house edge, so over many bets you lose a little on average. The expected return is shown on each game.'));
  scrollTo(0, 0);
};

// Bet box: a single bet input with quick buttons. take() removes the bet from your chips.
function betBox(refresh, initial = 10) {
  const s = Game.state;
  const inp = h('input', { type: 'number', min: 1, step: 1, value: Math.min(initial, Math.max(1, s.chips)), class: 'betin', 'aria-label': 'Bet in chips', id: 'betInput' });
  const set = v => { inp.value = Math.max(1, Math.floor(v)); };
  const el = h('div', { class: 'bet' }, h('label', { for: 'betInput', class: 'k' }, 'Bet'), inp,
    ...[10, 50, 100].map(v => h('button', { class: 'btn small', onclick: () => set(v) }, String(v))),
    h('button', { class: 'btn small', onclick: () => set(+inp.value / 2) }, '½'),
    h('button', { class: 'btn small', onclick: () => set(+inp.value * 2) }, '2x'),
    h('button', { class: 'btn small', onclick: () => set(Game.state.chips) }, 'All in'));
  return {
    el, value: () => Math.floor(+inp.value),
    take() {
      const b = Math.floor(+inp.value); if (!(b >= 1)) return 0;
      if (b > Game.state.chips) { xpPop('Not enough chips', inp, 'bad'); SFX.bad(); return 0; }
      Game.state.chips -= b; refresh(); return b;
    },
  };
}
const cashIn = (n, anchor, refresh) => { if (n <= 0) return; Game.state.chips += n; refresh(); xpPop(`+${n} chips`, anchor, 'chip'); };
const comb = (n, k) => { let r = 1; for (let i = 1; i <= k; i++) r = r * (n - k + i) / i; return r; };

// ---------- Plinko ----------
const RISK = { low: { alpha: 0.4, label: 'Low' }, med: { alpha: 0.75, label: 'Medium' }, high: { alpha: 1.0, label: 'High' } };
const RTP = 0.96;
// Slot k has probability C(R,k)/2^R. Payouts scale as (1/p)^alpha, then are normalised so the expected return is 96%.
function plinkoTable(R, risk) {
  const a = RISK[risk].alpha, P = Array.from({ length: R + 1 }, (_, k) => comb(R, k) / Math.pow(2, R));
  const raw = P.map(p => Math.pow(1 / p, a)), norm = RTP / P.reduce((s, p, i) => s + p * raw[i], 0);
  const m = raw.map(x => Math.max(0.1, Math.round(x * norm * 100) / 100));
  const ev = P.reduce((s, p, i) => s + p * m[i], 0);
  return { m, P, ev };
}
function plinko(el, refresh) {
  const st = { rows: 12, risk: 'med', lastHit: -1, hitT: 0, balls: [], hist: [], wager: 0, paid: 0 };
  let table = plinkoTable(st.rows, st.risk);
  el.append(h('div', { class: 'q' }, 'Plinko'),
    h('p', { class: 'ctx', html: 'Drop a ball. Each peg sends it left or right, 50/50. Where it lands sets the multiplier. Low risk pays small and often. High risk pays big and rarely.' }));
  const bet = betBox(refresh, 10);
  const rowsSel = h('select', { class: 'sel', 'aria-label': 'Rows' }, [8, 12, 16].map(r => h('option', { value: r, selected: r === st.rows }, `${r} rows`)));
  const riskSel = h('select', { class: 'sel', 'aria-label': 'Risk' }, Object.entries(RISK).map(([k, v]) => h('option', { value: k, selected: k === st.risk }, `${v.label} risk`)));
  rowsSel.onchange = () => { st.rows = +rowsSel.value; table = plinkoTable(st.rows, st.risk); };
  riskSel.onchange = () => { st.risk = riskSel.value; table = plinkoTable(st.rows, st.risk); };
  const drop = h('button', { class: 'btn primary', onclick: () => dropBall() }, 'Drop ball');
  const drop10 = h('button', { class: 'btn', onclick: () => { for (let i = 0; i < 10; i++) setTimeout(dropBall, i * 170); } }, 'Drop 10');
  const cv = h('canvas', { 'aria-label': 'Plinko board', class: 'plinko-cv' }), W = 380, H = 430, ctx = hiDPI(cv, W, H);
  const info = h('div', { class: 'readout' }), hist = h('div', { class: 'plinko-hist' });
  el.append(h('div', { class: 'row' }, rowsSel, riskSel), bet.el, h('div', { class: 'row' }, drop, drop10),
    h('div', { class: 'panel plinko-wrap' }, cv), h('div', { class: 'row', style: 'justify-content:center' }, hist), info);

  const geom = () => {
    const R = st.rows, DX = Math.min(40, (W - 40) / (R + 1)), DY = (H - 120) / R, cx = W / 2, top = 40;
    const pegXY = (r, j) => [cx + (j - r / 2) * DX, top + r * DY];
    const slotXY = j => [cx + (j - R / 2) * DX, top + R * DY + 16];
    return { R, DX, DY, cx, top, pegXY, slotXY };
  };
  const dropBall = () => {
    const b = bet.take(); if (!b) return;
    st.wager += b; const g = geom(); let j = 0; const pts = [[g.cx, g.top - 26]];
    for (let r = 0; r < g.R; r++) { pts.push(g.pegXY(r, j)); if (Math.random() < 0.5) j++; }
    pts.push(g.slotXY(j));
    st.balls.push({ pts, seg: 0, u: 0, bet: b, j, mult: table.m[j] });
    SFX.click();
  };
  const landed = ball => {
    const pay = Math.floor(ball.bet * ball.mult); st.paid += pay;
    st.lastHit = ball.j; st.hitT = performance.now();
    cashIn(pay, drop, refresh);
    st.hist.unshift({ m: ball.mult, pay, bet: ball.bet }); st.hist.length = Math.min(st.hist.length, 10);
    if (ball.mult >= 10) { SFX.win(); FX.burst([css('--r-myth'), css('--r-leg')], 90, innerWidth / 2, innerHeight * 0.3); }
    else if (ball.mult >= 1) SFX.good(); else SFX.bad();
    hist.innerHTML = ''; hist.append(...st.hist.map(x => h('span', { class: 'pill', style: `--rc:${x.m >= 10 ? 'var(--r-myth)' : x.m >= 3 ? 'var(--r-leg)' : x.m >= 1 ? 'var(--r-rare)' : 'var(--r-common)'}` }, `${x.m}x`)));
  };
  const slotColor = m => m >= 10 ? css('--r-myth') : m >= 3 ? css('--r-leg') : m >= 1 ? css('--r-rare') : css('--r-common');
  loop(el, dt => {
    const g = geom(), R = g.R;
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = css('--soft'); ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = css('--muted');
    for (let r = 0; r < R; r++) for (let j = 0; j <= r; j++) { const [x, y] = g.pegXY(r, j); ctx.beginPath(); ctx.arc(x, y, 3.4, 0, 7); ctx.fill(); }
    table.m.forEach((m, k) => {
      const [x, y] = g.slotXY(k), bw = g.DX - 3, hot = k === st.lastHit && performance.now() - st.hitT < 900;
      ctx.fillStyle = slotColor(m); ctx.globalAlpha = hot ? 1 : 0.8; ctx.fillRect(x - bw / 2, y - 6, bw, 26); ctx.globalAlpha = 1;
      ctx.fillStyle = '#fff'; ctx.font = `700 ${R > 12 ? 9 : 11}px ${css('--mono')}`; ctx.textAlign = 'center';
      ctx.fillText(`${m}x`, x, y + 12);
    });
    ctx.textAlign = 'left';
    st.balls = st.balls.filter(ball => {
      ball.u += dt / 0.12;
      while (ball.u >= 1 && ball.seg < ball.pts.length - 1) { ball.u -= 1; ball.seg++; SFX.tick(); }
      if (ball.seg >= ball.pts.length - 1) { landed(ball); return false; }
      const [a, c] = [ball.pts[ball.seg], ball.pts[ball.seg + 1]], u = ball.u;
      const x = a[0] + (c[0] - a[0]) * u, y = a[1] + (c[1] - a[1]) * u - Math.sin(Math.PI * u) * 7;
      ctx.fillStyle = css('--f-a'); ctx.strokeStyle = css('--ink'); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, 6.5, 0, 7); ctx.fill(); ctx.stroke();
      return true;
    });
    info.innerHTML = `<span>Expected return: <b>${(table.ev * 100).toFixed(1)}%</b> · ${RISK[st.risk].label} risk · ${R} rows</span>
      <span>Top prize: <b>${Math.max(...table.m)}x</b> · Chance of landing a 1x or better: <b>${(table.P.reduce((a, p, k) => a + (table.m[k] >= 1 ? p : 0), 0) * 100).toFixed(0)}%</b></span>
      <span class="mono">This session: wagered ${st.wager}, paid ${st.paid}, net ${st.paid - st.wager >= 0 ? '+' : ''}${st.paid - st.wager}</span>`;
  });
}

// ---------- Mines ----------
const GEM_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12l4 6-10 11L2 10z" fill="#4dabf7" stroke="#1c7ed6" stroke-width="1.5" stroke-linejoin="round"/><path d="M6 4l-4 6h20l-4-6" fill="#a5d8ff" opacity=".7"/></svg>';
const MINE_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="14" r="7.5" fill="#343a40"/><path d="M12 6.5 Q14 2 18 3" stroke="#b08900" stroke-width="2" fill="none"/><circle cx="18" cy="3" r="1.8" fill="#ff922b"/><path d="M9 11 L10 9" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>';
// Fair multiplier after k safe picks with m mines is the product of (25-i)/(25-m-i); scaled by 0.97 for the house edge.
function minesMult(k, m) { let x = 1; for (let i = 0; i < k; i++) x *= (25 - i) / (25 - m - i); return x * 0.97; }
function mines(el, refresh) {
  let g = null; // { bet, m, mines:Set, picked:Set, over:boolean }
  const bet = betBox(refresh, 10);
  const mineSel = h('select', { class: 'sel', 'aria-label': 'Mines' }, [1, 3, 5, 10, 15, 20].map(m => h('option', { value: m, selected: m === 3 }, `${m} mine${m > 1 ? 's' : ''}`)));
  const grid = h('div', { class: 'mines-grid' });
  const cells = Array.from({ length: 25 }, (_, i) => h('button', { class: 'mine-cell', 'aria-label': `Tile ${i + 1}`, onclick: () => pickTile(i) }));
  grid.append(...cells);
  const info = h('div', { class: 'readout' }), start = h('button', { class: 'btn primary', onclick: startGame }, 'Start (place bet)');
  const cash = h('button', { class: 'btn', disabled: true, onclick: cashOut }, 'Cash out'), auto = h('button', { class: 'btn', onclick: () => { if (!g || g.over) return; const free = [...Array(25).keys()].filter(i => !g.picked.has(i)); pickTile(pick(free)); } }, 'Random pick');
  const rungs = h('div', { class: 'mult-ladder' });
  el.append(h('div', { class: 'row' }, mineSel), bet.el, h('div', { class: 'row' }, start, cash, auto), rungs, h('div', { class: 'panel mines-wrap' }, grid), info);
  const show = () => {
    const m = g ? g.m : +mineSel.value, k = g ? g.picked.size : 0;
    cells.forEach((c, i) => {
      c.className = 'mine-cell';
      c.disabled = !g || g.over || g.picked.has(i);
      if (g && g.picked.has(i)) { c.classList.add('gem'); c.innerHTML = GEM_SVG; }
      if (g && g.over && g.mines.has(i)) { c.classList.add(g.picked.has(i) ? 'boom' : 'mine'); c.innerHTML = MINE_SVG; }
    });
    rungs.innerHTML = '';
    for (let i = 1; i <= 25 - m && i <= 12; i++) rungs.append(h('span', { class: 'pill' + (i === k ? ' on' : ''), style: `--rc:${i <= k ? 'var(--r-leg)' : 'var(--line)'}` }, `${i}: ${minesMult(i, m).toFixed(2)}x`));
    const cur = k ? Math.floor(g.bet * minesMult(k, m)) : 0, next = g && !g.over && k < 25 - m ? minesMult(k + 1, m) : null;
    info.innerHTML = g ? (g.over ? `<span class="big">${g.picked.size && g.mines.size && [...g.picked].some(i => g.mines.has(i)) ? 'Mine! You lost your bet.' : 'Cashed out.'}</span>` :
      `<span class="big">${k} gem${k === 1 ? '' : 's'} found · cash out for ${cur} chips</span><span>Next gem pays ${next ? next.toFixed(2) + 'x' : 'max'} · ${25 - m - k} gems and ${m} mines left</span>`)
      : `<span>${m} mines hidden in 25 tiles. Each gem multiplies your bet. One mine ends the round.</span><span>Expected return: ${(97).toFixed(0)}% at every step.</span>`;
    cash.disabled = !g || g.over || k === 0;
    start.disabled = !!g && !g.over;
    mineSel.disabled = !!g && !g.over;
  };
  function startGame() {
    const b = bet.take(); if (!b) return;
    const m = +mineSel.value, order = shuffle([...Array(25).keys()]);
    g = { bet: b, m, mines: new Set(order.slice(0, m)), picked: new Set(), over: false };
    SFX.click(); show();
  }
  function pickTile(i) {
    if (!g || g.over || g.picked.has(i)) return;
    if (g.mines.has(i)) {
      g.picked.add(i); g.over = true; SFX.boom(); FX.shake(grid, 1); show(); return;
    }
    g.picked.add(i); SFX.good();
    if (g.picked.size === 25 - g.m) { cashOut(); return; }
    show();
  }
  function cashOut() {
    if (!g || g.over || g.picked.size === 0) return;
    const pay = Math.floor(g.bet * minesMult(g.picked.size, g.m)); g.over = true; cashIn(pay, cash, refresh); SFX.win(); show();
  }
  show();
}

// ---------- Rocket Crash ----------
function rocket(el, refresh) {
  el.append(h('div', { class: 'q' }, 'Rocket Crash'), h('p', { class: 'ctx', html: 'The multiplier climbs until the rocket crashes. Cash out before it does. About a 1 in 2 chance it reaches 2x. Expected return 97%.' }));
  const bet = betBox(refresh, 10), cv = h('canvas', { 'aria-label': 'Rocket multiplier graph', class: 'rocket-cv' }), W = 380, H = 240, ctx = hiDPI(cv, W, H);
  const info = h('div', { class: 'readout' }), hist = h('div', { class: 'plinko-hist' });
  const auto = h('input', { type: 'number', min: 1.1, step: 0.1, placeholder: 'off', class: 'betin', id: 'autoCash', 'aria-label': 'Auto cash out multiplier' });
  const launch = h('button', { class: 'btn primary', onclick: start }, 'Launch'), cashBtn = h('button', { class: 'btn', disabled: true, onclick: cashOut }, 'Cash out');
  el.append(bet.el, h('div', { class: 'bet' }, h('label', { for: 'autoCash', class: 'k' }, 'Auto cash out at'), auto, h('span', { class: 'hint' }, 'x (optional)')),
    h('div', { class: 'row' }, launch, cashBtn), h('div', { class: 'panel' }, cv), hist, info);
  let state = 'idle', t = 0, m = 1, crashAt = 1, b = 0, msg = 'Set a bet and launch.', trail = [], last = [];
  const stars = Array.from({ length: 50 }, () => [Math.random() * W, Math.random() * H]);
  function start() {
    if (state === 'flying') return; b = bet.take(); if (!b) return;
    const r = Math.random(); crashAt = Math.max(1, Math.floor(0.97 / (1 - r) * 100) / 100);
    state = 'flying'; t = 0; m = 1; trail = []; msg = 'Climbing...'; launch.disabled = true; cashBtn.disabled = false; SFX.whoosh();
  }
  function cashOut() {
    if (state !== 'flying') return; const pay = Math.floor(b * m); state = 'cashed';
    cashIn(pay, cashBtn, refresh); msg = `Cashed out at ${m.toFixed(2)}x: +${pay} chips. It would have crashed at ${crashAt.toFixed(2)}x.`;
    SFX.win(); if (m >= 5) FX.burst([css('--r-leg')], 60); end();
  }
  function end() { launch.disabled = false; cashBtn.disabled = true; last.unshift(crashAt); last.length = Math.min(last.length, 10); hist.innerHTML = ''; hist.append(...last.map(v => h('span', { class: 'pill', style: `--rc:${v >= 2 ? 'var(--r-leg)' : 'var(--r-common)'}` }, `${v.toFixed(2)}x`))); }
  loop(el, dt => {
    if (state === 'flying') {
      t += dt; m = Math.exp(0.16 * t); trail.push([t, m]);
      const a = +auto.value;
      if (a >= 1.01 && m >= a && a < crashAt) { m = a; cashOut(); }
      else if (m >= crashAt) { m = crashAt; state = 'crashed'; msg = `CRASHED at ${crashAt.toFixed(2)}x. You lost ${b} chips.`; SFX.boom(); FX.shake(cv, 0.8); end(); }
    }
    ctx.fillStyle = '#0d1530'; ctx.fillRect(0, 0, W, H); ctx.fillStyle = '#ffffff55'; stars.forEach(([x, y]) => ctx.fillRect(x, (y + t * 30) % H, 2, 2));
    const tm = Math.max(8, t + 1), mm = Math.max(2, m * 1.2), X = tt => 30 + tt / tm * (W - 50), Y = v => H - 24 - (v - 1) / (mm - 1) * (H - 50);
    ctx.strokeStyle = '#ffffff33'; ctx.lineWidth = 1; ctx.font = `10px ${css('--mono')}`; ctx.fillStyle = '#ffffff99';
    [1, 2, 5, 10, 20, 50].filter(v => v <= mm).forEach(v => { ctx.beginPath(); ctx.moveTo(30, Y(v)); ctx.lineTo(W - 10, Y(v)); ctx.stroke(); ctx.fillText(`${v}x`, 2, Y(v) + 3); });
    ctx.strokeStyle = state === 'crashed' ? '#ff6b61' : '#ffd43b'; ctx.lineWidth = 3; ctx.beginPath(); trail.forEach(([tt, v], i) => i ? ctx.lineTo(X(tt), Y(v)) : ctx.moveTo(X(tt), Y(v))); ctx.stroke();
    const [rx, ry] = trail.length ? [X(trail[trail.length - 1][0]), Y(trail[trail.length - 1][1])] : [X(0), Y(1)];
    ctx.save(); ctx.translate(rx, ry); ctx.rotate(-0.6);
    if (state === 'crashed') { ctx.fillStyle = '#ffa94d'; for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.arc(Math.cos(i) * 12, Math.sin(i * 1.7) * 12, 6, 0, 7); ctx.fill(); } }
    else { ctx.fillStyle = '#f8f9fa'; ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-8, -6); ctx.lineTo(-8, 6); ctx.closePath(); ctx.fill(); if (state === 'flying') { ctx.fillStyle = '#ffa94d'; ctx.beginPath(); ctx.moveTo(-8, -4); ctx.lineTo(-20 - Math.random() * 6, 0); ctx.lineTo(-8, 4); ctx.fill(); } }
    ctx.restore();
    ctx.fillStyle = state === 'crashed' ? '#ff6b61' : '#fff'; ctx.font = `700 28px ${css('--mono')}`; ctx.textAlign = 'right'; ctx.fillText(`${m.toFixed(2)}x`, W - 14, 36); ctx.textAlign = 'left';
    cashBtn.textContent = state === 'flying' ? `Cash out (${Math.floor(b * m)})` : 'Cash out';
    info.innerHTML = `<span class="big">${msg}</span>`;
  });
}

// ---------- Coin Ladder ----------
function ladder(el, refresh) {
  const MULT = 1.94, MAX = 10; let bet = 0, step = 0, active = false, msg = '';
  el.append(h('div', { class: 'q' }, 'Coin Ladder'),
    h('p', { class: 'ctx', html: `Call heads or tails. Each correct call multiplies your bet by ${MULT}. A wrong call loses everything. Cash out any time. Expected return 97%.` }));
  const bt = betBox(refresh, 10);
  const coin = h('div', { class: 'coin-stage' }, h('div', { class: 'coin' }, h('div', { class: 'coin-face', html: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#fcc419" stroke="#b08900" stroke-width="5"/><circle cx="50" cy="44" r="16" fill="#f1f3f5" stroke="#b08900" stroke-width="3"/><path d="M30 80 Q50 58 70 80" fill="#f1f3f5" stroke="#b08900" stroke-width="3"/></svg>' }), h('div', { class: 'coin-face back', html: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46" fill="#fcc419" stroke="#b08900" stroke-width="5"/><circle cx="50" cy="54" r="20" fill="#e03131" stroke="#7a5c00" stroke-width="3"/><path d="M53 28 Q64 20 68 30 Q58 33 53 28 Z" fill="#2b8a3e"/></svg>' })));
  const rungs = h('div', { class: 'ladder-rungs' });
  const info = h('div', { class: 'readout' });
  const callH = h('button', { class: 'btn primary', onclick: () => call('heads') }, 'Heads'), callT = h('button', { class: 'btn primary', onclick: () => call('tails') }, 'Tails');
  const cash = h('button', { class: 'btn', onclick: cashOut }, 'Cash out');
  let busy = false;
  const paint = () => {
    rungs.innerHTML = '';
    for (let i = 0; i <= MAX; i++) { const v = Math.floor(bet * Math.pow(MULT, i)); rungs.append(h('span', { class: 'pill' + (i === step && active ? ' on' : '') + (i < step ? ' done' : ''), style: `--rc:var(--r-leg)` }, `${i}: ${v || '-'}`)); }
    callH.disabled = callT.disabled = !active || busy; cash.disabled = !active || busy || step === 0;
    info.innerHTML = active ? `<span class="big">${step} correct · cash out for ${Math.floor(bet * Math.pow(MULT, step))} chips</span>` : (msg || '<span>Place a bet, then start the ladder.</span>');
  };
  const begin = h('button', { class: 'btn', onclick: () => { const b = bt.take(); if (!b) return; bet = b; step = 0; active = true; msg = ''; SFX.click(); paint(); } }, 'Start ladder');
  el.append(bt.el, h('div', { class: 'row' }, begin), coin, h('div', { class: 'row', style: 'justify-content:center' }, callH, callT, cash), rungs, info);
  function call(side) {
    if (!active || busy) return; busy = true; paint();
    const coinEl = coin.firstChild, result = Math.random() < 0.5 ? 'heads' : 'tails';
    coinEl.style.transform = `rotateY(${(side === 'heads' ? 0 : 180) + 1800 + (result === 'heads' ? 0 : 180)}deg)`;
    SFX.whoosh();
    setTimeout(() => {
      busy = false;
      if (result === side) {
        step++; SFX.good(); FX.flash('var(--r-leg)', 260);
        if (step >= MAX) { cashOut(); return; }
      } else { active = false; step = 0; SFX.bad(); msg = `<span class="big">${result.toUpperCase()}. The ladder breaks and you lose ${bet} chips.</span>`; }
      paint();
    }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 50 : 1000);
  }
  function cashOut() {
    if (!active || step === 0) return; const pay = Math.floor(bet * Math.pow(MULT, step));
    active = false; cashIn(pay, cash, refresh); SFX.win(); if (step >= 5) FX.burst([css('--r-leg')], 80);
    msg = `<span class="big">Cashed out ${step} steps: +${pay} chips.</span>`; paint();
  }
  paint();
}

// ---------- Trade-in ----------
function tradePanel(el, refresh) {
  const s = Game.state, owned = ITEMS.filter(i => s.inv[i.id]);
  el.append(h('div', { class: 'q' }, 'Trade in items for chips'),
    h('p', { class: 'ctx', style: 'margin:0' }, `Values: ${RARITY_LIST.map(r => `${RARITY[r].name} ${CHIP_VALUE[r]}`).join(', ')}. Shiny copies are worth 4x. Trading your last copy removes it from your locker.`));
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
      h('div', { class: 'trade-name' }, h('b', {}, i.name), h('span', {}, `${RARITY[i.r].name} x${n}${ns ? ` (${ns} shiny)` : ''}${s.equip[i.slot] === i.id ? ' · equipped' : ''}`)),
      h('div', { class: 'row' },
        n - ns > 0 ? h('button', { class: 'btn small', onclick: e => { const g = tradeIn(i.id, false); xpPop(`+${g} chips`, e.currentTarget, 'chip'); SFX.good(); refresh(); Game.casino('trade'); } }, `Sell (+${chipValue(i, false)})`) : null,
        ns > 0 ? h('button', { class: 'btn small primary', onclick: e => { const g = tradeIn(i.id, true); xpPop(`+${g} chips`, e.currentTarget, 'chip'); SFX.good(); refresh(); Game.casino('trade'); } }, `Sell shiny (+${chipValue(i, true)})`) : null)));
  });
  el.append(list);
}

// ---------- Chips to XP ----------
function exchangePanel(el, refresh) {
  const s = Game.state;
  el.append(h('div', { class: 'q' }, 'Chips to XP'),
    h('p', { class: 'ctx', html: `Move chips into your spendable XP at <b>${CHIP_TO_XP} chip = ${CHIP_TO_XP} XP</b>. XP buys cases. It doesn't change your rank: rank comes from studying.` }));
  const inp = h('input', { type: 'number', min: 1, step: 1, value: Math.min(100, s.chips), class: 'betin', 'aria-label': 'Chips to convert', id: 'exchangeIn' });
  const out = h('div', { class: 'readout' });
  const update = () => { const v = Math.floor(+inp.value) || 0; out.innerHTML = `<span>${v} chips → <b>${v * CHIP_TO_XP} XP</b></span><span>You'll have ${s.chips - v} chips and ${s.wallet + v * CHIP_TO_XP} XP to spend.</span>`; };
  inp.oninput = update;
  const convert = () => {
    const v = Math.floor(+inp.value) || 0;
    if (v < 1 || v > s.chips) { xpPop('Enter an amount you have', inp, 'bad'); SFX.bad(); return; }
    s.chips -= v; s.wallet += v * CHIP_TO_XP; saveState(); SFX.win(); Game.hud(); xpPop(`+${v * CHIP_TO_XP} XP`, inp, ''); Game.casino('exchange');
  };
  el.append(h('div', { class: 'bet' }, h('label', { for: 'exchangeIn', class: 'k' }, 'Chips'), inp,
    h('button', { class: 'btn small', onclick: () => { inp.value = Math.min(100, s.chips); update(); } }, '100'),
    h('button', { class: 'btn small', onclick: () => { inp.value = Math.floor(s.chips / 2); update(); } }, 'Half'),
    h('button', { class: 'btn small', onclick: () => { inp.value = s.chips; update(); } }, 'All')),
    h('div', { class: 'row' }, h('button', { class: 'btn primary', onclick: convert }, 'Convert to XP')), out);
  update();
}
