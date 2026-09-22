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
 * multi-step multiplication word problems), from the school Assessment Practice sheet.
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
  function dotsSvg(rows, cols) {
    const g = 30, r = 10;
    let out = `<svg viewBox="0 0 ${cols * g + 8} ${rows * g + 8}" width="${cols * g + 8}" height="${rows * g + 8}" aria-hidden="true">`;
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
      out += `<circle cx="${4 + g / 2 + j * g}" cy="${4 + g / 2 + i * g}" r="${r}" fill="#0f1b31"/>`;
    }
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

  function tensAsFives() {
    const n = rnd(2, 9), P = 10 * n;
    const correct = `5 × ${n} and 5 × ${n}`;
    const wrongs = [
      `5 × ${n} and 5 × ${n + 1}`,
      `${n + 1} × ${n + 1} and ${n + 1} × ${n + 1}`,
      `10 × ${n} and 1 × ${n}`,
    ];
    return {
      skill: 'tens_fives', prompt: `Jeff says a 10s fact can be broken into two 5s facts. Which two 5s facts match 10 × ${n}?`,
      visual: `<div class="bigeq">10 × ${n} = ?</div>`,
      steps: [choiceStep('Pick the two 5s facts.', correct, wrongs)],
      tip: `Remember 10 is 5 + 5. So 10 × ${n} is the same as 5 × ${n} added to itself. Work out 5 × ${n} = ${5 * n} once, then double it to check: ${5 * n} + ${5 * n} = ${10 * n}.`,
      explain: `5 × ${n} = ${5 * n}. ${5 * n} + ${5 * n} = ${P}, which is 10 × ${n}.`,
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
    array_total: { name: 'Array totals', cat: 'array', gen: arrayTotal },
    array_break: { name: 'Break apart arrays', cat: 'array', gen: arrayBreakApart },
    array_combine: { name: 'Combine arrays', cat: 'array', gen: arrayCombine },
    array_commute: { name: 'Turn the array around', cat: 'array', gen: arrayCommute },
    dist_check: { name: 'Check the equation', cat: 'dist', gen: distributiveCheck },
    facts_product: { name: 'Facts for a product', cat: 'dist', gen: factsForProduct },
    tens_fives: { name: '10s facts as 5s facts', cat: 'dist', gen: tensAsFives },
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
