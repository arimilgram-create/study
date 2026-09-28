// Stations for review questions 4–6.

// ---------------- Q4 ----------------
function orbitSVG(path) {
  return `<svg viewBox="0 0 170 110" role="img" aria-label="moon path">
    <circle cx="85" cy="62" r="34" fill="none" style="stroke:var(--muted)" stroke-dasharray="3 4"/>
    <circle cx="85" cy="62" r="12" style="fill:var(--f-n)"/>
    <path d="${path}" fill="none" style="stroke:var(--f-a)" stroke-width="3" stroke-dasharray="5 4"/>
    <circle cx="85" cy="28" r="6" style="fill:var(--card);stroke:var(--ink)" stroke-width="2"/>
    ${arrowSVG(92, 28, 118, 28, '--ink', null, 0, 0, 2)}</svg>`;
}
function moonGame(el, api) {
  el.append(h('div', { class: 'q' }, 'Moon Breakout: cut Earth\'s gravity at the perfect moment to send the Moon into the satellite.'),
    h('p', { class: 'ctx', html: 'The red arrow is gravity pulling the Moon toward Earth. Press <b>Cut gravity</b> (or Space) and watch the path the Moon takes.' }));
  const cv = h('canvas', { 'aria-label': 'Moon orbiting Earth with a target satellite' });
  const score = h('div', { class: 'readout' });
  const cut = h('button', { class: 'btn primary', onclick: act }, 'Cut gravity!');
  el.append(h('div', { class: 'sim one' }, h('div', { class: 'panel', style: 'max-width:460px;margin:0 auto;width:100%' }, cv)), h('div', { class: 'row' }, cut, score));
  const S = 360, C = 180, R = 92, w = 1.3, ctx = hiDPI(cv, S, S);
  const stars = Array.from({ length: 70 }, () => [Math.random() * S, Math.random() * S, Math.random() * 1.4 + .3]);
  let th = 0, free = false, mx, my, vx, vy, trail = [], tgt, tries = 0, hits = 0, msg = '', passed = false;
  const newTarget = () => { const a = Math.random() * Math.PI * 2; tgt = [C + 150 * Math.cos(a), C + 150 * Math.sin(a)]; };
  newTarget();
  function act() {
    if (!free) { free = true; tries++; vx = -Math.sin(th) * w * R; vy = Math.cos(th) * w * R; trail = []; SFX.whoosh(); cut.textContent = 'Flying...'; cut.disabled = true; }
  }
  function reset() { free = false; cut.disabled = false; cut.textContent = 'Cut gravity!'; }
  const onKey = e => { if (!el.isConnected) return document.removeEventListener('keydown', onKey); if (e.code === 'Space' && document.activeElement?.tagName !== 'INPUT') { e.preventDefault(); act(); } };
  document.addEventListener('keydown', onKey);
  loop(el, dt => {
    if (!free) { th += w * dt; mx = C + R * Math.cos(th); my = C + R * Math.sin(th); }
    else {
      mx += vx * dt; my += vy * dt; trail.push([mx, my]);
      if (Math.hypot(mx - tgt[0], my - tgt[1]) < 20) {
        hits++; msg = 'DIRECT HIT!'; SFX.good(); confetti();
        if (!passed) { passed = true; api.right(25, cut); api.done('With no gravity, no force acts on the Moon. Inertia keeps it moving at <b>constant velocity</b>: the same speed, in a <b>straight line</b>, in whatever direction it was going at that instant.'); }
        newTarget(); reset();
      } else if (mx < -20 || my < -20 || mx > S + 20 || my > S + 20) { msg = 'Missed! Notice: it always flies straight, along the direction it was moving.'; SFX.bad(); reset(); }
    }
    draw();
    score.innerHTML = `<span class="big">Hits: ${hits} / ${tries}</span><span>${msg}</span>`;
  });
  function draw() {
    ctx.fillStyle = '#0d1530'; ctx.fillRect(0, 0, S, S);
    ctx.fillStyle = '#ffffff'; stars.forEach(([x, y, r]) => { ctx.globalAlpha = .6; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }); ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.arc(C, C, R, 0, 7); ctx.stroke();
    if (!free && tries >= 2) { // hint: tangent line
      const tx = -Math.sin(th), ty = Math.cos(th); ctx.strokeStyle = 'rgba(255,212,59,.55)';
      ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx + tx * 400, my + ty * 400); ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.fillStyle = '#2f7de1'; ctx.beginPath(); ctx.arc(C, C, 26, 0, 7); ctx.fill();
    ctx.fillStyle = '#3fae5a'; ctx.beginPath(); ctx.ellipse(C - 7, C - 5, 11, 7, .5, 0, 7); ctx.ellipse(C + 10, C + 9, 7, 5, -.3, 0, 7); ctx.fill();
    // target satellite
    const [tx, ty] = tgt; ctx.strokeStyle = '#ffd43b'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(tx, ty, 20, 0, 7); ctx.stroke();
    ctx.fillStyle = '#cfd6e4'; ctx.fillRect(tx - 5, ty - 5, 10, 10); ctx.fillStyle = '#5aa2ff'; ctx.fillRect(tx - 16, ty - 3, 9, 6); ctx.fillRect(tx + 7, ty - 3, 9, 6);
    // trail
    ctx.strokeStyle = 'rgba(255,169,77,.9)'; ctx.lineWidth = 3; ctx.beginPath(); trail.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
    // moon
    ctx.fillStyle = '#d9dde4'; ctx.beginPath(); ctx.arc(mx, my, 10, 0, 7); ctx.fill();
    ctx.fillStyle = '#aab1bd'; ctx.beginPath(); ctx.arc(mx - 3, my - 2, 2.5, 0, 7); ctx.arc(mx + 4, my + 3, 1.8, 0, 7); ctx.fill();
    ctx.font = '700 13px ' + css('--mono');
    if (!free) {
      const gx = (C - mx) / R, gy = (C - my) / R; arrowC(mx, my, mx + gx * 44, my + gy * 44, '#ff6b61'); ctx.fillStyle = '#ff6b61'; ctx.fillText('Fg', mx + gx * 50 + 4, my + gy * 50);
      const vx2 = -Math.sin(th), vy2 = Math.cos(th); arrowC(mx, my, mx + vx2 * 36, my + vy2 * 36, '#ffffff', 1.5); ctx.fillStyle = '#fff'; ctx.fillText('v', mx + vx2 * 42, my + vy2 * 42);
    } else { ctx.fillStyle = '#ffd43b'; ctx.fillText('GRAVITY OFF: no forces', 10, 20); }
  }
  function arrowC(x1, y1, x2, y2, c, lw = 3) {
    const a = Math.atan2(y2 - y1, x2 - x1); ctx.strokeStyle = ctx.fillStyle = c; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2 + Math.cos(a) * 4, y2 + Math.sin(a) * 4); ctx.lineTo(x2 - Math.cos(a - .5) * 9, y2 - Math.sin(a - .5) * 9); ctx.lineTo(x2 - Math.cos(a + .5) * 9, y2 - Math.sin(a + .5) * 9); ctx.fill();
  }
}

