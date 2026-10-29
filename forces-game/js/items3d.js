// The 3D item catalog: hats, face accessories, shirts, pants, back items, gear, pets, and auras.
// Also: the one-time trade-in of the old 2D items, 3D thumbnails for item tiles, and avatar portraits.

// k = which builder in avatar3d.js draws it. c / c2 = colors. style / print / num = how a shirt or pants is painted.
const ITEMS3D = [
  // hats
  { id: 'h_cap_red', slot: 'hat', r: 'common', name: 'Red Cap', k: 'cap', c: '#e0263f', c2: '#ffffff', d: 'Blocks the Sun. Does not block gravity.' },
  { id: 'h_cap_blue', slot: 'hat', r: 'common', name: 'Blue Cap', k: 'cap', c: '#1e74e8', c2: '#ffd21f', d: 'Backwards is still a vector.' },
  { id: 'h_beanie', slot: 'hat', r: 'common', name: 'Beanie', k: 'beanie', c: '#3d9bff', c2: '#ffffff', d: 'Warm, cozy, 0 N of net force.' },
  { id: 'h_bucket', slot: 'hat', r: 'common', name: 'Bucket Hat', k: 'bucket', c: '#c9b27a', d: 'Holds water. Holds vibes.' },
  { id: 'h_party', slot: 'hat', r: 'common', name: 'Party Hat', k: 'party', c: '#ff4fb4', c2: '#ffd21f', d: 'For every 3-star station.' },
  { id: 'h_cone', slot: 'hat', r: 'common', name: 'Traffic Cone', k: 'cone', d: 'Stops cars. Can\'t stop inertia.' },
  { id: 'h_headband', slot: 'hat', r: 'common', name: 'Racing Headband', k: 'headband', c: '#e0263f', set: 'v', d: 'CeeCee wears it. 1.25x faster (not really).' },
  { id: 'h_tophat', slot: 'hat', r: 'rare', name: 'Top Hat', k: 'tophat', c: '#1b1d22', c2: '#e0263f', d: 'Very classy. Very at rest.' },
  { id: 'h_propeller', slot: 'hat', r: 'rare', name: 'Propeller Cap', k: 'propeller', c: '#e0263f', c2: '#ffd21f', d: 'Not enough lift to beat F<sub>g</sub>. Yet.' },
  { id: 'h_apple', slot: 'hat', r: 'rare', name: 'Newton\'s Apple', k: 'apple', d: 'Balanced on your head: F<sub>N</sub> = |F<sub>g</sub>|.' },
  { id: 'h_headphones', slot: 'hat', r: 'rare', name: 'Study Headphones', k: 'headphones', c: '#1e74e8', d: 'Lo-fi physics beats to lock in to.' },
  { id: 'h_chef', slot: 'hat', r: 'rare', name: 'Chef Hat', k: 'chef', d: 'Cooks up free body diagrams.' },
  { id: 'h_fedora', slot: 'hat', r: 'rare', name: 'Fedora', k: 'fedora', c: '#6b4f3a', d: 'M\'lady. M\'acceleration.' },
  { id: 'h_cowboy', slot: 'hat', r: 'rare', name: 'Cowboy Hat', k: 'cowboy', c: '#8b5a2b', d: 'Yeehaw = constant velocity across the prairie.' },
  { id: 'h_flower', slot: 'hat', r: 'rare', name: 'Flower Crown', k: 'flower', d: 'Smells like spring and friction.' },
  { id: 'h_captain', slot: 'hat', r: 'rare', name: 'Captain\'s Hat', k: 'captain', set: 'v', d: 'Jayla\'s. Constant 15 m/s across the lake.' },
  { id: 'h_wizard', slot: 'hat', r: 'epic', name: 'Physics Wizard Hat', k: 'wizard', c: '#5b2bbf', c2: '#ffd21f', d: 'Casts F<sub>net</sub> = F<sub>1</sub> + F<sub>2</sub> + ...' },
  { id: 'h_viking', slot: 'hat', r: 'epic', name: 'Viking Helmet', k: 'viking', d: 'Heavy. Lots of inertia. Charge!' },
  { id: 'h_pirate', slot: 'hat', r: 'epic', name: 'Pirate Captain Hat', k: 'pirate', c: '#1b1d22', d: 'Arr = a.' },
  { id: 'h_grad', slot: 'hat', r: 'epic', name: 'Graduation Cap', k: 'grad', d: 'Passed the quiz. Full credit.' },
  { id: 'h_bunny', slot: 'hat', r: 'epic', name: 'Bunny Ears', k: 'bunny', c: '#ffffff', d: 'Hop = brief net force up.' },
  { id: 'h_astro', slot: 'hat', r: 'epic', name: 'Astronaut Helmet', k: 'astro', d: 'For places where g is not -10 N/kg.' },
  { id: 'h_santa', slot: 'hat', r: 'epic', name: 'Holiday Hat', k: 'santa', d: 'Sleigh at constant velocity.' },
  { id: 'h_catears', slot: 'hat', r: 'epic', name: 'Tom\'s Cat Ears', k: 'catears', c: '#9aa4b0', set: 'v', d: '4.5 kg of attitude. -45 N on Earth.' },
  { id: 'h_crown', slot: 'hat', r: 'legendary', name: 'Crown of Inertia', k: 'crown', c: '#ffcc33', d: 'Heavy crown = lots of inertia.' },
  { id: 'h_devil', slot: 'hat', r: 'legendary', name: 'Devil Horns', k: 'devil', c: '#e0263f', d: 'Forgot the units on purpose.' },
  { id: 'h_goldtop', slot: 'hat', r: 'legendary', name: 'Golden Top Hat', k: 'tophat', c: '#ffcc33', c2: '#1b1d22', d: 'Worth 250 chips. Worn by the rich and balanced.' },
  { id: 'h_shuttle', slot: 'hat', r: 'legendary', name: 'Shuttle Hat', k: 'shuttle', set: 'v', d: '7000 m/s. Moon in 54,857 s.' },
  { id: 'h_halo', slot: 'hat', r: 'mythic', name: 'Zero-Net-Force Halo', k: 'halo', d: 'Floats forever. Perfectly balanced.' },
  { id: 'h_void', slot: 'hat', r: 'mythic', name: 'Void Hood', k: 'void', d: 'Stares back at you.' },
  { id: 'h_galaxycrown', slot: 'hat', r: 'mythic', name: 'Galaxy Crown', k: 'crown', c: '#b14cff', d: 'Forged where nothing slows you down.' },
  // face
  { id: 'fa_shades', slot: 'face', r: 'common', name: 'Sunglasses', k: 'shades', d: 'Too cool for friction.' },
  { id: 'fa_nerd', slot: 'face', r: 'common', name: 'Nerd Glasses', k: 'nerd', d: '+10 to reading graphs.' },
  { id: 'fa_mustache', slot: 'face', r: 'common', name: 'Newton\'s Mustache', k: 'mustache', d: 'Distinguished. Gravitational.' },
  { id: 'fa_goggles', slot: 'face', r: 'rare', name: 'Lab Goggles', k: 'goggles', d: 'Safety first. Physics second.' },
  { id: 'fa_3d', slot: 'face', r: 'rare', name: '3D Glasses', k: 'glasses3d', d: 'Now everything is 3D. Wait, it already is.' },
  { id: 'fa_ninja', slot: 'face', r: 'rare', name: 'Ninja Mask', k: 'ninja', d: 'Silent. Balanced. Deadly accurate FBDs.' },
  { id: 'fa_shutter', slot: 'face', r: 'epic', name: 'Shutter Shades', k: 'shutter', c: '#ff4fb4', d: 'Party in the lab.' },
  { id: 'fa_stars', slot: 'face', r: 'epic', name: 'Star Glasses', k: 'stars', d: 'You\'re the star of the show.' },
  { id: 'fa_monocle', slot: 'face', r: 'epic', name: 'Fancy Monocle', k: 'monocle', d: 'Indubitably accelerating.' },
  { id: 'fa_visor', slot: 'face', r: 'legendary', name: 'Cyber Visor', k: 'visor', c: '#00e5ff', d: 'Shows the net force on everything.' },
  { id: 'fa_goldvisor', slot: 'face', r: 'mythic', name: 'Golden Visor', k: 'visor', c: '#ffcc33', d: 'Sees the future. It\'s full credit.' },
  // shirts
  { id: 'sh_red', slot: 'shirt', r: 'common', name: 'Red Tee', style: 'tee', c: '#e0263f', d: 'Classic.' },
  { id: 'sh_green', slot: 'shirt', r: 'common', name: 'Green Tee', style: 'tee', c: '#22a03a', d: 'Classic, but green.' },
  { id: 'sh_stripes', slot: 'shirt', r: 'common', name: 'Striped Shirt', style: 'stripes', c: '#1e74e8', c2: '#ffffff', d: 'Parallel lines. Never meet.' },
  { id: 'sh_fma', slot: 'shirt', r: 'common', name: 'F = ma Tee', style: 'tee', c: '#1b1d22', c2: '#ffd21f', print: 'F = ma', d: 'The only equation that matters (this unit).' },
  { id: 'sh_sigma', slot: 'shirt', r: 'common', name: 'Balanced Tee', style: 'tee', c: '#6c3fd1', c2: '#ffffff', print: 'ΣF = 0', d: 'At rest or cruising. Unbothered.' },
  { id: 'sh_love', slot: 'shirt', r: 'common', name: 'I Love Physics Tee', style: 'tee', c: '#ffffff', c2: '#e0263f', print: 'I ♥\nPHYSICS', d: 'Wear it to the quiz.' },
  { id: 'sh_hoodie', slot: 'shirt', r: 'rare', name: 'Blue Hoodie', style: 'hoodie', c: '#3d9bff', d: 'Study-session certified.' },
  { id: 'sh_hoodiepink', slot: 'shirt', r: 'rare', name: 'Pink Hoodie', style: 'hoodie', c: '#ff6fa8', d: 'Comfy at any velocity.' },
  { id: 'sh_jersey', slot: 'shirt', r: 'rare', name: 'Crash Test Jersey', style: 'jersey', c: '#e0263f', c2: '#ffffff', num: '9', d: 'Always wear your seatbelt.' },
  { id: 'sh_flannel', slot: 'shirt', r: 'rare', name: 'Flannel', style: 'flannel', c: '#c0262f', c2: '#1b1d22', d: 'Lumberjack lab partner.' },
  { id: 'sh_apple', slot: 'shirt', r: 'rare', name: 'Newton\'s Apple Tee', style: 'tee', c: '#ffffff', c2: '#e0263f', print: 'apple', d: 'It fell. History was made.' },
  { id: 'sh_camo', slot: 'shirt', r: 'rare', name: 'Camo Jacket', style: 'camo', c: '#5f7040', d: 'Blend in. Accelerate out.' },
  { id: 'sh_sailor', slot: 'shirt', r: 'rare', name: 'Boat Captain Shirt', style: 'stripes', c: '#ffffff', c2: '#1e74e8', set: 'v', d: 'F<sub>engine</sub> = |F<sub>f</sub>|. Smooth sailing.' },
  { id: 'sh_labcoat', slot: 'shirt', r: 'epic', name: 'Lab Coat', style: 'labcoat', c: '#1e74e8', d: 'Comes with a pen for FBD labels.' },
  { id: 'sh_tux', slot: 'shirt', r: 'epic', name: 'Tuxedo', style: 'tux', c2: '#e0263f', d: 'For the Newton\'s Laws formal.' },
  { id: 'sh_space', slot: 'shirt', r: 'epic', name: 'Space Suit', style: 'space', c: '#e0263f', d: 'Mars-ready. Weight: 37% of Earth.' },
  { id: 'sh_rocket', slot: 'shirt', r: 'epic', name: 'Rocket Tee', style: 'tee', c: '#1e3a8a', c2: '#ffffff', print: 'rocket', d: 'Net force up. Liftoff.' },
  { id: 'sh_varsity', slot: 'shirt', r: 'epic', name: 'Varsity Jacket', style: 'varsity', c: '#1b5e20', c2: '#ffffff', num: 'N', d: 'Team Newton.' },
  { id: 'sh_sweater', slot: 'shirt', r: 'epic', name: 'Cozy Sweater', style: 'sweater', c: '#c0262f', c2: '#ffffff', d: 'Knitted at constant velocity.' },
  { id: 'sh_gold', slot: 'shirt', r: 'legendary', name: 'Golden Suit', style: 'gold', d: 'Heavier than it looks.' },
  { id: 'sh_checker', slot: 'shirt', r: 'legendary', name: 'Finish Line Jersey', style: 'checker', c: '#1b1d22', c2: '#ffffff', set: 'v', d: 'Checkered. Fast. Balanced.' },
  { id: 'sh_atom', slot: 'shirt', r: 'legendary', name: 'Atomic Tee', style: 'tee', c: '#0b2a5c', c2: '#6cc0ff', print: 'atom', d: 'Tiny but mighty.' },
  { id: 'sh_galaxy', slot: 'shirt', r: 'mythic', name: 'Galaxy Suit', style: 'galaxy', d: 'Stitched from deep space, where nothing slows you down.' },
  { id: 'sh_lava', slot: 'shirt', r: 'mythic', name: 'Lava Suit', style: 'lava', d: 'Hot. Like your study streak.' },
  // pants
  { id: 'pa_jeans', slot: 'pants', r: 'common', name: 'Jeans', style: 'jeans', c: '#2f5d9e', d: 'Durable. Lots of friction.' },
  { id: 'pa_black', slot: 'pants', r: 'common', name: 'Black Pants', style: 'plain', c: '#1b1d22', d: 'Goes with everything.' },
  { id: 'pa_shorts', slot: 'pants', r: 'common', name: 'Khaki Shorts', style: 'shorts', c: '#c9b27a', shoe: '#f4f6f8', d: 'Summer physics.' },
  { id: 'pa_track', slot: 'pants', r: 'rare', name: 'Track Pants', style: 'track', c: '#1b1d22', c2: '#ffffff', shoe: '#f4f6f8', set: 'v', d: 'Built for constant velocity.' },
  { id: 'pa_cargo', slot: 'pants', r: 'rare', name: 'Cargo Pants', style: 'cargo', c: '#556b2f', d: 'Pockets for every formula.' },
  { id: 'pa_plaid', slot: 'pants', r: 'rare', name: 'Plaid Pants', style: 'plaid', c: '#c0262f', c2: '#1b1d22', d: 'Bold choice.' },
  { id: 'pa_space', slot: 'pants', r: 'epic', name: 'Space Suit Pants', style: 'space', c: '#e0263f', shoe: '#eef1f5', d: 'Pairs with the Space Suit.' },
  { id: 'pa_checker', slot: 'pants', r: 'epic', name: 'Finish Line Pants', style: 'checker', c: '#1b1d22', c2: '#ffffff', d: 'Fast legs.' },
  { id: 'pa_camo', slot: 'pants', r: 'epic', name: 'Camo Pants', style: 'camo', c: '#5f7040', d: 'Where did your legs go?' },
  { id: 'pa_gold', slot: 'pants', r: 'legendary', name: 'Golden Pants', style: 'gold', shoe: '#d99a00', d: 'Pairs with the Golden Suit.' },
  { id: 'pa_galaxy', slot: 'pants', r: 'mythic', name: 'Galaxy Pants', style: 'galaxy', shoe: '#1a0b3d', d: 'Legs that orbit.' },
  { id: 'pa_lava', slot: 'pants', r: 'mythic', name: 'Lava Pants', style: 'lava', shoe: '#2a1410', d: 'The floor is lava. So are you.' },
  // back
  { id: 'bk_backpack', slot: 'back', r: 'common', name: 'School Backpack', k: 'backpack', c: '#1e74e8', d: 'Holds 3 textbooks and a snack.' },
  { id: 'bk_backpackred', slot: 'back', r: 'common', name: 'Red Backpack', k: 'backpack', c: '#e0263f', d: 'Heavy = more inertia on the way to class.' },
  { id: 'bk_cape', slot: 'back', r: 'rare', name: 'Hero Cape', k: 'cape', c: '#e0263f', c2: '#ffcc33', d: 'Flaps when you run. Physics!' },
  { id: 'bk_swords', slot: 'back', r: 'rare', name: 'Sword Pack', k: 'swords', d: 'Two swords. Zero net force.' },
  { id: 'bk_bat', slot: 'back', r: 'epic', name: 'Bat Wings', k: 'bat', c: '#3b2a4f', d: 'Night mode.' },
  { id: 'bk_butterfly', slot: 'back', r: 'epic', name: 'Butterfly Wings', k: 'butterfly', c: '#6cc0ff', c2: '#ffd21f', d: 'Flutter at constant velocity.' },
  { id: 'bk_jetpack', slot: 'back', r: 'epic', name: 'Jetpack', k: 'jetpack', d: 'F<sub>thrust</sub> > F<sub>g</sub>. Up we go.' },
  { id: 'bk_capepurple', slot: 'back', r: 'epic', name: 'Royal Cape', k: 'cape', c: '#7b2ff7', c2: '#ffcc33', d: 'For the Crown of Inertia.' },
  { id: 'bk_angel', slot: 'back', r: 'legendary', name: 'Angel Wings', k: 'angel', d: 'Perfectly balanced lift.' },
  { id: 'bk_fairy', slot: 'back', r: 'legendary', name: 'Fairy Wings', k: 'fairy', c: '#8ff0ff', d: 'Glow in the dark lab.' },
  { id: 'bk_booster', slot: 'back', r: 'legendary', name: 'Rocket Booster', k: 'booster', set: 'v', d: 'Enid\'s spare. 7000 m/s.' },
  { id: 'bk_dragon', slot: 'back', r: 'mythic', name: 'Dragon Wings', k: 'dragon', c: '#c0262f', c2: '#ffb000', d: 'The rarest wings in the game.' },
  // gear (plus the game-icons gear in art2.js)
  { id: 'ge_saber', slot: 'gear', r: 'legendary', name: 'Energy Saber', k: 'saber', c: '#00e5ff', d: 'Hums at a constant frequency.' },
  { id: 'ge_saberred', slot: 'gear', r: 'mythic', name: 'Crimson Saber', k: 'saber', c: '#ff2a4d', d: 'Glows. Hums. Intimidates.' },
  // pets
  { id: 'pt_cat', slot: 'pet', r: 'common', name: 'Orange Cat', k: 'cat', c: '#ff9f43', d: 'Lands on its feet. Every time.' },
  { id: 'pt_dog', slot: 'pet', r: 'common', name: 'Puppy', k: 'dog', c: '#c68642', d: 'Fetches. Returns the ball at constant velocity.' },
  { id: 'pt_duck', slot: 'pet', r: 'common', name: 'Rubber Duck', k: 'duck', d: 'Floats. Buoyancy is next unit.' },
  { id: 'pt_frog', slot: 'pet', r: 'common', name: 'Frog', k: 'frog', c: '#4caf50', d: 'Jumps = brief net force up.' },
  { id: 'pt_soccer', slot: 'pet', r: 'common', name: 'Soccer Ball', k: 'soccer', set: 'v', d: 'Rolls to the back of the truck. Inertia.' },
  { id: 'pt_apple', slot: 'pet', r: 'common', name: 'Apple Pal', k: 'applebud', d: 'Fell on Newton once. Still proud of it.' },
  { id: 'pt_bunny', slot: 'pet', r: 'rare', name: 'Bunny', k: 'bunny', d: 'Hops. Lands. Hops.' },
  { id: 'pt_bear', slot: 'pet', r: 'rare', name: 'Teddy Bear', k: 'bear', c: '#8b5a2b', d: 'Hugs at constant velocity.' },
  { id: 'pt_penguin', slot: 'pet', r: 'rare', name: 'Penguin', k: 'penguin', d: 'Slides on frictionless ice.' },
  { id: 'pt_banana', slot: 'pet', r: 'rare', name: 'Banana Buddy', k: 'banana', d: '2 kg of bunch. Weighs -20 N.' },
  { id: 'pt_slime', slot: 'pet', r: 'rare', name: 'Slime', k: 'slime', c: '#5ee36b', d: 'Squishy. Elastic collisions.' },
  { id: 'pt_ghost', slot: 'pet', r: 'epic', name: 'Ghost', k: 'ghost', d: 'Floats. F<sub>g</sub> doesn\'t apply (it\'s a ghost).' },
  { id: 'pt_robot', slot: 'pet', r: 'epic', name: 'Robo Pal', k: 'robot', d: 'Calculates net force for fun.' },
  { id: 'pt_axolotl', slot: 'pet', r: 'epic', name: 'Axolotl', k: 'axolotl', d: 'Smiles at every right answer.' },
  { id: 'pt_dino', slot: 'pet', r: 'epic', name: 'Dino', k: 'dino', c: '#4caf50', d: 'Big inertia energy.' },
  { id: 'pt_slimepurple', slot: 'pet', r: 'epic', name: 'Royal Slime', k: 'slime', c: '#b14cff', d: 'A slime with a crown attitude.' },
  { id: 'pt_tom', slot: 'pet', r: 'epic', name: 'Tom the Cat', k: 'tomcat', set: 'v', d: 'Weighs -2.835 N on Pluto. Still judges you.' },
  { id: 'pt_unicorn', slot: 'pet', r: 'legendary', name: 'Unicorn', k: 'unicorn', d: 'Magical. Still obeys F = ma.' },
  { id: 'pt_moon', slot: 'pet', r: 'legendary', name: 'Pocket Moon', k: 'planet', c: '#c9d1db', d: 'Keep your gravity on or it flies off in a straight line.' },
  { id: 'pt_rocket', slot: 'pet', r: 'legendary', name: 'Space Shuttle', k: 'rocket', set: 'v', d: 'Enid\'s ride. 384,000,000 m to go.' },
  { id: 'pt_dragon', slot: 'pet', r: 'mythic', name: 'Baby Dragon', k: 'dragon', c: '#7b2ff7', d: 'Breathes fire. Acceleration: yes.' },
  { id: 'pt_ufo', slot: 'pet', r: 'mythic', name: 'UFO', k: 'ufo', d: 'Unidentified Flying Object. Identified: awesome.' },
  // auras
  { id: 'au_sparkle', slot: 'aura', r: 'rare', name: 'Sparkle Aura', k: 'sparkle', d: 'Twinkle twinkle.' },
  { id: 'au_snow', slot: 'aura', r: 'rare', name: 'Snow Aura', k: 'snow', d: 'Falls at terminal velocity.' },
  { id: 'au_bubbles', slot: 'aura', r: 'rare', name: 'Bubble Aura', k: 'bubbles', d: 'Pop!' },
  { id: 'au_hearts', slot: 'aura', r: 'epic', name: 'Heart Aura', k: 'hearts', d: 'Spread the love (of physics).' },
  { id: 'au_fire', slot: 'aura', r: 'epic', name: 'Fire Aura', k: 'fire', d: 'On fire. Like your streak.' },
  { id: 'au_lightning', slot: 'aura', r: 'legendary', name: 'Lightning Aura', k: 'lightning', d: 'Crackles with energy.' },
  { id: 'au_rainbow', slot: 'aura', r: 'legendary', name: 'Rainbow Aura', k: 'rainbow', d: 'Every color at once.' },
  { id: 'au_galaxy', slot: 'aura', r: 'mythic', name: 'Galaxy Aura', k: 'galaxy', d: 'You are the center of the universe.' },
];

