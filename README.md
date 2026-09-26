# Little Beast's Homework Throwdown

Folkstyle-wrestling themed 3rd-grade homework practice: math, spelling, and vocabulary. Plain HTML/CSS/JS, no build step, no accounts.
Progress (rank, XP, skill accuracy, medals) is saved in the browser on the device it is played on.

## Files
- `index.html`, `style.css`, `app.js` — the game (screens, scoring, sounds, announcer, subjects, words screen)
- `problems.js` — every math problem type (one generator per skill) and the skill picker
- `words.js` — spelling and vocabulary problem types and the parsers for the word lists
- `content.js` — the default word lists (this week's spelling + vocabulary, from the school sheets)
- `sw.js` — offline support (caches the app after one online visit; bump `VERSION` in it to force a fresh cache)
- `assets/logo.png`, `assets/icon-180.png` — his logo and the iPad home-screen icon

## Subjects
Home has the combined **Tournament Trail** (mixes math, spelling, and vocabulary: about 60/20/20) and a **Pick a subject** row: Math (6 training rooms), Spelling, Vocabulary.
**Spelling** gets harder as he goes: missing letters, then hear the word and pick the spelling, then hear it and type it.
In a tournament the stage follows the round (early rounds easy, the final hardest); in the Spelling room and practice match it follows the period.
**Vocabulary** is multiple choice (meaning, find the word, fill in the sentence) with a "hear it in a sentence" button.
Words he misses come back more often. Spelling audio uses the iPad's built-in voice.

## Every week
Tap **This week's words** on the home screen, type or paste the new spelling list and vocabulary (`word (verb): meaning | sample sentence`), Save.
It is stored on that iPad. To change the defaults that ship with the app, edit `content.js` (the sample sentences in it were written for reading aloud, not from the school).

## Offline (car trips, no signal)
Open the live site once on Wi-Fi, then Share > Add to Home Screen and launch it from that icon. It caches itself and runs with no connection; progress stays on the iPad. Spelling audio uses the iPad's built-in voice, so it works offline too. Updates arrive the next time it is opened with a connection.

## Run it
    cd little-beast-math-matches
    python3 -m http.server 8090
Then open http://localhost:8090 (or the computer's address on the same Wi-Fi, from the iPad).
On the iPad in Safari: Share > Add to Home Screen. It then opens full screen like an app.

## Adding problems from a new test
1. Write a generator in `problems.js` (copy a similar one; return `{skill, prompt, visual, steps, tip, explain}`).
2. Register it in `SKILLS` with a category. Word problems live in the `story` category and are weighted higher in mixed matches.
3. Skills he misses more often are picked more often automatically.

## Game rules
**Tournament trail** (edit `TOURNAMENTS` at the top of `app.js` to rename tournaments, towns, or rounds):
Alabama Local Open (3 rounds) > Southeast Regionals (4) > State Championships (4) > Super 32 (5) > Tulsa Nationals (5).
Win a match to advance a round. A loss = wrestlebacks: same round, new opponent, no penalty. Win the final to earn the title
and unlock the next tournament. After Tulsa: "Start a new season". Bigger tournaments have a louder crowd cheer.
Opponents are made-up first + last names with real hometowns; the announcer uses their first name.
The Tulsa Nationals Championship Final is always against Bo Bassett (`finalOpp` in `TOURNAMENTS`); the other rounds are random.
Score banners and announcer calls use real folkstyle moves (`MOVES` in `app.js`): takedowns (double leg, single leg, high crotch, ankle pick, fireman's carry, arm drag, snap down), reversals (switch, sit-out and turn, Granby roll), near falls (cradle, tilt, double arm bar, butcher block, half nelson, power half, far-side cradle), escapes (stand-up, sit-out, hip heist).

**Match:** 12 problems = 3 periods of 4. First-try correct +2 (every 3rd in a row is a +3 near fall).
Wrong first try = the announcer calls for a retry ("escape attempt", +1 if right). Two-choice questions get no retry.
Second miss = opponent +2. Tied after 12 = sudden victory. 12/12 first try = pin.
Training rooms (one skill category) and the mixed practice match do not move the tournament bracket; training rooms earn medals.

Sounds: crowd cheer on a score, crowd "ooh" on a miss, whistle and bell. Announcer text is always on screen and is
spoken aloud with the device's built-in voice. The two buttons at the top toggle sound and the announcer voice.
Debug: add `?debug` to the URL to expose `window.__lbmDebug()`.