Game.add({
  id: 'q4', tag: 'Review Q4', title: 'Moon Breakout',
  blurb: 'Switch off Earth\'s gravity and aim the Moon at a satellite. Inertia decides where it goes.',
  steps: [
    (el, api) => MCQ(el, api, {
      ctx: 'The Moon is held in a circle by Earth\'s gravity, like friction from a speed skater\'s skates holds her on the curve.',
      q: 'Predict: if Earth\'s gravity suddenly vanished, what path would the Moon take?',
      opts: [
        { t: 'A straight line in the direction it was moving', ok: true, svg: orbitSVG('M85 28 L165 28') },
        { t: 'Straight out, directly away from Earth', why: 'Nothing pushes it outward. With no force it just keeps the velocity it already had.', svg: orbitSVG('M85 28 L85 2') },
        { t: 'A spiral that slowly curves away', why: 'Curving requires a force. With zero force, no curve.', svg: orbitSVG('M85 28 Q140 14 158 58 Q164 96 124 104') },
        { t: 'It keeps circling out of habit', why: 'Circles need a force pulling toward the center. Remove the force and the circle is over.', svg: orbitSVG('M85 28 A34 34 0 1 1 84.9 28') },
      ],
      explain: 'Let\'s test your prediction in space.', xp: 10,
    }),
    moonGame,
    (el, api) => MCQ(el, api, {
      q: 'Explain it: why does the Moon go straight once gravity is gone?',
      opts: [
        { t: 'Inertia: with no force, it keeps a constant velocity (same speed, straight line).', ok: true },
        { t: 'Leftover orbit force keeps it moving', why: 'There\'s no such thing as leftover force. Forces only act while they act.' },
        { t: 'Centrifugal force flings it outward', why: 'If it were flung outward it would move away from Earth radially. It doesn\'t; it goes along the tangent.' },
        { t: 'It stops, because nothing pushes it anymore', why: 'Objects don\'t need a push to keep moving. They need a force to <i>change</i> their motion.' },
      ],
      explain: 'Inertia is the natural tendency to maintain constant velocity: constant speed in a constant straight-line direction.',
    }),
    (el, api) => MCQ(el, api, {
      q: 'A speed skater is racing around a curve when her skates hit a patch of perfectly frictionless ice. What happens?',
      opts: [
        { t: 'She slides off in a straight line, the way she was heading', ok: true },
        { t: 'She keeps following the curve', why: 'Friction was the force making her curve. No friction, no curve.' },
        { t: 'She stops immediately', why: 'No friction means nothing slows her down either.' },
        { t: 'She slides toward the center of the curve', why: 'That would need a force toward the center, which is exactly what just disappeared.' },
      ],
      explain: 'Same physics as the Moon: remove the center-pulling force and inertia carries the object straight ahead.',
    }),
  ],
});

