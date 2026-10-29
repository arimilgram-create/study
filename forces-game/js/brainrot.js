// Steal-a-Brainrot style game inside the hangout. Brainrots walk down the red carpet; buy them and they walk to your
// base, where they earn cash on your pads. Sneak into rival bases to steal theirs (the owner chases you), and stop
// rivals stealing yours. Lock your base with lasers. Answer a physics question at the Study Terminal for 2x cash.
// Every brainrot you own unlocks as a pet for your avatar.

const BR_RAR = {
  common: { n: 'Common', c: '#b9c3cf' }, rare: { n: 'Rare', c: '#3d9bff' }, epic: { n: 'Epic', c: '#b14cff' }, legendary: { n: 'Legendary', c: '#ffb000' },
  mythic: { n: 'Mythic', c: '#ff3b5c' }, god: { n: 'Brainrot God', c: '#ffe14d' }, secret: { n: 'Secret', c: '#e6e6e6' },
};
const BRP = () => AV3.prim;
// Little legs with sneakers, so a brainrot can walk.
function brLegs(g, color = '#1b1d22', shoe = '#ffffff', sp = 0.42, hh = 0.8) {
  const { cyl, box, at, grp } = BRP(), legs = [];
  [-1, 1].forEach(s => { const l = grp(at(cyl(0.13, 0.13, hh, K3.mat(color)), 0, -hh / 2, 0), at(box(0.34, 0.2, 0.5, K3.mat(shoe)), 0, -hh, 0.08)); l.position.set(s * sp, hh + 0.1, 0); g.add(l); legs.push(l); });
  g.userData.legs = legs; return g;
}
const BRAINROTS = [
  { id: 'appleo', name: 'Appleo Newtonino', r: 'common', price: 25, inc: 1, w: 30, build: () => { const { sph, cyl, at, grp, eyesOn } = BRP(); const g = grp(at(sph(1, K3.mat('#e0263f', { roughness: 0.3 })), 0, 1.9, 0), at(cyl(0.08, 0.08, 0.5, K3.mat('#5a3825')), 0, 3.05, 0), at(sph(0.3, K3.mat('#22a03a'), 10, 8), 0.3, 3.1, 0)); const m = AV3.FACES.mustache('#3b2a1a'); m.position.set(0, 1.85, 0.98); m.scale.setScalar(1.6); g.add(m); eyesOn(g, 2.2, 0.92, 0.32, 0.12); return brLegs(g); } },
  { id: 'frictionini', name: 'Frictionini Gattino', r: 'common', price: 60, inc: 2, w: 25, build: () => { const { sph, cone, box, cyl, at, grp, eyesOn } = BRP(); const m = K3.mat('#ff9f43'); const g = grp(at(sph(0.85, m), 0, 1.5, 0), at(sph(0.62, m), 0, 2.6, 0.15), at(cone(0.2, 0.4, m, 4), 0.35, 3.15, 0.1, 0, Math.PI / 4, -0.3), at(cone(0.2, 0.4, m, 4), -0.35, 3.15, 0.1, 0, Math.PI / 4, 0.3)); [-1, 1].forEach(s => { g.add(at(box(0.5, 0.25, 0.9, K3.mat('#ff4fb4')), s * 0.4, 0.45, 0)); [-0.3, 0.3].forEach(z => g.add(at(cyl(0.12, 0.12, 0.12, K3.mat('#ffd21f'), 12), s * 0.4, 0.2, z, 0, 0, Math.PI / 2))); }); eyesOn(g, 2.7, 0.7, 0.22, 0.09); return g; } },
  { id: 'tungtorque', name: 'Tung Tung Torque', r: 'rare', price: 250, inc: 6, w: 13, build: () => { const { cyl, at, grp, eyesOn, box } = BRP(); const g = grp(at(cyl(0.75, 0.8, 2.6, K3.mat('#a0703c', { roughness: 0.9 })), 0, 2.1, 0), at(cyl(0.7, 0.7, 0.04, K3.mat('#e2b77a')), 0, 3.42, 0)); eyesOn(g, 2.8, 0.72, 0.25, 0.12); g.add(at(box(0.4, 0.08, 0.05, K3.mat('#1b1d22')), 0, 2.35, 0.78)); const bat = at(cyl(0.08, 0.13, 1.8, K3.mat('#c9a26b')), 1.05, 2.2, 0.3, 0, 0, -0.4); g.add(bat); return brLegs(g, '#7a4b2a'); } },
  { id: 'vectorino', name: 'Vectorino Squalo', r: 'rare', price: 500, inc: 11, w: 10, build: () => { const { sph, cone, at, grp, eyesOn } = BRP(); const m = K3.mat('#6f8fb0'); const body = at(sph(0.9, m), 0, 2.1, 0); body.scale.set(0.9, 1.6, 0.9); const g = grp(body, at(cone(0.35, 0.8, m, 10), 0, 2.2, -0.75, -1.2), at(cone(0.3, 0.6, m, 8), 0, 3.6, 0, 0, 0, 0)); const belly = at(sph(0.7, K3.mat('#f4f1ee')), 0, 1.9, 0.35); belly.scale.set(0.8, 1.3, 0.6); g.add(belly); eyesOn(g, 2.9, 0.62, 0.3, 0.1); return brLegs(g, '#6f8fb0', '#1e74e8'); } },
  { id: 'inertiolo', name: 'Inertiolo Bananino', r: 'epic', price: 2000, inc: 35, w: 6, build: () => { const { tor, at, grp } = BRP(); const g = grp(at(tor(1.0, 0.45, K3.mat('#ffe14d'), Math.PI * 0.85, 12, 24), 0.75, 2.2, 0, 0, 0, Math.PI * 0.6)); const sh = AV3.FACES.shades(); sh.position.set(0.1, 2.75, 0.45); sh.scale.setScalar(1.3); g.add(sh); return brLegs(g, '#c9a400'); } },
  { id: 'gravitello', name: 'Gravitello Elefantino', r: 'epic', price: 4000, inc: 60, w: 4.5, build: () => { const { sph, cyl, at, grp, eyesOn } = BRP(); const m = K3.mat('#9aa4b0'); const g = grp(at(sph(0.95, m), 0, 1.6, 0), at(sph(0.7, m), 0, 2.7, 0.3), at(cyl(0.16, 0.1, 1.0, m), 0, 2.3, 0.95, 0.5)); [-1, 1].forEach(s => { const e = at(sph(0.5, K3.mat('#c9a0a8')), s * 0.7, 2.75, 0.1); e.scale.set(0.3, 1, 1); g.add(e); }); g.add(at(cyl(0.01, 0.01, 2.2, K3.mat('#ffffff')), 0.6, 4.0, 0)); g.add(at(sph(0.55, K3.mat('#e0263f', { roughness: 0.2 })), 0.6, 5.3, 0)); eyesOn(g, 2.85, 0.92, 0.25, 0.09); return brLegs(g, '#9aa4b0', '#9aa4b0'); } },
  { id: 'momentumo', name: 'Momentumo Coccodrillo', r: 'legendary', price: 15000, inc: 200, w: 2.5, build: () => { const { box, cone, sph, at, grp, eyesOn } = BRP(); const m = K3.mat('#3f9a3f'); const g = grp(at(box(1.0, 1.0, 2.6, m), 0, 2.0, 0), at(box(0.9, 0.5, 1.2, m), 0, 1.9, 1.7), at(box(3.4, 0.12, 0.8, K3.mat('#aab4c0')), 0, 2.3, 0), at(cone(0.3, 0.9, K3.mat('#aab4c0'), 8), 0, 2.0, -1.7, -Math.PI / 2)); const f = at(cone(0.3, 0.8, K3.glow('#ff7a1a', { emissiveIntensity: 1.5 }), 8), 0, 2.0, -2.4, -Math.PI / 2); f.userData.flame = 1; g.add(f); eyesOn(g, 2.55, 1.1, 0.25, 0.1); return brLegs(g, '#3f9a3f', '#1b1d22', 0.35, 1.3); } },
  { id: 'accelerina', name: 'Accelerina Ballerina', r: 'legendary', price: 30000, inc: 350, w: 1.6, build: () => { const { cyl, tor, cone, sph, at, grp, eyesOn } = BRP(); const g = grp(at(cyl(0.7, 0.5, 0.9, K3.mat('#ffffff', { roughness: 0.2 })), 0, 3.0, 0), at(tor(0.25, 0.07, K3.mat('#ffffff'), Math.PI * 2, 8, 16), 0.75, 3.0, 0, 0, 0, Math.PI / 2), at(cyl(0.6, 0.6, 0.06, K3.mat('#6b3e1e')), 0, 3.43, 0), at(cone(1.0, 0.7, K3.mat('#ff8ab0'), 20), 0, 2.2, 0, Math.PI), at(sph(0.4, K3.mat('#ff8ab0')), 0, 2.45, 0)); eyesOn(g, 3.05, 0.62, 0.22, 0.08); g.userData.spinY = 2.2; return brLegs(g, '#ffe0ea', '#ff4f8b', 0.25, 1.6); } },
  { id: 'newtonzilla', name: 'Newtonzilla Pizzaiolo', r: 'mythic', price: 120000, inc: 1200, w: 0.8, build: () => { const p = AV3.PETS.dino('#2f8f3a'); p.scale.setScalar(2.2); const g = BRP().grp(p); const hat = AV3.HATS.chef(); hat.position.set(0, 2.95, 0.4); hat.scale.setScalar(0.9); g.add(hat); g.add(BRP().at(BRP().cyl(0.7, 0.7, 0.08, K3.mat('#ffcc66')), 1.1, 1.8, 0.8, 0.3)); return g; } },
  { id: 'frizione', name: 'Frizione Fantasma', r: 'mythic', price: 250000, inc: 2200, w: 0.5, build: () => { const p = AV3.PETS.ghost(); p.scale.setScalar(2.6); const g = BRP().grp(p); const hat = AV3.HATS.cone(); hat.position.set(0, 3.4, 0); hat.scale.setScalar(0.8); g.add(hat); g.userData.float = 1; return g; } },
  { id: 'ladivina', name: 'La Forza Divina', r: 'god', price: 1000000, inc: 8000, w: 0.18, build: () => { const { sph, at, grp, eyesOn } = BRP(); const g = grp(at(sph(1.2, K3.mat('#ffcc33', { metalness: 0.6, roughness: 0.25, emissive: K3.col('#ff9f00'), emissiveIntensity: 0.25 })), 0, 2.4, 0)); const cr = AV3.HATS.crown('#ffe066'); cr.position.set(0, 3.5, 0); cr.scale.setScalar(1.3); g.add(cr); const ha = AV3.HATS.halo(); ha.position.set(0, 3.9, 0); ha.scale.setScalar(1.6); g.add(ha); eyesOn(g, 2.6, 1.1, 0.4, 0.13); const a = AV3.aura('sparkle'); a.scale.setScalar(0.7); g.add(a); g.userData.float = 1; return brLegs(g, '#ffcc33', '#ffffff'); } },
  { id: 'segreto', name: 'Il Segreto Quantico', r: 'secret', price: 5000000, inc: 30000, w: 0.05, build: () => { const { box, tor, sph, at, grp } = BRP(); const g = grp(at(box(1.8, 1.8, 1.8, K3.mat('#0b0b12', { roughness: 0.2 })), 0, 2.6, 0)); [-0.4, 0.4].forEach(x => g.add(at(sph(0.16, K3.glow('#ffffff', { emissiveIntensity: 2 })), x, 2.8, 0.92))); ['#ff3b3b', '#ffe14d', '#3ddc5a', '#3d9bff', '#a855ff'].forEach((c, i) => { const r = at(tor(1.6 + i * 0.12, 0.04, K3.glow(c, { emissiveIntensity: 1.2 }), Math.PI * 2, 6, 40), 0, 2.6, 0, Math.PI / 2 + i * 0.3, i * 0.6, 0); r.userData.spin = 0.6 + i * 0.3; g.add(r); }); g.userData.float = 1; return g; } },
];
const BR = Object.fromEntries(BRAINROTS.map(b => [b.id, b]));
const brPick = () => { const tot = BRAINROTS.reduce((a, b) => a + b.w, 0); let r = Math.random() * tot; for (const b of BRAINROTS) if ((r -= b.w) < 0) return b; return BRAINROTS[0]; };

