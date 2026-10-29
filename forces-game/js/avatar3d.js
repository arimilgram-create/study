// 3D avatar: a blocky Roblox-style character with fitted clothes and accessories, plus pets and auras.
// Feet are at y = 0 and the head top is about y = 5.25. The character faces +z.

const AV3 = (() => {
  const { mat, glow, own, canvasTex, col } = K3;
  const mesh = (geo, m) => new THREE.Mesh(geo, m);
  const box = (w, h, d, m) => mesh(new THREE.BoxGeometry(w, h, d), m);
  const sph = (r, m, ws = 18, hs = 12, ts = 0, tl = Math.PI) => mesh(new THREE.SphereGeometry(r, ws, hs, 0, Math.PI * 2, ts, tl), m);
  const cyl = (rt, rb, h, m, seg = 24, open = false) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg, 1, open), m);
  const cone = (r, h, m, seg = 20) => mesh(new THREE.ConeGeometry(r, h, seg), m);
  const tor = (r, t, m, arc = Math.PI * 2, rs = 10, ts = 32) => mesh(new THREE.TorusGeometry(r, t, rs, ts, arc), m);
  const grp = (...kids) => { const g = new THREE.Group(); kids.forEach(k => k && g.add(k)); return g; };
  const at = (o, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, s = 1) => { o.position.set(x, y, z); o.rotation.set(rx, ry, rz); if (s !== 1) o.scale.setScalar(s); return o; };
  const shade = (c, k) => '#' + col(c).multiplyScalar(k).getHexString();
  const mix = (a, b, k) => '#' + col(a).lerp(col(b), k).getHexString();
  // Small seeded random numbers, so a galaxy shirt draws the same stars every time.
  const rng = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  // ---------- faces ----------
  function faceTex(skin, eyes, mouth) {
    return canvasTex(512, 256, (g, W, H) => {
      g.fillStyle = skin; g.fillRect(0, 0, W, H);
      const cx = W / 2, ey = H * 0.5, my = H * 0.665, dx = 36, ink = '#1b1d22';
      g.fillStyle = 'rgba(255,120,120,.28)'; [-1, 1].forEach(s => { g.beginPath(); g.ellipse(cx + s * 52, my - 6, 15, 9, 0, 0, 7); g.fill(); });
      g.strokeStyle = ink; g.fillStyle = ink; g.lineWidth = 7; g.lineCap = 'round';
      const dotEye = x => { g.beginPath(); g.ellipse(x, ey, 8, 12, 0, 0, 7); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(x + 2, ey - 4, 3, 0, 7); g.fill(); g.fillStyle = ink; };
      const arcEye = x => { g.beginPath(); g.arc(x, ey + 6, 11, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); };
      const star = (x, y, r) => { g.fillStyle = '#ffd21f'; g.strokeStyle = ink; g.lineWidth = 3; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); g.stroke(); g.fillStyle = ink; g.lineWidth = 7; };
      ({
        dots: () => [-1, 1].forEach(s => dotEye(cx + s * dx)),
        happy: () => [-1, 1].forEach(s => arcEye(cx + s * dx)),
        wide: () => [-1, 1].forEach(s => { g.fillStyle = '#fff'; g.beginPath(); g.arc(cx + s * dx, ey, 14, 0, 7); g.fill(); g.lineWidth = 3; g.stroke(); g.fillStyle = ink; g.beginPath(); g.arc(cx + s * dx + 2, ey + 2, 6.5, 0, 7); g.fill(); g.lineWidth = 7; }),
        wink: () => { dotEye(cx - dx); arcEye(cx + dx); },
        sleepy: () => [-1, 1].forEach(s => { g.beginPath(); g.moveTo(cx + s * dx - 11, ey + 2); g.lineTo(cx + s * dx + 11, ey + 2); g.stroke(); }),
        star: () => [-1, 1].forEach(s => star(cx + s * dx, ey, 15)),
      }[eyes] || (() => [-1, 1].forEach(s => dotEye(cx + s * dx))))();
      g.lineWidth = 6; g.fillStyle = ink;
      ({
        smile: () => { g.beginPath(); g.arc(cx, my - 14, 22, Math.PI * 0.2, Math.PI * 0.8); g.stroke(); },
        grin: () => { g.beginPath(); g.moveTo(cx - 26, my - 6); g.quadraticCurveTo(cx, my + 34, cx + 26, my - 6); g.closePath(); g.fill(); g.fillStyle = '#fff'; g.fillRect(cx - 18, my - 4, 36, 7); },
        o: () => { g.beginPath(); g.ellipse(cx, my + 2, 9, 12, 0, 0, 7); g.fill(); },
        smirk: () => { g.beginPath(); g.moveTo(cx - 18, my + 2); g.quadraticCurveTo(cx + 6, my + 10, cx + 22, my - 8); g.stroke(); },
        tongue: () => { g.beginPath(); g.arc(cx, my - 14, 22, Math.PI * 0.2, Math.PI * 0.8); g.stroke(); g.fillStyle = '#ff6b8b'; g.beginPath(); g.ellipse(cx + 4, my + 10, 9, 10, 0, 0, Math.PI); g.fill(); },
        frown: () => { g.beginPath(); g.arc(cx, my + 18, 20, Math.PI * 1.2, Math.PI * 1.8); g.stroke(); },
      }[mouth] || (() => {}))();
    });
  }

  // ---------- clothing textures ----------
  // Draws one face of a shirt or pants. `face` is front, back, side, arm, or leg.
  function cloth(it, face, W = 128, H = 128) {
    const c = it.c || '#1f6feb', c2 = it.c2 || '#ffffff', st = it.style || 'tee';
    return canvasTex(W, H, g => {
      const fill = x => { g.fillStyle = x; g.fillRect(0, 0, W, H); };
      const r = rng((it.id || st).split('').reduce((a, ch) => a * 31 + ch.charCodeAt(0) & 0xffffff, 7) + 1);
      fill(c);
      if (st === 'stripes' || st === 'sailor') { g.fillStyle = c2; for (let y = 8; y < H; y += 24) g.fillRect(0, y, W, 10); }
      if (st === 'checker') { const n = 8, s = W / n; g.fillStyle = c2; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if ((i + j) % 2) g.fillRect(i * s, j * s, s, s); }
      if (st === 'flannel' || st === 'plaid') { g.globalAlpha = 0.45; g.fillStyle = c2; for (let x = 0; x < W; x += 32) g.fillRect(x, 0, 12, H); for (let y = 0; y < H; y += 32) g.fillRect(0, y, W, 12); g.globalAlpha = 0.25; g.fillStyle = '#000'; for (let x = 18; x < W; x += 32) g.fillRect(x, 0, 4, H); for (let y = 18; y < H; y += 32) g.fillRect(0, y, W, 4); g.globalAlpha = 1; }
      if (st === 'camo') { ['#4b5e2f', '#7a8a4a', '#2f3b22', '#a39467'].forEach(cc => { g.fillStyle = cc; for (let i = 0; i < 9; i++) { g.beginPath(); g.ellipse(r() * W, r() * H, 10 + r() * 16, 6 + r() * 10, r() * 3, 0, 7); g.fill(); } }); }
      if (st === 'galaxy') { const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#1a0b3d'); gr.addColorStop(0.5, '#3b1b7a'); gr.addColorStop(1, '#0b2a5c'); g.fillStyle = gr; g.fillRect(0, 0, W, H); ['rgba(255,80,200,.35)', 'rgba(80,180,255,.35)'].forEach(cc => { g.fillStyle = cc; g.beginPath(); g.ellipse(r() * W, r() * H, 30, 18, r() * 3, 0, 7); g.fill(); }); g.fillStyle = '#fff'; for (let i = 0; i < 40; i++) { const s = r() * 2.2 + 0.6; g.fillRect(r() * W, r() * H, s, s); } }
      if (st === 'gold') { const gr = g.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#fff3a3'); gr.addColorStop(0.35, '#ffcc33'); gr.addColorStop(0.65, '#d99a00'); gr.addColorStop(1, '#ffe066'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(255,255,255,.45)'; g.beginPath(); g.moveTo(W * 0.1, H); g.lineTo(W * 0.4, 0); g.lineTo(W * 0.55, 0); g.lineTo(W * 0.25, H); g.fill(); }
      if (st === 'lava') { fill('#2a1410'); g.strokeStyle = '#ff7a1a'; g.lineWidth = 4; for (let i = 0; i < 7; i++) { g.beginPath(); let x = r() * W, y = r() * H; g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (r() - 0.5) * 50; y += (r() - 0.5) * 50; g.lineTo(x, y); } g.stroke(); } }
      if (st === 'sweater') { g.fillStyle = c2; for (let x = -16; x < W + 16; x += 16) { g.beginPath(); g.moveTo(x, H * 0.45); g.lineTo(x + 8, H * 0.35); g.lineTo(x + 16, H * 0.45); g.lineTo(x + 8, H * 0.55); g.fill(); } g.fillRect(0, H * 0.28, W, 4); g.fillRect(0, H * 0.6, W, 4); }
      if (st === 'track' && (face === 'side' || face === 'leg' || face === 'arm')) { g.fillStyle = c2; g.fillRect(W * 0.38, 0, W * 0.09, H); g.fillRect(W * 0.53, 0, W * 0.09, H); }
      if (st === 'jersey' && face === 'side') { g.fillStyle = c2; g.fillRect(W * 0.4, 0, W * 0.2, H); }
      if (st === 'varsity' && face === 'arm') fill(c2);
      if (st === 'space') { fill('#eef1f5'); if (face === 'arm' || face === 'leg') { g.fillStyle = c; g.fillRect(0, H * 0.55, W, 10); } }
      if (st === 'labcoat') fill('#f4f6f8');
      if (st === 'tux') fill('#1b1d22');
      if (st === 'jeans') { g.globalAlpha = 0.12; g.fillStyle = '#000'; for (let y = 0; y < H; y += 4) g.fillRect(0, y, W, 1); g.globalAlpha = 1; }
      // front details
      if (face === 'front') {
        const ink = 'rgba(0,0,0,.25)';
        if (['tee', 'print', 'stripes', 'sweater', 'galaxy', 'gold', 'camo', 'flannel', 'checker', 'jersey', 'lava'].includes(st)) { g.fillStyle = shade(c, 0.7); g.beginPath(); g.ellipse(W / 2, 0, W * 0.2, H * 0.1, 0, 0, Math.PI); g.fill(); }
        if (st === 'hoodie') { g.fillStyle = ink; g.beginPath(); g.roundRect ? g.roundRect(W * 0.22, H * 0.6, W * 0.56, H * 0.28, 10) : g.rect(W * 0.22, H * 0.6, W * 0.56, H * 0.28); g.fill(); g.strokeStyle = '#fff'; g.lineWidth = 3; [0.42, 0.58].forEach(x => { g.beginPath(); g.moveTo(W * x, 0); g.lineTo(W * x, H * 0.3); g.stroke(); }); g.fillStyle = shade(c, 0.75); g.fillRect(0, 0, W, H * 0.08); }
        if (st === 'jersey' || st === 'varsity') { g.font = `700 ${H * 0.48}px Fredoka, Arial Black, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineWidth = 6; g.strokeStyle = shade(c2, 0.4); g.strokeText(it.num || '1', W / 2, H * 0.55); g.fillStyle = c2; g.fillText(it.num || '1', W / 2, H * 0.55); }
        if (st === 'labcoat') { g.fillStyle = c; g.beginPath(); g.moveTo(W * 0.35, 0); g.lineTo(W / 2, H * 0.45); g.lineTo(W * 0.65, 0); g.fill(); g.strokeStyle = '#9aa4b0'; g.lineWidth = 3; g.beginPath(); g.moveTo(W * 0.3, 0); g.lineTo(W / 2, H * 0.5); g.lineTo(W * 0.7, 0); g.moveTo(W / 2, H * 0.5); g.lineTo(W / 2, H); g.stroke(); g.fillStyle = '#9aa4b0'; [0.62, 0.78].forEach(y => { g.beginPath(); g.arc(W * 0.56, H * y, 3.5, 0, 7); g.fill(); }); g.strokeRect(W * 0.66, H * 0.56, W * 0.2, H * 0.16); g.fillStyle = '#1e74e8'; g.fillRect(W * 0.7, H * 0.48, 4, H * 0.14); }
        if (st === 'tux') { g.fillStyle = '#fff'; g.beginPath(); g.moveTo(W * 0.32, 0); g.lineTo(W / 2, H * 0.62); g.lineTo(W * 0.68, 0); g.fill(); g.fillStyle = c2; g.beginPath(); g.moveTo(W / 2, H * 0.12); g.lineTo(W * 0.38, H * 0.04); g.lineTo(W * 0.38, H * 0.2); g.closePath(); g.moveTo(W / 2, H * 0.12); g.lineTo(W * 0.62, H * 0.04); g.lineTo(W * 0.62, H * 0.2); g.closePath(); g.fill(); g.fillStyle = '#1b1d22'; [0.32, 0.45].forEach(y => { g.beginPath(); g.arc(W / 2, H * y, 3, 0, 7); g.fill(); }); }
        if (st === 'space') { g.fillStyle = '#c9d1db'; g.fillRect(W * 0.28, H * 0.3, W * 0.44, H * 0.3); ['#e0263f', '#22a03a', '#ffd21f'].forEach((cc, i) => { g.fillStyle = cc; g.beginPath(); g.arc(W * (0.38 + i * 0.12), H * 0.45, 5, 0, 7); g.fill(); }); g.fillStyle = c; g.beginPath(); g.arc(W * 0.78, H * 0.18, 11, 0, 7); g.fill(); }
        if (it.print) {
          g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = c2; g.strokeStyle = shade(c, 0.45); g.lineWidth = 5;
          const p = it.print;
          if (p === 'apple') { g.fillStyle = '#e0263f'; g.beginPath(); g.arc(W * 0.43, H * 0.56, 20, 0, 7); g.arc(W * 0.57, H * 0.56, 20, 0, 7); g.fill(); g.fillStyle = '#22a03a'; g.beginPath(); g.ellipse(W * 0.58, H * 0.33, 12, 6, -0.5, 0, 7); g.fill(); }
          else if (p === 'rocket') { g.fillStyle = '#eef1f5'; g.beginPath(); g.moveTo(W / 2, H * 0.25); g.quadraticCurveTo(W * 0.66, H * 0.45, W * 0.6, H * 0.75); g.lineTo(W * 0.4, H * 0.75); g.quadraticCurveTo(W * 0.34, H * 0.45, W / 2, H * 0.25); g.fill(); g.fillStyle = '#ff7a1a'; g.beginPath(); g.moveTo(W * 0.42, H * 0.76); g.lineTo(W / 2, H * 0.92); g.lineTo(W * 0.58, H * 0.76); g.fill(); g.fillStyle = '#1e74e8'; g.beginPath(); g.arc(W / 2, H * 0.47, 7, 0, 7); g.fill(); }
          else if (p === 'atom') { g.strokeStyle = c2; g.lineWidth = 4; [0, 1, 2].forEach(k => { g.beginPath(); g.ellipse(W / 2, H * 0.55, 34, 12, k * Math.PI / 3, 0, 7); g.stroke(); }); g.fillStyle = c2; g.beginPath(); g.arc(W / 2, H * 0.55, 6, 0, 7); g.fill(); }
          else { const lines = p.split('\n'), fs = H * (lines.length > 1 ? 0.19 : 0.24); g.font = `700 ${fs}px Fredoka, Arial Black, sans-serif`; lines.forEach((l, i) => { const y = H * 0.56 + (i - (lines.length - 1) / 2) * fs * 1.1; g.strokeText(l, W / 2, y); g.fillText(l, W / 2, y); }); }
        }
      }
      if (face === 'back' && (st === 'jersey' || st === 'varsity')) { g.font = `700 ${H * 0.48}px Fredoka, Arial Black, sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = c2; g.fillText(it.num || '1', W / 2, H * 0.55); }
      if (face === 'back' && st === 'hoodie') { g.fillStyle = shade(c, 0.75); g.beginPath(); g.ellipse(W / 2, 0, W * 0.38, H * 0.28, 0, 0, Math.PI); g.fill(); }
      if (face === 'leg' && it.slot === 'pants' && st !== 'shorts') { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, 0, W, 6); if (st === 'jeans' || st === 'cargo') { g.strokeStyle = 'rgba(255,215,120,.65)'; g.lineWidth = 2; g.setLineDash([5, 4]); g.beginPath(); g.moveTo(W * 0.5, 0); g.lineTo(W * 0.5, H); g.stroke(); g.setLineDash([]); } if (st === 'cargo') { g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(W * 0.2, H * 0.4, W * 0.6, H * 0.22); } }
    });
  }

  // ---------- hair ----------
  function hair(style, hc) {
    const m = mat(hc, { roughness: 0.75 }), g = grp();
    const cap = () => { const c = at(sph(0.66, m, 24, 12, 0, Math.PI * 0.43), 0, 0.03, -0.02); c.scale.set(1.02, 0.8, 1.02); return c; };
    const fringe = () => at(box(0.92, 0.14, 0.24, m), 0, 0.37, 0.46, -0.55);
    switch (style) {
      case 'short': g.add(cap(), fringe()); break;
      case 'curly': g.add(cap()); for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; g.add(at(sph(0.2, m, 10, 8), Math.sin(a) * 0.5, 0.45 + (i % 2) * 0.12, Math.cos(a) * 0.5)); } g.add(at(sph(0.26, m, 10, 8), 0, 0.68, 0)); break;
      case 'spiky': g.add(cap()); for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2; g.add(at(cone(0.16, 0.5, m, 8), Math.sin(a) * 0.36, 0.72, Math.cos(a) * 0.36, Math.cos(a) * 0.6, 0, -Math.sin(a) * 0.6)); } g.add(at(cone(0.18, 0.55, m, 8), 0, 0.88, 0)); break;
      case 'long': g.add(cap(), fringe(), at(box(1.22, 1.5, 0.3, m), 0, -0.25, -0.5)); break;
      case 'bun': g.add(cap(), fringe(), at(sph(0.3, m), 0, 0.72, -0.25)); break;
      case 'bob': g.add(cap(), fringe(), at(box(0.3, 0.9, 1.0, m), 0.56, -0.05, -0.05), at(box(0.3, 0.9, 1.0, m), -0.56, -0.05, -0.05), at(box(1.2, 0.9, 0.3, m), 0, -0.05, -0.48)); break;
      case 'mohawk': for (let i = 0; i < 6; i++) g.add(at(box(0.16, 0.5 - Math.abs(i - 2.5) * 0.06, 0.24, m), 0, 0.72, 0.5 - i * 0.2, 0.25 - i * 0.1)); break;
      case 'afro': g.add(at(sph(0.98, m, 22, 14), 0, 0.35, -0.12, 0, 0, 0)); break;
      default: break;
    }
    return g;
  }

  // ---------- hats (origin = top of the head) ----------
  const metal = c => mat(c, { metalness: 0.6, roughness: 0.3 });
  const HATS = {
    cap: (c, c2) => grp(at(sph(0.66, mat(c), 24, 12, 0, Math.PI / 2), 0, -0.2, 0, 0, 0, 0), at(cyl(0.52, 0.52, 0.06, mat(c)), 0, -0.18, 0.5, 0, 0, 0), at(sph(0.08, mat(c2 || c)), 0, 0.46, 0)),
    beanie: (c, c2) => grp(at(sph(0.67, mat(c, { roughness: 0.9 }), 24, 12, 0, Math.PI / 2), 0, -0.22, 0), at(tor(0.66, 0.1, mat(c2 || shade(c, 0.8)), Math.PI * 2, 8, 30), 0, -0.2, 0, Math.PI / 2), at(sph(0.17, mat(c2 || '#fff', { roughness: 1 })), 0, 0.5, 0)),
    tophat: (c, c2) => grp(at(cyl(0.95, 0.95, 0.06, mat(c)), 0, -0.12, 0), at(cyl(0.55, 0.58, 1.1, mat(c)), 0, 0.45, 0), at(cyl(0.585, 0.585, 0.18, mat(c2 || '#e0263f')), 0, 0.02, 0)),
    crown: (c) => { const m = metal(c), g = grp(at(cyl(0.62, 0.62, 0.35, m, 24, true), 0, 0.05, 0)); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; g.add(at(cone(0.13, 0.36, m, 6), Math.sin(a) * 0.6, 0.38, Math.cos(a) * 0.6)); g.add(at(sph(0.06, glow(['#e0263f', '#1e74e8', '#22a03a'][i % 3])), Math.sin(a) * 0.63, 0.06, Math.cos(a) * 0.63)); } return g; },
    cowboy: (c) => grp(at(sph(1.05, mat(c), 28, 8, Math.PI * 0.42, Math.PI * 0.16), 0, -0.58, 0, 0, 0, 0), at(cyl(0.5, 0.6, 0.6, mat(c)), 0, 0.12, 0), at(cyl(0.61, 0.61, 0.1, mat(shade(c, 0.6))), 0, -0.1, 0)),
    wizard: (c, c2) => { const g = grp(at(cyl(0.95, 0.95, 0.05, mat(c)), 0, -0.1, 0), at(cone(0.6, 1.7, mat(c)), 0, 0.75, -0.1, -0.18)); for (let i = 0; i < 5; i++) g.add(at(sph(0.06, glow(c2 || '#ffd21f')), Math.sin(i * 2.4) * 0.38, 0.2 + i * 0.25, Math.cos(i * 2.4) * 0.38 - 0.05)); return g; },
    party: (c, c2) => { const g = grp(at(cone(0.42, 1.0, mat(c)), 0, 0.42, 0), at(sph(0.13, mat(c2 || '#ffd21f')), 0, 0.95, 0)); for (let i = 0; i < 3; i++) g.add(at(tor(0.3 - i * 0.09, 0.03, mat(c2 || '#ffd21f')), 0, 0.15 + i * 0.25, 0, Math.PI / 2)); return g; },
    viking: (c) => { const m = metal(c || '#aab4c0'), h = mat('#f4ead2'); return grp(at(sph(0.68, m, 24, 12, 0, Math.PI / 2), 0, -0.24, 0), at(tor(0.68, 0.06, metal('#d9a400'), Math.PI * 2, 6, 30), 0, -0.22, 0, Math.PI / 2), at(cone(0.13, 0.7, h, 10), 0.78, 0.22, 0, 0, 0, -0.9), at(cone(0.13, 0.7, h, 10), -0.78, 0.22, 0, 0, 0, 0.9)); },
    halo: (c) => { const g = grp(at(tor(0.5, 0.07, glow(c || '#ffe066', { emissiveIntensity: 1.2 }), Math.PI * 2, 10, 40), 0, 0.45, 0, Math.PI / 2)); g.userData.float = 1; return g; },
    propeller: (c, c2) => { const prop = grp(at(box(1.1, 0.03, 0.16, mat(c2 || '#ffd21f')), 0, 0, 0), at(box(0.16, 0.03, 1.1, mat('#22a03a')), 0, 0, 0)); prop.position.y = 0.55; prop.userData.spin = 9; return grp(HATS.cap(c, c2), at(cyl(0.03, 0.03, 0.2, mat('#888')), 0, 0.45, 0), prop); },
    headphones: (c, c2) => grp(at(tor(0.72, 0.07, mat(c), Math.PI, 8, 24), 0, -0.4, 0, 0, 0, 0), at(cyl(0.24, 0.24, 0.2, mat(c2 || '#1b1d22')), 0.72, -0.5, 0, 0, 0, Math.PI / 2), at(cyl(0.24, 0.24, 0.2, mat(c2 || '#1b1d22')), -0.72, -0.5, 0, 0, 0, Math.PI / 2)),
    cone: () => { const g = grp(at(cyl(0.7, 0.7, 0.06, mat('#ff7a1a')), 0, -0.12, 0), at(cone(0.5, 1.3, mat('#ff7a1a')), 0, 0.55, 0)); [0.35, 0.75].forEach(y => g.add(at(cyl(0.43 - y * 0.3, 0.46 - y * 0.3, 0.12, mat('#fff')), 0, y, 0))); return g; },
    chef: () => { const m = mat('#ffffff', { roughness: 1 }), g = grp(at(cyl(0.6, 0.6, 0.45, m), 0, 0.08, 0)); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; g.add(at(sph(0.34, m), Math.sin(a) * 0.35, 0.5, Math.cos(a) * 0.35)); } g.add(at(sph(0.4, m), 0, 0.62, 0)); return g; },
    pirate: (c) => { const s = new THREE.Shape(); s.moveTo(-1, 0); s.quadraticCurveTo(0, 0.25, 1, 0); s.lineTo(0.55, 0.65); s.quadraticCurveTo(0, 0.85, -0.55, 0.65); s.closePath(); const geo = new THREE.ExtrudeGeometry(s, { depth: 1.0, bevelEnabled: false }); geo.translate(0, 0, -0.5); const m = mesh(geo, mat(c || '#1b1d22')); return grp(at(m, 0, -0.1, 0), at(tor(0.6, 0.03, metal('#ffcc33'), Math.PI * 2, 6, 30), 0, -0.05, 0, Math.PI / 2)); },
    grad: (c) => grp(at(sph(0.64, mat(c || '#1b1d22'), 24, 12, 0, Math.PI / 2), 0, -0.25, 0), at(box(1.4, 0.07, 1.4, mat(c || '#1b1d22')), 0, 0.18, 0, 0, Math.PI / 4), at(cyl(0.02, 0.02, 0.5, mat('#ffd21f')), 0.55, -0.02, 0.2), at(sph(0.07, mat('#ffd21f')), 0.55, -0.3, 0.2)),
    catears: (c, c2) => grp(at(cone(0.24, 0.45, mat(c), 4), 0.36, 0.12, 0, 0, Math.PI / 4, -0.25), at(cone(0.24, 0.45, mat(c), 4), -0.36, 0.12, 0, 0, Math.PI / 4, 0.25), at(cone(0.13, 0.28, mat(c2 || '#ffb3c8'), 4), 0.36, 0.1, 0.06, 0, Math.PI / 4, -0.25), at(cone(0.13, 0.28, mat(c2 || '#ffb3c8'), 4), -0.36, 0.1, 0.06, 0, Math.PI / 4, 0.25)),
    bunny: (c, c2) => { const e = x => { const g = grp(at(sph(0.16, mat(c), 12, 10), 0, 0, 0, 0, 0, 0)); g.children[0].scale.set(1, 3.2, 0.6); g.add(at(sph(0.09, mat(c2 || '#ffb3c8'), 10, 8), 0, 0, 0.06)); g.children[1].scale.set(1, 3, 0.5); return at(g, x, 0.45, -0.05, 0, 0, -x * 0.35); }; return grp(e(0.28), e(-0.28)); },
    devil: (c) => grp(at(cone(0.12, 0.42, glow(c || '#e0263f', { emissiveIntensity: 0.3 }), 10), 0.38, 0.12, 0.1, 0, 0, -0.5), at(cone(0.12, 0.42, glow(c || '#e0263f', { emissiveIntensity: 0.3 }), 10), -0.38, 0.12, 0.1, 0, 0, 0.5)),
    astro: () => { const glass = new THREE.MeshStandardMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.32, roughness: 0.05, metalness: 0.2 }); glass.userData.own = true; return grp(at(sph(1.0, glass, 28, 18), 0, -0.55, 0.02), at(tor(0.82, 0.12, mat('#eef1f5'), Math.PI * 2, 10, 36), 0, -1.25, 0, Math.PI / 2)); },
    santa: () => grp(at(cone(0.62, 1.1, mat('#e0263f'), 24), 0, 0.42, -0.1, -0.5), at(tor(0.64, 0.13, mat('#fff', { roughness: 1 }), Math.PI * 2, 10, 30), 0, -0.12, 0, Math.PI / 2), at(sph(0.17, mat('#fff', { roughness: 1 })), 0, 0.72, -0.62)),
    apple: () => grp(at(sph(0.42, mat('#e0263f', { roughness: 0.35 })), 0, 0.3, 0), at(cyl(0.035, 0.035, 0.25, mat('#5a3825')), 0, 0.78, 0), at(sph(0.13, mat('#22a03a'), 10, 8), 0.14, 0.8, 0)),
    headband: (c) => grp(at(tor(0.63, 0.07, mat(c), Math.PI * 2, 8, 30), 0, -0.42, 0, Math.PI / 2), at(box(0.06, 0.4, 0.12, mat(c)), 0.15, -0.6, -0.68, 0.3, 0, 0.3), at(box(0.06, 0.4, 0.12, mat(c)), -0.05, -0.62, -0.68, 0.3, 0, -0.2)),
    flower: (c) => { const g = grp(at(tor(0.6, 0.06, mat('#3a9a3a'), Math.PI * 2, 8, 30), 0, -0.1, 0, Math.PI / 2)); ['#ff6b8b', '#ffd21f', '#cf8bff', '#6cc0ff', '#ffffff', '#ff8a3d'].forEach((cc, i) => { const a = i / 6 * Math.PI * 2; g.add(at(sph(0.13, mat(c && i % 2 ? c : cc)), Math.sin(a) * 0.6, -0.04, Math.cos(a) * 0.6)); }); return g; },
    fedora: (c, c2) => grp(at(cyl(0.95, 0.9, 0.05, mat(c)), 0, -0.1, 0, 0.08), at(cyl(0.48, 0.58, 0.55, mat(c)), 0, 0.17, 0), at(cyl(0.585, 0.585, 0.12, mat(c2 || '#1b1d22')), 0, 0.0, 0)),
    bucket: (c) => grp(at(cyl(0.6, 0.66, 0.45, mat(c, { roughness: 0.9 })), 0, 0.08, 0), at(cyl(0.68, 0.95, 0.22, mat(c, { roughness: 0.9 }), 24, true), 0, -0.22, 0)),
    shuttle: () => grp(at(cyl(0.32, 0.38, 0.9, mat('#eef1f5')), 0, 0.45, 0), at(cone(0.32, 0.5, mat('#eef1f5')), 0, 1.15, 0), at(cone(0.3, 0.5, glow('#ff7a1a'), 10), 0, -0.2, 0, Math.PI), at(box(0.06, 0.4, 0.55, mat('#1e74e8')), 0.35, 0.25, 0), at(box(0.06, 0.4, 0.55, mat('#1e74e8')), -0.35, 0.25, 0)),
    captain: () => grp(at(cyl(0.66, 0.6, 0.38, mat('#ffffff')), 0, 0.02, 0), at(cyl(0.67, 0.67, 0.1, mat('#1b1d22')), 0, -0.14, 0), at(cyl(0.52, 0.52, 0.04, mat('#1b1d22')), 0, -0.16, 0.42, 0.15), at(sph(0.09, metal('#ffcc33')), 0, 0.02, 0.64)),
    void: () => { const m = mat('#120a24', { roughness: 0.4 }); const g = grp(at(sph(0.8, m, 24, 14, 0, Math.PI * 0.62), 0, -0.45, -0.05), at(cone(0.22, 0.7, m, 12), 0, 0.5, -0.15, -0.3)); [-0.2, 0.2].forEach(x => g.add(at(sph(0.07, glow('#a855ff', { emissiveIntensity: 2 })), x, -0.62, 0.62))); return g; },
  };

  // ---------- face accessories (origin = front of the face) ----------
  const FACES = {
    shades: (c) => { const m = mat(c || '#1b1d22', { roughness: 0.2 }); return grp(at(box(0.4, 0.24, 0.06, m), 0.25, 0, 0), at(box(0.4, 0.24, 0.06, m), -0.25, 0, 0), at(box(0.2, 0.05, 0.05, m), 0, 0.06, 0)); },
    shutter: (c) => { const g = grp(); for (let i = 0; i < 4; i++) g.add(at(box(1.0, 0.05, 0.05, glow(c || '#ff4fb4', { emissiveIntensity: 0.5 })), 0, 0.12 - i * 0.08, 0)); return g; },
    nerd: (c) => { const m = mat(c || '#1b1d22'); return grp(at(tor(0.17, 0.03, m), 0.24, 0, 0), at(tor(0.17, 0.03, m), -0.24, 0, 0), at(box(0.14, 0.03, 0.03, m), 0, 0, 0)); },
    goggles: () => { const lens = new THREE.MeshStandardMaterial({ color: 0x9fdcff, transparent: true, opacity: 0.5, roughness: 0.1 }); lens.userData.own = true; return grp(at(box(0.95, 0.32, 0.12, mat('#2b3442')), 0, 0, -0.03), at(box(0.36, 0.22, 0.05, lens), 0.22, 0, 0.05), at(box(0.36, 0.22, 0.05, lens), -0.22, 0, 0.05)); },
    monocle: () => grp(at(tor(0.17, 0.03, metal('#ffcc33')), 0.24, 0, 0), at(cyl(0.008, 0.008, 0.6, metal('#ffcc33')), 0.35, -0.35, -0.02, 0, 0, 0.3)),
    glasses3d: () => grp(at(box(0.9, 0.26, 0.04, mat('#ffffff')), 0, 0, -0.01), at(box(0.32, 0.18, 0.05, glow('#e0263f', { emissiveIntensity: 0.3 })), 0.22, 0, 0.02), at(box(0.32, 0.18, 0.05, glow('#00c3ff', { emissiveIntensity: 0.3 })), -0.22, 0, 0.02)),
    stars: (c) => { const s = new THREE.Shape(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 0.08 : 0.2; i ? s.lineTo(Math.cos(a) * r, -Math.sin(a) * r) : s.moveTo(Math.cos(a) * r, -Math.sin(a) * r); } const geo = new THREE.ExtrudeGeometry(s, { depth: 0.05, bevelEnabled: false }); return grp(at(mesh(geo, mat(c || '#ffd21f')), 0.24, 0, 0), at(mesh(geo.clone(), mat(c || '#ffd21f')), -0.24, 0, 0), at(box(0.12, 0.03, 0.03, mat(c || '#ffd21f')), 0, 0, 0)); },
    visor: (c) => { const m = new THREE.MeshStandardMaterial({ color: col(c || '#00e5ff'), emissive: col(c || '#00e5ff'), emissiveIntensity: 0.7, transparent: true, opacity: 0.8, side: THREE.DoubleSide }); m.userData.own = true; return at(mesh(new THREE.CylinderGeometry(0.66, 0.66, 0.26, 24, 1, true, -1.2, 2.4), m), 0, 0, -0.62); },
    mustache: (c) => { const s = new THREE.Shape(); s.moveTo(0, 0.04); s.bezierCurveTo(0.12, 0.12, 0.3, 0.05, 0.36, -0.08); s.bezierCurveTo(0.25, -0.02, 0.1, -0.08, 0, -0.02); s.bezierCurveTo(-0.1, -0.08, -0.25, -0.02, -0.36, -0.08); s.bezierCurveTo(-0.3, 0.05, -0.12, 0.12, 0, 0.04); return at(mesh(new THREE.ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: false }), mat(c || '#5a3825')), 0, -0.2, 0); },
    ninja: (c) => at(mesh(new THREE.CylinderGeometry(0.64, 0.64, 0.32, 24, 1, true, -1.7, 3.4), mat(c || '#1b1d22')), 0, -0.24, -0.6),
  };

  // ---------- back items (origin = middle of the upper back, facing -z) ----------
  function wingShape(kind) {
    const s = new THREE.Shape();
    if (kind === 'bat' || kind === 'dragon') { s.moveTo(0, 0); s.lineTo(1.9, 0.9); s.lineTo(1.7, -0.1); s.quadraticCurveTo(1.4, -0.1, 1.25, -0.45); s.quadraticCurveTo(0.95, -0.25, 0.8, -0.6); s.quadraticCurveTo(0.5, -0.35, 0.35, -0.55); s.closePath(); }
    else if (kind === 'butterfly') { s.moveTo(0, 0); s.bezierCurveTo(0.6, 1.4, 1.8, 1.3, 1.3, 0.2); s.bezierCurveTo(1.5, -0.6, 0.6, -1.2, 0, -0.1); }
    else { s.moveTo(0, 0); s.bezierCurveTo(0.5, 0.9, 1.6, 1.3, 2.0, 0.9); s.bezierCurveTo(1.7, 0.6, 1.8, 0.3, 1.5, 0.1); s.bezierCurveTo(1.6, -0.2, 1.3, -0.4, 1.1, -0.45); s.bezierCurveTo(1.0, -0.7, 0.6, -0.8, 0.4, -0.6); s.closePath(); }
    return s;
  }
  function wings(kind, c, c2) {
    const geo = new THREE.ExtrudeGeometry(wingShape(kind), { depth: 0.08, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 1 });
    let m = mat(c);
    if (kind === 'fairy') { m = new THREE.MeshStandardMaterial({ color: col(c), emissive: col(c), emissiveIntensity: 0.35, transparent: true, opacity: 0.6, side: THREE.DoubleSide }); m.userData.own = true; }
    const R = at(mesh(geo, m), 0.15, 0.1, 0, 0, -0.5, 0), L = at(mesh(geo, m), -0.15, 0.1, 0, 0, Math.PI + 0.5, 0);
    const g = grp(R, L);
    if (kind === 'butterfly' || kind === 'dragon') [R, L].forEach(w => { const spot = at(sph(0.18, glow(c2 || '#ffd21f', { emissiveIntensity: 0.3 }), 10, 8), 0.9, 0.35, 0.09); spot.scale.z = 0.3; w.add(spot); });
    g.userData.flap = kind === 'butterfly' || kind === 'fairy' ? 3.2 : 1.4; g.userData.wings = [R, L];
    return g;
  }
  const BACKS = {
    angel: () => wings('angel', '#ffffff'), bat: (c) => wings('bat', c || '#3b2a4f'), dragon: (c, c2) => wings('dragon', c || '#c0262f', c2 || '#ffb000'),
    butterfly: (c, c2) => wings('butterfly', c || '#6cc0ff', c2 || '#ffd21f'), fairy: (c) => wings('fairy', c || '#8ff0ff'),
    cape: (c, c2) => { const geo = new THREE.PlaneGeometry(1.9, 2.7, 6, 10); geo.translate(0, -1.35, 0); const m = own({ color: col(c), side: THREE.DoubleSide, roughness: 0.8 }); const cape = at(mesh(geo, m), 0, 0.75, -0.08); cape.userData.cape = geo.attributes.position.array.slice(); const g = grp(cape, at(box(1.9, 0.12, 0.12, mat(c2 || '#ffcc33')), 0, 0.75, -0.06)); g.userData.capeMesh = cape; return g; },
    jetpack: (c) => { const m = metal(c || '#aab4c0'), g = grp(); [-0.4, 0.4].forEach(x => { g.add(at(cyl(0.3, 0.3, 1.3, m), x, 0, -0.32)); g.add(at(cone(0.3, 0.35, m), x, 0.82, -0.32)); const f = at(cone(0.22, 0.7, glow('#ff7a1a', { emissiveIntensity: 1.5 }), 12), x, -1.0, -0.32, Math.PI); f.userData.flame = 1; g.add(f); }); g.add(at(box(0.5, 0.9, 0.3, m), 0, 0, -0.2)); return g; },
    backpack: (c, c2) => grp(at(box(1.4, 1.5, 0.55, mat(c)), 0, -0.1, -0.3), at(box(1.0, 0.6, 0.18, mat(c2 || shade(c, 0.8))), 0, -0.4, -0.62), at(box(1.42, 0.12, 0.57, mat(shade(c, 0.7))), 0, 0.5, -0.3)),
    swords: () => { const g = grp(); [-1, 1].forEach(s => { const sw = grp(at(box(0.12, 1.9, 0.05, metal('#dfe6ee')), 0, 0.45, 0), at(box(0.5, 0.1, 0.12, metal('#ffcc33')), 0, -0.5, 0), at(cyl(0.06, 0.06, 0.45, mat('#5a3825')), 0, -0.78, 0)); g.add(at(sw, 0, 0, -0.3, 0, 0, s * 0.6)); }); return g; },
    booster: () => { const f = at(cone(0.28, 0.7, glow('#4fc3ff', { emissiveIntensity: 1.5 }), 12), 0, -1.05, -0.45, Math.PI); f.userData.flame = 1; return grp(at(cyl(0.38, 0.38, 1.4, mat('#eef1f5')), 0, 0, -0.45), at(cone(0.38, 0.6, mat('#e0263f')), 0, 1.0, -0.45), f); },
  };

  // ---------- pets (about 1.3 units tall, feet at y = 0, facing +z) ----------
  const eyesOn = (g, y, z, sp = 0.14, r = 0.06) => [-1, 1].forEach(s => { g.add(at(sph(r, mat('#1b1d22', { roughness: 0.2 }), 10, 8), s * sp, y, z)); g.add(at(sph(r * 0.35, mat('#ffffff'), 6, 6), s * sp + 0.02, y + 0.02, z + r * 0.8)); });
  const PETS = {
    cat: (c) => { const m = mat(c || '#ff9f43'), g = grp(at(sph(0.42, m), 0, 0.42, 0), at(sph(0.32, m), 0, 0.92, 0.12), at(cone(0.11, 0.24, m, 4), 0.18, 1.2, 0.12, 0, Math.PI / 4, -0.3), at(cone(0.11, 0.24, m, 4), -0.18, 1.2, 0.12, 0, Math.PI / 4, 0.3), at(cyl(0.05, 0.04, 0.6, m), 0, 0.5, -0.45, -0.9)); eyesOn(g, 0.95, 0.4); return g; },
    dog: (c) => { const m = mat(c || '#c68642'), e = mat(shade(c || '#c68642', 0.6)), g = grp(at(sph(0.42, m), 0, 0.42, 0), at(sph(0.32, m), 0, 0.92, 0.12), at(sph(0.14, m), 0, 0.84, 0.42), at(sph(0.05, mat('#1b1d22')), 0, 0.88, 0.55)); [-1, 1].forEach(s => { const ear = at(sph(0.12, e), s * 0.3, 0.95, 0.08); ear.scale.set(0.6, 1.6, 0.8); g.add(ear); }); eyesOn(g, 1.0, 0.38); return g; },
    bunny: (c) => { const m = mat(c || '#f4f1ee'), g = grp(at(sph(0.42, m), 0, 0.42, 0), at(sph(0.3, m), 0, 0.9, 0.1)); [-1, 1].forEach(s => { const ear = at(sph(0.1, m), s * 0.12, 1.32, 0.05); ear.scale.set(0.7, 2.6, 0.6); g.add(ear); }); g.add(at(sph(0.12, mat('#fff', { roughness: 1 })), 0, 0.38, -0.42)); eyesOn(g, 0.95, 0.36); return g; },
    bear: (c) => { const m = mat(c || '#8b5a2b'), g = grp(at(sph(0.45, m), 0, 0.45, 0), at(sph(0.34, m), 0, 0.98, 0.1), at(sph(0.11, m), 0.24, 1.26, 0.06), at(sph(0.11, m), -0.24, 1.26, 0.06), at(sph(0.13, mat('#e8c9a0')), 0, 0.92, 0.38)); eyesOn(g, 1.05, 0.38); return g; },
    penguin: () => { const g = grp(at(sph(0.45, mat('#1b1d22')), 0, 0.52, 0), at(sph(0.36, mat('#ffffff')), 0, 0.5, 0.14), at(cone(0.09, 0.2, mat('#ff9f1a'), 8), 0, 0.82, 0.46, Math.PI / 2)); g.children[0].scale.y = 1.3; eyesOn(g, 0.95, 0.38, 0.13, 0.05); return g; },
    frog: (c) => { const m = mat(c || '#4caf50'), g = grp(at(sph(0.45, m), 0, 0.38, 0)); g.children[0].scale.set(1.2, 0.8, 1); [-1, 1].forEach(s => { g.add(at(sph(0.15, m), s * 0.22, 0.72, 0.12)); g.add(at(sph(0.08, mat('#1b1d22')), s * 0.22, 0.76, 0.24)); }); g.add(at(tor(0.18, 0.025, mat('#1b1d22'), Math.PI), 0, 0.42, 0.4, 0, 0, Math.PI)); return g; },
    duck: () => { const m = mat('#ffd21f'), g = grp(at(sph(0.42, m), 0, 0.42, 0), at(sph(0.28, m), 0, 0.9, 0.15), at(box(0.26, 0.08, 0.22, mat('#ff8a1a')), 0, 0.84, 0.46)); eyesOn(g, 0.98, 0.38); return g; },
    slime: (c) => { const m = new THREE.MeshStandardMaterial({ color: col(c || '#5ee36b'), transparent: true, opacity: 0.8, roughness: 0.1 }); m.userData.own = true; const g = grp(at(box(0.85, 0.75, 0.85, m), 0, 0.38, 0)); eyesOn(g, 0.5, 0.43, 0.16, 0.07); g.userData.squish = 1; return g; },
    ghost: () => { const m = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, roughness: 0.4 }); m.userData.own = true; const g = grp(at(sph(0.42, m), 0, 0.85, 0), at(cyl(0.42, 0.48, 0.55, m, 18, true), 0, 0.55, 0)); eyesOn(g, 0.9, 0.38, 0.14, 0.07); g.userData.float = 1; return g; },
    robot: (c) => { const m = metal(c || '#aab4c0'), g = grp(at(box(0.7, 0.6, 0.55, m), 0, 0.4, 0), at(box(0.55, 0.45, 0.45, m), 0, 0.95, 0), at(cyl(0.02, 0.02, 0.3, m), 0, 1.3, 0), at(sph(0.06, glow('#e0263f')), 0, 1.47, 0)); [-1, 1].forEach(s => g.add(at(box(0.12, 0.08, 0.04, glow('#00e5ff')), s * 0.13, 1.0, 0.23))); return g; },
    dragon: (c) => { const m = mat(c || '#7b2ff7'), g = grp(at(sph(0.42, m), 0, 0.45, 0), at(sph(0.3, m), 0, 0.95, 0.15), at(cone(0.06, 0.25, mat('#ffd21f'), 8), 0.13, 1.22, 0.1), at(cone(0.06, 0.25, mat('#ffd21f'), 8), -0.13, 1.22, 0.1)); const w = wings('bat', shade(c || '#7b2ff7', 0.8)); w.scale.setScalar(0.35); w.position.set(0, 0.6, -0.3); w.rotation.y = Math.PI; g.add(w); eyesOn(g, 1.0, 0.38); g.userData.float = 1; return g; },
    unicorn: () => { const m = mat('#ffffff'), g = grp(at(sph(0.42, m), 0, 0.45, 0), at(sph(0.3, m), 0, 0.95, 0.15), at(cone(0.06, 0.4, glow('#ffd21f', { emissiveIntensity: 0.6 }), 10), 0, 1.35, 0.25, 0.3)); ['#ff6b8b', '#cf8bff', '#6cc0ff'].forEach((cc, i) => g.add(at(sph(0.1, mat(cc)), 0, 1.1 - i * 0.12, -0.1 - i * 0.05))); eyesOn(g, 1.0, 0.38); return g; },
    axolotl: () => { const m = mat('#ffb3c8'), g = grp(at(sph(0.42, m), 0, 0.38, 0), at(sph(0.32, m), 0, 0.82, 0.15)); g.children[0].scale.set(1, 0.8, 1.3); [-1, 1].forEach(s => [0, 1, 2].forEach(k => g.add(at(box(0.05, 0.22, 0.05, mat('#ff6b8b')), s * (0.3 + k * 0.02), 0.95 - k * 0.1, 0.1, 0, 0, s * (0.9 + k * 0.3))))); eyesOn(g, 0.88, 0.42); return g; },
    planet: (c) => { const g = grp(at(sph(0.5, mat(c || '#6cc0ff')), 0, 0.8, 0), at(tor(0.8, 0.04, mat('#ffd21f'), Math.PI * 2, 6, 40), 0, 0.8, 0, Math.PI / 2.4)); g.userData.float = 1; g.userData.spinY = 0.6; return g; },
    applebud: () => { const g = grp(at(sph(0.45, mat('#e0263f', { roughness: 0.35 })), 0, 0.5, 0), at(cyl(0.04, 0.04, 0.25, mat('#5a3825')), 0, 1.0, 0), at(sph(0.14, mat('#22a03a'), 10, 8), 0.16, 1.02, 0)); eyesOn(g, 0.6, 0.42); return g; },
    banana: () => { const m = mat('#ffe14d'), g = grp(); const t = at(tor(0.4, 0.14, m, Math.PI * 0.9, 10, 20), 0, 0.6, 0, 0, 0, 0.6); g.add(t); eyesOn(g, 0.75, 0.15, 0.12, 0.05); return g; },
    rocket: () => { const g = grp(at(cyl(0.25, 0.3, 0.8, mat('#eef1f5')), 0, 0.7, 0), at(cone(0.25, 0.4, mat('#e0263f')), 0, 1.3, 0), at(sph(0.1, glow('#6cc0ff')), 0, 0.85, 0.25)); const f = at(cone(0.2, 0.45, glow('#ff7a1a', { emissiveIntensity: 1.5 }), 10), 0, 0.12, 0, Math.PI); f.userData.flame = 1; g.add(f); g.userData.float = 1; return g; },
    ufo: () => { const g = grp(at(sph(0.6, metal('#aab4c0'), 24, 8), 0, 0.8, 0), at(sph(0.3, new THREE.MeshStandardMaterial({ color: 0x8ff0ff, transparent: true, opacity: 0.6 }), 16, 10, 0, Math.PI / 2), 0, 0.85, 0)); g.children[0].scale.y = 0.3; g.children[1].material.userData.own = true; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; g.add(at(sph(0.05, glow(['#ffd21f', '#ff4fb4', '#5ee36b'][i % 3])), Math.sin(a) * 0.5, 0.78, Math.cos(a) * 0.5)); } g.userData.float = 1; g.userData.spinY = 1.5; return g; },
    dino: (c) => { const m = mat(c || '#4caf50'), g = grp(at(sph(0.42, m), 0, 0.42, 0), at(sph(0.3, m), 0, 0.92, 0.2), at(cone(0.12, 0.6, m, 10), 0, 0.4, -0.55, -1.7)); for (let i = 0; i < 4; i++) g.add(at(cone(0.07, 0.15, mat('#ffd21f'), 4), 0, 0.85 - i * 0.18, -0.15 - i * 0.12, -0.4)); eyesOn(g, 1.0, 0.45); return g; },
    soccer: () => { const g = grp(at(sph(0.42, mat('#ffffff')), 0, 0.42, 0)); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; g.add(at(sph(0.1, mat('#1b1d22'), 6, 4), Math.sin(a) * 0.38, 0.42 + Math.cos(a * 2) * 0.12, Math.cos(a) * 0.38)); } return g; },
    tomcat: () => PETS.cat('#9aa4b0'),
  };

  // ---------- auras (particle effects around the body) ----------
  const AURAS = {
    sparkle: { cols: ['#ffe066', '#ffffff', '#ffcc33'], mode: 'twinkle', n: 40 },
    fire: { cols: ['#ff7a1a', '#ffcc33', '#ff3b1f'], mode: 'rise', n: 70, speed: 2.2 },
    snow: { cols: ['#ffffff', '#dff4ff'], mode: 'fall', n: 60, speed: 0.9 },
    hearts: { cols: ['#ff4f8b', '#ff8ab0', '#ffffff'], mode: 'rise', n: 30, speed: 0.9, size: 0.5 },
    bubbles: { cols: ['#8fd8ff', '#ffffff'], mode: 'rise', n: 36, speed: 0.7, size: 0.45 },
    lightning: { cols: ['#fff36b', '#9be7ff', '#ffffff'], mode: 'zap', n: 50 },
    galaxy: { cols: ['#a855ff', '#4f7bff', '#ff4fd8', '#ffffff'], mode: 'orbit', n: 80, speed: 1.2 },
    rainbow: { cols: ['#ff3b3b', '#ff9f1a', '#ffe14d', '#3ddc5a', '#3d9bff', '#a855ff'], mode: 'orbit', n: 72, speed: 2 },
  };
  let dot = null;
  function aura(id) {
    const A = AURAS[id]; if (!A) return null;
    dot = dot || canvasTex(32, 32, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, '#fff'); gr.addColorStop(0.45, 'rgba(255,255,255,.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
    dot.userData.own = false;
    const n = A.n, P = new Float32Array(n * 3), C = new Float32Array(n * 3), seed = [];
    for (let i = 0; i < n; i++) { const c = col(A.cols[i % A.cols.length]); C.set([c.r, c.g, c.b], i * 3); seed.push([Math.random() * Math.PI * 2, Math.random(), Math.random()]); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(P, 3)); geo.setAttribute('color', new THREE.BufferAttribute(C, 3));
    const m = new THREE.PointsMaterial({ size: A.size || 0.3, map: dot, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }); m.userData.own = true;
    const pts = new THREE.Points(geo, m);
    const update = t => {
      for (let i = 0; i < n; i++) {
        const [a, u, w] = seed[i]; let x, y, z;
        if (A.mode === 'rise') { const k = (u + t * (A.speed || 1) * 0.25) % 1; const r = 1.4 + w * 0.6; x = Math.sin(a + k * 2) * r; z = Math.cos(a + k * 2) * r; y = k * 5.6; }
        else if (A.mode === 'fall') { const k = (u + t * (A.speed || 1) * 0.15) % 1; const r = 0.6 + w * 1.6; x = Math.sin(a) * r; z = Math.cos(a) * r; y = 6 - k * 6; }
        else if (A.mode === 'orbit') { const r = 1.5 + w * 0.5, aa = a + t * (A.speed || 1) * (0.4 + w * 0.6); x = Math.sin(aa) * r; z = Math.cos(aa) * r; y = 0.3 + u * 5 + Math.sin(t * 2 + a) * 0.2; }
        else if (A.mode === 'zap') { const k = Math.floor(t * 12 + i) % 7 === 0; const r = 1.3 + w * 0.7; x = Math.sin(a + Math.floor(t * 8) * 0.7) * r * (k ? 1 : 0.95); z = Math.cos(a + Math.floor(t * 8) * 0.7) * r; y = u * 5.5; }
        else { const r = 1.3 + w * 0.8; x = Math.sin(a) * r; z = Math.cos(a) * r; y = 0.3 + u * 5; }
        P.set([x, y, z], i * 3);
      }
      geo.attributes.position.needsUpdate = true;
      if (A.mode === 'twinkle') m.opacity = 0.65 + Math.sin(t * 6) * 0.35;
    };
    update(0.5); pts.userData.update = update;
    return pts;
  }

  // ---------- items ----------
  const rarityHex = r => ({ common: '#9aa6b8', rare: '#3d9bff', epic: '#b14cff', legendary: '#ffb000', mythic: '#ff3b5c' })[r] || '#9aa6b8';
  // A gear item: game-icons vectors are extruded, a few are built by hand.
  function gearObj(it) {
    if (typeof GI !== 'undefined' && GI[it.id]) { const e = K3.extrude(GI[it.id].match(/d="([^"]+)"/)[1], rarityHex(it.r), 2.5); const g = grp(e); e.rotation.z = Math.PI / 4; e.position.y = 0.9; return g; }
    if (it.k === 'saber') { const s = grp(at(cyl(0.08, 0.08, 0.5, metal('#aab4c0')), 0, 0, 0), at(cyl(0.06, 0.06, 1.8, glow(it.c || '#00e5ff', { emissiveIntensity: 1.6 })), 0, 1.15, 0)); s.rotation.x = 1.0; s.position.z = 0.2; return grp(s); }
    return box(0.2, 1.5, 0.2, mat('#888'));
  }
  function backObj(it) {
    if (typeof GI !== 'undefined' && GI[it.id]) { const e = K3.extrude(GI[it.id].match(/d="([^"]+)"/)[1], rarityHex(it.r), 2.4); e.position.z = -0.25; return e; }
    return (BACKS[it.k] || BACKS.backpack)(it.c, it.c2);
  }
  const hatObj = it => (HATS[it.k] || HATS.cap)(it.c, it.c2);
  const faceObj = it => (FACES[it.k] || FACES.shades)(it.c, it.c2);
  const petObj = it => (it.build ? it.build() : (PETS[it.k] || PETS.cat)(it.c, it.c2));

  // Sparkles that orbit an object (shiny items).
  function shinyFx(obj, r = 0.9) { const p = aura('sparkle'); p.scale.setScalar(r / 1.6); p.position.y = -0.5; obj.add(p); obj.userData.shiny = p; }

  // ---------- the character ----------
  function build(av, eq = {}, o = {}) {
    av = Object.assign({}, DEFAULT_AVATAR, av || {}); eq = eq || {};
    const it = id => (id && typeof ITEM !== 'undefined' && ITEM[id]) || null;
    const sh = eq.shiny || {};
    const skin = SKINS[av.skin] || SKINS[1], hc = HAIRC[av.hairColor] || HAIRC[0];
    const skinM = mat(skin, { roughness: 0.6 });
    const shirt = it(eq.shirt) || { id: 'default-shirt', slot: 'shirt', style: 'tee', c: SHIRTS[av.shirt] || SHIRTS[0] };
    const pants = it(eq.pants) || { id: 'default-pants', slot: 'pants', style: 'plain', c: av.pants || '#2b3442' };
    const root = grp(), P = {};
    // torso
    const tm = f => own({ map: cloth(shirt, f), roughness: shirt.style === 'gold' ? 0.3 : 0.7, metalness: shirt.style === 'gold' ? 0.35 : 0 });
    const side = tm('side'), top = mat(shirt.style === 'tux' ? '#1b1d22' : shirt.style === 'labcoat' ? '#f4f6f8' : shirt.c || '#1f6feb');
    P.torso = at(box(2, 2, 1, [side, side, top, top, tm('front'), tm('back')]), 0, 3, 0); root.add(P.torso);
    // arms: a sleeve on top, skin below (long sleeves leave a little hand showing)
    const long = ['hoodie', 'labcoat', 'tux', 'space', 'galaxy', 'gold', 'flannel', 'sweater', 'varsity', 'camo', 'lava', 'track'].includes(shirt.style);
    const sl = long ? 1.72 : 0.85, armM = own({ map: cloth(shirt, 'arm'), roughness: 0.7 });
    const arm = sx => { const g = grp(at(box(1.02, sl, 1.02, armM), 0, -sl / 2, 0), at(box(0.96, 2 - sl, 0.96, skinM), 0, -sl - (2 - sl) / 2, 0)); g.position.set(sx, 4, 0); return g; };
    P.armL = arm(1.5); P.armR = arm(-1.5); root.add(P.armL, P.armR);
    // legs with shoes
    const shorts = pants.style === 'shorts', legM = own({ map: cloth(pants, 'leg'), roughness: pants.style === 'gold' ? 0.3 : 0.75 });
    const shoeM = mat(pants.shoe || '#1b1d22');
    const leg = sx => { const g = grp(); if (shorts) g.add(at(box(1.02, 0.9, 1.02, legM), 0, -0.45, 0), at(box(0.96, 1.1, 0.96, skinM), 0, -1.45, 0)); else g.add(at(box(1, 2, 1, legM), 0, -1, 0)); g.add(at(box(1.04, 0.32, 1.14, shoeM), 0, -1.86, 0.05)); g.position.set(sx, 2, 0); return g; };
    P.legL = leg(0.5); P.legR = leg(-0.5); root.add(P.legL, P.legR);
    // head
    const headGeo = new THREE.CapsuleGeometry(0.62, 0.55, 8, 24);
    const faceM = own({ map: faceTex(skin, av.eyes, av.mouth), roughness: 0.6 });
    const head = mesh(headGeo, faceM); head.rotation.y = Math.PI; head.scale.y = 0.72;
    P.head = grp(head); P.head.position.set(0, 4.62, 0); root.add(P.head);
    const hatIt = it(eq.hat);
    if (!(hatIt && ['astro', 'void'].includes(hatIt.k))) P.head.add(hair(av.hair, hc));
    // accessories
    const ext = [];
    if (hatIt) { const h = hatObj(hatIt); h.position.y = 0.58; if (sh.hat) shinyFx(h); P.head.add(h); ext.push(h); }
    const faceIt = it(eq.face); if (faceIt) { const f = faceObj(faceIt); f.position.set(0, 0.05, 0.6); P.head.add(f); ext.push(f); }
    const backIt = it(eq.back); if (backIt) { const b = backObj(backIt); b.position.set(0, 3.4, -0.52); if (sh.back) shinyFx(b, 1.4); root.add(b); ext.push(b); P.back = b; }
    const gearIt = it(eq.gear); if (gearIt && o.gear !== false) { const g = gearObj(gearIt); const hold = grp(g); g.position.set(-0.15, 0.1, 0.2); hold.position.set(0, -1.95, 0.45); hold.rotation.x = -0.25; if (sh.gear) shinyFx(hold); P.armR.add(hold); ext.push(hold); P.armR.rotation.x = -0.35; P.holding = true; }
    const petIt = it(eq.pet); if (petIt && o.pet !== false) { const p = petObj(petIt); p.position.set(2.6, 0, 0.8); p.rotation.y = -0.4; if (sh.pet) shinyFx(p); root.add(p); P.pet = p; }
    const auraId = it(eq.aura) && ITEM[eq.aura].k; if (auraId && o.aura !== false) { const a = aura(auraId); if (a) { root.add(a); P.aura = a; } }
    if (o.shadow !== false) root.add(K3.blob(3.2));
    root.userData.parts = P;
    root.userData.tick = (t, dt, moving = 0) => animate(root, t, dt, moving);
    return root;
  }

  // Idle bob, walk cycle, and every animated accessory.
  function animate(root, t, dt, moving) {
    const P = root.userData.parts, sw = Math.sin(t * 9) * 0.7 * moving;
    P.legL.rotation.x = sw; P.legR.rotation.x = -sw;
    P.armL.rotation.x = -sw * 0.8; P.armR.rotation.x = P.holding ? -0.35 + sw * 0.2 : sw * 0.8;
    P.torso.position.y = 3 + Math.sin(t * 2) * 0.02 * (1 - moving);
    P.head.position.y = 4.62 + Math.sin(t * 2) * 0.03 * (1 - moving);
    root.traverse(o => {
      const u = o.userData;
      if (u.spin) o.rotation.y += u.spin * dt;
      if (u.float) o.position.y = (u.baseY ?? (u.baseY = o.position.y)) + Math.sin(t * 2.4) * 0.08;
      if (u.spinY) o.rotation.y += u.spinY * dt;
      if (u.flame) o.scale.set(1, 0.75 + Math.random() * 0.5, 1);
      if (u.squish) o.scale.set(1 + Math.sin(t * 5) * 0.06, 1 - Math.sin(t * 5) * 0.06, 1 + Math.sin(t * 5) * 0.06);
      if (u.flap && u.wings) { const a = Math.sin(t * u.flap) * 0.18; u.wings[0].rotation.y = -0.5 - a; u.wings[1].rotation.y = Math.PI + 0.5 + a; }
      if (u.update) u.update(t);
    });
    if (P.pet) { P.pet.position.y = Math.abs(Math.sin(t * 3.2)) * 0.18; }
    if (P.back && P.back.userData.capeMesh) {
      const cm = P.back.userData.capeMesh, base = cm.userData.cape, pos = cm.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) { const y = base[i * 3 + 1]; pos.array[i * 3 + 2] = base[i * 3 + 2] - (-y) * (0.12 + moving * 0.35) - Math.sin(t * 4 + y * 2 + base[i * 3] * 1.5) * 0.06 * (-y); }
      pos.needsUpdate = true;
    }
  }

  // The item on its own, for thumbnails and the case reveal. Clothes are shown on a plain mannequin.
  function itemObj(it) {
    const mannequin = { skin: 2, hair: 'none', eyes: 'dots', mouth: 'smile', shirt: 6 };
    switch (it.slot) {
      case 'hat': { const h = hatObj(it); return h; }
      case 'face': return faceObj(it);
      case 'back': return backObj(it);
      case 'gear': return gearObj(it);
      case 'pet': return petObj(it);
      case 'shirt': { const a = build(mannequin, { shirt: it.id }, { shadow: false }); a.remove(a.userData.parts.legL, a.userData.parts.legR, a.userData.parts.head); return a; }
      case 'pants': { const a = build(mannequin, { pants: it.id }, { shadow: false }); a.remove(a.userData.parts.torso, a.userData.parts.armL, a.userData.parts.armR, a.userData.parts.head); return a; }
      case 'aura': { const a = build(mannequin, { aura: it.id }, { shadow: false }); a.traverse(o => { if (o.isMesh) o.material = mat('#c9d1db'); }); const pts = a.userData.parts.aura; if (pts) { pts.material.blending = THREE.NormalBlending; pts.material.size *= 2.2; pts.userData.update(1.3); } return a; }
      default: return null;
    }
  }

  return { build, animate, itemObj, hatObj, faceObj, backObj, gearObj, petObj, aura, shinyFx, PETS, HATS, FACES, BACKS, AURAS, rarityHex, cloth,
    prim: { mesh, box, sph, cyl, cone, tor, grp, at, shade, mix, metal, eyesOn } };
})();
