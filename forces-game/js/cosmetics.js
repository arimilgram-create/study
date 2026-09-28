// Cosmetics: rarities, item catalog, character renderer, item icons.
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const RARITY = {
  common: { name: 'Common', c: '--r-common', refund: 15 },
  rare: { name: 'Rare', c: '--r-rare', refund: 35 },
  epic: { name: 'Epic', c: '--r-epic', refund: 75 },
  legendary: { name: 'Legendary', c: '--r-leg', refund: 180 },
  mythic: { name: 'Mythic', c: '--r-myth', refund: 400 },
};
const SLOTS = { hat: 'Hats', outfit: 'Outfits', pet: 'Sidekicks', title: 'Titles', arrow: 'Arrow skins', confetti: 'Confetti', bg: 'Backgrounds' };

const ITEMS = [
  // hats
  { id: 'cap', slot: 'hat', r: 'common', name: 'Red Cap', d: 'Blocks the Sun. Does not block gravity.' },
  { id: 'beanie', slot: 'hat', r: 'common', name: 'Beanie', d: 'Warm, cozy, 0 N of net force.' },
  { id: 'goggles', slot: 'hat', r: 'common', name: 'Lab Goggles', d: 'Safety first. Physics second.' },
  { id: 'propeller', slot: 'hat', r: 'rare', name: 'Propeller Cap', d: 'Not enough lift to beat F<sub>g</sub>. Yet.' },
  { id: 'apple', slot: 'hat', r: 'rare', name: 'Newton\'s Apple', d: 'Balanced on your head: F<sub>N</sub> = |F<sub>g</sub>|.' },
  { id: 'tophat', slot: 'hat', r: 'rare', name: 'Top Hat', d: 'Very classy. Very at rest.' },
  { id: 'wizard', slot: 'hat', r: 'epic', name: 'Physics Wizard Hat', d: 'Casts Fnet = F1 + F2 + ...' },
  { id: 'helmet', slot: 'hat', r: 'epic', name: 'Astronaut Helmet', d: 'For visiting places where g is not -10 N/kg.' },
  { id: 'wig', slot: 'hat', r: 'legendary', name: 'Sir Isaac\'s Wig', d: 'Worn by the author of the First Law himself.' },
  { id: 'crown', slot: 'hat', r: 'legendary', name: 'Crown of Inertia', d: 'Heavy crown = lots of inertia.' },
  { id: 'halo', slot: 'hat', r: 'mythic', name: 'Zero-Net-Force Halo', d: 'Floats forever. Perfectly balanced.' },
  // outfits
  { id: 'hoodie', slot: 'outfit', r: 'common', name: 'Hoodie', d: 'Study-session certified.' },
  { id: 'labcoat', slot: 'outfit', r: 'rare', name: 'Lab Coat', d: 'Comes with a pen for FBD labels.' },
  { id: 'jersey', slot: 'outfit', r: 'rare', name: 'Crash Test Jersey', d: 'Always wear your seatbelt.' },
  { id: 'spacesuit', slot: 'outfit', r: 'epic', name: 'Space Suit', d: 'Mars-ready. Weight: 37% of Earth.' },
  { id: 'tux', slot: 'outfit', r: 'epic', name: 'Tuxedo', d: 'For the Newton\'s Laws formal.' },
  { id: 'gold', slot: 'outfit', r: 'legendary', name: 'Golden Suit', d: 'Heavier than it looks.' },
  { id: 'galaxy', slot: 'outfit', r: 'mythic', name: 'Galaxy Suit', d: 'Stitched from deep space, where nothing slows you down.' },
  // pets
  { id: 'banana', slot: 'pet', r: 'common', name: 'Banana Buddy', d: '2 kg of bunch. Weighs -20 N.' },
  { id: 'applepet', slot: 'pet', r: 'common', name: 'Apple Pal', d: 'Fell on Newton once. Still proud of it.' },
  { id: 'wagon', slot: 'pet', r: 'rare', name: 'Mini Wagon', d: 'Franky\'s. Please return it.' },
  { id: 'dummy', slot: 'pet', r: 'rare', name: 'Crash Dummy Jr.', d: 'Has inertia. Wears a seatbelt.' },
  { id: 'platypus', slot: 'pet', r: 'epic', name: 'Platypus', d: '8 kg. Weighs -80 N on Earth, -29.6 N on Mars.' },
  { id: 'moon', slot: 'pet', r: 'epic', name: 'Pocket Moon', d: 'Keep your gravity on or it flies off in a straight line.' },
  { id: 'satellite', slot: 'pet', r: 'legendary', name: 'Satellite', d: 'Survived Moon Breakout. Barely.' },
  // titles
  { id: 't_rest', slot: 'title', r: 'common', name: 'Object at Rest', d: 'Stays at rest. Mostly on the couch.' },
  { id: 't_fric', slot: 'title', r: 'common', name: 'Friction Fighter', d: 'Pushes back.' },
  { id: 't_normal', slot: 'title', r: 'common', name: 'Normal Force Normie', d: 'Perpendicular to the vibes.' },
  { id: 't_vel', slot: 'title', r: 'rare', name: 'Constant Velocity Vibes', d: 'Balanced. Unbothered. Moving.' },
  { id: 't_fbd', slot: 'title', r: 'rare', name: 'FBD Artist', d: 'Every arrow labeled.' },
  { id: 't_plat', slot: 'title', r: 'epic', name: 'Platypus Whisperer', d: 'Knows g depends on location, not platypus.' },
  { id: 't_net', slot: 'title', r: 'epic', name: 'Net Force Nerd', d: 'Adds vectors for fun.' },
  { id: 't_grav', slot: 'title', r: 'legendary', name: 'Gravity\'s Worst Enemy', d: 'Lifts with F<sub>A</sub> > F<sub>g</sub> (briefly).' },
  { id: 't_newton', slot: 'title', r: 'mythic', name: 'Newton\'s Heir', d: 'The First Law is basically yours.' },
  // arrow skins (change force arrows in every FBD)
  { id: 'a_thick', slot: 'arrow', r: 'common', name: 'Chunky Arrows', d: 'Extra-thick force arrows in every FBD.' },
  { id: 'a_glow', slot: 'arrow', r: 'rare', name: 'Neon Arrows', d: 'Force arrows glow.' },
  { id: 'a_laser', slot: 'arrow', r: 'epic', name: 'Laser Arrows', d: 'Animated laser-dash force arrows.' },
  { id: 'a_plasma', slot: 'arrow', r: 'legendary', name: 'Plasma Arrows', d: 'Thick, glowing, pulsing force arrows.' },
  // confetti
  { id: 'c_apple', slot: 'confetti', r: 'common', name: 'Apple Rain', d: 'Red and green celebration.' },
  { id: 'c_banana', slot: 'confetti', r: 'rare', name: 'Banana Confetti', d: 'Peak potassium.' },
  { id: 'c_gold', slot: 'confetti', r: 'epic', name: 'Gold Rush', d: 'Shiny.' },
  { id: 'c_galaxy', slot: 'confetti', r: 'legendary', name: 'Galaxy Burst', d: 'Space-colored confetti.' },
  // card backgrounds
  { id: 'bg_chalk', slot: 'bg', r: 'common', name: 'Chalkboard', d: 'Smells like class.' },
  { id: 'bg_space', slot: 'bg', r: 'rare', name: 'Deep Space', d: 'No friction out here.' },
  { id: 'bg_sunset', slot: 'bg', r: 'epic', name: 'Sunset', d: 'Golden hour.' },
  { id: 'bg_aurora', slot: 'bg', r: 'legendary', name: 'Aurora', d: 'Northern lights.' },
];
const ITEM = Object.fromEntries(ITEMS.map(i => [i.id, i]));

