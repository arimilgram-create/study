// 3D versions of the casino games. The odds, payouts, and expected returns are exactly the same as the 2D games
// in casino.js (the same tables and the same random draws); only the visuals change. Without WebGL the 2D games run.

const plinko2D = plinko, mines2D = mines, rocket2D = rocket, ladder2D = ladder;
const czView = (host, o) => K3.view(host, Object.assign({ drag: false, auto: 0, fov: 40 }, o));
const czCol = m => m >= 10 ? '#ff3b5c' : m >= 3 ? '#ffb000' : m >= 1 ? '#3d9bff' : '#8a94a6';

// ---------- Plinko ----------
plinko = function (el, refresh) {
  if (!K3.ok()) return plinko2D(el, refresh);
  const { box: bx, sph, at } = AV3.prim;
  const st = { rows: 12, risk: 'med', balls: [], hist: [], wager: 0, paid: 0 };
  let table = plinkoTable(st.rows, st.risk);
  el.append(h('div', { class: 'q' }, 'Plinko'),
    h('p', { class: 'ctx', html: 'Drop a ball. Each peg sends it left or right, 50/50. Where it lands sets the multiplier. Low risk pays small and often. High risk pays big and rarely.' }));
  const bet = betBox(refresh, 10);
  const rowsSel = h('select', { class: 'sel', 'aria-label': 'Rows' }, [8, 12, 16].map(r => h('option', { value: r, selected: r === st.rows }, `${r} rows`)));
  const riskSel = h('select', { class: 'sel', 'aria-label': 'Risk' }, Object.entries(RISK).map(([k, v]) => h('option', { value: k, selected: k === st.risk }, `${v.label} risk`)));
  const drop = h('button', { class: 'btn primary', onclick: () => dropBall() }, 'Drop ball');
  const drop10 = h('button', { class: 'btn', onclick: () => { for (let i = 0; i < 10; i++) setTimeout(dropBall, i * 170); } }, 'Drop 10');
  const host = h('div', { class: 'cz-view' });
  const info = h('div', { class: 'readout' }), hist = h('div', { class: 'plinko-hist' });
  el.append(h('div', { class: 'row' }, rowsSel, riskSel), bet.el, h('div', { class: 'row' }, drop, drop10), host, h('div', { class: 'row', style: 'justify-content:center' }, hist), info);
  const v = czView(host, { h: Math.min(520, Math.max(360, innerHeight * 0.6)), cam: [0, 0, 22], target: [0, 0, 0] });
  const DX = 1, DY = 0.92;
  let board = null, pegs = [], slots = [], top = 0;
  function build() {
    if (board) { v.scene.remove(board); K3.dispose(board); }
    board = new THREE.Group(); pegs = []; slots = [];
    const R = st.rows; top = R * DY / 2 + 0.6;
    board.add(at(bx((R + 3) * DX, R * DY + 4.2, 0.4, K3.mat('#1a1f3d', { roughness: 0.6 })), 0, -0.4, -0.5));
    for (let r = 0; r < R; r++) { pegs.push([]); for (let j = 0; j <= r; j++) { const m = new THREE.MeshStandardMaterial({ color: 0xdfe6ee, emissive: 0x6cc0ff, emissiveIntensity: 0.15, roughness: 0.3 }); m.userData.own = true; const p = at(sph(0.13, m, 12, 8), (j - r / 2) * DX, top - r * DY, 0); p.userData.flash = 0; board.add(p); pegs[r].push(p); } }
    table.m.forEach((mm, k) => {
      const c = czCol(mm), m = new THREE.MeshStandardMaterial({ color: K3.col(c), emissive: K3.col(c), emissiveIntensity: 0.25, roughness: 0.4 }); m.userData.own = true;
      const slot = at(bx(DX * 0.92, 0.85, 0.7, m), (k - R / 2) * DX, top - R * DY - 0.55, 0); slot.userData.bounce = 0;
      const lab = K3.label(`${mm}x`, { size: 44, h: R > 12 ? 0.42 : 0.52 }); lab.position.set(0, 0, 0.4); slot.add(lab);
      board.add(slot); slots.push(slot);
    });
    v.scene.add(board);
    const H = R * DY + 4.6, W = (R + 3) * DX, f = Math.tan(v.camera.fov * Math.PI / 360);
    const dist = Math.max(H / (2 * f), W / (2 * f * v.camera.aspect)) * 1.02;
    v.camera.position.set(0, -0.6, dist); v.target.set(0, -0.4, 0); v.camera.lookAt(v.target);
  }
  build();
  rowsSel.onchange = () => { st.rows = +rowsSel.value; table = plinkoTable(st.rows, st.risk); build(); };
  riskSel.onchange = () => { st.risk = riskSel.value; table = plinkoTable(st.rows, st.risk); build(); };
  const ballM = K3.mat('#ff9f1a', { roughness: 0.2, metalness: 0.2, emissive: K3.col('#ff7a1a'), emissiveIntensity: 0.25 });
  const dropBall = () => {
    const b = bet.take(); if (!b) return;
    st.wager += b; const R = st.rows; let j = 0; const pts = [[0, top + 1.1, -1]];
    for (let r = 0; r < R; r++) { pts.push([(j - r / 2) * DX, top - r * DY, r]); if (Math.random() < 0.5) j++; }
    pts.push([(j - R / 2) * DX, top - R * DY - 0.35, -2]);
    const mesh = at(sph(0.22, ballM, 16, 12), 0, top + 1.1, 0.25); v.scene.add(mesh);
    st.balls.push({ pts, seg: 0, u: 0, bet: b, j, mult: table.m[j], mesh });
    SFX.click();
  };
  const landed = ball => {
    const pay = Math.floor(ball.bet * ball.mult); st.paid += pay;
    const slot = slots[ball.j]; slot.userData.bounce = 1; slot.material.emissiveIntensity = 1.2;
    v.burst(slot.position.clone().add(K3.V(0, 0.3, 0.4)), [czCol(ball.mult), '#ffffff'], ball.mult >= 3 ? 60 : 24, { speed: 3, up: 4, life: 0.9, size: 0.22 });
    cashIn(pay, drop, refresh);
    st.hist.unshift({ m: ball.mult, pay, bet: ball.bet }); st.hist.length = Math.min(st.hist.length, 10);
    if (ball.mult >= 10) { SFX.win(); FX.burst([css('--r-myth'), css('--r-leg')], 90, innerWidth / 2, innerHeight * 0.3); FX.shake(host, 1); }
    else if (ball.mult >= 1) SFX.good(); else SFX.bad();
    hist.innerHTML = ''; hist.append(...st.hist.map(x => h('span', { class: 'pill', style: `--rc:${x.m >= 10 ? 'var(--r-myth)' : x.m >= 3 ? 'var(--r-leg)' : x.m >= 1 ? 'var(--r-rare)' : 'var(--r-common)'}` }, `${x.m}x`)));
  };
  v.frames.push(dt => {
    if (!board) return;
    pegs.flat().forEach(p => { if (p.userData.flash > 0) { p.userData.flash = Math.max(0, p.userData.flash - dt * 3); p.material.emissiveIntensity = 0.15 + p.userData.flash * 1.6; p.scale.setScalar(1 + p.userData.flash * 0.5); } });
    slots.forEach(s => { if (s.userData.bounce > 0) { s.userData.bounce = Math.max(0, s.userData.bounce - dt * 2.5); s.position.y = top - st.rows * DY - 0.55 - Math.sin(s.userData.bounce * Math.PI) * 0.25; s.scale.setScalar(1 + s.userData.bounce * 0.15); s.material.emissiveIntensity = 0.25 + s.userData.bounce; } });
    st.balls = st.balls.filter(ball => {
      ball.u += dt / 0.12;
      while (ball.u >= 1 && ball.seg < ball.pts.length - 1) {
        ball.u -= 1; ball.seg++;
        const r = ball.pts[ball.seg][2]; if (r >= 0 && pegs[r]) { const jj = Math.round(ball.pts[ball.seg][0] / DX + r / 2), p = pegs[r][jj]; if (p) p.userData.flash = 1; tone([600 + r * 45], 0.025, 'triangle', 0.025); }
      }
      if (ball.seg >= ball.pts.length - 1) { landed(ball); v.scene.remove(ball.mesh); return false; }
      const a = ball.pts[ball.seg], c = ball.pts[ball.seg + 1], u = ball.u;
      ball.mesh.position.set(a[0] + (c[0] - a[0]) * u, a[1] + (c[1] - a[1]) * u + Math.sin(Math.PI * u) * 0.32 + 0.2, 0.25);
      ball.mesh.rotation.z -= dt * 8;
      return true;
    });
    const R = st.rows;
    info.innerHTML = `<span>Expected return: <b>${(table.ev * 100).toFixed(1)}%</b> · ${RISK[st.risk].label} risk · ${R} rows</span>
      <span>Top prize: <b>${Math.max(...table.m)}x</b> · Chance of landing a 1x or better: <b>${(table.P.reduce((a, p, k) => a + (table.m[k] >= 1 ? p : 0), 0) * 100).toFixed(0)}%</b></span>
      <span class="mono">This session: wagered ${st.wager}, paid ${st.paid}, net ${st.paid - st.wager >= 0 ? '+' : ''}${st.paid - st.wager}</span>`;
  });
};

