// 3D case opening: tap the case to crack it, its glow climbs toward the rarity you pulled, then the lid blasts off
// and the item rises out in a beam of light. Falls back to the 2D reel when WebGL isn't available.

const RCOL = { common: '#b9c3cf', rare: '#3d9bff', epic: '#b14cff', legendary: '#ffb000', mythic: '#ff3b5c' };
const caseHex = c => css(c.c) || '#3d9bff';

// The case: a glossy crate with a hinged lid, gold trim, a glowing seam, and a "?" badge.
function caseModel(c) {
  const { box, grp, at, cyl, metal } = AV3.prim, col = caseHex(c);
  const body = K3.mat(col, { roughness: 0.32, metalness: 0.15 }), trim = metal('#ffcc33'), dark = K3.mat(AV3.prim.shade(col, 0.55), { roughness: 0.4 });
  const g = grp();
  g.add(at(box(2.4, 1.5, 1.8, body), 0, 0.75, 0));
  g.add(at(box(2.46, 0.18, 1.86, trim), 0, 0.12, 0));
  [-0.75, 0.75].forEach(x => g.add(at(box(0.22, 1.52, 1.84, dark), x, 0.76, 0)));
  const badgeTex = K3.canvasTex(128, 128, (x, w) => { x.fillStyle = '#ffffff'; x.beginPath(); x.arc(w / 2, w / 2, w * 0.42, 0, 7); x.fill(); x.lineWidth = 10; x.strokeStyle = '#15171c'; x.stroke(); x.fillStyle = col; x.font = '700 80px Fredoka, Arial Black, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('?', w / 2, w / 2 + 5); });
  const badge = at(new THREE.Mesh(new THREE.CircleGeometry(0.42, 32), K3.own({ map: badgeTex, roughness: 0.4 })), 0, 0.78, 0.91);
  g.add(badge);
  const seam = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: K3.col(col), emissiveIntensity: 0.6 }); seam.userData.own = true;
  g.add(at(box(2.36, 0.07, 1.76, seam), 0, 1.53, 0));
  const lid = grp(at(box(2.5, 0.42, 1.9, body), 0, 0.21, 0.95), at(box(2.56, 0.1, 1.96, trim), 0, 0.02, 0.95), at(box(0.5, 0.18, 0.1, trim), 0, 0.1, 1.92));
  lid.position.set(0, 1.56, -0.95); g.add(lid);
  g.userData = { lid, seam, badge };
  return g;
}

// Case art for the shop and the card backs: a cached 3D snapshot of the case model.
const CASE_IMG = {};
const caseSVG2D = caseSVG;
caseSVG = function (c) {
  if (!K3.ok()) return caseSVG2D(c);
  if (!CASE_IMG[c.id]) { const m = caseModel(c); m.rotation.y = -0.45; CASE_IMG[c.id] = K3.shot(m, { w: 240, h: 180, dir: [0.25, 0.45, 1], fit: 0.95 }); }
  return `<img class="case3d" src="${CASE_IMG[c.id]}" alt="${esc(c.name)}" draggable="false">`;
};

// A flat 3D plaque for items that aren't objects (titles, confetti, arrow skins).
function plaque(it) {
  const tex = K3.canvasTex(512, 280, (x, w, hh) => {
    const gr = x.createLinearGradient(0, 0, 0, hh); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, RCOL[it.r] || '#9aa6b8'); x.fillStyle = gr; x.fillRect(0, 0, w, hh);
    x.lineWidth = 16; x.strokeStyle = '#15171c'; x.strokeRect(8, 8, w - 16, hh - 16);
    x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#15171c';
    x.font = '700 30px Fredoka, sans-serif'; x.fillText((SLOTS[it.slot] || 'Item').replace(/s$/, '').toUpperCase(), w / 2, 60);
    let fs = 64; x.font = `700 ${fs}px Fredoka, sans-serif`; while (x.measureText(it.name).width > w - 60 && fs > 26) { fs -= 4; x.font = `700 ${fs}px Fredoka, sans-serif`; }
    x.lineWidth = 8; x.strokeStyle = '#fff'; x.strokeText(it.name, w / 2, hh / 2 + 20); x.fillText(it.name, w / 2, hh / 2 + 20);
  });
  const m = K3.own({ map: tex, roughness: 0.4 });
  return new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.42, 0.14), [K3.mat('#15171c'), K3.mat('#15171c'), K3.mat('#15171c'), K3.mat('#15171c'), m, m]);
}
function revealObj(it) {
  const o = THUMB_SLOTS.includes(it.slot) ? AV3.itemObj(it) : plaque(it);
  const g = new THREE.Group(); g.add(o);
  // scale everything to about the same size
  const b = new THREE.Box3().setFromObject(o), sz = b.getSize(K3.V()), cen = b.getCenter(K3.V()), k = 2.3 / Math.max(sz.x, sz.y, sz.z, 0.01);
  o.position.sub(cen); g.scale.setScalar(k);
  return g;
}
const raysTex = () => K3.canvasTex(256, 256, (x, w) => { x.translate(w / 2, w / 2); for (let i = 0; i < 16; i++) { x.rotate(Math.PI / 8); const gr = x.createLinearGradient(0, 0, w / 2, 0); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.beginPath(); x.moveTo(0, 0); x.lineTo(w / 2, -12); x.lineTo(w / 2, 12); x.fill(); } });

