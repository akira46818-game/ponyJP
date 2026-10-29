export const SAVE_KEY='ponyland-rainbow-bridge-v1';
export const CHARACTERS=[
  {id:'lumina',name:'ルミナ',image:'../ice-cream/assets/lumina.png',color:'#e48eb0'},
  {id:'flare',name:'フレア',image:'../ice-cream/assets/flare.png',color:'#e9a368'},
  {id:'aqua',name:'アクア',image:'../ice-cream/assets/aqua.png',color:'#7ab9d6'},
  {id:'cat',name:'ミュウミュウ',image:'../mewmew-happy-v8-front.png',color:'#b89c93'},
  {id:'terra',name:'テラ',image:'../ice-cream/assets/terra.png',color:'#99ba7f'},
  {id:'storm',name:'ストーム',image:'../ice-cream/assets/storm.png',color:'#a6a3da'}
];
export const LEVELS=[
  {id:'meadow',name:'はじめての はし',note:'おはなと はたを、せんで つなごう。',start:{x:195,y:350},end:{x:805,y:350},peak:290,rocks:[],theme:'meadow'},
  {id:'flowers',name:'おはなの おか',note:'たかい おかまで、はしを のばそう。',start:{x:195,y:370},end:{x:805,y:285},peak:210,rocks:[],theme:'flowers'},
  {id:'rock',name:'いわを こえて',note:'いわの うえを とおる はしに しよう。',start:{x:195,y:350},end:{x:805,y:350},peak:130,rocks:[{x:500,y:390,r:70}],theme:'meadow'},
  {id:'forest',name:'もりの さんぽ',note:'ふたつの いわを、よけて かこう。',start:{x:195,y:325},end:{x:805,y:355},peak:100,rocks:[{x:400,y:390,r:58},{x:600,y:365,r:62}],theme:'forest'},
  {id:'stars',name:'ほしぞらの はし',note:'おつきさまに むかって、にじを かこう。',start:{x:195,y:365},end:{x:805,y:300},peak:75,rocks:[{x:500,y:355,r:65}],theme:'night'},
  {id:'castle',name:'にじの おしろ',note:'さいごは おしろへ！ どんな はしに しよう？',start:{x:195,y:355},end:{x:805,y:280},peak:65,rocks:[{x:410,y:390,r:62},{x:610,y:360,r:66}],theme:'castle'}
];
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function examplePath(level){
  const a=level.start,b=level.end;
  return Array.from({length:81},(_,i)=>{const t=i/80,u=1-t;return {x:u*u*a.x+2*u*t*500+t*t*b.x,y:u*u*a.y+2*u*t*level.peak+t*t*b.y};});
}
export function segmentDistance(p,a,b){
  const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy;
  const t=l?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/l)):0;
  return distance(p,{x:a.x+t*dx,y:a.y+t*dy});
}
export function checkBridge(input,level){
  if(!Array.isArray(input)||input.length<2)return {ok:false,reason:'short'};
  if(input.length>1000||input.some(p=>!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)))return {ok:false,reason:'bounds'};
  const path=input.map(p=>({x:p.x,y:p.y}));
  if(distance(path[0],level.end)<distance(path[0],level.start))path.reverse();
  if(distance(path[0],level.start)>78||distance(path.at(-1),level.end)>78)return {ok:false,reason:'ends'};
  // Snap both ends to the banks; drawing near a marker is enough for small hands.
  path[0]={...level.start};path[path.length-1]={...level.end};
  if(path.some(p=>p.x<110||p.x>890||p.y<70||p.y>420))return {ok:false,reason:'bounds'};
  let length=0;
  for(let i=1;i<path.length;i++){
    const a=path[i-1],b=path[i];length+=distance(a,b);
    // Check complete segments, including the snapped ends, so a quick stroke cannot skip a rock.
    if(level.rocks.some(rock=>segmentDistance(rock,a,b)<rock.r+24))return {ok:false,reason:'rock'};
  }
  if(length>2400)return {ok:false,reason:'long'};
  return {ok:true,path,length};
}
export function pathPosition(path,progress){
  if(progress<=0)return {...path[0]};
  if(progress>=1)return {...path.at(-1)};
  const lengths=path.slice(1).map((p,i)=>distance(path[i],p)),total=lengths.reduce((a,b)=>a+b,0);
  let at=Math.max(0,Math.min(1,progress))*total;
  for(let i=0;i<lengths.length;i++){
    if(at<=lengths[i]&&lengths[i]>0){const t=at/lengths[i];return {x:path[i].x+(path[i+1].x-path[i].x)*t,y:path[i].y+(path[i+1].y-path[i].y)*t};}
    at-=lengths[i];
  }
  return {...path.at(-1)};
}
export function newSession(roundId){return {version:1,roundId,character:'lumina',level:0,completed:[],path:[],sound:false,rewardTicket:null};}
export function restoreSession(raw,roundId){
  const state=newSession(roundId);
  if(!raw||raw.version!==1||typeof raw.roundId!=='string'||!raw.roundId||raw.roundId.length>100)return state;
  state.roundId=raw.roundId;
  if(CHARACTERS.some(c=>c.id===raw.character))state.character=raw.character;
  state.completed=[...new Set(Array.isArray(raw.completed)?raw.completed:[])].filter(id=>LEVELS.some(l=>l.id===id));
  state.level=Number.isInteger(raw.level)?Math.max(0,Math.min(5,raw.level)):0;
  const valid=checkBridge(raw.path,LEVELS[state.level]);
  state.path=valid.ok?valid.path:[];state.sound=raw.sound===true;
  state.rewardTicket=typeof raw.rewardTicket==='string'?raw.rewardTicket:null;
  return state;
}
export function completeLevel(state){
  const level=LEVELS[state.level],valid=checkBridge(state.path,level);
  if(!valid.ok)return false;
  if(!state.completed.includes(level.id))state.completed.push(level.id);
  return state.completed.length===LEVELS.length;
}
