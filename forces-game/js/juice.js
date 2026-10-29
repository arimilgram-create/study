// Juice: the feel of the game. XP coins fly into the top bar and count up, streak toasts, bursts on right answers,
// shakes on wrong ones, star pop-ins, a rank-up popup, richer sounds, and phone buzzes.

const Juice = (() => {
  const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const buzz = p => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} };
  const center = el => { const r = (el && el.getBoundingClientRect && el.getBoundingClientRect()) || { left: innerWidth / 2, top: innerHeight / 2, width: 0, height: 0 }; return [r.left + r.width / 2, r.top + r.height / 2]; };

  // Sounds: a bright chime that climbs in pitch as your streak grows, plus a coin tick.
  SFX.good = () => { const k = 1 + Math.min(Game.streak || 0, 12) * 0.045; tone([523 * k, 659 * k, 784 * k, 1047 * k], 0.055, 'triangle', 0.07); };
  SFX.coin = () => tone([1319, 1760], 0.04, 'square', 0.025);
  SFX.bad = () => { tone([220, 165], 0.12, 'sawtooth', 0.04); };
  SFX.fanfare = () => tone([523, 659, 784, 1047, 784, 1047, 1319, 1568], 0.085, 'triangle', 0.08);

  // Counts a number up from `from` to `to` inside `el`.
  function countUp(el, from, to, ms = 650) {
    if (!el) return; if (reduce() || from === to) { el.textContent = to; return; }
    const t0 = performance.now();
    const step = t => { const k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3); el.textContent = Math.round(from + (to - from) * e); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  function bump(el) { if (!el) return; el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }

  // Little XP coins fly from where you answered to the XP counter in the top bar.
  function flyCoins(from, toEl, n, onArrive) {
    const [x0, y0] = from, [x1, y1] = center(toEl);
    if (reduce() || !toEl) { onArrive && onArrive(); return; }
    let arrived = 0;
    for (let i = 0; i < n; i++) {
      const c = h('div', { class: 'coin-fly' }); document.body.append(c);
      const mx = (x0 + x1) / 2 + (Math.random() - 0.5) * 220, my = Math.min(y0, y1) - 80 - Math.random() * 120;
      const a = c.animate([
        { transform: `translate(${x0}px,${y0}px) scale(.4)`, opacity: 0 },
        { transform: `translate(${x0 + (Math.random() - 0.5) * 90}px,${y0 - 30 - Math.random() * 50}px) scale(1.15)`, opacity: 1, offset: 0.2 },
        { transform: `translate(${mx}px,${my}px) scale(1)`, opacity: 1, offset: 0.6 },
        { transform: `translate(${x1}px,${y1}px) scale(.5)`, opacity: 0.9 },
      ], { duration: 650 + i * 55, easing: 'cubic-bezier(.4,0,.6,1)' });
      a.onfinish = () => { c.remove(); arrived++; SFX.coin(); bump(toEl.closest('.stat') || toEl); if (arrived === n && onArrive) onArrive(); };
    }
  }

  function toast(text, cls = '') {
    const t = h('div', { class: 'toast ' + cls }, text); document.body.append(t);
    setTimeout(() => t.remove(), 1700);
  }

  return {
    gain(gain, anchor, streak) {
      const xpEl = $('#xp'), to = Game.state.wallet, from = to - gain;
      if (xpEl) xpEl.textContent = from;
      const [x, y] = center(anchor || xpEl);
      FX.burst([css('--green1'), css('--gold1'), '#ffffff'], 26, x, y);
      if (anchor && anchor.classList) { anchor.classList.remove('ring'); void anchor.offsetWidth; anchor.classList.add('ring'); }
      flyCoins([x, y], xpEl, Math.min(8, 3 + Math.floor(gain / 8)), () => countUp(xpEl, from, to));
      buzz(12);
      const milestones = { 3: '3 IN A ROW!', 5: '5 IN A ROW!', 10: '10 STREAK!', 15: 'UNSTOPPABLE!', 20: 'LOCKED IN!', 30: 'LEGENDARY STREAK!' };
      if (milestones[streak]) { toast(milestones[streak], streak >= 10 ? 'hot' : ''); tone([784, 988, 1175, 1568], 0.07, 'triangle', 0.07); }
    },
    miss(was) { if (was >= 5) toast(`Streak of ${was} lost`, 'bad'); },
    wrong(target) { buzz([30, 40, 30]); if (!reduce()) FX.flash(css('--bad') || '#e0263f', 380); },
    // Stars pop in one at a time on the results screen.
    stars(el, n) {
      if (reduce()) return;
      el.innerHTML = [0, 1, 2].map(i => `<span class="st${i < n ? '' : ' off'}" style="animation-delay:${0.25 + i * 0.32}s">&#9733;</span>`).join('');
      for (let i = 0; i < n; i++) setTimeout(() => { tone([660 + i * 220, 880 + i * 220], 0.08, 'triangle', 0.07); const [x, y] = center(el.children[i]); FX.burst([css('--gold1'), '#ffffff'], 30, x, y); }, 250 + i * 320 + 200);
    },
    rankUp(rank) {
      SFX.fanfare(); buzz([20, 40, 20, 40, 60]);
      setTimeout(() => FX.burst([css('--gold1'), css('--blue1'), css('--green1'), '#ffffff'], 220), 120);
      const box = h('div', { class: 'modal-bg' }, h('div', { class: 'modal rankup' },
        h('div', { class: 'ru-badge', html: avatarHTML(Game.state.avatar, Game.state.equip, 'head') }),
        h('h2', {}, 'RANK UP!'), h('p', { class: 'ru-name' }, rank),
        h('p', {}, 'Rank comes from the XP you earn studying. Keep locking in.'),
        h('button', { class: 'btn primary', onclick: () => box.remove() }, 'Let\'s go!')));
      document.body.append(box);
    },
    // Once: tell players their old 2D items were traded in for chips.
    boot() {
      const v = Game.state.v3d;
      if (!v || v.seen) return;
      const box = h('div', { class: 'modal-bg' }, h('div', { class: 'modal' },
        h('h2', {}, 'Everything is 3D now!'),
        h('p', {}, `Your character, clothes, and cases got rebuilt in 3D. Your ${v.count} old item${v.count === 1 ? '' : 's'} didn't fit the new body, so they were traded in for `, h('b', {}, `${v.chips} chips`), '.'),
        h('p', {}, 'Spend them on cases (pay with chips) to get new 3D items.'),
        h('div', { class: 'row', style: 'justify-content:center' },
          h('button', { class: 'btn primary', onclick: () => { box.remove(); Game.shop(); } }, 'Open cases'),
          h('button', { class: 'btn', onclick: () => box.remove() }, 'Nice'))));
      v.seen = true; saveState(); document.body.append(box); SFX.win();
    },
    toast, countUp, bump, flyCoins,
  };
})();
