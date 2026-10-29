import {SAVE_KEY,CHARACTERS,LEVELS,distance,examplePath,checkBridge,pathPosition,newSession,restoreSession,completeLevel} from './model.mjs';
import {drawLandscape,drawRocks,drawMarkers,pathData,drawBridge} from './scene.mjs';
const $=id=>document.getElementById(id),board=$('board');
const uid=()=>crypto.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
let state=newSession(uid()),phase='empty',showGuide=true,pointer=null,stroke=[],previousPath=[],frame=0,storageOK=true,awarding=false,audio;
try{state=restoreSession(JSON.parse(localStorage.getItem(SAVE_KEY)||'null'),state.roundId);}catch{storageOK=false;}
const level=()=>LEVELS[state.level],character=()=>CHARACTERS.find(c=>c.id===state.character);
const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
function save(){
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));storageOK=true;$('saveStatus').textContent='';}
  catch{storageOK=false;$('saveStatus').textContent='進み具合を保存できません。この画面では遊べますが、閉じると続きが残らないことがあります。';}
}
function say(text){if(!state.sound||!('speechSynthesis' in window))return;speechSynthesis.cancel();const s=new SpeechSynthesisUtterance(text);s.lang='ja-JP';s.rate=.85;s.pitch=1.1;s.volume=.7;speechSynthesis.speak(s);}
function chime(){if(!state.sound)return;try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;audio||=new A();audio.resume();[523,659,784].forEach((f,i)=>{const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+i*.14;o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.04,t+.02);g.gain.exponentialRampToValueAtTime(.001,t+.3);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.32);});}catch{}}
function message(text,error=false){$('message').textContent=text;$('message').classList.toggle('error',error);}
function placeWalker(p){$('walker').setAttribute('transform',`translate(${p.x} ${p.y-3})`);}
function paintBridge(points=state.path){$('bridge').innerHTML=drawBridge(points);}
function controls(){
  const busy=phase==='walking'||phase==='drawing',arrived=phase==='arrived';
  $('go').disabled=phase!=='ready';$('go').hidden=arrived;$('go').innerHTML=phase==='walking'?'とことこ、おさんぽ…':'わたってみよう <span aria-hidden="true">→</span>';
  $('next').hidden=!arrived||state.level===5;
  ['clear','hint','useGuide'].forEach(id=>$(id).disabled=busy);
  document.querySelectorAll('.character').forEach(b=>b.disabled=busy);
  $('guide').style.display=showGuide&&!busy&&!arrived?'':'none';$('hint').setAttribute('aria-pressed',showGuide);
  $('celebration').hidden=!arrived;$('sceneLabel').hidden=arrived||phase==='walking';
  $('thanks').textContent=character().name+'も うれしそう！';
  board.setAttribute('aria-label',`${level().name}。${character().name}${phase==='walking'?'が橋を渡っています':arrived?'がゴールしました':'が待っています'}。${level().note} 描く操作がむずかしいときは、下のおてほんの橋を使うボタンで遊べます。`);
}
function render(){
  const l=level(),c=character();
  phase=state.path.length?(state.completed.includes(l.id)?'arrived':'ready'):'empty';
  $('chapterNumber').textContent=`STAGE ${String(state.level+1).padStart(2,'0')} / 06`;$('levelTitle').textContent=l.name;
  $('stages').innerHTML=LEVELS.map((item,i)=>`<li class="${i===state.level?'current':state.completed.includes(item.id)?'done':''}" ${i===state.level?'aria-current="step"':''} aria-label="${i+1} ${item.name}${state.completed.includes(item.id)?' クリア':''}">${state.completed.includes(item.id)?'✓':i+1}</li>`).join('');
  $('landscape').innerHTML=drawLandscape(l);$('obstacles').innerHTML=drawRocks(l);$('markers').innerHTML=drawMarkers(l);$('guide').setAttribute('d',pathData(examplePath(l)));
  $('walkerImage').setAttribute('href',c.image);
  // Align the visible feet, accounting for transparent margins in the existing art.
  const sprite=c.id==='cat'?[-61,-125,120,128.5]:c.id==='terra'?[-85,-110,155,111.6]:c.id==='storm'?[-78,-115,153,114.2]:[-72,-135,144,144];
  ['x','y','width','height'].forEach((key,i)=>$('walkerImage').setAttribute(key,sprite[i]));
  $('walkerImage').setAttribute('transform',c.id==='terra'||c.id==='storm'?'scale(-1 1)':'');
  $('walker').classList.remove('walking','arrived');placeWalker(phase==='arrived'?l.end:l.start);paintBridge();$('sparkles').replaceChildren();
  $('friendNote').textContent=c.name+'と おさんぽ';document.querySelectorAll('.character').forEach(b=>b.setAttribute('aria-pressed',b.dataset.id===c.id));
  $('sound').textContent=state.sound?'♪ おと ON':'♪ おと OFF';$('sound').setAttribute('aria-pressed',state.sound);
  message(phase==='arrived'?'わたれたね！ すてきな はしを ありがとう。':phase==='ready'?'はしが つながったよ！「わたってみよう」を おしてね。':l.note);
  $('complete').hidden=state.completed.length!==6;
  if(state.rewardTicket){$('gift').hidden=false;$('gift').href='../gifts.html?ticket='+encodeURIComponent(state.rewardTicket);$('rewardStatus').textContent='無料のガチャ券を 1まい ほぞんしたよ！';}
  controls();
}
function point(event){const p=board.createSVGPoint();p.x=event.clientX;p.y=event.clientY;const t=p.matrixTransform(board.getScreenCTM().inverse());return {x:t.x,y:t.y};}
function appendPoint(event,force=false){if(stroke.length>=999)return;const p=point(event);if(force||distance(p,stroke.at(-1))>=5)stroke.push(p);}
board.addEventListener('pointerdown',event=>{
  if(phase==='walking'||pointer!==null||event.button!==0)return;
  const p=point(event),l=level();
  if(Math.min(distance(p,l.start),distance(p,l.end))>78){message('おはなの まわりから、かきはじめてね。',true);return;}
  event.preventDefault();board.setPointerCapture(event.pointerId);pointer=event.pointerId;previousPath=state.path;stroke=[p];state.path=[];phase='drawing';$('celebration').hidden=true;
  $('walker').classList.remove('arrived');placeWalker(l.start);$('sparkles').replaceChildren();paintBridge(stroke);controls();message('そのまま、はたまで つなげよう！');
});
board.addEventListener('pointermove',event=>{if(pointer!==event.pointerId)return;event.preventDefault();for(const e of event.getCoalescedEvents?.()||[event])appendPoint(e);paintBridge(stroke);});
function finishDrawing(event,cancel=false){
  if(pointer!==event.pointerId)return;
  if(!cancel)appendPoint(event,true);pointer=null;if(board.hasPointerCapture(event.pointerId))board.releasePointerCapture(event.pointerId);
  if(cancel){state.path=previousPath;render();message('もういちど ゆっくり かいてみよう。');return;}
  const result=checkBridge(stroke,level());
  if(result.ok){state.path=result.path;phase='ready';paintBridge();message('はしが つながったよ！「わたってみよう」を おしてね。');}
  else{state.path=[];phase='empty';const notes={ends:'あとすこし！ おはなと はたを つないでみよう。',short:'おはなから はたまで、すーっと かこう。',bounds:'おてほんを みて、もういちど かいてみよう。',rock:'いわに ふれたね。いわの うえを とおってみよう。',long:'すこし みじかい はしに してみよう。'};message(notes[result.reason],true);}
  save();controls();
}
board.addEventListener('pointerup',event=>finishDrawing(event));board.addEventListener('pointercancel',event=>finishDrawing(event,true));board.addEventListener('lostpointercapture',event=>finishDrawing(event,true));
function setReadyPath(path){state.path=path;phase='ready';save();placeWalker(level().start);$('walker').classList.remove('arrived');$('sparkles').replaceChildren();paintBridge();controls();message('はしが つながったよ！「わたってみよう」を おしてね。');}
$('clear').onclick=()=>{state.path=[];save();render();};
$('hint').onclick=()=>{showGuide=!showGuide;controls();};
$('useGuide').onclick=()=>setReadyPath(examplePath(level()));
$('go').onclick=()=>{
  if(phase!=='ready')return;const valid=checkBridge(state.path,level());if(!valid.ok)return;
  state.path=valid.path;phase='walking';save();controls();$('walker').classList.add('walking');message(character().name+'が、きみの はしを わたっているよ。');say(character().name+'が、わたるよ。');
  const rect=board.getBoundingClientRect();if(rect.top<0||rect.bottom>innerHeight)board.scrollIntoView({block:'center',behavior:reduced()?'instant':'smooth'});
  const duration=reduced()?900:Math.max(3800,Math.min(8500,valid.length*6.5));let elapsed=0,last=0;
  function tick(time){
    const dt=last?Math.min(60,time-last):0;last=time;
    if(!document.hidden){elapsed+=dt;placeWalker(pathPosition(state.path,Math.min(1,elapsed/duration)));}
    if(elapsed<duration){frame=requestAnimationFrame(tick);return;}
    frame=0;completeLevel(state);save();render();$('walker').classList.add('arrived');chime();say('わたれたね！ すてきな はしを ありがとう。');
    if(!reduced())$('sparkles').innerHTML=Array.from({length:14},(_,i)=>`<text class="spark" x="${level().end.x-70+(i*37%140)}" y="${level().end.y-40-(i*29%110)}" fill="${['#e2b76a','#df96b2','#fff4c9'][i%3]}" font-size="${12+i%3*5}" style="animation-delay:${i*.03}s">✦</text>`).join('');
    if(state.completed.length===6){reward();$('completeTitle').focus({preventScroll:false});}
  }
  frame=requestAnimationFrame(tick);
};
$('next').onclick=()=>{if(state.level>=5)return;state.level++;state.path=[];save();render();say(level().note);$('levelTitle').scrollIntoView({block:'start',behavior:reduced()?'instant':'smooth'});};
CHARACTERS.forEach(c=>{const b=document.createElement('button');b.className='character';b.dataset.id=c.id;b.style.setProperty('--character',c.color);b.setAttribute('aria-label',c.name+(c.id==='cat'?'（ねこ）':'')+'と おさんぽ');b.setAttribute('aria-pressed',false);b.innerHTML=`<span class="portrait"><img src="${c.image}" alt="" width="75" height="75"></span><b>${c.name}</b>`;b.onclick=()=>{if(phase==='walking'||pointer!==null)return;state.character=c.id;save();render();};$('characters').append(b);});
$('sound').onclick=()=>{state.sound=!state.sound;if(!state.sound){if('speechSynthesis' in window)speechSynthesis.cancel();audio?.suspend();}save();$('sound').textContent=state.sound?'♪ おと ON':'♪ おと OFF';$('sound').setAttribute('aria-pressed',state.sound);if(state.sound)say(level().note);};
async function reward(){
  if(awarding||state.completed.length!==6)return;awarding=true;$('again').disabled=true;$('retryReward').disabled=true;const round=state.roundId;
  try{if(!storageOK)throw Error('storage');const grant=()=>MarketGifts.grant('rainbow-bridge:'+round,1);const ticket=navigator.locks?await navigator.locks.request('ponyland-market-gift',grant):grant();if(round!==state.roundId)return;state.rewardTicket=ticket.id;save();$('retryReward').hidden=true;$('gift').hidden=false;$('gift').href='../gifts.html?ticket='+encodeURIComponent(ticket.id);$('rewardStatus').textContent='無料のガチャ券を 1まい ほぞんしたよ！';}
  catch{$('rewardStatus').textContent='クリア、おめでとう！ 特典を保存できませんでした。ブラウザの保存設定を確認して、もう一度保存してください。';$('retryReward').hidden=false;$('gift').hidden=true;}
  finally{awarding=false;$('again').disabled=false;$('retryReward').disabled=false;}
}
$('retryReward').onclick=()=>{save();reward();};
$('again').onclick=()=>{cancelAnimationFrame(frame);const c=state.character,sound=state.sound;state=newSession(uid());state.character=c;state.sound=sound;$('gift').hidden=true;$('retryReward').hidden=true;$('rewardStatus').textContent='';save();render();$('levelTitle').scrollIntoView({block:'start'});};
const small=matchMedia('(max-width:600px)');function resize(){board.setAttribute('viewBox',small.matches?'100 0 800 560':'0 0 1000 560');}small.addEventListener('change',resize);resize();
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(pointer!==null)finishDrawing({pointerId:pointer},true);if('speechSynthesis' in window)speechSynthesis.cancel();audio?.suspend();}});
window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);if('speechSynthesis' in window)speechSynthesis.cancel();});
window.addEventListener('pageshow',event=>{if(event.persisted){frame=0;render();if(state.completed.length===6&&!state.rewardTicket)reward();}});
render();save();if(state.completed.length===6&&!state.rewardTicket)reward();
