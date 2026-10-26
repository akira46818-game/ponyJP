import { SAVE_KEY, FLAVORS, TOPPINGS, CUSTOMERS, createSession, restoreSession, currentCustomer, nextCustomer, checkOrder, serve, addScoop, changeCustomer } from './model.mjs';
const $=id=>document.getElementById(id);
const uid=()=>crypto.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
let state=createSession(uid()),storageOK=true,awarding=false,audio=null,confettiTimer;
try{state=restoreSession(JSON.parse(localStorage.getItem(SAVE_KEY)||'null'),state.roundId);}catch{storageOK=false;}
function save(){
  try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));storageOK=true;$('saveStatus').textContent='';}
  catch{storageOK=false;$('saveStatus').textContent='いまは進み具合を保存できません。この画面では遊べますが、閉じると続きが残らないことがあります。';}
}
function speak(text){
  if(!state.sound || !('speechSynthesis' in window))return;
  speechSynthesis.cancel();const speech=new SpeechSynthesisUtterance(text);
  speech.lang='ja-JP';speech.rate=.85;speech.pitch=1.1;speech.volume=.8;
  const voice=speechSynthesis.getVoices().find(v=>v.lang.startsWith('ja'));if(voice)speech.voice=voice;
  speechSynthesis.speak(speech);
}
function chime(success=false){
  if(!state.sound)return;
  try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;audio||=new Audio();audio.resume();
    (success?[523,659,784]:[660]).forEach((frequency,i)=>{const o=audio.createOscillator(),g=audio.createGain(),at=audio.currentTime+i*.1;
      o.type='sine';o.frequency.value=frequency;g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(.045,at+.02);g.gain.exponentialRampToValueAtTime(.001,at+.23);o.connect(g);g.connect(audio.destination);o.start(at);o.stop(at+.24);});
  }catch{/* Sound is optional; all instructions remain visible. */}
}
function orderSpeech(){
  const customer=currentCustomer(state);
  if(state.mode==='free')return customer.name+'に、すきなアイスをつくってね。';
  return customer.name+'のちゅうもん。したから、'+customer.order.map(id=>FLAVORS.find(f=>f.id===id).name).join('、')+'。かざりは、'+TOPPINGS.find(t=>t.id===customer.topping).name+'だよ。';
}
function starPoints(cx,cy,r){return Array.from({length:10},(_,i)=>{const a=i*Math.PI/5-Math.PI/2,k=i%2?r*.45:r;return (cx+Math.cos(a)*k).toFixed(1)+','+(cy+Math.sin(a)*k).toFixed(1);}).join(' ');}
function iceSvg(animate=false){
  let defs='<linearGradient id="coneShade" x1="0" x2="1"><stop stop-color="#d69f59"/><stop offset=".4" stop-color="#f8dca0"/><stop offset="1" stop-color="#c89151"/></linearGradient><pattern id="waffle" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><path d="M0 0H20V20" fill="none" stroke="#9e693d" stroke-opacity=".28" stroke-width="2"/><path d="M2 2H20" stroke="#fff1ca" stroke-opacity=".6" stroke-width="2"/></pattern>';
  let layers='';
  state.scoops.forEach((id,i)=>{
    const f=FLAVORS.find(f=>f.id===id),y=228-i*36,left=79+i*9,right=221-i*9;
    defs+='<linearGradient id="scoop'+i+'" x1="0" y1="0" x2=".65" y2="1"><stop stop-color="#fffdf3"/><stop offset=".28" stop-color="'+f.color+'"/><stop offset=".72" stop-color="'+f.color+'"/><stop offset="1" stop-color="'+f.dark+'"/></linearGradient>';
    layers+='<g class="'+(animate&&i===state.scoops.length-1?'new-scoop':'')+'"><path d="M '+left+' '+y+' C '+(left-15)+' '+(y-13)+' '+(left+3)+' '+(y-33)+' 125 '+(y-40)+' C 151 '+(y-48)+' '+(right-18)+' '+(y-41)+' '+(right-7)+' '+(y-35)+' C '+(right+17)+' '+(y-26)+' '+(right+17)+' '+(y-5)+' '+right+' '+y+' Q 150 '+(y+19)+' '+left+' '+y+' Z" fill="url(#scoop'+i+')" stroke="'+f.dark+'" stroke-width="1.2"/><path d="M '+(left+9)+' '+(y-17)+' Q 128 '+(y-36)+' '+(right-10)+' '+(y-23)+'" fill="none" stroke="#fff" stroke-opacity=".55" stroke-linecap="round" stroke-width="5"/><path d="M '+(left+1)+' '+(y+1)+' Q 151 '+(y+11)+' '+(right-2)+' '+(y-2)+'" fill="none" stroke="'+f.dark+'" stroke-opacity=".4" stroke-width="3"/></g>';
  });
  const top=state.scoops.length?190-(state.scoops.length-1)*36:190;
  if(state.scoops.length){const i=state.scoops.length-1;layers+='<path d="M 127 '+(top+5)+' Q 161 '+(top-6)+' 157 '+(top-24)+' Q 188 '+(top+6)+' 169 '+(top+12)+' Z" fill="url(#scoop'+i+')" />';}
  if(state.topping&&state.scoops.length){
    if(state.topping==='star')layers+='<polygon points="'+starPoints(163,top-14,23)+'" fill="#ffda65" stroke="#d7a03d" stroke-width="2"/><path d="M155 '+(top-18)+' L162 '+(top-28)+'" stroke="#fff5bb" stroke-width="4" stroke-linecap="round"/>';
    if(state.topping==='berry')layers+='<g transform="translate(162 '+(top-9)+') rotate(14)"><path d="M-20 0C-21-24 22-24 21 0Q16 18 0 25Q-16 17-20 0" fill="#ed7590" stroke="#c64d69" stroke-width="2"/><path d="M0-15L-17-23L-10-9L3-14L16-10L22-25L7-19L3-29Z" fill="#70a977"/><g fill="#ffe6ab"><ellipse cx="-10" cy="0" rx="1.5" ry="2.5"/><ellipse cx="7" cy="-2" rx="1.5" ry="2.5"/><ellipse cx="0" cy="13" rx="1.5" ry="2.5"/></g></g>';
    if(state.topping==='rainbow'){
      ['#ef91ac','#f1bc74','#eee0a3','#a6c99b','#8ac8de'].forEach((c,i)=>{const r=28-i*5;layers+='<path d="M '+(157-r)+' '+top+' A '+r+' '+r+' 0 0 1 '+(157+r)+' '+top+'" stroke="'+c+'" stroke-width="6" fill="none"/>';});
      layers+='<g fill="#fffdf5"><ellipse cx="128" cy="'+top+'" rx="12" ry="7"/><ellipse cx="187" cy="'+top+'" rx="12" ry="7"/></g>';
    }
  }
  const empty=!state.scoops.length?'<path d="M99 211Q92 184 113 167Q107 140 143 135Q139 108 158 102Q179 132 177 140Q207 156 201 180Q222 200 202 213Z" fill="#fffef7" fill-opacity=".6" stroke="#d6c3a7" stroke-dasharray="5 6" stroke-width="2"/><text x="150" y="182" text-anchor="middle" font-size="30" fill="#c6b19a">＋</text>':'';
  return '<svg viewBox="0 0 300 340" aria-hidden="true"><defs>'+defs+'</defs><ellipse cx="150" cy="325" rx="64" ry="9" fill="#b99b69" opacity=".13"/><path d="M94 229L150 324L206 229Z" fill="url(#coneShade)" stroke="#b5844f" stroke-width="2"/><path d="M94 229L150 324L206 229Z" fill="url(#waffle)"/><ellipse cx="150" cy="229" rx="56" ry="9" fill="#edc386" stroke="#c6955c" stroke-width="2"/>'+empty+layers+'</svg>';
}
function recipe(){
  const customer=currentCustomer(state);
  $('recipe').replaceChildren();
  customer.order.forEach((id,i)=>{
    const flavor=FLAVORS.find(f=>f.id===id),item=document.createElement('div');
    item.className='recipe-item'+(state.scoops[i]===id?' done':state.scoops.length===i?' next':'');
    item.innerHTML='<small>'+(i+1)+'</small><span class="recipe-dot" style="background:'+flavor.color+'"></span><span>'+flavor.name+'</span>';
    $('recipe').append(item);
  });
  const t=TOPPINGS.find(t=>t.id===customer.topping),item=document.createElement('div');
  item.className='recipe-item'+(state.topping===t.id?' done':'');
  item.innerHTML='<span>'+t.icon+'</span><span>'+t.name+'</span>';$('recipe').append(item);
}
function guidance(){
  if(state.served)return currentCustomer(state).thanks;
  if(state.mode==='free')return state.scoops.length?'すてき！ かざりを のせたら「どうぞ」しよう':'すきな いろを えらんでね。4だんまで つくれるよ！';
  const order=currentCustomer(state),i=state.scoops.length;
  if(i<2)return (i?'② ':'① ')+FLAVORS.find(f=>f.id===order.order[i]).name+'を おしてね';
  if(state.topping!==order.topping)return 'つぎは '+TOPPINGS.find(t=>t.id===order.topping).name+'で かざろう！';
  return 'できたかな？「できた！ どうぞ」で おとどけしよう';
}
function render(animate=false){
  const customer=currentCustomer(state),max=state.mode==='order'?2:4;
  $('customerImage').src=customer.image;$('customerImage').alt=customer.name+(state.served?'がうれしそうにしている':'がお店に来ている');$('customerImage').className=customer.type;
  $('customerName').textContent=customer.name;$('greeting').textContent=state.served?customer.thanks:state.mode==='free'?'きみの すきな アイスを つくってね！':customer.greeting;
  document.querySelector('.shop').classList.toggle('served',state.served);
  $('ice').innerHTML=iceSvg(animate);
  $('ice').setAttribute('aria-label',state.scoops.length?'したから '+state.scoops.map(id=>FLAVORS.find(f=>f.id===id).name).join('、')+(state.topping?'。かざりは '+TOPPINGS.find(t=>t.id===state.topping).name:''):'アイスがまだのっていないコーン');
  $('conePrompt').hidden=state.scoops.length>0;$('orderTicket').hidden=state.mode!=='order';$('freeNote').hidden=state.mode!=='free';recipe();
  $('count').textContent=state.completed.length+' / 6';$('orderMode').setAttribute('aria-pressed',state.mode==='order');$('freeMode').setAttribute('aria-pressed',state.mode==='free');
  $('sound').textContent=state.sound?'♪ おと ON':'♪ おと OFF';$('sound').setAttribute('aria-pressed',state.sound);$('sound').setAttribute('aria-label',state.sound?'音声案内と効果音をオフにする':'音声案内と効果音をオンにする');
  $('guidance').textContent=guidance();$('layerCount').textContent=state.scoops.length===max?'のせられたね！':'あと '+(max-state.scoops.length)+'だん';
  const next=state.mode==='order'&&!state.served?customer.order[state.scoops.length]:null;
  document.querySelectorAll('.flavor').forEach(b=>{b.disabled=state.served||state.scoops.length>=max;b.classList.toggle('hint',b.dataset.flavor===next);});
  document.querySelectorAll('.topping').forEach(b=>{b.disabled=state.served||!state.scoops.length;b.setAttribute('aria-pressed',state.topping===b.dataset.topping);});
  $('undo').disabled=state.served||!state.scoops.length;$('serve').disabled=state.served||!state.scoops.length;
  document.querySelector('.actions').hidden=state.served;$('servedPanel').hidden=!state.served;
  $('thanks').textContent='♥ '+customer.thanks;$('next').textContent=state.mode==='free'?'もうひとつ つくる →':'つぎの おきゃくさん →';
  $('next').hidden=state.mode==='order'&&state.completed.length===6;
  $('complete').hidden=state.mode!=='order'||state.completed.length<6;
  document.querySelectorAll('.friend').forEach(b=>{b.setAttribute('aria-pressed',b.dataset.customer===state.customer);b.querySelector('.check').hidden=!state.completed.includes(b.dataset.customer);});
  if(state.completed.length===6&&state.rewardTicket){$('giftLink').hidden=false;$('giftLink').href='../gifts.html?ticket='+encodeURIComponent(state.rewardTicket);$('rewardStatus').textContent='無料のガチャ券を 1まい ほぞんしたよ！';}
}
function confetti(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  clearTimeout(confettiTimer);$('confetti').replaceChildren();
  for(let i=0;i<22;i++){const bit=document.createElement('i');bit.textContent=i%3?'✦':'♥';bit.style.setProperty('--x',(25+Math.random()*50)+'%');bit.style.setProperty('--dx',(Math.random()-.5)*450+'px');bit.style.setProperty('--c',['#da8ca4','#c9ac68','#77baa7','#b2a0d9'][i%4]);$('confetti').append(bit);}
  confettiTimer=setTimeout(()=>$('confetti').replaceChildren(),1900);
}
async function reward(){
  if(awarding||state.completed.length!==6)return;
  awarding=true;$('newRound').disabled=true;$('retryReward').disabled=true;
  const round=state.roundId;
  try{
    if(!storageOK)throw Error('storage');
    const grant=()=>MarketGifts.grant('icecream:'+round,1);
    const ticket=navigator.locks?await navigator.locks.request('ponyland-market-gift',grant):grant();
    if(round!==state.roundId)return;
    state.rewardTicket=ticket.id;save();$('retryReward').hidden=true;render();
  }catch{
    $('rewardStatus').textContent='クリア、おめでとう！ 特典を保存できませんでした。ブラウザの保存設定を確認して、もう一度保存してください。';$('retryReward').hidden=false;$('giftLink').hidden=true;
  }finally{awarding=false;$('newRound').disabled=false;$('retryReward').disabled=false;}
}
FLAVORS.forEach(f=>{
  const b=document.createElement('button');b.className='flavor';b.dataset.flavor=f.id;b.style.setProperty('--tint',f.color+'55');b.setAttribute('aria-label',f.name+'を のせる');
  b.innerHTML='<span aria-hidden="true">'+f.icon+'</span>'+f.name;
  b.onclick=()=>{if(addScoop(state,f.id)){chime();save();render(true);}};$('flavors').append(b);
});
TOPPINGS.forEach(t=>{
  const b=document.createElement('button');b.className='topping';b.dataset.topping=t.id;b.setAttribute('aria-pressed','false');b.setAttribute('aria-label',t.name+'で かざる');
  b.innerHTML='<span aria-hidden="true">'+t.icon+'</span>'+t.name;
  b.onclick=()=>{if(!state.served&&state.scoops.length){state.topping=state.topping===t.id?null:t.id;chime();save();render();}};$('toppings').append(b);
});
CUSTOMERS.forEach(c=>{
  const b=document.createElement('button');b.className='friend '+c.type;b.dataset.customer=c.id;b.setAttribute('aria-pressed','false');b.setAttribute('aria-label',c.name+(c.id==='cat'?'（ねこ）':'')+'を おむかえ');
  b.innerHTML='<span class="friend-portrait"><img src="'+c.image+'" alt="" width="84" height="84"></span><span class="friend-name">'+c.name+'</span><span class="check" aria-label="おとどけずみ" hidden>✓</span>';
  b.onclick=()=>{if(state.customer===c.id)return;changeCustomer(state,c.id);save();render();speak(orderSpeech());};$('friends').append(b);
});
$('undo').onclick=()=>{if(state.served)return;if(state.topping)state.topping=null;else state.scoops.pop();save();render();};
$('serve').onclick=async()=>{
  const result=serve(state);
  if(!result.ok){
    if(result.reason==='already')return;
    const message=result.reason==='topping'?'かざりは '+TOPPINGS.find(t=>t.id===result.topping).name+'だよ。えらびなおして みよう！':result.reason==='scoop'?'したから '+(result.index+1)+'だんめは '+FLAVORS.find(f=>f.id===result.flavor).name+'だよ。「ひとつ もどす」で なおせるよ。':'まず アイスを のせてね。';
    $('guidance').textContent=message;speak(message);return;
  }
  save();render();confetti();chime(true);speak(currentCustomer(state).thanks);
  $('thanks').focus({preventScroll:true});
  if(result.complete){await reward();$('completeTitle').focus({preventScroll:false});}
};
$('next').onclick=()=>{
  if(state.mode==='free'){state.scoops=[];state.topping=null;state.served=false;}
  else changeCustomer(state,nextCustomer(state).id);
  save();render();speak(orderSpeech());document.querySelector('.shop').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
};
function setMode(mode){
  if(state.mode===mode)return;
  state.mode=mode;state.scoops=[];state.topping=null;state.served=false;
  if(mode==='order'&&state.completed.includes(state.customer))changeCustomer(state,nextCustomer(state).id);
  save();render();speak(orderSpeech());
}
$('orderMode').onclick=()=>setMode('order');$('freeMode').onclick=()=>setMode('free');
$('sound').onclick=()=>{state.sound=!state.sound;if(!state.sound&&'speechSynthesis' in window)speechSynthesis.cancel();save();render();if(state.sound){chime();speak(orderSpeech());}};
$('readOrder').onclick=()=>{state.sound=true;save();render();if('speechSynthesis' in window)speak(state.served?currentCustomer(state).thanks:orderSpeech());else $('guidance').textContent='このブラウザでは よみあげが つかえません。おてほんを みて つくってね。';};
$('newRound').onclick=()=>{const sound=state.sound;state=createSession(uid());state.sound=sound;$('giftLink').hidden=true;$('rewardStatus').textContent='';$('retryReward').hidden=true;save();render();document.querySelector('.shop').scrollIntoView({block:'start'});};
$('retryReward').onclick=()=>{save();reward();};
document.addEventListener('visibilitychange',()=>{if(document.hidden){if('speechSynthesis' in window)speechSynthesis.cancel();audio?.suspend();}});
window.addEventListener('pagehide',()=>{if('speechSynthesis' in window)speechSynthesis.cancel();});
save();render();
if(state.completed.length===6&&!state.rewardTicket)reward();
