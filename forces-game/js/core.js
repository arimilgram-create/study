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
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = a => a[Math.floor(Math.random() * a.length)];

// Sets up a canvas at device pixel ratio; returns ctx drawing in CSS-pixel units of (w x h).
function hiDPI(canvas, w, hgt) {
  const d = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = w * d; canvas.height = hgt * d;
  const ctx = canvas.getContext('2d'); ctx.setTransform(d, 0, 0, d, 0, 0); return ctx;
}
// Runs a frame loop until the element leaves the page (or fn returns false).
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
  let s = null;
  try { s = JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) {}
  if (!s || typeof s.xp !== 'number') s = { xp: 0, stars: {}, sound: true };
  // v2 fields: spendable wallet, inventory, equipped cosmetics, character, first free case
  if (typeof s.wallet !== 'number') { s.wallet = s.xp; s.freeCase = true; }
  s.inv = s.inv || {}; s.equip = s.equip || {}; s.opened = s.opened || 0;
  s.avatar = Object.assign({}, DEFAULT_AVATAR, s.avatar || {});
  return s;
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
  tick: () => tone([1200], 0.015, 'square', 0.025),
  win: () => tone([523, 659, 784, 1047, 1319, 1568], 0.09),
  boom: () => tone([120, 90, 60], 0.12, 'sawtooth', 0.06),
  whoosh: () => tone([300, 420, 560, 700], 0.05, 'triangle', 0.04),
};

// ---------- confetti (uses the equipped confetti style) ----------
function confetti(power = 1) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cv = $('#confetti'); const W = innerWidth, H = innerHeight; const ctx = hiDPI(cv, W, H);
  const cols = CONFETTI[Game.state.equip.confetti] || ['--f-g', '--f-n', '--f-a', '--f-f', '--f-lift', '--hi', '--pen'].map(css);
  const ps = Array.from({ length: Math.round(140 * power) }, () => ({ x: W / 2 + (Math.random() - .5) * 200, y: H * .35, vx: (Math.random() - .5) * 700 * power, vy: -Math.random() * 650 - 150, r: Math.random() * 6, c: pick(cols), s: 5 + Math.random() * 6 }));
  let t = 0;
  (function f() {
    t += 1 / 60; ctx.clearRect(0, 0, W, H);
    for (const p of ps) { p.vy += 900 / 60; p.x += p.vx / 60; p.y += p.vy / 60; p.r += .15; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); }
    if (t < 2.4) requestAnimationFrame(f); else ctx.clearRect(0, 0, W, H);
  })();
}

function xpPop(text, anchor, cls = '') {
  const r = (anchor || $('#xp')).getBoundingClientRect();
  const el = h('div', { class: 'xp-pop ' + cls, style: `left:${clamp(r.left + r.width / 2 - 40, 8, innerWidth - 140)}px;top:${r.top - 8}px` }, text);
  document.body.append(el); setTimeout(() => el.remove(), 1000);
}