// ---------------- Q5 ----------------
const PLANETS = [['Moon', 1.6], ['Mars', 3.7], ['Earth', 10], ['Jupiter', 25]];
function slopeLab(el, api) {
  el.append(h('div', { class: 'q' }, 'Planet Slope Lab: pick a planet and slide the mass.'),
    h('p', { class: 'ctx', html: 'The solid line is Earth. The dotted line is the planet you pick. Try at least three planets, including Mars.' }));
  const gbox = h('div', { class: 'panel' });
  const mIn = h('input', { type: 'range', min: 0, max: 10, step: 0.5, value: 6, id: 'massSlider', 'aria-label': 'Mass in kilograms' });
  const read = h('div', { class: 'readout' });
  let pl = PLANETS[1]; const tried = new Set();
  const pbtns = PLANETS.map(p => h('button', { class: 'btn small', onclick: () => { pl = p; tried.add(p[0]); SFX.click(); draw(); } }, `${p[0]} (${p[1]} N/kg)`));
  el.append(h('div', { class: 'sim' }, gbox, h('div', { style: 'display:flex;flex-direction:column;gap:12px;min-width:0' }, h('div', { class: 'row' }, pbtns), h('label', { for: 'massSlider', class: 'hint' }, 'Mass (kg)'), mIn, read)));
  mIn.oninput = draw; tried.add('Mars');
  let passed = false;
  function draw() {
    const m = +mIn.value, g = pl[1];
    const x0 = 50, y0 = 200, sx = v => x0 + v / 10 * 290, sy = v => y0 - v / 260 * 186;
    pbtns.forEach((b, i) => b.classList.toggle('on', PLANETS[i] === pl));
    const ticks = [0, 50, 100, 150, 200, 250].map(t => `<line x1="${x0}" x2="340" y1="${sy(t)}" y2="${sy(t)}" style="stroke:var(--line)"/><text x="${x0 - 6}" y="${sy(t) + 4}" text-anchor="end" style="fill:var(--muted);font:11px var(--mono)">${t}</text>`).join('') +
      [0, 2, 4, 6, 8, 10].map(t => `<text x="${sx(t)}" y="${y0 + 16}" text-anchor="middle" style="fill:var(--muted);font:11px var(--mono)">${t}</text>`).join('');
    const end = Math.min(10, 260 / g);
    gbox.innerHTML = `<svg viewBox="0 0 360 240" role="img" aria-label="Weight versus mass graph">${ticks}
      <line x1="${x0}" y1="14" x2="${x0}" y2="${y0}" style="stroke:var(--ink)" stroke-width="2"/><line x1="${x0}" y1="${y0}" x2="340" y2="${y0}" style="stroke:var(--ink)" stroke-width="2"/>
      <text x="195" y="236" text-anchor="middle" style="fill:var(--muted);font:12px var(--body)">Mass (kg)</text>
      <text x="14" y="120" text-anchor="middle" transform="rotate(-90 14 120)" style="fill:var(--muted);font:12px var(--body)">Weight (N)</text>
      <line x1="${sx(0)}" y1="${sy(0)}" x2="${sx(10)}" y2="${sy(100)}" style="stroke:var(--ink)" stroke-width="2.5"/>
      <line x1="${sx(0)}" y1="${sy(0)}" x2="${sx(end)}" y2="${sy(end * g)}" style="stroke:var(--f-a)" stroke-width="4" stroke-dasharray="2 7" stroke-linecap="round"/>
      <circle cx="${sx(m)}" cy="${sy(m * 10)}" r="5" style="fill:var(--ink)"/>
      <circle cx="${sx(m)}" cy="${sy(Math.min(260, m * g))}" r="7" style="fill:var(--f-a)"/></svg>`;
    const Wp = +(m * g).toFixed(1);
    read.innerHTML = `<span class="big">${pl[0]}: slope = ${g} N/kg</span><span>F<sub>g</sub> = m &middot; g = ${m} kg &middot; (-${g} N/kg) = -${Wp} N</span><span>Earth: ${m} kg weighs ${m * 10} N</span><span>Mass stays ${m} kg on every planet.</span>`;
    if (!passed && tried.size >= 3) { passed = true; api.right(15, read); api.done('The <b>slope</b> of a weight vs. mass graph <b>is g</b>, the gravitational field strength. Weaker field = less steep line.'); }
  }
  draw();
}
const earthLine = { d: 'M24 92 L150 20' };
Game.add({
  id: 'q5', tag: 'Review Q5', title: 'Planet Slope Lab',
  blurb: 'Weight vs. mass graphs on the Moon, Mars, Earth and Jupiter. The slope is g.',
  steps: [
    slopeLab,
    (el, api) => MCQ(el, api, {
      q: 'The solid line shows weight vs. mass on Earth. Which dotted line shows <b>Mars</b>, a smaller planet with a weaker gravitational field?', keepOrder: true,
      opts: [
        { t: 'a. Less steep straight line', ok: true, svg: graphSVG([earthLine, { d: 'M24 92 L160 62', dash: true, color: '--f-a' }], 'Mass (kg)', 'Weight (N)') },
        { t: 'b. Same line as Earth', why: 'Same slope would mean the same g. Mars has a weaker field.', svg: graphSVG([earthLine, { d: 'M24 92 L150 20', dash: true, color: '--f-a' }], 'Mass (kg)', 'Weight (N)') },
        { t: 'c. Steeper straight line', why: 'Steeper means a stronger field, like Jupiter. Mars is weaker.', svg: graphSVG([earthLine, { d: 'M24 92 L90 8', dash: true, color: '--f-a' }], 'Mass (kg)', 'Weight (N)') },
        { t: 'd. Curve that bends upward', why: 'Weight is directly proportional to mass (F<sub>g</sub> = mg), so the graph is a straight line through zero.', svg: graphSVG([earthLine, { d: 'M24 92 Q110 86 140 8', dash: true, color: '--f-a' }], 'Mass (kg)', 'Weight (N)') },
      ],
      explain: 'Weaker field means objects of the same mass have less gravitational force on them. The field is the slope of weight vs. mass, so Mars makes a smaller slope: graph a.',
    }),
    (el, api) => MCQ(el, api, {
      ctx: 'A space probe lands and measures: a <b>4 kg</b> rock has a weight of <b>100 N</b>.',
      q: 'Which planet did it land on?',
      opts: PLANETS.map(([n, g]) => ({ t: `${n} (g = ${g} N/kg)`, ok: n === 'Jupiter', why: `On ${n}, 4 kg would weigh ${4 * g} N.` })),
      explain: 'Slope = weight / mass:<span class="eq">g = 100 N / 4 kg = 25 N/kg</span>That\'s Jupiter.',
    }),
    (el, api) => NUM(el, api, {
      q: 'A 50 kg student visits Mars, where g = -3.7 N/kg. What is their weight there?', ans: -185, tol: 0.5, unit: 'N',
      explain: '<span class="eq">F<sub>g</sub> = m &middot; g</span><span class="eq">F<sub>g</sub> = 50 kg &middot; (-3.7 N/kg)</span><span class="eq">F<sub>g</sub> = -185 N</span>On Earth they\'d weigh -500 N. Same 50 kg of student, though.',
    }),
  ],
});

