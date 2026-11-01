export const SAVE_KEY='ponyland-hide-and-seek-v1';
export const CHARACTERS=[
  {id:'lumina',name:'ルミナ',image:'../ice-cream/assets/lumina.png',color:'#e4a7bb'},
  {id:'flare',name:'フレア',image:'../ice-cream/assets/flare.png',color:'#edba7e'},
  {id:'aqua',name:'アクア',image:'../ice-cream/assets/aqua.png',color:'#8abed2'},
  {id:'cat',name:'ミュウミュウ',image:'../mewmew-happy-v8-front.png',color:'#b4a0ba'},
  {id:'terra',name:'テラ',image:'../ice-cream/assets/terra.png',color:'#a5be80'},
  {id:'storm',name:'ストーム',image:'../ice-cream/assets/storm.png',color:'#b0afe0'}
];
const spot=(kind,label,color)=>({kind,label,color});
export const SCENES=[
  {id:'garden',name:'おはなばたけ',icon:'✿',caption:'おはなの かげに、だれか いるかな？',spots:[
    spot('flowers','ピンクの おはな','#e5a5b3'),spot('house','とりの おうち','#b8c5a0'),spot('bush','まるい しげみ','#8db99a'),
    spot('basket','ピクニックの かご','#d4ac79'),spot('pots','みずいろの はち','#a2c9cf'),spot('flowers','きいろの おはな','#edca73'),
    spot('watering','じょうろ','#97bfc7'),spot('bench','ちいさな ベンチ','#cba695'),spot('bush','おおきな しげみ','#aac48e')
  ]},
  {id:'playroom',name:'おもちゃの おへや',tab:'おもちゃ',icon:'♧',caption:'おもちゃの あいだを、のぞいてみよう。',spots:[
    spot('books','えほんの たな','#b8c5a0'),spot('tent','さんかくの テント','#e4b2b8'),spot('blocks','つみきの おしろ','#94bbc8'),
    spot('basket','おもちゃの かご','#cfa67c'),spot('cushion','ほしの クッション','#e7c878'),spot('train','おもちゃの きしゃ','#a1bca0'),
    spot('blocks','カラフルな つみき','#d5aaa1'),spot('books','おおきな えほん','#a4bfd3'),spot('tent','みずいろの テント','#9dbdc4')
  ]},
  {id:'forest',name:'ほしの もり',icon:'☾',caption:'おつきさまも、いっしょに さがしているよ。',spots:[
    spot('mushroom','ピンクの きのこ','#d6a2b7'),spot('bush','ぎんいろの しげみ','#a2b2bb'),spot('stump','おおきな きりかぶ','#b59b88'),
    spot('tent','ほしの テント','#9ba4c9'),spot('flowers','ひかる おはな','#d5c888'),spot('mushroom','みずいろの きのこ','#8caebb'),
    spot('stump','ちいさな きりかぶ','#a58e83'),spot('house','もりの おうち','#c3b3d0'),spot('bush','つきいろの しげみ','#a8bdad')
  ]}
];
function shuffled(list,random){
  const result=[...list];
  for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.max(0,Math.min(.999999999,random()))*(i+1));[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
export function newSession(roundId,random=Math.random){
  return {version:1,roundId,scene:0,mode:'easy',sound:false,layouts:SCENES.map(()=>shuffled([...CHARACTERS.map(c=>c.id),null,null,null],random)),found:SCENES.map(()=>[]),rewardTicket:null};
}
export function restoreSession(raw,roundId,random=Math.random){
  const fallback=()=>newSession(roundId,random),ids=CHARACTERS.map(c=>c.id);
  if(!raw||raw.version!==1||typeof raw.roundId!=='string'||!raw.roundId||raw.roundId.length>100)return fallback();
  if(!Array.isArray(raw.layouts)||raw.layouts.length!==3||raw.layouts.some(layout=>!Array.isArray(layout)||layout.length!==9||layout.some(id=>id!==null&&!ids.includes(id))||ids.some(id=>layout.filter(x=>x===id).length!==1)))return fallback();
  const found=SCENES.map((_,i)=>[...new Set(Array.isArray(raw.found?.[i])?raw.found[i]:[])].filter(id=>ids.includes(id)));
  return {version:1,roundId:raw.roundId,scene:Number.isInteger(raw.scene)&&raw.scene>=0&&raw.scene<3?raw.scene:0,mode:raw.mode==='challenge'?'challenge':'easy',sound:raw.sound===true,layouts:raw.layouts.map(l=>[...l]),found,rewardTicket:typeof raw.rewardTicket==='string'&&raw.rewardTicket===`hide-and-seek:${raw.roundId}:day:1`?raw.rewardTicket:null};
}
export const sceneComplete=(state,i=state.scene)=>state.found[i].length===CHARACTERS.length;
export const allComplete=state=>SCENES.every((_,i)=>sceneComplete(state,i));
export function findAt(state,index){
  if(!Number.isInteger(index)||index<0||index>=9)return {kind:'invalid'};
  const id=state.layouts[state.scene][index];
  if(id===null)return {kind:'empty'};
  if(state.found[state.scene].includes(id))return {kind:'already',id};
  state.found[state.scene].push(id);
  return {kind:'found',id,sceneComplete:sceneComplete(state),allComplete:allComplete(state)};
}
export function hintSpot(state){return state.layouts[state.scene].findIndex(id=>id!==null&&!state.found[state.scene].includes(id));}
export function nextScene(state){for(let offset=1;offset<=3;offset++){const i=(state.scene+offset)%3;if(!sceneComplete(state,i))return i;}return null;}