// Every brainrot is also a pet you can wear (you unlock it by owning it in the game). Not in cases, can't be sold.
BRAINROTS.forEach(b => {
  const it = { id: 'br_' + b.id, slot: 'pet', r: { god: 'mythic', secret: 'mythic' }[b.r] || b.r, name: b.name, set: 'br', noCase: true, noTrade: true,
    d: `${BR_RAR[b.r].n} brainrot. Earns $${fmtCash(b.inc)}/s in your base. Unlocked in the Hangout.`, build: () => { const g = b.build(); g.scale.setScalar(0.48); return g; } };
  ITEMS.push(it); ITEM[it.id] = it;
});

const Brainrot = {
  start(HG, game) {
    const s = game.state, V = HG.V, { at, grp, tor, box: bx, cyl } = AV3.prim;
    const st = s.br = s.br || { cash: 100, pads: Array(8).fill(null), last: Date.now(), lockUntil: 0, lockReady: 0, boostUntil: 0, studyReady: 0,
      rivals: { A: ['appleo', 'frictionini', 'frictionini', 'tungtorque', 'vectorino', null, null, null], B: ['frictionini', 'inertiolo', 'gravitello', 'tungtorque', 'momentumo', 'appleo', null, null] }, rcash: { A: 2400, B: 9100 } };
    const now = () => Date.now();
    const boost = () => now() < st.boostUntil ? 2 : 1;
    const income = pads => pads.reduce((a, p) => a + (p ? BR[p.t || p].inc : 0), 0);

    // ---------- bases ----------
    function makeBase(o) {
      const { cx, cz, side } = o, open = cx + side * 11;
      HG.block(cx, 0, cz, 22, 0.4, 20, o.floor, { solid: true });
      HG.block(cx - side * 10.6, 0.4, cz, 0.8, 3, 20, o.wall);
      HG.block(cx, 0.4, cz - 9.6, 22, 3, 0.8, o.wall); HG.block(cx, 0.4, cz + 9.6, 22, 3, 0.8, o.wall);
      const lm = new THREE.MeshBasicMaterial({ color: 0xff2a3d, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false }); lm.userData.own = true;
      const laser = new THREE.Mesh(new THREE.PlaneGeometry(18.4, 4.5), lm); laser.rotation.y = Math.PI / 2; laser.position.set(open, 2.65, cz); laser.visible = false; HG.scene.add(laser);
      const lcol = { x0: open - 0.4, x1: open + 0.4, z0: cz - 9.2, z1: cz + 9.2, y0: 0, y1: 6, on: false }; HG.colliders.push(lcol);
      const pads = [];
      for (let i = 0; i < 8; i++) {
        const col = i % 2, row = Math.floor(i / 2), px = cx - side * 5 + side * col * 6.5, pz = cz - 6.6 + row * 4.4;
        HG.block(px, 0.4, pz, 3.2, 0.5, 3.2, o.pad);
        const ring = at(tor(1.7, 0.08, K3.glow(o.glow, { emissiveIntensity: 0.6 }), Math.PI * 2, 6, 30), px, 0.95, pz, Math.PI / 2); HG.scene.add(ring);
        pads.push({ pos: V(px, 0.9, pz), ent: null, label: null, ring });
      }
      const sign = K3.label(o.label, { size: 52, h: 1.2, color: o.signColor || '#fff' }); sign.position.set(open + side * 0.5, 7.2, cz); HG.scene.add(sign);
      HG.block(open, 0, cz - 10.4, 1, 6, 1, o.wall); HG.block(open, 0, cz + 10.4, 1, 6, 1, o.wall);
      return Object.assign(o, { open, pads, laser, lcol, inside: p => Math.abs(p.x - cx) < 11 && Math.abs(p.z - cz) < 10 });
    }
    const me = makeBase({ cx: -20, cz: -22, side: 1, floor: '#d9e4f2', wall: '#1e74e8', pad: '#eef2f7', glow: '#3d9bff', label: `${s.avatar.name}'s Base`, signColor: '#9fd2ff' });
    const rivals = {
      A: Object.assign(makeBase({ cx: 20, cz: -22, side: -1, floor: '#f2e3d9', wall: '#e0263f', pad: '#f7efe9', glow: '#ff5a6e', label: 'NoobMaster\'s Base', signColor: '#ffb3bd' }), { key: 'A', name: 'NoobMaster', color: '#ff5a6e', look: { name: 'NoobMaster', skin: 1, hair: 'none', hairColor: 0, eyes: 'dots', mouth: 'smile', shirt: 0, pants: '#2b8a3e' }, equip: {} }),
      B: Object.assign(makeBase({ cx: 20, cz: -52, side: -1, floor: '#e6f2d9', wall: '#22a03a', pad: '#eef7e9', glow: '#5ee36b', label: 'Guest_1337\'s Base', signColor: '#c6f5b0' }), { key: 'B', name: 'Guest_1337', color: '#5ee36b', look: { name: 'Guest_1337', skin: 3, hair: 'spiky', hairColor: 6, eyes: 'wink', mouth: 'smirk', shirt: 4, pants: '#1b1d22' }, equip: { hat: 'h_cap_blue', shirt: 'sh_hoodie', pet: 'pt_robot' } }),
    };
    // collect plate, lock button, and study terminal in your base
    const plateM = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x22c55e, emissiveIntensity: 0.5 }); plateM.userData.own = true;
    const plate = at(bx(3.4, 0.14, 3.4, plateM), me.cx + 7.6, 0.47, me.cz + 6.4); HG.scene.add(plate);
    const plateLab = K3.label('COLLECT', { size: 40, h: 0.7, color: '#bfffd0' }); plateLab.position.set(plate.position.x, 2.2, plate.position.z); HG.scene.add(plateLab);
    const lockBtn = HG.block(me.cx + 7.6, 0.4, me.cz - 6.4, 2.2, 0.7, 2.2, '#e0263f');
    const lockLab = K3.label('LOCK', { size: 40, h: 0.7, color: '#ffd6db' }); lockLab.position.set(lockBtn.position.x, 2.6, lockBtn.position.z); HG.scene.add(lockLab);
    const term = HG.block(me.cx - 8.6, 0.4, me.cz, 1.6, 3.2, 1.6, '#2b3442');
    const scr = at(bx(1.3, 1.0, 0.05, K3.glow('#00e5ff', { emissiveIntensity: 0.9 })), me.cx - 7.75, 3.0, me.cz, 0, Math.PI / 2); HG.scene.add(scr);
    const termLab = K3.label('STUDY\nTERMINAL', { size: 36, h: 0.6, color: '#9ff3ff' }); termLab.position.set(me.cx - 8.6, 5.4, me.cz); HG.scene.add(termLab);

    // ---------- carpet + spawner ----------
    HG.block(0, 0, -25, 6, 0.12, 112, '#c81e3a', { solid: false });
    HG.block(-3.6, 0, -25, 1.2, 0.3, 112, '#ffcc33', { solid: false }); HG.block(3.6, 0, -25, 1.2, 0.3, 112, '#ffcc33', { solid: false });
    HG.block(-5, 0, -82, 1.5, 9, 1.5, '#7b2ff7'); HG.block(5, 0, -82, 1.5, 9, 1.5, '#7b2ff7'); HG.block(0, 9, -82, 11.5, 1.5, 1.5, '#7b2ff7');
    const spl = K3.label('BRAINROT SPAWNER', { size: 48, h: 1.1, color: '#ffe14d' }); spl.position.set(0, 11.6, -82); HG.scene.add(spl);

    // ---------- brainrot entities ----------
    const ents = [];
    function entLabel(e) {
      if (e.label) { e.obj.remove(e.label); e.label.material.map.dispose(); e.label.material.dispose(); }
      const b = BR[e.t], r = BR_RAR[b.r];
      let txt = `${b.name}\n${r.n}\n$${fmtCash(b.inc)}/s`;
      if (e.state === 'walk') txt = `${b.name}\n${r.n}\n$${fmtCash(b.price)}`;
      if (e.state === 'pad' && e.owner === 'me') txt = `${b.name}\n$${fmtCash(b.inc * boost())}/s\n$${fmtCash(e.stored || 0)}`;
      e.label = K3.label(txt, { size: 40, h: 0.62, color: b.r === 'common' ? '#ffffff' : r.c });
      e.label.position.y = e.top + 1.1; e.obj.add(e.label);
    }
    function spawn(t, pos, state, owner, padIdx) {
      const b = BR[t], obj = b.build(); obj.position.copy(pos); HG.scene.add(obj);
      const top = new THREE.Box3().setFromObject(obj).max.y - pos.y;
      obj.add(K3.blob(2.4));
      const e = { t, obj, pos: obj.position, state, owner, padIdx, top, stored: 0, target: null, speed: 3.5, seen: {} };
      ents.push(e); entLabel(e);
      if (state === 'walk') { e.prompt = carpetPrompt(e); HG.interact.push(e.prompt); }
      return e;
    }
    function remove(e) { HG.scene.remove(e.obj); K3.dispose(e.obj); ents.splice(ents.indexOf(e), 1); if (e.prompt) HG.interact.splice(HG.interact.indexOf(e.prompt), 1); }
    function seat(base, i, e) { const pad = base.pads[i]; pad.ent = e; e.state = 'pad'; e.padIdx = i; e.pos.copy(pad.pos); e.obj.rotation.y = base.side > 0 ? Math.PI / 2 : -Math.PI / 2; entLabel(e); }
    const freePad = base => base.pads.findIndex(p => !p.ent && !p.reserved);
    // build the saved bases
    st.pads.forEach((p, i) => { if (p) { const e = spawn(p.t, me.pads[i].pos.clone(), 'pad', 'me', i); e.stored = p.stored || 0; seat(me, i, e); } });
    Object.values(rivals).forEach(rv => st.rivals[rv.key].forEach((t, i) => { if (t && BR[t]) seat(rv, i, spawn(t, rv.pads[i].pos.clone(), 'pad', rv.key, i)); }));
    // Saves both bases. A brainrot being carried counts as still on the pad it came from.
    const persist = () => {
      const pc = HG.player.carry;
      st.pads = me.pads.map((p, i) => p.ent ? { t: p.ent.t, stored: Math.floor(p.ent.stored || 0) } : (Object.values(rivals).find(rv => rv.carry && rv.goal === i) ? { t: Object.values(rivals).find(rv => rv.carry && rv.goal === i).carry.t, stored: 0 } : null));
      Object.values(rivals).forEach(rv => { st.rivals[rv.key] = rv.pads.map((p, i) => p.ent ? p.ent.t : pc && pc.from && pc.from.rv === rv && pc.from.i === i ? pc.t : null); });
      st.last = now();
    };
    // offline earnings: half rate, up to 30 minutes
    const away = Math.min(1800, Math.max(0, (now() - (st.last || now())) / 1000));
    if (away > 30) { let made = 0; me.pads.forEach(p => { if (p.ent) { const m = BR[p.ent.t].inc * away * 0.5; p.ent.stored += m; made += m; entLabel(p.ent); } }); if (made >= 1) HG.chat(`While you were away your brainrots made $${fmtCash(made)}. Walk onto the green COLLECT plate in your base!`, '#5ee36b'); }

    const unlockPet = t => {
      const id = 'br_' + t;
      if (s.inv[id]) return;
      s.inv[id] = 1; s.recentIds = [id, ...(s.recentIds || []).filter(x => x !== id)].slice(0, 30);
      HG.chat(`New pet unlocked: ${BR[t].name}! Wear it from your Avatar (Pets).`, '#ffd21f'); HG.toast('NEW PET!', 'hot'); SFX.win();
    };
    const landed = (e) => { seat(me, e.padIdx, e); me.pads[e.padIdx].reserved = false; e.owner = 'me'; unlockPet(e.t); persist(); saveState(); };

    // ---------- rivals ----------
    Object.values(rivals).forEach((rv, k) => {
      rv.obj = AV3.build(rv.look, rv.equip); const tag = K3.label(rv.name, { size: 44, h: 0.8, color: rv.color }); tag.position.y = 7.2; rv.obj.add(tag);
      rv.pos = rv.obj.position; rv.pos.set(rv.cx, 0.4, rv.cz); HG.scene.add(rv.obj);
      rv.state = 'home'; rv.target = rv.pos.clone(); rv.wait = 2; rv.stealIn = 50 + k * 35; rv.lockIn = 70 + k * 40; rv.lockUntil = 0; rv.carry = null; rv.yaw = 0;
    });
    const setLock = (base, on) => { base.laser.visible = on; base.lcol.on = on; };

    // ---------- interactions ----------
    const cash = () => st.cash;
    // carpet brainrots: buy
    function carpetPrompt(e) { return { r: 4.5, pos: () => e.state === 'walk' ? e.pos : null, h: e.top + 0.6, text: () => {
      if (e.state !== 'walk') return null; const b = BR[e.t];
      if (freePad(me) < 0) return { object: b.name, action: 'Base full! Sell one first', disabled: true };
      return { object: `${b.name} · ${BR_RAR[b.r].n}`, action: `Buy $${fmtCash(b.price)}`, disabled: cash() < b.price };
    }, act() { const b = BR[e.t], i = freePad(me); if (i < 0 || cash() < b.price || e.state !== 'walk') return; st.cash -= b.price; me.pads[i].reserved = true; e.state = 'toBase'; e.owner = 'me'; e.padIdx = i; e.target = me.pads[i].pos.clone(); e.speed = 13; entLabel(e); SFX.coin(); tone([523, 784, 1047], 0.06, 'triangle', 0.06); HG.chat(`You bought ${b.name}!`, '#5ee36b'); refreshUI(); } }; }
    // your pads: sell
    me.pads.forEach((pad, i) => HG.interact.push({ r: 3, pos: () => pad.ent && pad.ent.state === 'pad' ? pad.pos : null, h: 3.5, text: () => pad.ent ? { object: BR[pad.ent.t].name, action: `Sell $${fmtCash(BR[pad.ent.t].price / 2)}`, hold: 0.7 } : null,
      act() { const e = pad.ent; if (!e) return; st.cash += BR[e.t].price / 2 + (e.stored || 0); pad.ent = null; remove(e); SFX.coin(); HG.chat(`Sold ${BR[e.t].name}.`, '#9aa4b0'); persist(); refreshUI(); } }));
    // rival pads: steal
    Object.values(rivals).forEach(rv => rv.pads.forEach((pad, i) => HG.interact.push({ r: 3, pos: () => pad.ent && pad.ent.state === 'pad' ? pad.pos : null, h: 3.5, text: () => {
      if (!pad.ent) return null; const b = BR[pad.ent.t];
      if (HG.player.carry) return { object: b.name, action: 'Hands full', disabled: true };
      return { object: `${rv.name}'s ${b.name} · $${fmtCash(b.inc)}/s`, action: 'Steal', hold: 1.1 };
    }, act() {
      const e = pad.ent; if (!e || HG.player.carry) return; pad.ent = null; e.state = 'carried'; e.from = { rv, i }; HG.player.carry = e; entLabel(e);
      rv.state = 'chase'; tone([880, 660, 880, 660], 0.06, 'square', 0.04); HG.chat(`You grabbed ${BR[e.t].name}! Run back to your base before ${rv.name} catches you!`, '#ffb000'); HG.toast('RUN!', 'hot');
    } })));
    HG.interact.push({ r: 3.2, pos: lockBtn.position, h: 2.5, text: () => {
      const t = now(); if (t < st.lockUntil) return { object: 'Base lock', action: `Locked: ${Math.ceil((st.lockUntil - t) / 1000)}s`, disabled: true };
      if (t < st.lockReady) return { object: 'Base lock', action: `Ready in ${Math.ceil((st.lockReady - t) / 1000)}s`, disabled: true };
      return { object: 'Base lock', action: 'Lock base (40s)' };
    }, act() { st.lockUntil = now() + 40000; st.lockReady = now() + 100000; setLock(me, true); tone([300, 600, 900], 0.06, 'square', 0.04); HG.chat('Your base is locked for 40 seconds.', '#ff5a6e'); } });
    HG.interact.push({ r: 3.4, pos: term.position, h: 3.6, text: () => {
      const t = now(); if (t < st.boostUntil) return { object: 'Study Terminal', action: `2x cash: ${Math.ceil((st.boostUntil - t) / 1000)}s left`, disabled: true };
      if (t < st.studyReady) return { object: 'Study Terminal', action: `Try again in ${Math.ceil((st.studyReady - t) / 1000)}s`, disabled: true };
      return { object: 'Study Terminal', action: 'Answer a question: 2x cash' };
    }, act: () => studyQuiz() });

    // A physics question. Right answer: 2x cash for 60 s plus a bonus.
    function studyQuiz() {
      const gens = [].concat(typeof GUIDE_GENS !== 'undefined' ? GUIDE_GENS : [], typeof BOSS4_GENS !== 'undefined' ? BOSS4_GENS : [], typeof BOSS3_GENS !== 'undefined' ? BOSS3_GENS : []);
      let q = null; for (let i = 0; i < 40 && !q; i++) { const r = pick(gens)(); if (r.mcq) q = r.mcq; }
      if (!q) return;
      const body = h('section', { class: 'step' });
      const bg = h('div', { class: 'modal-bg hg-quiz' }, h('div', { class: 'modal' }, h('h2', {}, 'Study Terminal'), h('p', {}, 'Get it right for 2x cash for 60 seconds.'), body));
      HG.wrap.append(bg);
      const close = h('button', { class: 'btn primary' }, 'Back to the game'); close.onclick = () => bg.remove();
      MCQ(body, { run: { mistakes: 0 }, right: () => { const bonus = Math.max(50, income(me.pads.map(p => p.ent && p.ent.t)) * 30); st.boostUntil = now() + 60000; st.cash += bonus; HG.chat(`Correct! 2x cash for 60 seconds, plus $${fmtCash(bonus)}.`, '#5ee36b'); SFX.win(); refreshUI(); }, wrong: () => { st.studyReady = now() + 15000; SFX.bad(); }, done: note => { if (note) body.append(h('div', { class: 'pen', html: note })); body.append(h('div', { class: 'next-row' }, close)); } }, Object.assign({}, q, { oneShot: true }));
    }

    // ---------- UI ----------
    function refreshUI() {
      const inc = income(me.pads.map(p => p.ent && p.ent.t)) * boost();
      HG.setCash(st.cash, inc);
      const nPets = Object.keys(s.inv).filter(id => id.startsWith('br_')).length;
      HG.setBoard([{ name: s.avatar.name, cash: st.cash, n: nPets, me: true }, ...Object.values(rivals).map(rv => ({ name: rv.name, cash: st.rcash[rv.key], n: rv.pads.filter(p => p.ent).length }))].sort((a, b) => b.cash - a.cash));
    }
    refreshUI();

    // ---------- simulation ----------
    const toward = (pos, target, sp, dt) => { const dx = target.x - pos.x, dz = target.z - pos.z, d = Math.hypot(dx, dz); if (d < 0.05) return d; const k = Math.min(1, sp * dt / d); pos.x += dx * k; pos.z += dz * k; return d; };
    let spawnT = 1, secT = 0, labelT = 0;
    HG.frames.push((dt, t) => {
      const P = HG.player, pp = P.pos;
      // spawner: a new brainrot walks onto the carpet every few seconds
      if ((spawnT -= dt) <= 0) { spawnT = 3 + Math.random() * 2; const b = brPick(); const e = spawn(b.id, V(0, 0.12, -80), 'walk', null); e.obj.rotation.y = 0; if (['legendary', 'mythic', 'god', 'secret'].includes(b.r)) { HG.chat(`A ${BR_RAR[b.r].n} brainrot spawned: ${b.name}!`, BR_RAR[b.r].c); tone([660, 880, 1320], 0.07, 'triangle', 0.05); } }
      for (const e of ents.slice()) {
        const legs = e.obj.userData.legs, walking = e.state === 'walk' || e.state === 'toBase';
        if (legs) { const a = walking ? Math.sin(t * 10 + e.pos.z) * 0.6 : 0; legs[0].rotation.x = a; legs[1].rotation.x = -a; }
        e.obj.traverse(o => { const u = o.userData; if (u.spin) o.rotation.y += u.spin * dt; if (u.flame) o.scale.set(1, 0.75 + Math.random() * 0.5, 1); if (u.update) u.update(t); });
        if (e.obj.userData.float) e.obj.children[0].position.y = Math.sin(t * 2 + e.pos.x) * 0.25;
        if (e.obj.userData.spinY && e.state === 'pad') e.obj.rotation.y += e.obj.userData.spinY * dt;
        if (e.state === 'walk') {
          e.pos.z += e.speed * dt; if (e.pos.z > 30) { remove(e); continue; }
          // rivals sometimes buy one as it passes their base
          for (const rv of Object.values(rivals)) if (!e.seen[rv.key] && Math.abs(e.pos.z - rv.cz) < 0.2 && (e.seen[rv.key] = 1) && rv.state === 'home' && freePad(rv) >= 0 && Math.random() < 0.35) { const i = freePad(rv); rv.pads[i].reserved = true; e.state = 'toBase'; e.owner = rv.key; e.padIdx = i; e.target = rv.pads[i].pos.clone(); e.speed = 7; entLabel(e); HG.chat(`${rv.name} bought ${BR[e.t].name}.`, rv.color, rv.name); break; }
        } else if (e.state === 'toBase') {
          e.obj.rotation.y = Math.atan2(e.target.x - e.pos.x, e.target.z - e.pos.z);
          if (toward(e.pos, e.target, e.speed, dt) < 0.1) { e.pos.y = e.target.y; if (e.owner === 'me') landed(e); else { const rv = rivals[e.owner]; rv.pads[e.padIdx].reserved = false; seat(rv, e.padIdx, e); persist(); } }
        } else if (e.state === 'carried') {
          const carrier = e.carrier || P; e.pos.set(carrier.pos.x, carrier.pos.y + 6.2, carrier.pos.z); e.obj.rotation.y += dt * 2;
        }
      }
      // carrying a stolen brainrot home
      if (P.carry && me.inside(pp)) {
        const i = freePad(me);
        if (i >= 0) { const e = P.carry; P.carry = null; e.padIdx = i; const rv = e.from.rv; rv.state = 'home'; rv.target = V(rv.cx, 0.4, rv.cz); landed(e); HG.chat(`You stole ${BR[e.t].name} from ${rv.name}!`, '#5ee36b'); HG.toast('STOLEN!', 'hot'); SFX.win(); FX.burst([css('--gold1'), css('--green1'), '#fff'], 120); }
        else if (!P.fullWarned) { P.fullWarned = true; HG.chat('Your base is full! Sell a brainrot to make room.', '#ff5a6e'); setTimeout(() => { P.fullWarned = false; }, 4000); }
      }
      // rivals
      for (const rv of Object.values(rivals)) {
        let sp = 9, tgt = rv.target;
        if (rv.lockUntil && now() > rv.lockUntil) { rv.lockUntil = 0; setLock(rv, false); }
        if ((rv.lockIn -= dt) <= 0) { rv.lockIn = 90 + Math.random() * 40; rv.lockUntil = now() + 25000; setLock(rv, true); HG.chat(`${rv.name} locked their base.`, rv.color, rv.name); }
        if (rv.state === 'home') {
          if ((rv.wait -= dt) <= 0) { rv.wait = 2 + Math.random() * 4; rv.target = V(rv.cx + (Math.random() - 0.5) * 14, 0.4, rv.cz + (Math.random() - 0.5) * 14); }
          if ((rv.stealIn -= dt) <= 0) {
            rv.stealIn = 70 + Math.random() * 45;
            const mine = me.pads.map((p, i) => [p, i]).filter(([p]) => p.ent && p.ent.state === 'pad').sort((a, b) => BR[b[0].ent.t].inc - BR[a[0].ent.t].inc);
            if (mine.length && now() > st.lockUntil) { rv.state = 'steal'; rv.goal = mine[0][1]; rv.target = me.pads[rv.goal].pos.clone(); HG.chat(`${rv.name} is coming to steal your ${BR[mine[0][0].ent.t].name}! Tag them to stop it, or lock your base.`, '#ff5a6e', 'Alert'); HG.toast('THIEF INCOMING!', 'bad'); tone([880, 660, 880, 660], 0.08, 'square', 0.05); }
          }
          sp = 6; tgt = rv.target;
        } else if (rv.state === 'steal') {
          sp = 11; tgt = rv.target;
          if (now() < st.lockUntil && !me.inside(rv.pos)) { rv.state = 'home'; rv.target = V(rv.cx, 0.4, rv.cz); HG.chat(`${rv.name} was blocked by your lasers.`, '#5ee36b'); }
          else if (Math.hypot(rv.pos.x - tgt.x, rv.pos.z - tgt.z) < 1.2) {
            const pad = me.pads[rv.goal], e = pad.ent;
            if (e && e.state === 'pad') { pad.ent = null; e.state = 'carried'; e.carrier = rv; rv.carry = e; rv.state = 'flee'; rv.target = V(rv.cx, 0.4, rv.cz); entLabel(e); HG.chat(`${rv.name} grabbed your ${BR[e.t].name}! Chase them!`, '#ff5a6e', 'Alert'); persist(); }
            else { rv.state = 'home'; rv.target = V(rv.cx, 0.4, rv.cz); }
          }
        } else if (rv.state === 'flee') {
          sp = 12.5; tgt = rv.target;
          if (Math.hypot(rv.pos.x - pp.x, rv.pos.z - pp.z) < 2.6) { const e = rv.carry; rv.carry = null; e.carrier = null; e.state = 'toBase'; e.owner = 'me'; e.target = me.pads[rv.goal].pos.clone(); e.padIdx = rv.goal; me.pads[rv.goal].reserved = true; e.speed = 9; rv.state = 'home'; rv.stealIn = 80 + Math.random() * 40; HG.chat(`You stopped ${rv.name}! ${BR[e.t].name} is going home.`, '#5ee36b'); HG.toast('SAVED!', 'hot'); SFX.win(); }
          else if (rv.inside(rv.pos) && Math.hypot(rv.pos.x - tgt.x, rv.pos.z - tgt.z) < 1.5) { const e = rv.carry; rv.carry = null; e.carrier = null; let i = freePad(rv); if (i < 0) { i = 0; const old = rv.pads[0].ent; if (old) remove(old); } seat(rv, i, e); e.owner = rv.key; rv.state = 'home'; HG.chat(`${rv.name} stole your ${BR[e.t].name}. Go steal it back!`, '#ff5a6e', 'Alert'); SFX.bad(); persist(); }
        } else if (rv.state === 'chase') {
          sp = 14.5; tgt = pp;
          if (!P.carry || P.carry.from.rv !== rv) { rv.state = 'home'; rv.target = V(rv.cx, 0.4, rv.cz); }
          else if (Math.hypot(rv.pos.x - pp.x, rv.pos.z - pp.z) < 2.3) { const e = P.carry; P.carry = null; let i = e.from.i; if (rv.pads[i].ent || rv.pads[i].reserved) i = freePad(rv); if (i < 0) remove(e); else seat(rv, i, e); rv.state = 'home'; rv.target = V(rv.cx, 0.4, rv.cz); P.vel.x += (pp.x - rv.pos.x) * 4; P.vel.z += (pp.z - rv.pos.z) * 4; P.vel.y = 14; HG.chat(`${rv.name} caught you! The brainrot went back.`, '#ff5a6e'); HG.toast('CAUGHT!', 'bad'); SFX.bad(); }
        }
        const d = toward(rv.pos, tgt, sp, dt);
        const base = rv.inside(rv.pos) ? 0.4 : me.inside(rv.pos) ? 0.4 : 0; rv.pos.y += (base - rv.pos.y) * Math.min(1, dt * 10);
        if (d > 0.1) { const ty = Math.atan2(tgt.x - rv.pos.x, tgt.z - rv.pos.z); let df = ty - rv.yaw; df = Math.atan2(Math.sin(df), Math.cos(df)); rv.yaw += df * Math.min(1, dt * 10); }
        rv.obj.rotation.y = rv.yaw; rv.obj.userData.tick(t, dt, d > 0.1 ? Math.min(1, sp / 14) : 0);
      }
      // your lock times out
      if (me.lcol.on && now() > st.lockUntil) { setLock(me, false); HG.chat('Your base lock is off.', '#9aa4b0'); }
      // walk onto the collect plate
      if (Math.abs(pp.x - plate.position.x) < 1.9 && Math.abs(pp.z - plate.position.z) < 1.9 && pp.y < 1.2) {
        let got = 0; me.pads.forEach(p => { if (p.ent && p.ent.stored >= 1) { got += Math.floor(p.ent.stored); p.ent.stored -= Math.floor(p.ent.stored); entLabel(p.ent); } });
        if (got > 0) { st.cash += got; SFX.coin(); tone([988, 1319, 1568], 0.05, 'square', 0.03); HG.bumpCash(); HG.toast(`+$${fmtCash(got)}`, 'hot'); refreshUI(); }
      }
      // every second: earnings, rival cash, labels, save
      if ((secT += dt) >= 1) {
        secT -= 1; const b = boost();
        me.pads.forEach(p => { if (p.ent && p.ent.state === 'pad') p.ent.stored += BR[p.ent.t].inc * b; });
        Object.values(rivals).forEach(rv => { st.rcash[rv.key] += income(rv.pads.map(p => p.ent && p.ent.t)); });
        if ((labelT += 1) >= 1) { labelT = 0; me.pads.forEach(p => p.ent && p.ent.state === 'pad' && entLabel(p.ent)); }
        persist(); refreshUI();
        plateM.emissiveIntensity = 0.4 + (me.pads.some(p => p.ent && p.ent.stored >= 1) ? 0.6 : 0);
      }
    });
    HG.chat('Tip: grab brainrots from NoobMaster and Guest_1337 by holding E on their pads. Sprint (Shift) home!', '#9fd2ff');
  },
};
