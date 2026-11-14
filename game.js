/**
 * NẤM LÙN & KHU RỪNG TINH LINH — playable browser RPG prototype
 * Original procedural character and world assets. Three.js r187 (MIT).
 * All game logic, characters, monsters and maps are generated in this file.
 */
import {GameAudio} from './audio.js';
import {NPCS,npcsForZone,getNpcLines} from './npcs.js';
let THREE;
try {
  THREE = await import('https://cdn.jsdelivr.net/npm/three@0.187.0/build/three.module.js');
} catch (error) {
  try {
    THREE = await import('https://unpkg.com/three@0.187.0/build/three.module.js');
  } catch (fallbackError) {
    console.error('Unable to load Three.js from either CDN', error, fallbackError);
    document.getElementById('error-banner')?.classList.remove('hidden');
    throw fallbackError;
  }
}

const $ = id => document.getElementById(id);
const TAU = Math.PI * 2;
const clamp = THREE.MathUtils.clamp;
const rand = (a,b) => a + Math.random()*(b-a);
const lerp = THREE.MathUtils.lerp;
const SAVE_KEY = 'nam-lun-phieu-luu-save-v1';
const MOBILE = matchMedia('(pointer: coarse)').matches || /Android|iPhone|iPad/i.test(navigator.userAgent);
const GAME_VERSION = '0.3.0';
const DIFFICULTY = {story:{label:'Dễ',health:2.5,damage:.73,speed:.8,aggro:9.5,interval:2.05},challenge:{label:'Thử thách',health:4.4,damage:1.25,speed:1.18,aggro:14,interval:1.38},nightmare:{label:'Ác mộng',health:6.3,damage:1.77,speed:1.44,aggro:18,interval:1.06}};
const ZONES = [
  {name:'Làng Nấm Ánh Sao',subtitle:'Khu tân thủ · LV 1+',emoji:'🍄',min:1,grass:'#80bb86',darkGrass:'#6da87a',floor:'#afd99a',sky:'#a6d8ce',fog:'#bbd7ba',mushroom:'#e87979',highlight:'#ffdfa3',rock:'#9ab79a',enemy:'Nấm Tinh Nghịch',types:['slime','shroom','slime'],quest:'Bảo vệ làng nấm',description:'Đánh bại 5 sinh vật tinh nghịch quanh làng.',target:5,bonus:170},
  {name:'Rừng Đom Đóm',subtitle:'Rừng cổ tích · LV 3+',emoji:'🧚',min:3,grass:'#5c9d87',darkGrass:'#35766f',floor:'#94c1a4',sky:'#608d9a',fog:'#80aa9d',mushroom:'#ad84e4',highlight:'#caffba',rock:'#779eac',enemy:'Bọ Đom Đóm',types:['bug','shroom','slime'],quest:'Ánh sáng trong rừng',description:'Hạ 7 quái vật để giải phóng đom đóm.',target:7,bonus:350},
  {name:'Đầm Pha Lê',subtitle:'Xứ sở pha lê · LV 5+',emoji:'💎',min:5,grass:'#6a9cad',darkGrass:'#47748e',floor:'#a9ccdb',sky:'#829dbc',fog:'#a4b8d2',mushroom:'#7ad9e1',highlight:'#e4f8ff',rock:'#7499ba',enemy:'Tinh Thể Quái',types:['crystal','bug','shroom'],quest:'Lời gọi pha lê',description:'Thanh tẩy 10 quái vật ở đầm pha lê.',target:10,bonus:700}
];
const HAT_COLORS = {red:'#dc6470',violet:'#a38bdf',mint:'#58c9b2'};
const xpRequired = level => 78 + level*42;
const maxHP = level => 100 + (level-1)*24;
const maxMP = level => 80 + (level-1)*12;
const atk = level => 22 + (level-1)*7;
const playerAttack = () => atk(state.level) * (elapsed < state.attackBoostUntil ? 1.25 : 1);
const defaultSave = () => ({level:1,xp:0,hp:100,mp:80,coins:0,kills:0,potions:3,zone:0,hat:'red',quests:[0,0,0],completed:[false,false,false],difficulty:'challenge'});
function readSave(){try{const v=JSON.parse(localStorage.getItem(SAVE_KEY)||'null');if(!v)return defaultSave();const d=defaultSave();const s={...d,...v};s.level=clamp(Math.floor(Number(s.level)||1),1,60);s.zone=clamp(Math.floor(Number(s.zone)||0),0,2);s.xp=clamp(Number(s.xp)||0,0,xpRequired(s.level)-1);s.hp=clamp(Number(s.hp)||maxHP(s.level),1,maxHP(s.level));s.mp=clamp(Number(s.mp)||0,0,maxMP(s.level));s.coins=clamp(Number(s.coins)||0,0,10000000);s.potions=clamp(Number(s.potions)||0,0,999);s.kills=clamp(Number(s.kills)||0,0,10000000);s.quests=Array.isArray(s.quests)?[0,1,2].map(i=>clamp(Number(s.quests[i])||0,0,ZONES[i].target)):[0,0,0];s.completed=Array.isArray(s.completed)?[0,1,2].map(i=>!!s.completed[i]):[false,false,false];s.hat=HAT_COLORS[s.hat]?s.hat:'red';s.difficulty=DIFFICULTY[s.difficulty]?s.difficulty:'challenge';if(s.level<ZONES[s.zone].min)s.zone=0;return s;}catch{return defaultSave();}}
let saved=readSave();
const state={...saved,started:false,paused:true,sound:true,world:null,hero:null,heroVisual:null,levelPopup:false,gameOver:false,lastMove:new THREE.Vector3(0,0,-1),attackAt:0,magicAt:0,dashAt:0,dashRemain:0,dashDir:new THREE.Vector3(0,0,-1),hurtAt:0,gameTime:0,camYaw:0.17,camPitch:0.62,camDistance:13.8,heroWalking:false,rangerBuffUntil:0,attackBoostUntil:0,fairyBlessAt:-60,activeNpc:null,npcLine:0};
let renderer,scene,camera,sun,hemi,ambience,worlds=[null,null,null],elapsed=0,previous=performance.now(),hudClock=0,minimapClock=0,regenClock=0,autosaveClock=0;
const effects=[],projectiles=[],pickups=[],keys=new Set();
let lastCombatAudioAt=-999;
const gameAudio=new GameAudio(msg=>{const target=$('voice-hint'); if(!target)return;target.textContent=msg;target.hidden=false;clearTimeout(gameAudio.statusTimer);gameAudio.statusTimer=setTimeout(()=>{target.hidden=true;},5000);});
const npcRaycaster=new THREE.Raycaster();const npcMouse=new THREE.Vector2();
const tempVec=new THREE.Vector3(),tempVec2=new THREE.Vector3(),screenVec=new THREE.Vector3(),cameraLook=new THREE.Vector3();
const canvas=$('game-canvas'),app=$('app');
const gameSize=()=>({width:app.clientWidth||innerWidth,height:app.clientHeight||innerHeight});
const isRotatedLandscape=()=>document.documentElement.classList.contains('force-landscape')&&innerHeight>innerWidth;
function refreshLayout(){
  const force=MOBILE&&state.started&&innerHeight>innerWidth;
  document.documentElement.classList.toggle('force-landscape',force);
  if(renderer)onResize();
}
async function requestLandscape(){
  if(!MOBILE)return;
  // Screen Orientation API only succeeds in browsers/contexts that allow fullscreen and rotation.
  try{if(document.fullscreenEnabled&&!document.fullscreenElement){await document.documentElement.requestFullscreen({navigationUI:'hide'});}}catch(e){console.info('Fullscreen unavailable:',e.name||e);}
  try{if(screen.orientation&&typeof screen.orientation.lock==='function'){await screen.orientation.lock('landscape');}}catch(e){console.info('Native landscape lock unavailable:',e.name||e);}
  refreshLayout();
}
function chooseDifficulty(value){
  if(!DIFFICULTY[value])return;
  const changed=state.difficulty!==value;state.difficulty=value;
  document.querySelectorAll('.difficulty-choice').forEach(b=>{const active=b.dataset.difficulty===value;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',String(active));});
  if(changed){worlds.forEach(w=>{if(w)w.enemies.forEach(rebalanceEnemy);});saveGame();if(state.started)notify('⚔️ Độ khó: '+DIFFICULTY[value].label,'gold');}
}
const mat=(hex,rough=.8,em=null,intensity=0)=>new THREE.MeshStandardMaterial({color:hex,roughness:rough,metalness:.05,emissive:em||0x000000,emissiveIntensity:intensity});
const basic=(color,opacity=1)=>new THREE.MeshBasicMaterial({color,transparent:opacity<1,opacity,depthWrite:opacity===1,side:THREE.DoubleSide});
const white=mat('#fff4e4'),dark=mat('#243949'),pupil=mat('#101b2b',.22),peach=mat('#f6d6b3'),cheek=mat('#eda3a5'),cream=mat('#f1dec2'),wood=mat('#9a6d54'),gold=mat('#f4c96f',.4),glassGlow=mat('#b0fff7',.15,'#72fff8',1.5);
const G={sphere:new THREE.SphereGeometry(1,16,12),sphereFine:new THREE.SphereGeometry(1,24,16),box:new THREE.BoxGeometry(1,1,1),torus:new THREE.TorusGeometry(1,.12,8,28),icosa:new THREE.IcosahedronGeometry(1,0),cone:new THREE.ConeGeometry(1,1,8)};
function make(parent,geometry,material,pos=[0,0,0],scale=[1,1,1],cast=false){const o=new THREE.Mesh(geometry,material);o.position.set(...pos);o.scale.set(...scale);o.castShadow=cast;o.receiveShadow=false;parent.add(o);return o;}
function sphere(parent,material,x,y,z,sx=1,sy=sx,sz=sx,cast=false){return make(parent,G.sphere,material,[x,y,z],[sx,sy,sz],cast)}
function cylinder(parent,material,x,y,z,rTop,rBottom,height,seg=10,cast=false){return make(parent,new THREE.CylinderGeometry(rTop,rBottom,height,seg),material,[x,y,z],[1,1,1],cast)}
function cone(parent,material,x,y,z,radius=1,height=2,segments=7){return make(parent,new THREE.ConeGeometry(radius,height,segments),material,[x,y,z])}
function shadow(o){o.traverse(child=>{if(child.isMesh){child.castShadow=true;child.receiveShadow=false;}});return o}
function rng(seed){let t=seed>>>0;return ()=>{t=(t+0x6D2B79F5)>>>0;let a=t;a=Math.imul(a^(a>>>15),a|1);a^=a+Math.imul(a^(a>>>7),a|61);return ((a^(a>>>14))>>>0)/4294967296;}}
function smoothstep(a,b,x){const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)}

function init(){
  try{
    renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
    const vp=gameSize();renderer.setSize(vp.width,vp.height,false);
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,MOBILE?1.3:1.9));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.42;
    renderer.shadowMap.enabled=!MOBILE;
    renderer.shadowMap.type=THREE.PCFSoftShadowMap;
    scene=new THREE.Scene();
    camera=new THREE.PerspectiveCamera(58,vp.width/vp.height,.12,170);
    hemi=new THREE.HemisphereLight(0xfff6d9,0x477768,2.25);scene.add(hemi);
    ambience=new THREE.AmbientLight(0xffffff,.2);scene.add(ambience);
    sun=new THREE.DirectionalLight(0xfff3ca,3);sun.position.set(-11,24,13);sun.castShadow=true;
    sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-35;sun.shadow.camera.right=35;sun.shadow.camera.top=35;sun.shadow.camera.bottom=-35;
    sun.shadow.camera.near=1;sun.shadow.camera.far=80;sun.shadow.bias=-.0014;sun.shadow.normalBias=.018;scene.add(sun);
    initHero();switchWorld(state.zone,true);
    initEvents();setHat(state.hat);refreshHUD();drawWorldMap();
    window.addEventListener('resize',refreshLayout);
    window.addEventListener('orientationchange',()=>setTimeout(refreshLayout,160));
    window.visualViewport?.addEventListener('resize',refreshLayout);
    refreshLayout();
    requestAnimationFrame(loop);
  }catch(e){console.error(e);$('error-banner').classList.remove('hidden');}
}
function onResize(){if(!renderer)return;const {width:w,height:h}=gameSize();camera.aspect=w/h;camera.fov=w/h<1?66:58;camera.updateProjectionMatrix();renderer.setSize(w,h,false);renderer.setPixelRatio(Math.min(devicePixelRatio||1,MOBILE?1.3:1.9));}

