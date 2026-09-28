// Final Boss: 10 random rapid-fire questions, 3 hearts, 25 s each.
const eqs = (...lines) => lines.map(l => `<span class="eq">${l}</span>`).join('');
const BOSS_GENS = [
  () => { const m = pick([3, 4.5, 7, 12, 55, 0.5]); return { num: { q: `A ${m} kg object sits on Earth. What is its weight?`, ans: -10 * m, unit: 'N', explain: eqs('F<sub>g</sub> = m &middot; g', `F<sub>g</sub> = ${m} kg &middot; (-10 N/kg)`, `F<sub>g</sub> = ${-10 * m} N`) } }; },
  () => { const w = pick([30, 250, 600, 45, 1200]); return { num: { q: `A dog weighs ${-w} N on Earth. What is its mass?`, ans: w / 10, unit: 'kg', signMsg: 'Mass can\'t be negative. It\'s a scalar with no direction!', explain: eqs('F<sub>g</sub> = m &middot; g', `${-w} N = m &middot; (-10 N/kg)`, `m = ${w / 10} kg`) } }; },
  () => { const A = pick([60, 80, 120, 150, 200]), f = pick([20, 40, 50, A]); return { num: { q: `A sled is pulled right with F<sub>A</sub> = ${A} N while friction is F<sub>f</sub> = ${-f} N. Net force?`, ans: A - f, unit: 'N', explain: eqs('F<sub>net</sub> = F<sub>A</sub> + F<sub>f</sub>', `F<sub>net</sub> = ${A} N + (${-f} N)`, `F<sub>net</sub> = ${A - f} N`) } }; },
  () => { const up = pick([150, 200, 260]); return { num: { q: `A 20 kg crate is lifted with ${up} N of force. What is the net force on it?`, ans: up - 200, unit: 'N', explain: eqs('F<sub>g</sub> = 20 kg &middot; (-10 N/kg) = -200 N', `F<sub>net</sub> = ${up} N + (-200 N) = ${up - 200} N`) } }; },
  () => {
    const c = pick([['30 N push right, 30 N friction left', 'Constant velocity'], ['50 N push right, 20 N friction left', 'Speeding up'], ['no push, 20 N friction left', 'Slowing down']]);
    return { mcq: { q: `A box is sliding to the right. Forces: ${c[0]}. What is it doing?`, keepOrder: true, opts: ['Speeding up', 'Slowing down', 'Constant velocity'].map(t => ({ t, ok: t === c[1], why: 'Compare the forces: balanced means constant velocity; net force with the motion speeds it up; against the motion slows it down.' })), explain: `Answer: ${c[1]}.` } };
  },
  () => ({ mcq: { q: 'Mass is a ___ measured in ___.', opts: [{ t: 'scalar, kilograms', ok: true }, { t: 'vector, Newtons', why: 'That\'s weight.' }, { t: 'scalar, Newtons', why: 'Newtons measure force.' }, { t: 'vector, kilograms', why: 'Mass has no direction.' }], explain: 'Mass: scalar, kg. Weight: vector, N.' } }),
  () => ({ mcq: { q: 'A hockey puck slides on frictionless ice at 5 m/s. What force keeps it moving at 5 m/s?', opts: [{ t: 'None. No net force is needed for constant velocity.', ok: true }, { t: 'A 5 N forward force', why: 'Forces change velocity; they aren\'t needed to keep it.' }, { t: 'The leftover force from the stick', why: 'The stick\'s force ended when it stopped touching the puck.' }, { t: 'Its inertia force', why: 'Inertia isn\'t a force.' }], explain: 'First Law: constant velocity with zero net force.' } }),
  () => ({ mcq: { q: 'Which has the most inertia?', opts: [{ t: 'A 1500 kg car parked in a lot', ok: true }, { t: 'A 10 kg bike going 30 mph', why: 'Inertia depends on mass, not speed.' }, { t: 'A 0.5 kg ball flying fast', why: 'Inertia depends on mass, not speed.' }, { t: 'They\'re all equal', why: 'More mass = more inertia.' }], explain: 'Inertia depends only on mass.' } }),
  () => ({ mcq: { q: 'You stand on a scale in an elevator moving up at constant velocity. Compared to standing still, the scale reads...', opts: [{ t: 'The same', ok: true }, { t: 'More', why: 'Only while speeding up upward. Constant velocity is balanced.' }, { t: 'Less', why: 'Only while slowing down (or speeding up downward).' }, { t: 'Zero', why: 'That\'s free fall!' }], explain: 'Just like the bananas: constant velocity = same reading as at rest.' } }),
  () => ({ mcq: { q: 'A space probe far from any planet shuts off its engines. What happens?', opts: [{ t: 'It keeps moving at constant velocity', ok: true }, { t: 'It slowly coasts to a stop', why: 'No friction or air out there. Nothing to stop it.' }, { t: 'It stops right away', why: 'Stopping would need a force.' }, { t: 'It starts falling', why: 'Falling needs gravity, and it\'s far from any planet.' }], explain: 'No force, no change in velocity.' } }),
  () => ({ mcq: { q: 'A book rests on a table. Which FBD is correct?', opts: [{ t: 'F<sub>N</sub> up and F<sub>g</sub> down, equal size', ok: true }, { t: 'Only F<sub>g</sub> down', why: 'Then it would fall through the table.' }, { t: 'F<sub>N</sub> bigger than F<sub>g</sub>', why: 'Then it would start rising off the table.' }, { t: 'F<sub>g</sub> down and friction up', why: 'Friction acts along a surface, not up from it.' }], explain: 'At rest: balanced, so F<sub>N</sub> = |F<sub>g</sub>|.' } }),
  () => ({ mcq: { q: 'What does the slope of a weight vs. mass graph tell you?', opts: [{ t: 'The gravitational field strength g', ok: true }, { t: 'The object\'s inertia', why: 'Inertia is mass, which is on the x-axis.' }, { t: 'The net force', why: 'It\'s weight per kilogram: N/kg.' }, { t: 'The object\'s speed', why: 'Nothing about motion on this graph.' }], explain: 'slope = weight / mass = g (N/kg).' } }),
  () => ({ mcq: { q: 'A kicked soccer ball rolls across the grass and slows down. Why?', opts: [{ t: 'Friction acts opposite its motion, an unbalanced force', ok: true }, { t: 'The kick force runs out', why: 'The kick force only acted during contact.' }, { t: 'Its inertia wears off', why: 'Inertia never wears off. It depends on mass.' }, { t: 'Objects naturally stop', why: 'Only when a force stops them.' }], explain: 'Slowing down = changing velocity = unbalanced force.' } }),
  () => ({ mcq: { q: 'A car drives around a curve at a constant 30 mph. Is the net force zero?', opts: [{ t: 'No. Its direction is changing, so its velocity is changing.', ok: true }, { t: 'Yes. Its speed is constant.', why: 'Constant velocity needs constant speed AND a straight-line direction.' }, { t: 'Yes. Cars always have balanced forces.', why: 'Turning is a change in velocity, which needs an unbalanced force (friction toward the center).' }, { t: 'Only if it has seatbelts', why: 'Seatbelts act on passengers, not the whole car.' }], explain: 'Like the Moon and the speed skater: curving needs a force.' } }),
  () => ({ num: { q: 'Terry lifts a 23.5 kg box upward at constant velocity. What is Terry\'s applied force?', ans: 235, unit: 'N', signMsg: 'Right size! Terry lifts up, so it\'s positive.', explain: eqs('0 N = F<sub>A</sub> + (-235 N)', 'F<sub>A</sub> = 235 N') } }),
];