// Old items that were replaced: their rarities, for the one-time trade-in.
const LEGACY = {"common":["cap","beanie","goggles","hoodie","banana","applepet","bg_chalk","headband","soccer","om_1F435","om_1F9A7","om_1F98A","om_1F431","om_1F434","om_1FACE","om_1FACF","om_1F40E","om_1F993","om_1F98C","om_1F9AC","om_1F42E","om_1F437","om_1F417","om_1F40F","om_1F411","om_1F42B","om_1F98F","om_1F99B","om_1F42D","om_1F400","om_1F439","om_1F407","om_1F43F","om_1F987","om_1F43B","om_1F428","om_1F43C","om_1F9A5","om_1F9A6","om_1F9A8","om_1F998","om_1F414","om_1F413","om_1F423","om_1F425","om_1F426","om_1F427","om_1F54A","om_1F985","om_1F986","om_1F989","om_1FAB6","om_1F99A","om_1F99C","om_1FABD","om_1FABF","om_1F438","om_1F40A","om_1F422","om_1F98E","om_1F409","om_1F995","om_1F433","om_1F40B","om_1FACD","om_1F41F","om_1F420","om_1F988","om_1F419","om_1F41A","om_1FAB8","om_1F980","om_1F99E","om_1F990","om_1F991","om_1F9AA","om_1F40C","om_1F98B","om_1F41C","om_1FAB2","om_1F577","om_1F578","om_1F982","om_1FAB0","om_1FAB1","om_1F347","om_1F34D","om_1F96D","om_1F34E","om_1F34F","om_1F352","om_1FAD0","om_1F95D","om_1F35E","om_1F956","om_1F968","om_1F356","om_1F357","om_1F969","om_1F35F","om_1F355","om_1F32D","om_1F959","om_1F373","om_1F957","om_1F37F","om_1F9C8","om_1F96B","om_1F371","om_1F358","om_1F35A","om_1F35C","om_1F362","om_1F365","om_1F96E","om_1F361","om_1F960","om_1F366","om_1F367","om_1F368","om_1F382","om_1F370","om_1F9C1","om_1F967","om_1F36B","om_1F36C","om_1F36E","om_1F37C","om_1F95B","om_2615","om_1FAD6","om_1F375","om_1F378","om_1F37B","om_1F942","om_1F943","om_1FAD7","om_1F9CB","om_1F9C9","om_1F9CA","om_26F2","om_1F305","om_1F307","om_1F309","om_2668","om_1F3A0","om_1F6DD","om_1F3A1","om_1F3A2","om_1F3AA","om_1F6DF","om_26F5","om_26F4","om_1F6A2","om_1F6EB","om_1FA82","om_1F69F","om_1F6A0","om_1F6A1","om_1F312","om_1F313","om_1F314","om_1F315","om_1F316","om_1F319","om_1F31A","om_1F31B","om_1F31C","om_1F321","om_2600","om_1F31D","om_2B50","om_1F31F","om_1F326","om_1F327","om_1F328","om_1F329","om_1F32B","om_1F300","om_1F302","om_2614","om_26A1","om_2744","om_2603","om_26C4","om_2604","om_1F525","om_1F4A7","om_1F386","om_1F387","om_1F9E8","om_1F38A","om_1F38B","om_1F38D","om_1F38E","om_1F9E7","om_1F380","om_1F381","om_1F3AB","om_1F396","om_1F3C6","om_1F947","om_26BE","om_1F3C8","om_1F3C9","om_1F3BE","om_1F94F","om_1F3D1","om_1F94A","om_1F945","om_26F3","om_26F8","om_1F3A3","om_1F93F","om_1F3BD","om_1F3BF","om_1F6F7","om_1F94C","om_1FA80","om_1FA81","om_1F52B","om_1F3B1","om_1F52E","om_1F579","om_1F3B0","om_1F3B2","om_1F9F8","om_1FA85","om_1FAA9","om_1FA86","om_2660","om_2665","om_2663","om_265F","om_1F0CF","om_1F004","om_1F3B4","om_1F453","om_1F576","om_1F97D","om_1F9BA","om_1F454","om_1F455","om_1F456","om_1F9E4","om_1F9E5","om_1F9E6","om_1F457","om_1F458","om_1F97B","om_1FA72","om_1F459","om_1F45A","om_1F45B","om_1F6CD","om_1F45F","om_1F97E","om_1F97F","om_1F451","om_1FA96","om_1F484","om_1F48D","om_1F48E","om_1F3BC","om_1F3B5","om_1F399","om_1F39A","om_1F39B","om_1F3A7","om_1F39E","om_1F4FA","om_1F4F8","om_1F4F9","om_1F4A1","om_1F526","om_1F3EE","om_1F4C2","om_1F5D3","om_1F4CA","om_1F4CC","om_1F4CD","om_1F587","om_1F4D0","om_2702","om_1F5C3","om_1F5D1","om_1F528","om_1FA93","om_26CF","om_2692","om_1F6E1","om_1F527","om_2699","om_2696","om_1FA9D","om_1F9F2","om_1FA8F","om_1F6AC","om_26B0","om_1FAAA","gi_parachute"],"rare":["propeller","apple","tophat","labcoat","jersey","wagon","dummy","bg_space","captain","tracksuit","cartpet","rccar","bg_lake","om_1F412","om_1F436","om_1F415","om_1F429","om_1F43A","om_1F99D","om_1F408","om_1F405","om_1F406","om_1F403","om_1F416","om_1F410","om_1F42A","om_1F999","om_1F992","om_1F9A3","om_1F430","om_1F9AB","om_1F994","om_1F43E","om_1F983","om_1F424","om_1F9A9","om_1F40D","om_1F432","om_1F42C","om_1FABC","om_1F41D","om_1FAB3","om_1F99F","om_1F348","om_1F349","om_1F34B","om_1F34C","om_1F350","om_1F353","om_1F345","om_1FAD2","om_1F950","om_1F95E","om_1F9C7","om_1F953","om_1F354","om_1F96A","om_1F95A","om_1F372","om_1F9C2","om_1F359","om_1F35B","om_1F360","om_1F363","om_1F364","om_1F95F","om_1F961","om_1F36A","om_1F376","om_1F377","om_1F37A","om_1F964","om_1F9C3","om_26FA","om_1F301","om_1F303","om_1F3D9","om_1F488","om_1F6F6","om_1F6A4","om_1F6F3","om_2708","om_1F6E9","om_1F6EC","om_1F4BA","om_1F681","om_1F311","om_1F31E","om_1FA90","om_1F30C","om_2601","om_26C8","om_1F324","om_1F325","om_1F32A","om_1F32C","om_1F308","om_2602","om_1F383","om_1F384","om_2728","om_1F388","om_1F38F","om_1F390","om_1F391","om_1F397","om_1F39F","om_1F948","om_26BD","om_1F94E","om_1F3C0","om_1F3D3","om_1F3F8","om_1F94B","om_1F3AF","om_1F3AE","om_1F9E9","om_1FA71","om_1FA73","om_1F392","om_1FA74","om_1F45E","om_1F462","om_1FAAE","om_1F3A9","om_1F393","om_1F4FF","om_1F3B6","om_1F4FB","om_1F3A5","om_1F4FD","om_1F4FC","om_1F50D","om_1F50E","om_1F56F","om_1F4BC","om_1F4C1","om_1F4C5","om_1F4C6","om_1F4C8","om_1F4C9","om_1F4CE","om_1F4CF","om_1F5C4","om_1F6E0","om_1F5E1","om_2694","om_1FA9A","om_1FA9B","om_1F529","om_1F5DC","om_1F9F0","om_1FA9C","om_26B1","om_1F9FF","om_1FAAC","om_1FAA7","gi_backpack","gi_light_backpack","gi_quiver"],"epic":["wizard","helmet","spacesuit","tux","platypus","moon","bg_sunset","catears","sailor","tom","bg_track","om_1F98D","om_1F9AE","om_1F981","om_1F984","om_1F404","om_1F418","om_1F401","om_1F9A1","om_1F9A2","om_1F9A4","om_1F996","om_1F421","om_1F41B","om_1F41E","om_1F9A0","om_1F34A","om_1F351","om_1FAD3","om_1F96F","om_1F9C0","om_1FAD4","om_1F958","om_1F963","om_1F35D","om_1F369","om_1F36D","om_1F36F","om_1F37E","om_1F379","om_1F304","om_1F306","om_1F6E5","om_1F6F0","om_1F680","om_1F6F8","om_1F318","om_1F320","om_26C5","om_26F1","om_1F389","om_1F3C5","om_1F949","om_1F3D0","om_1F3B3","om_1F3CF","om_1FA84","om_2666","om_1F97C","om_1F9E3","om_1F45D","om_1F460","om_1F461","om_1F9E2","om_1F3A4","om_1FA94","om_1F5C2","om_1F4C7","om_1F4CB","om_1F4A3","om_1FA83","om_1F3F9","om_1F5FF","gi_arrow_wings","gi_cape","gi_cape_armor","gi_curly_wing","gi_feathered_wing","gi_fluffy_wing","gi_heart_wings","gi_liberty_wing","gi_plane_wing","gi_spiky_wing"],"legendary":["wig","crown","gold","satellite","bg_aurora","rockethat","checker","boatpet","om_1F42F","om_1F402","om_1F43D","om_1F997","om_1F32E","om_1F32F","om_1F9C6","om_2693","om_1F317","om_1F30A","om_1F3D2","om_1F94D","om_1FAAD","om_1F45C","om_1FA70","om_1F452","om_26D1","om_1F3AC","om_1F4F7","om_1F5D2","om_1F9AF","om_1F517","om_26D3","gi_fairy_wings"],"mythic":["halo","galaxy","shuttle","om_1F9AD","om_1F965","om_1FAD5","om_1FAA6","gi_angel_wings","gi_jetpack","gi_rocket_thruster"]};
const LEGACY_R = Object.fromEntries(Object.entries(LEGACY).flatMap(([r, ids]) => ids.map(id => [id, r])));

