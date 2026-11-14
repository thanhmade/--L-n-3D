#!/usr/bin/env python3
"""Fetch + verify original CC0 game audio from OpenGameArt, with deterministic filenames.

The site bundle contains these *redistributable CC0* recordings. We do not modify
or redistribute proprietary music. No API keys or user data are required.
"""
from pathlib import Path
from urllib.request import Request, urlopen
import sys, time, zipfile, io

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'assets' / 'audio'
HOST = 'https://opengameart.org/sites/default/files/'
MUSIC = {
    'music/village.mp3': ('TownTheme.mp3', b'ID3', 400_000),
    'music/forest.mp3': ('Forest_Ambience.mp3', b'ID3', 250_000),
    'music/crystal.mp3': ('crystal_cave.mp3', b'ID3', 1_000_000),
    'music/battle.ogg': ('fairy_battles_bpm180_0.ogg', b'OggS', 800_000),
    'ambience/birds.ogg': ('birds-isaiah658.ogg', b'OggS', 60_000),
}
# Mapping: public CC0 zip archive filename -> extracted filename.
RUBBERDUCK = ['blade_01', 'spell_01', 'spell_02', 'creature_hurt_01', 'creature_die_01',
              'creature_slime_01', 'creature_roar_01', 'item_coins_01', 'item_coins_02',
              'item_misc_01', 'item_gem_01', 'wood_01', 'misc_01', 'metal_01']
KENNEY = ['footstep04', 'knifeSlice']
ZIPS = {
    'RPGsounds_Kenney.zip': {'OGG/footstep04.ogg': 'sfx/footstep.ogg',
                             'OGG/knifeSlice.ogg': 'sfx/knife_slice.ogg'},
    '80-CC0-RPG-SFX_0.zip': {f'{n}.ogg': f'sfx/{n}.ogg' for n in RUBBERDUCK},
}
# A few mirrors rename the second archive. This is the tested OpenGameArt download URL.

def get(url):
    err = None
    for attempt in range(3):
        try:
            req = Request(url, headers={'User-Agent': 'MushroomGame3D/0.3 (CC0 build; https://github.com/thanhmade/--L-n-3D)', 'Accept': '*/*'})
            with urlopen(req, timeout=40) as response:
                result = response.read(30_000_000)
            if not result: raise ValueError('Empty response')
            return result
        except Exception as ex:
            err = ex
            if attempt != 2: time.sleep(1.5 * (attempt + 1))
    raise RuntimeError(f'Không thể tải {url}: {err}')

def write(rel,data,magic,size):
    if len(data) < size: raise ValueError(f'{rel}: kích thước {len(data)} không hợp lệ (< {size})')
    if magic == b'ID3' and not (data.startswith(b'ID3') or data[:1] == b'\xff'):
        raise ValueError(f'{rel}: nội dung không phải MP3')
    elif magic != b'ID3' and not data.startswith(magic):
        raise ValueError(f'{rel}: nội dung sai định dạng {magic!r}')
    destination = BASE / rel
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(data)
    print(f'  ✓ {rel} ({len(data) // 1024} KiB)',flush=True)

def main():
    BASE.mkdir(parents=True, exist_ok=True)
    print('Tải các bản nhạc CC0 từ OpenGameArt (kèm ghi nguồn):',flush=True)
    for dest,(name,magic,minsize) in MUSIC.items():
        old=BASE/dest
        if old.exists() and old.stat().st_size>=minsize:
            print('  ✓ Đã có',dest,flush=True);continue
        write(dest,get(HOST+name),magic,minsize)
    for filename,files in ZIPS.items():
        if all((BASE/target).exists() and (BASE/target).stat().st_size>250 for target in files.values()):
            print('  ✓ Đã có hiệu ứng',filename,flush=True);continue
        archive=get(HOST+filename)
        if not archive.startswith(b'PK'):
            raise ValueError('Tải về không phải ZIP: '+filename)
        with zipfile.ZipFile(io.BytesIO(archive)) as src:
            for member,target in files.items():
                content=src.read(member)  # fails safely if asset is renamed or omitted
                write(target,content,b'OggS',250)
    print('Hoàn tất; giấy phép và tác giả ở docs/AUDIO-CREDITS.md')

if __name__ == '__main__':
    try:main()
    except Exception as ex:
        print(f'ERROR: {ex}',file=sys.stderr)
        sys.exit(1)