// ---------- Mines ----------
mines = function (el, refresh) {
  if (!K3.ok()) return mines2D(el, refresh);
  const { box: bx, sph, cyl, at, grp } = AV3.prim;
  let g = null;
  const bet = betBox(refresh, 10);
  const mineSel = h('select', { class: 'sel', 'aria-label': 'Mines' }, [1, 3, 5, 10, 15, 20].map(m => h('option', { value: m, selected: m === 3 }, `${m} mine${m > 1 ? 's' : ''}`)));
  const info = h('div', { class: 'readout' }), start = h('button', { class: 'btn primary', onclick: startGame }, 'Start (place bet)');
  const cash = h('button', { class: 'btn', disabled: true, onclick: cashOut }, 'Cash out'), auto = h('button', { class: 'btn', onclick: () => { if (!g || g.over) return; const free = [...Array(25).keys()].filter(i => !g.picked.has(i)); pickTile(pick(free)); } }, 'Random pick');
  const rungs = h('div', { class: 'mult-ladder' });
  const host = h('div', { class: 'cz-view mines3d' });
  // screen-reader buttons for each tile
  const srGrid = h('div', { class: 'sr-only' }, [...Array(25).keys()].map(i => h('button', { onclick: () => pickTile(i) }, `Tile ${i + 1}`)));
  el.append(h('div', { class: 'q' }, 'Mines'), h('p', { class: 'ctx' }, 'Tap tiles to find gems. Each gem multiplies your bet. One mine ends the round. Cash out any time.'),
    h('div', { class: 'row' }, mineSel), bet.el, h('div', { class: 'row' }, start, cash, auto), rungs, host, srGrid, info);
  const v = czView(host, { h: Math.min(460, Math.max(340, innerHeight * 0.55)), cam: [0, 7.4, 8.4], target: [0, 0, 0.6], fov: 42 });
  v.scene.add(at(bx(7.6, 0.3, 7.6, K3.mat('#1d2436', { roughness: 0.7 })), 0, -0.35, 0));
  const tiles = [], tileMeshes = [];
  for (let i = 0; i < 25; i++) {
    const x = (i % 5 - 2) * 1.35, z = (Math.floor(i / 5) - 2) * 1.35;
    const topM = new THREE.MeshStandardMaterial({ color: 0x5b6b8c, roughness: 0.4 }); topM.userData.own = true;
    const t = grp(at(bx(1.15, 0.28, 1.15, [K3.mat('#3f4c66'), K3.mat('#3f4c66'), topM, K3.mat('#2b3447'), K3.mat('#3f4c66'), K3.mat('#3f4c66')]), 0, 0, 0));
    t.position.set(x, 0, z); t.userData = { i, lift: 0, flip: 0, content: null, topM };
    t.children[0].userData.tile = i; v.scene.add(t); tiles.push(t); tileMeshes.push(t.children[0]);
  }
  const gem = () => { const m = at(new THREE.Mesh(new THREE.OctahedronGeometry(0.46), K3.glow('#4fd2ff', { emissiveIntensity: 0.7, metalness: 0.3, roughness: 0.1 })), 0, 0.85, 0); m.scale.y = 1.4; m.userData.spin = 2.5; return m; };
  const bomb = () => { const b = grp(at(sph(0.42, K3.mat('#20242c', { roughness: 0.3 })), 0, 0.62, 0), at(cyl(0.05, 0.05, 0.3, K3.mat('#b08900')), 0.1, 1.08, 0, 0, 0, -0.4), at(sph(0.09, K3.glow('#ff9f1a', { emissiveIntensity: 2 })), 0.18, 1.24, 0)); return b; };
  function reveal(i, kind, dim) {
    const t = tiles[i]; if (t.userData.content) return;
    const c = kind === 'gem' ? gem() : bomb(); if (dim) c.traverse(o => { if (o.material) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.35; o.material.userData.own = true; } });
    c.scale.multiplyScalar(0.01); t.add(c); t.userData.content = c; t.userData.flip = 1;
    t.userData.topM.color = K3.col(kind === 'gem' ? '#2b8a6e' : '#8a2b3a');
    K3.tween(v, 0.4, e => c.scale.setScalar(Math.max(0.01, e) * (kind === 'gem' ? 1 : 1)), K3.ease.back);
  }
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const hit = e => { const r = v.canvas.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, v.camera); const x = ray.intersectObjects(tileMeshes)[0]; return x ? x.object.userData.tile : -1; };
  let hover = -1;
  v.canvas.addEventListener('pointermove', e => { hover = hit(e); v.canvas.style.cursor = hover >= 0 && g && !g.over && !g.picked.has(hover) ? 'pointer' : 'default'; });
  v.canvas.addEventListener('pointerleave', () => { hover = -1; });
  v.canvas.addEventListener('click', e => { const i = hit(e); if (i >= 0) pickTile(i); });
  v.frames.push((dt, t) => {
    tiles.forEach(tl => {
      const u = tl.userData, want = (u.i === hover && g && !g.over && !g.picked.has(u.i)) ? 0.18 : 0;
      u.lift += (want - u.lift) * Math.min(1, dt * 12); tl.position.y = u.lift;
      if (u.flip > 0) { u.flip = Math.max(0, u.flip - dt * 3); tl.children[0].rotation.x = u.flip * Math.PI; }
      if (u.content) u.content.traverse(o => { if (o.userData.spin) o.rotation.y += o.userData.spin * dt; });
    });
  });
  const show = () => {
    const m = g ? g.m : +mineSel.value, k = g ? g.picked.size : 0;
    rungs.innerHTML = '';
    for (let i = 1; i <= 25 - m && i <= 12; i++) rungs.append(h('span', { class: 'pill' + (i === k ? ' on' : ''), style: `--rc:${i <= k ? 'var(--r-leg)' : 'var(--line)'}` }, `${i}: ${minesMult(i, m).toFixed(2)}x`));
    const cur = k ? Math.floor(g.bet * minesMult(k, m)) : 0, next = g && !g.over && k < 25 - m ? minesMult(k + 1, m) : null;
    info.innerHTML = g ? (g.over ? `<span class="big">${[...g.picked].some(i => g.mines.has(i)) ? 'Mine! You lost your bet.' : 'Cashed out.'}</span>` :
      `<span class="big">${k} gem${k === 1 ? '' : 's'} found · cash out for ${cur} chips</span><span>Next gem pays ${next ? next.toFixed(2) + 'x' : 'max'} · ${25 - m - k} gems and ${m} mines left</span>`)
      : `<span>${m} mines hidden in 25 tiles. Each gem multiplies your bet. One mine ends the round.</span><span>Expected return: 97% at every step.</span>`;
    cash.disabled = !g || g.over || k === 0; start.disabled = !!g && !g.over; mineSel.disabled = !!g && !g.over;
    cash.textContent = g && !g.over && k ? `Cash out (${cur})` : 'Cash out';
  };
  function resetTiles() { tiles.forEach(t => { if (t.userData.content) { t.remove(t.userData.content); t.userData.content = null; } t.userData.topM.color = K3.col('#5b6b8c'); t.children[0].rotation.x = 0; }); }
  function startGame() {
    const b = bet.take(); if (!b) return;
    const m = +mineSel.value, order = shuffle([...Array(25).keys()]);
    g = { bet: b, m, mines: new Set(order.slice(0, m)), picked: new Set(), over: false };
    resetTiles(); SFX.click(); show();
  }
  function endReveal() { [...Array(25).keys()].forEach(i => { if (!g.picked.has(i)) reveal(i, g.mines.has(i) ? 'bomb' : 'gem', true); }); }
  function pickTile(i) {
    if (!g || g.over || g.picked.has(i)) return;
    g.picked.add(i);
    if (g.mines.has(i)) {
      g.over = true; reveal(i, 'bomb'); SFX.boom(); FX.shake(host, 1.4); FX.flash(css('--bad') || '#e0263f', 500);
      v.burst(tiles[i].position.clone().add(K3.V(0, 0.8, 0)), ['#ff7a1a', '#ffcc33', '#ff3b1f', '#2b2b2b'], 120, { speed: 6, up: 6, life: 1.2, size: 0.32 });
      setTimeout(() => v.alive && endReveal(), 450); show(); return;
    }
    reveal(i, 'gem'); tone([660 + g.picked.size * 60, 990 + g.picked.size * 60], 0.05, 'triangle', 0.06);
    v.burst(tiles[i].position.clone().add(K3.V(0, 0.8, 0)), ['#4fd2ff', '#ffffff'], 24, { speed: 2.5, up: 3, life: 0.7, size: 0.2 });
    if (g.picked.size === 25 - g.m) { cashOut(); return; }
    show();
  }
  function cashOut() {
    if (!g || g.over || g.picked.size === 0) return;
    const pay = Math.floor(g.bet * minesMult(g.picked.size, g.m)); g.over = true; cashIn(pay, cash, refresh); SFX.win(); endReveal(); show();
  }
  show();
};