// Add the 3D items, drop the flat game-icons back items (the 3D wings replace them), and set the slot list.
ITEMS3D.forEach(i => { ITEMS.push(i); ITEM[i.id] = i; });
for (let i = ITEMS.length - 1; i >= 0; i--) if (ITEMS[i].slot === 'back' && ITEMS[i].set === 'gi') { delete ITEM[ITEMS[i].id]; ITEMS.splice(i, 1); }
for (const k of Object.keys(SLOTS)) delete SLOTS[k];
Object.assign(SLOTS, { hat: 'Hats', face: 'Face', shirt: 'Shirts', pants: 'Pants', back: 'Back', gear: 'Gear', pet: 'Pets', aura: 'Auras', title: 'Titles', confetti: 'Confetti', arrow: 'Arrow skins' });
const THUMB_SLOTS = ['hat', 'face', 'shirt', 'pants', 'back', 'pet', 'aura', 'gear'];

// One time: old items you owned become chips (same values as a trade-in), and anything worn is taken off.
function migrate3d(s) {
  if (s.v3d) return;
  let chips = 0, count = 0;
  for (const id of Object.keys(s.inv)) {
    if (ITEM[id]) continue;
    const r = LEGACY_R[id], n = s.inv[id] || 0, ns = (s.shinyInv || {})[id] || 0;
    if (r) { chips += (n - ns) * CHIP_VALUE[r] + ns * CHIP_VALUE[r] * 4; count += n; }
    delete s.inv[id]; if (s.shinyInv) delete s.shinyInv[id];
  }
  for (const slot of Object.keys(s.equip)) if (slot !== 'shiny' && !ITEM[s.equip[slot]]) delete s.equip[slot];
  s.chips += chips; s.v3d = { chips, count, seen: !count };
}

