/**
 * Nấm Lùn 3D: vendor CC0 audio at BUILD time (not runtime hotlinking).
 * Origin, authors and license: docs/AM-THANH-NGUON-VA-GIAY-PHEP.md
 * npm run build => ./public ; npm run fetch:audio => ./assets/audio
 * Uses no npm dependencies and fails the build if a source is unavailable.
 */
import { mkdir, writeFile, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { inflateRawSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const local = process.argv.includes('--local');
const out = local ? root : join(root, 'public');
const origin = 'https://opengameart.org/sites/default/files/';
const tracks = [
  ['TownTheme.mp3','music/village.mp3'],
  ['iremos_forest_in_game.ogg','music/forest.ogg'],
  ['crystal_cave.mp3','music/crystal.mp3'],
  ['hope_orchestral_battle_music_bpm165.ogg','music/battle.ogg'],
  ['Forest_Ambience.mp3','music/ambience.mp3'],
  ['magical_1_0.ogg','sfx/spell.ogg'],
  ['magical_3.ogg','sfx/warp.ogg'],
  ['coin_drop.ogg','sfx/coin.ogg']
];
const archives = [
  ['UISoundEffects.zip', [
    ['Level Up.mp3','sfx/level.mp3'],['Item Pickup.mp3','sfx/pickup.mp3'],
    ['Menu Confirm.mp3','sfx/ui.mp3'],['Menu Error.mp3','sfx/warning.mp3']
  ]],
  ['5Hit_Sounds.zip', [
    ['ogg/hit1.ogg','sfx/hit.ogg'],['ogg/hit3.ogg','sfx/hurt.ogg'],
    ['ogg/die1.ogg','sfx/defeat.ogg']
  ]]
];

async function download(url) {
  let failure;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(url, {headers:{'User-Agent':'Mozilla/5.0 (Nấm Lùn 3D CC0 build)'}, signal:AbortSignal.timeout(45000)});
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buf = Buffer.from(await response.arrayBuffer());
      if (!buf.length) throw new Error('Trống');
      return buf;
    } catch(e) {failure=e;}
  }
  try {return execFileSync('curl',['-fLsS','--retry','2','--max-time','55',url], {maxBuffer: 12*1024*1024,timeout:65000});}
  catch(e) {throw new Error(`${url}: ${failure?.message}; curl: ${e.message}`);}
}

function unzipMember(buf, wanted) {
  // Parse central directory (unlike naive local-header scan, handles ZIP data descriptors).
  for (let i=0;i+46<=buf.length;i++) {
    if (buf.readUInt32LE(i)!==0x02014b50) continue;
    const method=buf.readUInt16LE(i+10);
    const compressed=buf.readUInt32LE(i+20),uncompressed=buf.readUInt32LE(i+24);
    const nameLen=buf.readUInt16LE(i+28), extraLen=buf.readUInt16LE(i+30),commentLen=buf.readUInt16LE(i+32);
    const name=buf.subarray(i+46,i+46+nameLen).toString('utf8');
    if (name===wanted) {
      const start=buf.readUInt32LE(i+42);
      if (buf.readUInt32LE(start)!==0x04034b50) throw new Error(`ZIP local header sai: ${wanted}`);
      const offset=start+30+buf.readUInt16LE(start+26)+buf.readUInt16LE(start+28);
      const zipped=buf.subarray(offset,offset+compressed);
      const raw=method===0?zipped:method===8?inflateRawSync(zipped):null;
      if (!raw || raw.length!==uncompressed) throw new Error(`ZIP dữ liệu sai: ${wanted}`);
      return raw;
    }
    i += 46+nameLen+extraLen+commentLen-1;
  }
  throw new Error(`Không có tệp ${wanted} trong ZIP`);
}
async function save(path,data) {
  const name=join(out,'assets/audio',path);
  await mkdir(dirname(name),{recursive:true});
  await writeFile(name,data);
  console.log(`✓ ${path} (${data.length} bytes)`);
}
if(!local) {
  for(const filename of ['index.html','style.css','game.js','audio.js','npcs.js','icon.svg','manifest.webmanifest']) {
    if(!existsSync(join(root,filename)))throw new Error(`Thiếu file ${filename}`);
    await mkdir(out,{recursive:true});await copyFile(join(root,filename),join(out,filename));
  }
  await mkdir(join(out,'docs'),{recursive:true});
  await copyFile(join(root,'docs/AM-THANH-NGUON-VA-GIAY-PHEP.md'),join(out,'docs/AM-THANH-NGUON-VA-GIAY-PHEP.md'));
}
for(const [filename,path] of tracks) await save(path,await download(origin+filename));
for(const [filename,members] of archives){const content=await download(origin+filename);for(const [member,path] of members)await save(path,unzipMember(content,member));}
console.log(`Hoàn thành: ${tracks.length+archives.reduce((n,[,v])=>n+v.length,0)} tệp CC0 tại ${out}`);