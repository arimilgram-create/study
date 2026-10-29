// 3D kit: shared Three.js helpers. Live views (with drag-to-spin), snapshot thumbnails, materials, canvas textures,
// text billboards, particle bursts, tweens, and an SVG path parser that turns game-icons vectors into 3D shapes.

const K3 = (() => {
  let okCache = null;
  // True when WebGL works here. Everything 3D checks this and falls back to the 2D art when it doesn't.
  const ok = () => {
    if (okCache !== null) return okCache;
    try { const c = document.createElement('canvas'); okCache = !!(window.THREE && (c.getContext('webgl2') || c.getContext('webgl'))); }
    catch (e) { okCache = false; }
    return okCache;
  };
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const col = c => new THREE.Color(c);

  // Shared materials, cached by color and options. Never disposed (they're reused everywhere).
  const mats = new Map();
  function mat(color, o = {}) {
    const key = color + '|' + JSON.stringify(o);
    if (!mats.has(key)) mats.set(key, new THREE.MeshStandardMaterial(Object.assign({ color: col(color), roughness: 0.55, metalness: 0 }, o)));
    return mats.get(key);
  }
  const glow = (color, o = {}) => mat(color, Object.assign({ emissive: col(color), emissiveIntensity: 0.8, roughness: 0.3 }, o));
  // A material that belongs to one object (for its own canvas texture). Disposed with the object.
  function own(o) { const m = new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.6, metalness: 0 }, o)); m.userData.own = true; return m; }
  function canvasTex(w, h, draw) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); t.anisotropy = 4; t.userData.own = true; return t;
  }
  // Frees geometry plus any per-object materials and textures (cached materials are left alone).
  function dispose(obj) {
    obj.traverse(o => {
      if (o.geometry && !o.geometry.userData.keep) o.geometry.dispose();
      const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
      ms.forEach(m => { if (m.userData && m.userData.own) { if (m.map) m.map.dispose(); m.dispose(); } });
    });
  }

  function lights(scene, strength = 1) {
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8a9bb0, 0.95 * strength));
    const d = new THREE.DirectionalLight(0xffffff, 0.75 * strength); d.position.set(4, 8, 6); scene.add(d);
    const r = new THREE.DirectionalLight(0xbfd9ff, 0.35 * strength); r.position.set(-5, 3, -4); scene.add(r);
  }
  // A soft round shadow under a character or item.
  let blobTex = null;
  function blob(size = 2.4, opacity = 0.32) {
    blobTex = blobTex || canvasTex(64, 64, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 2, w / 2, w / 2, w / 2); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
    blobTex.userData.own = false;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, opacity, depthWrite: false }));
    m.material.userData.own = true; m.rotation.x = -Math.PI / 2; m.position.y = 0.01; return m;
  }

  // ---------- snapshots: one shared offscreen renderer makes PNG thumbnails ----------
  let shotR = null;
  function shot(obj, { w = 160, h = 160, dir = [0.55, 0.32, 1], fit = 1.08, fov = 28, keep = false, frame = null } = {}) {
    if (!shotR) { shotR = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); shotR.setPixelRatio(1); }
    shotR.setSize(w, h, false);
    const scene = new THREE.Scene(); lights(scene); scene.add(obj);
    obj.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(frame || obj), size = box.getSize(V()), c = box.getCenter(V());
    const cam = new THREE.PerspectiveCamera(fov, w / h, 0.05, 500);
    const r = Math.max(size.length() / 2, 0.01) * fit, dist = r / Math.sin(fov * Math.PI / 360);
    cam.position.copy(c).add(V(...dir).normalize().multiplyScalar(dist)); cam.lookAt(c);
    shotR.setClearColor(0x000000, 0); shotR.render(scene, cam);
    const url = shotR.domElement.toDataURL('image/png');
    scene.remove(obj); if (!keep) dispose(obj);
    return url;
  }

  // ---------- live views ----------
  // A canvas in `host` that renders `root` every frame, spins on drag (with inertia), and cleans itself up when removed.
  function view(host, o = {}) {
    const ren = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    ren.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    const canvas = ren.domElement; canvas.className = 'v3d'; host.append(canvas);
    const scene = new THREE.Scene(); lights(scene, o.light || 1);
    if (o.fog) scene.fog = new THREE.Fog(o.fog[0], o.fog[1], o.fog[2]);
    const camera = new THREE.PerspectiveCamera(o.fov || 35, 1, 0.1, o.far || 400);
    camera.position.set(...(o.cam || [0, 3, 10])); const target = V(...(o.target || [0, 2.6, 0])); camera.lookAt(target);
    const root = new THREE.Group(); scene.add(root);
    const v = { scene, camera, root, ren, canvas, target, t: 0, frames: [], spinV: 0, auto: o.auto ?? 0.35, dragging: false, alive: true };
    const size = () => { const w = host.clientWidth || 300, hh = o.h || host.clientHeight || 300; ren.setSize(w, hh, false); canvas.style.width = '100%'; canvas.style.height = hh + 'px'; camera.aspect = w / hh; camera.updateProjectionMatrix(); };
    size(); const ro = new ResizeObserver(size); ro.observe(host);
    if (o.drag !== false) {
      let lx = 0;
      canvas.addEventListener('pointerdown', e => { v.dragging = true; lx = e.clientX; canvas.setPointerCapture(e.pointerId); });
      canvas.addEventListener('pointermove', e => { if (!v.dragging) return; const dx = e.clientX - lx; lx = e.clientX; root.rotation.y += dx * 0.012; v.spinV = dx * 0.6; });
      const up = () => { v.dragging = false; }; canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
      canvas.style.touchAction = 'pan-y'; canvas.style.cursor = 'grab';
    }
    let last = performance.now();
    const tick = now => {
      if (!canvas.isConnected) { v.alive = false; ro.disconnect(); dispose(scene); ren.dispose(); ren.forceContextLoss(); return; }
      const dt = Math.min(0.05, (now - last) / 1000); last = now; v.t += dt;
      if (!v.dragging && o.drag !== false) { v.spinV *= Math.pow(0.04, dt); root.rotation.y += (v.spinV * 0.02 + v.auto * dt); }
      for (const f of v.frames.slice()) if (f(dt, v.t) === false) v.frames.splice(v.frames.indexOf(f), 1);
      ren.render(scene, camera);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    v.burst = (pos, colors, n, opts) => burst(v, pos, colors, n, opts);
    return v;
  }

  // ---------- particles ----------
  const dotTex = () => canvasTex(32, 32, (g, w) => { const gr = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.4, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, w); });
  let dot = null;
  // A burst of glowing particles that fly out, fall, and fade. `colors` is a list of CSS colors.
  function burst(v, pos, colors, n = 60, { speed = 6, up = 4, grav = 9, life = 1.4, size = 0.35, parent = null } = {}) {
    dot = dot || dotTex(); dot.userData.own = false;
    const g = new THREE.BufferGeometry(), P = new Float32Array(n * 3), C = new Float32Array(n * 3), vel = [];
    for (let i = 0; i < n; i++) {
      P.set([pos.x, pos.y, pos.z], i * 3);
      const c = col(colors[i % colors.length]); C.set([c.r, c.g, c.b], i * 3);
      const a = Math.random() * Math.PI * 2, e = Math.random() * 0.9 + 0.1;
      vel.push(V(Math.cos(a) * speed * e, up * (0.4 + Math.random()), Math.sin(a) * speed * e));
    }
    g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('color', new THREE.BufferAttribute(C, 3));
    const m = new THREE.PointsMaterial({ size, map: dot, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    m.userData.own = true;
    const pts = new THREE.Points(g, m); (parent || v.scene).add(pts);
    let t = 0;
    v.frames.push(dt => {
      t += dt;
      for (let i = 0; i < n; i++) { vel[i].y -= grav * dt; P[i * 3] += vel[i].x * dt; P[i * 3 + 1] += vel[i].y * dt; P[i * 3 + 2] += vel[i].z * dt; }
      g.attributes.position.needsUpdate = true; m.opacity = Math.max(0, 1 - t / life);
      if (t >= life) { pts.parent.remove(pts); g.dispose(); m.dispose(); return false; }
    });
  }

  // ---------- text billboards ----------
  function label(text, { color = '#fff', bg = 'rgba(0,0,0,.0)', size = 64, stroke = '#15171c', font = 'Fredoka, Arial Rounded MT Bold, sans-serif', weight = 700, h = 0.5 } = {}) {
    const lines = String(text).split('\n');
    const probe = document.createElement('canvas').getContext('2d'); probe.font = `${weight} ${size}px ${font}`;
    const w = Math.ceil(Math.max(...lines.map(l => probe.measureText(l).width)) + size * 0.8), hh = Math.ceil(lines.length * size * 1.15 + size * 0.4);
    const tex = canvasTex(w, hh, g => {
      if (bg !== 'rgba(0,0,0,.0)') { g.fillStyle = bg; const r = size * 0.35; g.beginPath(); g.roundRect ? g.roundRect(0, 0, w, hh, r) : g.rect(0, 0, w, hh); g.fill(); }
      g.font = `${weight} ${size}px ${font}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
      lines.forEach((l, i) => { const y = hh / 2 + (i - (lines.length - 1) / 2) * size * 1.15; if (stroke) { g.lineWidth = size * 0.18; g.strokeStyle = stroke; g.strokeText(l, w / 2, y); } g.fillStyle = color; g.fillText(l, w / 2, y); });
    });
    const m = new THREE.SpriteMaterial({ map: tex, depthWrite: false, transparent: true }); m.userData.own = true;
    const s = new THREE.Sprite(m); s.scale.set(h * w / hh * lines.length, h * lines.length, 1); s.userData.aspect = w / hh;
    return s;
  }

  // ---------- tweens ----------
  const ease = { out: k => 1 - Math.pow(1 - k, 3), inOut: k => k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2, back: k => { const c = 1.70158; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); }, elastic: k => k === 0 || k === 1 ? k : Math.pow(2, -10 * k) * Math.sin((k * 10 - 0.75) * (2 * Math.PI / 3)) + 1 };
  // Runs fn(k) for k from 0 to 1 over `dur` seconds in view v. Resolves when done.
  const tween = (v, dur, fn, e = ease.out) => new Promise(res => { let t = 0; fn(0); v.frames.push(dt => { t += dt; const k = Math.min(1, t / dur); fn(e(k)); if (k >= 1) { res(); return false; } }); });

  // ---------- SVG path -> THREE.Shape[] (for extruding game-icons vectors) ----------
  function svgShapes(d) {
    const sp = new THREE.ShapePath(); let i = 0, x = 0, y = 0, sx = 0, sy = 0, cx = 0, cy = 0, cmd = '', prevC = '';
    const isSep = ch => ch === ' ' || ch === ',' || ch === '\n' || ch === '\t' || ch === '\r';
    const skip = () => { while (i < d.length && isSep(d[i])) i++; };
    const num = () => { skip(); const m = /^[-+]?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/.exec(d.slice(i, i + 40)); if (!m) throw new Error('svg num at ' + i); i += m[0].length; return parseFloat(m[0]); };
    const flag = () => { skip(); const ch = d[i++]; return ch === '1' ? 1 : 0; };
    const hasNum = () => { skip(); return i < d.length && /[-+.\d]/.test(d[i]); };
    while (true) {
      skip(); if (i >= d.length) break;
      if (/[a-zA-Z]/.test(d[i])) cmd = d[i++]; else if (!cmd) break;
      const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase(), ox = rel ? x : 0, oy = rel ? y : 0;
      if (C === 'M') { x = num() + ox; y = num() + oy; sx = x; sy = y; sp.moveTo(x, y); cmd = rel ? 'l' : 'L'; cx = x; cy = y; }
      else if (C === 'L') { x = num() + ox; y = num() + oy; sp.lineTo(x, y); cx = x; cy = y; }
      else if (C === 'H') { x = num() + (rel ? x : 0); sp.lineTo(x, y); cx = x; cy = y; }
      else if (C === 'V') { y = num() + (rel ? y : 0); sp.lineTo(x, y); cx = x; cy = y; }
      else if (C === 'C') { const x1 = num() + ox, y1 = num() + oy, x2 = num() + ox, y2 = num() + oy; x = num() + ox; y = num() + oy; sp.bezierCurveTo(x1, y1, x2, y2, x, y); cx = x2; cy = y2; }
      else if (C === 'S') { const rx1 = 'CS'.includes(prevC) ? 2 * x - cx : x, ry1 = 'CS'.includes(prevC) ? 2 * y - cy : y; const x2 = num() + ox, y2 = num() + oy; x = num() + ox; y = num() + oy; sp.bezierCurveTo(rx1, ry1, x2, y2, x, y); cx = x2; cy = y2; }
      else if (C === 'Q') { const x1 = num() + ox, y1 = num() + oy; x = num() + ox; y = num() + oy; sp.quadraticCurveTo(x1, y1, x, y); cx = x1; cy = y1; }
      else if (C === 'T') { const x1 = 'QT'.includes(prevC) ? 2 * x - cx : x, y1 = 'QT'.includes(prevC) ? 2 * y - cy : y; x = num() + ox; y = num() + oy; sp.quadraticCurveTo(x1, y1, x, y); cx = x1; cy = y1; }
      else if (C === 'A') { const rx = num(), ry = num(), rot = num(), la = flag(), sw = flag(), x0 = x, y0 = y; x = num() + ox; y = num() + oy; arcTo(sp, rx, ry, rot, la, sw, x0, y0, x, y); cx = x; cy = y; }
      else if (C === 'Z') { sp.currentPath && sp.currentPath.closePath(); x = sx; y = sy; cx = x; cy = y; if (hasNum()) cmd = rel ? 'l' : 'L'; }
      else throw new Error('svg cmd ' + cmd);
      prevC = C;
    }
    return sp.toShapes(true);
  }
  function svgAngle(ux, uy, vx, vy) { const dt = ux * vx + uy * vy, len = Math.hypot(ux, uy) * Math.hypot(vx, vy); let a = Math.acos(Math.max(-1, Math.min(1, dt / len))); if (ux * vy - uy * vx < 0) a = -a; return a; }
  function arcTo(sp, rx, ry, rotDeg, la, sw, x0, y0, x1, y1) {
    if (!rx || !ry || (x0 === x1 && y0 === y1)) { sp.lineTo(x1, y1); return; }
    const rot = rotDeg * Math.PI / 180; rx = Math.abs(rx); ry = Math.abs(ry);
    const dx2 = (x0 - x1) / 2, dy2 = (y0 - y1) / 2, x1p = Math.cos(rot) * dx2 + Math.sin(rot) * dy2, y1p = -Math.sin(rot) * dx2 + Math.cos(rot) * dy2;
    let rxs = rx * rx, rys = ry * ry; const x1ps = x1p * x1p, y1ps = y1p * y1p, cr = x1ps / rxs + y1ps / rys;
    if (cr > 1) { const s = Math.sqrt(cr); rx *= s; ry *= s; rxs = rx * rx; rys = ry * ry; }
    const dq = rxs * y1ps + rys * x1ps; let q = Math.sqrt(Math.max(0, (rxs * rys - dq) / dq)); if (la === sw) q = -q;
    const cxp = q * rx * y1p / ry, cyp = -q * ry * x1p / rx;
    const ccx = Math.cos(rot) * cxp - Math.sin(rot) * cyp + (x0 + x1) / 2, ccy = Math.sin(rot) * cxp + Math.cos(rot) * cyp + (y0 + y1) / 2;
    const th = svgAngle(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry), dl = svgAngle((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry) % (Math.PI * 2);
    sp.currentPath.absellipse(ccx, ccy, rx, ry, th, th + dl, sw === 0, rot);
  }
  // Extrudes an SVG path (512 x 512 box) into a 3D object `size` units tall, in one color with darker sides.
  const extCache = new Map();
  function extrude(d, color, size = 1.6, depth = 46) {
    let geo = extCache.get(d);
    if (!geo) {
      geo = new THREE.ExtrudeGeometry(svgShapes(d), { depth, bevelEnabled: true, bevelThickness: 8, bevelSize: 5, bevelSegments: 1, curveSegments: 5 });
      geo.translate(-256, -256, -depth / 2); geo.userData.keep = true; extCache.set(d, geo);
    }
    const c = col(color), side = c.clone().multiplyScalar(0.6);
    const m = new THREE.Mesh(geo, [mat('#' + c.getHexString(), { roughness: 0.4 }), mat('#' + side.getHexString(), { roughness: 0.5 })]);
    const s = size / 512; m.scale.set(s, -s, s);
    return m;
  }

  return { ok, V, col, mat, glow, own, canvasTex, dispose, lights, blob, shot, view, burst, label, tween, ease, svgShapes, extrude };
})();