// ---------- 3D thumbnails for item tiles ----------
const THUMBS = new Map(), THUMB_Q = [];
const BLANK = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAIBTAA7';
function thumbHTML(it) {
  if (!K3.ok()) return `<div class="ti-fallback" style="--rc:var(${RARITY[it.r].c})">${esc(SLOTS[it.slot] || '').slice(0, 1)}</div>`;
  const src = THUMBS.get(it.id);
  return `<img class="thumb3d${src ? '' : ' loading'}" data-tid="${it.id}" src="${src || BLANK}" alt="${esc(it.name)}" draggable="false">`;
}
function thumbOf(it) {
  if (THUMBS.has(it.id)) return THUMBS.get(it.id);
  let url = BLANK;
  try {
    const obj = AV3.itemObj(it);
    const dir = it.slot === 'back' ? [0.5, 0.25, -1] : it.slot === 'shirt' || it.slot === 'pants' || it.slot === 'aura' ? [0.35, 0.15, 1] : it.slot === 'gear' ? [0.15, 0.05, 1] : [0.6, 0.35, 1];
    if (obj) url = K3.shot(obj, { w: 192, h: 192, dir, fit: it.slot === 'aura' ? 0.85 : 1.02 });
  } catch (e) { console.warn('thumb', it.id, e); }
  THUMBS.set(it.id, url); return url;
}
// Tiles render instantly with a blank image; thumbnails are drawn a few per frame and swapped in.
function pumpThumbs() {
  let n = 0;
  while (THUMB_Q.length && n < 4) {
    const img = THUMB_Q.shift(); if (!img.isConnected || !img.classList.contains('loading')) continue;
    const it = ITEM[img.dataset.tid]; if (!it) continue;
    img.src = thumbOf(it); img.classList.remove('loading'); n++;
  }
  if (THUMB_Q.length) requestAnimationFrame(pumpThumbs);
}
function queueThumbs(root) {
  const imgs = root.querySelectorAll ? root.querySelectorAll('img.thumb3d.loading') : [];
  if (!imgs.length) return; const was = THUMB_Q.length; imgs.forEach(i => THUMB_Q.push(i)); if (!was) requestAnimationFrame(pumpThumbs);
}
new MutationObserver(ms => { for (const m of ms) m.addedNodes.forEach(nd => { if (nd.nodeType === 1) { if (nd.matches && nd.matches('img.thumb3d.loading')) queueThumbs(nd.parentNode); else queueThumbs(nd); } }); })
  .observe(document.documentElement, { childList: true, subtree: true });