// ----- Original chibi mushroom hero -----
let hatGroup,eyePieces;
function mushroomCap(parent,color,radius=1.15,height=.98,baseY=0,seed=3,spotCount=10){
  const rnd=rng(seed);const cap=new THREE.Group();cap.position.y=baseY;parent.add(cap);
  const pts=[new THREE.Vector2(0,0),new THREE.Vector2(radius*.65,-.04),new THREE.Vector2(radius*1.07,.035),new THREE.Vector2(radius*.98,.21*height),new THREE.Vector2(radius*.85,.53*height),new THREE.Vector2(radius*.64,.8*height),new THREE.Vector2(radius*.36,.97*height),new THREE.Vector2(0,1.04*height)];
  const top=make(cap,new THREE.LatheGeometry(pts,30),mat(color,.7),[0,0,0],[1,1,1],true);top.material.side=THREE.DoubleSide;
  cylinder(cap,mat('#eac9aa'),0,-.045,0,radius*.76,radius*.74,.085,24);
  for(let i=0;i<spotCount;i++){const ang=rnd()*TAU,r=(.16+rnd()*.64)*radius;
    const x=Math.cos(ang)*r,z=Math.sin(ang)*r;const factor=clamp(r/(radius*1.04),0,.98);
    const y=height*(1.02-Math.pow(factor,1.85)*.87)+.03;
    const spot=sphere(cap,mat('#fff2d2'),x,y,z,(.105+rnd()*.07)*radius,(.022+rnd()*.022)*radius,(.11+rnd()*.06)*radius);
    const normal=new THREE.Vector3(x/radius*.8,.65,z/radius*.8).normalize();spot.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),normal);
  }
  return cap;
}
function smile(parent,x,y,z,width=.22){const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(x-width,y+.045,z-.01),new THREE.Vector3(x,y-.045,z+.045),new THREE.Vector3(x+width,y+.045,z-.01)]);return make(parent,new THREE.TubeGeometry(curve,9,.022,5,false),mat('#8c615d'))}
function initHero(){
  state.hero=new THREE.Group();scene.add(state.hero);state.hero.position.set(0,0,12);
  const v=new THREE.Group();state.hero.add(v);state.heroVisual=v;
  sphere(v,mat('#d9f5d3'),0,1.28,0,.58,.76,.47,true); // tunic
  sphere(v,mat('#f5eac4'),0,1.03,.37,.42,.24,.18); // belly
  sphere(v,peach,0,2.13,.1,.76,.70,.67,true);
  for(const dir of [-1,1]){
    const arm=new THREE.Group();arm.position.set(dir*.56,1.53,0);v.add(arm);
    const sleeve=sphere(arm,mat('#84bd9f'),dir*.26,-.12,0,.28,.28,.27,true);
    sphere(arm,peach,dir*.44,-.34,.01,.19,.19,.17,true);
    const leg=new THREE.Group();leg.position.set(dir*.29,.68,0);v.add(leg);
    cylinder(leg,cream,0,-.14,0,.17,.2,.5,9,true);
    sphere(leg,mat('#8a625d'),0,-.46,.18,.28,.18,.38,true);
    v.userData[dir===-1?'armL':'armR']=arm;v.userData[dir===-1?'legL':'legR']=leg;
    sphere(v,white,dir*.29,2.20,.675,.16,.19,.09);sphere(v,pupil,dir*.29,2.20,.751,.09,.135,.055);
    sphere(v,white,dir*.325,2.259,.801,.034,.042,.018);
    sphere(v,cheek,dir*.49,1.98,.60,.135,.065,.06);
  }
  smile(v,0,1.99,.743,.145);
  // Scarf, collar and cross-body satchel
  make(v,new THREE.TorusGeometry(.49,.09,8,24),mat('#ffce84'),[0,1.63,.08],[1,.76,1]).rotation.x=Math.PI/2;
  const scarfTail=make(v,new THREE.BoxGeometry(.2,.4,.08),mat('#fbb88d'),[.28,1.32,.47]);scarfTail.rotation.z=-.13;
  const strap=make(v,new THREE.BoxGeometry(.06,.98,.055),mat('#936a55'),[.15,1.26,.45]);strap.rotation.z=-.44;
  const bag=sphere(v,mat('#bc885d'),-.39,1.04,-.39,.31,.34,.18,true);make(v,G.box,gold,[-.39,1.06,-.21],[.15,.08,.04]);
  hatGroup=mushroomCap(v,HAT_COLORS[state.hat],1.13,.96,2.66,99);
  // Mini wand visible next to the hero's arm
  const stick=cylinder(v,wood,.96,1.21,.20,.065,.075,1.44,8,true);stick.rotation.z=.22;
  sphere(v,glassGlow,.79,2.01,.2,.18,.18,.18);
  const halo=sphere(v,basic('#8efeff',.25),.79,2.01,.2,.25,.25,.25);
  v.userData.wandGlow=halo;v.userData.wand=stick;
  state.hero.rotation.y=Math.PI;
}
function setHat(key){state.hat=HAT_COLORS[key]?key:'red';if(hatGroup){hatGroup.traverse(o=>{if(o.isMesh&&o.geometry?.type==='LatheGeometry'){o.material.color.set(HAT_COLORS[state.hat]);}})}document.querySelectorAll('.hat-choice').forEach(btn=>btn.classList.toggle('selected',btn.dataset.hat===state.hat));saveGame();}