const CONFETTI = {
  c_apple: ['#e03131', '#2b8a3e', '#ffd43b', '#ff8787'],
  c_banana: ['#f2c230', '#ffe066', '#6b4e00', '#fab005'],
  c_gold: ['#fcc419', '#f59f00', '#fff3bf', '#e8590c'],
  c_galaxy: ['#845ef7', '#5c7cfa', '#ffffff', '#f06595', '#15aabf'],
};

// ---------- character ----------
const SKINS = ['#fbe0c6', '#f1c27d', '#d9a066', '#b07a4f', '#7d4f32', '#4f3020'];
const HAIRC = ['#1f1a17', '#5a3825', '#a0522d', '#e6c36a', '#e8590c', '#7048e8', '#1c7ed6', '#e9ecef'];
const SHIRTS = ['#1f6feb', '#e03131', '#2b8a3e', '#f08c00', '#7048e8', '#e64980', '#18212d'];
const HAIRS = ['none', 'short', 'curly', 'spiky', 'long', 'bun'];
const EYES = ['dots', 'happy', 'wide'];
const MOUTHS = ['smile', 'grin', 'o'];
const DEFAULT_AVATAR = { name: 'Player 1', skin: 1, hair: 'short', hairColor: 1, eyes: 'dots', mouth: 'smile', shirt: 0 };
const INK = '#1b1f27', ST = `stroke="${INK}" stroke-width="3" stroke-linejoin="round"`;

