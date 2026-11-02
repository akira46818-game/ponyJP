export const SAVE_KEY='ponyland-run-v1';
export const CHARACTERS=[
  {id:'lumina',name:'ルミナ',image:'../ice-cream/assets/lumina.png',color:'#e79cba'},
  {id:'flare',name:'フレア',image:'../ice-cream/assets/flare.png',color:'#efa35c'},
  {id:'aqua',name:'アクア',image:'../ice-cream/assets/aqua.png',color:'#70c8dc'},
  {id:'cat',name:'ミュウミュウ',image:'../mewmew-happy-v8-front.png',color:'#9b807e'},
  {id:'terra',name:'テラ',image:'../ice-cream/assets/terra.png',color:'#8dbb79'},
  {id:'storm',name:'ストーム',image:'../ice-cream/assets/storm.png',color:'#9b9be4'}
];
export const STAGES=[{name:'がくえんの まち',short:'がくえん',icon:'⌂',color:'#75b9bc'},{name:'おはなばたけ',short:'おはなばたけ',icon:'✿',color:'#b7c97f'},{name:'にじの みち',short:'にじの みち',icon:'虹',color:'#b9a4d5'}];
export const LENGTH=360;
export const MAX_STARS=40;
export function newJourney(id){return {version:1,id,character:'lumina',mode:'easy',sound:false,scores:[],ticket:null};}
export function restoreJourney(raw,id){
  const fresh=newJourney(id);
  if(!raw||raw.version!==1||typeof raw.id!=='string'||!/^[\w-]{1,100}$/.test(raw.id))return fresh;
  fresh.id=raw.id;
  if(CHARACTERS.some(c=>c.id===raw.character))fresh.character=raw.character;
  fresh.mode=raw.mode==='challenge'?'challenge':'easy';fresh.sound=raw.sound===true;
  if(Array.isArray(raw.scores))for(const n of raw.scores.slice(0,3)){if(!Number.isInteger(n)||n<0||n>MAX_STARS)break;fresh.scores.push(n);}
  if(fresh.scores.length===3&&raw.ticket===`pony-run:${fresh.id}:day:1`)fresh.ticket=raw.ticket;
  return fresh;
}
export function makeCourse(stage){
  const items=[];
  // Every row always has a walkable lane. The first obstacles come after a practice area.
  for(let row=0;row<8;row++){
    const z=65+row*36,safe=(row+stage)%3;
    for(let lane=0;lane<3;lane++)if(lane!==safe&&(row%3!==0||lane===(safe+1)%3))items.push({kind:'obstacle',lane,z,done:false});
    for(let j=0;j<4;j++)items.push({kind:'star',lane:safe,z:z-12+j*5,done:false});
  }
  for(let i=0;i<8;i++)items.push({kind:'star',lane:1,z:16+i*4,done:false});
  return items.sort((a,b)=>a.z-b.z);
}
export function newRun(stage,mode='easy'){return {stage,mode,distance:0,lane:1,x:1,jumpTime:0,jumpHeight:0,slow:0,stars:0,bumps:0,finished:false,items:makeCourse(stage)};}
export function move(run,direction){if(run.finished)return;run.lane=Math.max(0,Math.min(2,run.lane+Math.sign(direction)));}
export function jump(run){if(run.finished||run.jumpTime>0)return false;run.jumpTime=.95;return true;}
export function step(run,delta){
  if(run.finished||!Number.isFinite(delta)||delta<=0)return [];
  const dt=Math.min(delta,.05),events=[];
  run.x+=(run.lane-run.x)*Math.min(1,dt*15);
  run.jumpTime=Math.max(0,run.jumpTime-dt);
  run.jumpHeight=run.jumpTime?Math.sin(Math.PI*run.jumpTime/.95):0;
  run.slow=Math.max(0,run.slow-dt);
  run.distance=Math.min(LENGTH,run.distance+dt*(run.mode==='easy'?15:22)*(run.slow>0?.55:1));
  for(const item of run.items){
    if(item.done||item.z>run.distance)continue;
    item.done=true;
    if(Math.abs(run.x-item.lane)>.42)continue;
    if(item.kind==='star'){run.stars++;events.push('star');}
    else if(run.jumpHeight>.35)events.push('jumped');
    else {run.bumps++;run.slow=.65;events.push('bump');}
  }
  if(run.distance>=LENGTH){run.finished=true;events.push('finish');}
  return events;
}
export function finishStage(journey,run){
  if(!run.finished||run.stage!==journey.scores.length||run.stage>=3)return false;
  journey.scores.push(run.stars);return true;
}