// ----- Hand-crafted, seeded fairy-tale biomes -----
function placeMushroom(parent,x,z,s,capColor,glow=false,seed=1){
  const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(s);parent.add(g);
  const stalk=mat(glow?'#ddffde':'#f3ddbe');cylinder(g,stalk,0,.72,0,.27,.38,1.5,9,true);
  mushroomCap(g,capColor,1,.75,1.48,seed,6);
  if(glow){sphere(g,basic('#a2fff0',.18),0,1.56,0,1.15,.23,1.15);}
  return g;
}
function placeTree(parent,x,z,s,zone,seed){
  const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(s);parent.add(g);
  const bark=mat(zone===2?'#7a7d9d':'#8c705d');cylinder(g,bark,0,2.1,0,.37,.61,4.3,8,true);
  for(let i=0;i<3;i++){const angle=i*TAU/3;const root=cylinder(g,bark,Math.cos(angle)*.42,.44,Math.sin(angle)*.42,.09,.28,1.7,6);root.rotation.z=Math.cos(angle)*.46;root.rotation.x=Math.sin(angle)*.46;}
  const crown=zone===0?mat('#6ebd83'):zone===1?mat('#4b9b9c'):mat('#85b3b7');
  const crown2=zone===0?mat('#a2d98b'):zone===1?mat('#7fc5b5'):mat('#c1d9dd');
  sphere(g,crown,0,4.9,0,1.75,1.75,1.6,true);
  sphere(g,crown2,-1.03,4.2,.32,1.12,1.26,1.07,true);
  sphere(g,crown,.92,4.32,-.36,1.12,1.37,1.03,true);
  sphere(g,crown2,.12,5.68,-.16,1.09,.94,1.08,true);
  if(seed%4===0){for(let i=0;i<5;i++)sphere(g,basic('#ffe6a2',.9),Math.sin(i*2)*1.1,4.5+Math.sin(i)*.4,Math.cos(i*2)*1.15,.08,.08,.08);}
  return g;
}
function placeCrystal(parent,x,z,s,color){
  const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(s);parent.add(g);
  const cryst=mat(color,.15,color,.55);
  for(let i=0;i<4;i++){const a=i*TAU/4;const h=.8+(i%3)*.48;const c=cone(g,cryst,Math.cos(a)*.35,h*.5,Math.sin(a)*.35,.23,h,5);c.rotation.z=Math.sin(a)*.24;c.rotation.x=Math.cos(a)*.24;}
  sphere(g,basic(color,.2),0,.2,0,1.05,.15,1.05);
  return g;
}
function makeGround(parent,zone){
  const palette=ZONES[zone];
  const floor=make(parent,new THREE.CylinderGeometry(33.6,35,2.2,80),mat(palette.floor),[0,-1.1,0],[1,1,1]);floor.receiveShadow=true;
  const top=make(parent,new THREE.CircleGeometry(33.3,72),mat(palette.grass),[0,.017,0],[1,1,1]);top.rotation.x=-Math.PI/2;top.receiveShadow=true;
  // Stylized moss islands and glowing grass patches
  const r=rng(560+zone*13);
  for(let i=0;i<(MOBILE?33:55);i++){
    const a=r()*TAU,rr=Math.sqrt(r())*30;const x=Math.cos(a)*rr,z=Math.sin(a)*rr;
    const o=make(parent,new THREE.CircleGeometry(1,12),basic(i%3?'#d4e9a2':palette.darkGrass,.2+r()*.14),[x,.025+i*.0001,z],[1.5+r()*3,1+r()*2,1]);o.rotation.x=-Math.PI/2;o.rotation.z=r()*TAU;
  }
  // Pearl stepping-stones lead toward the warp gate
  const pathStone=mat(zone===2?'#b1ccd3':'#d9d3ae');
  for(let i=0;i<21;i++){
    const z=17-i*2.03;const x=Math.sin(i*.45)*1.2;
    const stone=make(parent,new THREE.CylinderGeometry(.73+r()*.20,.81,.09,8),pathStone,[x,.045,z],[1,1,1]);stone.rotation.y=r()*TAU;stone.receiveShadow=true;
  }
  // Distant soft-sculpted rolling hills, curved background
  for(let i=0;i<19;i++){const a=i*TAU/19,rr=34.7;const x=Math.cos(a)*rr,z=Math.sin(a)*rr;
    const hill=sphere(parent,mat(i%2?palette.darkGrass:palette.floor),x,-.35,z,5.5,2.6+(i%4)*.75,5.5);hill.receiveShadow=true;
  }
  for(let i=0;i<8;i++){const a=(i+.23)*TAU/8;const x=Math.cos(a)*41,z=Math.sin(a)*41;const mountain=cone(parent,mat(zone===2?'#8ba3bf':zone===1?'#719f9b':'#b5d5ac'),x,6,z,5.5,14+(i%3)*2.5,7);mountain.rotation.y=i*.78;mountain.material.flatShading=true;}
}
function placeFlower(parent,x,z,scale,color){
  const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);parent.add(g);
  const stem=cylinder(g,mat('#5aa66f'),0,.19,0,.028,.035,.36,5);
  const cm=mat(color,.75);
  for(let i=0;i<5;i++){const a=i*TAU/5;sphere(g,cm,Math.cos(a)*.13,.39,Math.sin(a)*.13,.12,.05,.10)}sphere(g,gold,0,.4,0,.07,.07,.07);
}
function placeLantern(parent,x,z,color='#a2fff0'){
  const g=new THREE.Group();g.position.set(x,0,z);parent.add(g);
  cylinder(g,mat('#8b6a5e'),0,1.7,0,.075,.1,3.4,8,true);
  sphere(g,mat(color,.2,color,.8),0,3.42,0,.3,.36,.3);
  sphere(g,basic(color,.15),0,3.42,0,.47,.47,.47);
  cone(g,mat('#e3c487'),0,3.85,0,.24,.21,8);
}
function createLabel(text,color='#ffe8ac',size=2.2){
  const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');
  ctx.shadowColor='rgba(0,0,0,.8)';ctx.shadowBlur=12;ctx.font='900 39px Nunito, Arial, sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=color;ctx.fillText(text,256,64,492);
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const spr=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true,depthWrite:false}));spr.scale.set(size*3.1,size*.78,1);return spr;
}
function createPortal(parent,z,forward=true,zone=0){
  const g=new THREE.Group();g.position.set(0,0,z);parent.add(g);
  const accent=forward?'#9affed':'#ffe1a8';
  cylinder(g,mat('#96a399'),0,.17,0,2.7,2.9,.35,20).receiveShadow=true;
  const pad=make(g,new THREE.CylinderGeometry(2.25,2.35,.09,32),mat(zone===2?'#94ccdb':'#e6d1a3'),[0,.41,0]);
  const ring=make(g,new THREE.TorusGeometry(2.14,.29,12,50),mat(forward?'#8fe6c9':'#facb82',.2,accent,.8),[0,2.78,0]);
  const inner=make(g,new THREE.CircleGeometry(1.87,38),basic(accent,.21),[0,2.78,.05]);inner.material.blending=THREE.AdditiveBlending;inner.material.depthWrite=false;
  const ringOuter=make(g,new THREE.TorusGeometry(2.43,.065,8,50),mat(accent,.2,accent,1),[0,2.78,0]);
  const sprite=createLabel(forward?'✦ CỔNG THỬ THÁCH ✦':'✧ TRỞ VỀ ✧',accent,1.8);sprite.position.set(0,5.87,0);g.add(sprite);
  for(let i=0;i<7;i++){const angle=i*TAU/7;sphere(g,mat(accent,.2,accent,1.0),Math.cos(angle)*2.4,2.78+Math.sin(angle)*2.4,0,.095,.095,.095);}
  for(const side of [-1,1]){const pillar=cylinder(g,mat('#a1a78a'),side*2.95,1.1,-.3,.48,.57,2.2,8);sphere(g,mat(accent,.2,accent,1),side*2.95,2.35,-.3,.28,.28,.28);}
  g.userData={ring,inner,ringOuter,accent,forward};
  return g;
}
function elderNPC(parent){
  const g=new THREE.Group();g.position.set(-6,0,7);parent.add(g);
  sphere(g,mat('#c4d0a3'),0,.9,0,.55,.72,.45,true);
  sphere(g,peach,0,1.88,0,.65,.62,.58,true);
  mushroomCap(g,'#eac477',1,.7,2.31,38,6);
  for(const s of [-1,1]){sphere(g,white,s*.22,1.99,.55,.13,.15,.08);sphere(g,dark,s*.22,1.99,.61,.07,.09,.035);}
  sphere(g,white,0,1.63,.49,.26,.2,.15);
  const staff=cylinder(g,wood,.71,1.01,.15,.06,.07,1.86,8);staff.rotation.z=-.14;
  sphere(g,glassGlow,.81,1.96,.15,.17,.17,.17);
  const label=createLabel('GIÀ LÀNG NẤM', '#fff4cb',1.25);label.position.set(0,4.22,0);g.add(label);
  g.rotation.y=.42;
  return g;
}
function buildWorld(zone){
  const p=ZONES[zone],group=new THREE.Group();const rnd=rng(9205+zone*411);
  makeGround(group,zone);
  // Keep the central trail and portal approaches clear
  function spot(min=8,max=29){let x,z,tries=0;do{const a=rnd()*TAU,rad=Math.sqrt(rnd()*(max*max-min*min)+min*min);x=Math.sin(a)*rad;z=Math.cos(a)*rad;tries++;}while((Math.abs(x)<4&&Math.abs(z)<27||Math.hypot(x,z-23)<5||Math.hypot(x,z+23)<5||Math.hypot(x+6,z-7)<4)&&tries<90);return[x,z];}
  const rockMat=mat(p.rock),leafMat=mat(zone===2?'#d0eddd':'#f8edc3');
  for(let i=0;i<(MOBILE?15:24);i++){const [x,z]=spot(13,31);placeTree(group,x,z,.65+rnd()*.51,zone,i);}
  for(let i=0;i<(MOBILE?23:38);i++){const [x,z]=spot(7,31);placeMushroom(group,x,z,.35+rnd()*.6,i%4===0?p.highlight:p.mushroom,i%5===0,zone*200+i);}
  for(let i=0;i<(MOBILE?19:33);i++){const [x,z]=spot(6,32);const r=.3+rnd()*.78;const rock=make(group,G.icosa,rockMat,[x,r*.46,z],[r, r*.7,r*.95]);rock.rotation.y=rnd()*TAU;rock.rotation.z=rnd()*.4;rock.receiveShadow=true;}
  for(let i=0;i<(MOBILE?23:46);i++){const [x,z]=spot(5,32);placeFlower(group,x,z,.5+rnd()*.6,zone===0?i%2?'#f9dd9b':'#fcb9bb':zone===1?'#c7b6ff':'#a9f3fa');}
  for(let i=0;i<(MOBILE?zone===2?10:zone===1?6:3:zone===2?18:zone===1?9:4);i++){const [x,z]=spot(10,31);placeCrystal(group,x,z,.55+rnd()*.68,zone===2?'#a3f5ff':zone===1?'#deb8ff':'#ffde9a');}
  for(let i=0;i<(MOBILE?4:6);i++){const [x,z]=spot(9,30);placeLantern(group,x,z,zone===2?'#9beeff':'#b8ffcf');}
  // A cozy village of three huts in the starter biome
  if(zone===0){
    for(const [x,z,s] of [[-13,13,1.6],[13,11,1.35],[-15,-13,1.18]]){
      const hut=new THREE.Group();hut.position.set(x,0,z);hut.scale.setScalar(s);group.add(hut);
      sphere(hut,mat('#f7dfae'),0,1.22,0,1.3,1.4,1.18,true);mushroomCap(hut,'#f28d79',1.65,1.26,2.25,x*3+22,8);
      const door=make(hut,new THREE.CapsuleGeometry(.34,.55,5,9),mat('#936b65'),[0,.56,1.18],[1,1,.3]);
      sphere(hut,gold,.18,.72,1.32,.055,.055,.06);
      for(const side of [-1,1])sphere(hut,glassGlow,side*.7,1.26,.98,.16,.17,.1);
    }
  }
  const forward=createPortal(group,-23,true,zone);const backward=zone>0?createPortal(group,23,false,zone):null;
  const npcs=[];
  for(const model of npcsForZone(zone)){
    const mesh=model.id==='elder'?elderNPC(group):buildNPCVisual(group,model);
    mesh.userData.npcId=model.id;
    npcs.push({model,group:mesh});
  }
  const elder=npcs.find(n=>n.model.id==='elder')?.group||null;
  // Floating firefly points, updated in the animation loop
  const positions=new Float32Array((MOBILE?65:110)*3),phase=[];
  for(let i=0;i<(MOBILE?65:110);i++){const [x,z]=spot(2,31);positions[i*3]=x;positions[i*3+1]=1.1+rnd()*6.5;positions[i*3+2]=z;phase.push(rnd()*TAU);}
  const flies=new THREE.Points(new THREE.BufferGeometry(),new THREE.PointsMaterial({color:p.highlight,size:zone===1?.17:.115,transparent:true,opacity:.78,sizeAttenuation:true,depthWrite:false,blending:THREE.AdditiveBlending}));
  flies.geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));group.add(flies);
  const world={zone,group,forward,backward,elder,npcs,flies,flyY:Float32Array.from({length:(MOBILE?65:110)},(_,i)=>positions[i*3+1]),flyPhase:phase,enemies:[],pickups:[],createdAt:elapsed};
  for(let i=0;i<(zone===0?11:zone===1?12:13);i++)spawnEnemy(world,i);
  return world;
}
function switchWorld(index,first=false,fromBack=false){
  if(index<0||index>2)return;
  if(state.world){scene.remove(state.world.group);state.world.enemies.forEach(e=>scene.remove(e.group));state.world.pickups.forEach(p=>scene.remove(p.group));}
  if(!worlds[index])worlds[index]=buildWorld(index);
  const world=worlds[index];scene.add(world.group);
  world.enemies.forEach(e=>{rebalanceEnemy(e);scene.add(e.group);});world.pickups.forEach(p=>scene.add(p.group));
  state.world=world;state.zone=index;
  const p=ZONES[index];scene.background=new THREE.Color(p.sky);scene.fog=new THREE.FogExp2(p.fog,index===1?.012:.009);
  hemi.color.set(zoneTint(index));hemi.groundColor.set(p.darkGrass);
  sun.color.set(index===2?'#d1e6ff':index===1?'#eee0ff':'#fff1c9');
  state.hero.position.set(0,0,first?12:fromBack?-14:14);
  state.hero.rotation.y=first?Math.PI:fromBack?0:Math.PI;
  state.lastMove.set(0,0,first||!fromBack?-1:1);
  $('location-name').textContent=p.name;$('location-desc').textContent=`Bản đồ ${index+1} / 3 · ${p.subtitle}`;$('mini-zone').textContent=String(index+1).padStart(2,'0');
  refreshHUD();drawWorldMap();saveGame();
  gameAudio.playZone(index);
  if(!first){burst(state.hero.position.clone().add(new THREE.Vector3(0,1.3,0)),'#c4ffff',38,3,1.0);notify(`🌀 Đã đến ${p.name}!`,'gold');sound('warp');}
}
function zoneTint(z){return z===0?'#fff3da':z===1?'#ddfff3':'#e6efff'}

