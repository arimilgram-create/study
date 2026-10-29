// The locker: a Roblox-style avatar editor. A live 3D preview on the left, categories and your items on the right.

const PANTS_C = ['#2b3442', '#1b1d22', '#2f5d9e', '#556b2f', '#8b5a2b', '#c9b27a', '#e0263f', '#f4f6f8'];
function lookCode(av) {
  const data = { n: av.name, skin: av.skin, hair: av.hair, hc: av.hairColor, eyes: av.eyes, mouth: av.mouth, shirt: av.shirt, p: av.pants };
  return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}
function readLookCode(code) {
  const d = JSON.parse(decodeURIComponent(escape(atob(code.trim()))));
  const out = { name: String(d.n || 'Player 1').slice(0, 16), skin: d.skin, hair: d.hair, hairColor: d.hc, eyes: d.eyes, mouth: d.mouth, shirt: d.shirt, pants: d.p || PANTS_C[0] };
  if (typeof out.skin !== 'number' || !SKINS[out.skin] || !HAIRS.includes(out.hair) || !HAIRC[out.hairColor] || !EYES.includes(out.eyes) || !MOUTHS.includes(out.mouth) || !SHIRTS[out.shirt] || !PANTS_C.includes(out.pants)) throw new Error('bad look');
  return out;
}

const AE_ICON = {
  recent: '<path d="M12 4a8 8 0 1 0 8 8M12 8v4l3 2M20 4v4h-4"/>',
  clothing: '<path d="M8 3 4 6l2 4 2-1v11h8V9l2 1 2-4-4-3c-1 2-2.4 3-4 3S9 5 8 3Z"/>',
  acc: '<path d="M3 15c3-1 15-1 18 0M6 15c0-5 2.7-8 6-8s6 3 6 8"/>',
  gear: '<path d="m14 4 6 0 0 6-9 9-3 1 1-3 9-9M5 16l3 3M4 20l2-2"/>',
  pets: '<circle cx="7" cy="9" r="2"/><circle cx="17" cy="9" r="2"/><circle cx="10" cy="5" r="2"/><circle cx="14" cy="5" r="2"/><path d="M12 11c-3 0-5 3-5 6 0 2 2 3 5 3s5-1 5-3c0-3-2-6-5-6Z"/>',
  fx: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  body: '<circle cx="12" cy="6" r="3"/><path d="M6 21v-6a6 6 0 0 1 12 0v6"/>',
};
const AE_CATS = [
  { id: 'recent', label: 'Recent' },
  { id: 'clothing', label: 'Clothing', subs: [['shirt', 'Shirts'], ['pants', 'Pants']] },
  { id: 'acc', label: 'Accessories', subs: [['hat', 'Hats'], ['face', 'Face'], ['back', 'Back']] },
  { id: 'gear', label: 'Gear', subs: [['gear', 'Gear']] },
  { id: 'pets', label: 'Pets', subs: [['pet', 'Pets']] },
  { id: 'fx', label: 'Effects', subs: [['aura', 'Auras'], ['title', 'Titles'], ['confetti', 'Confetti'], ['arrow', 'Arrow skins']] },
  { id: 'body', label: 'Body' },
];
const RANK_OF = r => RARITY_LIST.indexOf(r);

