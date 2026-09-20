# Little Beast Math Matches

Folkstyle-wrestling themed 3rd-grade math practice. Plain HTML/CSS/JS, no build step, no accounts.
Progress (rank, XP, skill accuracy, medals) is saved in the browser on the device it is played on.

## Files
- `index.html`, `style.css`, `app.js` — the game (screens, scoring, sounds, announcer)
- `problems.js` — every problem type. One generator function per skill.
- `assets/logo.svg` — stand-in drawing of his logo. Drop his real logo in as `assets/logo.png` and the app uses it automatically.
- `assets/icon-180.png` — iPad home-screen icon (replace with a 180x180 PNG of the real logo).

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
12 problems = 3 periods of 4. First-try correct +2 (every 3rd in a row is a +3 near fall).
Wrong first try = the announcer calls for a retry ("escape attempt", +1 if right). Second miss = opponent +2.
Tied after 12 = sudden victory. 12/12 first try = pin.
Ranks: Mat Rookie > Novice > JV Starter > Varsity > Regional Champ > State Finalist > State Champ.
Sounds: crowd cheer on a score, crowd "ooh" on a miss, whistle and bell. Announcer text is always on screen and is
spoken aloud with the device's built-in voice. The two buttons at the top toggle sound and the announcer voice.
Debug: add `?debug` to the URL to expose `window.__lbmDebug()`.