// ----- Cute forest monsters with independent AI and health -----
function enemyVisual(type,zone){
  const g=new THREE.Group();
  const eyeMat=mat('#1c3045',.24),shiny=mat('#fffef2',.18);
  if(type==='slime'){
    const col=zone===0?'#80d9bd':zone===1?'#80c0e8':'#aaa0f4';
    sphere(g,mat(col,.33),0,.83,0,.82,.76,.70,true);
    sphere(g,basic('#ffffff',.2),-.26,1.16,.53,.28,.16,.095);
    for(const side of [-1,1]){sphere(g,shiny,side*.27,.92,.61,.15,.2,.075);sphere(g,eyeMat,side*.27,.91,.68,.09,.13,.05);sphere(g,mat('#fdabbd'),side*.49,.72,.48,.14,.06,.075);}
    smile(g,0,.73,.66,.14);
    const leaf=sphere(g,mat('#4caa76'),.23,1.64,.04,.3,.14,.17);leaf.rotation.z=.6;
    sphere(g,mat('#4f957a'),0,1.54,0,.08,.21,.08);
  }else if(type==='shroom'){
    sphere(g,mat(zone===2?'#b4c4e3':'#c8bb9e'),0,1.0,0,.49,.91,.44,true);
    sphere(g,mat('#9e7e6f'),0,.4,0,.61,.37,.58,true);
    mushroomCap(g,zone===0?'#cd6d8b':zone===1?'#835bc1':'#73aedd',1,.86,1.78,21+zone,6);
    for(const side of [-1,1]){sphere(g,shiny,side*.22,1.27,.43,.14,.18,.07);sphere(g,eyeMat,side*.22,1.26,.49,.09,.12,.045);const brow=make(g,G.box,eyeMat,[side*.21,1.52,.47],[.31,.045,.05]);brow.rotation.z=side*.23;}
    smile(g,0,.97,.4,.11);
    for(const s of [-1,1]){sphere(g,mat('#bd9c83'),s*.43,.47,.10,.24,.18,.24);}
  }else if(type==='bug'){
    const shell=mat(zone===1?'#74a1df':'#b0c0dd',.35),glow=mat('#c7fca4',.25,'#a6ffae',.7);
    sphere(g,shell,0,.86,-.21,.83,.65,.83,true);
    sphere(g,mat('#5d7d9a'),0,.86,-.2,.1,.67,.84);
    sphere(g,mat('#c3d8eb'),0,.96,.47,.54,.49,.5,true);
    for(const s of [-1,1]){
      sphere(g,shiny,s*.26,1.06,.85,.17,.2,.07);sphere(g,eyeMat,s*.26,1.06,.915,.09,.12,.04);
      for(let i=0;i<3;i++){const leg=cylinder(g,mat('#64808b'),s*(.65+i*.1),.37,-.54+i*.42,.055,.08,.9,6);leg.rotation.z=s*.7;}
      const antenna=cylinder(g,mat('#506e76'),s*.30,1.57,.47,.035,.04,.6,6);antenna.rotation.z=s*.25;
      sphere(g,glow,s*.37,1.92,.45,.15,.15,.15);
    }
    sphere(g,glow,0,1.21,-.73,.34,.32,.25);
  }else{ // crystal beast
    const body=mat('#7eafcc',.27,'#346d9c',.2),cryst=mat('#a4f4fa',.13,'#6be3ff',.58);
    sphere(g,body,0,1.03,0,.68,.84,.55,true);
    make(g,new THREE.OctahedronGeometry(.68),cryst,[0,1.87,0],[1,1.12,.8],true);
    for(const s of [-1,1]){
      const arm=make(g,new THREE.OctahedronGeometry(.35),cryst,[s*.89,1.16,0],[.76,1.7,.8],true);arm.rotation.z=s*.25;
      sphere(g,shiny,s*.22,1.99,.46,.14,.16,.06);sphere(g,eyeMat,s*.22,1.99,.515,.08,.1,.04);
      const leg=make(g,new THREE.OctahedronGeometry(.34),body,[s*.35,.3,0],[1,1,.87],true);
    }
    for(let i=0;i<3;i++){const c=cone(g,cryst,(i-1)*.45,2.55+(i%2)*.15,-.16,.23,.87,5);c.rotation.z=(i-1)*.32;}
  }
  const bar=new THREE.Group();bar.position.y=type==='crystal'?3.1:2.5;g.add(bar);
  const bg=make(bar,new THREE.PlaneGeometry(1.48,.17),basic('#16242c',.82),[0,0,0]);
  const fill=make(bar,new THREE.PlaneGeometry(1.37,.09),basic('#80efa5'),[0,0,.02]);
  const border=make(bar,new THREE.PlaneGeometry(1.6,.035),basic('#f8e5bf',.7),[0,.145,-.02]);
  return {g,bar,fill,bg};
}
function spawnEnemy(world,i){
  const zone=world.zone,r=rng(817+zone*107+i*223);
  const type=ZONES[zone].types[i%3];
  const lvl=Math.max(ZONES[zone].min, ZONES[zone].min+(i%3)-1);
  const isElite=i%5===4;
  const health=1; // rebalanceEnemy assigns level-scaled HP when the enemy spawns.
  let x,z;
  if(i<4){x=[-7,7,-12,11][i];z=[-2,-4,-11,-13][i];}
  else {const angle=r()*TAU,rad=10+r()*14;x=Math.cos(angle)*rad;z=Math.sin(angle)*rad;}
  if(Math.hypot(x,z+23)<5)z+=7;
  const visual=enemyVisual(type,zone);
  visual.g.position.set(x,0,z);visual.g.rotation.y=r()*TAU;
  const warning=make(visual.g,new THREE.RingGeometry(.93,1.11,40),basic('#ff647a',.7),[0,.075,0]);warning.rotation.x=-Math.PI/2;warning.visible=false;
  if(isElite){const halo=make(visual.g,new THREE.TorusGeometry(1.07,.065,6,30),basic('#ffdc88',.88),[0,1.84,0]);halo.rotation.x=Math.PI/2;}
  const e={group:visual.g,bar:visual.bar,fill:visual.fill,type,zone,baseLevel:lvl,level:lvl,hp:health,maxHp:health,isElite,alive:true,x,z,homeX:x,homeZ:z,phase:r()*TAU,patrolAngle:r()*TAU,attackCD:rand(1,2.0),attackCount:0,windup:0,heavyReady:false,warning,hitFlash:0,deadUntil:0,moveSpeed:1};
  rebalanceEnemy(e);
  world.enemies.push(e);return e;
}
function rebalanceEnemy(e){
  const cfg=DIFFICULTY[state.difficulty]||DIFFICULTY.challenge;
  const fraction=e.maxHp?clamp(e.hp/e.maxHp,0,1):1;
  e.level=clamp(Math.max(e.baseLevel,state.level-(e.zone===0?1:0)+(e.zone===2?1:0)),1,60);
  const health=Math.round(atk(state.level)*cfg.health*(e.isElite?1.65:1)+e.zone*17);
  e.maxHp=health;e.hp=Math.max(1,Math.round(health*fraction));
  e.damage=Math.round((5+e.level*1.85+e.zone*3)*cfg.damage*(e.isElite?1.35:1));
  e.moveSpeed=(1.92+e.zone*.39+(e.baseLevel%3)*.18)*cfg.speed*(e.isElite?1.12:1);
  e.aggroRange=cfg.aggro;e.attackInterval=cfg.interval*(e.isElite?.87:1);
  e.strikeRange=e.isElite?2.6:2.24;
  e.fill.scale.x=e.hp/e.maxHp;e.fill.position.x=(e.hp/e.maxHp-1)*.685;
  e.fill.material.color.set(e.isElite?'#ffce73':'#80efa5');
  e.warning.visible=false;e.windup=0;e.heavyReady=false;
}
function restoreEnemy(e){rebalanceEnemy(e);e.alive=true;e.hp=e.maxHp;e.group.visible=true;e.group.position.set(e.homeX,0,e.homeZ);e.fill.scale.x=1;e.fill.position.x=0;e.attackCD=.85+Math.random()*1.2;e.attackCount=0;e.hitFlash=0;}
function enemyLabel(e){return (e.isElite?'Tinh anh · ':'')+(e.type==='slime'?'Nhầy Tinh Linh':e.type==='shroom'?'Nấm Gai':e.type==='bug'?'Bọ Đom Đóm':'Tinh Thể Quái');}

