// Loot: cases, drops, the pity guarantee, item perks, trade-in values, and the effects shared by the case shop and casino.

const RARITY_LIST = ['common', 'rare', 'epic', 'legendary', 'mythic'];
const HIGH = ['epic', 'legendary', 'mythic'];
const CHIP_VALUE = { common: 10, rare: 30, epic: 80, legendary: 250, mythic: 800 };
const CHIP_TO_XP = 1;          // 1 chip converts to 1 spendable XP
const PITY_AT = 15;            // an epic or better is guaranteed after this many cases without one
const chipValue = (it, shiny) => CHIP_VALUE[it.r] * (shiny ? 4 : 1);

// ---------- cases ----------
const CASES = [
  { id: 'rest', name: 'Rest Case', price: 150, chips: 60, c: '--f-n', shiny: 1 / 14, bonus: 0.12,
    blurb: 'The starter case. Mostly commons, with a small shot at something shiny.',
    odds: { common: 70, rare: 22, epic: 6.5, legendary: 1.3, mythic: 0.2 } },
  { id: 'velocity', name: 'Velocity Case', price: 250, chips: 130, c: '--f-lift', shiny: 1 / 8, bonus: 0.14, isNew: true,
    pool: it => it.set === 'v',
    blurb: 'Only items from the Constant Velocity unit: Tom the Cat, Jayla\'s boat, the Space Shuttle, and more.',
    odds: { common: 50, rare: 30, epic: 14, legendary: 5, mythic: 1 } },
  { id: 'momentum', name: 'Momentum Case', price: 300, chips: 120, c: '--f-a', shiny: 1 / 12, bonus: 0.14,
    blurb: 'Better odds at epics and legendaries.',
    odds: { common: 45, rare: 33, epic: 16, legendary: 5, mythic: 1 } },
  { id: 'newton', name: 'Newton Case', price: 600, chips: 320, c: '--pen', shiny: 1 / 10, bonus: 0.16,
    blurb: 'No commons at all. Real odds at mythics.',
    odds: { rare: 45, epic: 35, legendary: 16, mythic: 4 } },
];

function rollRarity(odds) {
  const keys = Object.keys(odds), total = keys.reduce((a, k) => a + odds[k], 0);
  let r = Math.random() * total;
  for (const k of keys) if ((r -= odds[k]) < 0) return k;
  return keys[keys.length - 1];
}
const onlyHigh = odds => Object.fromEntries(Object.entries(odds).filter(([k]) => HIGH.includes(k)));
const poolOf = c => ITEMS.filter(i => !c.pool || c.pool(i));

// One case: an item, and sometimes a bonus bag of chips. The pity guarantee forces an epic or better.
function rollCase(c) {
  const s = Game.state, forced = (s.pity || 0) >= PITY_AT;
  const hi = onlyHigh(c.odds);
  const r = forced && Object.keys(hi).length ? rollRarity(hi) : rollRarity(c.odds);
  const pool = poolOf(c).filter(i => i.r === r);
  const it = pick(pool.length ? pool : ITEMS.filter(i => i.r === r));
  const shiny = Math.random() < c.shiny;
  const drops = [{ kind: 'item', it, shiny }];
  if (Math.random() < c.bonus) drops.push({ kind: 'chips', amount: Math.max(5, Math.round(c.chips * (0.4 + Math.random() * 0.6) * chipBonusMult())) });
  return drops;
}

// Average chips a case gives back in trade-ins and bonus bags (used to check the economy).
function caseChipEV(c) {
  const itemEV = RARITY_LIST.reduce((a, r) => a + (c.odds[r] || 0) / Object.values(c.odds).reduce((x, y) => x + y, 0) * CHIP_VALUE[r] * (1 + c.shiny * 3), 0);
  return itemEV + c.bonus * c.chips * 0.7;
}

function pushHist(d, c) {
  const s = Game.state; s.hist = s.hist || [];
  s.hist.unshift({ kind: d.kind, name: d.kind === 'item' ? d.it.name : `${d.amount} chips`, r: d.kind === 'item' ? d.it.r : 'common', shiny: !!d.shiny, c: c.id });
  s.hist.length = Math.min(s.hist.length, 14);
}

