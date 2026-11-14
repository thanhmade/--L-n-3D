/**
 * NẤM LÙN 3D v0.3.0 — independent audio mixer.
 * CC0 assets are bundled by scripts/fetch-audio.mjs; see docs/AUDIO-CREDITS.md.
 * Spoken dialogue uses the device's installed Vietnamese Web Speech voice,
 * not third-party cloud TTS. If no vi voice is present, we show subtitles only.
 */
export const AUDIO_TRACKS = Object.freeze({
  music: ['assets/audio/music/village.mp3','assets/audio/music/forest.ogg','assets/audio/music/crystal.mp3'],
  battle: 'assets/audio/music/battle.ogg',
  ambience: 'assets/audio/music/ambience.mp3',
  sfx: {
    hit:'assets/audio/sfx/hit.ogg', attack:'assets/audio/sfx/hit.ogg',
    spell:'assets/audio/sfx/spell.ogg', dash:'assets/audio/sfx/warp.ogg',
    hurt:'assets/audio/sfx/hurt.ogg', defeat:'assets/audio/sfx/defeat.ogg',
    monster:'assets/audio/sfx/hurt.ogg', elite:'assets/audio/sfx/defeat.ogg',
    loot:'assets/audio/sfx/pickup.mp3', coin:'assets/audio/sfx/coin.ogg',
    potion:'assets/audio/sfx/pickup.mp3', level:'assets/audio/sfx/level.mp3',
    warp:'assets/audio/sfx/warp.ogg', open:'assets/audio/sfx/ui.mp3',
    ui:'assets/audio/sfx/ui.mp3', improve:'assets/audio/sfx/level.mp3'
  }
});
export const AUDIO_PREF_KEY = 'nam-lun-audio-prefs-v03';
const defaults = {music:.38, ambience:.17, sfx:.65, voice:.94, musicOn:true, effectsOn:true, voiceOn:true};
const clamp = n => Math.max(0, Math.min(1, Number(n)||0));
export function parseAudioPrefs(raw){
  try { const v = typeof raw==='string' ? JSON.parse(raw||'{}') : (raw||{});
    return {...defaults, music:clamp(v.music??defaults.music), ambience:clamp(v.ambience??defaults.ambience),
      sfx:clamp(v.sfx??defaults.sfx), voice:clamp(v.voice??defaults.voice),
      musicOn: v.musicOn !== false, effectsOn:v.effectsOn !== false,voiceOn:v.voiceOn !== false};
  }catch{return {...defaults};}
}
export function pickVietnameseVoice(voices, preferred){
  const vi=(voices||[]).filter(v=>/^vi(?:-|$)/i.test(v.lang||''));
  if(!vi.length)return null;
  if(preferred){const match=vi.find(v=>v.name===preferred);if(match)return match;}
  return vi.find(v=>/Google.*(tiếng việt|vietnamese)|HoaiMy|NamMinh/i.test(v.name))||vi[0];
}
export class GameAudio {
  constructor(onStatus=()=>{}){
    this.onStatus=onStatus;this.prefs=this.readPrefs();this.unlocked=false;this.soundEnabled=true;
    this.zone=0;this.combat=false;this.music=null;this.oldMusic=null;this.birds=null;this.fadeId=null;
    this.duck=1;this.activeUtterance=null;this.speechActive=false;
    this.voicePreference='';this.voiceStatus='';this.voiceTimer=null;this.seenMissingVoice=false;
    this.activeEffects=new Set();this.sourceEnabled=true;
    if(typeof window!=='undefined' && window.speechSynthesis){
      window.speechSynthesis.addEventListener?.('voiceschanged',()=>this.updateVoiceStatus());
    }
  }
  readPrefs(){try {return parseAudioPrefs(localStorage.getItem(AUDIO_PREF_KEY));}catch{return {...defaults};}}
  savePrefs(){try{localStorage.setItem(AUDIO_PREF_KEY,JSON.stringify(this.prefs));}catch{}}
  getMuted(){return !this.soundEnabled;}
  createAudio(path,loop=false){
    const el=new Audio(path);el.loop=loop;el.preload=loop?'metadata':'auto';el.crossOrigin='anonymous';
    el.addEventListener('error',()=>{this.sourceEnabled=false;this.onStatus('Không tải được một tệp âm thanh. Kiểm tra mạng và tài liệu nguồn CC0.');},{once:true});
    return el;
  }
  unlock(){this.unlocked=true;this.playZone(this.zone);this.updateVoiceStatus();}
  setEnabled(enabled){this.soundEnabled=!!enabled;if(!this.soundEnabled){this.stopSpeech();this.pauseAll();}else if(this.unlocked){this.playZone(this.zone);}this.updateMix();}
  setPref(key,value){if(!(key in this.prefs))return;
    this.prefs[key]=typeof defaults[key]==='boolean'?!!value:clamp(value);
    this.savePrefs();this.updateMix();
    if(key==='musicOn' && this.prefs.musicOn && this.unlocked)this.playZone(this.zone);
    if(key==='musicOn' && !this.prefs.musicOn)this.music?.pause();
    if(key==='voiceOn' && !this.prefs.voiceOn)this.stopSpeech();
  }
  pauseAll(){if(this.music)this.music.pause();if(this.oldMusic)this.oldMusic.pause();if(this.birds)this.birds.pause();this.activeEffects.forEach(a=>a.pause());}
  musicVolume(){return this.soundEnabled&&this.prefs.musicOn?this.prefs.music*this.duck:0;}
  updateMix(){if(this.music&&!this.fadeId)this.music.volume=this.musicVolume();
    if(this.birds){const active=(this.zone===0||this.zone===1);this.birds.volume=active&&this.soundEnabled&&this.prefs.musicOn?this.prefs.ambience*this.duck:0;}
  }
  playZone(zone){
    this.zone=zone;
    if(!this.unlocked||!this.soundEnabled||!this.prefs.musicOn){this.pauseAll();return;}
    const path=(this.combat ? AUDIO_TRACKS.battle : AUDIO_TRACKS.music[zone])||AUDIO_TRACKS.music[0];
    if(this.music && this.music.dataset.path===path){void this.music.play().catch(()=>{});this.updateMix();this.playBirds();return;}
    if(this.fadeId){cancelAnimationFrame(this.fadeId);this.fadeId=null;}
    this.oldMusic?.pause();this.oldMusic=this.music;
    const next=this.createAudio(path,true);next.dataset.path=path;next.volume=0;
    this.music=next;void next.play().catch(()=>{});
    this.playBirds();
    const from=this.oldMusic;const start=performance.now(),duration=1800,base=this.musicVolume();
    const blend=(now)=>{
      const k=Math.min(1,(now-start)/duration);
      if(this.music===next){next.volume=base*k; if(from)from.volume=base*(1-k);}
      if(k<1&&this.music===next){this.fadeId=requestAnimationFrame(blend);}else{this.fadeId=null;from?.pause();if(this.oldMusic===from)this.oldMusic=null;this.updateMix();}
    };
    this.fadeId=requestAnimationFrame(blend);
  }
  setCombat(active){
    const combat=!!active;
    if(this.combat===combat)return;
    this.combat=combat;
    if(this.unlocked)this.playZone(this.zone);
  }
  playBirds(){
    if(!this.birds)this.birds=this.createAudio(AUDIO_TRACKS.ambience,true);
    if((this.zone===0||this.zone===1)&&this.prefs.musicOn&&this.soundEnabled){void this.birds.play().catch(()=>{});}
    else this.birds.pause();this.updateMix();
  }
  sfx(name,scale=1){
    if(!this.unlocked||!this.soundEnabled||!this.prefs.effectsOn)return;
    const source=AUDIO_TRACKS.sfx[name];if(!source)return;
    try{const el=this.createAudio(source,false);el.volume=clamp(this.prefs.sfx*scale);this.activeEffects.add(el);
      const cleanup=()=>{this.activeEffects.delete(el);el.src='';};
      el.addEventListener('ended',cleanup,{once:true});el.addEventListener('error',cleanup,{once:true});
      void el.play().catch(()=>{this.activeEffects.delete(el);});
    }catch{}
  }
  updateVoiceStatus(){
    if(typeof window==='undefined'||!('speechSynthesis' in window)){this.voiceStatus='Trình duyệt chưa hỗ trợ đọc thoại.';return this.voiceStatus;}
    const voice=pickVietnameseVoice(window.speechSynthesis.getVoices(),this.voicePreference);
    this.voiceStatus=voice?`Giọng Việt: ${voice.name}`:'Chưa tìm thấy giọng Việt vi-VN trên thiết bị.';
    return this.voiceStatus;
  }
  stopSpeech(){if(this.voiceTimer){clearTimeout(this.voiceTimer);this.voiceTimer=null;}
    try{window.speechSynthesis?.cancel();}catch{}
    this.speechActive=false;this.activeUtterance=null;this.duck=1;this.updateMix();}
  speak(text,profile='neutral'){
    if(!this.unlocked||!this.soundEnabled||!this.prefs.voiceOn)return false;
    if(typeof window==='undefined'||!('speechSynthesis' in window))return false;
    const synthesis=window.speechSynthesis;
    const voice=pickVietnameseVoice(synthesis.getVoices(),this.voicePreference);
    if(!voice){this.updateVoiceStatus();this.onStatus('Chưa có giọng tiếng Việt. Vui lòng bật hoặc cài giọng vi-VN trong cài đặt đọc văn bản của thiết bị.');return false;}
    this.stopSpeech();
    const utterance=new SpeechSynthesisUtterance(String(text).replace(/\s+/g,' ').trim());
    utterance.lang='vi-VN';utterance.voice=voice;utterance.volume=this.prefs.voice;
    const voiceStyles={elder:[.87,.88],healer:[.94,1.05],merchant:[1.05,1.07],ranger:[.96,.94],fairy:[1.02,1.18],scholar:[.90,.93],smith:[.94,.83]};
    const [rate,pitch]=voiceStyles[profile]||[.97,1];utterance.rate=rate;utterance.pitch=pitch;
    const finish=()=>{if(this.activeUtterance===utterance){this.activeUtterance=null;this.speechActive=false;this.duck=1;this.updateMix();}};
    utterance.onstart=()=>{if(this.activeUtterance===utterance){this.speechActive=true;this.duck=.22;this.updateMix();}};
    utterance.onend=finish;utterance.onerror=finish;this.activeUtterance=utterance;
    try{synthesis.speak(utterance);this.duck=.22;this.updateMix();return true;}catch{finish();return false;}
  }
}
