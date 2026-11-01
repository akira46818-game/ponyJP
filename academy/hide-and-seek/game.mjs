import {SAVE_KEY,CHARACTERS,SCENES,newSession,restoreSession,sceneComplete,allComplete,findAt,hintSpot,nextScene} from './model.mjs?v=1';
import {prop,background} from './art.mjs?v=1';
const $=id=>document.getElementById(id);
const uid=()=>crypto.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
let state=newSession(uid()),storageOK=true,awarding=false,hinted=-1,bannerTimer=0,audio;
let searched=new Set();
try{state=restoreSession(JSON.parse(localStorage.getItem(SAVE_KEY)||'null'),state.roundId);}catch{storageOK=false;}
const scene=()=>SCENES[state.scene],friend=id=>CHARACTERS.find(c=>c.id===id);
const scrollBehavior=()=>matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth';
function save(){
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));storageOK=true;$('saveStatus').textContent='';}
  catch{storageOK=false;$('saveStatus').textContent='進み具合を保存できません。この画面では遊べますが、閉じると続きが残らないことがあります。';}
}
function say(text){
  if(!state.sound||!('speechSynthesis' in window))return;
  speechSynthesis.cancel();const speech=new SpeechSynthesisUtterance(text);speech.lang='ja-JP';speech.rate=.85;speech.pitch=1.12;speech.volume=.65;speechSynthesis.speak(speech);
}
function chime(){
  if(!state.sound)return;
  try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;audio||=new A();audio.resume();[659,784,1047].forEach((frequency,i)=>{const osc=audio.createOscillator(),gain=audio.createGain(),at=audio.currentTime+i*.1;osc.type='sine';osc.frequency.value=frequency;gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.035,at+.02);gain.gain.exponentialRampToValueAtTime(.001,at+.23);osc.connect(gain);gain.connect(audio.destination);osc.start(at);osc.stop(at+.25);});}catch{}
}
function message(text,speak=false){$('message').textContent=text;if(speak)say(text);}
function hideBanner(){clearTimeout(bannerTimer);$('foundBanner').hidden=true;}
function renderSpots(){
  const current=scene();
  $('spots').innerHTML=current.spots.map((object,i)=>{
    const id=state.layouts[state.scene][i],c=id?friend(id):null,found=id&&state.found[state.scene].includes(id),empty=searched.has(i);
    return `<button class="spot${found?' found':''}${i===hinted?' hinted':''}${empty?' searched':''}" data-slot="${i}" aria-label="${found?c.name+'、みつけた！':object.label+'を しらべる'}">${c?`<img class="peek" src="${c.image}" alt="" draggable="false" width="160" height="160">`:''}<span class="cover">${prop(object)}</span>${found?`<span class="name-tag">${c.name} ✓</span>`:''}${empty?'<span class="empty-tag" aria-hidden="true">🦋</span>':''}</button>`;
  }).join('');
}
function render(){
  const current=scene(),done=sceneComplete(state);
  hideBanner();$('chapter').textContent=`ばしょ ${state.scene+1} / 3`;$('sceneTitle').textContent=current.name;
  $('sceneTabs').innerHTML=SCENES.map((s,i)=>`<button class="scene-tab" data-scene="${i}" ${i===state.scene?'aria-current="step"':''} aria-label="${s.name}で あそぶ${sceneComplete(state,i)?'（みつけた）':''}"><span aria-hidden="true">${sceneComplete(state,i)?'✓':s.icon}</span>${s.tab||s.name}</button>`).join('');
  $('landscape').innerHTML=background(current.id);$('scene').dataset.theme=current.id;$('scene').dataset.mode=state.mode;$('sceneCaption').textContent=current.caption;
  renderSpots();
  $('roster').innerHTML=CHARACTERS.map(c=>{const found=state.found[state.scene].includes(c.id);return `<div class="friend${found?' found':''}" aria-label="${c.name}：${found?'みつけた':'まだ かくれている'}"><img src="${c.image}" alt="" width="49" height="49"><span>${c.name}</span><i aria-hidden="true">${found?'✿':'·'}</i></div>`;}).join('');
  $('count').textContent=state.found[state.scene].length;
  $('hint').disabled=done;$('next').hidden=!done||nextScene(state)===null;$('gentleNote').hidden=done;
  $('stamps').innerHTML=SCENES.map((s,i)=>`<div class="stamp${sceneComplete(state,i)?' earned':''}" aria-label="${s.name}：${sceneComplete(state,i)?'スタンプを もらった':'まだ これから'}"><b aria-hidden="true">${sceneComplete(state,i)?'✿':s.icon}</b><span>${s.name}</span></div>`).join('');
  for(const mode of ['easy','challenge'])$(mode).setAttribute('aria-pressed',state.mode===mode);
  $('modeNote').textContent=state.mode==='easy'?'おかおが ちらり。よく みてみよう。':'すこし ふかく かくれるよ。ヒントも つかってね。';
  $('sound').textContent=state.sound?'♪ おと ON':'♪ おと OFF';$('sound').setAttribute('aria-pressed',state.sound);
  message(done?'みんな みつけたね！ おはなの スタンプを どうぞ。':'きになる ところを タップしてね。');
  $('complete').hidden=!allComplete(state);
  $('gift').hidden=!state.rewardTicket;
  if(state.rewardTicket){$('gift').href='../gifts.html?ticket='+encodeURIComponent(state.rewardTicket);$('rewardStatus').textContent='無料のガチャ券を 1まい ほぞんしたよ！';}
}
function inspect(index){
  const result=findAt(state,index);if(result.kind==='invalid')return;
  if(result.kind==='already'){message(friend(result.id).name+'は、もう みつけたね！',true);return;}
  if(result.kind==='empty'){
    searched.add(index);renderSpots();message('ちょうちょが いたね。ほかの ところも みてみよう。',true);
  }else{
    if(hinted===index)hinted=-1;
    save();render();
    const name=friend(result.id).name;
    message(result.allComplete?'みんな みーつけた！ プレゼントを うけとろう。':result.sceneComplete?name+'、みーつけた！ 6にん ぜんいん みつけたね。':name+'、みーつけた！ あと '+(6-state.found[state.scene].length)+'にん だよ。',true);
    $(`spots`).querySelector(`[data-slot="${index}"]`).classList.add('just-found');
    $('foundBanner').textContent=name+'、みーつけた！';$('foundBanner').hidden=false;
    bannerTimer=setTimeout(()=>{$('foundBanner').hidden=true;},1800);chime();
    if(result.allComplete)reward();
  }
  // Keep keyboard focus on the inspected place after updating the picture.
  if(result.allComplete)$('completeTitle').focus();
  else $('spots').querySelector(`[data-slot="${index}"]`).focus({preventScroll:true});
}
$('spots').onclick=event=>{const target=event.target.closest('[data-slot]');if(target)inspect(Number(target.dataset.slot));};
function chooseScene(index){if(!Number.isInteger(index)||index<0||index>=3)return;state.scene=index;hinted=-1;searched=new Set();save();render();say(scene().caption);}
$('sceneTabs').onclick=event=>{const target=event.target.closest('[data-scene]');if(target)chooseScene(Number(target.dataset.scene));};
$('next').onclick=()=>{const next=nextScene(state);if(next!==null){chooseScene(next);$('sceneTitle').scrollIntoView({block:'start',behavior:scrollBehavior()});}};
$('hint').onclick=()=>{
  hinted=hintSpot(state);if(hinted<0)return;renderSpots();
  message(scene().spots[hinted].label+'の ところに、だれか いるよ！',true);
  $('spots').querySelector(`[data-slot="${hinted}"]`).scrollIntoView({block:'nearest',behavior:scrollBehavior()});
};
for(const mode of ['easy','challenge'])$(mode).onclick=()=>{state.mode=mode;save();render();};
$('sound').onclick=()=>{state.sound=!state.sound;save();$('sound').textContent=state.sound?'♪ おと ON':'♪ おと OFF';$('sound').setAttribute('aria-pressed',state.sound);if(state.sound)say('なかまたちと、かくれんぼしよう。');else{if('speechSynthesis' in window)speechSynthesis.cancel();audio?.suspend();}};
async function reward(){
  if(awarding||!allComplete(state)||state.rewardTicket)return;
  awarding=true;$('again').disabled=true;$('retryReward').disabled=true;const round=state.roundId;
  try{
    if(!storageOK)throw Error('storage');
    const grant=()=>MarketGifts.grant('hide-and-seek:'+round,1);
    const ticket=navigator.locks?await navigator.locks.request('ponyland-market-gift',grant):grant();
    if(round!==state.roundId)return;
    state.rewardTicket=ticket.id;save();$('gift').href='../gifts.html?ticket='+encodeURIComponent(ticket.id);$('gift').hidden=false;$('retryReward').hidden=true;$('rewardStatus').textContent='無料のガチャ券を 1まい ほぞんしたよ！';
  }catch{$('rewardStatus').textContent='クリア、おめでとう！ 特典を保存できませんでした。ブラウザの保存設定を確認して、もう一度保存してください。';$('retryReward').hidden=false;}
  finally{awarding=false;$('again').disabled=false;$('retryReward').disabled=false;}
}
$('retryReward').onclick=()=>{save();reward();};
$('again').onclick=()=>{
  if(awarding||!allComplete(state))return;
  const mode=state.mode,sound=state.sound;state=newSession(uid());state.mode=mode;state.sound=sound;hinted=-1;searched=new Set();$('retryReward').hidden=true;$('rewardStatus').textContent='';save();render();$('sceneTitle').scrollIntoView({block:'start',behavior:scrollBehavior()});say('もういっかい、かくれんぼ！');
};
function quiet(){hideBanner();if('speechSynthesis' in window)speechSynthesis.cancel();audio?.suspend();}
document.addEventListener('visibilitychange',()=>{if(document.hidden)quiet();});window.addEventListener('pagehide',quiet);
render();save();if(allComplete(state)&&!state.rewardTicket)reward();
