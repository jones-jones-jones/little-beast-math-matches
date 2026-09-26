/* Little Beast's Homework Throwdown: problem generators.
 *
 * Every skill is one generator function that returns a problem:
 *   { skill, prompt (html), visual (html), steps: [...], tip, explain }
 * Step kinds:
 *   { kind:'choice', q, choices:[{v, html, text}], answer:v }
 *   { kind:'num',    q, answer:Number, prefix, unit }
 *
 * To add a new kind of problem from a new test: write a generator, then add it
 * to SKILLS below (pick a category and, optionally, a weight `w`).
 *
 * Math content below is Topic 3 (arrays, the Distributive Property, and
 * multi-step multiplication word problems), from the school Assessment Practice sheet and the Topic 3 Performance Task (School Fair / Bake Sale).
 */
(function (root) {
  'use strict';

  const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = (a) => a[rnd(0, a.length - 1)];
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = rnd(0, i); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  };
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const NAMES = ['Emma', 'Jack', 'Ava', 'Ben', 'Mia', 'Luke', 'Lily', 'Sam', 'Grace', 'Noah', 'Ella', 'Tom']; // short, familiar names

  // ---------- step helpers ----------
  function textChoices(correct, wrongs, n) {
    n = n || 4;
    const seen = new Set([String(correct)]);
    const w = [];
    for (const x of shuffle(wrongs)) {
      const s = String(x);
      if (!seen.has(s)) { seen.add(s); w.push(s); }
      if (w.length >= n - 1) break;
    }
    const list = shuffle([String(correct)].concat(w)).map((v) => ({ v, html: esc(v), text: v }));
    return { choices: list, answer: String(correct) };
  }
  const choiceStep = (q, correct, wrongs, n) => Object.assign({ kind: 'choice', q }, textChoices(correct, wrongs, n));
  const numStep = (q, answer, o) => Object.assign({ kind: 'num', q, answer, prefix: '', unit: '' }, o || {});
  const skipList = (step, count) => Array.from({ length: count }, (_, i) => step * (i + 1)).join(', ');

  function makeDifferent(gen) { // two numbers that are not equal
    let a, b; do { a = gen(); b = gen(); } while (a === b);
    return [a, b];
  }

  // Which number sentence matches a "groups of" story?
  function multExprStep(a, b, P) {
    const lo = Math.min(a, b), hi = Math.max(a, b);
    return choiceStep('Which number sentence matches the story?', `${a} × ${b}`,
      [`${a} + ${b}`, `${hi} − ${lo}`, `${P} ÷ ${a}`, `${b} × ${b}`]);
  }

  // ---------- SVG helper ----------
  // opts.split = number of rows above a dashed line (bottom part drawn in orange);
  // opts.ghost = number of extra empty rows drawn under the array (rows still to be added).
  function dotsSvg(rows, cols, opts) {
    opts = opts || {};
    const g = 30, r = 10, ghost = opts.ghost || 0, split = opts.split || 0, total = rows + ghost;
    const w = cols * g + 8, h = total * g + 8;
    let out = `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true">`;
    for (let i = 0; i < total; i++) for (let j = 0; j < cols; j++) {
      const cx = 4 + g / 2 + j * g, cy = 4 + g / 2 + i * g;
      if (i >= rows) out += `<circle cx="${cx}" cy="${cy}" r="${r - 1}" fill="none" stroke="#d9822b" stroke-width="2.5" stroke-dasharray="4 3"/>`;
      else out += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${split && i >= split ? '#d9822b' : '#0f1b31'}"/>`;
    }
    if (split) out += `<line x1="0" y1="${4 + split * g}" x2="${w}" y2="${4 + split * g}" stroke="#c0392b" stroke-width="3" stroke-dasharray="7 5"/>`;
    return out + '</svg>';
  }

  // =====================================================================
  // STORY SLAM: word problems
  // =====================================================================
  function storyMult() {
    const a = rnd(2, 9), b = rnd(2, 9), P = a * b, n = pick(NAMES);
    const t = pick([
      [`The gym has ${a} rows of chairs. Each row has ${b} chairs. How many chairs are there in all?`, 'chairs'],
      [`Coach Bell has ${a} coolers. Each cooler holds ${b} water bottles. How many water bottles is that in all?`, 'water bottles'],
      [`A trophy case has ${a} shelves. Each shelf holds ${b} trophies. How many trophies fit in the case?`, 'trophies'],
      [`${n} bought ${a} packs of wrestling tape. Each pack has ${b} rolls. How many rolls did ${n} buy?`, 'rolls'],
      [`The team has ${a} mats. ${b} wrestlers practice on each mat. How many wrestlers are practicing?`, 'wrestlers'],
      [`${n} won ${b} matches at each of ${a} tournaments. How many matches did ${n} win in all?`, 'matches'],
      [`Coach Bell cuts ${a} pizzas into ${b} slices each for the team. How many slices is that?`, 'slices'],
    ]);
    return {
      skill: 'story_mult', prompt: t[0],
      steps: [multExprStep(a, b, P), numStep(`Now solve it: ${a} × ${b} = ?`, P, { unit: t[1] })],
      tip: `You have ${a} groups, and each group has ${b}. First pick the number sentence for "${a} groups of ${b}." Then find the answer by skip counting by ${b}, ${a} times: ${skipList(b, a)}.`,
      explain: `${a} groups of ${b} is ${a} × ${b} = ${P}. Skip count by ${b}s: ${skipList(b, a)}.`,
    };
  }

  function storyThreeFactor() {
    const a = rnd(2, 6), b = rnd(2, 5), c = rnd(2, 6), P1 = a * b, P = P1 * c;
    const t = pick([
      { txt: `The wrestling team uses ${a} cups of tape for each wrestler. There are ${b} wrestlers per team, and ${c} teams show up. How many cups of tape are used in all?`, unit: 'cups' },
      { txt: `A snack table has ${a} trays. Each tray has ${b} bags of pretzels, and each bag has ${c} pretzels. How many pretzels are there in all?`, unit: 'pretzels' },
      { txt: `Coach Bell orders water bottles. Each cooler holds ${a} bottles. There are ${b} coolers per team, and ${c} teams come. How many water bottles in all?`, unit: 'water bottles' },
      { txt: `A medal case has ${a} shelves. Each shelf has ${b} rows, and each row holds ${c} medals. How many medals fit in the case?`, unit: 'medals' },
    ]);
    return {
      skill: 'story_three', prompt: t.txt,
      steps: [
        numStep(`First, find ${a} × ${b}.`, P1),
        numStep(`Now multiply that by ${c}. What is the total?`, P, { unit: t.unit }),
      ],
      tip: `Take it one step at a time. First multiply the first two numbers: ${a} × ${b}. Write that answer down. Then multiply that answer by the last number, ${c}, to get the final total.`,
      explain: `${a} × ${b} = ${P1}. ${P1} × ${c} = ${P}.`,
    };
  }

  function storyRate() {
    const rate = rnd(3, 9), h1 = rnd(2, 6), h2 = rnd(1, 5), P1 = rate * h1, P2 = rate * h2, P = P1 + P2;
    const item = pick(['canoe', 'kayak', 'paddleboard', 'tandem kayak']);
    return {
      skill: 'story_rate', prompt: `A ${item} rents for $${rate} each hour. Little Beast's family rented it for ${h1} hours on Saturday and ${h2} hours on Sunday. How much did they spend in all?`,
      steps: [
        numStep(`First, find the cost for Saturday: ${rate} × ${h1}.`, P1, { prefix: '$' }),
        numStep('Now add Sunday\'s cost. What is the total they spent?', P, { prefix: '$' }),
      ],
      tip: `Do one day at a time. Saturday: multiply the rate by the hours, ${rate} × ${h1}. Sunday: multiply the rate by its hours, ${rate} × ${h2}. Then add those two amounts together for the total.`,
      explain: `Saturday: ${rate} × ${h1} = $${P1}. Sunday: ${rate} × ${h2} = $${P2}. $${P1} + $${P2} = $${P}.`,
    };
  }

  // =====================================================================
  // ARRAYS & PROPERTIES
  // =====================================================================
  function arrayTotal() {
    const r = rnd(3, 9), c = rnd(3, 9), P = r * c;
    if (Math.random() < 0.5) {
      return {
        skill: 'array_total', prompt: 'Look at the array. How many dots are there in all?',
        visual: `<div class="viz">${dotsSvg(r, c)}</div>`,
        steps: [numStep('How many dots in all?', P, { unit: 'dots' })],
        tip: `Count how many dots are in one row — that's ${c}. Count how many rows there are — that's ${r}. Multiply ${r} × ${c} to get the total.`,
        explain: `${r} rows of ${c}: ${r} × ${c} = ${P}.`,
      };
    }
    return {
      skill: 'array_total', prompt: 'Which multiplication sentence matches the array?',
      visual: `<div class="viz">${dotsSvg(r, c)}</div>`,
      steps: [choiceStep('Pick the matching sentence.', `${r} × ${c} = ${P}`,
        [`${r} + ${c} = ${r + c}`, `${r} × ${c} = ${P + r}`, `${r + 1} × ${c} = ${(r + 1) * c}`])],
      tip: `Count the rows (${r}) and the dots in each row (${c}). The matching sentence multiplies those two numbers: ${r} × ${c}. Check each choice — only one actually equals ${r} × ${c} = ${P}.`,
      explain: `${r} rows and ${c} columns: ${r} × ${c} = ${P}.`,
    };
  }

  function arrayBreakApart() {
    const R = rnd(4, 9), C = rnd(3, 9);
    let R1; do { R1 = rnd(1, R - 1); } while (R1 === R - R1);
    const R2 = R - R1, P = R * C, c1 = Math.max(C - 1, 1);
    const correct = `${R1} × ${C} and ${R2} × ${C}`;
    const wrongs = [
      `${R} × ${C} and ${R} × 1`,
      `${R2} × ${C} and ${R2} × ${C}`,
      `${R1} × ${c1} and ${R2} × ${C}`,
    ];
    return {
      skill: 'array_break', prompt: 'This array can be split into two smaller arrays. Which two expressions can be used to find the total number of dots?',
      visual: `<div class="viz">${dotsSvg(R, C)}</div>`,
      steps: [choiceStep('Pick the two expressions.', correct, wrongs)],
      tip: `The ${R} rows are split into two smaller groups: ${R1} rows and ${R2} rows. Every row still has ${C} dots. So the two matching expressions are ${R1} × ${C} for one part and ${R2} × ${C} for the other part.`,
      explain: `${R1} rows of ${C} plus ${R2} rows of ${C} is ${R1} × ${C} + ${R2} × ${C} = ${R1 * C} + ${R2 * C} = ${P}, the same as ${R} × ${C}.`,
    };
  }

  function arrayCombine() {
    const C = rnd(3, 9), R1 = rnd(2, 6), R2 = rnd(2, 6), R = R1 + R2;
    let badProd = R1 * R2; if (badProd === R) badProd += 1;
    const correct = `${R} × ${C}`;
    const wrongs = [`${badProd} × ${C}`, `${R} × ${C + 1}`, `${R1} × ${R2}`];
    return {
      skill: 'array_combine', prompt: `A big array was made by putting together a ${R1} × ${C} array and a ${R2} × ${C} array. What is the large array?`,
      steps: [choiceStep('Pick the large array.', correct, wrongs)],
      tip: `Both arrays have ${C} columns, so the columns don't change. Just add the rows together: ${R1} + ${R2} = ${R}. That makes the large array ${R} × ${C}.`,
      explain: `${R1} rows plus ${R2} rows is ${R} rows, and the columns stay ${C}: the large array is ${R} × ${C}.`,
    };
  }

  function arrayCommute() {
    const [R, C] = makeDifferent(() => rnd(3, 9)), P = R * C;
    const correct = `${R} × ${C} and ${C} × ${R}`;
    const wrongs = [
      `${R} × ${C} and ${R} × ${R}`,
      `${R} × ${R} and ${C} × ${C}`,
      `${R + 1} × ${C} and ${C} × ${R}`,
    ];
    return {
      skill: 'array_commute', prompt: 'Look at the array. Which two facts both give the total number of dots?',
      visual: `<div class="viz">${dotsSvg(R, C)}</div>`,
      steps: [choiceStep('Pick the two facts.', correct, wrongs)],
      tip: `You can read this array two ways. Going by rows first: ${R} × ${C}. Going by columns first: ${C} × ${R}. Both are true for the same array, just flipped around.`,
      explain: `${R} rows of ${C} is ${R} × ${C} = ${P}. Turned the other way, ${C} rows of ${R} is ${C} × ${R} = ${P}. Same total either way.`,
    };
  }

  // =====================================================================
  // DISTRIBUTIVE PROPERTY
  // =====================================================================
  function distributiveCheck() {
    const a = rnd(2, 9), b = rnd(4, 9), c = rnd(1, b - 1), d = b - c;
    let shownD = d, shownA2 = a;
    if (Math.random() < 0.5) { // make it wrong: either the split doesn't add up, or the second factor doesn't match
      if (Math.random() < 0.5) { let d2; do { d2 = rnd(1, b - 1); } while (d2 === d); shownD = d2; }
      else shownA2 = a + 1;
    }
    const leftVal = a * b, rightVal = a * c + shownA2 * shownD;
    const correct = leftVal === rightVal ? 'Yes' : 'No';
    const shown = `${a} × ${b} = (${a} × ${c}) + (${shownA2} × ${shownD})`;
    return {
      skill: 'dist_check', prompt: 'Is the Distributive Property being used correctly?',
      visual: `<div class="bigeq small">${shown}</div>`,
      steps: [choiceStep('Yes or No?', correct, [correct === 'Yes' ? 'No' : 'Yes'], 2)],
      tip: `Work out both sides and compare them. Left side: ${a} × ${b} = ${leftVal}. Right side: multiply what's inside each set of parentheses, then add the two results together. Do the left side and the right side end up the same number?`,
      explain: correct === 'Yes'
        ? `${a} × ${c} = ${a * c} and ${a} × ${d} = ${a * d}. ${a * c} + ${a * d} = ${leftVal}, which matches ${a} × ${b}.`
        : `${a} × ${c} = ${a * c} and ${shownA2} × ${shownD} = ${shownA2 * shownD}. ${a * c} + ${shownA2 * shownD} = ${rightVal}, which does not match ${a} × ${b} = ${leftVal}.`,
    };
  }

  function factsForProduct() {
    const a = rnd(3, 9), b = rnd(3, 9), c = rnd(1, a - 1), d = a - c, P = a * b;
    const correct = `${c} × ${b} and ${d} × ${b}`;
    const wrongs = [
      `${c} × ${b} and ${d + 1} × ${b}`,
      `${a} × ${b - 1} and ${a} × 1`,
      `${c} × ${c} and ${d} × ${d}`,
    ];
    return {
      skill: 'facts_product', prompt: `Which pair of facts can you use to find ${a} × ${b}?`,
      visual: `<div class="bigeq">${a} × ${b} = ?</div>`,
      steps: [choiceStep('Pick the matching pair of facts.', correct, wrongs)],
      tip: `Split ${a} into two smaller numbers that add back up to ${a} — like ${c} and ${d}. Multiply each part by ${b} (${c} × ${b} and ${d} × ${b}), then add those two answers together. That's the pair of facts you're looking for.`,
      explain: `${c} × ${b} = ${c * b} and ${d} × ${b} = ${d * b}. ${c * b} + ${d * b} = ${P}, which is ${a} × ${b}.`,
    };
  }

  function tensAsFives() { // a bigger fact split into two equal smaller facts (10s as 5s most often)
    const f = pick([10, 10, 10, 8, 8, 6, 4]), h = f / 2, n = rnd(2, 9), P = f * n, H = h * n;
    const correct = `${h} × ${n} and ${h} × ${n}`;
    const wrongs = [
      `${h} × ${n} and ${h} × ${n + 1}`,
      `${n + 1} × ${n + 1} and ${n + 1} × ${n + 1}`,
      `${f} × ${n} and 1 × ${n}`,
      `${h} × ${n} and ${h + 1} × ${n}`,
    ];
    return {
      skill: 'tens_fives',
      prompt: f === 10 ? `Jeff says a 10s fact can be broken into two 5s facts. Which two 5s facts match 10 × ${n}?`
        : `Jeff says a ${f}s fact can be broken into two ${h}s facts. Which two ${h}s facts match ${f} × ${n}?`,
      visual: `<div class="bigeq">${f} × ${n} = ?</div>`,
      steps: [choiceStep(`Pick the two ${h}s facts.`, correct, wrongs)],
      tip: `Remember ${f} is ${h} + ${h}. So ${f} × ${n} is the same as ${h} × ${n} added to itself. Work out ${h} × ${n} = ${H} once, then double it to check: ${H} + ${H} = ${P}.`,
      explain: `${h} × ${n} = ${H}. ${H} + ${H} = ${P}, which is ${f} × ${n}.`,
    };
  }

  // =====================================================================
  // TOPIC 3 PERFORMANCE TASK: growing / splitting arrays, table stories
  // =====================================================================
  const ARRAY_SCENES = [
    (n, R, C) => ({ txt: `${n} sets up chairs for the school band in a ${R} × ${C} array.`, unit: 'chairs' }),
    (n, R, C) => ({ txt: `Coach Bell lines up wrestling shoes in a ${R} × ${C} array.`, unit: 'shoes' }),
    (n, R, C) => ({ txt: `${n} puts trophies on shelves in a ${R} × ${C} array.`, unit: 'trophies' }),
    (n, R, C) => ({ txt: `The team sets out cones in a ${R} × ${C} array.`, unit: 'cones' }),
  ];

  // "Add to the array to show how the new array will look."
  function arrayGrow() {
    const C = rnd(3, 9), R = rnd(2, 5);
    let R2; if (Math.random() < 0.5 && R * 2 <= 9) R2 = R * 2; else R2 = R + rnd(1, Math.min(4, 9 - R));
    const add = R2 - R, n = pick(NAMES), sc = pick(ARRAY_SCENES)(n, R, C), P = R2 * C;
    return {
      skill: 'array_grow', prompt: `${sc.txt} ${n} wants a ${R2} × ${C} array instead. The empty dotted circles show where the new rows go.`,
      visual: `<div class="viz">${dotsSvg(R, C, { ghost: add })}<div class="cap">${R} × ${C} now, ${R2} × ${C} wanted</div></div>`,
      steps: [
        numStep(`How many rows does ${n} add?`, add, { unit: 'rows' }),
        numStep(`How many ${sc.unit} are in the new ${R2} × ${C} array?`, P, { unit: sc.unit }),
      ],
      tip: `The columns stay ${C}. Count the rows you have (${R}) and the rows you want (${R2}); the difference is how many rows to add. Then multiply the new number of rows by ${C}.`,
      explain: `${R2} − ${R} = ${add} more rows. The new array is ${R2} × ${C} = ${P}.`,
    };
  }

  // "Draw a line to split the array. Write a fact for each new array. Use the facts to find the total."
  function arraySplitTotal() {
    const R = rnd(4, 9), C = rnd(3, 9), R1 = rnd(1, R - 1), R2 = R - R1, P = R * C;
    const unit = pick(['chairs', 'dots', 'cones', 'muffins']);
    return {
      skill: 'array_split', prompt: 'The line splits the array into two smaller arrays. Use a multiplication fact for each one to find the total.',
      visual: `<div class="viz">${dotsSvg(R, C, { split: R1 })}<div class="cap">${R1} rows on top, ${R2} rows on the bottom</div></div>`,
      steps: [
        numStep(`Top array: ${R1} × ${C} = ?`, R1 * C),
        numStep(`Bottom array: ${R2} × ${C} = ?`, R2 * C),
        numStep(`Add the two facts. How many ${unit} in all?`, P, { unit }),
      ],
      tip: `Each part is its own array. Multiply the rows in that part by ${C}. Then add the two answers to get the total for the whole array.`,
      explain: `${R1} × ${C} = ${R1 * C} and ${R2} × ${C} = ${R2 * C}. ${R1 * C} + ${R2 * C} = ${P}, the same as ${R} × ${C}.`,
    };
  }

  // "Break the array into 2 arrays that look the same. Use the half fact to find the total."
  function arrayHalves() {
    let R, C; do { R = pick([4, 6, 8]); C = rnd(3, 9); } while (R === C);
    const half = R / 2, H = half * C, P = R * C, n = pick(NAMES);
    const unit = pick(['muffins', 'chairs', 'cookies', 'trophies']);
    const correct = `${half} × ${C}`;
    return {
      skill: 'array_halves', prompt: `${n} has a ${R} × ${C} array of ${unit}. ${n} breaks it into 2 arrays that look the same, and knows ${half} × ${C} = ${H}.`,
      visual: `<div class="viz">${dotsSvg(R, C, { split: half })}<div class="cap">Two arrays that look the same</div></div>`,
      steps: [
        choiceStep('What size is each smaller array?', correct, [`${R} × ${half}`, `${half} × ${R}`, `${C} × ${C}`, `${R} × ${C}`]),
        numStep(`Two arrays that look the same. How many ${unit} in all?`, P, { unit }),
      ],
      tip: `Half of the ${R} rows is ${half} rows, so each smaller array is ${half} × ${C}. Both arrays are the same, so the total is that fact twice: ${H} + ${H}.`,
      explain: `Each smaller array is ${half} × ${C} = ${H}. ${H} + ${H} = ${P}, which is ${R} × ${C}.`,
    };
  }

  // The "Bake Sale" table from the Performance Task.
  const BAKE = [
    { name: 'Blueberry Muffins', unit: 'muffins' },
    { name: 'Strawberry Tarts', unit: 'tarts' },
    { name: 'Granola Bars', unit: 'granola bars' },
  ];
  function bakeTable(rows) {
    const tr = rows.map((x) => `<tr><td>${x.name}</td><td>${x.trays}</td><td>${x.per}</td><td>$${x.cost}</td></tr>`).join('');
    return `<div class="viz"><table class="ftable bake"><caption>Bake Sale</caption>` +
      `<tr><th>Baked Goods</th><th>Number of Trays</th><th>Number on Each Tray</th><th>Cost per Tray</th></tr>${tr}</table></div>`;
  }

  function storyBake() {
    const rows = shuffle(BAKE).map((b) => ({ name: b.name, unit: b.unit, trays: rnd(3, 8), per: rnd(4, 9), cost: rnd(2, 6) }));
    const x = pick(rows), variant = pick(['twice', 'friends', 'count']);
    const lead = 'Use the Bake Sale table. ';
    if (variant === 'twice') { // some trays in the morning and the same number in the afternoon
      const half = rnd(2, 4), T = half * 2, P = T * x.cost;
      x.trays = T;
      return {
        skill: 'story_table', prompt: `${lead}Ben sells ${half} trays of ${x.name.toLowerCase()} in the morning and ${half} trays in the afternoon. How much money does this raise?`,
        visual: bakeTable(rows),
        steps: [
          numStep('How many trays does Ben sell in all?', T, { unit: 'trays' }),
          numStep(`Now use the cost per tray. How much money is raised?`, P, { prefix: '$' }),
        ],
        tip: `First add the morning and afternoon trays: ${half} + ${half}. Then look at the "Cost per Tray" column for ${x.name.toLowerCase()} and multiply the trays by it.`,
        explain: `${half} + ${half} = ${T} trays. ${T} × $${x.cost} = $${P}.`,
      };
    }
    if (variant === 'friends') { // each friend buys the same number of trays; compare to a total
      const k = rnd(2, 4), T = k * 2, P = T * x.cost;
      let X; do { X = P + pick([-1, 1]) * rnd(2, 6); } while (X < 5);
      const agree = P > X;
      return {
        skill: 'story_table', prompt: `${lead}Two friends each bought ${k} trays of ${x.name.toLowerCase()}. Ben says they spent more than $${X} in total. Do you agree?`,
        visual: bakeTable(rows),
        steps: [
          numStep('How many trays did the two friends buy in all?', T, { unit: 'trays' }),
          numStep('How much did they spend in total?', P, { prefix: '$' }),
          choiceStep(`Ben says more than $${X}. Do you agree?`, agree ? 'Yes, I agree' : 'No, I disagree', [agree ? 'No, I disagree' : 'Yes, I agree'], 2),
        ],
        tip: `Two friends each bought ${k} trays, so add ${k} + ${k} for the trays. Multiply by the cost per tray in the table. Then compare your total to $${X}.`,
        explain: `${k} + ${k} = ${T} trays. ${T} × $${x.cost} = $${P}. $${P} is ${agree ? 'more' : 'not more'} than $${X}, so ${agree ? 'Ben is right' : 'Ben is not right'}.`,
      };
    }
    const T = x.trays, P = T * x.per; // how many baked goods in all
    return {
      skill: 'story_table', prompt: `${lead}How many ${x.unit} does Ben have to sell in all?`,
      visual: bakeTable(rows),
      steps: [
        choiceStep('Which number sentence uses the right numbers from the table?', `${T} × ${x.per}`,
          [`${T} × $${x.cost}`, `${x.per} × $${x.cost}`, `${T} + ${x.per}`]),
        numStep(`Solve it: ${T} × ${x.per} = ?`, P, { unit: x.unit }),
      ],
      tip: `Find the row for ${x.name.toLowerCase()}. Multiply "Number of Trays" by "Number on Each Tray." Don't use the cost. That column is for money.`,
      explain: `${T} trays with ${x.per} on each tray: ${T} × ${x.per} = ${P} ${x.unit}.`,
    };
  }

  // =====================================================================
  // Catalog
  // =====================================================================
  const CATS = {
    story: { name: 'Story Slam', emoji: '📖', blurb: 'Word problems', subject: 'math' },
    array: { name: 'Arrays & Properties', emoji: '🔲', blurb: 'Arrays, breaking apart, combining', subject: 'math' },
    dist: { name: 'Distributive Property', emoji: '➗', blurb: 'Break apart facts, check equations', subject: 'math' },
  };

  const SKILLS = {
    story_mult: { name: 'Multiplication stories', cat: 'story', gen: storyMult },
    story_three: { name: 'Multi-step stories', cat: 'story', gen: storyThreeFactor },
    story_rate: { name: 'Rental & money stories', cat: 'story', gen: storyRate },
    story_table: { name: 'Table stories (Bake Sale)', cat: 'story', gen: storyBake },
    array_total: { name: 'Array totals', cat: 'array', gen: arrayTotal },
    array_break: { name: 'Break apart arrays', cat: 'array', gen: arrayBreakApart },
    array_combine: { name: 'Combine arrays', cat: 'array', gen: arrayCombine },
    array_commute: { name: 'Turn the array around', cat: 'array', gen: arrayCommute },
    array_grow: { name: 'Grow the array', cat: 'array', gen: arrayGrow },
    array_split: { name: 'Split the array, add the facts', cat: 'array', gen: arraySplitTotal },
    array_halves: { name: 'Two arrays that look the same', cat: 'array', gen: arrayHalves },
    dist_check: { name: 'Check the equation', cat: 'dist', gen: distributiveCheck },
    facts_product: { name: 'Facts for a product', cat: 'dist', gen: factsForProduct },
    tens_fives: { name: 'Split a fact in half', cat: 'dist', gen: tensAsFives },
  };

  function makeProblem(skillId) {
    const p = SKILLS[skillId].gen();
    p.cat = SKILLS[skillId].cat;
    return p;
  }

  // ---------- word lists (spelling + vocabulary) are filled in by the app ----------
  const words = { spelling: [], vocab: [], miss: {} };
  const env = { speech: false };
  function setWords(w) {
    words.spelling = (w && w.spelling) || []; words.vocab = (w && w.vocab) || []; words.miss = (w && w.miss) || {};
  }

  const subjectOf = (id) => CATS[SKILLS[id].cat].subject;
  function idsFor(scope) {
    let ids = Object.keys(SKILLS).filter((id) => !SKILLS[id].avail || SKILLS[id].avail());
    if (scope === 'math') ids = ids.filter((id) => subjectOf(id) === 'math');
    else if (scope !== 'mix') ids = ids.filter((id) => SKILLS[id].cat === scope);
    return ids;
  }
  const hasSkills = (scope) => idsFor(scope).length > 0;

  // Weighted skill pick. scope = 'mix' (every subject), 'math' (all math), or one category key.
  // Word problems get extra weight, and skills he misses more often come up more often.
  function pickSkill(scope, stats, avoid, ctx) {
    stats = stats || {};
    let ids = idsFor(scope);
    if (scope === 'mix') { // math 60%, spelling 20%, vocabulary 20% (renormalized for whatever has content)
      const W = { math: 0.6, spell: 0.2, vocab: 0.2 };
      const subs = Array.from(new Set(ids.map(subjectOf)));
      let r = Math.random() * subs.reduce((t, x) => t + W[x], 0), chosen = subs[subs.length - 1];
      for (const x of subs) { r -= W[x]; if (r <= 0) { chosen = x; break; } }
      ids = ids.filter((id) => subjectOf(id) === chosen);
    }
    // spelling skills belong to a stage (0 missing letters, 1 hear + pick, 2 hear + spell); math skills have none
    if (ctx && ctx.stage != null) {
      const staged = ids.filter((id) => SKILLS[id].stage === undefined || SKILLS[id].stage === ctx.stage);
      if (staged.length) ids = staged;
    }
    if (!ids.length) return null;
    const weights = ids.map((id) => {
      let w = SKILLS[id].w || 1;
      if ((scope === 'mix' || scope === 'math') && SKILLS[id].cat === 'story') w *= 2.2;
      const st = stats[id];
      if (st && st.a >= 3) w *= 1 + (1 - st.c / st.a) * 2;
      if (id === avoid) w *= 0.15;
      return w;
    });
    let r = Math.random() * weights.reduce((x, y) => x + y, 0);
    for (let i = 0; i < ids.length; i++) { r -= weights[i]; if (r <= 0) return ids[i]; }
    return ids[ids.length - 1];
  }

  const api = { CATS, SKILLS, makeProblem, pickSkill, hasSkills, words, env, setWords };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LBM = api;
})(typeof window !== 'undefined' ? window : globalThis);