// ----- Combat, magic, treasures and level progression -----
function saveGame(){try{const fields=['level','xp','hp','mp','coins','kills','potions','zone','hat','quests','completed','difficulty'];const obj={};fields.forEach(f=>obj[f]=state[f]);localStorage.setItem(SAVE_KEY,JSON.stringify(obj));}catch{}}
function sound(type){if(['attack','hit','hurt','spell','elite','monster'].includes(type))lastCombatAudioAt=elapsed;gameAudio.sfx(type, type==='hit'?.9:type==='loot'?.55:1);}
function notify(text,style=''){const el=document.createElement('div');el.className='toast '+style;el.textContent=text;$('toast-stack').prepend(el);setTimeout(()=>el.remove(),2650);const stack=$('toast-stack');while(stack.children.length>3)stack.lastElementChild.remove();}
function floatText(text,position,type=''){if(!camera)return;const p=position.clone().project(camera);if(p.z<-1||p.z>1)return;const vp=gameSize(),x=(p.x*.5+.5)*vp.width,y=(-p.y*.5+.5)*vp.height;const el=document.createElement('div');el.className='float-damage '+type;el.textContent=text;el.style.left=x+'px';el.style.top=y+'px';$('floating-layer').append(el);setTimeout(()=>el.remove(),780);}
function burst(position,color,count=16,speed=2.5,life=.75){
  const p=new Float32Array(count*3);const vel=[];
  for(let i=0;i<count;i++){p[i*3]=position.x;p[i*3+1]=position.y;p[i*3+2]=position.z;const a=Math.random()*TAU,h=rand(-.2,1);const size=speed*rand(.3,1);vel.push(new THREE.Vector3(Math.cos(a)*size, h*size,Math.sin(a)*size));}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(p,3));
  const material=new THREE.PointsMaterial({color,size:.13+Math.random()*.14,transparent:true,opacity:1,depthWrite:false,blending:THREE.AdditiveBlending});
  const obj=new THREE.Points(geometry,material);scene.add(obj);effects.push({obj,vel,age:0,life,positions:p,kind:'particles'});
}
function slashEffect(){
  const g=new THREE.Group();const theta=state.hero.rotation.y;const f=new THREE.Vector3(Math.sin(theta),0,Math.cos(theta));
  g.position.copy(state.hero.position).addScaledVector(f,1.35);g.position.y=1.35;
  const slash=make(g,new THREE.TorusGeometry(1.47,.07,6,35,Math.PI*1.26),basic('#ffedaa',.95));slash.rotation.z=-.9;
  const inner=make(g,new THREE.TorusGeometry(1.25,.03,5,30,Math.PI*1.27),basic('#fff7e8',.75));inner.rotation.z=-.92;
  scene.add(g);effects.push({obj:g,age:0,life:.27,kind:'slash'});
  burst(g.position.clone(),'#ffe4a1',13,3,.44);
}
function hitEnemy(e,amount,isCrit=false,byMagic=false){
  if(!e||!e.alive)return;
  const dmg=Math.round(amount);e.hp=Math.max(0,e.hp-dmg);e.fill.scale.x=e.hp/e.maxHp;e.fill.position.x=(e.hp/e.maxHp-1)*.685;
  e.hitFlash=.16;e.group.scale.setScalar(1.09);const pos=e.group.position.clone().add(new THREE.Vector3(0,2.0,0));
  floatText((isCrit?'✦ ':'-')+dmg,pos,isCrit?'crit':'');
  burst(pos,byMagic?'#a2f6ff':'#ffe0a1',byMagic?18:9,byMagic?3.6:2.1,.48);
  sound('hit');
  if(e.hp<=0)killEnemy(e);else if(Math.random()<.27)sound('monster');
}
function closestEnemy(range=4,angleLimit=TAU){
  let closest=null,best=1e9;
  const pos=state.hero.position,front=new THREE.Vector3(Math.sin(state.hero.rotation.y),0,Math.cos(state.hero.rotation.y));
  for(const e of state.world.enemies){if(!e.alive)continue;const d=pos.distanceTo(e.group.position);if(d>range)continue;const dv=e.group.position.clone().sub(pos).setY(0).normalize();const angle=front.dot(dv);if(angle<Math.cos(angleLimit*.5))continue;if(d<best){best=d;closest=e;}}
  return closest;
}
function attackAction(){
  if(!state.started||state.paused||state.gameOver)return;
  if(elapsed<state.attackAt)return;
  state.attackAt=elapsed+.55;state.attackAnim=.34;
  const enemy=closestEnemy(4.35,TAU);
  if(enemy){const toward=enemy.group.position.clone().sub(state.hero.position);state.hero.rotation.y=Math.atan2(toward.x,toward.z);state.lastMove.copy(toward).setY(0).normalize();}
  slashEffect();sound('attack');
  let targets=state.world.enemies.filter(e=>e.alive&&e.group.position.distanceTo(state.hero.position)<3.95);
  const facing=new THREE.Vector3(Math.sin(state.hero.rotation.y),0,Math.cos(state.hero.rotation.y));
  targets=targets.filter(e=>facing.dot(e.group.position.clone().sub(state.hero.position).normalize())>-.12).sort((a,b)=>a.group.position.distanceTo(state.hero.position)-b.group.position.distanceTo(state.hero.position)).slice(0,3);
  for(const e of targets){const crit=Math.random()<.18;hitEnemy(e,playerAttack()*(crit?1.62:1),crit);}
}
function magicAction(){
  if(!state.started||state.paused||state.gameOver||elapsed<state.magicAt)return;
  if(state.mp<18){notify('✦ Không đủ MP để sử dụng phép!','red');sound('ui');return;}
  state.mp-=18;state.magicAt=elapsed+1.45;
  let target=closestEnemy(15,TAU);const forward=state.lastMove.clone().normalize();
  if(target){const toward=target.group.position.clone().sub(state.hero.position);state.hero.rotation.y=Math.atan2(toward.x,toward.z);forward.copy(toward).setY(0).normalize();}
  const orbMat=mat('#8befff',.12,'#4de6ff',2.2);
  const orb=sphere(scene,orbMat,state.hero.position.x+forward.x*.9,1.64,state.hero.position.z+forward.z*.9,.32,.32,.32);
  sphere(orb,basic('#8fffff',.20),0,0,0,1.52,1.52,1.52);
  projectiles.push({obj:orb,target,velocity:forward.clone().multiplyScalar(12.5),ttl:1.45,damage:Math.round(playerAttack()*1.6+11),position:orb.position.clone()});
  burst(orb.position.clone(),'#9ff8ff',20,2.2,.56);sound('spell');refreshHUD();
}
function dashAction(){
  if(!state.started||state.paused||state.gameOver||elapsed<state.dashAt)return;
  state.dashAt=elapsed+3.1;state.dashRemain=.26;
  state.dashDir.copy(state.lastMove).setY(0).normalize();
  if(state.dashDir.lengthSq()<.1)state.dashDir.set(0,0,-1);
  burst(state.hero.position.clone().add(new THREE.Vector3(0,.7,0)),'#d8f8ce',24,2.7,.57);sound('dash');
}
function potionAction(){
  if(!state.started||state.paused||state.gameOver)return;
  if(state.potions<1){notify('🧪 Bạn đã hết bình hồi máu!','red');return;}
  if(state.hp>=maxHP(state.level)){notify('❤️ Sinh lực đã đầy!');return;}
  state.potions--;const amount=Math.round(maxHP(state.level)*.45);state.hp=Math.min(maxHP(state.level),state.hp+amount);
  floatText('+'+amount,state.hero.position.clone().add(new THREE.Vector3(0,3.3,0)),'heal');burst(state.hero.position.clone().add(new THREE.Vector3(0,1.0,0)),'#8af8ac',25,1.8,.9);
  notify('🧪 Đã dùng bình hồi máu!');sound('potion');refreshHUD();saveGame();
}
function hurtPlayer(amount){
  if(state.dashRemain>0||state.gameOver||!state.started||state.paused||elapsed<state.hurtAt+.5)return;
  const actualDamage=Math.round(amount*(elapsed<state.rangerBuffUntil?.78:1));
  state.hp=Math.max(0,state.hp-actualDamage);state.hurtAt=elapsed;
  floatText('-'+actualDamage,state.hero.position.clone().add(new THREE.Vector3(0,3.4,0)),'player-hit');
  burst(state.hero.position.clone().add(new THREE.Vector3(0,1.1,0)),'#ff8393',12,2.0,.48);sound('hurt');refreshHUD();
  if(state.hp<=0){state.gameOver=true;state.paused=true;gameAudio.stopSpeech();sound('defeat');$('death-screen').classList.remove('hidden');}
}
function killEnemy(e){
  e.alive=false;e.group.visible=false;sound('defeat');e.deadUntil=elapsed+rand(8,12);
  const xp=Math.round((27+e.level*13+e.zone*9)*(e.isElite?1.5:1)),coins=5+e.level*3+Math.floor(Math.random()*8)+(e.isElite?16:0);
  state.kills++;state.quests[state.zone]=Math.min(ZONES[state.zone].target,state.quests[state.zone]+1);
  burst(e.group.position.clone().add(new THREE.Vector3(0,1.15,0)),'#ffe5b0',32,3.5,.95);
  spawnPickup(e.group.position.x,e.group.position.z,'coin',coins);
  if(Math.random()<.23)spawnPickup(e.group.position.x+.55,e.group.position.z+.4,'potion',1);
  notify(`⚔️ Hạ ${enemyLabel(e)} · +${xp} EXP`, 'gold');
  gainXP(xp);checkQuest();refreshHUD();saveGame();
}
function spawnPickup(x,z,type,amount){
  const g=new THREE.Group();g.position.set(x,.5,z);scene.add(g);
  if(type==='coin'){
    const o=make(g,new THREE.TorusGeometry(.25,.08,9,15),mat('#ffe47b',.2,'#f7b933',.4));o.rotation.y=.3;
    sphere(g,mat('#fff1b0',.2,'#ffda63',.4),0,0,0,.135,.135,.06);
    sphere(g,basic('#ffde82',.12),0,0,0,.47,.47,.47);
  }else{
    cylinder(g,mat('#79e0ca',.2,'#3cce93',.2),0,0,0,.22,.18,.44,10);
    cylinder(g,gold,0,.29,0,.13,.13,.14,10);
    sphere(g,basic('#b0ffcb',.18),0,0,0,.36,.40,.36);
  }
  const p={group:g,type,amount,age:0,ttl:35,claimed:false};state.world.pickups.push(p);
}
function collectPickup(p){
  if(p.claimed)return;p.claimed=true;scene.remove(p.group);p.group.traverse(o=>{if(o.isMesh&&o.geometry!==G.sphere)o.geometry.dispose();});
  if(p.type==='coin'){state.coins+=p.amount;floatText('+'+p.amount+' 🪙',state.hero.position.clone().add(new THREE.Vector3(0,2.9,0)),'heal');}
  else{state.potions++;notify('🧪 Nhặt được Bình Hồi Máu!','gold');}
  sound(p.type==='coin'?'coin':'potion');refreshHUD();saveGame();
}
function gainXP(points){
  state.xp+=points;let leveled=false;
  while(state.level<60&&state.xp>=xpRequired(state.level)){
    state.xp-=xpRequired(state.level);state.level++;state.hp=maxHP(state.level);state.mp=maxMP(state.level);leveled=true;
  }
  if(leveled){
    worlds.forEach(w=>{if(w)w.enemies.forEach(rebalanceEnemy);});
    state.paused=true;state.levelPopup=true;$('new-level').textContent=state.level;
    $('level-reward').textContent=`HP tối đa ${maxHP(state.level)} · MP tối đa ${maxMP(state.level)} · Sức đánh ${atk(state.level)}. Khu vực mới mở theo cấp!`;
    $('level-screen').classList.remove('hidden');
    burst(state.hero.position.clone().add(new THREE.Vector3(0,1.5,0)),'#fff2a4',55,3.7,1.45);sound('level');
  }
  refreshHUD();saveGame();
}
function checkQuest(){
  const z=state.zone,p=ZONES[z];
  if(state.completed[z]||state.quests[z]<p.target)return;
  state.completed[z]=true;state.coins+=85+z*100;
  notify(`🏆 Hoàn thành: ${p.quest}! +${p.bonus} EXP`,'gold');
  gainXP(p.bonus);drawWorldMap();
}
function respawn(){
  state.gameOver=false;state.paused=false;state.hp=maxHP(state.level);state.mp=maxMP(state.level);
  $('death-screen').classList.add('hidden');switchWorld(0);notify('🌱 Rừng nấm đã hồi sinh cho bạn!','gold');
  saveGame();
}
function interact(){
  if(!state.started||state.paused||state.gameOver)return;
  const info=getInteraction();if(!info)return;
  if(info.kind==='npc'){openNpcDialogue(info.npc.model);return;}

  if(info.require&&state.level<info.require){notify(`🔒 Cần đạt LV ${info.require} để mở cổng!`,'red');return;}
  const next=info.kind==='forward'?state.zone+1:state.zone-1;
  if(next>=0&&next<ZONES.length)switchWorld(next,false,info.kind==='back');
}
function getInteraction(){
  if(!state.world||!state.hero)return null;
  const pos=state.hero.position;
  const front=state.world.forward.position;
  if(Math.hypot(pos.x-front.x,pos.z-front.z)<4.55&&state.zone<2)return{kind:'forward',require:ZONES[state.zone+1].min};
  if(state.world.backward){const back=state.world.backward.position;if(Math.hypot(pos.x-back.x,pos.z-back.z)<4.55)return{kind:'back',require:0};}
  let closest=null, best=4.0;
  for(const npc of state.world.npcs){const d=Math.hypot(pos.x-npc.group.position.x,pos.z-npc.group.position.z);if(d<best){closest=npc;best=d;}}
  if(closest)return{kind:'npc',npc:closest,require:0};
  return null;
}
function updateInteractionUI(){
  const p=getInteraction();
  if(!p||!state.started||state.paused){$('world-prompt').classList.add('hidden');return;}
  $('world-prompt').classList.remove('hidden');
  $('prompt-icon').textContent=p.kind==='npc'?p.npc.model.face:'🌀';
  $('prompt-title').textContent=p.kind==='npc'?p.npc.model.name:p.kind==='back'?'Cổng trở về':`Cổng tới ${ZONES[state.zone+1].name}`;
  $('prompt-sub').textContent=p.kind==='forward'&&state.level<p.require?`🔒 Yêu cầu cấp ${p.require}`:p.kind==='npc'?'Chạm nhân vật hoặc nhấn E để trò chuyện':'Nhấn E để tương tác';
}

