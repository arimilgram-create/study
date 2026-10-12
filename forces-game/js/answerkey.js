// Teacher's answer key (Balanced Forces & Constant Velocity Test Review), with the work exactly as written.
// Each part: id, q (question text), w (work lines), g (optional graph builder, run at render time).
const xtAxes = (x, y) => ({ x, y, yl: 'x - position (m)' }), vtAxes = (x, y) => ({ x, y, yl: 'v - velocity (m/s)' });
const KEY = [
  { n: '1', title: 'Velocity is a vector', station: 'v1', parts: [
    { id: '1a', q: 'Velocity has magnitude and direction. Vector or scalar?', w: ['a <u>vector</u>'] },
    { id: '1b', q: 'How do you find magnitude and direction from a position-time graph?', w: ['the slope', 'magnitude of slope = magnitude of velocity (speed)', '+/- slope = +/- vel (direction)'] },
    { id: '1c', q: 'How do you find them from a velocity-time graph?', w: ['y-value', 'magnitude (speed) = how far away from x axis (0 m/s)', 'direction: + velocity above x axis, - velocity below x axis'] },
    { id: '1d', q: 'Make up a velocity word problem, solve it, and explain where direction mattered.', w: ['must give two variables from v = &Delta;x / t and ask to solve for the remaining variable.', 'units need to match up (ex. m/s, s, m)', 'direction: +/- sign on vel (and &Delta;x)'] },
  ] },
  { n: '2', title: 'Tom the 4.5 kg cat', station: 'v2', parts: [
    { id: '2a', q: 'Calculate the weight of the cat on Earth.', w: ['m = 4.5 kg &nbsp;&nbsp; F<sub>g</sub> = ?', 'F<sub>g</sub> = m &middot; g', 'F<sub>g</sub> = 4.5(-10) = -45 N'] },
    { id: '2b', q: 'Compared to holding him at rest, how much more applied force to lift him at a constant 2 m/s?', w: ['<b>same amount</b>', 'F<sub>net</sub> = F<sub>A</sub> + F<sub>g</sub>', '0 = F<sub>A</sub> + (-45)', '45 N = F<sub>A</sub>', 'F<sub>net</sub> = 0 N for rest or moving at constant velocity'] },
    { id: '2c1', q: 'On Pluto (g = -.63 N/kg): Tom\'s weight', w: ['Pluto: F<sub>g</sub> = mg', 'F<sub>g</sub> = 4.5 kg(-.63 N/kg)', 'F<sub>g</sub> = -2.835 N'] },
    { id: '2c2', q: 'His change in weight', w: ['&Delta;F<sub>g</sub> = F<sub>gf</sub> - F<sub>gi</sub>', '&Delta;F<sub>g</sub> = (-2.835) - (-45)', '&Delta;F<sub>g</sub> = 42.165 N'] },
    { id: '2c3', q: 'His change in mass', w: ['&Delta;m = m<sub>f</sub> - m<sub>i</sub>', '&Delta;m = 4.5 kg - 4.5 kg', '&Delta;m = 0 kg (no change)'] },
  ] },
  { n: '3', title: 'Negative velocity changing in magnitude', station: 'v3', parts: [{ id: '3', q: 'Which velocity graph?', w: ['<b>c</b>'] }] },
  { n: '4', title: 'Constant positive velocity', station: 'v3', parts: [{ id: '4', q: 'Which position graph?', w: ['<b>a</b>'] }] },
  { n: '5', title: 'Jayla\'s boat, 15 m/s across a 600 m lake', station: 'v4', parts: [
    { id: '5a', q: 'Which FBD best describes the forces on her boat?', w: ['<b>d</b> (all four forces, balanced)'] },
    { id: '5b', q: 'How long does it take her to cross the 600 m lake?', w: ['v = &Delta;x / t', '15 = 600 / t', 't &middot; 15 = 600', 't = 40 s'] },
    { id: '5c', q: 'Draw the position-time and velocity-time graphs (label axes with numbers).', w: ['position: straight line from 0 m to 600 m at 40 s (axis 0, 200, 400, 600, 800 m; 10-50 s)', 'velocity: flat line at 15 m/s from 0 to 40 s'],
      g: () => plotSVG(xtAxes([0, 50, 10], [0, 800, 200]), [[0, 0], [40, 600]], '--pen') + plotSVG(vtAxes([0, 50, 10], [-15, 20, 5]), [[0, 15], [40, 15]], '--pen') },
    { id: '5d', q: 'Going back 1/4 as fast, how does the time compare?', w: ['v = &Delta;x / t', 't = &Delta;x / v &nbsp; (v &divide; 4, so t &times; 4: inverse)', 'it would take <b>4x more time</b>.'] },
  ] },
  { n: '6', title: 'Victoria\'s cart (only F<sub>N</sub> and F<sub>g</sub>)', station: 'v3', parts: [
    { id: '6a', q: 'Draw another position graph that works for the cart but is not at rest.', w: ['yes: any straight sloped line (the key draws one sloping down)'], g: () => plotSVG(xtAxes([0, 10, 2], [0, 10, 2]), [[0, 8], [8, 3]], '--pen') },
    { id: '6b', q: 'Explain why yours also works.', w: ['Balanced forces only tells us the object is travelling at a constant velocity. So any constant velocity graph (straight line) works as a possibility.'] },
    { id: '6c', q: 'Velocity graphs for Victoria\'s motion and yours.', w: ['Victoria\'s: flat line on the t-axis (v = 0)', 'yours: flat line below the t-axis (constant negative velocity)'],
      g: () => plotSVG(vtAxes([0, 10, 2], [-4, 4, 2]), [[0, 0], [10, 0]], '--pen') + plotSVG(vtAxes([0, 10, 2], [-4, 4, 2]), [[0, -2], [10, -2]], '--pen') },
  ] },
  { n: '7', title: 'CeeCee vs. Molly', station: 'v5', parts: [{ id: '7', q: 'CeeCee runs 1.25 times faster. How do finishing times compare?', w: ['t = &Delta;x / (v &times; 1.25) &nbsp; so t &divide; 1.25', 'CeeCee completes the race in <b>1.25x less time</b>'] }] },
  { n: '8', title: 'The 12 kg desk', station: 'v6', parts: [
    { id: '8a', q: 'Show your work for the normal force holding up the desk.', w: ['FBD: F<sub>N</sub> up, F<sub>g</sub> down', 'F<sub>g</sub> = mg', 'F<sub>g</sub> = 12(-10)', 'F<sub>g</sub> = -120 N', '&Sigma;F = F<sub>g</sub> + F<sub>N</sub>', '0 = -120 + F<sub>N</sub>', '120 N = F<sub>N</sub>'] },
    { id: '8b', q: 'What changes if you push down on it with -15 N?', w: ['FBD: F<sub>N</sub> up, F<sub>A</sub> and F<sub>g</sub> down', '&Sigma;F = F<sub>g</sub> + F<sub>N</sub> + F<sub>A</sub>', '0 = -120 + F<sub>N</sub> + (-15)', '135 N = F<sub>N</sub>'] },
  ] },
  { n: '9', title: 'Larry\'s shopping cart', station: 'v7', parts: [
    { id: '9a', q: 'Read the velocity-time graph.', w: ['Parking lot velocity: <b>3 m/s</b>', 'Grass velocity: <b>.5 m/s</b>'] },
    { id: '9b', q: 'Calculate the total displacement.', w: ['v = &Delta;x / t &nbsp;&nbsp; 3 = &Delta;x / 2.5 &nbsp;&nbsp; 7.5 m = &Delta;x<sub>1</sub>', 'v = &Delta;x / t &nbsp;&nbsp; .5 = &Delta;x / 3.5 &nbsp;&nbsp; &Delta;x<sub>2</sub> = 1.75 m', '&Delta;x<sub>T</sub> = 9.25 m'] },
    { id: '9c', q: 'Force needed to push the cart on the grass.', w: ['FBD: F<sub>f</sub> left, F<sub>N</sub> up, F<sub>A</sub> right, F<sub>g</sub> down', 'F<sub>net,x</sub> = F<sub>A</sub> + F<sub>f</sub>', '0 = F<sub>A</sub> + (-80)', '80 N = F<sub>A</sub>'] },
    { id: '9d', q: 'Draw the position graph for the whole motion.', w: ['steep line to 7.5 m at 2.5 s, then shallow line to 9.25 m at 6 s'], g: () => plotSVG(xtAxes([0, 6, 1], [0, 10, 1]), [[0, 0], [2.5, 7.5], [6, 9.25]], '--pen') },
    { id: '9e', q: 'Average speed for the entire motion.', w: ['s&#772; = d / t', 's&#772; = 9.25 m / 6 s', 's&#772; = 1.54 m/s'] },
  ] },
  { n: '9 (2nd)', title: 'Remote control car', station: 'v8', parts: [
    { id: 'rc-a', q: 'FBD when the car moves to the right.', w: ['F<sub>N</sub> up, F<sub>g</sub> down, F<sub>A</sub> right, F<sub>f</sub> left (balanced)'] },
    { id: 'rc-b', q: 'Draw the v vs t graph for the entire motion.', w: ['-2 m/s from 0-3 s, 0 m/s from 3-7 s, +1 m/s from 7-12 s'], g: () => plotSVG(vtAxes([0, 12, 1], [-3, 3, 1]), [[0, -2], [3, -2], [3, 0], [7, 0], [7, 1], [12, 1]], '--pen') },
    { id: 'rc-c', q: 'Displacement for the entire motion.', w: ['v = &Delta;x / t &nbsp;&nbsp; &Delta;x = v &middot; t', '&Delta;x<sub>1</sub> = -2 m/s &middot; 3 s = -6 m', '&Delta;x<sub>2</sub> = 0 m/s &middot; 4 s = 0 m', '&Delta;x<sub>3</sub> = 1 m/s &middot; 5 s = 5 m', '&Delta;x<sub>total</sub> = -1 m', 'or: &Delta;x = x<sub>f</sub> - x<sub>i</sub> = 8 m - 9 m = -1 m'] },
    { id: 'rc-d', q: 'Total distance traveled.', w: ['d<sub>1</sub> = 6 m, d<sub>2</sub> = 0 m, d<sub>3</sub> = 5 m', 'd<sub>total</sub> = 11 m'] },
    { id: 'rc-e', q: 'Change in velocity from t<sub>i</sub> = 1 s to t<sub>f</sub> = 10 s.', w: ['&Delta;v = v<sub>f</sub> - v<sub>i</sub>', '&Delta;v = 1 m/s - (-2 m/s)', '&Delta;v = 3 m/s'] },
  ] },
  { n: '10', title: 'Sally to the store and back', station: 'v5', parts: [{ id: '10', q: 'Trip to the store takes 1/5 the time. Compare the velocities.', w: ['v = &Delta;x / t &nbsp; (t &divide; 5, so v &times; 5: inverse)', 'She had <b>5x greater velocity</b> on her trip to the store.'] }] },
  { n: '11', title: 'Enid\'s shuttle to the Moon', station: 'v5', parts: [{ id: '11', q: '7000 m/s, 384,000,000 m away. How long?', w: ['s = d / t', '7000 = 384,000,000 / t', 't = 384,000,000 / 7000 = 54,857 s'] }] },
  { n: '12', title: 'Soccer ball in the truck', station: 'v9', parts: [{ id: '12', q: 'Force toward the back, or inertia?', w: ['<b>b) inertia</b>', 'The ball and truck were at rest. When the truck moved, the ball\'s inertia tried to keep it at rest as the truck moved forward. So the back of the truck moved forward into the ball. Nothing pushed the ball backward.'] }] },
  { n: '13', title: 'The velocity graph (3 m/s, then -1 m/s)', station: 'v10', parts: [
    { id: '13a', q: 'Average speed for the whole motion.', w: ['s<sub>1</sub> = d<sub>1</sub> / t<sub>1</sub> &nbsp;&nbsp; 3 = d<sub>1</sub> / 4 &nbsp;&nbsp; d<sub>1</sub> = 12 m', 's<sub>2</sub> = d<sub>2</sub> / t<sub>2</sub> &nbsp;&nbsp; 1 = d<sub>2</sub> / 8 &nbsp;&nbsp; 8 m = d<sub>2</sub>', 'd<sub>T</sub> = 20 m, t<sub>T</sub> = 12 s', 's<sub>avg</sub> = d / t = 20 m / 12 s', 's<sub>avg</sub> = 1.6&#773; m/s (1.67 m/s)'] },
    { id: '13b', q: 'Average velocity for the whole motion.', w: ['v<sub>1</sub> = &Delta;x<sub>1</sub> / t<sub>1</sub> &nbsp;&nbsp; 3 = &Delta;x<sub>1</sub> / 4 &nbsp;&nbsp; &Delta;x<sub>1</sub> = 12 m', 'v<sub>2</sub> = &Delta;x<sub>2</sub> / t<sub>2</sub> &nbsp;&nbsp; -1 = &Delta;x<sub>2</sub> / 8 &nbsp;&nbsp; -8 m = &Delta;x<sub>2</sub>', '&Delta;x<sub>T</sub> = 4 m, t<sub>T</sub> = 12 s', 'v<sub>avg</sub> = &Delta;x / t = 4 m / 12 s', 'v<sub>avg</sub> = .3&#773; m/s (0.33 m/s)'] },
    { id: '13c', q: 'Draw the position vs time graph.', w: ['up to 12 m at 4 s, then down 1 m every second (9 m at 7 s, 6 m at 10 s)'], g: () => plotSVG(xtAxes([0, 12, 1], [0, 14, 2]), [[0, 0], [4, 12], [12, 4]], '--pen') },
    { id: '13d', q: 'Displacement from 7-10 s.', w: ['v = &Delta;x / t', '-1 m/s = &Delta;x / 3 s', '-3 m = &Delta;x', 'or: &Delta;x = x<sub>f</sub> - x<sub>i</sub> = 6 m - 9 m = -3 m'] },
  ] },
];
const keyOf = station => (KEY.find(k => k.station === station) || {}).n;
const partLabel = id => (id.match(/^(?:rc-)?\d*([a-z])/) || [])[1] || '';
const KEYPART = Object.fromEntries(KEY.flatMap(k => k.parts.map(p => [p.id, p])));
// The answer key's work as a block for a station explanation.
const keyFor = (...ids) => `<div class="keywork"><span class="kw-label">Answer key work</span>${ids.flatMap(id => KEYPART[id].w).map(l => `<span class="kline">${l}</span>`).join('')}</div>`;

