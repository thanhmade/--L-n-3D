#!/usr/bin/env python3
"""Generate a static Vercel output with licensed media bundled, no hotlinking."""
from pathlib import Path
import subprocess,sys,shutil
ROOT=Path(__file__).resolve().parents[1]
subprocess.run([sys.executable,str(ROOT/'scripts/download_audio.py')],check=True,cwd=ROOT)
DIST=ROOT/'dist'
if DIST.exists():shutil.rmtree(DIST)
DIST.mkdir(parents=True)
for name in ('index.html','style.css','game.js','audio.js','npcs.js','icon.svg','manifest.webmanifest'):
    shutil.copy2(ROOT/name,DIST/name)
shutil.copytree(ROOT/'assets/audio',DIST/'assets/audio')
print(f'Vercel output: {DIST} / 4 songs + ambience + sound effects')
