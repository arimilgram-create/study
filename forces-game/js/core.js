// Inertia Quest — core engine: state, XP, sound, confetti, map, level runner.
const $ = (s, r = document) => r.querySelector(s);
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k === 'style') el.style.cssText = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat()) if (k != null && k !== false) el.append(k.nodeType ? k : document.createTextNode(k));
  return el;
}
const css = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const F = (sub) => `F<sub>${sub}</sub>`; // label helper, e.g. F('g') -> F_g
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.floor(Math.random() * a.length)];

// Sets up a canvas at device pixel ratio; returns ctx drawing in CSS-pixel units of (w x h).
function hiDPI(canvas, w, hgt) {
  const d = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = w * d; canvas.height = hgt * d;
  const ctx = canvas.getContext('2d'); ctx.setTransform(d, 0, 0, d, 0, 0); return ctx;
}
// Runs a frame loop until the element leaves the page.
function loop(el, fn) {
  let last = performance.now();
  function tick(t) {
    if (!el.isConnected) return;
    const dt = Math.min(0.05, (t - last) / 1000); last = t;
    if (fn(dt) !== false) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ---------- persistent state ----------
const SAVE_KEY = 'inertia-quest-v1';
function loadState() {
  try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s && typeof s.xp === 'number') return s; } catch (e) {}
  return { xp: 0, stars: {}, sound: true };
}
function saveState() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(Game.state)); } catch (e) {} }

const RANKS = [[0, 'At Rest'], [120, 'Rolling Start'], [300, 'Constant Velocity'], [550, 'Inertia Ninja'], [850, 'Net Force Boss'], [1200, 'Sir Isaac Newton']];
const rankFor = xp => RANKS.filter(r => xp >= r[0]).pop()[1];

// ---------- sound (starts only after a click) ----------
let actx = null;
function tone(freqs, dur = 0.08, type = 'square', vol = 0.05) {
  if (!Game.state.sound) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = actx.currentTime;
    freqs.forEach((f, i) => {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.value = f;
      g.gain.setValueAtTime(vol, t0 + i * dur);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + (i + 1) * dur);
      o.connect(g); g.connect(actx.destination);
      o.start(t0 + i * dur); o.stop(t0 + (i + 1) * dur + 0.03);
    });
  } catch (e) {}
}
const SFX = {
  good: () => tone([660, 880, 1320], 0.07),
  bad: () => tone([200, 140], 0.13, 'sawtooth', 0.04),
  click: () => tone([540], 0.03, 'triangle'),
  win: () => tone([523, 659, 784, 1047, 1319, 1568], 0.09),
  boom: () => tone([120, 90, 60], 0.12, 'sawtooth', 0.06),
  whoosh: () => tone([300, 420, 560, 700], 0.05, 'triangle', 0.04),
};

// ---------- confetti ----------
function confetti() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cv = $('#confetti'); const W = innerWidth, H = innerHeight; const ctx = hiDPI(cv, W, H);
  const cols = ['--f-g', '--f-n', '--f-a', '--f-f', '--f-lift', '--hi', '--pen'].map(css);
  const ps = Array.from({ length: 140 }, () => ({ x: W / 2 + (Math.random() - .5) * 200, y: H * .35, vx: (Math.random() - .5) * 700, vy: -Math.random() * 650 - 150, r: Math.random() * 6, c: pick(cols), s: 5 + Math.random() * 6 }));
  let t = 0;
  (function f() {
    t += 1 / 60; ctx.clearRect(0, 0, W, H);
    for (const p of ps) { p.vy += 900 / 60; p.x += p.vx / 60; p.y += p.vy / 60; p.r += .15; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); }
    if (t < 2.4) requestAnimationFrame(f); else ctx.clearRect(0, 0, W, H);
  })();
}