// ----- Input: PC keyboard, camera drag and mobile virtual joystick -----
const stick={x:0,y:0,id:null};
function initEvents(){
  chooseDifficulty(state.difficulty);
  $('btn-start').addEventListener('click',()=>{
    $('start-screen').classList.add('hidden');state.started=true;state.paused=false;
    if(MOBILE)void requestLandscape();
    state.gameOver=false;state.levelPopup=false;
    gameAudio.unlock();syncAudioSettings();
    notify(`🍄 Chào mừng đến ${ZONES[state.zone].name}!`,'gold');
    setTimeout(()=>{if(state.started&&!state.paused)notify('⚔️ Hãy đánh quái gần đường mòn để lên cấp!');},1250);
  });
  document.querySelectorAll('.hat-choice').forEach(b=>b.addEventListener('click',()=>setHat(b.dataset.hat)));
  document.querySelectorAll('.difficulty-choice').forEach(b=>b.addEventListener('click',()=>chooseDifficulty(b.dataset.difficulty)));
  $('btn-landscape').addEventListener('click',()=>{if(MOBILE)void requestLandscape();else if(!document.fullscreenElement)document.documentElement.requestFullscreen?.().catch(()=>{});else document.exitFullscreen?.().catch(()=>{});});
  $('btn-quest-toggle').addEventListener('click',()=>{const p=$('quest-panel');const expanded=p.classList.toggle('expanded');$('btn-quest-toggle').setAttribute('aria-expanded',String(expanded));});
  $('btn-reset').addEventListener('click',()=>{if(confirm('Bạn muốn xóa toàn bộ cấp độ và bắt đầu hành trình mới?')){localStorage.removeItem(SAVE_KEY);location.reload();}});
  $('btn-level-ok').addEventListener('click',()=>{state.levelPopup=false;state.paused=false;$('level-screen').classList.add('hidden');notify(`🌟 Bé Nấm đã đạt LV ${state.level}!`,'gold');saveGame();});
  $('btn-respawn').addEventListener('click',respawn);
  $('btn-attack').addEventListener('pointerdown',e=>{e.preventDefault();attackAction();});
  $('btn-magic').addEventListener('pointerdown',e=>{e.preventDefault();magicAction();});
  $('btn-dash').addEventListener('pointerdown',e=>{e.preventDefault();dashAction();});
  $('btn-potion').addEventListener('pointerdown',e=>{e.preventDefault();potionAction();});
  $('btn-interact').addEventListener('click',interact);
  $('btn-sound').addEventListener('click',()=>{state.sound=!state.sound;gameAudio.setEnabled(state.sound);$('btn-sound').textContent=state.sound?'🔊':'🔇';});
  bindAudioSettings();
  $('npc-next').addEventListener('click',nextNpcLine);
  $('npc-replay').addEventListener('click',()=>speakNpcLine());
  $('npc-close').addEventListener('click',closeNpcDialogue);
  $('npc-service').addEventListener('click',npcService);
  $('btn-help').addEventListener('click',()=>openOverlay('help-screen'));
  $('btn-help-close').addEventListener('click',()=>closeOverlay('help-screen'));
  $('btn-map').addEventListener('click',()=>openOverlay('worldmap-screen'));
  $('mini-card').addEventListener('click',()=>openOverlay('worldmap-screen'));
  $('btn-worldmap-close').addEventListener('click',()=>closeOverlay('worldmap-screen'));
  window.addEventListener('keydown',e=>{
    const code=e.code;
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyJ','KeyK','KeyL','KeyH','KeyE','KeyM'].includes(code))e.preventDefault();
    keys.add(code);
    if(e.repeat)return;
    if(code==='Escape'){
      if(!$('npc-screen').classList.contains('hidden'))closeNpcDialogue();
      else if(!$('help-screen').classList.contains('hidden'))closeOverlay('help-screen');
      else if(!$('worldmap-screen').classList.contains('hidden'))closeOverlay('worldmap-screen');
      return;
    }
    if(code==='KeyM'){if(!$('worldmap-screen').classList.contains('hidden'))closeOverlay('worldmap-screen');else if(state.started)openOverlay('worldmap-screen');return;}
    if(code==='KeyJ'||code==='Space')attackAction();
    else if(code==='KeyL')magicAction();
    else if(code==='KeyK')dashAction();
    else if(code==='KeyH')potionAction();
    else if(code==='KeyE')interact();
  });
  window.addEventListener('keyup',e=>keys.delete(e.code));
  window.addEventListener('blur',()=>{keys.clear();stick.x=stick.y=0;updateKnob();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();stick.x=stick.y=0;updateKnob();saveGame();}});
  let drag=null;
  canvas.addEventListener('pointerdown',e=>{if(!state.started||state.paused)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,downAt:performance.now(),moved:false};try{canvas.setPointerCapture(e.pointerId)}catch{}});
  canvas.addEventListener('pointermove',e=>{
    if(!drag||drag.id!==e.pointerId)return;
    const dx=e.clientX-drag.x,dy=e.clientY-drag.y;drag.x=e.clientX;drag.y=e.clientY;if(Math.abs(e.clientX-drag.startX)+Math.abs(e.clientY-drag.startY)>15)drag.moved=true;
    const localDx=isRotatedLandscape()?dy:dx,localDy=isRotatedLandscape()?-dx:dy;
    if(Math.abs(localDx)>0||Math.abs(localDy)>0){state.camYaw-=localDx*.006;state.camPitch=clamp(state.camPitch+localDy*.003, .26,1.05);}
  });
  const endDrag=e=>{if(drag?.id!==e.pointerId)return;
    const tapped=!drag.moved&&performance.now()-drag.downAt<450;
    drag=null;
    if(tapped&&state.started&&!state.paused)clickNPC(e);
  };
  canvas.addEventListener('pointerup',endDrag);canvas.addEventListener('pointercancel',endDrag);
  canvas.addEventListener('wheel',e=>{e.preventDefault();state.camDistance=clamp(state.camDistance+e.deltaY*.014,8.5,22);},{passive:false});
  const joy=$('joystick');
  function updateStick(e){const box=joy.getBoundingClientRect();const cx=box.left+box.width*.5,cy=box.top+box.height*.5;const radius=box.width*.35;
    const px=e.clientX-cx,py=e.clientY-cy;const dx=isRotatedLandscape()?py:px,dy=isRotatedLandscape()?-px:py;
    const len=Math.max(1,Math.hypot(dx,dy)),f=Math.min(1,len/radius);
    stick.x=dx/len*f;stick.y=dy/len*f;updateKnob();}
  joy.addEventListener('pointerdown',e=>{e.preventDefault();stick.id=e.pointerId;joy.setPointerCapture(e.pointerId);updateStick(e);});
  joy.addEventListener('pointermove',e=>{if(stick.id===e.pointerId){e.preventDefault();updateStick(e);}});
  function endJoy(e){if(stick.id!==e.pointerId)return;stick.id=null;stick.x=stick.y=0;updateKnob();}
  joy.addEventListener('pointerup',endJoy);joy.addEventListener('pointercancel',endJoy);
}
function updateKnob(){const knob=$('joy-knob');knob.style.transform=`translate(calc(-50% + ${stick.x*33}px), calc(-50% + ${stick.y*33}px))`;}
function openOverlay(id){if(!state.started&&id==='worldmap-screen')return;state.paused=true;$(id).classList.remove('hidden');if(id==='worldmap-screen')drawWorldMap();}
function closeOverlay(id){$(id).classList.add('hidden');if(!state.levelPopup&&!state.gameOver&&$('help-screen').classList.contains('hidden')&&$('worldmap-screen').classList.contains('hidden'))state.paused=!state.started;}