// ---------- avatar portraits and live avatars ----------
const PORTRAITS = new Map();
// An <img> of your character (head = just the head). Falls back to the 2D drawing without WebGL.
function avatarHTML(av, eq, crop) {
  if (!K3.ok()) return avatarSVG(av, eq, crop);
  const key = JSON.stringify([av, eq, crop]);
  if (!PORTRAITS.has(key)) {
    if (PORTRAITS.size > 30) PORTRAITS.clear();
    let url = BLANK;
    try {
      const a = AV3.build(av, eq, { pet: crop !== 'head', aura: crop !== 'head', shadow: false });
      a.updateMatrixWorld(true);
      url = crop === 'head' ? K3.shot(a, { w: 128, h: 128, dir: [0.2, 0.1, 1], frame: a.userData.parts.head, fit: 0.95 }) : K3.shot(a, { w: 300, h: 340, dir: [0.35, 0.12, 1], fit: 0.92 });
    } catch (e) { console.warn('portrait', e); }
    PORTRAITS.set(key, url);
  }
  return `<img class="portrait3d" src="${PORTRAITS.get(key)}" alt="${esc((av || {}).name || 'Player')}" draggable="false">`;
}
// A spinning 3D character in `host`. Returns the view (or null without WebGL, after drawing the 2D fallback).
function liveAvatar(host, av, eq, o = {}) {
  if (!K3.ok()) { host.innerHTML = avatarSVG(av, eq); return null; }
  const v = K3.view(host, Object.assign({ cam: [0, 3.2, 13], target: [0, 2.7, 0], fov: 32, auto: 0.4 }, o));
  let a = AV3.build(av, eq); v.root.add(a);
  v.frames.push((dt, t) => { a.userData.tick(t, dt, v.moving || 0); if (v.cheer) { const k = Math.max(0, Math.sin(t * 8)); a.position.y = k * 0.5 * v.cheer; a.userData.parts.armL.rotation.z = 2.6 * v.cheer; a.userData.parts.armR.rotation.z = -2.6 * v.cheer; } });
  v.setLook = (av2, eq2) => { v.root.remove(a); K3.dispose(a); a = AV3.build(av2, eq2); v.root.add(a); };
  v.avatar = () => a;
  return v;
}
