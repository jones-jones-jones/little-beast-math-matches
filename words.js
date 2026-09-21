/* Little Beast's Homework Throwdown: spelling + vocabulary problems.
 * Loads after problems.js and adds two subjects to it.
 *
 * SPELLING goes in three stages (the app picks the stage from how far along the match/tournament is):
 *   stage 0  fill in the missing letter          (skill spell_missing)
 *   stage 1  hear the word, pick the spelling    (skill spell_pick)
 *   stage 2  hear the word, spell it             (skill spell_hear)
 * VOCABULARY is multiple choice, with a button to hear the word used in a sentence.
 */
(function (root) {
  'use strict';
  const L = (typeof module !== 'undefined' && module.exports) ? require('./problems.js') : root.LBM;
  const words = L.words, env = L.env;

  const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = (a) => a[rnd(0, a.length - 1)];
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rnd(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const dashed = (w) => w.split('').join('-');

  // ------------------------------------------------------------------ parsing what the parent types
  function parseSpelling(text) {
    const items = [], warn = [], seen = new Set();
    String(text || '').split(/\r?\n/).forEach((line) => {
      line = line.trim(); if (!line) return;
      const parts = line.includes('|')
        ? [{ w: line.split('|')[0], s: line.split('|').slice(1).join('|').trim() }]
        : line.split(/[,;]+/).map((x) => ({ w: x, s: '' }));
      parts.forEach((p) => {
        const w = p.w.replace(/^\s*\d+[.)]\s*/, '').trim().toLowerCase(); if (!w) return;
        if (!/^[a-z][a-z'-]*$/.test(w)) { warn.push(`Skipped "${w}" (spelling words can only use letters)`); return; }
        if (seen.has(w)) return; seen.add(w); items.push({ w, s: p.s });
      });
    });
    return { items, warn };
  }

  function makeBlank(sentence, word) {
    if (!sentence) return '';
    if (/_{2,}/.test(sentence)) return sentence.replace(/_{2,}/g, '_____');
    const re = new RegExp('\\b' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
    return re.test(sentence) ? sentence.replace(re, '_____') : '';
  }

  function parseVocab(text) {
    const items = [], warn = [], seen = new Set();
    String(text || '').split(/\r?\n/).forEach((line) => {
      line = line.trim(); if (!line) return;
      const m = line.match(/^(?:\d+[.)]\s*)?([A-Za-z][A-Za-z'-]*)\s*(?:\(([A-Za-z. ]+)\))?\s*(?::|=|\s[-–—]\s)\s*(.+)$/);
      if (!m) { warn.push(`Skipped "${line.slice(0, 40)}" (use: word (verb): meaning | sample sentence)`); return; }
      const w = m[1].toLowerCase(); if (seen.has(w)) return; seen.add(w);
      const bits = m[3].split('|'), d = bits[0].trim().replace(/[.\s]+$/, ''), s = bits.slice(1).join('|').trim();
      if (!d) { warn.push(`Skipped "${w}" (no meaning)`); return; }
      // if the parent wrote their own blank (___), keep a complete sentence for reading aloud and a blanked one for the question
      const full = /_{2,}/.test(s) ? s.replace(/_{2,}/, w) : s;
      items.push({ w, pos: (m[2] || '').trim().toLowerCase(), d, s: full, blank: makeBlank(s, w) });
    });
    return { items, warn };
  }

  // ------------------------------------------------------------------ misspellings for "pick the spelling"
  const COMMON = new Set(('a about after again all also am an and any are around as at away back be because been before big but by came can come could day did do down each even first for from get give go good had has have he her here him his how i if in into is it its just know like little long look made make many more most much my new no not now of off old on one only or other our out over said see she so some take than that the their them then there these they thing think this time to too two up us use very want was way we well went were what when where which who will with would yes you your bat bet bit bot cat cot cut dog dig dug hat hit hot hut man men map mat met net not nut pat pet pin pit pot pen pan pun sat set sit sun tan ten tin top tip tap win wet wit').split(/\s+/));

  // Hand-picked wrong spellings for this week's tricky words (none is a real word, and none sounds like another word).
  const CURATED = {
    phone: ['fone', 'phon', 'phoan', 'foan'], teeth: ['teath', 'teeths', 'tooths', 'teth'], wrote: ['wrot', 'wroat', 'wrotte'],
    phase: ['fase', 'phaze', 'phas', 'phaise'], crumb: ['crum', 'crumbe', 'crumm', 'krumb'], oxen: ['oxon', 'oxin', 'oxens', 'oxes'],
    knife: ['nife', 'knif', 'knive', 'kniff'], fish: ['fich', 'fesh', 'phish', 'fis'], limb: ['lim', 'limm', 'limbe', 'lymb'],
    children: ['childern', 'childrun', 'chilren', 'childs', 'childrens'], knocking: ['knoking', 'knockeng', 'nokking', 'knockin'],
    mice: ['mices', 'mysse', 'miece', 'mouses'], wrinkle: ['rinkle', 'wrinkel', 'wrinkal', 'rinckle'], whale: ['whael', 'whal', 'whayl', 'wheil'],
    cacti: ['cactie', 'cacty', 'cactis', 'cackti'], women: ['wimen', 'womin', 'womon', 'womens'], deer: ['deers', 'deor', 'deere', 'dere'],
    people: ['peple', 'peeple', 'poeple', 'pepole'],
  };

  function misspellings(w, all) {
    const out = new Set();
    const add = (x) => { if (x && x !== w && x.length >= 2 && !COMMON.has(x) && !all.has(x) && /^[a-z'-]+$/.test(x)) out.add(x); };
    const V = 'aeiou';
    for (let i = 1; i < w.length - 1; i++) if (w[i] !== w[i + 1]) add(w.slice(0, i) + w[i + 1] + w[i] + w.slice(i + 2)); // swapped letters
    for (let i = 1; i < w.length; i++) add(w.slice(0, i) + w.slice(i + 1)); // dropped letter
    for (let i = 1; i < w.length; i++) if (/[a-z]/.test(w[i]) && w[i] !== w[i - 1]) add(w.slice(0, i + 1) + w[i] + w.slice(i + 1)); // doubled letter
    for (let i = 1; i < w.length; i++) if (V.includes(w[i])) for (const v of V) if (v !== w[i]) add(w.slice(0, i) + v + w.slice(i + 1)); // wrong vowel
    [['ie', 'ei'], ['ei', 'ie'], ['c', 's'], ['s', 'c'], ['ph', 'f'], ['f', 'ph'], ['ck', 'k'], ['ee', 'ea'], ['ea', 'ee'], ['ai', 'ay'], ['ay', 'ai'], ['ou', 'ow'], ['ow', 'ou'], ['er', 'ur'], ['le', 'el'], ['kn', 'n'], ['wr', 'r'], ['mb', 'm']]
      .forEach(([a, b]) => { let i = w.indexOf(a); while (i >= 0) { add(w.slice(0, i) + b + w.slice(i + a.length)); i = w.indexOf(a, i + 1); } });
    return Array.from(out);
  }

  // ------------------------------------------------------------------ helpers
  const sp = () => words.spelling, vo = () => words.vocab;
  function pickEntry(list, pred) { // words he has missed before come up more often
    const pool = list.filter(pred || (() => true)); if (!pool.length) return null;
    const ws = pool.map((e) => 1 + Math.min(3, words.miss[e.w] || 0) * 1.5);
    let r = Math.random() * ws.reduce((a, b) => a + b, 0);
    for (let i = 0; i < pool.length; i++) { r -= ws[i]; if (r <= 0) return pool[i]; }
    return pool[pool.length - 1];
  }
  function textChoices(correct, wrongs, n) {
    const seen = new Set([String(correct)]), w = [];
    for (const x of shuffle(wrongs)) { const s = String(x); if (!seen.has(s)) { seen.add(s); w.push(s); } if (w.length >= (n || 4) - 1) break; }
    return { choices: shuffle([String(correct)].concat(w)).map((v) => ({ v, html: esc(v), text: v })), answer: String(correct) };
  }
  const choiceStep = (q, correct, wrongs, n) => Object.assign({ kind: 'choice', q }, textChoices(correct, wrongs, n));
  const allWords = () => new Set(sp().map((e) => e.w));
  const wrongsFor = (w) => { // hand-picked misspellings when we have them, otherwise generated ones
    const all = allWords(), cur = (CURATED[w] || []).filter((x) => x !== w && !all.has(x));
    return cur.length >= 3 ? cur : misspellings(w, all);
  };

  // A letter worth blanking: silent letters first (kn-, wr-, -mb, ph, gh, wh), otherwise any inside letter.
  function blankIndex(w) {
    const spots = [];
    if (/^kn/.test(w)) spots.push(0);
    if (/^wr/.test(w)) spots.push(0);
    if (/mb$/.test(w)) spots.push(w.length - 1);
    const ph = w.indexOf('ph'); if (ph >= 0) spots.push(ph + 1);
    const gh = w.indexOf('gh'); if (gh >= 0) spots.push(gh + 1);
    const wh = w.indexOf('wh'); if (wh >= 0) spots.push(wh);
    if (spots.length && Math.random() < 0.65) return pick(spots);
    const letters = []; for (let i = 0; i < w.length; i++) if (/[a-z]/.test(w[i])) letters.push(i);
    return pick(letters.slice(w.length > 3 ? 1 : 0));
  }

  const spellTip = 'Say the word out loud. Some letters are silent! Tap the speaker to hear it again.';

  // ------------------------------------------------------------------ SPELLING
  function spellMissing() {
    const e = pickEntry(sp(), (x) => x.w.length >= 3); const w = e.w, i = blankIndex(w), letter = w[i];
    const vowel = 'aeiou'.includes(letter);
    const pool = vowel ? 'aeiou'.split('') : 'bcdfghjklmnprstwyk'.split('').concat(['n', 'g']);
    const pat = w.split('').map((c, k) => (k === i ? '<span class="blank">_</span>' : esc(c))).join('');
    return {
      skill: 'spell_missing', word: e.w, audio: e.w, hearLabel: 'Hear the word',
      prompt: 'Fill in the missing letter.', visual: `<div class="wordpat">${pat}</div>`,
      steps: [choiceStep('Which letter is missing?', letter, pool.filter((c) => c !== letter), 4)],
      tip: spellTip, explain: `The word is spelled ${dashed(w)}.`, reviewPrompt: `Fill in the missing letter of "${w}".`,
    };
  }

  function spellPick() {
    const e = pickEntry(sp(), (x) => wrongsFor(x.w).length >= 2);
    if (!e) return spellHear();
    return {
      skill: 'spell_pick', word: e.w, audio: e.w, hearLabel: 'Hear the word again',
      prompt: 'Listen to the word. Which spelling is correct?',
      steps: [choiceStep('Pick the correct spelling.', e.w, wrongsFor(e.w), 4)],
      tip: spellTip, explain: `The word is spelled ${dashed(e.w)}.`, reviewPrompt: `Pick the correct spelling of "${e.w}".`,
    };
  }

  function spellHear() {
    const e = pickEntry(sp());
    return {
      skill: 'spell_hear', word: e.w, audio: e.w, hearLabel: 'Hear the word again',
      prompt: 'Listen carefully, then spell the word.',
      steps: [{ kind: 'text', q: 'Type the word you heard.', answer: e.w, answers: [e.w] }],
      tip: spellTip, explain: `The word is spelled ${dashed(e.w)}.`, reviewPrompt: `Spell "${e.w}".`,
    };
  }

  // ------------------------------------------------------------------ VOCABULARY (multiple choice)
  const hearFor = (e) => (e.s ? { hear: `${e.w}. ${e.s}`, hearLabel: 'Hear it in a sentence' } : { hear: e.w, hearLabel: 'Hear the word' });
  const posTag = (e) => (e.pos ? ` <span class="pos">(${esc(e.pos)})</span>` : '');
  const sample = (list, skip, n) => shuffle(list.filter((x) => x.w !== skip)).slice(0, n);

  function vocabDef() {
    const e = pickEntry(vo()); const others = vo().filter((x) => x.w !== e.w && x.d !== e.d).map((x) => x.d);
    return Object.assign({
      skill: 'vocab_def', word: e.w,
      prompt: `What does <b>${esc(e.w)}</b>${posTag(e)} mean?`,
      steps: [choiceStep('Pick the best meaning.', e.d, others, 4)],
      tip: 'Use the sentence button if you want to hear the word used. Cross out meanings that do not fit.',
      explain: `<b>${esc(e.w)}</b> means ${esc(e.d)}.`, reviewPrompt: `What does "${e.w}" mean?`,
    }, hearFor(e));
  }

  function vocabWord() {
    const e = pickEntry(vo());
    return Object.assign({
      skill: 'vocab_word', word: e.w,
      prompt: `Which word means <b>${esc(e.d)}</b>?`,
      steps: [choiceStep('Pick the word.', e.w, vo().filter((x) => x.w !== e.w).map((x) => x.w), 4)],
      tip: 'Read the meaning again, then try each word in your head.',
      explain: `<b>${esc(e.w)}</b> means ${esc(e.d)}.`, reviewPrompt: `Which word means "${e.d}"?`,
      hear: `Which word means: ${e.d}?`, hearLabel: 'Hear the meaning',
    });
  }

  function vocabBlank() {
    const e = pickEntry(vo(), (x) => x.blank);
    return Object.assign({
      skill: 'vocab_blank', word: e.w,
      prompt: 'Pick the word that fits the sentence.', visual: `<div class="sentence">${esc(e.blank)}</div>`,
      steps: [choiceStep('Which word fits?', e.w, vo().filter((x) => x.w !== e.w).map((x) => x.w), 4)],
      tip: 'Read the sentence with each word in the blank. Which one makes sense?',
      explain: `<b>${esc(e.w)}</b> means ${esc(e.d)}. ${esc(e.s)}`, reviewPrompt: `Which word fits: ${e.blank}`,
      hear: e.blank.replace(/_+/g, 'blank'), hearLabel: 'Hear the sentence',
    });
  }

  // ------------------------------------------------------------------ register with the game
  L.CATS.spell = { name: 'Spelling Showdown', emoji: '🔤', blurb: "This week's spelling words", subject: 'spell' };
  L.CATS.vocab = { name: 'Vocab Vault', emoji: '📚', blurb: "This week's vocabulary", subject: 'vocab' };
  const haveSp = () => sp().length >= 1;
  const haveVo = () => vo().length >= 4;
  Object.assign(L.SKILLS, {
    spell_missing: { name: 'Missing letters', cat: 'spell', gen: spellMissing, stage: 0, avail: () => haveSp() && sp().some((e) => e.w.length >= 3) },
    spell_pick: { name: 'Pick the spelling', cat: 'spell', gen: spellPick, stage: 1, avail: () => haveSp() && env.speech },
    spell_hear: { name: 'Spell the word', cat: 'spell', gen: spellHear, stage: 2, avail: () => haveSp() && env.speech },
    vocab_def: { name: 'Word meanings', cat: 'vocab', gen: vocabDef, avail: haveVo },
    vocab_word: { name: 'Find the word', cat: 'vocab', gen: vocabWord, avail: haveVo },
    vocab_blank: { name: 'Fill in the sentence', cat: 'vocab', gen: vocabBlank, w: 0.7, avail: () => haveVo() && vo().some((e) => e.blank) },
  });

  L.parseSpelling = parseSpelling; L.parseVocab = parseVocab; L.dashed = dashed; L.COMMON = COMMON; L.CURATED = CURATED; L.wordMisspellings = misspellings;
})(typeof window !== 'undefined' ? window : globalThis);