// ----- World simulation -----
function updateHero(dt){
  let vertical=0,horizontal=0;
  if(keys.has('KeyW')||keys.has('ArrowUp'))vertical+=1;
  if(keys.has('KeyS')||keys.has('ArrowDown'))vertical-=1;
  if(keys.has('KeyD')||keys.has('ArrowRight'))horizontal+=1;
  if(keys.has('KeyA')||keys.has('ArrowLeft'))horizontal-=1;
  vertical+=-stick.y;horizontal+=stick.x;
  const cameraForward=tempVec.set(-Math.sin(state.camYaw),0,-Math.cos(state.camYaw));
  const right=tempVec2.set(Math.cos(state.camYaw),0,-Math.sin(state.camYaw));
  const move=new THREE.Vector3().addScaledVector(cameraForward,vertical).addScaledVector(right,horizontal);
  const length=move.length();state.heroWalking=length>.08;
  if(length>.08){move.normalize();const speed=(keys.has('ShiftLeft')||keys.has('ShiftRight')?9.1:6.5)*(elapsed<state.rangerBuffUntil?1.16:1);
    state.hero.position.addScaledVector(move,dt*speed*clamp(length,0,1));
    state.lastMove.copy(move);const angle=Math.atan2(move.x,move.z);
    let dAngle=THREE.MathUtils.euclideanModulo(angle-state.hero.rotation.y+Math.PI,TAU)-Math.PI;
    state.hero.rotation.y+=dAngle*Math.min(1,dt*11);
  }
  if(state.dashRemain>0){state.hero.position.addScaledVector(state.dashDir,dt*20);state.dashRemain-=dt;
    if(Math.random()<.75)burst(state.hero.position.clone().add(new THREE.Vector3(0,.65,0)),'#bffff0',4,.65,.22);}
  const p=state.hero.position,r=Math.hypot(p.x,p.z);if(r>29.2){p.x*=29.2/r;p.z*=29.2/r;}
  state.hp=Math.min(maxHP(state.level),state.hp+dt*.11);
  state.mp=Math.min(maxMP(state.level),state.mp+dt*2.1);
  if(state.attackAnim>0)state.attackAnim-=dt;
}
function animateHero(t){
  if(!state.heroVisual)return;
  const v=state.heroVisual,walk=state.heroWalking&&state.started&&!state.paused;
  const swing=walk?Math.sin(t*13.3)*.58:0;
  v.userData.legL.rotation.x=swing;v.userData.legR.rotation.x=-swing;
  v.userData.armL.rotation.x=-swing*.52;v.userData.armR.rotation.x=swing*.52;
  if(state.attackAnim>0){v.userData.armR.rotation.x=-1.1;v.userData.armR.rotation.z=-.5;}
  else v.userData.armR.rotation.z=lerp(v.userData.armR.rotation.z,0,.18);
  v.position.y=(walk?Math.abs(Math.sin(t*13))*.085:Math.sin(t*2.4)*.045);
  v.rotation.z=walk?Math.sin(t*6.65)*.045:Math.sin(t*1.2)*.019;
  v.userData.wandGlow.scale.setScalar(1+Math.sin(t*3.5)*.1);
}
function updateEnemies(dt,t){
  const heroPos=state.hero.position;
  for(const e of state.world.enemies){
    if(!e.alive){if(elapsed>=e.deadUntil)restoreEnemy(e);continue;}
    const pos=e.group.position;
    e.attackCD-=dt;
    const dist=pos.distanceTo(heroPos);
    let dx=0,dz=0;
    if(e.windup>0){
      e.windup-=dt;e.warning.visible=true;
      const pulse=1+Math.sin(t*24)*.14;e.warning.scale.setScalar(pulse);
      if(e.windup<=0){
        e.windup=0;e.warning.visible=false;
        if(dist<e.strikeRange+.32)hurtPlayer(e.damage*(e.heavyReady?1.55:1));
        e.attackCD=e.attackInterval*(.85+Math.random()*.32);
        e.heavyReady=false;
      }
    }else if(dist<e.strikeRange&&e.attackCD<=0){
      e.attackCount++;
      const heavy=e.isElite||e.attackCount%3===0;
      if(heavy){e.heavyReady=true;e.windup=e.isElite?.6:.48;e.warning.visible=true;if(dist<8&&Math.random()<.25)sound('elite');}
      else{hurtPlayer(e.damage);e.attackCD=e.attackInterval*(.9+Math.random()*.25);}
    }
    if(dist<e.aggroRange){
      if(dist>e.strikeRange-.28){dx=(heroPos.x-pos.x)/Math.max(dist,.01);dz=(heroPos.z-pos.z)/Math.max(dist,.01);}
    }else{
      e.patrolAngle+=Math.sin(t*.65+e.phase)*dt*.35;
      const dst=Math.hypot(pos.x-e.homeX,pos.z-e.homeZ);
      if(dst>4.8){dx=(e.homeX-pos.x)/dst;dz=(e.homeZ-pos.z)/dst;}
      else{dx=Math.cos(e.patrolAngle)*.31;dz=Math.sin(e.patrolAngle)*.31;}
    }
    if(e.windup>0){dx*=.26;dz*=.26;}
    const step=dt*e.moveSpeed*(dist<e.aggroRange?1.5:1.0);
    pos.x+=dx*step;pos.z+=dz*step;
    const b=Math.hypot(pos.x,pos.z);if(b>28.7){pos.x*=28.7/b;pos.z*=28.7/b;}
    if(Math.abs(dx)+Math.abs(dz)>.005){const desired=Math.atan2(dx,dz);let diff=THREE.MathUtils.euclideanModulo(desired-e.group.rotation.y+Math.PI,TAU)-Math.PI;e.group.rotation.y+=diff*Math.min(1,dt*5);}
    const y=e.type==='bug'?.12:.035;
    e.group.position.y=y+Math.abs(Math.sin(t*(e.type==='bug'?5.2:3)+e.phase))*(e.type==='slime'?.19:.065);
    const base=e.isElite?1.2:1;const s=base*(e.hitFlash>0?1.08:1+Math.sin(t*3+e.phase)*.025);e.group.scale.lerp(new THREE.Vector3(s,s,s),dt*17);
    e.hitFlash=Math.max(0,e.hitFlash-dt);
    e.bar.quaternion.copy(camera.quaternion);
    e.bar.visible=dist<15;
  }
}
function updateProjectiles(dt){
  for(let i=projectiles.length-1;i>=0;i--){const p=projectiles[i];p.ttl-=dt;
    if(p.target&&p.target.alive){const next=p.target.group.position.clone().add(new THREE.Vector3(0,1.12,0));const aim=next.sub(p.obj.position).normalize().multiplyScalar(14);p.velocity.lerp(aim,Math.min(1,dt*8));}
    p.obj.position.addScaledVector(p.velocity,dt);
    p.obj.rotation.y+=dt*8;p.obj.scale.setScalar(1+Math.sin(elapsed*23)*.13);
    if(Math.random()<.65)burst(p.obj.position.clone(),'#9cf5ff',2,.6,.24);
    const collision=state.world.enemies.find(e=>e.alive&&e.group.position.distanceTo(p.obj.position.clone().setY(0))<1.2&&Math.abs(p.obj.position.y-(e.group.position.y+1.1))<1.6);
    if(collision){hitEnemy(collision,p.damage,Math.random()<.1,true);burst(p.obj.position.clone(),'#7cfcff',30,4,.7);removeProjectile(i);continue;}
    if(p.ttl<=0||Math.hypot(p.obj.position.x,p.obj.position.z)>32){removeProjectile(i);}
  }
}
function removeProjectile(index){const p=projectiles[index];scene.remove(p.obj);p.obj.material.dispose();p.obj.children.forEach(o=>{if(o.material)o.material.dispose();});projectiles.splice(index,1);}
function updatePickups(dt,t){
  const arr=state.world.pickups;
  for(let i=arr.length-1;i>=0;i--){const p=arr[i];p.age+=dt;p.group.rotation.y+=dt*1.8;p.group.position.y=.45+Math.sin(t*3+i)*.15;
    const dx=state.hero.position.x-p.group.position.x,dz=state.hero.position.z-p.group.position.z,dist=Math.hypot(dx,dz);
    if(dist<2.9&&dist>.05){const f=dt*(dist<1.2?9:3);p.group.position.x+=dx*f;p.group.position.z+=dz*f;}
    if(dist<1.0){collectPickup(p);arr.splice(i,1);continue;}
    if(p.age>p.ttl){scene.remove(p.group);arr.splice(i,1);}
  }
}
function updateEffects(dt){
  for(let i=effects.length-1;i>=0;i--){const f=effects[i];f.age+=dt;
    if(f.kind==='particles'){
      const attr=f.obj.geometry.attributes.position;
      for(let j=0;j<f.vel.length;j++){const v=f.vel[j];f.positions[j*3]+=v.x*dt;f.positions[j*3+1]+=v.y*dt;f.positions[j*3+2]+=v.z*dt;v.y-=dt*2.4;}
      attr.needsUpdate=true;f.obj.material.opacity=Math.pow(clamp(1-f.age/f.life,0,1),.65);
    }else if(f.kind==='slash'){
      f.obj.scale.setScalar(1+f.age*1.85);f.obj.rotation.z-=dt*4;
      f.obj.children.forEach(o=>{o.material.opacity=Math.max(0,1-f.age/f.life)*.95;});
    }
    if(f.age>=f.life){scene.remove(f.obj);if(f.kind==='particles'){f.obj.geometry.dispose();f.obj.material.dispose();}else{f.obj.children.forEach(o=>{o.geometry.dispose();o.material.dispose();});}effects.splice(i,1);}
  }
}
function animateEnvironment(dt,t){
  if(!state.world)return;const w=state.world;
  if(w.forward){w.forward.userData.ring.rotation.y=Math.sin(t*.9)*.27;w.forward.userData.ringOuter.rotation.z=t*.15;w.forward.userData.inner.material.opacity=.14+Math.sin(t*2)*.07;}
  if(w.backward){w.backward.userData.ring.rotation.y=Math.sin(t*.8+1)*.25;w.backward.userData.ringOuter.rotation.z=-t*.12;w.backward.userData.inner.material.opacity=.16+Math.sin(t*1.7)*.06;}
  const attr=w.flies.geometry.attributes.position;for(let i=0;i<w.flyPhase.length;i++)attr.array[i*3+1]=w.flyY[i]+Math.sin(t*1.3+w.flyPhase[i])*.35;attr.needsUpdate=true;
  w.flies.material.opacity=.68+Math.sin(t*1.2)*.16;
}
function updateCamera(dt){
  if(!state.started){state.camYaw+=dt*.035;}
  const hero=state.hero.position,d=state.camDistance,p=state.camPitch;
  const h=d*Math.cos(p);const desired=new THREE.Vector3(hero.x+Math.sin(state.camYaw)*h,hero.y+1.95+Math.sin(p)*d,hero.z+Math.cos(state.camYaw)*h);
  const alpha=1-Math.exp(-dt*(state.started?7.5:2.8));camera.position.lerp(desired,alpha);
  cameraLook.lerp(new THREE.Vector3(hero.x,hero.y+1.55,hero.z),alpha);
  camera.lookAt(cameraLook);
}
function loop(now){
  requestAnimationFrame(loop);
  const dt=Math.min(.05,Math.max(.001,(now-previous)/1000));previous=now;elapsed+=dt;
  if(state.started&&!state.paused){
    updateHero(dt);updateEnemies(dt,elapsed);updateProjectiles(dt);updatePickups(dt,elapsed);
    const nearbyThreat=state.world.enemies.some(e=>e.alive && e.group.position.distanceTo(state.hero.position)<6.2);
    gameAudio.setCombat(nearbyThreat || elapsed-lastCombatAudioAt<4.2);
    hudClock+=dt;minimapClock+=dt;autosaveClock+=dt;
    if(hudClock>.11){refreshHUD();updateInteractionUI();hudClock=0;}
    if(autosaveClock>8){saveGame();autosaveClock=0;}
  }
  if(state.paused&&gameAudio.combat)gameAudio.setCombat(false);
  animateHero(elapsed);animateEnvironment(dt,elapsed);updateCamera(dt);updateEffects(dt);
  if(minimapClock>.11||!state.started){drawMinimap();minimapClock=0;}
  renderer.render(scene,camera);
}

// ----- Responsive HUD, quest panel and live mini map -----
function refreshHUD(){
  const hp=maxHP(state.level),mp=maxMP(state.level),req=xpRequired(state.level);
  $('lv-text').textContent=state.level;
  $('hp-text').textContent=`${Math.ceil(state.hp)} / ${hp}`;
  $('mp-text').textContent=`${Math.floor(state.mp)} / ${mp}`;
  $('exp-text').textContent=`${Math.floor(state.xp)} / ${req}`;
  $('hp-fill').style.width=(100*state.hp/hp).toFixed(2)+'%';
  $('mp-fill').style.width=(100*state.mp/mp).toFixed(2)+'%';
  $('exp-fill').style.width=(100*state.xp/req).toFixed(2)+'%';
  $('coin-text').textContent=Math.floor(state.coins).toLocaleString('vi-VN');$('kills-text').textContent=state.kills;
  $('potion-count').textContent=state.potions;
  $('quest-name').textContent=(state.completed[state.zone]?'✓ ':'')+ZONES[state.zone].quest;
  $('quest-description').textContent=state.completed[state.zone]
    ?(state.zone<2?`Đã hoàn thành! Tìm cổng ánh sáng, đạt LV ${ZONES[state.zone+1].min} để vào khu tiếp theo.`:'Bạn đã giải cứu các vùng đất! Hãy tiếp tục khám phá và lên cấp.')
    :ZONES[state.zone].description;
  $('quest-count').textContent=`${state.quests[state.zone]}/${ZONES[state.zone].target}`;
  $('quest-compact').textContent=$('quest-count').textContent;
  $('quest-fill').style.width=(100*state.quests[state.zone]/ZONES[state.zone].target)+'%';
  $('quest-badge').textContent=state.completed[state.zone]?'XONG':'CHÍNH';
  $('cd-attack').style.height=(100*clamp((state.attackAt-elapsed)/.55,0,1))+'%';
  $('cd-magic').style.height=(100*clamp((state.magicAt-elapsed)/1.45,0,1))+'%';
  $('cd-dash').style.height=(100*clamp((state.dashAt-elapsed)/3.1,0,1))+'%';
}
function drawWorldMap(){
  $('zone-list').innerHTML=ZONES.map((z,i)=>{const unlocked=state.level>=z.min;const current=state.zone===i;
    return `<div class="zone-row ${unlocked?'':'locked'}"><span class="zone-emoji">${z.emoji}</span><div><strong>${i+1}. ${z.name}</strong><small>${z.subtitle} · ${z.quest}</small></div><span class="zone-state">${current?'📍 ĐANG Ở':unlocked?'✓ ĐÃ MỞ':`🔒 LV ${z.min}`}</span></div>`;
  }).join('');
}
function drawMinimap(){
  const c=$('minimap');if(!c||!state.world)return;const ctx=c.getContext('2d'),w=c.width,h=c.height;
  ctx.clearRect(0,0,w,h);const zone=ZONES[state.zone];
  ctx.fillStyle=state.zone===0?'#3f8068':state.zone===1?'#326f70':'#3f6e88';ctx.fillRect(0,0,w,h);
  const cx=w/2,cy=h/2;ctx.save();ctx.beginPath();ctx.ellipse(cx,cy,59,57,0,0,TAU);ctx.clip();
  ctx.fillStyle=zone.darkGrass;ctx.fillRect(0,0,w,h);
  const r=rng(765+state.zone*13);for(let i=0;i<24;i++){ctx.beginPath();const a=r()*TAU,rr=Math.sqrt(r())*56;ctx.arc(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr,2+r()*5,0,TAU);ctx.fillStyle=i%2?'#739a78':'#6bba95';ctx.globalAlpha=.58;ctx.fill();}
  ctx.globalAlpha=1;
  ctx.strokeStyle='rgba(250,229,184,.73)';ctx.lineWidth=8;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(cx+6,cy+45);ctx.bezierCurveTo(cx-3,cy+10,cx+1,cy-19,cx,cy-48);ctx.stroke();
  const mapXY=(x,z)=>[cx+x*1.75,cy+z*1.75];
  for(const e of state.world.enemies){if(!e.alive)continue;const [x,y]=mapXY(e.group.position.x,e.group.position.z);ctx.beginPath();ctx.fillStyle='#ff8c94';ctx.arc(x,y,2.8,0,TAU);ctx.fill();}
  for(const p of state.world.pickups){const [x,y]=mapXY(p.group.position.x,p.group.position.z);ctx.beginPath();ctx.fillStyle='#ffe58d';ctx.arc(x,y,2,0,TAU);ctx.fill();}
  for(const z of [-23,...(state.zone>0?[23]:[])]){const [x,y]=mapXY(0,z);ctx.beginPath();ctx.fillStyle='#ffe9a4';ctx.arc(x,y,6,0,TAU);ctx.fill();ctx.strokeStyle='#fff6d1';ctx.lineWidth=1;ctx.stroke();}
  for(const npc of state.world.npcs){const [x,y]=mapXY(npc.group.position.x,npc.group.position.z);ctx.font='12px Arial';ctx.fillText(npc.model.face,x-6,y+4);}
  const [px,py]=mapXY(state.hero.position.x,state.hero.position.z),a=state.hero.rotation.y;
  ctx.save();ctx.translate(px,py);ctx.rotate(Math.PI-a);
  ctx.shadowColor='#b3ffe5';ctx.shadowBlur=13;ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(5.5,6);ctx.lineTo(0,3);ctx.lineTo(-5.5,6);ctx.closePath();ctx.fillStyle='#a5ffe0';ctx.fill();ctx.strokeStyle='#184e48';ctx.lineWidth=1.4;ctx.stroke();ctx.restore();
  ctx.restore();
  ctx.strokeStyle='rgba(255,244,205,.52)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(cx,cy,59,57,0,0,TAU);ctx.stroke();
}

