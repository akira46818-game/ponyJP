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
  {id:'meadow',name:'なみなみ さんぽ',short:'なみなみ',note:'うえ、した、うえ！ ほしを とおって かこう。',route:[[195,350],[300,235],[430,350],[560,235],[690,350],[805,350]],marks:[1,2,3],rocks:[],theme:'meadow'},
  {id:'flowers',name:'おおきな Sじ',short:'Sじ',note:'みぎへ、ひだりへ。ながい Sじを かこう！',route:[[195,370],[350,390],[630,380],[680,300],[600,225],[360,225],[330,155],[510,150],[680,220],[805,285]],marks:[2,5,7],rocks:[],theme:'flowers'},
  {id:'rock',name:'ぐるりん ループ',short:'くるりん',note:'ぐるっと ひとまわり！ せんが かさなっても いいよ。',route:[[195,350],[300,330],[370,260],[405,180],[500,150],[595,180],[630,260],[595,340],[500,370],[405,340],[370,260],[390,370],[550,415],[710,390],[805,350]],marks:[4,6,8],rocks:[],theme:'meadow'},
  {id:'forest',name:'くねくね もりのみち',short:'くねくね',note:'いわを よけて、くねくね。5この ほしを むすぼう。',route:[[195,325],[300,180],[415,345],[525,190],[640,345],[720,200],[805,355]],marks:[1,2,3,4,5],rocks:[{x:400,y:420,r:38},{x:600,y:420,r:38}],theme:'forest'},
  {id:'stars',name:'ハートの にじ',short:'ハート',note:'ほしぞらに、おおきな ハートを かこう！',route:[[195,365],[330,395],[500,400],[355,300],[320,225],[375,155],[455,160],[500,215],[545,160],[625,155],[680,225],[645,300],[500,400],[680,385],[805,300]],marks:[2,5,7,9],rocks:[],theme:'night'},
  {id:'castle',name:'おしろへ ぐるぐる',short:'ぐるぐる',note:'まわって、まわって、おしろへ！ すきな にじに しよう。',route:[[195,355],[275,270],[310,190],[385,170],[465,220],[465,300],[395,345],[315,315],[275,240],[385,230],[535,300],[620,340],[705,300],[725,225],[675,160],[590,150],[525,200],[525,275],[630,270],[740,280],[805,280]],marks:[3,6,11,14],rocks:[],theme:'castle'}
].map(level=>({...level,start:{x:level.route[0][0],y:level.route[0][1]},end:{x:level.route.at(-1)[0],y:level.route.at(-1)[1]},stars:level.marks.map(i=>({x:level.route[i][0],y:level.route[i][1]}))}));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export function examplePath(level){
  // Interpolating curves keep the loops and S-turns, instead of reducing every route to an arch.
  const route=level.route,points=[];
  for(let i=0;i<route.length-1;i++){
    const a=route[Math.max(0,i-1)],b=route[i],c=route[i+1],d=route[Math.min(route.length-1,i+2)];
    for(let j=0;j<18;j++){
      const t=j/18,t2=t*t,t3=t2*t;
      const at=k=>.5*((2*b[k])+(-a[k]+c[k])*t+(2*a[k]-5*b[k]+4*c[k]-d[k])*t2+(-a[k]+3*b[k]-3*c[k]+d[k])*t3);
      points.push({x:at(0),y:at(1)});
    }
  }
  return [...points,{...level.end}];
}
export function segmentDistance(p,a,b){
  const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy;
  const t=l?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/l)):0;
  return distance(p,{x:a.x+t*dx,y:a.y+t*dy});
}
export function starProgress(path,level){
  const segments=path.slice(1).map((b,i)=>({a:path[i],b,length:distance(path[i],b)})),total=segments.reduce((s,p)=>s+p.length,0);
  return (level.stars||[]).map(star=>{
    let travelled=0;
    for(const {a,b,length} of segments){
      if(length&&segmentDistance(star,a,b)<=54){
        const t=Math.max(0,Math.min(1,((star.x-a.x)*(b.x-a.x)+(star.y-a.y)*(b.y-a.y))/(length*length)));
        return (travelled+t*length)/total;
      }
      travelled+=length;
    }
    return null;
  });
}
export function checkBridge(input,level){
  if(!Array.isArray(input)||input.length<2)return {ok:false,reason:'short'};
  if(input.length>1000||input.some(p=>!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)))return {ok:false,reason:'bounds'};
  const path=input.map(p=>({x:p.x,y:p.y}));
  if(distance(path[0],level.end)<distance(path[0],level.start))path.reverse();
  if(distance(path[0],level.start)>78||distance(path.at(-1),level.end)>78)return {ok:false,reason:'ends'};
  // Snap both ends to the banks; drawing near a marker is enough for small hands.
  path[0]={...level.start};path[path.length-1]={...level.end};
  if(path.some(p=>p.x<110||p.x>890||p.y<130||p.y>440))return {ok:false,reason:'bounds'};
  let length=0;
  for(let i=1;i<path.length;i++){
    const a=path[i-1],b=path[i];length+=distance(a,b);
    // Check complete segments, including the snapped ends, so a quick stroke cannot skip a rock.
    if(level.rocks.some(rock=>segmentDistance(rock,a,b)<rock.r+24))return {ok:false,reason:'rock'};
  }
  if(length>4000)return {ok:false,reason:'long'};
  const stars=starProgress(path,level),missing=stars.filter(at=>at===null).length;
  if(missing)return {ok:false,reason:'stars',missing};
  return {ok:true,path,length,stars};
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
export function nextUnfinishedLevel(state){
  for(let offset=1;offset<=LEVELS.length;offset++){const i=(state.level+offset)%LEVELS.length;if(!state.completed.includes(LEVELS[i].id))return i;}
  return null;
}