let bossDeck = [];
function bossStep(k) {
  return (el, api) => {
    if (k === 0) bossDeck = shuffle(BOSS_GENS).slice(0, 10).map(g => g());
    const Q = bossDeck[k], LIMIT = 25; let T = LIMIT, over = false;
    const hearts = h('span', { class: 'hearts', 'aria-label': 'hearts left' });
    const bar = h('div', { class: 'timer' }, h('i'));
    const paint = () => hearts.innerHTML = '&#9829;'.repeat(api.run.hearts) + `<span style="opacity:.2">${'&#9829;'.repeat(3 - api.run.hearts)}</span>`;
    el.append(h('div', { class: 'row', style: 'justify-content:space-between' }, h('span', { class: 'mono' }, `Question ${k + 1} of 10`), hearts), bar);
    paint();
    const wrapped = {
      ...api,
      right: (xp, a) => api.right(xp + Math.round(T / 2), a),
      wrong: t => { api.wrong(t); api.run.hearts = Math.max(0, api.run.hearts - 1); paint(); },
      done: note => {
        over = true;
        if (api.run.hearts > 0) return api.done(note);
        if (note) el.append(h('div', { class: 'pen', html: note }));
        el.append(h('div', { class: 'next-row' }, h('button', { class: 'btn primary', onclick: () => api.end() }, 'See results')));
      },
    };
    const cfg = { ...(Q.mcq || Q.num), oneShot: true, xp: 12 };
    Q.mcq ? MCQ(el, wrapped, cfg) : NUM(el, wrapped, cfg);
    loop(el, dt => {
      if (over) return false;
      T -= dt; bar.firstChild.style.width = Math.max(0, T / LIMIT * 100) + '%';
      if (T <= 0) {
        over = true; el.querySelectorAll('button, input').forEach(b => b.disabled = true);
        wrapped.wrong(el);
        wrapped.done(`Time's up! ${Q.num ? `Answer: <b>${cfg.ans} ${cfg.unit}</b>. ` : ''}${cfg.explain}`);
        return false;
      }
    });
  };
}
Game.add({
  id: 'boss', boss: true, tag: 'Final Boss', title: 'Newton\'s Final Exam',
  blurb: '10 random rapid-fire questions from every station. 25 seconds each. Three hearts. Faster answers earn bonus XP.',
  steps: Array.from({ length: 10 }, (_, k) => bossStep(k)),
});
