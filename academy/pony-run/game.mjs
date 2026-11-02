import {SAVE_KEY,CHARACTERS,STAGES,LENGTH,newJourney,restoreJourney,newRun,move,jump,step,finishStage} from './model.mjs?v=1';
import {createPainter} from './art.mjs?v=1';
const $=id=>document.getElementById(id),uid=()=>crypto.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
let journey=newJourney(uid()),storageOK=true,playing=false,loaded=false,awarding=false,clock=0,previous=0,toastUntil=0,audio;
try{journey=restoreJourney(JSON.parse(localStorage.getItem(SAVE_KEY)||'null'),journey.id);}catch{storageOK=false;}
let run=newRun(Math.min(2,journey.scores.length),journey.mode);
if(journey.scores.length===3){run.distance=LENGTH;run.finished=true;}
const atlas=new Image(),painter=createPainter($('game'),atlas),reduced=matchMedia('(prefers-reduced-motion: reduce)');
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(journey));storageOK=true;$('saveStatus').textContent='';}catch{storageOK=false;$('saveStatus').textContent='進み具合を保存できません。この画面では遊べますが、閉じると記録が残らないことがあります。';}}
function renderSettings(){
  const locked=playing||(!run.finished&&run.distance>0);
  $('characters').innerHTML=CHARACTERS.map(c=>`<button data-character="${c.id}" aria-label="${c.name}で はしる" aria-pressed="${journey.character===c.id}" ${locked?'disabled':''}><img src="${c.image}" alt="" width="56" height="65"><span>${c.name}</span></button>`).join('');
  for(const mode of ['easy','challenge']){$(mode).setAttribute('aria-pressed',journey.mode===mode);$(mode).disabled=locked;}
  $('modeNote').textContent=journey.mode==='easy'?'はじめてでも だいじょうぶ。':'すこし はやく。ほしを たくさん あつめよう。';
  $('route').innerHTML=STAGES.map((s,i)=>`<li class="${i<journey.scores.length?'done':i===journey.scores.length?'current':''}"><b>${i<journey.scores.length?'✓':s.icon}</b><span>${s.short}${i<journey.scores.length?'　★'+journey.scores[i]:''}</span></li>`).join('');
  $('sound').textContent=journey.sound?'♪ おと ON':'♪ おと OFF';$('sound').setAttribute('aria-pressed',journey.sound);
}
function hud(){
  $('stageName').textContent=STAGES[run.stage].name;$('stageCount').textContent=`COURSE 0${run.stage+1} / 03`;
  $('sceneChip').textContent=['⌂ がくえんを かけぬけよう','✿ おはなも おうえんしているよ','✦ にじの ゴールへ すすもう'][run.stage];
  const total=journey.scores.reduce((a,b)=>a+b,0)+(run.finished?0:run.stars);$('starCount').textContent=total;
  const percent=Math.round(run.distance/LENGTH*100);$('progressFill').style.width=percent+'%';$('progress').setAttribute('aria-valuenow',percent);
  $('pause').disabled=!playing;for(const id of ['left','jump','right'])$(id).disabled=!playing;
}
function announce(text){$('message').textContent=text;$('toast').textContent=text;toastUntil=clock+1.5;}
function tone(kind){if(!journey.sound)return;try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;audio||=new A();audio.resume();const o=audio.createOscillator(),g=audio.createGain(),now=audio.currentTime;o.frequency.value=kind==='star'?880:kind==='finish'?1047:440;g.gain.setValueAtTime(.025,now);g.gain.exponentialRampToValueAtTime(.001,now+.16);o.connect(g);g.connect(audio.destination);o.start();o.stop(now+.18);}catch{}}
function overlay(title,text,button,badge='LITTLE ADVENTURE'){$('overlay').hidden=false;$('overlayTitle').textContent=title;$('overlayText').innerText=text;$('start').textContent=button;$('start').hidden=!button;$('start').disabled=!loaded;$('badge').textContent=badge;}
function start(){
  if(!loaded||playing||journey.scores.length===3)return;
  if(run.finished||run.distance===0)run=newRun(journey.scores.length,journey.mode);
  playing=true;previous=0;document.body.classList.add('running');$('overlay').hidden=true;renderSettings();hud();
  $('game').focus({preventScroll:true});$('viewport').scrollIntoView({block:'center',behavior:'instant'});announce('ほしを あつめて、ゴールへ！');
}
function pause(){if(!playing)return;playing=false;audio?.suspend();hud();overlay('ひとやすみ。','じゅんびが できたら\nつづきから はしろう。','つづきから はしる','TAKE A BREAK');$('start').focus({preventScroll:true});}
function completeStage(){
  playing=false;if(!finishStage(journey,run))return;save();renderSettings();hud();tone('finish');
  if(journey.scores.length===3){showComplete();reward();}
  else {overlay('ゴール！ よく がんばったね。',`★ ${run.stars}こ あつめたよ。\nつぎは「${STAGES[journey.scores.length].name}」！`,'つぎの コースへ →','COURSE CLEAR!');$('overlayTitle').focus({preventScroll:true});}
}
function showComplete(){
  const total=journey.scores.reduce((a,b)=>a+b,0);overlay('にじの ゴールに とうちゃく！',`3つの コースを はしりきったね。\nあつめた ほしは ${total}こ！`,'','WELL DONE!');
  $('again').hidden=false;$('gift').hidden=!journey.ticket;
  if(journey.ticket){$('gift').href='../gifts.html?ticket='+encodeURIComponent(journey.ticket);$('rewardStatus').textContent='無料のガチャ券を 1まい ほぞんしたよ！';}
  $('overlayTitle').focus({preventScroll:true});
}
async function reward(){
  if(awarding||journey.scores.length!==3||journey.ticket)return;
  awarding=true;$('again').disabled=true;$('retryReward').disabled=true;const id=journey.id;
  try{
    if(!storageOK)throw Error('storage');const grant=()=>MarketGifts.grant('pony-run:'+id,1);
    const ticket=navigator.locks?await navigator.locks.request('ponyland-market-gift',grant):grant();
    if(journey.id!==id)return;journey.ticket=ticket.id;save();$('gift').href='../gifts.html?ticket='+encodeURIComponent(ticket.id);$('gift').hidden=false;$('retryReward').hidden=true;$('rewardStatus').textContent='無料のガチャ券を 1まい ほぞんしたよ！';
  }catch{$('rewardStatus').textContent='クリア、おめでとう！ 特典を保存できませんでした。保存設定を確認して、もう一度お試しください。';$('retryReward').hidden=false;}
  finally{awarding=false;$('again').disabled=false;$('retryReward').disabled=false;}
}
function control(action){if(!playing)return;if(action==='jump'){if(jump(run))tone('jump');}else move(run,action==='left'?-1:1);}
for(const id of ['left','right','jump'])$(id).onclick=()=>control(id);
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'){pause();return;}
  if(!playing||event.altKey||event.ctrlKey||event.metaKey)return;
  const action={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'jump',' ':'jump'}[event.key];
  if(action){event.preventDefault();if(!event.repeat)control(action);}
});
let gesture=null;
$('game').addEventListener('pointerdown',event=>{if(!playing)return;gesture={id:event.pointerId,x:event.clientX,y:event.clientY};$('game').setPointerCapture(event.pointerId);});
$('game').addEventListener('pointerup',event=>{if(!gesture||gesture.id!==event.pointerId)return;const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y;gesture=null;if(Math.max(Math.abs(dx),Math.abs(dy))<20)return;if(Math.abs(dx)>Math.abs(dy))control(dx<0?'left':'right');else if(dy<0)control('jump');});
$('game').addEventListener('pointercancel',()=>{gesture=null;});
$('start').onclick=start;$('pause').onclick=pause;
$('characters').onclick=event=>{const b=event.target.closest('[data-character]');if(!b||b.disabled)return;journey.character=b.dataset.character;save();renderSettings();};
for(const mode of ['easy','challenge'])$(mode).onclick=()=>{if($(mode).disabled)return;journey.mode=mode;save();renderSettings();};
$('sound').onclick=()=>{journey.sound=!journey.sound;save();renderSettings();if(journey.sound)tone('star');else audio?.suspend();};
$('retryReward').onclick=()=>{save();reward();};
$('again').onclick=()=>{
  if(awarding||journey.scores.length!==3)return;const {character,mode,sound}=journey;journey=newJourney(uid());Object.assign(journey,{character,mode,sound});run=newRun(0,mode);save();document.body.classList.remove('running');$('gift').hidden=true;$('again').hidden=true;$('retryReward').hidden=true;$('rewardStatus').textContent='';renderSettings();hud();overlay('もういちど でかけよう！','なかまや はやさを えらんでね。','はしりだそう →');$('settings').scrollIntoView({block:'start',behavior:'instant'});
};
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});window.addEventListener('blur',pause);window.addEventListener('pagehide',()=>{pause();audio?.suspend();});
function frame(now){
  const dt=previous?Math.min((now-previous)/1000,.05):0;previous=now;if(!document.hidden)clock+=dt;
  if(playing){const events=step(run,dt);for(const event of events){if(event==='star')tone('star');else if(event==='bump')announce('だいじょうぶ！ そのまま すすもう。');else if(event==='jumped')announce('ナイス ジャンプ！');else if(event==='finish')completeStage();}hud();}
  if(clock>toastUntil)$('toast').textContent='';
  painter(run,CHARACTERS.findIndex(c=>c.id===journey.character),clock,{reduced:reduced.matches,active:playing});requestAnimationFrame(frame);
}
atlas.onload=()=>{loaded=true;$('start').disabled=false;$('start').textContent=journey.scores.length?'つづきの コースへ →':'はしりだそう →';};
atlas.onerror=()=>{$('start').textContent='画像を よみこめませんでした';$('overlayText').textContent='通信を確認して、このページを開き直してください。';};
atlas.src='assets/runners.png';renderSettings();hud();save();if(journey.scores.length===3){showComplete();reward();}else if(journey.scores.length)overlay('つづきから ぼうけん！',`${STAGES[journey.scores.length].name}から\nはしろう。`,'つづきの コースへ →');requestAnimationFrame(frame);
