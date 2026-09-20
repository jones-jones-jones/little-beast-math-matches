# Little Beast Math Matches

Folkstyle-wrestling themed 3rd-grade math practice. Plain HTML/CSS/JS, no build step, no accounts.
Progress (rank, XP, skill accuracy, medals) is saved in the browser on the device it is played on.

## Files
- `index.html`, `style.css`, `app.js` — the game (screens, scoring, sounds, announcer)
- `problems.js` — every problem type. One generator function per skill.
- `assets/logo.png` — his logo (512x512, shown on the home and weigh-in screens).
- `assets/icon-180.png` — iPad home-screen icon and browser tab icon.

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

**Match:** 12 problems = 3 periods of 4. First-try correct +2 (every 3rd in a row is a +3 near fall).
Wrong first try = the announcer calls for a retry ("escape attempt", +1 if right). Two-choice questions get no retry.
Second miss = opponent +2. Tied after 12 = sudden victory. 12/12 first try = pin.
Training rooms (one skill category) and the mixed practice match do not move the tournament bracket; training rooms earn medals.

Sounds: crowd cheer on a score, crowd "ooh" on a miss, whistle and bell. Announcer text is always on screen and is
spoken aloud with the device's built-in voice. The two buttons at the top toggle sound and the announcer voice.
Debug: add `?debug` to the URL to expose `window.__lbmDebug()`.