function bgSVG(id) {
  if (id === 'bg_chalk') return `<rect width="200" height="220" fill="#2f4a3a"/><g fill="#fff" opacity=".22" font-family="Caveat, cursive" font-size="20"><text x="10" y="30">F = mg</text><text x="118" y="54">Fnet = 0</text><text x="14" y="200">g = -10 N/kg</text></g>`;
  if (id === 'bg_space') return `<rect width="200" height="220" fill="#0d1530"/>` + [[20, 20], [60, 44], [170, 30], [150, 80], [30, 120], [180, 150], [12, 180], [90, 16], [120, 200], [186, 204]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${1 + (i % 3) * .6}" fill="#fff"/>`).join('') + '<circle cx="176" cy="104" r="10" fill="#e8590c" opacity=".8"/>';
  if (id === 'bg_sunset') return `<defs><linearGradient id="gSunset" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5f3dc4"/><stop offset=".55" stop-color="#f06595"/><stop offset="1" stop-color="#ffa94d"/></linearGradient></defs><rect width="200" height="220" fill="url(#gSunset)"/><circle cx="100" cy="190" r="40" fill="#ffd43b" opacity=".6"/>`;
  if (id === 'bg_aurora') return `<rect width="200" height="220" fill="#0b1a2a"/><path d="M0 70 Q50 30 100 70 T200 60 L200 110 Q150 80 100 110 T0 100 Z" fill="#20c997" opacity=".45"/><path d="M0 40 Q60 10 110 40 T200 30 L200 60 Q150 40 100 62 T0 64 Z" fill="#845ef7" opacity=".4"/>`;
  return `<rect width="200" height="220" fill="#eef3f7"/>` + Array.from({ length: 11 }, (_, i) => `<line x1="${i * 20}" y1="0" x2="${i * 20}" y2="220" stroke="#d3dde6"/><line x1="0" y1="${i * 20 + 10}" x2="200" y2="${i * 20 + 10}" stroke="#d3dde6"/>`).join('');
}
const BODY = 'M34 222 Q36 156 100 150 Q164 156 166 222 Z';
function outfitSVG(id, shirt) {
  const body = fill => `<path d="${BODY}" fill="${fill}" ${ST}/>`;
  switch (id) {
    case 'hoodie': return `<path d="M64 156 Q100 128 136 156" fill="none" stroke="${shirt}" stroke-width="16" stroke-linecap="round"/>${body(shirt)}<path d="M92 156 L90 184 M108 156 L110 184" stroke="#f8f9fa" stroke-width="3"/><rect x="74" y="192" width="52" height="22" rx="8" fill="none" stroke="${INK}" stroke-width="2.5" opacity=".6"/>`;
    case 'labcoat': return `${body('#f8f9fa')}<path d="M86 152 L100 196 L114 152 Z" fill="${shirt}"/><path d="M86 152 L100 196 L114 152 M100 196 L100 222" fill="none" ${ST}/><rect x="122" y="184" width="18" height="14" fill="none" stroke="${INK}" stroke-width="2"/><line x1="127" y1="178" x2="127" y2="190" stroke="#1c7ed6" stroke-width="3"/>`;
    case 'jersey': return `${body('#f2c230')}<circle cx="100" cy="190" r="16" fill="#f2c230" ${ST}/><path d="M100 190 L100 174 A16 16 0 0 1 116 190 Z M100 190 L100 206 A16 16 0 0 1 84 190 Z" fill="${INK}"/>`;
    case 'spacesuit': return `${body('#dfe4ea')}<rect x="78" y="172" width="44" height="30" rx="5" fill="#adb5bd" ${ST}/><circle cx="90" cy="187" r="4" fill="#e03131"/><circle cx="100" cy="187" r="4" fill="#1c7ed6"/><circle cx="110" cy="187" r="4" fill="#2b8a3e"/>`;
    case 'tux': return `${body(INK)}<path d="M86 152 L100 200 L114 152 Z" fill="#f8f9fa"/><path d="M90 160 L100 165 L90 170 Z M110 160 L100 165 L110 170 Z" fill="#e03131"/>`;
    case 'gold': return `${body('#f5c542')}<path d="M60 170 L80 210 M130 164 L150 204" stroke="#fff" stroke-width="6" opacity=".45" stroke-linecap="round"/><path d="M88 152 Q100 164 112 152" fill="none" stroke="#b08900" stroke-width="3"/>`;
    case 'galaxy': return `${body('#2b1b5a')}` + [[60, 190], [80, 170], [120, 180], [140, 200], [100, 205], [70, 212], [130, 165]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 2 ? 2 : 1.4}" fill="${i % 3 ? '#fff' : '#f06595'}"/>`).join('');
    default: return `${body(shirt)}<path d="M86 152 Q100 164 114 152" fill="none" ${ST}/>`;
  }
}
function hairTop(style, c) {
  const f = `fill="${c}" ${ST}`;
  if (style === 'short' || style === 'long' || style === 'bun') return (style === 'bun' ? `<circle cx="100" cy="44" r="15" ${f}/>` : '') + `<path d="M57 90 Q56 46 100 46 Q144 46 143 90 Q136 70 118 66 Q100 76 80 66 Q64 70 57 90 Z" ${f}/>`;
  if (style === 'spiky') return `<path d="M58 84 L60 56 L74 64 L78 40 L92 56 L100 32 L110 56 L124 40 L126 64 L140 56 L142 84 Q100 64 58 84 Z" ${f}/>`;
  if (style === 'curly') return [200, 222, 245, 270, 295, 318, 340].map(a => { const r = a * Math.PI / 180; return `<circle cx="${(100 + 40 * Math.cos(r)).toFixed(1)}" cy="${(88 + 40 * Math.sin(r)).toFixed(1)}" r="14" ${f}/>`; }).join('');
  return '';
}
function faceSVG(eyes, mouth) {
  let s = '';
  if (eyes === 'happy') s += `<path d="M77 96 Q84 86 91 96 M109 96 Q116 86 123 96" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  else if (eyes === 'wide') s += `<circle cx="84" cy="93" r="9" fill="#fff" ${ST}/><circle cx="116" cy="93" r="9" fill="#fff" ${ST}/><circle cx="86" cy="94" r="4.5" fill="${INK}"/><circle cx="118" cy="94" r="4.5" fill="${INK}"/>`;
  else s += `<circle cx="84" cy="94" r="5.5" fill="${INK}"/><circle cx="116" cy="94" r="5.5" fill="${INK}"/>`;
  if (mouth === 'grin') s += `<path d="M84 110 Q100 132 116 110 Z" fill="${INK}"/><path d="M92 120 Q100 126 108 120" stroke="#ff8787" stroke-width="4" fill="none"/>`;
  else if (mouth === 'o') s += `<ellipse cx="100" cy="116" rx="6" ry="7.5" fill="${INK}"/>`;
  else s += `<path d="M86 112 Q100 124 114 112" stroke="${INK}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  return s + `<circle cx="72" cy="108" r="6" fill="#ff6b6b" opacity=".3"/><circle cx="128" cy="108" r="6" fill="#ff6b6b" opacity=".3"/>`;
}
function hatSVG(id) {
  switch (id) {
    case 'cap': return `<path d="M58 72 Q58 38 100 38 Q142 38 142 72 Z" fill="#e03131" ${ST}/><path d="M130 68 Q164 64 172 74 L138 76 Z" fill="#c92a2a" ${ST}/>`;
    case 'beanie': return `<path d="M58 74 Q58 34 100 34 Q142 34 142 74 Z" fill="#2b8a3e" ${ST}/><rect x="55" y="64" width="90" height="13" rx="6" fill="#237032" ${ST}/><circle cx="100" cy="30" r="9" fill="#f8f9fa" ${ST}/>`;
    case 'goggles': return `<rect x="56" y="62" width="88" height="8" fill="#343a40"/><circle cx="83" cy="66" r="13" fill="#74c0fc" fill-opacity=".85" ${ST}/><circle cx="117" cy="66" r="13" fill="#74c0fc" fill-opacity=".85" ${ST}/>`;
    case 'propeller': return `<path d="M60 72 Q60 40 100 40 Q140 40 140 72 Z" fill="#1c7ed6" ${ST}/><path d="M80 44 Q100 36 100 72 M120 44 Q100 36 100 72" fill="none" stroke="#ffd43b" stroke-width="5"/><line x1="100" y1="40" x2="100" y2="26" ${ST}/><g transform="translate(100 25)"><g><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="0.7s" repeatCount="indefinite"/><ellipse rx="24" ry="4.5" fill="#e03131" ${ST}/></g></g>`;
    case 'apple': return `<circle cx="100" cy="38" r="14" fill="#e03131" ${ST}/><path d="M100 24 L102 16" ${ST}/><path d="M103 20 Q114 12 118 20 Q108 24 103 20 Z" fill="#2b8a3e"/>`;
    case 'tophat': return `<rect x="72" y="8" width="56" height="46" rx="3" fill="${INK}"/><rect x="72" y="40" width="56" height="9" fill="#c92a2a"/><ellipse cx="100" cy="55" rx="47" ry="8" fill="${INK}"/>`;
    case 'wizard': return `<path d="M60 64 L100 4 L140 64 Z" fill="#5f3dc4" ${ST}/><ellipse cx="100" cy="64" rx="48" ry="8" fill="#5f3dc4" ${ST}/><path d="M96 30 l3 6 6 1 -5 4 2 6 -6 -3 -6 3 2 -6 -5 -4 6 -1 z" fill="#ffd43b"/><circle cx="116" cy="48" r="3" fill="#ffd43b"/>`;
    case 'helmet': return `<circle cx="100" cy="92" r="57" fill="#a5d8ff" fill-opacity=".22" stroke="#dee2e6" stroke-width="7"/><path d="M62 70 Q74 46 100 42" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>`;
    case 'wig': { let s = ''; for (let i = 0; i < 6; i++) { const x = 56 - (i % 2) * 5, y = 62 + i * 14; s += `<circle cx="${x}" cy="${y}" r="12" fill="#f1f3f5" stroke="#adb5bd" stroke-width="2.5"/><circle cx="${200 - x}" cy="${y}" r="12" fill="#f1f3f5" stroke="#adb5bd" stroke-width="2.5"/>`; } for (let x = 66; x <= 134; x += 17) s += `<circle cx="${x}" cy="${52 - Math.abs(100 - x) * -0.1}" r="14" fill="#f1f3f5" stroke="#adb5bd" stroke-width="2.5"/>`; return s; }
    case 'crown': return `<path d="M64 62 L64 30 L81 46 L100 20 L119 46 L136 30 L136 62 Z" fill="#fcc419" stroke="#b08900" stroke-width="3" stroke-linejoin="round"/><circle cx="100" cy="50" r="5" fill="#e03131"/><circle cx="80" cy="54" r="4" fill="#1c7ed6"/><circle cx="120" cy="54" r="4" fill="#2b8a3e"/>`;
    case 'halo': return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -5;0 0" dur="2.2s" repeatCount="indefinite"/><ellipse cx="100" cy="30" rx="40" ry="12" fill="none" stroke="#ffd43b" stroke-width="12" opacity=".25"/><ellipse cx="100" cy="30" rx="36" ry="9" fill="none" stroke="#fcc419" stroke-width="6"/></g>`;
    default: return '';
  }
}
function petSVG(id) { // drawn centered at (0,0), about 60x50
  switch (id) {
    case 'banana': return `<path d="M-18 -14 Q-10 22 22 14 Q26 8 20 6 Q-4 10 -10 -16 Z" fill="#f2c230" stroke="#6b4e00" stroke-width="2.5"/><circle cx="4" cy="4" r="2.4" fill="${INK}"/><circle cx="12" cy="3" r="2.4" fill="${INK}"/>`;
    case 'applepet': return `<circle r="17" fill="#e03131" ${ST}/><path d="M0 -17 L2 -24" ${ST}/><path d="M3 -21 Q13 -28 17 -20 Q8 -16 3 -21 Z" fill="#2b8a3e"/><circle cx="-6" cy="-2" r="2.6" fill="${INK}"/><circle cx="6" cy="-2" r="2.6" fill="${INK}"/><path d="M-5 6 Q0 10 5 6" stroke="${INK}" stroke-width="2" fill="none"/>`;
    case 'wagon': return `<rect x="-22" y="-10" width="40" height="16" rx="3" fill="#e03131" ${ST}/><circle cx="-12" cy="10" r="6" fill="#fff" ${ST}/><circle cx="10" cy="10" r="6" fill="#fff" ${ST}/><path d="M18 -4 L28 -14" ${ST}/>`;
    case 'dummy': return `<circle r="16" fill="#f2c230" ${ST}/><path d="M0 0 L0 -16 A16 16 0 0 1 16 0 Z M0 0 L0 16 A16 16 0 0 1 -16 0 Z" fill="${INK}"/>`;
    case 'platypus': return `<ellipse cx="-22" cy="4" rx="11" ry="6" fill="#6f4630" ${ST}/><ellipse cx="0" cy="2" rx="22" ry="13" fill="#8d5a3b" ${ST}/><ellipse cx="24" cy="-2" rx="11" ry="6" fill="#495057" ${ST}/><circle cx="12" cy="-5" r="2.6" fill="${INK}"/><ellipse cx="-8" cy="15" rx="6" ry="3" fill="#e8590c"/><ellipse cx="9" cy="15" rx="6" ry="3" fill="#e8590c"/>`;
    case 'moon': return `<circle r="17" fill="#dee2e6" ${ST}/><circle cx="-7" cy="-6" r="4" fill="#adb5bd"/><circle cx="8" cy="7" r="3" fill="#adb5bd"/><circle cx="-4" cy="3" r="2" fill="${INK}"/><circle cx="5" cy="-3" r="2" fill="${INK}"/>`;
    case 'satellite': return `<g><animateTransform attributeName="transform" type="translate" values="0 0;0 -4;0 0" dur="2s" repeatCount="indefinite"/><rect x="-7" y="-7" width="14" height="14" fill="#ced4da" ${ST}/><rect x="-30" y="-5" width="20" height="10" fill="#1c7ed6" ${ST}/><rect x="10" y="-5" width="20" height="10" fill="#1c7ed6" ${ST}/><line x1="0" y1="-7" x2="0" y2="-16" ${ST}/><circle cx="0" cy="-17" r="3" fill="#e03131"/></g>`;
    default: return '';
  }
}
// Full character. crop: 'head' (for small badges), 'body', or false.
function avatarSVG(av, eq, crop) {
  av = av || Game.state.avatar; eq = eq || Game.state.equip || {};
  const skin = SKINS[av.skin] || SKINS[1], hc = HAIRC[av.hairColor] || HAIRC[0], shirt = SHIRTS[av.shirt] || SHIRTS[0];
  const vb = crop === 'head' ? '38 20 124 124' : crop === 'body' ? '20 40 160 180' : '0 0 200 220';
  return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(av.name)}'s character">` +
    bgSVG(eq.bg) +
    (av.hair === 'long' ? `<path d="M56 90 Q48 160 72 170 L128 170 Q152 160 144 90 Z" fill="${hc}" ${ST}/>` : '') +
    `<rect x="90" y="124" width="20" height="30" fill="${skin}" ${ST}/>` + outfitSVG(eq.outfit, shirt) +
    `<circle cx="58" cy="98" r="9" fill="${skin}" ${ST}/><circle cx="142" cy="98" r="9" fill="${skin}" ${ST}/>` +
    `<circle cx="100" cy="92" r="42" fill="${skin}" ${ST}/>` +
    (eq.hat === 'helmet' || eq.hat === 'wig' ? '' : hairTop(av.hair, hc)) + faceSVG(av.eyes, av.mouth) +
    hatSVG(eq.hat) +
    (eq.pet ? `<g transform="translate(160 196)">${petSVG(eq.pet)}</g>` : '') + '</svg>';
}
// Icon for an item tile (HTML string).
function itemIcon(it) {
  const av = Game.state.avatar;
  if (it.slot === 'hat') return avatarSVG(av, { hat: it.id }, 'head');
  if (it.slot === 'outfit') return avatarSVG(av, { outfit: it.id }, 'body');
  if (it.slot === 'pet') return `<svg viewBox="-34 -30 68 60">${petSVG(it.id)}</svg>`;
  if (it.slot === 'bg') return `<svg viewBox="0 0 200 220" preserveAspectRatio="xMidYMid slice">${bgSVG(it.id)}</svg>`;
  if (it.slot === 'arrow') return `<svg viewBox="0 0 100 100">${arrowSVG(22, 80, 80, 22, '--f-a', null, 0, 0, 5, it.id)}</svg>`;
  if (it.slot === 'confetti') return `<svg viewBox="0 0 100 100">${CONFETTI[it.id].concat(CONFETTI[it.id]).map((c, i) => `<rect x="${12 + (i * 37) % 76}" y="${10 + (i * 23) % 76}" width="14" height="7" fill="${c}" transform="rotate(${i * 40} ${19 + (i * 37) % 76} ${13 + (i * 23) % 76})"/>`).join('')}</svg>`;
  return `<div class="ti-title">&ldquo;${it.name}&rdquo;</div>`;
}
