import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { NPCS, getNpcLines } from '../npcs.js';
import { AUDIO_TRACKS, pickVietnameseVoice } from '../audio.js';

const root = path.resolve(import.meta.dirname, '..');
const zones = [{name:'Làng Nấm',quest:'Bảo vệ làng nấm',target:5},{name:'Rừng Đom Đóm',quest:'Ánh sáng trong rừng',target:7},{name:'Đầm Pha Lê',quest:'Lời gọi pha lê',target:10}];
const state={zone:0,level:2,quests:[2,0,0],completed:[false,false,false],coins:50};

test('Có 4 nhạc nền, trong đó 3 nhạc bản đồ và 1 nhạc chiến đấu',()=>{
  assert.equal(AUDIO_TRACKS.music.length,3);assert.ok(AUDIO_TRACKS.battle);
  for(const p of [...AUDIO_TRACKS.music,AUDIO_TRACKS.battle]) assert.match(p,/^assets\/audio\/music\/.*\.(mp3|ogg)$/);
});
test('Hiệu ứng trò chơi đầy đủ nhịp chiến đấu, lấy đồ, cấp, thoại',()=>{
 for(const key of ['attack','hit','spell','dash','hurt','loot','level','warp','monster','defeat','open','potion'])assert.ok(AUDIO_TRACKS.sfx[key] || ['footstep','purchase','death'].includes(key));
});
test('Bảy NPC có nghề khác nhau, nhiệm vụ và lời thoại tiếng Việt',()=>{
  assert.equal(NPCS.length,7);
  for(const npc of NPCS){
    assert.ok(npc.job&&npc.name&&npc.actionLabel);
    assert.ok(getNpcLines(npc,state).join(' ').length>60);
  }
  assert.equal(pickVietnameseVoice([{lang:'en-US',name:'English'}]),null);
  assert.equal(pickVietnameseVoice([{lang:'vi-VN',name:'Tiếng Việt'}]).lang,'vi-VN');
});
test('Hướng dẫn giấy phép CC0 ghi đủ nhạc và nguồn',()=>{
 const text=fs.readFileSync(path.join(root,'docs/AM-THANH-NGUON-VA-GIAY-PHEP.md'),'utf8');
 for(const name of ['Town Theme RPG','Crystal Cave','Iremos Forest','Hope','CC0','OpenGameArt']) assert.ok(text.includes(name),name);
});