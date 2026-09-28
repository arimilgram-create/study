// Character creator ("Look") and cosmetics locker.
Game.character = function (tab = 'look') {
  const s = this.state, av = s.avatar, app = $('#app'); app.innerHTML = '';
  const preview = h('div', { class: 'char-av' });
  const cap = h('div', { class: 'char-cap' });
  const panel = h('div', { class: 'char-panel' });
  const tabs = { look: h('button', { class: 'btn small', onclick: () => show('look') }, 'Look'), locker: h('button', { class: 'btn small', onclick: () => show('locker') }, 'Locker') };
  app.append(h('div', { class: 'lvl-head' }, h('button', { class: 'btn small', onclick: () => this.map() }, '< Map'), h('h2', {}, 'Your Character'),
    h('button', { class: 'btn small primary', onclick: () => this.shop() }, 'Case Shop')),
    h('div', { class: 'char' }, h('div', { class: 'char-card' }, preview, cap), h('div', { style: 'min-width:0' }, h('div', { class: 'row', style: 'margin-bottom:12px' }, tabs.look, tabs.locker), panel)));

  const refresh = () => {
    saveState(); this.hud();
    preview.innerHTML = avatarSVG(av, s.equip);
    cap.innerHTML = `<b>${esc(av.name)}</b><span>${s.equip.title ? '&ldquo;' + ITEM[s.equip.title].name + '&rdquo;' : rankFor(s.xp)}</span>`;
  };
  const choice = (label, opts, cur, set, swatch) => h('div', { class: 'choice' }, h('span', { class: 'k' }, label),
    h('div', { class: 'row' }, opts.map((o, i) => {
      const val = swatch ? i : o;
      const b = h('button', { class: (swatch ? 'swatch' : 'btn small') + (cur() === val ? ' on' : ''), style: swatch ? `background:${o}` : null, 'aria-label': swatch ? `${label} ${i + 1}` : null },
        swatch ? '' : o);
      b.onclick = () => { set(val); SFX.click(); refresh(); b.parentNode.querySelectorAll('button').forEach(x => x.classList.remove('on')); b.classList.add('on'); };
      return b;
    })));

  function look() {
    const name = h('input', { type: 'text', id: 'charName', maxlength: 16, value: av.name, class: 'name-in', 'aria-label': 'Character name' });
    name.oninput = () => { av.name = name.value.trim() || 'Player 1'; refresh(); };
    panel.append(
      h('div', { class: 'choice' }, h('label', { class: 'k', for: 'charName' }, 'Name'), name),
      choice('Skin', SKINS, () => av.skin, v => av.skin = v, true),
      choice('Hair', HAIRS, () => av.hair, v => av.hair = v),
      choice('Hair color', HAIRC, () => av.hairColor, v => av.hairColor = v, true),
      choice('Eyes', EYES, () => av.eyes, v => av.eyes = v),
      choice('Mouth', MOUTHS, () => av.mouth, v => av.mouth = v),
      choice('Shirt color', SHIRTS, () => av.shirt, v => av.shirt = v, true),
      h('div', { class: 'row' }, h('button', { class: 'btn', onclick: () => {
        Object.assign(av, { skin: Math.floor(Math.random() * SKINS.length), hair: pick(HAIRS), hairColor: Math.floor(Math.random() * HAIRC.length), eyes: pick(EYES), mouth: pick(MOUTHS), shirt: Math.floor(Math.random() * SHIRTS.length) });
        SFX.whoosh(); show('look');
      } }, 'Randomize look')));
  }
  function locker() {
    const owned = ITEMS.filter(i => s.inv[i.id]).length;
    panel.append(h('p', { class: 'ctx', style: 'margin:0' }, `Collection: ${owned} / ${ITEMS.length}. Tap an item you own to equip it. Locked items come from cases.`));
    for (const [slot, label] of Object.entries(SLOTS)) {
      const items = ITEMS.filter(i => i.slot === slot);
      const grid = h('div', { class: 'locker' });
      grid.append(h('button', { class: 'tile none' + (!s.equip[slot] ? ' eq' : ''), onclick: () => { delete s.equip[slot]; SFX.click(); refresh(); show('locker'); } }, h('div', { class: 'ti-icon' }, 'None'), h('span', {}, 'Default')));
      items.forEach(it => {
        const have = s.inv[it.id];
        const t = h('button', { class: 'tile' + (have ? '' : ' locked') + (s.equip[slot] === it.id ? ' eq' : ''), style: `--rc:var(${RARITY[it.r].c})`, title: have ? it.name : `Locked ${RARITY[it.r].name}`, disabled: !have },
          h('div', { class: 'ti-icon', html: have ? itemIcon(it) : '<div class="ti-q">?</div>' }), h('span', {}, have ? it.name : RARITY[it.r].name + ' ???'));
        if (have) t.onclick = () => { s.equip[slot] = it.id; SFX.good(); refresh(); show('locker'); };
        grid.append(t);
      });
      panel.append(h('h3', { class: 'slot-h' }, `${label} (${items.filter(i => s.inv[i.id]).length}/${items.length})`), grid);
    }
  }
  function show(t) {
    panel.innerHTML = ''; Object.entries(tabs).forEach(([k, b]) => b.classList.toggle('on', k === t));
    (t === 'look' ? look : locker)(); refresh();
  }
  show(tab); scrollTo(0, 0);
};
