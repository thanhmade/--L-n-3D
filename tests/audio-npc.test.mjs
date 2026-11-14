import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { NPCS, npcsForZone, getNpcLines } from '../npcs.js';
import { AUDIO_TRACKS, parseAudioPrefs, pickVietnameseVoice, GameAudio } from '../audio.js';

const root = path.resolve(import.meta.dirname, '..');
const state = {zone:0, level:3, coins:100, quests:[2,1,0], completed:[false,false,false]};

test('3 nhạc theo vùng + nhạc chiến đấu + ambience có đường dẫn hợp lệ',()=>{
 assert.equal(AUDIO_TRACKS.music.length,3);
 assert.equal(new Set(AUDIO_TRACKS.music).size,3);
 for(const p of [...AUDIO_TRACKS.music,AUDIO_TRACKS.battle,AUDIO_TRACKS.ambience])
  assert.match(p,/^assets\/audio\/(music|ambience)\/.*\.(mp3|ogg)$/);
});
test('Hiệu ứng combat, vật phẩm và NPC đều có nguồn âm thanh',()=>{
 for(const key of ['attack','hit','spell','dash','hurt','defeat','monster','loot','coin','potion','level','warp','open','improve'])
  assert.ok(AUDIO_TRACKS.sfx[key],key);
});
test('Tùy chỉnh âm lượng có giới hạn, không cần DOM khi import',()=>{
 const p=parseAudioPrefs('{"music":2,"sfx":-4,"voiceOn":false}');
 assert.equal(p.music,1);assert.equal(p.sfx,0);assert.equal(p.voiceOn,false);
 assert.equal(parseAudioPrefs('broken-json').music,.38);
 const audio=new GameAudio();assert.ok(audio.setCombat);
});
test('Chỉ nhận giọng vi, không chọn giọng tiếng Anh',()=>{
 assert.equal(pickVietnameseVoice([{lang:'en-US',name:'English'}]),null);
 assert.equal(pickVietnameseVoice([{lang:'vi-VN',name:'Google Tiếng Việt'}]).lang,'vi-VN');
});
test('Có 7 NPC phân đúng nghề, vùng, lời thoại và hành động',()=>{
 assert.equal(NPCS.length,7);
 assert.deepEqual([0,1,2].map(i=>npcsForZone(i).length),[3,2,2]);
 for(const npc of NPCS){assert.ok(npc.job.length>5&&npc.actionLabel);const lines=getNpcLines(npc,state);assert.ok(lines.length>=2);}
});
test('Già làng thay nội dung theo tiến trình của người chơi',()=>{
 const npc=NPCS.find(n=>n.id==='elder');
 assert.notEqual(getNpcLines(npc,state)[0],getNpcLines(npc,{...state,completed:[true,false,false]})[0]);
});
test('Nguồn CC0 và quy trình build có tài liệu và kiểm tra định dạng',()=>{
 const credits=fs.readFileSync(path.join(root,'docs/AUDIO-CREDITS.md'),'utf8');
 for(const author of ['cynicmusic','TinyWorlds','Alex McCulloch','MintoDog','isaiah658','rubberduck','Kenney']) assert.ok(credits.includes(author),author);
 const downloader=fs.readFileSync(path.join(root,'scripts/download_audio.py'),'utf8');
 assert.ok(downloader.includes('opengameart.org/sites/default/files'));
 assert.ok(downloader.includes('OggS'));
 assert.ok(fs.existsSync(path.join(root,'scripts/build_site.py')));
});
