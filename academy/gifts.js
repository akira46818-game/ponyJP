(()=>{'use strict';
  const $=id=>document.getElementById(id),store=MarketGifts,cards=MarketGiftStore.cards;
  let activeId=null,busy=false;
  const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  function setReceipt(id){activeId=id;const url=new URL(location.href);url.searchParams.set('ticket',id);history.replaceState(null,'',url);}
  function refresh(){
    const tickets=store.all(),pending=tickets.filter(t=>!t.card);
    $('ticketCount').textContent=`ガチャ券 ${pending.length}枚`;
    $('collection').replaceChildren();
    cards.forEach(card=>{const owned=tickets.filter(t=>t.card===card.id);if(!owned.length)return;const button=document.createElement('button'),img=new Image(),text=document.createElement('span');img.src='../'+card.file;img.alt=card.name+'のカード';img.loading='lazy';text.textContent=card.name+' ×'+owned.length;button.append(img,text);button.onclick=()=>{if(busy)return;setReceipt(owned[owned.length-1].id);showResult(store.claim(activeId),false);};$('collection').append(button);});
    $('collectionEmpty').hidden=tickets.some(t=>t.card);
    $('next').hidden=!pending.length;
    return {tickets,pending};
  }
  function prepare(){
    const {pending}=refresh();
    $('result').hidden=true;$('scene').hidden=false;$('scene').className='gacha-scene';$('turn').hidden=false;$('turn').disabled=!pending.length;
    if(pending.length){setReceipt(pending[0].id);$('status').textContent='クリア、おめでとう！ ミュウミュウがプレゼントを選ぶよ。';}
    else {$('status').textContent='ミニマートの一日の目標、またはアイス屋さんで6人へのお届けを達成すると、ガチャ券が1枚もらえるよ。';}
  }
  function showResult(award,celebrate){
    const card=award.art;
    $('result').hidden=false;$('result').className='result '+card.style+(celebrate&&!reduced()?' entering':'');
    $('rarity').textContent=card.label;$('resultTitle').textContent=card.name+'が来てくれたよ！';
    $('cardImage').src='../'+card.file;$('cardImage').alt=card.name+'のギャラクシーカード';$('download').href='../'+card.file;$('download').download=card.file;
    $('scene').hidden=true;$('turn').hidden=true;$('status').textContent='カードをこの端末のコレクションに保存しました。';refresh();
    if(celebrate)$('resultTitle').focus({preventScroll:true});
  }
  $('turn').onclick=async()=>{
    if(busy||!activeId)return;busy=true;$('turn').disabled=true;
    $('scene').className='gacha-scene rolling';$('status').textContent='くるくる… ミュウミュウが回しているよ。';
    try{
      // Persist the selection once. A reload or retry reveals the same card.
      const award=navigator.locks?await navigator.locks.request('ponyland-market-gift',()=>store.claim(activeId)):store.claim(activeId);
      await wait(reduced()?50:850);
      $('scene').classList.add('capsule-out');$('status').textContent='金色のカプセル！ どのなかまかな…';
      await wait(reduced()?50:1100);
      $('scene').classList.add('reveal');$('status').textContent='プレゼントが届いたよ！';
      await wait(reduced()?0:500);showResult(award,true);
    }catch(error){$('scene').className='gacha-scene';$('status').textContent='保存できませんでした。ブラウザの保存設定を確認して、もう一度お試しください。';$('turn').disabled=false;}
    finally{busy=false;}
  };
  $('next').onclick=()=>{if(!busy)prepare();};
  $('backup').onclick=()=>{try{const data={format:'ponyland-backup-v1',createdAt:new Date().toISOString(),market:JSON.parse(localStorage.getItem('ponylandMiniMartSaveV1')||'null'),iceCream:JSON.parse(localStorage.getItem('ponyland-ice-cream-v1')||'null'),gifts:store.all()},blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='ponyland-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);$('backupStatus').textContent='バックアップの保存を開始しました。';}catch{$('backupStatus').textContent='保存できませんでした。ブラウザの保存設定を確認してください。';}};
  for(let i=0;i<24;i++){const star=document.createElement('i'),angle=i*Math.PI*2/24;star.textContent='✦';star.style.setProperty('--dx',Math.cos(angle)*145+'px');star.style.setProperty('--dy',Math.sin(angle)*125+'px');$('stars').append(star);}
  try{
    const id=new URL(location.href).searchParams.get('ticket'),data=refresh(),ticket=data.tickets.find(t=>t.id===id);
    if(ticket?.card){setReceipt(ticket.id);showResult(store.claim(ticket.id),false);}
    else prepare();
  }catch{$('ticketCount').textContent='保存データを確認できませんでした';$('status').textContent='ミニマートは学園から遊べます。カードを保存するには、ブラウザの保存機能を有効にしてください。';}
})();