Game.answerKey = function (focus) {
  const app = $('#app'); app.innerHTML = '';
  let all = false; const toggles = [];
  const showAll = h('button', { class: 'btn small', onclick: () => { all = !all; toggles.forEach(t => t(all)); showAll.textContent = all ? 'Hide all work' : 'Show all work'; } }, 'Show all work');
  app.append(h('div', { class: 'lvl-head' }, h('button', { class: 'btn small', onclick: () => this.map() }, '< Map'), h('h2', {}, 'Answer Key: Balanced Forces & Constant Velocity'), showAll),
    h('div', { class: 'lockin', html: `${lockSVG}<span><b>LOCK IN.</b> Try each one on paper first: equation, plug in, answer with units. Then tap <b>Show work</b> and compare line by line with your teacher's key.</span>` }));
  const list = h('div', { class: 'key-list' }); app.append(list);
  KEY.forEach(k => {
    const card = h('section', { class: 'key-card', id: 'key-' + k.n.replace(/\W+/g, '') }, h('div', { class: 'key-head' }, h('span', { class: 'tag' }, 'Test Q' + k.n), h('h3', { html: k.title }),
      h('button', { class: 'btn small', onclick: () => this.play(this.levels.findIndex(l => l.id === k.station)) }, 'Practice it >')));
    k.parts.forEach(p => {
      const work = h('div', { class: 'key-work' }, ...p.w.map(l => h('div', { class: 'kline', html: l })), p.g ? h('div', { class: 'key-graphs', html: p.g() }) : null);
      work.hidden = true;
      const btn = h('button', { class: 'btn small primary' }, 'Show work');
      const set = on => { work.hidden = !on; btn.textContent = on ? 'Hide work' : 'Show work'; };
      btn.onclick = () => { set(work.hidden); SFX.click(); };
      toggles.push(set);
      card.append(h('div', { class: 'key-part' }, h('div', { class: 'key-q' }, partLabel(p.id) ? h('b', {}, partLabel(p.id) + '. ') : null, h('span', { html: p.q })), btn, work));
    });
    list.append(card);
  });
  scrollTo(0, 0);
  if (focus) { const el = document.getElementById('key-' + String(focus).replace(/\W+/g, '')); if (el) { el.scrollIntoView({ block: 'start' }); el.querySelectorAll('.key-work').forEach(w => w.hidden = false); el.querySelectorAll('.key-part .btn.primary').forEach(b => b.textContent = 'Hide work'); } }
};