// ---------- Rocket Crash ----------
rocket = function (el, refresh) {
  if (!K3.ok()) return rocket2D(el, refresh);
  const { cyl, cone, box: bx, sph, at, grp } = AV3.prim;
  el.append(h('div', { class: 'q' }, 'Rocket Crash'), h('p', { class: 'ctx', html: 'The multiplier climbs until the rocket crashes. Cash out before it does. About a 1 in 2 chance it reaches 2x. Expected return 97%.' }));
  const bet = betBox(refresh, 10);
  const info = h('div', { class: 'readout' }), hist = h('div', { class: 'plinko-hist' });
  const auto = h('input', { type: 'number', min: 1.1, step: 0.1, placeholder: 'off', class: 'betin', id: 'autoCash', 'aria-label': 'Auto cash out multiplier' });
  const launch = h('button', { class: 'btn primary', onclick: start }, 'Launch'), cashBtn = h('button', { class: 'btn', disabled: true, onclick: cashOut }, 'Cash out');
  const mult = h('div', { class: 'cz-mult' }, '1.00x');
  const host = h('div', { class: 'cz-view rocket3d' }, mult);
  el.append(bet.el, h('div', { class: 'bet' }, h('label', { for: 'autoCash', class: 'k' }, 'Auto cash out at'), auto, h('span', { class: 'hint' }, 'x (optional)')),
    h('div', { class: 'row' }, launch, cashBtn), host, hist, info);
  const v = czView(host, { h: 340, cam: [0, 0, 15], target: [0, 0, 0], fov: 45 });
  // stars
  const N = 400, P = new Float32Array(N * 3); for (let i = 0; i < N; i++) P.set([(Math.random() - 0.5) * 60, (Math.random() - 0.5) * 40, -10 - Math.random() * 20], i * 3);
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(P, 3));
  const sm = new THREE.PointsMaterial({ color: 0xffffff, size: 0.12, transparent: true, opacity: 0.8 }); sm.userData.own = true; v.scene.add(new THREE.Points(sg, sm));
  // the curve and the rocket
  const MAXP = 600, LP = new Float32Array(MAXP * 3), lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.BufferAttribute(LP, 3)); lg.setDrawRange(0, 0);
  const lineM = new THREE.LineBasicMaterial({ color: 0xffd43b }); lineM.userData.own = true; v.scene.add(new THREE.Line(lg, lineM));
  const flame = at(cone(0.22, 0.8, K3.glow('#ff7a1a', { emissiveIntensity: 2 }), 10), 0, -0.95, 0, Math.PI);
  const ship = grp(at(cyl(0.3, 0.34, 1.2, K3.mat('#eef1f5', { roughness: 0.3 })), 0, 0, 0), at(cone(0.3, 0.6, K3.mat('#e0263f')), 0, 0.9, 0), at(sph(0.13, K3.glow('#6cc0ff')), 0, 0.2, 0.28), flame);
  [0, 1, 2].forEach(k => { const f = at(bx(0.06, 0.45, 0.4, K3.mat('#e0263f')), Math.sin(k * 2.09) * 0.32, -0.45, Math.cos(k * 2.09) * 0.32, 0, k * 2.09, 0); ship.add(f); });
  ship.scale.setScalar(0.9); v.scene.add(ship);
  v.scene.add(at(bx(18, 0.06, 0.06, K3.mat('#3a4560')), 0, -4.05, 0));
  let state = 'idle', t = 0, m = 1, crashAt = 1, b = 0, msg = 'Set a bet and launch.', trail = [], last = [];
  function start() {
    if (state === 'flying') return; b = bet.take(); if (!b) return;
    const r = Math.random(); crashAt = Math.max(1, Math.floor(0.97 / (1 - r) * 100) / 100);
    state = 'flying'; t = 0; m = 1; trail = []; msg = 'Climbing...'; launch.disabled = true; cashBtn.disabled = false; ship.visible = true; SFX.whoosh();
  }
  function cashOut() {
    if (state !== 'flying') return; const pay = Math.floor(b * m); state = 'cashed';
    cashIn(pay, cashBtn, refresh); msg = `Cashed out at ${m.toFixed(2)}x: +${pay} chips. It would have crashed at ${crashAt.toFixed(2)}x.`;
    SFX.win(); v.burst(ship.position.clone(), ['#ffd43b', '#ffffff', '#5ee36b'], 70, { speed: 4, up: 3, life: 1, size: 0.25 }); if (m >= 5) FX.burst([css('--r-leg')], 60); end();
  }
  function end() { launch.disabled = false; cashBtn.disabled = true; last.unshift(crashAt); last.length = Math.min(last.length, 10); hist.innerHTML = ''; hist.append(...last.map(x => h('span', { class: 'pill', style: `--rc:${x >= 2 ? 'var(--r-leg)' : 'var(--r-common)'}` }, `${x.toFixed(2)}x`))); }
  v.frames.push((dt, time) => {
    if (state === 'flying') {
      t += dt; m = Math.exp(0.16 * t); trail.push([t, m]);
      const a = +auto.value;
      if (a >= 1.01 && m >= a && a < crashAt) { m = a; cashOut(); }
      else if (m >= crashAt) { m = crashAt; state = 'crashed'; msg = `CRASHED at ${crashAt.toFixed(2)}x. You lost ${b} chips.`; SFX.boom(); FX.shake(host, 0.9); v.burst(ship.position.clone(), ['#ff7a1a', '#ffcc33', '#ff3b1f', '#888888'], 140, { speed: 6, up: 4, life: 1.3, size: 0.32 }); ship.visible = false; end(); }
    }
    for (let i = 0; i < N; i++) { P[i * 3 + 1] -= dt * (state === 'flying' ? 3 + m : 0.4); if (P[i * 3 + 1] < -20) P[i * 3 + 1] += 40; }
    sg.attributes.position.needsUpdate = true;
    const tm = Math.max(8, t + 1), mm = Math.max(2, m * 1.2), X = tt => -8 + tt / tm * 15, Y = val => -4 + (val - 1) / (mm - 1) * 7.5;
    const n = Math.min(MAXP, trail.length), step = Math.max(1, Math.ceil(trail.length / MAXP));
    let k = 0; for (let i = 0; i < trail.length && k < MAXP; i += step) { LP.set([X(trail[i][0]), Y(trail[i][1]), 0], k * 3); k++; }
    lg.setDrawRange(0, k); lg.attributes.position.needsUpdate = true; lineM.color = K3.col(state === 'crashed' ? '#ff6b61' : '#ffd43b');
    const tip = trail.length ? [X(trail[trail.length - 1][0]), Y(trail[trail.length - 1][1])] : [X(0), Y(1)];
    const prev = trail.length > 8 ? [X(trail[trail.length - 8][0]), Y(trail[trail.length - 8][1])] : [tip[0] - 1, tip[1] - 0.3];
    if (state !== 'crashed') { ship.position.set(tip[0], tip[1] + 0.2, 0.1); ship.rotation.z = Math.atan2(tip[1] - prev[1], tip[0] - prev[0]) - Math.PI / 2; }
    flame.visible = state === 'flying'; flame.scale.set(1, 0.7 + Math.random() * 0.6, 1);
    mult.textContent = `${m.toFixed(2)}x`; mult.classList.toggle('crash', state === 'crashed');
    cashBtn.textContent = state === 'flying' ? `Cash out (${Math.floor(b * m)})` : 'Cash out';
    info.innerHTML = `<span class="big">${msg}</span>`;
  });
};

