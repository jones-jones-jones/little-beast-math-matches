#!/usr/bin/env python3
"""Make recorded clips for the words the app reads aloud (the iPad's own voice is silent on some devices).

Run after changing the weekly words in content.js:
    python3 tools/make_audio.py --voice /path/to/en_US-lessac-medium.onnx
It reads content.js, writes assets/audio/*.wav plus assets/audio/manifest.js, then you commit and push.
Needs `piper` (pip install piper-tts) and `node`. The voice model is a one-time ~60 MB download from
https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/lessac/medium
"""
import argparse, hashlib, json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'audio')

def slug(text):
    base = re.sub(r'[^a-z0-9]+', '-', text.lower()).strip('-')[:40] or 'clip'
    return base + '-' + hashlib.md5(text.encode()).hexdigest()[:6]

def texts():
    js = "global.window=global;require('./content.js');process.stdout.write(JSON.stringify(window.LBM_CONTENT))"
    c = json.loads(subprocess.check_output(['node', '-e', js], cwd=ROOT))
    spelling = [w.strip() for w in re.split(r'[\n,]+', c.get('spelling', '')) if w.strip()]
    return spelling

def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--voice', required=True); a = ap.parse_args()
    os.makedirs(OUT, exist_ok=True)
    manifest = {}
    old = {}
    mp = os.path.join(OUT, 'manifest.js')
    if os.path.exists(mp):  # keep clips from earlier weeks so saved lists still work
        m = re.search(r'=\s*(\{.*\});?\s*$', open(mp).read(), re.S)
        if m: old = json.loads(m.group(1))
    manifest.update(old)
    for t in texts():
        f = slug(t) + '.wav'
        if not os.path.exists(os.path.join(OUT, f)):
            subprocess.run(['piper', '-m', a.voice, '-f', os.path.join(OUT, f), '--length-scale', '1.1'],
                           input=t.encode(), check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            print('made', f)
        manifest[t] = f
    with open(mp, 'w') as fh:
        fh.write('(typeof window !== "undefined" ? window : self).LBM_AUDIO = ' + json.dumps(manifest, indent=0, sort_keys=True) + ';\n')
    print(len(manifest), 'clips in manifest')

if __name__ == '__main__':
    main()