function xpPop(text, anchor) {
  const r = (anchor || $('#xp')).getBoundingClientRect();
  const el = h('div', { class: 'xp-pop', style: `left:${clamp(r.left + r.width / 2 - 40, 8, innerWidth - 120)}px;top:${r.top - 8}px` }, text);
  document.body.append(el); setTimeout(() => el.remove(), 1000);
}

// ---------- game ----------
const Game = {
  state: loadState(),
  levels: [],
  streak: 0,
  add(def) { this.levels.push(def); },

  hud() {
    $('#xp').textContent = this.state.xp;
    $('#rank').textContent = rankFor(this.state.xp);
    $('#streak').textContent = this.streak >= 3 ? `${this.streak} (x${this.mult()})` : this.streak;
    $('#streakBox').classList.toggle('hot', this.streak >= 3);
    $('#soundBtn').textContent = 'Sound: ' + (this.state.sound ? 'on' : 'off');
    $('#soundBtn').setAttribute('aria-pressed', this.state.sound);
  },
  mult() { return Math.min(3, 1 + Math.floor(this.streak / 3) * 0.5); },
  award(base, anchor) {
    this.streak++;
    const gain = Math.round(base * this.mult());
    this.state.xp += gain; saveState(); this.hud();
    xpPop(`+${gain} XP${this.mult() > 1 ? ' x' + this.mult() : ''}`, anchor);
    return gain;
  },
  miss() { this.streak = 0; this.hud(); },

  boot() {
    $('#homeBtn').onclick = () => this.map();
    $('#soundBtn').onclick = () => { this.state.sound = !this.state.sound; saveState(); this.hud(); SFX.click(); };
    this.hud(); this.map();
  },

  map() {
    const app = $('#app'); app.innerHTML = '';
    const total = this.levels.reduce((n, l) => n + (this.state.stars[l.id] || 0), 0);
    app.append(
      h('section', { class: 'hero' },
        h('div', {},
          h('h1', { html: 'Forces, FBDs &amp; the <em>First Law</em>' }),
          h('p', {}, 'Every station is one question from your quiz review, turned into a mini-game. Build free body diagrams, cut the Moon loose, crash-test a dummy, and heave Terry\'s box onto the shelf. Beat the Final Boss when you\'re ready.'),
          h('p', { class: 'mono' }, `Stars: ${total} / ${this.levels.length * 3}`)),
        h('aside', { class: 'cheat' },
          h('h3', {}, 'Cheat sheet'),
          h('div', { class: 'eq', html: `F<sub>net</sub> = F<sub>1</sub> + F<sub>2</sub> + ...<br>F<sub>g</sub> = m &middot; g<br>g = -10 N/kg (Earth)` }),
          h('small', {}, 'Up and right are +. Down and left are -. Show: equation, values plugged in, answer with units.'),
          h('div', { class: 'legend', html: Object.entries(FORCES).map(([k, f]) => `<span style="color:var(${f.c})">${f.label}</span>`).join('') }))),
      h('div', { class: 'grid' }, this.levels.map((l, i) => {
        const s = this.state.stars[l.id] || 0;
        return h('button', { class: 'station' + (l.boss ? ' boss' : ''), onclick: () => { SFX.click(); this.play(i); } },
          h('span', { class: 'tag' }, h('span', {}, l.tag), h('span', { class: 'stars', html: starHTML(s) })),
          h('h2', {}, l.title), h('p', {}, l.blurb));
      })));
    scrollTo(0, 0);
  },

  play(index) {
    const def = this.levels[index];
    const app = $('#app'); app.innerHTML = '';
    const run = { mistakes: 0, xp: 0, hearts: 3 };
    const dots = h('div', { class: 'dots' }, def.steps.map(() => h('i')));
    const body = h('div');
    app.append(h('div', { class: 'lvl-head' },
      h('button', { class: 'btn small', onclick: () => this.map() }, '< Map'),
      h('span', { class: 'tag' }, def.tag), h('h2', {}, def.title), dots), body);
    scrollTo(0, 0);

    const go = (i) => {
      [...dots.children].forEach((d, j) => d.className = j < i ? 'done' : j === i ? 'now' : '');
      if (i >= def.steps.length) return this.finish(index, run, body);
      body.innerHTML = '';
      const el = h('section', { class: 'step' }); body.append(el);
      const api = {
        run,
        right: (xp = 10, anchor) => { run.xp += this.award(xp, anchor); SFX.good(); },
        wrong: (target) => { run.mistakes++; this.miss(); SFX.bad(); if (target) { target.classList.remove('shake'); void target.offsetWidth; target.classList.add('shake'); } },
        next: () => go(i + 1),
        end: () => go(def.steps.length),
        // Shows the purple-pen explanation and a Next button.
        done: (noteHTML, label = 'Next >') => {
          if (noteHTML) el.append(h('div', { class: 'pen', html: noteHTML }));
          const b = h('button', { class: 'btn primary', onclick: () => { SFX.click(); go(i + 1); } }, i === def.steps.length - 1 ? 'Finish station' : label);
          el.append(h('div', { class: 'next-row' }, b)); b.focus({ preventScroll: true });
          b.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        },
      };
      def.steps[i](el, api);
    };
    go(0);
  },

  finish(index, run, body) {
    const def = this.levels[index];
    const stars = def.boss ? run.hearts : run.mistakes === 0 ? 3 : run.mistakes <= 2 ? 2 : 1;
    const prev = this.state.stars[def.id] || 0;
    if (stars > prev) this.state.stars[def.id] = stars;
    saveState(); SFX.win(); confetti();
    const lines = def.boss
      ? (run.hearts > 0 ? 'Boss defeated. You know your forces.' : 'The Boss wins this round. Replay a station, then try again.')
      : run.mistakes === 0 ? 'Flawless. Zero mistakes.' : `${run.mistakes} mistake${run.mistakes > 1 ? 's' : ''}. Replay for 3 stars.`;
    body.innerHTML = '';
    body.append(h('section', { class: 'step result' },
      h('h2', {}, def.boss && run.hearts === 0 ? 'Game over' : 'Station cleared!'),
      h('div', { class: 'bigstars', html: starHTML(stars) }),
      h('p', {}, lines), h('p', { class: 'mono' }, `+${run.xp} XP this run`),
      h('div', { class: 'row', style: 'justify-content:center' },
        h('button', { class: 'btn', onclick: () => this.play(index) }, 'Replay'),
        index + 1 < this.levels.length ? h('button', { class: 'btn primary', onclick: () => this.play(index + 1) }, 'Next station >') : null,
        h('button', { class: 'btn', onclick: () => this.map() }, 'Map'))));
  },
};
const starHTML = n => [0, 1, 2].map(i => i < n ? '&#9733;' : '<span class="off">&#9733;</span>').join('');

// Force catalog: one color per force, used by every diagram in the game.
const FORCES = {
  Fg: { label: 'F<sub>g</sub>', sub: 'g', name: 'Gravity (weight)', c: '--f-g' },
  FN: { label: 'F<sub>N</sub>', sub: 'N', name: 'Normal (surface pushes)', c: '--f-n' },
  FA: { label: 'F<sub>A</sub>', sub: 'A', name: 'Applied (push/pull)', c: '--f-a' },
  Ff: { label: 'F<sub>f</sub>', sub: 'f', name: 'Friction', c: '--f-f' },
  Fair: { label: 'F<sub>air</sub>', sub: 'air', name: 'Air resistance (drag)', c: '--f-air' },
  Flift: { label: 'F<sub>lift</sub>', sub: 'lift', name: 'Air lift (wings)', c: '--f-lift' },
  Feng: { label: 'F<sub>engine</sub>', sub: 'engine', name: 'Engine thrust', c: '--f-eng' },
  Fs: { label: 'F<sub>scale</sub>', sub: 'scale', name: 'Spring scale pull', c: '--f-s' },
};