// ---------------- Q6 ----------------
function crashTest(el, api) {
  el.append(h('div', { class: 'q' }, 'Crash Test Lab: drive the car into the wall with and without a seatbelt.'),
    h('p', { class: 'ctx' }, 'Run the test both ways. Watch what the dummy does the instant the car stops.'));
  const cv = h('canvas', { 'aria-label': 'Car crash test animation' });
  const belt = h('button', { class: 'btn', onclick: () => { if (!running) { belted = !belted; SFX.click(); paint(); draw(); } } });
  const drive = h('button', { class: 'btn primary', onclick: start }, 'Drive!');
  const info = h('div', { class: 'readout' });
  el.append(h('div', { class: 'sim one' }, h('div', { class: 'panel' }, cv)), h('div', { class: 'row' }, belt, drive), info);
  const W = 420, H = 190, ctx = hiDPI(cv, W, H), wallX = 360, V = 120;
  let belted = false, running = false, carX = 20, dx = 0, t = 0, crashed = false, slow = 1, lean = 0; const done = new Set(); let passed = false;
  function paint() { belt.textContent = 'Seatbelt: ' + (belted ? 'ON' : 'OFF'); belt.classList.toggle('on', belted); }
  function start() { if (running) return; running = true; carX = 20; dx = 0; crashed = false; slow = 1; lean = 0; t = 0; drive.disabled = true; info.innerHTML = ''; }
  paint();
  loop(el, dt => {
    if (running) {
      t += dt;
      if (!crashed) { carX += V * dt; if (carX + 130 >= wallX) { carX = wallX - 130; crashed = true; slow = 0.25; SFX.boom(); } }
      else {
        const sdt = dt * slow;
        if (belted) { lean = Math.min(10, lean + V * sdt * 0.6); }
        else if (dx < 44) { dx += V * sdt; if (dx >= 44) { dx = 44; SFX.bad(); } }
        if (t > 3.2) {
          running = false; drive.disabled = false; done.add(belted);
          info.innerHTML = belted ? '<span class="big">Belted: the belt pulled the dummy backward and it stopped with the car.</span>'
            : '<span class="big">No belt: the dummy kept moving at the car\'s old speed until the dashboard stopped it. Ouch.</span>';
          if (done.size === 2 && !passed) { passed = true; api.right(20, drive); api.done('Nothing pushed the dummy forward. The <b>car</b> stopped, and the dummy\'s <b>inertia</b> kept it moving. Only a force (belt or dashboard) could stop it.'); }
          else if (!passed) info.innerHTML += `<span>Now try it with the seatbelt ${belted ? 'OFF' : 'ON'}.</span>`;
        }
      }
    }
    draw();
  });
  function draw() {
    const soft = css('--soft'), ink = css('--ink'), mut = css('--muted');
    ctx.fillStyle = soft; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = mut; ctx.fillRect(0, 160, W, 3);
    for (let y = 60; y < 160; y += 20) for (let x = wallX + ((y / 20) % 2 ? 0 : 10); x < W; x += 20) { ctx.strokeStyle = mut; ctx.strokeRect(x, y, 20, 20); }
    ctx.fillStyle = css('--f-g'); ctx.globalAlpha = .25; ctx.fillRect(wallX, 60, W - wallX, 100); ctx.globalAlpha = 1;
    const shake = crashed && t < 0.9 ? Math.sin(t * 90) * 2 : 0, x = carX + shake;
    // car
    ctx.fillStyle = css('--f-n'); ctx.strokeStyle = ink; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, 110, 130, 34, 8) : ctx.rect(x, 110, 130, 34); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 22, 110); ctx.lineTo(x + 38, 80); ctx.lineTo(x + 88, 80); ctx.lineTo(x + 108, 110); ctx.closePath(); ctx.fillStyle = soft; ctx.fill(); ctx.stroke();
    [x + 28, x + 104].forEach(wx => { ctx.fillStyle = ink; ctx.beginPath(); ctx.arc(wx, 146, 13, 0, 7); ctx.fill(); ctx.fillStyle = mut; ctx.beginPath(); ctx.arc(wx, 146, 5, 0, 7); ctx.fill(); });
    // dummy
    const d = x + 58 + dx + lean;
    ctx.fillStyle = '#f2c230'; ctx.strokeStyle = '#18212d'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(d, 92, 9, 0, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#18212d'; ctx.beginPath(); ctx.moveTo(d, 92); ctx.arc(d, 92, 9, 0, Math.PI / 2); ctx.fill(); ctx.beginPath(); ctx.moveTo(d, 92); ctx.arc(d, 92, 9, Math.PI, Math.PI * 1.5); ctx.fill();
    ctx.fillStyle = '#f2c230'; ctx.fillRect(d - 7, 101, 14, 22); ctx.strokeRect(d - 7, 101, 14, 22);
    if (belted) { ctx.strokeStyle = css('--f-a'); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(d - 8, 102); ctx.lineTo(d + 7, 122); ctx.stroke(); }
    ctx.font = '700 13px ' + css('--mono');
    if (crashed && belted && lean > 2) { arrowH(d - 10, 112, d - 50, css('--f-a')); ctx.fillStyle = css('--f-a'); ctx.fillText('F belt', d - 58, 70 + 30); }
    if (crashed && !belted && dx < 44) { arrowH(d + 12, 96, d + 40, ink, 2); ctx.fillStyle = ink; ctx.fillText('inertia: still moving!', 10, 24); }
    if (crashed && !belted && dx >= 44) { ctx.fillStyle = css('--f-g'); ctx.fillText('BONK! Dashboard stops the dummy', 10, 24); }
    if (!running && !crashed) { ctx.fillStyle = ink; ctx.fillText('Press Drive!', 10, 24); }
    if (slow < 1 && running) { ctx.fillStyle = mut; ctx.fillText('SLOW-MO', W - 130, 24); }
  }
  function arrowH(x1, y, x2, c, lw = 4) {
    const s = Math.sign(x2 - x1); ctx.strokeStyle = ctx.fillStyle = c; ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2 - s * 8, y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y); ctx.lineTo(x2 - s * 10, y - 6); ctx.lineTo(x2 - s * 10, y + 6); ctx.fill();
  }
}
Game.add({
  id: 'q6', tag: 'Review Q6', title: 'Crash Test Dummy',
  blurb: 'Slam a car into a wall, belt on and belt off. Newton\'s First Law explains the seatbelt.',
  steps: [
    crashTest,
    (el, api) => MCQ(el, api, {
      q: 'When the car suddenly stops, why does an unbelted passenger keep moving forward?',
      opts: [
        { t: 'Inertia: their body tends to keep moving at the same velocity', ok: true },
        { t: 'The crash pushes them forward', why: 'The crash pushes the <i>car</i> backward (it stops it). Nothing pushes the passenger forward.' },
        { t: 'The car\'s motion gets transferred into them as a force', why: 'Moving objects don\'t carry forces with them. The passenger was already moving; they just keep doing it.' },
        { t: 'Gravity pulls them toward the front of the car', why: 'Gravity pulls down, not forward.' },
      ],
      explain: 'Newton\'s First Law: objects have inertia. The passenger keeps going forward when the car stops.',
    }),
    (el, api) => MCQ(el, api, {
      q: 'So what does a seatbelt actually do?',
      opts: [
        { t: 'Puts a backward force on the passenger so they stop with the car', ok: true },
        { t: 'Removes the passenger\'s inertia', why: 'Inertia can\'t be removed. Anything with mass has it. The belt applies a force to overcome it.' },
        { t: 'Pushes the passenger forward to match the car', why: 'The car is stopping, so the passenger needs a force backward.' },
        { t: 'Nothing physics-related; it just keeps you comfortable', why: 'It\'s pure physics: it supplies the force that changes your velocity.' },
      ],
      explain: 'A seatbelt puts a force backward on the passenger, overcoming that inertia so they slow down with the car instead of hitting the dashboard.',
    }),
    (el, api) => MCQ(el, api, {
      q: 'Which statement is Newton\'s First Law?',
      opts: [
        { t: 'An object keeps its velocity (at rest or moving straight at constant speed) unless an unbalanced force acts on it', ok: true },
        { t: 'Moving objects need a constant force to keep moving', why: 'That\'s the old (wrong) idea from before Newton. No net force needed for constant velocity.' },
        { t: 'Every object eventually slows down and stops on its own', why: 'They stop because of forces like friction. Remove friction and they\'d keep going.' },
        { t: 'Heavier objects fall faster', why: 'Not the First Law (and not true without air resistance, either).' },
      ],
      explain: 'Law of inertia: no net force means no change in velocity.',
    }),
  ],
});
