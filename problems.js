/* Little Beast Math Matches: problem generators.
 *
 * Every skill is one generator function that returns a problem:
 *   { skill, prompt (html), visual (html), steps: [...], tip, explain }
 * Step kinds:
 *   { kind:'choice', q, choices:[{v, html, text}], answer:v }
 *   { kind:'num',    q, answer:Number, prefix, unit }
 *
 * To add a new kind of problem from a new test: write a generator, then add it
 * to SKILLS below (pick a category and, optionally, a weight `w`).
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
  const pad2 = (n) => String(n).padStart(2, '0');

  const NAMES = ['Maya', 'Diego', 'Jaylen', 'Priya', 'Owen', 'Sam', 'Tessa', 'Marcus', 'Lena', 'Ravi'];
  const pickTwo = () => { const a = pick(NAMES); let b; do { b = pick(NAMES); } while (b === a); return [a, b]; };

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

  // ---------- SVG / visual helpers ----------
  const FILL = '#2a4fd6';

  function pieSvg(n, s, size) {
    size = size || 104;
    const r = size / 2 - 4, c = size / 2;
    let out = `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">`;
    for (let i = 0; i < n; i++) {
      const a0 = -Math.PI / 2 + (2 * Math.PI * i) / n;
      const a1 = -Math.PI / 2 + (2 * Math.PI * (i + 1)) / n;
      const x0 = (c + r * Math.cos(a0)).toFixed(1), y0 = (c + r * Math.sin(a0)).toFixed(1);
      const x1 = (c + r * Math.cos(a1)).toFixed(1), y1 = (c + r * Math.sin(a1)).toFixed(1);
      out += `<path d="M${c} ${c} L${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1} Z" fill="${i < s ? FILL : '#fff'}" stroke="#222" stroke-width="2"/>`;
    }
    return out + '</svg>';
  }

  function barSvg(n, s) {
    const w = 132, h = 40, cw = w / n;
    let out = `<svg viewBox="0 0 ${w + 4} ${h + 4}" width="${w + 4}" height="${h + 4}" aria-hidden="true">`;
    for (let i = 0; i < n; i++) {
      out += `<rect x="${2 + i * cw}" y="2" width="${cw}" height="${h}" fill="${i < s ? FILL : '#fff'}" stroke="#222" stroke-width="2"/>`;
    }
    return out + '</svg>';
  }

  function dotsSvg(rows, cols) {
    const g = 30, r = 10;
    let out = `<svg viewBox="0 0 ${cols * g + 8} ${rows * g + 8}" width="${cols * g + 8}" height="${rows * g + 8}" aria-hidden="true">`;
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) {
      out += `<circle cx="${4 + g / 2 + j * g}" cy="${4 + g / 2 + i * g}" r="${r}" fill="#0f1b31"/>`;
    }
    return out + '</svg>';
  }

  function polygonSvg(n, size) {
    size = size || 170;
    const c = size / 2, R = size / 2 - 12, rot = Math.random() * Math.PI * 2;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const ang = rot + (2 * Math.PI * i) / n + (Math.random() - 0.5) * 0.12;
      const rad = R * (0.94 + Math.random() * 0.1);
      pts.push((c + rad * Math.cos(ang)).toFixed(1) + ',' + (c + rad * Math.sin(ang)).toFixed(1));
    }
    return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true"><polygon points="${pts.join(' ')}" fill="#e9eefc" stroke="#0f1b31" stroke-width="4" stroke-linejoin="round"/></svg>`;
  }

  function clockSvg(h, m, size) {
    size = size || 210;
    const c = size / 2, R = size / 2 - 6;
    const pt = (deg, len) => {
      const t = (deg * Math.PI) / 180;
      return [(c + len * Math.sin(t)).toFixed(1), (c - len * Math.cos(t)).toFixed(1)];
    };
    let s = `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="analog clock">`;
    s += `<circle cx="${c}" cy="${c}" r="${R}" fill="#fff" stroke="#0f1b31" stroke-width="5"/>`;
    for (let i = 0; i < 60; i++) {
      const len = i % 5 === 0 ? 10 : 5;
      const a = pt(i * 6, R - 3), b = pt(i * 6, R - 3 - len);
      s += `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="#0f1b31" stroke-width="${i % 5 === 0 ? 2.5 : 1.2}"/>`;
    }
    for (let i = 1; i <= 12; i++) {
      const p = pt(i * 30, R - 26);
      s += `<text x="${p[0]}" y="${p[1]}" text-anchor="middle" dominant-baseline="central" font-family="Arial,sans-serif" font-weight="700" font-size="19" fill="#0f1b31">${i}</text>`;
    }
    const hp = pt(((h % 12) + m / 60) * 30, R * 0.5), mp = pt(m * 6, R * 0.78);
    s += `<line x1="${c}" y1="${c}" x2="${hp[0]}" y2="${hp[1]}" stroke="#0f1b31" stroke-width="8" stroke-linecap="round"/>`;
    s += `<line x1="${c}" y1="${c}" x2="${mp[0]}" y2="${mp[1]}" stroke="#c8323c" stroke-width="4.5" stroke-linecap="round"/>`;
    s += `<circle cx="${c}" cy="${c}" r="6" fill="#0f1b31"/></svg>`;
    return s;
  }

  const article = (word) => (/^[aeiou]/i.test(word) ? 'an ' : 'a ') + word;
  const frac = (a, b) => `<span class="frac"><span>${a}</span><span>${b}</span></span>`;

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
      [`A garden outside the gym has ${a} rows of tomato plants. Each row has ${b} plants. How many plants are there?`, 'plants'],
      [`Coach Bell cuts ${a} pizzas into ${b} slices each for the team. How many slices is that?`, 'slices'],
    ]);
    return {
      skill: 'story_mult', prompt: t[0],
      steps: [multExprStep(a, b, P), numStep(`Now solve it: ${a} × ${b} = ?`, P, { unit: t[1] })],
      tip: 'Every group is the same size, so this is a multiplication story. Pick the number sentence first, then skip count or use a fact you know.',
      explain: `${a} groups of ${b} is ${a} × ${b} = ${P}. Skip count by ${b}s: ${skipList(b, a)}.`,
    };
  }

  function storyDiv() {
    const a = rnd(2, 9), b = rnd(2, 9), P = a * b, n = pick(NAMES);
    const t = pick([
      { txt: `Coach Bell has ${P} water bottles. Each cooler holds ${b} bottles. How many coolers does Coach need?`, d: b, ans: a, unit: 'coolers' },
      { txt: `${n} has ${P} wrestling stickers. ${n} puts ${b} stickers on each page. How many pages does ${n} fill?`, d: b, ans: a, unit: 'pages' },
      { txt: `The gym needs to seat ${P} fans. Each row seats ${b} fans. How many rows are needed?`, d: b, ans: a, unit: 'rows' },
      { txt: `${P} wrestlers split into ${a} equal teams. How many wrestlers are on each team?`, d: a, ans: b, unit: 'wrestlers' },
      { txt: `${P} medals are shared equally by ${a} teams. How many medals does each team get?`, d: a, ans: b, unit: 'medals' },
      { txt: `Jaxson has ${P} daisies to plant in window boxes. Each window box holds ${b} flowers. How many window boxes does he need?`, d: b, ans: a, unit: 'window boxes' },
    ]);
    return {
      skill: 'story_div', prompt: t.txt,
      steps: [
        choiceStep('Which number sentence matches the story?', `${P} ÷ ${t.d}`, [`${P} × ${t.d}`, `${P} − ${t.d}`, `${P} + ${t.d}`]),
        numStep(`Now solve it: ${P} ÷ ${t.d} = ?`, t.ans, { unit: t.unit }),
      ],
      tip: `You are splitting ${P} into equal groups, so it is division. Ask yourself: ${t.d} × what number = ${P}?`,
      explain: `${P} ÷ ${t.d}: think ${t.d} × ? = ${P}. Since ${t.d} × ${t.ans} = ${P}, the answer is ${t.ans}.`,
    };
  }

  function storyTwoStep() {
    const x = rnd(3, 9), y = rnd(3, 9), tot = x + y, k = rnd(1, 5), u = tot - k, n = pick(NAMES);
    const t = pick([
      { txt: `Coach Bell packed ${x} red singlets and ${y} blue singlets. Only ${u} singlets fit in the bag. How many singlets did NOT fit?`, unit: k === 1 ? 'singlet' : 'singlets' },
      { txt: `${n} has ${x} gold medals and ${y} silver medals. ${n} hangs ${u} medals on the wall. How many medals are NOT on the wall?`, unit: k === 1 ? 'medal' : 'medals' },
    ]);
    return {
      skill: 'story_two', prompt: t.txt,
      steps: [numStep('Solve the problem.', k, { unit: t.unit })],
      tip: 'This one takes two steps in your head. First find how many there are in all. Then take away the number that were used.',
      explain: `First add: ${x} + ${y} = ${tot}. Then subtract: ${tot} − ${u} = ${k}.`,
    };
  }

  function storyMatch() {
    const [a, b] = makeDifferent(() => rnd(2, 9)), P = a * b, n = pick(NAMES);
    return {
      skill: 'story_match',
      prompt: `${n} lined up ${P} folding chairs in a rectangle. Which sentence could ${n} use to describe how the chairs were set up?`,
      steps: [choiceStep('Pick the sentence that makes exactly ' + P + ' chairs.', `${a} rows of ${b} chairs`,
        [`${P} rows of ${b} chairs`, `${a} rows of ${a} chairs`, `${b} rows of ${b} chairs`])],
      tip: `Multiply the rows by the chairs in each row. The product has to be exactly ${P}.`,
      explain: `${a} rows of ${b} chairs is ${a} × ${b} = ${P}. The other choices multiply to a different number.`,
    };
  }

  function storyCompare() {
    const [n1, n2] = pickTwo(), [a, b] = makeDifferent(() => rnd(3, 9)), P = a * b;
    const same = Math.random() < 0.5;
    let r2, c2;
    if (same) { r2 = b; c2 = a; } else { r2 = b; c2 = a + 1; }
    const P2 = r2 * c2;
    const correct = P === P2 ? 'They have the same amount' : (P2 > P ? n2 : n1);
    return {
      skill: 'story_compare',
      prompt: `${n1} sets out mats in ${a} rows and ${b} columns. ${n2} sets out mats in ${r2} rows and ${c2} columns. Who has more mats?`,
      steps: [choiceStep('Pick the best answer.', correct, [n1, n2, 'They have the same amount'], 3)],
      tip: 'Multiply rows by columns for each wrestler, then compare the two products.',
      explain: same
        ? `${a} × ${b} = ${P} and ${b} × ${a} = ${P}. Switching the order of the factors does not change the product.`
        : `${n1}: ${a} × ${b} = ${P}. ${n2}: ${r2} × ${c2} = ${P2}. ${P2 > P ? n2 : n1} has more.`,
    };
  }

  function storyMoney() {
    const a = rnd(2, 9), n = pick(NAMES);
    let t;
    if (Math.random() < 0.5) {
      const p = rnd(3, 9);
      t = { txt: `Tickets to the wrestling tournament cost $${p} for each adult. ${a} adults go. What is the total cost of their tickets?`, per: p, prefix: '$', unit: '', what: `$${p}` };
    } else {
      const coin = pick([['nickel', 5], ['dime', 10]]);
      t = { txt: `${n} has ${a} ${coin[0]}s in a pocket. A ${coin[0]} is worth ${coin[1]} cents. How many cents does ${n} have?`, per: coin[1], prefix: '', unit: 'cents', what: `${coin[1]}` };
    }
    const P = a * t.per;
    return {
      skill: 'story_money', prompt: t.txt,
      steps: [
        choiceStep('Which number sentence matches the story?', `${a} × ${t.per}`, [`${a} + ${t.per}`, `${t.per} − ${a}`, `${a} × ${a}`]),
        numStep(`Now solve it: ${a} × ${t.per} = ?`, P, { prefix: t.prefix, unit: t.unit }),
      ],
      tip: 'Each ticket or coin is worth the same amount. Multiply how many by what each one is worth.',
      explain: `${a} × ${t.per} = ${P}. Skip count by ${t.per}s: ${skipList(t.per, a)}.`,
    };
  }

  function storyPattern() {
    const a = rnd(2, 5), b = rnd(3, 10), P = a * b;
    return {
      skill: 'story_pattern',
      prompt: `A championship belt has a pattern of ${a} different colored gems. The pattern repeats ${b} times. How many gems are on the belt?`,
      steps: [multExprStep(a, b, P), numStep(`Now solve it: ${a} × ${b} = ?`, P, { unit: 'gems' })],
      tip: `One pattern has ${a} gems. The pattern repeats ${b} times, so you have ${b} equal groups.`,
      explain: `${b} patterns with ${a} gems each: ${a} × ${b} = ${P}.`,
    };
  }

  // =====================================================================
  // MULTIPLICATION MOVES
  // =====================================================================
  function multFact() {
    const r = Math.random();
    const a = r < 0.8 ? rnd(2, 9) : pick([0, 1, 10]), b = rnd(2, 9);
    const [x, y] = Math.random() < 0.5 ? [a, b] : [b, a];
    return {
      skill: 'mult_fact', prompt: 'Solve the multiplication fact.',
      visual: `<div class="bigeq">${x} × ${y} = ?</div>`,
      steps: [numStep('What is the product?', x * y)],
      tip: `Skip count by ${Math.max(x, y)}s, ${Math.min(x, y)} times, or use a fact you already know.`,
      explain: `${x} × ${y} = ${x * y}. Skip count: ${skipList(Math.max(x, y), Math.min(x, y)) || '0'}.`,
    };
  }

  function multArray() {
    const r = rnd(2, 6), c = rnd(3, 8), P = r * c;
    if (Math.random() < 0.5) {
      return {
        skill: 'mult_array', prompt: 'Look at the array. How many dots are there in all?',
        visual: `<div class="viz">${dotsSvg(r, c)}</div>`,
        steps: [numStep('How many dots?', P, { unit: 'dots' })],
        tip: 'Count the rows and the dots in each row, then multiply.',
        explain: `${r} rows of ${c} dots: ${r} × ${c} = ${P}.`,
      };
    }
    return {
      skill: 'mult_array', prompt: 'Write the array as a multiplication problem.',
      visual: `<div class="viz">${dotsSvg(r, c)}</div>`,
      steps: [choiceStep('Which equation matches the array?', `${r} × ${c} = ${P}`,
        [`${r} + ${c} = ${r + c}`, `${r} × ${c} = ${P + r}`, `${r + 1} × ${c} = ${(r + 1) * c}`])],
      tip: 'Count the rows, count the columns, then multiply. Check the product too.',
      explain: `${r} rows and ${c} columns: ${r} × ${c} = ${P}.`,
    };
  }

  function multGroups() {
    const a = rnd(2, 6), b = rnd(3, 9), P = a * b;
    const tall = Math.random() < 0.5; // shown as a rows of b (easy) or b rows of a (harder)
    const rows = tall ? a : b, cols = tall ? b : a;
    const line = '▲'.repeat(cols).split('').join(' ');
    const grid = Array.from({ length: rows }, () => `<div>${line}</div>`).join('');
    return {
      skill: 'mult_groups', prompt: `How many groups of ${b} can you make with the ${P} shapes?`,
      visual: `<div class="shapes">${grid}</div>`,
      steps: [numStep('How many groups?', a, { unit: 'groups' })],
      tip: `Split ${P} into groups of ${b}. Count by ${b}s until you reach ${P}, or think ${b} × ? = ${P}.`,
      explain: `${P} ÷ ${b} = ${a}, because ${b} × ${a} = ${P}. Skip count: ${skipList(b, a)}.`,
    };
  }

  function multProps() {
    const kind = pick(['zero', 'one', 'five', 'parity', 'parity']);
    if (kind === 'zero') {
      const x = rnd(1, 9);
      return { skill: 'mult_props', prompt: 'Zero facts.', visual: `<div class="bigeq">${x} × 0 = ?</div>`,
        steps: [numStep('What is the product?', 0)], tip: 'What happens when you have zero groups of something, or groups with nothing in them?',
        explain: 'Any number times 0 is 0.' };
    }
    if (kind === 'one') {
      const x = rnd(2, 9);
      return { skill: 'mult_props', prompt: 'One facts.', visual: `<div class="bigeq">${x} × 1 = ?</div>`,
        steps: [numStep('What is the product?', x)], tip: 'One group of any number is just that number.',
        explain: `Any number times 1 is itself, so ${x} × 1 = ${x}.` };
    }
    if (kind === 'five') {
      const ms = shuffle([2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3);
      return { skill: 'mult_props', prompt: 'Look for a pattern in the ones place.',
        visual: `<div class="bigeq small">${ms.map((m) => `5 × ${m} = ${5 * m}`).join('<br>')}</div>`,
        steps: [choiceStep('What is true about the ones digit of a product with 5?', 'It is always 0 or 5', ['It is always 5', 'It is always 0', 'It is always even'])],
        tip: 'Look at the last digit of each product.',
        explain: 'Counting by 5s always ends in 0 or 5: 5, 10, 15, 20, 25...' };
    }
    const ev = pick([2, 4, 6, 8]), od = pick([3, 5, 7, 9]);
    const combos = [[ev, od, 'Even'], [od, ev, 'Even'], [ev, pick([2, 4, 6, 8]), 'Even'], [od, pick([3, 5, 7, 9]), 'Odd']];
    const c = pick(combos);
    return { skill: 'mult_props', prompt: 'Even or odd?',
      visual: `<div class="bigeq">${c[0]} × ${c[1]}</div>`,
      steps: [choiceStep('Is the product even or odd?', c[2], ['Even', 'Odd'], 2)],
      tip: 'Multiply it out, then look at the last digit. 0, 2, 4, 6, 8 means even. 1, 3, 5, 7, 9 means odd.',
      explain: `${c[0]} × ${c[1]} = ${c[0] * c[1]}. If either factor is even the product is even. Odd × odd is odd.` };
  }

  // =====================================================================
  // DIVISION DRILLS
  // =====================================================================
  function divFact() {
    const a = rnd(2, 9), b = rnd(2, 9), P = a * b;
    return {
      skill: 'div_fact', prompt: 'Solve the division problem.',
      visual: `<div class="bigeq">${P} ÷ ${b} = ?</div>`,
      steps: [numStep('What is the quotient?', a)],
      tip: `Turn it into a multiplication question: ${b} × ? = ${P}.`,
      explain: `${b} × ${a} = ${P}, so ${P} ÷ ${b} = ${a}.`,
    };
  }

  function factFamily() {
    const [a, b] = makeDifferent(() => rnd(2, 9)), P = a * b;
    const facts = [`${a} × ${b} = ${P}`, `${b} × ${a} = ${P}`, `${P} ÷ ${a} = ${b}`, `${P} ÷ ${b} = ${a}`];
    const h = rnd(0, 3);
    const rows = facts.map((f, i) => `<div class="${i === h ? 'missing' : ''}">${i === h ? '? ? ?' : f}</div>`).join('');
    return {
      skill: 'fact_family', prompt: 'Fill in the missing fact from the fact family.',
      visual: `<div class="facts">${rows}</div>`,
      steps: [choiceStep('Which fact is missing?', facts[h], [`${a} ÷ ${P} = ${b}`, `${a} + ${b} = ${P}`, `${P} − ${a} = ${b}`, `${b} ÷ ${P} = ${a}`])],
      tip: 'A fact family uses the same three numbers. In a division fact the biggest number goes first.',
      explain: `The missing fact is ${facts[h]}. The family uses ${a}, ${b}, and ${P}, and the ${P} comes first in a division fact.`,
    };
  }

  // =====================================================================
  // NUMBER SENSE
  // =====================================================================
  function functionMachine() {
    const type = pick(['sub', 'add', 'mul']);
    const k = type === 'mul' ? rnd(2, 5) : rnd(2, 10);
    const inputs = type === 'mul' ? shuffle([1, 2, 3, 4, 5, 6, 7]).slice(0, 4) : shuffle([12, 15, 17, 21, 24, 30, 35, 40]).slice(0, 4);
    const f = (x) => (type === 'sub' ? x - k : type === 'add' ? x + k : x * k);
    const label = { sub: `Subtract ${k}`, add: `Add ${k}`, mul: `Multiply by ${k}` };
    const wrong = [label.sub, label.add, label.mul, `${type === 'sub' ? 'Subtract' : type === 'add' ? 'Add' : 'Multiply by'} ${k + 1}`].filter((s) => s !== label[type]);
    const body = inputs.map((x) => `<tr><td>${x}</td><td>${f(x)}</td></tr>`).join('');
    return {
      skill: 'function', prompt: 'Determine what rule the function machine is using.',
      visual: `<table class="ftable"><tr><th>Input</th><th>Output</th></tr>${body}</table>`,
      steps: [choiceStep('What is the rule?', label[type], wrong)],
      tip: 'Compare an input with its output. Did the number get bigger or smaller? By how much? Test your rule on every row.',
      explain: `${inputs[0]} → ${f(inputs[0])}. The rule ${label[type].toLowerCase()} works on every row.`,
    };
  }

  function roundNum() {
    const hundred = Math.random() < 0.5;
    const step = hundred ? 100 : 10;
    let n;
    do { n = hundred ? rnd(101, 999) : rnd(11, 98); } while (n % step === 0 || n % step === step / 2);
    const lo = Math.floor(n / step) * step, hi = lo + step, mid = lo + step / 2;
    const ans = n - lo < step / 2 ? lo : hi;
    const pos = 5 + ((n - lo) / step) * 90;
    const line = `<div class="nline"><div class="nl-marker" style="left:${pos}%"><span>${n}</span>▼</div><div class="nl-bar"></div>` +
      [[5, lo], [50, mid], [95, hi]].map((t) => `<div class="nl-tick" style="left:${t[0]}%"><i></i><b>${t[1]}</b></div>`).join('') + '</div>';
    return {
      skill: 'round_num', prompt: `Use the number line to round ${n} to the nearest ${hundred ? 'hundred' : 'ten'}.`,
      visual: line,
      steps: [choiceStep(`${n} rounds to...`, ans, [lo, mid, hi], 3)],
      tip: `Is ${n} closer to ${lo} or to ${hi}? Halfway between them is ${mid}. Past halfway, round up. Before halfway, round down.`,
      explain: `${n} is ${n - lo < step / 2 ? 'closer to ' + lo : 'closer to ' + hi} than to the other ${hundred ? 'hundred' : 'ten'}, so it rounds to ${ans}. The middle mark ${mid} is not a ${hundred ? 'hundred' : 'ten'}.`,
    };
  }

  function addRegroup() {
    let a, b;
    if (Math.random() < 0.55) { a = rnd(11, 79); b = rnd(11, 79); } else { a = rnd(120, 640); b = rnd(120, 340); }
    const three = a > 99;
    return {
      skill: 'add_regroup', prompt: 'Add.',
      visual: `<div class="bigeq">${a} + ${b} = ?</div>`,
      steps: [numStep('What is the sum?', a + b)],
      tip: `Line up the digits. Add the ones first${three ? ', then the tens, then the hundreds' : ', then the tens'}. Regroup when you get 10 or more.`,
      explain: `${a} + ${b} = ${a + b}. Add the ones, then the tens${three ? ', then the hundreds' : ''}, carrying when needed.`,
    };
  }

  // =====================================================================
  // SHAPES & FRACTIONS
  // =====================================================================
  function fractionPick() {
    const dens = [2, 3, 4, 6, 8];
    const n = pick(dens), a = rnd(1, n - 1);
    const bars = Math.random() < 0.5;
    const draw = (d, s) => (bars ? barSvg(d, s) : pieSvg(d, s));
    const cand = [];
    if (a + 1 < n) cand.push([n, a + 1]);
    if (a - 1 >= 1) cand.push([n, a - 1]);
    if (n - a !== a) cand.push([n, n - a]);
    dens.forEach((d) => { if (d !== n) { const s = Math.min(a, d - 1); cand.push([d, s]); } });
    const wrong = [], seen = new Set([n + '/' + a]);
    for (const c of shuffle(cand)) {
      if (c[0] * a === c[1] * n) continue; // same value as correct fraction
      const key = c[0] + '/' + c[1];
      if (seen.has(key)) continue;
      seen.add(key); wrong.push(c);
      if (wrong.length === 3) break;
    }
    const all = shuffle([[n, a]].concat(wrong)).map((c) => ({ v: c[0] + '/' + c[1], html: draw(c[0], c[1]), text: `${c[1]}/${c[0]} ${bars ? 'bar' : 'circle'}` }));
    return {
      skill: 'fraction', prompt: `Which shape best represents ${frac(a, n)}?`,
      steps: [{ kind: 'choice', q: `Pick the shape that shows ${a}/${n}.`, choices: all, answer: n + '/' + a }],
      tip: `The bottom number (${n}) is how many equal parts the whole has. The top number (${a}) is how many are shaded.`,
      explain: `${a}/${n} means ${a} shaded parts out of ${n} equal parts.`,
    };
  }

  const POLY = { 3: 'triangle', 5: 'pentagon', 6: 'hexagon', 7: 'heptagon', 8: 'octagon' };
  function shapeName() {
    const sides = pick([3, 5, 6, 7, 8]);
    const names = Object.values(POLY);
    if (Math.random() < 0.7) {
      return {
        skill: 'shapes', prompt: 'What is this shape called? Count the sides.',
        visual: `<div class="viz">${polygonSvg(sides)}</div>`,
        steps: [choiceStep('Name the shape.', POLY[sides], names, 4)],
        tip: 'Count the straight sides. Pentagon 5, hexagon 6, heptagon 7, octagon 8.',
        explain: `It has ${sides} sides, so it is ${article(POLY[sides])}.`,
      };
    }
    return {
      skill: 'shapes', prompt: `How many sides does ${article(POLY[sides])} have?`,
      steps: [choiceStep('Pick the number of sides.', String(sides), ['3', '5', '6', '7', '8', '9'], 4)],
      tip: 'Penta means 5, hexa means 6, hepta means 7, octa means 8.',
      explain: `${article(POLY[sides])[0].toUpperCase() + article(POLY[sides]).slice(1)} has ${sides} sides.`,
    };
  }

  // =====================================================================
  // MEASURE & TIME
  // =====================================================================
  const VOLUMES = [
    { e: '☕', n: 'coffee mug', c: '250 milliliters', w: ['2 liters', '25 liters', '2 milliliters'] },
    { e: '🥛', n: 'glass of milk', c: '300 milliliters', w: ['3 liters', '30 milliliters', '2 liters'] },
    { e: '🛁', n: 'bathtub', c: '150 liters', w: ['150 milliliters', '15 milliliters', '2 liters'] },
    { e: '🥄', n: 'teaspoon', c: '5 milliliters', w: ['5 liters', '50 liters', '500 milliliters'] },
    { e: '🪣', n: 'bucket', c: '10 liters', w: ['10 milliliters', '1 milliliter', '100 liters'] },
    { e: '🧃', n: 'juice box', c: '200 milliliters', w: ['2 liters', '20 liters', '2 milliliters'] },
    { e: '🍼', n: 'baby bottle', c: '250 milliliters', w: ['2 liters', '25 liters', '2 milliliters'] },
    { e: '🐠', n: 'fish tank', c: '40 liters', w: ['40 milliliters', '4 milliliters', '400 liters'] },
  ];
  function volumePick() {
    const v = pick(VOLUMES);
    return {
      skill: 'volume', prompt: 'Circle the amount that best represents the volume the object can hold.',
      visual: `<div class="viz emoji">${v.e}<div class="cap">${v.n}</div></div>`,
      steps: [choiceStep('Pick the best amount.', v.c, v.w, 4)],
      tip: 'A liter is about a big water bottle. A milliliter is tiny, about a drop or a few drops. Picture how much the object holds.',
      explain: `A ${v.n} holds about ${v.c}.`,
    };
  }

  function clockRead() {
    const h = rnd(1, 12), m = Math.random() < 0.6 ? pick([0, 15, 30, 45]) : pick([5, 10, 20, 25, 35, 40, 50, 55]);
    const t = (hh, mm) => `${hh}:${pad2(mm)}`;
    const next = (x) => (x % 12) + 1;
    const swapH = m === 0 ? 12 : m / 5, swapM = (h * 5) % 60;
    const wrong = [t(next(h), m), t(swapH, swapM), t(h, (m + 30) % 60), t(h, m < 55 ? m + 5 : m - 5)];
    return {
      skill: 'clock', prompt: 'What time is shown on the clock?',
      visual: `<div class="viz">${clockSvg(h, m)}</div>`,
      steps: [choiceStep('Pick the time.', t(h, m), wrong, 4)],
      tip: 'The short fat hand is the hour hand. Use the hour it has already passed, not the one it is heading toward. The long red hand counts minutes by fives.',
      explain: `The short hand has passed ${h}, so the hour is ${h}. The long hand points at ${m / 5 || 12}, which is ${m} minutes. The time is ${t(h, m)}.`,
    };
  }

  // =====================================================================
  // Catalog
  // =====================================================================
  const CATS = {
    story: { name: 'Story Slam', emoji: '📖', blurb: 'Word problems' },
    mult: { name: 'Multiplication Moves', emoji: '✖️', blurb: 'Facts, arrays, groups' },
    div: { name: 'Division Drills', emoji: '➗', blurb: 'Divide and fact families' },
    num: { name: 'Number Sense', emoji: '🔢', blurb: 'Adding, rounding, rules' },
    shape: { name: 'Shapes & Fractions', emoji: '🔷', blurb: 'Name shapes, read fractions' },
    meas: { name: 'Measure & Time', emoji: '⏱️', blurb: 'Volume and clocks' },
  };

  const SKILLS = {
    story_mult: { name: 'Multiplication stories', cat: 'story', gen: storyMult },
    story_div: { name: 'Division stories', cat: 'story', gen: storyDiv },
    story_two: { name: 'Two-step stories', cat: 'story', gen: storyTwoStep },
    story_match: { name: 'Match the story', cat: 'story', gen: storyMatch },
    story_compare: { name: 'Compare arrays', cat: 'story', gen: storyCompare },
    story_money: { name: 'Money stories', cat: 'story', gen: storyMoney },
    story_pattern: { name: 'Pattern stories', cat: 'story', gen: storyPattern },
    mult_fact: { name: 'Multiplication facts', cat: 'mult', gen: multFact },
    mult_array: { name: 'Arrays', cat: 'mult', gen: multArray },
    mult_groups: { name: 'Groups of', cat: 'mult', gen: multGroups },
    mult_props: { name: 'Multiplication patterns', cat: 'mult', gen: multProps },
    div_fact: { name: 'Division facts', cat: 'div', gen: divFact },
    fact_family: { name: 'Fact families', cat: 'div', gen: factFamily },
    add_regroup: { name: 'Adding with regrouping', cat: 'num', gen: addRegroup },
    round_num: { name: 'Rounding', cat: 'num', gen: roundNum },
    function: { name: 'Function machines', cat: 'num', gen: functionMachine },
    fraction: { name: 'Fractions', cat: 'shape', gen: fractionPick },
    shapes: { name: 'Shapes', cat: 'shape', gen: shapeName },
    volume: { name: 'Volume', cat: 'meas', gen: volumePick },
    clock: { name: 'Telling time', cat: 'meas', gen: clockRead },
  };

  function makeProblem(skillId) {
    const p = SKILLS[skillId].gen();
    p.cat = SKILLS[skillId].cat;
    return p;
  }

  // Weighted skill pick: word problems get extra weight in mixed matches,
  // and skills he misses more often come up more often.
  function pickSkill(catKey, stats, avoid) {
    stats = stats || {};
    const ids = Object.keys(SKILLS).filter((id) => catKey === 'mix' || SKILLS[id].cat === catKey);
    const weights = ids.map((id) => {
      let w = SKILLS[id].w || 1;
      if (catKey === 'mix' && SKILLS[id].cat === 'story') w *= 2.2;
      const st = stats[id];
      if (st && st.a >= 3) w *= 1 + (1 - st.c / st.a) * 2;
      if (id === avoid) w *= 0.15;
      return w;
    });
    let r = Math.random() * weights.reduce((x, y) => x + y, 0);
    for (let i = 0; i < ids.length; i++) { r -= weights[i]; if (r <= 0) return ids[i]; }
    return ids[ids.length - 1];
  }

  const api = { CATS, SKILLS, makeProblem, pickSkill };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.LBM = api;
})(typeof window !== 'undefined' ? window : globalThis);