Game.stage2D = Game.stage;
Game.stage = async function (c, results) {
  if (!K3.ok()) return this.stage2D(c, results);
  const app = $('#app'); app.innerHTML = '';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const items = results.map(drops => drops.find(d => d.kind === 'item'));
  const best = items.reduce((b, d) => RARITY_LIST.indexOf(d.it.r) > RARITY_LIST.indexOf(b.it.r) || (d.shiny && !b.shiny && d.it.r === b.it.r) ? d : b, items[0]);
  const topLvl = RARITY_LIST.indexOf(best.it.r);
  const ctl = { skip: false };
  const hint = h('div', { class: 'cs-hint' }, 'Tap the case!');
  const dots = h('div', { class: 'cs-dots' }, [0, 1, 2].map(() => h('i')));
  const host = h('div', { class: 'cs-view', style: `--gc:${caseHex(c)}` });
  const stage = h('section', { class: 'stage' });
  app.append(h('div', { class: 'lvl-head' }, h('button', { class: 'btn small', onclick: () => this.shop() }, '< Shop'),
    h('h2', {}, `${c.name}${results.length > 1 ? ` x${results.length}` : ''}`),
    h('button', { class: 'btn small', onclick: () => { ctl.skip = true; crack(); } }, 'Skip')),
    h('div', { class: 'cs-wrap' }, host, hint, dots), stage);

  const v = K3.view(host, { h: Math.min(460, Math.max(320, innerHeight * 0.52)), cam: [0, 3.3, 8.6], target: [0, 1.5, 0], drag: false, auto: 0, fov: 38 });
  const { grp, at, cyl, tor } = AV3.prim;
  const ringM = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: K3.col(caseHex(c)), emissiveIntensity: 1 }); ringM.userData.own = true;
  const ped = grp(at(cyl(2.0, 2.2, 0.5, K3.mat('#2a2f3a', { roughness: 0.5 }), 40), 0, -0.25, 0), at(tor(2.05, 0.06, ringM, Math.PI * 2, 8, 60), 0, 0.02, 0, Math.PI / 2));
  v.scene.add(ped, K3.blob(3.6, 0.4));
  const light = new THREE.PointLight(K3.col(caseHex(c)), 1.2, 12); light.position.set(0, 2.2, 1.6); v.scene.add(light);
  const rays = new THREE.Sprite(new THREE.SpriteMaterial({ map: raysTex(), color: K3.col(caseHex(c)), transparent: true, opacity: 0.25, depthWrite: false, blending: THREE.AdditiveBlending }));
  rays.material.userData.own = true; rays.position.set(0, 1.4, -1.2); rays.scale.setScalar(6); v.scene.add(rays);
  const crate = caseModel(c); v.scene.add(crate);
  const ambient = () => v.burst(K3.V((Math.random() - 0.5) * 6, 0, (Math.random() - 0.5) * 3), [caseHex(c), '#ffffff'], 3, { speed: 0.3, up: 1.4, grav: -0.4, life: 2.5, size: 0.16 });
  let t0 = 0, level = -1, taps = 0, opened = false;
  v.frames.push((dt, t) => {
    rays.material.rotation += dt * (0.25 + Math.max(0, level) * 0.25);
    if (!opened) { crate.rotation.y = Math.sin(t * 0.8) * 0.25; crate.position.y = Math.abs(Math.sin(t * 2.2)) * 0.06 * (1 + taps); }
    if ((t0 += dt) > 0.25) { t0 = 0; ambient(); }
  });
  const setGlow = (hex, k) => {
    crate.userData.seam.emissive = K3.col(hex); crate.userData.seam.emissiveIntensity = 0.6 + k * 1.4;
    ringM.emissive = K3.col(hex); light.color = K3.col(hex); light.intensity = 1.2 + k * 2.5; rays.material.color = K3.col(hex); rays.material.opacity = 0.25 + k * 0.45; rays.scale.setScalar(6 + k * 5);
    host.style.setProperty('--gc', hex);
  };
  // The glow climbs one rarity step at a time toward what you pulled; the last tap shows the real rarity.
  const stepLevel = n => n >= 3 ? topLvl : Math.min(topLvl, Math.round(topLvl * n / 3));

  const tap = async () => {
    if (opened || taps >= 3) return;
    taps++; [...dots.children].forEach((d, i) => d.classList.toggle('on', i < taps));
    const lvl = stepLevel(taps), up = lvl > level; level = lvl;
    const hex = RCOL[RARITY_LIST[lvl]], k = (lvl + 1) / 5;
    setGlow(hex, k);
    tone([330 + lvl * 110 + taps * 40, 440 + lvl * 140 + taps * 60], 0.07, 'triangle', 0.06);
    if (up && lvl >= 2) { tone([660 + lvl * 120, 880 + lvl * 160, 1100 + lvl * 160], 0.06, 'square', 0.035); FX.flash(hex, 500); }
    FX.shake(host, 0.4 + taps * 0.3 + lvl * 0.25);
    v.burst(K3.V(0, 1.4, 0.6), [hex, '#ffffff'], 30 + lvl * 25, { speed: 5 + lvl, up: 4, life: 1, size: 0.28 });
    hint.textContent = taps < 3 ? ['Again!', 'One more!'][taps - 1] : 'Here it comes...';
    await K3.tween(v, 0.12, e => crate.scale.set(1 + e * 0.15, 1 - e * 0.25, 1 + e * 0.15));
    await K3.tween(v, 0.35, e => crate.scale.set(1.15 - e * 0.15, 0.75 + e * 0.25, 1.15 - e * 0.15), K3.ease.elastic);
    if (taps >= 3) crack();
  };
  host.addEventListener('pointerdown', tap);
  const keys = e => { if ((e.key === ' ' || e.key === 'Enter') && !opened) { e.preventDefault(); tap(); } };
  document.addEventListener('keydown', keys);

  let cracked = false;
  async function crack() {
    if (cracked) return; cracked = true; opened = true; document.removeEventListener('keydown', keys);
    level = topLvl; const hex = RCOL[best.it.r]; setGlow(hex, 1);
    dots.remove(); hint.textContent = '';
    if (!ctl.skip && !reduce) { for (let i = 0; i < 6; i++) { FX.shake(host, 0.6 + i * 0.25); crate.rotation.z = (Math.random() - 0.5) * 0.12 * (1 + topLvl); await new Promise(r => setTimeout(r, 70)); } crate.rotation.z = 0; }
    SFX.boom();
    // lid blasts off, beam of light, particles
    const lid = crate.userData.lid;
    K3.tween(v, 0.9, e => { lid.position.y = 1.56 + e * 6; lid.rotation.x = -e * 2.4; lid.position.z = -0.95 - e * 2; });
    const beamM = new THREE.MeshBasicMaterial({ color: K3.col(hex), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }); beamM.userData.own = true;
    const beam = at(new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.15, 16, 32, 1, true), beamM), 0, 9, 0); v.scene.add(beam);
    K3.tween(v, 0.4, e => { beamM.opacity = e * 0.45; beam.scale.set(0.3 + e * 0.7, 1, 0.3 + e * 0.7); }).then(() => K3.tween(v, 1.2, e => { beamM.opacity = 0.45 - e * 0.3; }));
    const c0 = v.target.clone(); K3.tween(v, 1, e => { v.target.set(0, c0.y + e * 0.9, 0); v.camera.lookAt(v.target); });
    v.burst(K3.V(0, 1.6, 0), [hex, '#ffffff', RCOL.legendary], 120 + topLvl * 60, { speed: 7 + topLvl * 1.5, up: 7, life: 1.6, size: 0.34 });
    if (topLvl >= 3) setTimeout(() => v.alive && v.burst(K3.V(0, 3, 0), [hex, '#ffffff'], 160, { speed: 10, up: 9, life: 2, size: 0.4 }), 350);
    revealFX(best, stage);
    // the item rises out of the case and spins
    const obj = revealObj(best.it); obj.position.set(0, 1.2, 0); obj.scale.multiplyScalar(0.01); const full = obj.scale.x * 100;
    if (best.shiny) AV3.shinyFx(obj.children[0], 1.6);
    v.scene.add(obj);
    K3.tween(v, 0.9, e => { obj.position.y = 1.2 + e * 1.75; obj.scale.setScalar(full * Math.max(0.01, e)); }, K3.ease.back);
    K3.tween(v, 0.8, e => crate.scale.setScalar(1 - e * 0.55)).then(() => K3.tween(v, 0.6, e => { crate.position.y = -e * 1.2; }));
    v.frames.push((dt, t) => { obj.rotation.y += dt * 1.1; obj.children[0].userData.tick && obj.children[0].userData.tick(t, dt, 0); obj.traverse(o => o.userData.update && o.userData.update(t)); });
    host.insertAdjacentHTML('beforeend', `<div class="cs-name" style="--rc:var(${RARITY[best.it.r].c})"><span>${best.shiny ? 'SHINY ' : ''}${RARITY[best.it.r].name}${results.length > 1 ? ' (best pull)' : ''}</span><b>${esc(best.it.name)}</b></div>`);
    await new Promise(r => setTimeout(r, ctl.skip || reduce ? 50 : 900));
    if (results.length === 1) stage.append(Game.dropCard(c, results[0], stage));
    else await Game.multi(c, results, stage, { skip: false });
  }
  if (reduce) crack();
};