// ---------- game ----------
const Game = {
  state: null,
  levels: [],
  streak: 0,
  add(def) { this.levels.push(def); },

  hud() {
    const s = this.state;
    $('#xp').textContent = s.wallet;
    $('#rank').textContent = rankFor(s.xp);
    $('#streak').textContent = this.streak >= 3 ? `${this.streak} (x${this.mult()})` : this.streak;
    $('#streakBox').classList.toggle('hot', this.streak >= 3);
    $('#soundBtn').textContent = 'Sound: ' + (s.sound ? 'on' : 'off');
    $('#soundBtn').setAttribute('aria-pressed', s.sound);
    $('#meAvatar').innerHTML = avatarSVG(s.avatar, s.equip, 'head');
    $('#meName').textContent = s.avatar.name;
    $('#meTitle').textContent = s.equip.title ? ITEM[s.equip.title].name : rankFor(s.xp);
    $('#shopBtn').classList.toggle('glow', !!s.freeCase || s.wallet >= CASES[0].price);
  },
  mult() { return Math.min(3, 1 + Math.floor(this.streak / 3) * 0.5); },
  award(base, anchor) {
    this.streak++;
    const gain = Math.round(base * this.mult());
    this.state.xp += gain; this.state.wallet += gain; saveState(); this.hud();
    xpPop(`+${gain} XP${this.mult() > 1 ? ' x' + this.mult() : ''}`, anchor);
    return gain;
  },
  miss() { this.streak = 0; this.hud(); },

  boot() {
    this.state = loadState();
    $('#homeBtn').onclick = () => this.map();
    $('#meBtn').onclick = () => { SFX.click(); this.character(); };
    $('#shopBtn').onclick = () => { SFX.click(); this.shop(); };
    $('#soundBtn').onclick = () => { this.state.sound = !this.state.sound; saveState(); this.hud(); SFX.click(); };
    this.hud(); this.map();
  },

  map() {
    const app = $('#app'); app.innerHTML = '';
    const s = this.state, total = this.levels.reduce((n, l) => n + (s.stars[l.id] || 0), 0);
    const owned = ITEMS.filter(i => s.inv[i.id]).length;
    const station = (l, i) => {
      const st = s.stars[l.id] || 0;
      return h('button', { class: 'station' + (l.boss ? ' boss' : '') + (l.section === 'extra' ? ' extra' : ''), onclick: () => { SFX.click(); this.play(i); } },
        h('span', { class: 'tag' }, h('span', {}, l.tag), h('span', { class: 'stars', html: starHTML(st) })),
        h('h2', {}, l.title), h('p', {}, l.blurb));
    };
    const section = (key, title, sub) => [
      h('div', { class: 'sec-head' }, h('h2', {}, title), h('p', {}, sub)),
      h('div', { class: 'grid' }, this.levels.map((l, i) => (l.section || 'main') === key ? station(l, i) : null)),
    ];
    app.append(
      h('section', { class: 'hero' },
        h('div', {},
          h('h1', { html: 'Forces, FBDs &amp; the <em>First Law</em>' }),
          h('p', {}, 'Every station is one question from your quiz review, turned into a mini-game. Earn XP, crack open cases for cosmetics, and dress up your character. Beat the Final Boss when you\'re ready.'),
          h('p', { class: 'mono' }, `Stars: ${total} / ${this.levels.length * 3}`)),
        h('div', { class: 'player' },
          h('button', { class: 'player-av', onclick: () => this.character(), 'aria-label': 'Customize character', html: avatarSVG(s.avatar, s.equip) }),
          h('div', { class: 'player-info' },
            h('b', { class: 'pname' }, s.avatar.name),
            h('span', { class: 'ptitle' }, s.equip.title ? `"${ITEM[s.equip.title].name}"` : rankFor(s.xp)),
            h('span', { class: 'mono' }, `Rank: ${rankFor(s.xp)}`),
            h('span', { class: 'mono' }, `XP to spend: ${s.wallet}`),
            h('span', { class: 'mono' }, `Collection: ${owned} / ${ITEMS.length}`),
            h('div', { class: 'row' },
              h('button', { class: 'btn small', onclick: () => this.character() }, 'Customize'),
              h('button', { class: 'btn small primary', onclick: () => this.shop() }, s.freeCase ? 'Free case!' : 'Open cases'))))),
      h('aside', { class: 'cheat' },
        h('div', { class: 'eq', html: `<b>Cheat sheet</b> &nbsp; F<sub>net</sub> = F<sub>1</sub> + F<sub>2</sub> + ... &nbsp;&nbsp; F<sub>g</sub> = m &middot; g &nbsp;&nbsp; g = -10 N/kg (Earth)` }),
        h('small', {}, 'Up and right are +. Down and left are -. Show: equation, values plugged in, answer with units.'),
        h('div', { class: 'legend', html: Object.entries(FORCES).map(([k, f]) => `<span style="color:var(${f.c})">${f.label}</span>`).join('') })),
      ...section('main', 'Quiz Review', 'Questions 1-9 from the first review sheet.'),
      ...section('extra', 'Extra Practice', 'From the extra review sheet: Mr. C\'s desk, the Mars platypus, and Magnus\'s barbell.'),
      ...section('boss', 'Final Boss', 'Random questions from everything above.'));
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
    const def = this.levels[index], s = this.state;
    const stars = def.boss ? run.hearts : run.mistakes === 0 ? 3 : run.mistakes <= 2 ? 2 : 1;
    if (stars > (s.stars[def.id] || 0)) s.stars[def.id] = stars;
    saveState(); SFX.win(); confetti();
    const lost = def.boss && run.hearts === 0;
    const lines = def.boss
      ? (lost ? 'The Boss wins this round. Replay a station, then try again.' : 'Boss defeated. You know your forces.')
      : run.mistakes === 0 ? 'Flawless. Zero mistakes.' : `${run.mistakes} mistake${run.mistakes > 1 ? 's' : ''}. Replay for 3 stars.`;
    const say = lost ? 'We\'ll get \'em next time.' : stars === 3 ? 'Flawless!' : stars === 2 ? 'Nice work!' : 'Progress is progress!';
    body.innerHTML = '';
    body.append(h('section', { class: 'step result' },
      h('div', { class: 'celebrate' }, h('div', { class: 'bubble' }, say), h('div', { class: 'cel-av', html: avatarSVG(s.avatar, s.equip) })),
      h('h2', {}, lost ? 'Game over' : 'Station cleared!'),
      h('div', { class: 'bigstars', html: starHTML(stars) }),
      h('p', {}, lines), h('p', { class: 'mono' }, `+${run.xp} XP this run. You have ${s.wallet} XP to spend.`),
      h('div', { class: 'row', style: 'justify-content:center' },
        h('button', { class: 'btn', onclick: () => this.play(index) }, 'Replay'),
        index + 1 < this.levels.length ? h('button', { class: 'btn primary', onclick: () => this.play(index + 1) }, 'Next station >') : null,
        h('button', { class: 'btn', onclick: () => this.shop() }, 'Open cases'),
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
