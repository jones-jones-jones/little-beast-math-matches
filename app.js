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
  const fresh = () => ({ xp: 0, matches: 0, wins: 0, pins: 0, bestStreak: 0, stats: {}, medals: {}, sound: true, voice: true, trail: { t: 0, r: 0 }, titles: [], seasons: 0 });
  function load() {
    try { const j = JSON.parse(localStorage.getItem(KEY)); if (j && typeof j === 'object') return Object.assign(fresh(), j); } catch (e) { /* ignore */ }
    return fresh();
  }
  let state = load();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ } }

  // ---------------------------------------------------------------- tournaments
  // The trail he works through, in order. Edit names/towns/rounds here.
  const R3 = ['Round 1', 'Semifinal', 'Championship Final'];
  const R4 = ['Round 1', 'Quarterfinal', 'Semifinal', 'Championship Final'];
  const TOURNAMENTS = [
    { id: 'local', name: 'Alabama Local Open', emoji: '🏫', title: 'Local Champion', venue: 'a packed high school gym', blurb: 'Right here at home in Alabama', crowd: 0.7,
      rounds: R3, towns: ['Dothan, AL', 'Enterprise, AL', 'Opelika, AL', 'Cullman, AL', 'Decatur, AL', 'Gadsden, AL', 'Troy, AL', 'Selma, AL'] },
    { id: 'regionals', name: 'Southeast Regionals', emoji: '🏟️', title: 'Regional Champion', venue: 'a big convention center', blurb: 'The best kids in the Southeast', crowd: 0.85,
      rounds: R4, towns: ['Pensacola, FL', 'Columbus, GA', 'Tupelo, MS', 'Chattanooga, TN', 'Macon, GA', 'Mobile, AL', 'Jackson, MS', 'Knoxville, TN'] },
    { id: 'state', name: 'State Championships', emoji: '🏛️', title: 'State Champion', venue: 'the state championship arena', blurb: 'Only the best in Alabama', crowd: 1.0,
      rounds: R4, towns: ['Huntsville, AL', 'Birmingham, AL', 'Montgomery, AL', 'Auburn, AL', 'Hoover, AL', 'Tuscaloosa, AL', 'Florence, AL', 'Vestavia Hills, AL'] },
    { id: 'super32', name: 'Super 32', emoji: '⚡', title: 'Super 32 Champion', venue: 'a huge arena packed with fans', blurb: 'Top kids from all over the country', crowd: 1.15,
      rounds: ['Round of 32', 'Round of 16', 'Quarterfinal', 'Semifinal', 'Championship Final'], towns: ['Charlotte, NC', 'Richmond, VA', 'Lexington, KY', 'Columbus, OH', 'Franklin, TN', 'Indianapolis, IN', 'Pittsburgh, PA', 'Raleigh, NC'] },
    { id: 'nationals', name: 'Tulsa Nationals', emoji: '🏆', title: 'National Champion', venue: 'a giant arena in Tulsa, Oklahoma', blurb: 'The final tournament. The whole country is here', crowd: 1.3,
      finalOpp: { first: 'Bo', last: 'Bassett', name: 'Bo Bassett', town: 'Top seed', face: '👦', seed: true },
      rounds: ['Round of 32', 'Round of 16', 'Quarterfinal', 'Semifinal', 'Championship Final'], towns: ['Stillwater, OK', 'Ames, IA', 'Lincoln, NE', 'State College, PA', 'Bozeman, MT', 'Fargo, ND', 'Boise, ID', 'Spokane, WA'] },
  ];
  const TRAINING_TOWNS = [].concat(...TOURNAMENTS.map((t) => t.towns));

  // ---------------------------------------------------------------- opponents (made-up names)
  const FIRST = ['Jace', 'Colt', 'Brody', 'Wyatt', 'Tucker', 'Hunter', 'Bryce', 'Landon', 'Gunner', 'Kane', 'Ryder', 'Cooper', 'Beau', 'Trey', 'Dax', 'Tate', 'Elijah', 'Mason', 'Silas', 'Knox', 'Ezra', 'Micah', 'Declan', 'Roman', 'Grady', 'Jett', 'Bo', 'Carter', 'Levi', 'Nash'];
  const LAST = ['Whitfield', 'Calloway', 'Stringer', 'Pruitt', 'Hollis', 'Rutledge', 'Tolliver', 'Mabry', 'Gentry', 'Ledbetter', 'Crenshaw', 'Holloway', 'Prescott', 'Vance', 'Dawson', 'Sutter', 'Merritt', 'Kessler', 'Brandt', 'Novak', 'Ferris', 'Lockhart', 'Mercer', 'Quinn', 'Tanner', 'Whitaker', 'Boyd', 'Cross', 'Hale', 'Ramsey'];
  const FACES = ['🧒🏻', '🧒🏼', '🧒🏽', '🧒🏾', '🧒🏿', '👦🏻', '👦🏼', '👦🏽', '👦🏾', '👦🏿'];
  function makeOpp(towns) {
    const first = pick(FIRST), last = pick(LAST);
    return { first, last, name: `${first} ${last}`, town: pick(towns), face: pick(FACES) };
  }

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
    cheer(k) { // crowd roar, a burst of claps, and a rising fanfare. k = crowd size (bigger tournaments roar louder)
      k = k || 0.8;
      noise(1.4 + k * 0.5, 1500, 0.6, 0.32 * k, 0, 0.12); noise(1.4 + k * 0.5, 650, 0.7, 0.24 * k, 0.04, 0.15);
      for (let i = 0; i < 10 + Math.round(k * 8); i++) noise(0.05, 2600 + Math.random() * 1500, 1.2, 0.16 * k, 0.15 + i * 0.07 + Math.random() * 0.03, 0.004, 'highpass');
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', i * 0.09, 0.11));
    },
    oh() { noise(0.9, 500, 0.8, 0.22, 0, 0.1); tone(330, 0.45, 'sawtooth', 0, 0.08, 190); }, // crowd "ooooh"
    groan() { noise(1.1, 420, 0.8, 0.26, 0, 0.12); tone(260, 0.6, 'sawtooth', 0, 0.09, 130); },
    whistle() { tone(2300, 0.14, 'square', 0, 0.05); tone(2050, 0.4, 'square', 0.15, 0.05); },
    bell() { tone(880, 0.9, 'sine', 0, 0.2); tone(1320, 0.7, 'sine', 0, 0.07); },
    win(k) { k = k || 0.8; [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.25, 'triangle', i * 0.13, 0.13)); noise(2, 1500, 0.6, 0.3 * k, 0.2, 0.2); },
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

  // Real folkstyle moves. Each has a banner name and an announcer call ({o} = opponent's first name).
  const mv = (name, text) => ({ name, text });
  const MOVES = {
    takedown: [
      mv('Double leg', 'Little Beast shoots a double leg on {o}! Takedown!'),
      mv('Single leg', 'Look at that single leg! Little Beast finishes it and scores!'),
      mv('High crotch', 'Little Beast drives through a high crotch on {o}! Two points!'),
      mv('Ankle pick', 'Quick ankle pick by Little Beast! {o} hits the mat!'),
      mv("Fireman's carry", "Fireman's carry! Little Beast puts {o} on the mat!"),
      mv('Arm drag', 'Beautiful arm drag, and Little Beast is right behind {o}! Takedown!'),
      mv('Snap down', 'Little Beast snaps {o} down and spins behind! Takedown!'),
    ],
    reversal: [
      mv('Switch', 'What a switch by Little Beast! He reverses {o} and takes control!'),
      mv('Sit-out and turn', 'Little Beast sits out, turns, and reverses {o}! Two points!'),
      mv('Granby roll', 'Granby roll! Little Beast rolls right out and comes up on top of {o}!'),
    ],
    near: [
      mv('Cradle', 'Little Beast gets {o} in a cradle for back points!'),
      mv('Tilt', 'Little Beast sticks a tilt on {o}! Back points, and the ref is counting!'),
      mv('Double arm bar', 'Double arm bar! Little Beast turns {o} onto his back for near fall!'),
      mv('Butcher block', 'Little Beast locks up the butcher block and rolls {o} over! Near fall!'),
      mv('Half nelson', 'Little Beast turns {o} with a half nelson! Back points!'),
      mv('Power half', 'Big power half by Little Beast! {o} is going over!'),
      mv('Far-side cradle', 'Far-side cradle! Little Beast has {o} in serious trouble!'),
    ],
    escape: [
      mv('Stand-up', 'Little Beast stands up and breaks free! Escape, one point!'),
      mv('Sit-out', 'Little Beast sits out and gets away from {o}! Escape!'),
      mv('Hip heist', 'Nice hip heist by Little Beast! He slips out and escapes!'),
    ],
    lost: [ // the opponent scores
      mv('Double leg', '{o} shoots a double leg and gets it. Two points for {o}. Shake it off, Little Beast!'),
      mv('Single leg', '{o} finishes a single leg. Little Beast, get back to your feet!'),
      mv('High crotch', '{o} hits a high crotch and scores. Little Beast, this match is not over!'),
      mv('Ankle pick', '{o} picks the ankle and scores. Little Beast, get back up and get after it!'),
      mv('Arm drag', '{o} drags the arm and gets behind. Little Beast is a fighter, so back to the neutral position!'),
    ],
  };
  const LINES = {
    stuck: [ // the opponent has a hold on him and he gets a second try
      '{o} has Little Beast in a headlock. Let\'s see if he can get out of it!',
      '{o} is cranking a cross-face. Come on, Little Beast, think it through and try again!',
      '{o} has a tight waist on Little Beast. Can he fight off the hold?',
      '{o} shoots and grabs a leg! Can Little Beast sprawl and get out of it?',
      'Little Beast is on the bottom, and {o} has a ride. Stay calm, Little Beast, find the escape!',
      '{o} is trying to tilt Little Beast! Can he fight it off and try again?',
      '{o} threatens a double arm bar! Little Beast, stay tight and find a way out!',
      '{o} has a front headlock. Little Beast, get those hips back and try again!',
      'Careful, Little Beast! {o} is looking for the butcher block. Time to escape!',
      '{o} has a half nelson in. Little Beast, bridge and fight your way out!',
    ],
    step: ['Nice move! Keep going, Little Beast!', 'He has the first part! Now finish it!', 'Good hand fighting, Little Beast! Stay on the attack!'],
    p1: ['Wrestlers are set. Period one. Whistle!', 'Little Beast and {o} shake hands. Here we go!'],
    p2: ['Period two! Little Beast, your choice of position!'],
    p3: ['Third and final period! Everything is on the line!'],
    sudden: ['It is tied! Sudden victory! First score wins the match!'],
  };
  const call = (mo, o) => mo.text.replace(/\{o\}/g, o);
  const line = (k, o) => pick(LINES[k]).replace(/\{o\}/g, o);

  // ---------------------------------------------------------------- match state
  let view = 'home';
  let match = null;
  let quitArm = false, resetArm = false;

  function newMatch(cat, opp, tour) {
    match = { cat, opp, tour: tour || null, i: 0, total: 12, per: 4, beast: 0, oppScore: 0, streak: 0, best: 0, clean: 0, seen: new Set(), lastSkill: null, missed: [], cur: null, line: '', kind: '', pop: '' };
    quitArm = false; view = 'intro'; render(); window.scrollTo(0, 0);
  }
  const startMatch = (cat) => newMatch(cat, makeOpp(TRAINING_TOWNS), null); // training room / exhibition
  function startTournamentMatch() {
    const tr = state.trail; if (tr.t >= TOURNAMENTS.length) return;
    const T = TOURNAMENTS[tr.t], isFinal = tr.r === T.rounds.length - 1;
    newMatch('mix', T.finalOpp && isFinal ? Object.assign({}, T.finalOpp) : makeOpp(T.towns), { t: tr.t, r: tr.r });
  }
  const crowd = () => (match && match.tour ? TOURNAMENTS[match.tour.t].crowd : 0.8);

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
    const o = match.opp.first;
    if (ok) {
      c.results.push({ ok: true, tries: c.tries + 1 });
      c.phase = 'fb';
      if (isLast()) resolveProblem(); else { sfx.good(); match.line = line('step', o); match.kind = 'good'; say(match.line); }
    } else if (c.tries === 0 && !(st.kind === 'choice' && st.choices.length <= 2)) { // no retry when only one option would be left
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
    const c = match.cur, m = match, o = m.opp.first;
    const allOk = c.results.length === c.p.steps.length && c.results.every((r) => r.ok);
    const clean = allOk && c.results.every((r) => r.tries === 1) && !c.hint;
    const s = state.stats[c.p.skill] || (state.stats[c.p.skill] = { a: 0, c: 0 });
    s.a++; if (clean) s.c++;
    let move, pts = 0, opp = 0;
    if (clean) {
      m.streak++; m.best = Math.max(m.best, m.streak); m.clean++;
      if (m.streak % 3 === 0) { const mo = pick(MOVES.near); pts = 3; move = `${mo.name}! Near fall +3`; m.line = call(mo, o); }
      else { const rev = Math.random() < 0.25, mo = pick(rev ? MOVES.reversal : MOVES.takedown); pts = 2; move = `${mo.name}! ${rev ? 'Reversal' : 'Takedown'} +2`; m.line = call(mo, o); }
      m.kind = 'good'; sfx.cheer(crowd());
    } else if (allOk) {
      m.streak = 0; { const mo = pick(MOVES.escape); pts = 1; move = `${mo.name}! Escape +1`; m.line = call(mo, o); } m.kind = 'good'; sfx.cheer(crowd());
    } else {
      m.streak = 0; { const mo = pick(MOVES.lost); opp = 2; move = `${o}: ${mo.name} +2`; m.line = call(mo, o); } m.kind = 'bad'; sfx.groan();
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
      if (match.beast === match.oppScore) { match.line = line('sudden', match.opp.first); match.kind = ''; sfx.whistle(); say(match.line); return newProblem(); }
      return endMatch();
    }
    if (match.i > match.total) return endMatch();
    if (match.i % match.per === 0) { view = 'period'; sfx.bell(); render(); window.scrollTo(0, 0); return; }
    match.line = ''; match.kind = ''; newProblem();
  }

  function endMatch() {
    const m = match, first = m.opp.first;
    const win = m.beast > m.oppScore, pin = win && m.clean === m.total;
    const gain = m.beast + (win ? 5 : 0) + (pin ? 10 : 0);
    state.xp += gain; state.matches++; if (win) state.wins++; if (pin) state.pins++;
    state.bestStreak = Math.max(state.bestStreak, m.best);
    if (m.cat !== 'mix') { const lvl = m.clean >= m.total ? 3 : m.clean >= 11 ? 2 : m.clean >= 10 ? 1 : 0; if (lvl > (state.medals[m.cat] || 0)) state.medals[m.cat] = lvl; }
    // tournament bracket: a win advances a round; a loss means the wrestlebacks (same round, new opponent)
    let adv = null;
    const T = m.tour ? TOURNAMENTS[m.tour.t] : null;
    if (T && win) {
      const tr = state.trail; adv = { title: false, allDone: false, next: null }; tr.r++;
      if (tr.r >= T.rounds.length) { state.titles.push(T.id); adv.title = true; tr.t++; tr.r = 0; if (tr.t >= TOURNAMENTS.length) adv.allDone = true; }
      if (!adv.allDone) adv.next = { T: TOURNAMENTS[tr.t], round: TOURNAMENTS[tr.t].rounds[tr.r] };
    }
    save();
    m.result = { win, pin, gain, adv, T };
    if (T) {
      m.line = adv && adv.allDone ? `Little Beast is the ${T.title}! He beats ${m.opp.name} and wins the ${T.name}, and the whole arena is on its feet! What a season!`
        : adv && adv.title ? `That's the title! Little Beast wins the ${T.name}! He is the ${T.title}!`
        : adv ? (pin ? `IT'S A PIN! Little Beast pins ${first} and moves on to the ${adv.next.round}!` : `That's the match! Little Beast beats ${first}, ${m.beast} to ${m.oppScore}, and moves on to the ${adv.next.round}!`)
        : `${first} takes this one, ${m.oppScore} to ${m.beast}. But Little Beast drops to the wrestlebacks, and he is still alive in this tournament!`;
    } else {
      m.line = pin ? 'IT\'S A PIN! Little Beast wins by fall! The crowd is going wild!'
        : win ? `That's the match! Little Beast wins ${m.beast} to ${m.oppScore}!`
          : `${first} takes this one, ${m.oppScore} to ${m.beast}. Little Beast will be back! Study the film and get a rematch!`;
    }
    m.kind = win ? 'good' : 'bad';
    if (win) { sfx.win(crowd()); if (adv && adv.title) sfx.cheer(1.3); } else sfx.groan();
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

  function trailHtml() {
    const tr = state.trail, done = tr.t >= TOURNAMENTS.length;
    const stops = TOURNAMENTS.map((T, i) => {
      const st = i < tr.t ? 'done' : i === tr.t ? 'current' : 'locked';
      const dots = T.rounds.map((_, ri) => `<i class="${st === 'done' || (st === 'current' && ri < tr.r) ? 'on' : ''} ${st === 'current' && ri === tr.r ? 'now' : ''}"></i>`).join('');
      const sub = st === 'current' ? `${T.rounds[tr.r]} · ${T.blurb}` : st === 'done' ? `✔ ${T.title}` : T.blurb;
      return `<div class="stop ${st}"><span class="em">${st === 'locked' ? '🔒' : T.emoji}</span><span class="nm"><b>${T.name}</b><small>${esc(sub)}</small></span><span class="dots">${dots}</span></div>`;
    }).join('');
    const cur = TOURNAMENTS[Math.min(tr.t, TOURNAMENTS.length - 1)];
    const cta = done
      ? `<div class="rankup">🏆 National Champion! You won every tournament.</div><button class="btn big" data-act="season">Start a new season 🔁</button>`
      : `<button class="btn big" data-act="continue">Next match: ${cur.rounds[tr.r]} ▶<small>${cur.name}</small></button>`;
    return `${cta}<h2 class="section">Tournament trail</h2><div class="trail">${stops}</div>`;
  }

  function homeHtml() {
    const medal = (k) => ['', '🥉', '🥈', '🥇'][state.medals[k] || 0];
    return `${topbar()}
      <div class="hero">${LOGO}<h1>Little Beast<span>Math Matches</span></h1><p>Folkstyle Edition</p></div>
      ${trailHtml()}
      <h2 class="section">Training rooms</h2>
      <div class="grid">${Object.keys(CATS).map((k) => `<button class="room" data-act="cat" data-cat="${k}"><span class="em">${CATS[k].emoji}</span><span><b>${CATS[k].name}</b><small>${CATS[k].blurb}</small></span><span class="medal">${medal(k)}</span></button>`).join('')}</div>
      <div style="margin-top:22px;display:grid;gap:12px"><button class="btn ghost" data-act="mix">🤼 Practice match (mixed)</button><button class="btn ghost" data-act="locker">🏆 Locker room</button></div>
      <div class="footer">Each match is 12 problems, 3 periods. Get them right to score!</div>`;
  }

  function introHtml() {
    const m = match, o = m.opp, T = m.tour ? TOURNAMENTS[m.tour.t] : null;
    const title = T ? `${T.rounds[m.tour.r]}` : (m.cat === 'mix' ? 'Practice match' : CATS[m.cat].name);
    const banner = T ? `<div class="tbanner"><span>${T.emoji}</span><b>${T.name}</b><small>${esc(T.venue)}</small></div>` : '';
    return `${topbar()}<div class="stage">${banner}<h3 style="color:var(--gold)">${T ? 'Weigh-in' : 'Warm-up'}</h3><h2>${title}</h2>
      <div class="versus"><div class="fighter">${LOGO}<b>Little Beast</b><small>Alabama</small></div><div class="vs">VS</div>
      <div class="fighter opp"><div class="big">${o.face}</div><b>${esc(o.name)}</b><small>${esc(o.town)}</small></div></div>
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
    const m = match, r = m.result, T = r.T, adv = r.adv;
    const film = m.missed.length ? `<div class="film"><h3>🎬 Film study</h3><ul>${m.missed.map((x) => `<li><em>${esc(x.skill)}:</em> ${esc(x.prompt)}<br>Answer: <b>${esc(x.answer)}</b><br><small>${esc(x.explain.replace(/<[^>]+>/g, ''))}</small></li>`).join('')}</ul></div>` : '';
    let box = '', btn = `<button class="btn big" data-act="rematch">Rematch</button>`;
    if (T) {
      if (adv && adv.allDone) { box = `<div class="rankup">🏆 ${T.title}! Every tournament won!</div>`; btn = ''; }
      else if (adv && adv.title) box = `<div class="rankup">${T.emoji} ${T.title}! Next stop: ${adv.next.T.name}</div>`;
      else if (adv) box = `<div class="advance">Advance to the ${adv.next.round}</div>`;
      else box = `<div class="advance loss">Wrestlebacks! Win the rematch to stay alive in the ${T.name}.</div>`;
      if (adv && !adv.allDone) btn = `<button class="btn big" data-act="rematch">Next match: ${adv.next.round}<small>${adv.next.T.name}</small></button>`;
      else if (!adv) btn = `<button class="btn big" data-act="rematch">Wrestle back</button>`;
    }
    return `<div class="stage result">${topbar()}<h2 class="${r.win ? 'win' : 'loss'}">${r.pin ? 'Pin! 🏆' : r.win ? 'Victory! 🥇' : 'Tough loss'}</h2>
      <p class="taunt">${r.pin ? 'A perfect match. Every problem right the first time.' : r.win ? 'Nice work out there.' : 'Every champion loses matches. Study the film below, then get back out there.'}</p>
      ${ann()}
      <div class="stats3"><div><b>${m.beast}–${m.oppScore}</b><small>Final score</small></div><div><b>${m.clean}/${m.total}</b><small>First try</small></div><div><b>+${r.gain}</b><small>Points earned</small></div></div>
      ${box}
      ${film}
      <div style="display:grid;gap:12px;margin-top:14px">${btn}<button class="btn ghost" data-act="home">Home</button></div></div>`;
  }

  function lockerHtml() {
    const rows = Object.keys(SKILLS).map((id) => ({ id, s: state.stats[id] })).filter((x) => x.s && x.s.a > 0)
      .sort((a, b) => a.s.c / a.s.a - b.s.c / b.s.a);
    const skillRows = rows.length ? rows.map((x) => {
      const pct = Math.round((x.s.c / x.s.a) * 100);
      return `<div class="skillrow"><span>${SKILLS[x.id].name}</span><div class="bar ${pct < 60 ? 'low' : ''}"><i style="width:${pct}%"></i></div><b>${pct}%</b></div>`;
    }).join('') : '<p style="opacity:.75">Play a match and his skill scores will show up here. The lowest ones come first, so you can see where to practice.</p>';
    const medals = Object.keys(CATS).map((k) => `<div><span>${['⬜', '🥉', '🥈', '🥇'][state.medals[k] || 0]}</span>${CATS[k].name}</div>`).join('');
    const titles = TOURNAMENTS.map((T) => { const n = state.titles.filter((x) => x === T.id).length; return `<div><span>${n ? T.emoji : '⬜'}</span>${n ? T.title + (n > 1 ? ` ×${n}` : '') : T.name}</div>`; }).join('');
    return `${topbar('<button class="btn ghost small" data-act="home" style="margin-right:auto">◀ Home</button>')}
      <div class="hero"><h1>Locker room</h1></div>
      <div class="stats3"><div><b>${state.matches}</b><small>Matches</small></div><div><b>${state.wins}</b><small>Wins</small></div><div><b>${state.pins}</b><small>Pins</small></div></div>
      <h2 class="section">Tournament titles</h2><div class="medals">${titles}</div>
      <h2 class="section">Skills (first-try accuracy)</h2><div class="film">${skillRows}</div>
      <h2 class="section">Training medals</h2><div class="medals">${medals}</div>
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
      case 'continue': return startTournamentMatch();
      case 'season': state.trail = { t: 0, r: 0 }; state.seasons++; save(); return render();
      case 'whistle': {
        sfx.whistle(); const m = match, o = m.opp;
        if (m.tour) { const T = TOURNAMENTS[m.tour.t]; m.line = `Welcome to the ${T.name}! It's the ${T.rounds[m.tour.r]}, and ${o.seed ? `top seed ${o.name}` : `${o.first} from ${o.town}`} is on the mat against Little Beast. Whistle!`; }
        else m.line = line('p1', o.first);
        m.kind = ''; say(m.line); return newProblem();
      }
      case 'period': { const p = match.i / match.per + 1; sfx.whistle(); match.line = line(p === 2 ? 'p2' : 'p3', match.opp.first); match.kind = ''; say(match.line); return newProblem(); }
      case 'choose': { const st = curStep(); return submit(st.choices[Number(el.dataset.i)].v); }
      case 'key': return keyPress(el.dataset.k);
      case 'tip': match.cur.showTip = true; match.cur.hint = true; return render();
      case 'next': if (match.cur.phase === 'fb') nextStepOrProblem(); return;
      case 'quit': if (quitArm) { quitArm = false; view = 'home'; match = null; if (window.speechSynthesis) window.speechSynthesis.cancel(); return render(); } quitArm = true; return render();
      case 'home': view = 'home'; match = null; render(); return window.scrollTo(0, 0);
      case 'locker': view = 'locker'; render(); return window.scrollTo(0, 0);
      case 'rematch': return match.tour ? startTournamentMatch() : startMatch(match.cat);
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