Game.character = function (cat = 'clothing', sub) {
  if (cat === 'locker' || cat === 'look') cat = cat === 'look' ? 'body' : 'clothing';
  const s = this.state, av = s.avatar, app = $('#app'); app.innerHTML = '';
  s.equip.shiny = s.equip.shiny || {};
  const ui = this.aeUI = this.aeUI || { showLocked: false, sort: 'rarity', q: '' };
  const C = AE_CATS.find(c => c.id === cat) || AE_CATS[1];
  sub = sub || (C.subs ? C.subs[0][0] : null);

  // ---------- left: the stage ----------
  const stageBox = h('div', { class: 'ae-view' });
  const nameCap = h('div', { class: 'ae-cap' });
  const wearing = h('div', { class: 'ae-wearing' });
  const detail = h('div', { class: 'ae-detail' });
  let view = null;
  const focusHead = ['hat', 'face'].includes(sub) || cat === 'body';
  const left = h('div', { class: 'ae-stage' },
    h('div', { class: 'ae-viewwrap' }, stageBox,
      h('div', { class: 'ae-ctl' },
        h('button', { class: 'ae-round', 'aria-label': 'Spin left', onclick: () => view && (view.spinV = -40) }, '⟲'),
        h('button', { class: 'ae-round', 'aria-label': 'Zoom', onclick: () => { zoomed = !zoomed; aim(); } }, '⌕'),
        h('button', { class: 'ae-round', 'aria-label': 'Spin right', onclick: () => view && (view.spinV = 40) }, '⟳'))),
    nameCap, wearing, detail);
  let zoomed = focusHead;
  const aim = () => {
    if (!view) return; const c = view.camera, from = c.position.clone(), to = zoomed ? K3.V(0, 5.1, 7.6) : K3.V(0, 3.2, 13), tf = view.target.clone(), tt = zoomed ? K3.V(0, 4.75, 0) : K3.V(0, 2.7, 0);
    K3.tween(view, 0.45, k => { c.position.lerpVectors(from, to, k); view.target.lerpVectors(tf, tt, k); c.lookAt(view.target); });
  };

  // ---------- right: categories, filters, grid ----------
  const panel = h('div', { class: 'ae-panel' });
  const cats = h('div', { class: 'ae-cats', role: 'tablist' }, AE_CATS.map(c => h('button', { class: 'ae-cat' + (c.id === C.id ? ' on' : ''), role: 'tab', 'aria-selected': c.id === C.id, onclick: () => { SFX.click(); this.character(c.id); } },
    h('span', { class: 'ae-ico', html: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${AE_ICON[c.id]}</svg>` }), h('span', {}, c.label))));
  panel.append(cats);

  app.append(h('div', { class: 'lvl-head' }, h('button', { class: 'btn small', onclick: () => this.map() }, '< Map'), h('h2', {}, 'Avatar'),
    h('button', { class: 'btn small primary', onclick: () => this.shop() }, 'Case Shop'), h('button', { class: 'btn small', onclick: () => this.hangout && this.hangout() }, 'Hangout')),
    h('div', { class: 'ae' }, left, panel));

  const refreshStage = (bounce) => {
    saveState(); this.hud();
    nameCap.innerHTML = `<b>${esc(av.name)}</b><span>${s.equip.title && ITEM[s.equip.title] ? '&ldquo;' + ITEM[s.equip.title].name + '&rdquo;' : rankFor(s.xp)}</span>`;
    wearing.innerHTML = '';
    const worn = Object.keys(SLOTS).filter(k => s.equip[k] && ITEM[s.equip[k]]);
    wearing.append(h('span', { class: 'k' }, worn.length ? 'Wearing' : 'Wearing nothing yet'));
    worn.forEach(k => { const it = ITEM[s.equip[k]]; wearing.append(h('button', { class: 'ae-chip', style: `--rc:var(${RARITY[it.r].c})`, title: 'Take off', onclick: () => { unequip(k); } }, h('span', { class: 'ae-chip-ic', html: itemIcon(it) }), h('span', {}, it.name), h('b', {}, '×'))); });
    if (view) { view.setLook(av, s.equip); if (bounce) { const a = view.avatar(); K3.tween(view, 0.5, k => a.scale.setScalar(1 + Math.sin(k * Math.PI) * 0.08), K3.ease.out); view.burst(K3.V(0, 3, 0.5), ['#ffe066', '#ffffff', '#6cc0ff'], 40, { speed: 4, up: 3, life: 0.9, size: 0.3 }); } }
    else stageBox.innerHTML = avatarHTML(av, s.equip);
  };
  const unequip = slot => { delete s.equip[slot]; s.equip.shiny[slot] = false; SFX.click(); refreshStage(true); drawGrid(); };
  const wear = (it, shiny) => { equipItem(it, shiny); SFX.good(); refreshStage(true); drawGrid(); showDetail(it); };

  function showDetail(it) {
    detail.innerHTML = ''; if (!it) return;
    const n = s.inv[it.id] || 0, ns = s.shinyInv[it.id] || 0, worn = s.equip[it.slot] === it.id;
    detail.style.setProperty('--rc', `var(${RARITY[it.r].c})`);
    detail.append(h('div', { class: 'ae-dicon', html: itemIcon(it) }),
      h('div', { class: 'ae-dinfo' },
        h('span', { class: 'rarity' }, `${RARITY[it.r].name} ${(SLOTS[it.slot] || '').replace(/s$/, '')}`), h('b', {}, it.name), h('p', { html: it.d || '' }),
        h('p', { class: 'perk' }, perkText(it, worn && s.equip.shiny[it.slot])),
        n ? h('div', { class: 'row' },
          h('button', { class: 'btn small primary', onclick: () => worn ? unequip(it.slot) : wear(it, false) }, worn ? 'Take off' : 'Wear'),
          ns ? h('button', { class: 'btn small', onclick: () => wear(it, true) }, 'Wear shiny ✦') : null,
          h('button', { class: 'btn small', onclick: e => { const g = tradeIn(it.id, ns && n === ns); if (g) { xpPop(`+${g} chips`, e.currentTarget, 'chip'); SFX.good(); refreshStage(); drawGrid(); showDetail(it); } } }, `Sell one (+${chipValue(it, ns && n === ns)})`)) : h('p', { class: 'hint' }, 'Locked. Win it from a case.')));
  }

  // ---------- body editor ----------
  function bodyPanel() {
    const box = h('div', { class: 'ae-body' });
    const choice = (label, opts, cur, set, swatch) => h('div', { class: 'choice' }, h('span', { class: 'k' }, label),
      h('div', { class: 'row' }, opts.map((o, i) => {
        const val = swatch === 'idx' ? i : o;
        const b = h('button', { class: (swatch ? 'swatch' : 'btn small') + (cur() === val ? ' on' : ''), style: swatch ? `background:${o}` : null, 'aria-label': swatch ? `${label} ${i + 1}` : null }, swatch ? '' : o);
        b.onclick = () => { set(val); SFX.click(); b.parentNode.querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on'); refreshStage(true); };
        return b;
      })));
    const name = h('input', { type: 'text', maxlength: 16, value: av.name, class: 'name-in', 'aria-label': 'Character name' });
    name.oninput = () => { av.name = name.value.trim() || 'Player 1'; refreshStage(); };
    const codeOut = h('input', { type: 'text', readonly: true, value: lookCode(av), class: 'code-in', 'aria-label': 'Look code' });
    const codeIn = h('input', { type: 'text', placeholder: 'Paste a look code', class: 'code-in', 'aria-label': 'Paste look code' });
    const msg = h('span', { class: 'hint' });
    box.append(
      h('div', { class: 'choice' }, h('span', { class: 'k' }, 'Name'), name),
      choice('Skin tone', SKINS, () => av.skin, v => av.skin = v, 'idx'),
      choice('Hair', HAIRS, () => av.hair, v => av.hair = v),
      choice('Hair color', HAIRC, () => av.hairColor, v => av.hairColor = v, 'idx'),
      choice('Eyes', EYES, () => av.eyes, v => av.eyes = v),
      choice('Mouth', MOUTHS, () => av.mouth, v => av.mouth = v),
      choice('Default shirt color', SHIRTS, () => av.shirt, v => av.shirt = v, 'idx'),
      choice('Default pants color', PANTS_C, () => av.pants || PANTS_C[0], v => av.pants = v, 'hex'),
      h('div', { class: 'row' },
        h('button', { class: 'btn', onclick: () => { Object.assign(av, { skin: Math.floor(Math.random() * SKINS.length), hair: pick(HAIRS), hairColor: Math.floor(Math.random() * HAIRC.length), eyes: pick(EYES), mouth: pick(MOUTHS), shirt: Math.floor(Math.random() * SHIRTS.length), pants: pick(PANTS_C) }); SFX.whoosh(); this.character('body'); } }, 'Randomize'),
        h('button', { class: 'btn', onclick: () => { Object.assign(av, DEFAULT_AVATAR, { name: av.name, pants: PANTS_C[0] }); SFX.click(); this.character('body'); } }, 'Reset')),
      h('div', { class: 'choice share' }, h('span', { class: 'k' }, 'Share your look'),
        h('div', { class: 'row' }, codeOut, h('button', { class: 'btn small', onclick: () => { navigator.clipboard?.writeText(codeOut.value).then(() => { msg.textContent = 'Copied.'; }).catch(() => { codeOut.select(); msg.textContent = 'Select and copy it.'; }); } }, 'Copy')),
        h('div', { class: 'row' }, codeIn, h('button', { class: 'btn small', onclick: () => { try { Object.assign(av, readLookCode(codeIn.value)); SFX.win(); this.character('body'); } catch (e) { msg.textContent = 'That code doesn\'t look right.'; SFX.bad(); } } }, 'Use this look')), msg));
    return box;
  }

  // ---------- item grid ----------
  const gridWrap = h('div', { class: 'ae-gridwrap' });
  function drawGrid() {
    gridWrap.innerHTML = '';
    let list;
    if (C.id === 'recent') list = (s.recentIds || []).map(id => ITEM[id]).filter(Boolean).filter((it, i, a) => a.indexOf(it) === i).slice(0, 30);
    else list = ITEMS.filter(i => i.slot === sub);
    const owned = list.filter(i => s.inv[i.id]);
    const q = ui.q.trim().toLowerCase();
    let show = (ui.showLocked || C.id === 'recent' ? list : owned).filter(i => !q || i.name.toLowerCase().includes(q));
    if (C.id !== 'recent') show = show.slice().sort((a, b) => (ui.sort === 'name' ? a.name.localeCompare(b.name) : (RANK_OF(b.r) - RANK_OF(a.r)) || a.name.localeCompare(b.name)) + ((s.inv[b.id] ? 1 : 0) - (s.inv[a.id] ? 1 : 0)) * 100);
    gridWrap.append(h('div', { class: 'ae-count mono' }, C.id === 'recent' ? `Your ${show.length} newest pulls` : `${owned.length} of ${list.length} owned`));
    if (!show.length) {
      gridWrap.append(h('div', { class: 'ae-empty' }, h('b', {}, C.id === 'recent' ? 'No pulls yet.' : `No ${(C.subs.find(x => x[0] === sub) || [0, 'items'])[1].toLowerCase()} yet.`),
        h('p', {}, 'Open cases to fill your locker. Every case can drop clothes, accessories, gear, pets, and effects.'),
        h('div', { class: 'row', style: 'justify-content:center' }, h('button', { class: 'btn primary', onclick: () => this.shop() }, 'Open cases'), list.length && !ui.showLocked ? h('button', { class: 'btn', onclick: () => { ui.showLocked = true; drawGrid(); } }, 'Show what you could get') : null)));
      return;
    }
    const grid = h('div', { class: 'ae-grid' });
    show.forEach(it => {
      const have = s.inv[it.id] || 0, ns = s.shinyInv[it.id] || 0, worn = s.equip[it.slot] === it.id;
      const t = h('button', { class: 'ae-tile' + (have ? '' : ' locked') + (worn ? ' worn' : '') + (worn && s.equip.shiny[it.slot] ? ' shiny' : ''), style: `--rc:var(${RARITY[it.r].c})`, title: have ? perkText(it, false) : `Locked ${RARITY[it.r].name}` },
        h('div', { class: 'ae-img', html: itemIcon(it) }),
        h('span', { class: 'ae-name' }, it.name),
        worn ? h('i', { class: 'ae-check', 'aria-label': 'Wearing' }, '✓') : null,
        have > 1 ? h('i', { class: 'ae-n' }, 'x' + have) : null,
        ns ? h('i', { class: 'ae-sh', title: 'You have a shiny one' }, '✦') : null,
        have ? null : h('i', { class: 'ae-lock', html: '<svg viewBox="0 0 24 24" width="20" height="20"><rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor"/><path d="M8 11V8a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>' }));
      t.onclick = () => { if (!have) { showDetail(it); SFX.bad(); return; } worn ? unequip(it.slot) : wear(it, false); showDetail(it); };
      grid.append(t);
    });
    gridWrap.append(grid);
  }

  if (C.id === 'body') panel.append(bodyPanel());
  else {
    if (C.subs) panel.append(h('div', { class: 'ae-subs' }, C.subs.map(([k, label]) => h('button', { class: 'ae-sub' + (k === sub ? ' on' : ''), onclick: () => { SFX.click(); this.character(C.id, k); } }, `${label} (${ITEMS.filter(i => i.slot === k && s.inv[i.id]).length})`))));
    const search = h('input', { type: 'search', class: 'code-in ae-search', placeholder: 'Search', value: ui.q, 'aria-label': 'Search items' });
    search.oninput = () => { ui.q = search.value; drawGrid(); };
    const sort = h('select', { class: 'sel', 'aria-label': 'Sort' }, h('option', { value: 'rarity' }, 'Rarest first'), h('option', { value: 'name' }, 'A to Z')); sort.value = ui.sort;
    sort.onchange = () => { ui.sort = sort.value; drawGrid(); };
    const locked = h('label', { class: 'ae-toggle' }, h('input', { type: 'checkbox', checked: ui.showLocked || null, onchange: e => { ui.showLocked = e.target.checked; drawGrid(); } }), h('span', {}, 'Show locked'));
    if (C.id !== 'recent') panel.append(h('div', { class: 'ae-tools' }, search, sort, locked));
    panel.append(gridWrap); drawGrid();
  }

  requestAnimationFrame(() => {
    view = liveAvatar(stageBox, av, s.equip, { h: Math.min(480, Math.max(300, innerHeight * 0.55)), auto: 0.25 });
    if (view && zoomed) { view.camera.position.set(0, 5.1, 7.6); view.target.set(0, 4.75, 0); view.camera.lookAt(view.target); }
    refreshStage();
  });
  scrollTo(0, 0);
};