// ---------- perks: items you wear give small passive bonuses ----------
const PERK_BY_RARITY = { common: 0.02, rare: 0.04, epic: 0.06, legendary: 0.10, mythic: 0.15 };
const PERK_TYPE = { hat: 'xp', title: 'xp', outfit: 'chips', pet: 'chips' };
const PERK_CAP = 0.4;
function perkOf(it, shiny) { const type = PERK_TYPE[it.slot]; return type ? { type, amount: PERK_BY_RARITY[it.r] * (shiny ? 2 : 1) } : null; }
function perkTotal(type) {
  const s = Game.state; let t = 0;
  for (const slot of Object.keys(PERK_TYPE)) {
    const id = s.equip[slot]; if (!id || !ITEM[id]) continue;
    const p = perkOf(ITEM[id], !!(s.equip.shiny || {})[slot]);
    if (p && p.type === type) t += p.amount;
  }
  return Math.min(PERK_CAP, t);
}
const xpMult = () => 1 + perkTotal('xp');        // studying XP
const chipBonusMult = () => 1 + perkTotal('chips'); // bonus bags and trade-ins only (never casino bets)
function perkText(it, shiny) {
  const p = perkOf(it, shiny); if (!p) return 'Cosmetic only. No perk.';
  return `Perk while equipped: +${Math.round(p.amount * 100)}% ${p.type === 'xp' ? 'XP from studying' : 'chips from bonus bags and trade-ins'}.`;
}

// ---------- effects ----------
const FX = {
  burst(cols, n, x = innerWidth / 2, y = innerHeight * 0.32) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cv = $('#confetti'), W = innerWidth, H = innerHeight, ctx = hiDPI(cv, W, H);
    const ps = Array.from({ length: n }, () => ({ x: x + (Math.random() - 0.5) * 180, y, vx: (Math.random() - 0.5) * 900, vy: -Math.random() * 800 - 200, r: Math.random() * 6, c: pick(cols), s: 5 + Math.random() * 7 }));
    let t = 0;
    (function f() {
      t += 1 / 60; ctx.clearRect(0, 0, W, H);
      for (const p of ps) { p.vy += 900 / 60; p.x += p.vx / 60; p.y += p.vy / 60; p.r += 0.15; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore(); }
      if (t < 2.6) requestAnimationFrame(f); else ctx.clearRect(0, 0, W, H);
    })();
  },
  flash(color, ms = 900) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const f = h('div', { class: 'flash', style: `--rc:${color}` }); document.body.append(f); setTimeout(() => f.remove(), ms);
  },
  shake(el, power = 1) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    el.style.setProperty('--qp', power); el.classList.remove('quake'); void el.offsetWidth; el.classList.add('quake');
  },
  rays(parent, color) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = h('div', { class: 'rays', style: `--rc:${color}` }); parent.append(r); setTimeout(() => r.remove(), 2400);
  },
  banner(text, color) {
    const b = h('div', { class: 'banner', style: `--rc:${color}` }, text); document.body.append(b); setTimeout(() => b.remove(), 1900);
  },
};
const REVEAL_SFX = {
  common: () => SFX.good(),
  rare: () => tone([660, 880], 0.08),
  epic: () => tone([523, 659, 784], 0.09),
  legendary: () => tone([523, 659, 784, 1047, 1319], 0.1),
  mythic: () => tone([523, 659, 784, 1047, 784, 1047, 1319, 1568, 2093], 0.08),
};
// The reveal: the stronger the drop, the bigger the show.
function revealFX(d, stage) {
  const r = d.it.r, col = `var(${RARITY[r].c})`;
  REVEAL_SFX[r](); if (d.shiny) tone([1319, 1760], 0.07);
  const cols = { common: [css('--r-common')], rare: [css('--r-rare'), css('--f-n')], epic: [css('--r-epic'), css('--pen')], legendary: [css('--r-leg'), '#fff3bf'], mythic: ['#ff6b6b', '#ffd43b', '#69db7c', '#4dabf7', '#da77f2'] }[r];
  if (r === 'rare') { FX.flash(col, 700); FX.burst(cols, 70); }
  if (r === 'epic') { FX.rays(stage, col); FX.flash(col, 800); FX.burst(cols, 150); FX.banner('EPIC!', col); }
  if (r === 'legendary') { FX.shake(stage, 1.2); FX.flash(col, 1000); FX.rays(stage, col); FX.burst(cols, 260); FX.banner('LEGENDARY!', col); }
  if (r === 'mythic') { FX.shake(stage, 2); FX.flash('var(--r-myth)', 1200); FX.rays(stage, 'var(--r-leg)'); FX.burst(cols, 420); FX.banner('MYTHIC!!', 'var(--r-myth)'); }
  if (d.shiny) { FX.burst([css('--r-leg'), '#fff3bf'], 110); FX.banner('SHINY', 'var(--r-leg)'); }
}
