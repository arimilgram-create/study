// 3D hangout: a Roblox-style world you walk around in, with a Roblox-style GUI on top.
// Controls: WASD / arrows (or the joystick), Space to jump, Shift to sprint, drag to look, scroll to zoom, E to interact.
// The Steal-a-Brainrot game (brainrot.js) plugs into this world through the HG object.

Game.hangout = function () {
  if (!K3.ok()) {
    const box = h('div', { class: 'modal-bg' }, h('div', { class: 'modal' }, h('h2', {}, 'Hangout needs 3D'), h('p', {}, 'This device or browser doesn\'t support WebGL, so the 3D hangout can\'t run here.'), h('button', { class: 'btn primary', onclick: () => box.remove() }, 'OK')));
    document.body.append(box); return;
  }
  const app = $('#app'); app.innerHTML = ''; scrollTo(0, 0);
  const s = this.state, V = K3.V, { box: bx, cyl, sph, cone, tor, grp, at } = AV3.prim;
  document.body.classList.add('in-hangout');

  // ---------- page + GUI ----------
  const wrap = h('div', { class: 'hg' });
  const cashB = h('b', {}, '0'), incS = h('small', {}, '');
  const board = h('div', { class: 'hg-board' });
  const chat = h('div', { class: 'hg-chat', 'aria-live': 'polite' });
  const prompt = h('div', { class: 'hg-prompt' }); prompt.hidden = true;
  const tip = h('div', { class: 'hg-tip' }, 'WASD to move · Space to jump · Shift to sprint · drag to look · E to interact');
  const knob = h('i'), joy = h('div', { class: 'hg-joy' }, knob);
  const menu = h('div', { class: 'hg-menupop' }); menu.hidden = true;
  const leave = to => { this[to] ? this[to]() : this.map(); };
  const sideBtn = (label, cls, fn, ico) => h('button', { class: 'hg-sbtn ' + cls, onclick: fn, html: `<span class="hg-sico">${ico}</span><span>${label}</span>` });
  menu.append(
    h('button', { class: 'btn', onclick: () => leave('map') }, 'Back to the study map'),
    h('button', { class: 'btn', onclick: () => leave('character') }, 'Avatar'),
    h('button', { class: 'btn', onclick: () => leave('shop') }, 'Case Shop'),
    h('button', { class: 'btn', onclick: () => leave('casino') }, 'Casino'),
    h('button', { class: 'btn', onclick: () => { s.sound = !s.sound; saveState(); this.hud(); menu.hidden = true; } }, 'Toggle sound'),
    h('button', { class: 'btn primary', onclick: () => { menu.hidden = true; } }, 'Resume'));
  const actBtn = h('button', { class: 'hg-act', 'aria-label': 'Interact' }, 'E');
  const jumpBtn = h('button', { class: 'hg-jump', 'aria-label': 'Jump' }, '⤒');
  wrap.append(
    h('div', { class: 'hg-top' },
      h('button', { class: 'hg-menu', 'aria-label': 'Menu', onclick: () => { menu.hidden = !menu.hidden; SFX.click(); } }, h('span', {}, 'IQ')),
      h('div', { class: 'hg-cash' }, h('i', {}, '$'), cashB, incS),
      board),
    h('div', { class: 'hg-side' },
      sideBtn('Map', 'blue', () => leave('map'), '⌂'), sideBtn('Avatar', 'green', () => leave('character'), '☺'),
      sideBtn('Cases', 'gold', () => leave('shop'), '▣'), sideBtn('Casino', 'purple', () => leave('casino'), '◆')),
    chat, prompt, tip, joy, h('div', { class: 'hg-btns' }, actBtn, jumpBtn), menu);
  app.append(wrap);

  // ---------- renderer ----------
  const ren = new THREE.WebGLRenderer({ antialias: true });
  ren.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  const canvas = ren.domElement; canvas.className = 'hg-canvas'; wrap.prepend(canvas);
  const scene = new THREE.Scene(); scene.background = K3.col('#8fd3ff'); scene.fog = new THREE.Fog(0xbfe6ff, 90, 260);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x6a8f5a, 0.95));
  const sun = new THREE.DirectionalLight(0xffffff, 0.8); sun.position.set(40, 80, 30); scene.add(sun);
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 600);
  const size = () => { ren.setSize(wrap.clientWidth, wrap.clientHeight, false); canvas.style.width = '100%'; canvas.style.height = '100%'; camera.aspect = wrap.clientWidth / Math.max(1, wrap.clientHeight); camera.updateProjectionMatrix(); };
  size(); addEventListener('resize', size);

  // ---------- world ----------
  const colliders = [];
  // A box in the world. Solid unless solid = false. y is the bottom of the box.
  function block(x, y, z, w, hh, d, color, o = {}) {
    const m = at(bx(w, hh, d, typeof color === 'string' ? K3.mat(color, o.mat || {}) : color), x, y + hh / 2, z);
    scene.add(m);
    if (o.solid !== false) colliders.push({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2, y0: y, y1: y + hh, mesh: m, on: true });
    return m;
  }
  const studTex = K3.canvasTex(64, 64, (g, w) => { g.fillStyle = '#5cbf4a'; g.fillRect(0, 0, w, w); g.fillStyle = 'rgba(0,0,0,.14)'; g.beginPath(); g.arc(w / 2 + 2, w / 2 + 3, 15, 0, 7); g.fill(); g.fillStyle = '#6fd35b'; g.beginPath(); g.arc(w / 2, w / 2, 15, 0, 7); g.fill(); g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.arc(w / 2 - 4, w / 2 - 5, 6, 0, 7); g.fill(); });
  studTex.wrapS = studTex.wrapT = THREE.RepeatWrapping; studTex.repeat.set(110, 110);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(440, 440), K3.own({ map: studTex, roughness: 0.95 })); ground.rotation.x = -Math.PI / 2; scene.add(ground);
  // spawn plaza (gray baseplate)
  const plazaTex = K3.canvasTex(64, 64, (g, w) => { g.fillStyle = '#a3abb6'; g.fillRect(0, 0, w, w); g.fillStyle = '#b6bec8'; g.beginPath(); g.arc(w / 2, w / 2, 14, 0, 7); g.fill(); g.strokeStyle = 'rgba(0,0,0,.12)'; g.strokeRect(0, 0, w, w); });
  plazaTex.wrapS = plazaTex.wrapT = THREE.RepeatWrapping; plazaTex.repeat.set(15, 8);
  const plaza = new THREE.Mesh(new THREE.PlaneGeometry(60, 32), K3.own({ map: plazaTex, roughness: 0.9 })); plaza.rotation.x = -Math.PI / 2; plaza.position.set(0, 0.02, 52); scene.add(plaza);
  // trees and lamps for decoration
  const tree = (x, z, k = 1) => { block(x, 0, z, 1.4 * k, 5 * k, 1.4 * k, '#7a4b2a'); scene.add(at(sph(3.2 * k, K3.mat('#3fa34d', { roughness: 0.9 }), 10, 8), x, 6.5 * k, z)); scene.add(at(sph(2.2 * k, K3.mat('#4fbf5c', { roughness: 0.9 }), 10, 8), x + 1.4 * k, 8 * k, z - 0.8 * k)); };
  [[-50, 70], [50, 70], [-60, 20], [60, 20], [-62, -40], [62, -40], [-40, -95], [40, -95], [-32, 74], [32, 74], [-75, -10], [75, -10], [0, 95]].forEach(([x, z], i) => tree(x, z, 0.9 + (i % 3) * 0.15));
  const lamp = (x, z) => { block(x, 0, z, 0.4, 7, 0.4, '#2b3442'); scene.add(at(sph(0.7, K3.glow('#fff3a3', { emissiveIntensity: 1 }), 12, 8), x, 7.4, z)); };
  [[-12, 40], [12, 40], [-12, 64], [12, 64]].forEach(([x, z]) => lamp(x, z));
  // Newton's apple statue in the plaza
  block(-24, 0, 52, 5, 2.2, 5, '#c9d1db');
  const apple = grp(at(sph(2.2, K3.mat('#e0263f', { roughness: 0.3 })), 0, 0, 0), at(cyl(0.18, 0.18, 1.2, K3.mat('#5a3825')), 0, 2.4, 0), at(sph(0.7, K3.mat('#22a03a'), 10, 8), 0.8, 2.5, 0));
  apple.position.set(-24, 4.6, 52); scene.add(apple);
  const plaque = K3.label('NEWTON PLAZA', { size: 56, h: 1.1, color: '#ffd21f' }); plaque.position.set(-24, 9.4, 52); scene.add(plaque);

  // ---------- player ----------
  const player = { pos: V(0, 0, 44), vel: V(), yaw: Math.PI, onGround: true, carry: null, speedK: 1, obj: null };
  const rebuildPlayer = () => { if (player.obj) { scene.remove(player.obj); K3.dispose(player.obj); } player.obj = AV3.build(s.avatar, s.equip); scene.add(player.obj); const tag = K3.label(s.avatar.name, { size: 44, h: 0.8 }); tag.position.y = 7.2; player.obj.add(tag); };
  rebuildPlayer();

  // ---------- input ----------
  const keys = {}; let jumpQ = false, actQ = false, actHeld = false;
  const kd = e => {
    if (!wrap.isConnected) return; if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    const k = e.key.toLowerCase(); keys[k] = true;
    if (k === ' ') { jumpQ = true; e.preventDefault(); }
    if (k === 'e') { if (!actHeld) actQ = true; actHeld = true; }
    if (k === 'escape') menu.hidden = !menu.hidden;
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) e.preventDefault();
  };
  const ku = e => { const k = e.key.toLowerCase(); keys[k] = false; if (k === 'e') actHeld = false; };
  addEventListener('keydown', kd); addEventListener('keyup', ku);
  const cam = { yaw: 0, pitch: 0.42, dist: 20 };
  let drag = null, joyId = null, joyV = { x: 0, y: 0 };
  canvas.addEventListener('pointerdown', e => {
    if (e.pointerType === 'touch' && e.clientX < innerWidth * 0.4 && e.clientY > innerHeight * 0.45 && joyId === null) { joyId = e.pointerId; joy.classList.add('on'); joy.style.left = (e.clientX - 60) + 'px'; joy.style.top = (e.clientY - 60) + 'px'; joy.dataset.cx = e.clientX; joy.dataset.cy = e.clientY; canvas.setPointerCapture(e.pointerId); return; }
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', e => {
    if (e.pointerId === joyId) { const dx = e.clientX - joy.dataset.cx, dy = e.clientY - joy.dataset.cy, l = Math.min(1, Math.hypot(dx, dy) / 50), a = Math.atan2(dy, dx); joyV = { x: Math.cos(a) * l, y: Math.sin(a) * l }; knob.style.transform = `translate(${Math.cos(a) * l * 40}px,${Math.sin(a) * l * 40}px)`; return; }
    if (drag && e.pointerId === drag.id) { cam.yaw -= (e.clientX - drag.x) * 0.006; cam.pitch = Math.max(0.08, Math.min(1.25, cam.pitch + (e.clientY - drag.y) * 0.004)); drag.x = e.clientX; drag.y = e.clientY; }
  });
  const pup = e => { if (e.pointerId === joyId) { joyId = null; joyV = { x: 0, y: 0 }; knob.style.transform = ''; joy.classList.remove('on'); } if (drag && e.pointerId === drag.id) drag = null; };
  canvas.addEventListener('pointerup', pup); canvas.addEventListener('pointercancel', pup);
  canvas.addEventListener('wheel', e => { cam.dist = Math.max(8, Math.min(45, cam.dist + e.deltaY * 0.02)); e.preventDefault(); }, { passive: false });
  jumpBtn.addEventListener('pointerdown', e => { e.preventDefault(); jumpQ = true; });
  actBtn.addEventListener('pointerdown', e => { e.preventDefault(); actQ = true; actHeld = true; });
  actBtn.addEventListener('pointerup', () => { actHeld = false; }); actBtn.addEventListener('pointerleave', () => { actHeld = false; });
  prompt.addEventListener('pointerdown', e => { e.preventDefault(); actQ = true; actHeld = true; });
  prompt.addEventListener('pointerup', () => { actHeld = false; });

  // ---------- the HG object other modules use ----------
  const HG = {
    scene, camera, player, colliders, block, V, interact: [], frames: [], wrap,
    // A chat line, Roblox style. color is the name color.
    chat(text, color = '#ffd21f', name = 'System') {
      const line = h('div', { class: 'hg-line' }, h('b', { style: `color:${color}` }, `[${name}] `), h('span', {}, text));
      chat.append(line); while (chat.children.length > 7) chat.firstChild.remove();
      setTimeout(() => line.classList.add('old'), 9000);
    },
    setCash(v, inc) { cashB.textContent = fmtCash(v); incS.textContent = inc ? `+$${fmtCash(inc)}/s` : ''; },
    bumpCash() { Juice.bump(cashB.parentNode); },
    setBoard(rows) { board.innerHTML = ''; board.append(h('div', { class: 'hg-bh' }, h('span', {}, 'Players'), h('span', {}, 'Cash'), h('span', {}, 'Pets'))); rows.forEach(r => board.append(h('div', { class: 'hg-br' + (r.me ? ' me' : '') }, h('span', {}, r.name), h('span', {}, '$' + fmtCash(r.cash)), h('span', {}, r.n)))); },
    rebuildPlayer,
    toast: Juice.toast,
    project(p) { const v = p.clone().project(camera); return [(v.x + 1) / 2 * wrap.clientWidth, (1 - v.y) / 2 * wrap.clientHeight, v.z < 1]; },
  };
  this.HG = HG;

  // ---------- portals in the plaza ----------
  const portal = (x, z, label, color, go) => {
    const g = grp(at(tor(2.6, 0.35, K3.glow(color, { emissiveIntensity: 0.9 }), Math.PI, 10, 30), 0, 2.6, 0, 0, 0, 0), at(bx(0.7, 2.6, 0.7, K3.mat(color)), -2.6, 1.3, 0), at(bx(0.7, 2.6, 0.7, K3.mat(color)), 2.6, 1.3, 0));
    const fillM = new THREE.MeshBasicMaterial({ color: K3.col(color), transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }); fillM.userData.own = true;
    g.add(at(new THREE.Mesh(new THREE.CircleGeometry(2.3, 32, 0, Math.PI), fillM), 0, 2.6, 0)); g.add(at(new THREE.Mesh(new THREE.PlaneGeometry(4.6, 2.6), fillM), 0, 1.3, 0));
    const lab = K3.label(label, { size: 48, h: 1, color: '#fff' }); lab.position.set(0, 6.6, 0); g.add(lab);
    g.position.set(x, 0, z); scene.add(g);
    HG.frames.push((dt, t) => { fillM.opacity = 0.28 + Math.sin(t * 3 + x) * 0.12; if (Math.abs(player.pos.x - x) < 2.4 && Math.abs(player.pos.z - z) < 0.9 && player.pos.y < 3) teleport(label, go); });
  };
  let teleporting = false;
  const teleport = (label, go) => {
    if (teleporting) return; teleporting = true; SFX.whoosh();
    wrap.append(h('div', { class: 'hg-teleport' }, h('b', {}, 'Teleporting'), h('span', {}, label)));
    setTimeout(() => go(), 650);
  };
  portal(-21, 66, 'Study Map', '#3d9bff', () => this.map());
  portal(-7, 66, 'Case Shop', '#ffb000', () => this.shop());
  portal(7, 66, 'Casino', '#b14cff', () => this.casino());
  portal(21, 66, 'Avatar', '#22c55e', () => this.character());

  // ---------- simulation ----------
  const fwd = V(), right = V(), mv = V();
  function physics(dt) {
    const ix = (keys.d || keys.arrowright ? 1 : 0) - (keys.a || keys.arrowleft ? 1 : 0) + joyV.x;
    const iz = (keys.w || keys.arrowup ? 1 : 0) - (keys.s || keys.arrowdown ? 1 : 0) - joyV.y;
    fwd.set(-Math.sin(cam.yaw), 0, -Math.cos(cam.yaw)); right.set(Math.cos(cam.yaw), 0, -Math.sin(cam.yaw));
    mv.copy(fwd).multiplyScalar(iz).addScaledVector(right, ix); if (mv.length() > 1) mv.normalize();
    const sprint = keys.shift || Math.hypot(joyV.x, joyV.y) > 0.95;
    const sp = (sprint ? 24 : 16) * player.speedK * (player.carry ? 0.72 : 1);
    const k = Math.min(1, dt * (player.onGround ? 14 : 5));
    player.vel.x += (mv.x * sp - player.vel.x) * k; player.vel.z += (mv.z * sp - player.vel.z) * k;
    player.vel.y -= 72 * dt;
    if (jumpQ && player.onGround) { player.vel.y = 25; player.onGround = false; tone([392, 523], 0.05, 'triangle', 0.04); }
    jumpQ = false;
    const p = player.pos; p.addScaledVector(player.vel, dt);
    // horizontal collisions (low boxes can be stepped onto)
    const R = 1.05;
    for (const c of colliders) {
      if (!c.on || c.y1 <= p.y + 0.8 || c.y0 >= p.y + 5) continue;
      const cx = Math.max(c.x0, Math.min(p.x, c.x1)), cz = Math.max(c.z0, Math.min(p.z, c.z1)), dx = p.x - cx, dz = p.z - cz, d2 = dx * dx + dz * dz;
      if (d2 < R * R) {
        if (d2 > 1e-6) { const d = Math.sqrt(d2), push = R - d; p.x += dx / d * push; p.z += dz / d * push; }
        else { const ox = Math.min(p.x - c.x0, c.x1 - p.x), oz = Math.min(p.z - c.z0, c.z1 - p.z); if (ox < oz) p.x = p.x - c.x0 < c.x1 - p.x ? c.x0 - R : c.x1 + R; else p.z = p.z - c.z0 < c.z1 - p.z ? c.z0 - R : c.z1 + R; }
      }
    }
    // ground: the highest surface under the player that they're at or just above
    let gy = 0;
    for (const c of colliders) if (c.on && p.x > c.x0 - 0.5 && p.x < c.x1 + 0.5 && p.z > c.z0 - 0.5 && p.z < c.z1 + 0.5 && c.y1 <= p.y + 0.85) gy = Math.max(gy, c.y1);
    if (p.y <= gy) { p.y = gy; if (player.vel.y < 0) player.vel.y = 0; player.onGround = true; } else player.onGround = p.y - gy < 0.05;
    p.x = Math.max(-200, Math.min(200, p.x)); p.z = Math.max(-200, Math.min(200, p.z));
    // face the way you move
    const hs = Math.hypot(player.vel.x, player.vel.z);
    if (hs > 0.6) { const ty = Math.atan2(player.vel.x, player.vel.z); let d = ty - player.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); player.yaw += d * Math.min(1, dt * 12); }
    player.obj.position.copy(p); player.obj.rotation.y = player.yaw;
    return Math.min(1, hs / 16);
  }
  const camT = V(), camP = V();
  function follow(dt) {
    camT.set(player.pos.x, player.pos.y + 4, player.pos.z);
    camP.set(camT.x + Math.sin(cam.yaw) * Math.cos(cam.pitch) * cam.dist, camT.y + Math.sin(cam.pitch) * cam.dist, camT.z + Math.cos(cam.yaw) * Math.cos(cam.pitch) * cam.dist);
    camera.position.lerp(camP, Math.min(1, dt * 10)); camera.lookAt(camT);
  }
  // nearest interactable within range shows a prompt
  let focus = null, holdT = 0;
  function interactions(dt) {
    let best = null, bd = 1e9, info = null;
    for (const it of HG.interact) {
      const pos = typeof it.pos === 'function' ? it.pos() : it.pos; if (!pos) continue;
      const d = Math.hypot(pos.x - player.pos.x, pos.z - player.pos.z); if (d > (it.r || 5) || d >= bd) continue;
      const t = it.text(); if (!t) continue; best = it; bd = d; info = t; best._p = pos;
    }
    if (best !== focus) { holdT = 0; focus = best; }
    if (!best) { prompt.hidden = true; actQ = false; return; }
    const [x, y, vis] = HG.project(best._p.clone().setY(best._p.y + (best.h || 3)));
    prompt.hidden = !vis; prompt.style.left = x + 'px'; prompt.style.top = y + 'px';
    const hold = info.hold || 0, pct = hold ? Math.min(1, holdT / hold) : 0;
    prompt.innerHTML = `<span class="hg-key" style="--p:${pct}"><i>E</i></span><span class="hg-ptxt"><small>${esc(info.object || '')}</small><b>${esc(info.action)}</b></span>`;
    prompt.classList.toggle('dis', !!info.disabled);
    if (info.disabled) { if (actQ) { SFX.bad(); actQ = false; } return; }
    if (hold) { if (actHeld) { holdT += dt; if (holdT >= hold) { holdT = 0; actHeld = false; best.act(); } } else holdT = 0; }
    else if (actQ) best.act();
    actQ = false;
  }

  let last = performance.now(), saveT = 0, alive = true;
  const tick = now => {
    if (!wrap.isConnected) {
      alive = false; removeEventListener('keydown', kd); removeEventListener('keyup', ku); removeEventListener('resize', size);
      document.body.classList.remove('in-hangout'); HG.frames.length = 0; K3.dispose(scene); ren.dispose(); ren.forceContextLoss();
      if (this.HG === HG) this.HG = null; return;
    }
    const rdt = Math.min(0.25, (now - last) / 1000), dt = Math.min(0.05, rdt); last = now; const t = now / 1000;
    const moving = physics(dt); follow(dt);
    player.obj.userData.tick(t, dt, moving);
    apple.rotation.y += dt * 0.5;
    for (const f of HG.frames.slice()) if (f(dt, t) === false) HG.frames.splice(HG.frames.indexOf(f), 1);
    interactions(rdt);
    if ((saveT += dt) > 3) { saveT = 0; saveState(); }
    ren.render(scene, camera);
    requestAnimationFrame(tick);
  };
  HG.chat('Welcome to Newton Plaza! Buy brainrots on the red carpet, and steal from other bases.', '#ffd21f');
  setTimeout(() => wrap.isConnected && tip.classList.add('fade'), 9000);
  if (typeof Brainrot !== 'undefined') Brainrot.start(HG, this);
  requestAnimationFrame(tick);
};

// $1.2K, $3.4M style cash numbers.
function fmtCash(v) {
  v = Math.floor(v);
  if (v < 1000) return String(v);
  const u = [['T', 1e12], ['B', 1e9], ['M', 1e6], ['K', 1e3]].find(([, n]) => v >= n);
  const x = v / u[1]; let t = x < 10 ? x.toFixed(2) : x < 100 ? x.toFixed(1) : String(Math.floor(x));
  if (t.includes('.')) t = t.replace(/0+$/, '').replace(/\.$/, '');
  return t + u[0];
}
