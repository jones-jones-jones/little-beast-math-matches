/* Little Beast Math Matches: game logic and screens */
(function () {
  'use strict';
  const { CATS, SKILLS, makeProblem, pickSkill } = window.LBM;
  const $app = document.getElementById('app');
  const rnd = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pick = (a) => a[rnd(0, a.length - 1)];
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const LOGO = `<img src="assets/logo.png" alt="Little Beast logo">`;

  // ---------------------------------------------------------------- storage
  const KEY = 'lbmm.v1';
  const fresh = () => ({ xp: 0, matches: 0, wins: 0, pins: 0, bestStreak: 0, stats: {}, medals: {}, sound: true, voice: true });
  function load() {
    try { const j = JSON.parse(localStorage.getItem(KEY)); if (j && typeof j === 'object') return Object.assign(fresh(), j); } catch (e) { /* ignore */ }
    return fresh();
  }
  let state = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } }

  // ---------------------------------------------------------------- ranks
  const RANKS = [
    { name: 'Mat Rookie', xp: 0 }, { name: 'Novice', xp: 60 }, { name: 'JV Starter', xp: 160 },
    { name: 'Varsity', xp: 320 }, { name: 'Regional Champ', xp: 550 }, { name: 'State Finalist', xp: 850 },
    { name: 'State Champ', xp: 1250 },
  ];
  function rankIndex(xp) { let r = 0; RANKS.forEach((k, i) => { if (xp >= k.xp) r = i; }); return r; }

  // ---------------------------------------------------------------- opponents (all made up)
  const OPPS = [
    { name: 'Carry-the-One Carl', e: '🦝', taunt: 'I never forget to carry the one!' },
    { name: 'Sir Sums-a-Lot', e: '🐗', taunt: 'Add it up, little guy!' },
    { name: 'Fraction Frank', e: '🦊', taunt: 'You only get a piece of me!' },
    { name: 'Array Andy', e: '🐘', taunt: 'I line up everything. Even my wins.' },
    { name: 'Rounding Rex', e: '🦖', taunt: 'Close enough? Not against me!' },
    { name: 'The Divider', e: '🐺', taunt: 'I split opponents in equal groups.' },
    { name: 'Zero Hero Zed', e: '🦍', taunt: 'Anything times me is zero!' },
    { name: 'Big Product Pete', e: '🐂', taunt: 'Multiply this!' },
  ];

  // ---------------------------------------------------------------- audio
  let ac = null;
  function ctx() {
    try { ac = ac || new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === 'suspended') ac.resume(); } catch (e) { ac = null; }
    return ac;
  }
  function tone(freq, dur, type, t0, vol, slideTo) {
    if (!state.sound) return; const a = ctx(); if (!a) return;
    try {
      const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + (t0 || 0);
      o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
      if (slideTo) o.frequency.linearRampToValueAtTime(slideTo, t + dur);
      g.gain.setValueAtTime(vol || 0.15, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
    } catch (e) { /* ignore */ }
  }
  function noise(dur, freq, q, vol, t0, attack, type) {
    if (!state.sound) return; const a = ctx(); if (!a) return;
    try {
      const n = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      const src = a.createBufferSource(); src.buffer = buf;
      const f = a.createBiquadFilter(); f.type = type || 'bandpass'; f.frequency.value = freq; f.Q.value = q;
      const g = a.createGain(), t = a.currentTime + (t0 || 0), at = attack || 0.02;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + at); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(f); f.connect(g); g.connect(a.destination); src.start(t);
    } catch (e) { /* ignore */ }
  }
  const sfx = {
    tap() { tone(520, 0.05, 'triangle', 0, 0.08); },
    good() { tone(660, 0.12, 'triangle', 0, 0.14); tone(880, 0.18, 'triangle', 0.1, 0.14); },
    cheer() { // crowd roar, a burst of claps, and a rising fanfare
      noise(1.6, 1500, 0.6, 0.32, 0, 0.12); noise(1.6, 650, 0.7, 0.24, 0.04, 0.15);
      for (let i = 0; i < 16; i++) noise(0.05, 2600 + Math.random() * 1500, 1.2, 0.16, 0.15 + i * 0.07 + Math.random() * 0.03, 0.004, 'highpass');
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', i * 0.09, 0.11));
    },
    oh() { noise(0.9, 500, 0.8, 0.22, 0, 0.1); tone(330, 0.45, 'sawtooth', 0, 0.08, 190); }, // crowd "ooooh"
    groan() { noise(1.1, 420, 0.8, 0.26, 0, 0.12); tone(260, 0.6, 'sawtooth', 0, 0.09, 130); },
    whistle() { tone(2300, 0.14, 'square', 0, 0.05); tone(2050, 0.4, 'square', 0.15, 0.05); },
    bell() { tone(880, 0.9, 'sine', 0, 0.2); tone(1320, 0.7, 'sine', 0, 0.07); },
    win() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.25, 'triangle', i * 0.13, 0.13)); noise(2, 1500, 0.6, 0.3, 0.2, 0.2); },
  };

  // announcer voice (text is always shown; speech is optional)
  function say(text) {
    if (!state.voice) return;
    try {
      const s = window.speechSynthesis; if (!s) return; s.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/[^\w\s.,!?'-]/g, ''));
      const vs = s.getVoices();
      const v = vs.find((x) => /^en[-_](US|GB)/i.test(x.lang) && /(Daniel|Alex|Fred|Aaron|Arthur|Tom|Male)/i.test(x.name)) || vs.find((x) => /^en/i.test(x.lang));
      if (v) u.voice = v; u.rate = 1.05; u.pitch = 0.8; s.speak(u);
    } catch (e) { /* ignore */ }
  }

  const LINES = {
    good: [
      'Little Beast gets {o} in a cradle for back points!',
      'Takedown, Little Beast! What a beautiful double leg!',
      'Little Beast turns {o} with a half nelson!',
      'What a switch by Little Beast! Reversal!',
      'Little Beast sprawls, spins behind, and scores!',
      'Look at that single leg! Little Beast finishes it!',
      'Little Beast lifts {o} and returns him to the mat! The crowd is on its feet!',
      'Little Beast is all over {o}! He rides him out beautifully!',
    ],
    near: [
      'Near fall! Little Beast has {o} on his back, and the ref is counting!',
      'Little Beast is on a roll! A cradle, and {o} is in trouble!',
      'Three in a row! Little Beast has {o} in big trouble on the mat!',
    ],
    escape: [
      'Little Beast fights free! He escapes for a point!',
      'What a battle! Little Beast breaks the grip and gets away!',
      'Little Beast gets out the back door! Escape, one point!',
    ],
    stuck: [
      '{o} has Little Beast in a headlock. Let\'s see if he can get out of it!',
      '{o} is cranking a cross-face. Come on, Little Beast, think it through and try again!',
      '{o} has a tight waist on Little Beast. Can he fight off the hold?',
      '{o} shoots and grabs a leg! Can Little Beast sprawl and get out of it?',
      'Little Beast is on the bottom, and {o} has a ride. Stay calm, Little Beast, find the escape!',
    ],
    lost: [
      '{o} finishes the takedown, two points. Shake it off, Little Beast, this match is not over!',
      '{o} gets the takedown. Little Beast, get up and get back in there!',
      'Little Beast gave up two, but he is a fighter! Back to your feet!',
    ],
    step: ['Nice move! Keep going, Little Beast!', 'He has the first part! Now finish it!', 'Good hand fighting, Little Beast! Stay on the attack!'],
    p1: ['Wrestlers are set. Period one. Whistle!', 'Little Beast and {o} shake hands. Here we go!'],
    p2: ['Period two! Little Beast, your choice of position!'],
    p3: ['Third and final period! Everything is on the line!'],
    sudden: ['It is tied! Sudden victory! First score wins the match!'],
  };
  const line = (k, o) => pick(LINES[k]).replace(/\{o\}/g, o);

  // ---------------------------------------------------------------- match state
  let view = 'home';
  let match = null;
  let quitArm = false, resetArm = false;

  function startMatch(cat) {
    const ri = rankIndex(state.xp);
    const opp = pick(OPPS.slice(0, Math.min(OPPS.length, ri + 3)));
    match = { cat, opp, i: 0, total: 12, per: 4, beast: 0, oppScore: 0, streak: 0, best: 0, clean: 0, seen: new Set(), lastSkill: null, missed: [], cur: null, line: '', kind: '', pop: '' };
    quitArm = false; view = 'intro'; render();
  }

  function newProblem() {
    let p, tries = 0, key;
    do {
      const id = pickSkill(match.cat, state.stats, match.lastSkill);
      p = makeProblem(id);
      key = p.skill + p.prompt + JSON.stringify(p.steps.map((s) => s.answer));
      tries++;
    } while (match.seen.has(key) && tries < 10);
    match.seen.add(key); match.lastSkill = p.skill;
    match.cur = { p, step: 0, tries: 0, phase: 'ask', input: '', wrong: [], results: [], hint: false, showTip: false, outcome: null, given: null };
    match.pop = '';
    view = 'play'; render(); window.scrollTo(0, 0);
  }

  const curStep = () => match.cur.p.steps[match.cur.step];
  const isLast = () => match.cur.step === match.cur.p.steps.length - 1;

  function stepAnswerText(st) {
    if (st.kind === 'num') return `${st.prefix || ''}${st.answer}${st.unit ? ' ' + st.unit : ''}`;
    const c = st.choices.find((x) => x.v === st.answer); return c ? c.text : st.answer;
  }

  function submit(val) {
    const c = match.cur, st = curStep();
    if (c.phase !== 'ask' && c.phase !== 'retry') return;
    if (st.kind === 'num' && (val === '' || val == null)) return;
    const ok = st.kind === 'num' ? Number(val) === st.answer : val === st.answer;
    c.given = val;
    const o = match.opp.name;
    if (ok) {
      c.results.push({ ok: true, tries: c.tries + 1 });
      c.phase = 'fb';
      if (isLast()) resolveProblem(); else { sfx.good(); match.line = line('step', o); match.kind = 'good'; say(match.line); }
    } else if (c.tries === 0) {
      c.tries = 1; c.wrong.push(val); c.phase = 'retry'; c.input = '';
      sfx.oh(); match.line = line('stuck', o); match.kind = 'bad'; say(match.line);
    } else {
      c.results.push({ ok: false, tries: 2 });
      c.phase = 'fb';
      if (isLast()) resolveProblem(); else { sfx.groan(); match.line = 'Not this time, Little Beast. Keep your head up and finish the move!'; match.kind = 'bad'; say(match.line); }
    }
    render();
  }

  function resolveProblem() {
    const c = match.cur, m = match, o = m.opp.name;
    const allOk = c.results.length === c.p.steps.length && c.results.every((r) => r.ok);
    const clean = allOk && c.results.every((r) => r.tries === 1) && !c.hint;
    const s = state.stats[c.p.skill] || (state.stats[c.p.skill] = { a: 0, c: 0 });
    s.a++; if (clean) s.c++;
    let move, pts = 0, opp = 0;
    if (clean) {
      m.streak++; m.best = Math.max(m.best, m.streak); m.clean++;
      if (m.streak % 3 === 0) { pts = 3; move = 'Near fall! +3'; m.line = line('near', o); }
      else { pts = 2; move = pick(['Takedown! +2', 'Reversal! +2', 'Takedown! +2']); m.line = line('good', o); }
      m.kind = 'good'; sfx.cheer();
    } else if (allOk) {
      m.streak = 0; pts = 1; move = 'Escape! +1'; m.line = line('escape', o); m.kind = 'good'; sfx.cheer();
    } else {
      m.streak = 0; opp = 2; move = `${o} scores. +2`; m.line = line('lost', o); m.kind = 'bad'; sfx.groan();
      m.missed.push({
        skill: SKILLS[c.p.skill].name,
        prompt: c.p.prompt.replace(/<span class="frac"><span>(\d+)<\/span><span>(\d+)<\/span><\/span>/g, '$1/$2').replace(/<[^>]+>/g, ''),
        answer: c.p.steps.map(stepAnswerText).join(' → '),
        explain: c.p.explain,
      });
    }
    m.beast += pts; m.oppScore += opp; m.pop = pts ? 'beast' : 'opp';
    c.outcome = { allOk, clean, move, pts, opp };
    say(m.line);
  }

  function nextStepOrProblem() {
    const c = match.cur;
    if (c.step < c.p.steps.length - 1) {
      c.step++; c.tries = 0; c.phase = 'ask'; c.input = ''; c.wrong = []; c.given = null; c.showTip = false;
      match.line = ''; match.kind = ''; render(); return;
    }
    match.i++;
    if (match.i === match.total) {
      if (match.beast === match.oppScore) { match.line = line('sudden', match.opp.name); match.kind = ''; sfx.whistle(); say(match.line); return newProblem(); }
      return endMatch();
    }
    if (match.i > match.total) return endMatch();
    if (match.i % match.per === 0) { view = 'period'; sfx.bell(); render(); window.scrollTo(0, 0); return; }
    match.line = ''; match.kind = ''; newProblem();
  }

  function endMatch() {
    const m = match;
    const win = m.beast > m.oppScore, pin = win && m.clean === m.total;
    const before = rankIndex(state.xp);
    const gain = m.beast + (win ? 5 : 0) + (pin ? 10 : 0);
    state.xp += gain; state.matches++; if (win) state.wins++; if (pin) state.pins++;
    state.bestStreak = Math.max(state.bestStreak, m.best);
    if (m.cat !== 'mix') { const lvl = m.clean >= m.total ? 3 : m.clean >= 11 ? 2 : m.clean >= 10 ? 1 : 0; if (lvl > (state.medals[m.cat] || 0)) state.medals[m.cat] = lvl; }
    save();
    m.result = { win, pin, gain, rankedUp: rankIndex(state.xp) > before };
    m.line = pin ? 'IT\'S A PIN! Little Beast wins by fall! The crowd is going wild!'
      : win ? `That's the match! Little Beast wins ${m.beast} to ${m.oppScore}!`
        : `${m.opp.name} takes this one, ${m.oppScore} to ${m.beast}. Little Beast will be back! Study the film and get a rematch!`;
    m.kind = win ? 'good' : 'bad';
    if (win) sfx.win(); else sfx.groan();
    say(m.line);
    view = 'result'; render(); window.scrollTo(0, 0);
  }

  // ---------------------------------------------------------------- screens
  function ann() {
    const m = match;
    return `<div class="announcer ${m && m.kind || ''}"><span class="mic">🎙️</span><span>${m && m.line ? esc(m.line) : 'The announcer is watching the match...'}</span></div>`;
  }

  function board() {
    const m = match, sudden = m.i >= m.total;
    const per = sudden ? 'Sudden victory' : `Period ${Math.floor(m.i / m.per) + 1}`;
    return `<div class="board">
      <div class="side beast"><small>Little Beast</small><b class="${m.pop === 'beast' ? 'pop' : ''}">${m.beast}</b></div>
      <div class="mid"><span>${per}</span><span>${sudden ? 'Next score wins' : `Problem ${Math.min(m.i + 1, m.total)} of ${m.total}`}</span></div>
      <div class="side opp"><small>${esc(m.opp.name)}</small><b class="${m.pop === 'opp' ? 'pop' : ''}">${m.oppScore}</b></div>
    </div>`;
  }

  function topbar(extra) {
    return `<div class="topbar">${extra || ''}
      <button class="iconbtn ${state.sound ? '' : 'off'}" data-act="sound" aria-label="Toggle sound">🔊</button>
      <button class="iconbtn ${state.voice ? '' : 'off'}" data-act="voice" aria-label="Toggle announcer voice">🎙️</button></div>`;
  }

  function homeHtml() {
    const ri = rankIndex(state.xp), r = RANKS[ri], nx = RANKS[ri + 1];
    const pct = nx ? Math.round(((state.xp - r.xp) / (nx.xp - r.xp)) * 100) : 100;
    const medal = (k) => ['', '🥉', '🥈', '🥇'][state.medals[k] || 0];
    return `${topbar()}
      <div class="hero">${LOGO}<h1>Little Beast<span>Math Matches</span></h1><p>Folkstyle Edition</p></div>
      <div class="rank"><div class="row"><div class="name">${r.name}</div><div class="xp">${state.xp} XP${nx ? ` · next: ${nx.name} at ${nx.xp}` : ' · top rank!'}</div></div>
        <div class="bar"><i style="width:${pct}%"></i></div></div>
      <button class="btn big" data-act="mix">Step on the mat 🤼</button>
      <h2 class="section">Training rooms</h2>
      <div class="grid">${Object.keys(CATS).map((k) => `<button class="room" data-act="cat" data-cat="${k}"><span class="em">${CATS[k].emoji}</span><span><b>${CATS[k].name}</b><small>${CATS[k].blurb}</small></span><span class="medal">${medal(k)}</span></button>`).join('')}</div>
      <div style="margin-top:22px"><button class="btn ghost" data-act="locker" style="width:100%">🏆 Locker room</button></div>
      <div class="footer">Each match is 12 problems, 3 periods. Get them right to score!</div>`;
  }

  function introHtml() {
    const m = match, o = m.opp;
    const title = m.cat === 'mix' ? 'Championship match' : CATS[m.cat].name;
    return `${topbar()}<div class="stage"><h3 style="color:var(--gold)">Weigh-in</h3><h2>${title}</h2>
      <div class="versus"><div class="fighter">${LOGO}<b>Little Beast</b></div><div class="vs">VS</div>
      <div class="fighter opp"><div class="big">${o.e}</div><b>${esc(o.name)}</b></div></div>
      <p class="taunt">${esc(o.name)}: “${esc(o.taunt)}”</p>
      <button class="btn big" data-act="whistle">Whistle! 🥇</button>
      <p style="margin-top:16px"><button class="btn ghost small" data-act="home">Back</button></p></div>`;
  }

  function periodHtml() {
    const m = match, p = m.i / m.per + 1;
    return `<div class="stage">${topbar()}<h3 style="color:var(--gold)">End of period ${p - 1}</h3>${board().replace(/Period \d/, 'Period ' + (p - 1))}
      ${ann()}<h2>${m.beast > m.oppScore ? 'Little Beast leads!' : m.beast < m.oppScore ? `${esc(m.opp.name)} leads` : 'All tied up!'}</h2>
      <p class="taunt">${m.beast >= m.oppScore ? 'Keep the pressure on.' : 'Plenty of time to come back. Stay focused!'}</p>
      <button class="btn big" data-act="period">Start period ${p}</button></div>`;
  }

  function playHtml() {
    const m = match, c = m.cur, p = c.p, st = curStep(), last = isLast();
    const fb = c.phase === 'fb', answering = !fb;
    let body = '';
    if (p.steps.length > 1) body += `<div class="stepn">Move ${c.step + 1} of ${p.steps.length}</div>`;
    body += `<p class="prompt">${p.prompt}</p>${p.visual || ''}<div class="stepq">${esc(st.q)}</div>`;
    if (st.kind === 'choice') {
      const visual = st.choices.some((x) => x.html.indexOf('<svg') >= 0);
      const two = st.choices.length <= 2;
      body += `<div class="choices ${visual ? 'visual' : ''} ${two && !visual ? 'one' : ''}">${st.choices.map((x, i) => {
        let cls = '';
        if (c.wrong.includes(x.v) || (fb && c.given === x.v && x.v !== st.answer)) cls = 'wrong';
        if (fb && x.v === st.answer) cls = 'right';
        return `<button class="choice ${cls}" data-act="choose" data-i="${i}" ${(fb || c.wrong.includes(x.v)) ? 'disabled' : ''}>${x.html}</button>`;
      }).join('')}</div>`;
    } else {
      const cls = fb ? (Number(c.given) === st.answer ? 'right' : 'wrong') : '';
      body += `<div class="numwrap"><div id="numdisp" class="numdisp ${cls}">${numText(st, c.input, fb ? c.given : null)}</div>
        ${answering ? `<div class="keypad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button class="key" data-act="key" data-k="${n}">${n}</button>`).join('')}
        <button class="key back" data-act="key" data-k="back">⌫</button><button class="key" data-act="key" data-k="0">0</button><button class="key go" data-act="key" data-k="go">GO</button></div>` : ''}</div>`;
    }
    if (c.showTip && answering) body += `<div class="tipbox"><b>Coach says:</b> ${esc(p.tip)}</div>`;
    if (fb) {
      const good = c.results[c.results.length - 1].ok;
      if (last && c.outcome) {
        const o = c.outcome;
        body += `<div class="movebanner ${o.allOk ? (o.clean ? 'good' : 'mid') : 'bad'}">${esc(o.move)}</div>`;
        if (!o.allOk) body += `<div class="explain"><b>Right answer:</b> ${esc(stepAnswerText(st))}<br>${p.explain}</div>`;
        else if (!o.clean) body += `<div class="explain">${p.explain}</div>`;
      } else if (!good) {
        body += `<div class="explain"><b>Right answer:</b> ${esc(stepAnswerText(st))}</div>`;
      }
      body += `<div class="actions"><span></span><button class="btn" data-act="next">${last ? 'Next problem' : 'Next move'} ▶</button></div>`;
    } else {
      body += `<div class="actions"><button class="btn ghost small" data-act="tip">💡 Coach tip</button><span style="opacity:.6;font-size:.9rem">${c.phase === 'retry' ? 'Escape attempt: try again for 1 point' : ''}</span></div>`;
    }
    return `${topbar(`<button class="btn ghost small" data-act="quit" style="margin-right:auto">${quitArm ? 'Tap again to quit' : '✕ Quit'}</button>`)}${board()}${ann()}<div class="card">${body}</div>`;
  }

  function numText(st, input, given) {
    const v = given != null ? given : input;
    return `${st.prefix || ''}${v === '' ? '&nbsp;' : esc(v)}${st.unit ? `<span class="u">${esc(st.unit)}</span>` : ''}`;
  }

  function resultHtml() {
    const m = match, r = m.result;
    const ri = rankIndex(state.xp);
    const film = m.missed.length ? `<div class="film"><h3>🎬 Film study</h3><ul>${m.missed.map((x) => `<li><em>${esc(x.skill)}:</em> ${esc(x.prompt)}<br>Answer: <b>${esc(x.answer)}</b><br><small>${esc(x.explain.replace(/<[^>]+>/g, ''))}</small></li>`).join('')}</ul></div>` : '';
    return `<div class="stage result">${topbar()}<h2 class="${r.win ? 'win' : 'loss'}">${r.pin ? 'Pin! 🏆' : r.win ? 'Victory! 🥇' : 'Tough loss'}</h2>
      <p class="taunt">${r.pin ? 'A perfect match. Every problem right the first time.' : r.win ? 'Nice work out there.' : 'Every champion loses matches. Study the film below, then get a rematch.'}</p>
      ${ann()}
      <div class="stats3"><div><b>${m.beast}–${m.oppScore}</b><small>Final score</small></div><div><b>${m.clean}/${m.total}</b><small>First try</small></div><div><b>+${r.gain}</b><small>XP earned</small></div></div>
      ${r.rankedUp ? `<div class="rankup">Rank up! You are now ${RANKS[ri].name}</div>` : ''}
      ${film}
      <div style="display:grid;gap:12px;margin-top:14px"><button class="btn big" data-act="rematch">Rematch</button><button class="btn ghost" data-act="home">Home</button></div></div>`;
  }

  function lockerHtml() {
    const ri = rankIndex(state.xp);
    const rows = Object.keys(SKILLS).map((id) => ({ id, s: state.stats[id] })).filter((x) => x.s && x.s.a > 0)
      .sort((a, b) => a.s.c / a.s.a - b.s.c / b.s.a);
    const skillRows = rows.length ? rows.map((x) => {
      const pct = Math.round((x.s.c / x.s.a) * 100);
      return `<div class="skillrow"><span>${SKILLS[x.id].name}</span><div class="bar ${pct < 60 ? 'low' : ''}"><i style="width:${pct}%"></i></div><b>${pct}%</b></div>`;
    }).join('') : '<p style="opacity:.75">Play a match and his skill scores will show up here. The lowest ones come first, so you can see where to practice.</p>';
    const medals = Object.keys(CATS).map((k) => `<div><span>${['⬜', '🥉', '🥈', '🥇'][state.medals[k] || 0]}</span>${CATS[k].name}</div>`).join('');
    return `${topbar('<button class="btn ghost small" data-act="home" style="margin-right:auto">◀ Home</button>')}
      <div class="hero"><h1>Locker room</h1></div>
      <div class="rank"><div class="row"><div class="name">${RANKS[ri].name}</div><div class="xp">${state.xp} XP</div></div></div>
      <div class="stats3"><div><b>${state.matches}</b><small>Matches</small></div><div><b>${state.wins}</b><small>Wins</small></div><div><b>${state.pins}</b><small>Pins</small></div></div>
      <h2 class="section">Skills (first-try accuracy)</h2><div class="film">${skillRows}</div>
      <h2 class="section">Medals</h2><div class="medals">${medals}</div>
      <p style="text-align:center;margin-top:8px;font-size:.85rem;opacity:.7">Medal: 10, 11, or 12 first-try answers in a training-room match.</p>
      <p style="text-align:center;margin-top:24px"><button class="btn ghost small" data-act="reset">${resetArm ? 'Tap again to erase everything' : 'Reset progress'}</button></p>`;
  }

  function render() {
    const html = view === 'home' ? homeHtml() : view === 'intro' ? introHtml() : view === 'play' ? playHtml()
      : view === 'period' ? periodHtml() : view === 'result' ? resultHtml() : lockerHtml();
    $app.innerHTML = html;
  }

  // ---------------------------------------------------------------- input
  function keyPress(k) {
    const c = match && match.cur; if (view !== 'play' || !c || (c.phase !== 'ask' && c.phase !== 'retry')) return;
    const st = curStep(); if (st.kind !== 'num') return;
    if (k === 'go') return submit(c.input);
    if (k === 'back') c.input = c.input.slice(0, -1);
    else if (c.input.length < 4) c.input = (c.input === '0' ? '' : c.input) + k;
    sfx.tap();
    const d = document.getElementById('numdisp'); if (d) d.innerHTML = numText(st, c.input, null);
  }

  document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') keyPress(e.key);
    else if (e.key === 'Backspace') keyPress('back');
    else if (e.key === 'Enter') { const c = match && match.cur; if (view === 'play' && c && c.phase === 'fb') act('next'); else keyPress('go'); }
  });

  function act(a, el) {
    ctx(); // unlock audio on first tap (iPad requirement)
    if (a !== 'quit') quitArm = false;
    if (a !== 'reset') resetArm = false;
    switch (a) {
      case 'sound': state.sound = !state.sound; save(); return render();
      case 'voice': state.voice = !state.voice; if (!state.voice && window.speechSynthesis) window.speechSynthesis.cancel(); save(); return render();
      case 'mix': return startMatch('mix');
      case 'cat': return startMatch(el.dataset.cat);
      case 'whistle': sfx.whistle(); match.line = line('p1', match.opp.name); match.kind = ''; say(match.line); return newProblem();
      case 'period': { const p = match.i / match.per + 1; sfx.whistle(); match.line = line(p === 2 ? 'p2' : 'p3', match.opp.name); match.kind = ''; say(match.line); return newProblem(); }
      case 'choose': { const st = curStep(); return submit(st.choices[Number(el.dataset.i)].v); }
      case 'key': return keyPress(el.dataset.k);
      case 'tip': match.cur.showTip = true; match.cur.hint = true; return render();
      case 'next': if (match.cur.phase === 'fb') nextStepOrProblem(); return;
      case 'quit': if (quitArm) { quitArm = false; view = 'home'; match = null; if (window.speechSynthesis) window.speechSynthesis.cancel(); return render(); } quitArm = true; return render();
      case 'home': view = 'home'; match = null; render(); return window.scrollTo(0, 0);
      case 'locker': view = 'locker'; render(); return window.scrollTo(0, 0);
      case 'rematch': return startMatch(match.cat);
      case 'reset': if (resetArm) { state = fresh(); save(); resetArm = false; view = 'home'; return render(); } resetArm = true; return render();
      default:
    }
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-act]'); if (!t || t.disabled) return;
    act(t.dataset.act, t);
  });

  if (/[?&]debug\b/.test(location.search)) window.__lbmDebug = () => ({ match, view, state });
  render();
})();