// ---------- Coin Ladder ----------
ladder = function (el, refresh) {
  if (!K3.ok()) return ladder2D(el, refresh);
  const MULT = 1.94, MAX = 10; let bet = 0, step = 0, active = false, msg = '', busy = false;
  el.append(h('div', { class: 'q' }, 'Coin Ladder'),
    h('p', { class: 'ctx', html: `Call heads or tails. Each correct call multiplies your bet by ${MULT}. A wrong call loses everything. Cash out any time. Expected return 97%.` }));
  const bt = betBox(refresh, 10);
  const host = h('div', { class: 'cz-view coin3d' });
  const rungs = h('div', { class: 'ladder-rungs' }), info = h('div', { class: 'readout' });
  const callH = h('button', { class: 'btn primary', onclick: () => call('heads') }, 'Heads'), callT = h('button', { class: 'btn primary', onclick: () => call('tails') }, 'Tails');
  const cash = h('button', { class: 'btn', onclick: cashOut }, 'Cash out');
  const face = (label, draw) => K3.canvasTex(256, 256, (x, w) => { const gr = x.createRadialGradient(w * 0.4, w * 0.35, 10, w / 2, w / 2, w / 2); gr.addColorStop(0, '#fff3a3'); gr.addColorStop(0.6, '#fcc419'); gr.addColorStop(1, '#d99a00'); x.fillStyle = gr; x.fillRect(0, 0, w, w); x.strokeStyle = '#b08900'; x.lineWidth = 14; x.beginPath(); x.arc(w / 2, w / 2, w / 2 - 12, 0, 7); x.stroke(); draw(x, w); x.fillStyle = '#7a5c00'; x.font = '700 30px Fredoka, sans-serif'; x.textAlign = 'center'; x.fillText(label, w / 2, w * 0.86); });
  const heads = face('HEADS', (x, w) => { x.fillStyle = '#7a5c00'; x.font = '700 120px Fredoka, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('N', w / 2, w * 0.46); });
  const tails = face('TAILS', (x, w) => { x.fillStyle = '#e0263f'; x.beginPath(); x.arc(w * 0.44, w * 0.48, 44, 0, 7); x.arc(w * 0.56, w * 0.48, 44, 0, 7); x.fill(); x.fillStyle = '#2b8a3e'; x.beginPath(); x.ellipse(w * 0.6, w * 0.24, 26, 12, -0.5, 0, 7); x.fill(); });
  heads.center.set(0.5, 0.5); heads.rotation = Math.PI / 2; tails.center.set(0.5, 0.5); tails.rotation = -Math.PI / 2;
  const coinM = [K3.mat('#e6a800', { metalness: 0.6, roughness: 0.3 }), K3.own({ map: heads, metalness: 0.4, roughness: 0.35 }), K3.own({ map: tails, metalness: 0.4, roughness: 0.35 })];
  const coin = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.2, 48), coinM); coin.rotation.x = Math.PI / 2;
  const pivot = new THREE.Group(); pivot.add(coin);
  const begin = h('button', { class: 'btn', onclick: () => { const b = bt.take(); if (!b) return; bet = b; step = 0; active = true; msg = ''; SFX.click(); paint(); } }, 'Start ladder');
  el.append(bt.el, h('div', { class: 'row' }, begin), host, h('div', { class: 'row', style: 'justify-content:center' }, callH, callT, cash), rungs, info);
  const v = czView(host, { h: 320, cam: [0, 1.9, 10], target: [0, 1.9, 0], fov: 40 });
  v.scene.add(pivot, K3.blob(3.2, 0.35)); pivot.position.y = 1.4;
  let spinX = 0, idle = true;
  v.frames.push((dt, t) => { if (idle) { pivot.rotation.y = Math.sin(t * 0.9) * 0.4; pivot.position.y = 1.4 + Math.sin(t * 2) * 0.06; } });
  const paint = () => {
    rungs.innerHTML = '';
    for (let i = 0; i <= MAX; i++) { const val = Math.floor(bet * Math.pow(MULT, i)); rungs.append(h('span', { class: 'pill' + (i === step && active ? ' on' : '') + (i < step ? ' done' : ''), style: `--rc:var(--r-leg)` }, `${i}: ${val || '-'}`)); }
    callH.disabled = callT.disabled = !active || busy; cash.disabled = !active || busy || step === 0;
    info.innerHTML = active ? `<span class="big">${step} correct · cash out for ${Math.floor(bet * Math.pow(MULT, step))} chips</span>` : (msg || '<span>Place a bet, then start the ladder.</span>');
  };
  function call(side) {
    if (!active || busy) return; busy = true; paint();
    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    // heads faces the camera when the coin's local x rotation is a multiple of 2π (the top cap faces +z after the π/2 tilt)
    const from = spinX, to = Math.ceil(from / (Math.PI * 2)) * Math.PI * 2 + Math.PI * 2 * 4 + (result === 'heads' ? 0 : Math.PI);
    idle = false; pivot.rotation.y = 0; SFX.whoosh();
    const dur = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.05 : 1.0;
    K3.tween(v, dur, e => { spinX = from + (to - from) * e; coin.rotation.x = Math.PI / 2 + spinX; pivot.position.y = 1.4 + Math.sin(e * Math.PI) * 1.5; }, K3.ease.inOut).then(() => {
      busy = false; idle = true;
      if (result === side) {
        step++; SFX.good(); FX.flash('var(--r-leg)', 260); v.burst(K3.V(0, 1.4, 0.5), ['#ffd43b', '#ffffff'], 50, { speed: 4, up: 4, life: 0.9, size: 0.25 });
        if (step >= MAX) { cashOut(); return; }
      } else { active = false; step = 0; SFX.bad(); FX.shake(host, 0.8); msg = `<span class="big">${result.toUpperCase()}. The ladder breaks and you lose ${bet} chips.</span>`; }
      paint();
    });
  }
  function cashOut() {
    if (!active || step === 0) return; const pay = Math.floor(bet * Math.pow(MULT, step));
    active = false; cashIn(pay, cash, refresh); SFX.win(); if (step >= 5) FX.burst([css('--r-leg')], 80);
    msg = `<span class="big">Cashed out ${step} steps: +${pay} chips.</span>`; paint();
  }
  paint();
};