// ----- NPC system: distinct occupations, dialogue and Vietnamese speech -----
function buildNPCVisual(parent,model){
  const g=new THREE.Group();g.position.set(model.x,0,model.z);parent.add(g);
  const robe=mat(model.robe),hat=mat(model.color),warm=mat('#ffe1ba');
  sphere(g,robe,0,.95,0,.55,.70,.50,true);
  sphere(g,warm,0,1.89,.02,.59,.6,.52,true);
  for(const side of [-1,1]){
    sphere(g,white,side*.22,1.97,.51,.12,.14,.08);sphere(g,dark,side*.22,1.97,.59,.065,.09,.045);
    sphere(g,robe,side*.56,1.22,0,.18,.38,.2);
  }
  smile(g,0,1.76,.52,.14);
  mushroomCap(g,model.color,1.02,.78,2.28,model.x*17+110,6);
  if(model.id==='healer'){sphere(g,glassGlow,.76,1.05,.35,.21,.28,.21);}
  if(model.id==='merchant'){sphere(g,gold,.6,.9,.4,.23,.23,.18);}
  if(model.id==='ranger'){const staff=cylinder(g,wood,.73,1.1,.13,.04,.07,1.8,9);staff.rotation.z=.2;}
  if(model.id==='fairy'){sphere(g,glassGlow,-.82,1.45,.15,.35,.5,.13);sphere(g,glassGlow,.82,1.45,.15,.35,.5,.13);}
  if(model.id==='scholar'){const book=make(g,new THREE.BoxGeometry(.38,.12,.3),mat('#9a76b7'),[.66,1.14,.35]);book.rotation.z=-.2;}
  if(model.id==='smith'){sphere(g,mat('#7f97a5'),.65,1.1,.32,.26,.21,.25);}
  const label=createLabel(model.name.toUpperCase(),'#fff0c7',1.03);label.position.set(0,4.02,0);g.add(label);
  g.rotation.y=.1;return g;
}
function clickNPC(e){
  if(!state.world?.npcs?.length)return;
  const rect=canvas.getBoundingClientRect();let x,y;
  if(isRotatedLandscape()){x=(e.clientY-rect.top)/rect.height;y=1-(e.clientX-rect.left)/rect.width;}
  else{x=(e.clientX-rect.left)/rect.width;y=(e.clientY-rect.top)/rect.height;}
  npcMouse.set(x*2-1,1-y*2);
  npcRaycaster.setFromCamera(npcMouse,camera);
  const objects=state.world.npcs.map(n=>n.group);
  const hits=npcRaycaster.intersectObjects(objects,true);
  for(const hit of hits){let target=hit.object;
    while(target&&target!==scene){if(target.userData?.npcId){const m=NPCS.find(n=>n.id===target.userData.npcId);if(m){openNpcDialogue(m);return;}}target=target.parent;}
  }
}
function openNpcDialogue(npc){
  if(!state.started||state.gameOver)return;
  state.activeNpc=npc;state.npcLine=0;state.paused=true;
  $('npc-portrait').textContent=npc.face;$('npc-name').textContent=npc.name;$('npc-job').textContent=npc.job;
  $('npc-screen').classList.remove('hidden');
  sound('open');renderNpcLine();
}
function renderNpcLine(){const npc=state.activeNpc;if(!npc)return;
  const lines=getNpcLines(npc,state),index=state.npcLine%lines.length;
  $('npc-text').textContent=lines[index];
  $('npc-next').disabled=lines.length<2;
  $('npc-next').textContent=index===lines.length-1?'↩️ Nghe từ đầu':'➡️ Tiếp câu';
  $('npc-service').textContent=npc.actionLabel;
  const near=Math.hypot(state.hero.position.x-npc.x,state.hero.position.z-npc.z)<5.0;
  $('npc-service').disabled=!near;
  $('npc-service').title=near?'':'Hãy đến gần NPC để sử dụng dịch vụ';
  $('npc-subtitle-hint').textContent=near?'🔊 Lời thoại tiếng Việt · Chạm Nghe lại để phát lại':'🔊 Đang trò chuyện từ xa. Đến gần nhân vật để sử dụng dịch vụ.';
  speakNpcLine();
}
function speakNpcLine(){const npc=state.activeNpc;if(!npc)return;
  const lines=getNpcLines(npc,state);gameAudio.speak(lines[state.npcLine%lines.length],npc.id);
  const status=gameAudio.updateVoiceStatus();$('audio-voice-status').textContent=status;
  if(!/^Giọng Việt:/.test(status))$('npc-subtitle-hint').textContent='💬 '+status+' Phụ đề tiếng Việt vẫn hiển thị.';
}
function nextNpcLine(){if(!state.activeNpc)return;const lines=getNpcLines(state.activeNpc,state);state.npcLine=(state.npcLine+1)%lines.length;renderNpcLine();}
function closeNpcDialogue(){gameAudio.stopSpeech();$('npc-screen').classList.add('hidden');state.activeNpc=null;
  if(state.started&&!state.gameOver&&!state.levelPopup&&$('help-screen').classList.contains('hidden')&&$('worldmap-screen').classList.contains('hidden'))state.paused=false;
}
function npcService(){const npc=state.activeNpc;if(!npc)return;
  if(Math.hypot(state.hero.position.x-npc.x,state.hero.position.z-npc.z)>=5){notify('Hãy đến gần nhân vật để sử dụng dịch vụ!','red');return;}
  const price=npc.price||0;if(state.coins<price){notify(`🪙 Cần thêm ${price-state.coins} xu để sử dụng dịch vụ!`,'red');return;}
  let msg='';switch(npc.action){
    case 'quest':msg=`📜 ${ZONES[state.zone].quest}: ${state.quests[state.zone]}/${ZONES[state.zone].target}`;break;
    case 'heal':if(state.hp>=maxHP(state.level)&&state.mp>=maxMP(state.level)){msg='🌱 Sinh lực và pháp lực của bạn đã đầy!';break;}state.coins-=price;state.hp=maxHP(state.level);state.mp=maxMP(state.level);msg='💚 Đã hồi phục hoàn toàn HP và MP!';sound('potion');break;
    case 'potion':if(state.potions>=999){msg='Túi đã đầy bình máu!';break;}state.coins-=price;state.potions++;msg='🧪 Đã mua 1 bình hồi máu.';sound('coin');break;
    case 'guard':if(elapsed<state.rangerBuffUntil){msg='🛡️ Bảo hộ của kiểm lâm còn hiệu lực!';break;}state.coins-=price;state.rangerBuffUntil=elapsed+45;msg='🛡️ Đã được bảo hộ 45 giây: di chuyển nhanh hơn và chịu ít sát thương hơn.';sound('spell');break;
    case 'mana':if(elapsed-state.fairyBlessAt<30){msg=`✨ Phước lành cần hồi thêm ${Math.ceil(30-(elapsed-state.fairyBlessAt))} giây.`;break;}state.fairyBlessAt=elapsed;state.mp=maxMP(state.level);msg='✨ Tiên nữ đã hồi đầy pháp lực cho bạn!';sound('spell');break;
    case 'knowledge':msg='💎 Gợi ý: Dùng phép từ xa và lướt né khi vòng cảnh báo đỏ xuất hiện.';break;
    case 'upgrade':if(elapsed<state.attackBoostUntil){msg='⚔️ Cường hóa sức đánh vẫn còn hiệu lực!';break;}state.coins-=price;state.attackBoostUntil=elapsed+60;msg='⚔️ Sức tấn công tăng 25% trong 60 giây!';sound('improve');break;
    default:msg='Chúc con phiêu lưu thuận lợi!';
  }
  refreshHUD();saveGame();notify(msg,'gold');
  $('npc-text').textContent=msg;
  gameAudio.speak(msg.replace(/[^\p{L}\p{N}\s,.!?]/gu,' '),npc.id);
}
function bindAudioSettings(){
  const checks={musicOn:'audio-music-on',effectsOn:'audio-effects-on',voiceOn:'audio-voice-on'};
  const ranges={music:'audio-music',ambience:'audio-ambience',sfx:'audio-sfx',voice:'audio-voice'};
  for(const [key,id] of Object.entries(checks))$(id).addEventListener('change',e=>gameAudio.setPref(key,e.target.checked));
  for(const [key,id] of Object.entries(ranges))$(id).addEventListener('input',e=>gameAudio.setPref(key,Number(e.target.value)/100));
  syncAudioSettings();
}
function syncAudioSettings(){
  const p=gameAudio.prefs;
  for(const [key,id] of Object.entries({musicOn:'audio-music-on',effectsOn:'audio-effects-on',voiceOn:'audio-voice-on'}))$(id).checked=p[key];
  for(const [key,id] of Object.entries({music:'audio-music',ambience:'audio-ambience',sfx:'audio-sfx',voice:'audio-voice'}))$(id).value=Math.round(p[key]*100);
  $('audio-voice-status').textContent=gameAudio.updateVoiceStatus();
}
init();