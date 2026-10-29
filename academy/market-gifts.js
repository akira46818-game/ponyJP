(function(root){
  'use strict';
  const KEY='ponyland-market-gifts-v1';
  const cards=Object.freeze([
    {id:'lumina',name:'ルミナ',file:'lumina.png',label:'SR ✨',style:'sr',weight:8},
    {id:'nox',name:'ノクス',file:'nox.png',label:'SSR 👑',style:'ssr',weight:14},
    {id:'flare',name:'フレア',file:'flare.png',label:'SSR 🔥',style:'ssr',weight:18},
    {id:'storm',name:'ストーム',file:'storm.png',label:'SSR ⚡',style:'ssr',weight:18},
    {id:'aqua',name:'アクア',file:'aqua.png',label:'SSR 💧',style:'ssr',weight:18},
    {id:'terra',name:'テラ',file:'terra.png',label:'SSR 🌿',style:'ssr',weight:16},
    {id:'nyago',name:'ニャーゴ',file:'nyago.png',label:'LEGEND 🐾',style:'legend',weight:4},
    {id:'tespero',name:'テスペロ',file:'tespero.png',label:'BOSS ☄',style:'boss',weight:4}
  ]);
  function createStore(storage,random=Math.random,changed=()=>{}){
    function read(){
      const raw=storage.getItem(KEY);
      if(!raw)return [];
      const value=JSON.parse(raw);
      if(!Array.isArray(value))throw Error('ガチャ券の保存データを読み込めませんでした。');
      return value.filter(t=>t&&typeof t.id==='string'&&Number.isInteger(t.day)&&(!t.card||cards.some(c=>c.id===t.card)));
    }
    function write(value){storage.setItem(KEY,JSON.stringify(value));changed();}
    return {
      all:read,
      pending:()=>read().filter(t=>!t.card),
      grant(runId,day){
        if(typeof runId!=='string'||!runId||!Number.isInteger(day)||day<1)throw Error('クリア情報を確認できませんでした。');
        const tickets=read(),id=runId+':day:'+day,old=tickets.find(t=>t.id===id);
        if(old)return old;
        const ticket={id,day,createdAt:new Date().toISOString()};
        tickets.push(ticket);write(tickets);return ticket;
      },
      claim(id){
        const tickets=read(),ticket=tickets.find(t=>t.id===id);
        if(!ticket)throw Error('お店の目標を達成するとガチャ券がもらえるよ。');
        if(!ticket.card){
          let value=Math.max(0,Math.min(.999999999,random()))*100;
          const selected=cards.find(card=>(value-=card.weight)<0)||cards[0];
          ticket.card=selected.id;ticket.openedAt=new Date().toISOString();
          write(tickets);
        }
        return {...ticket,art:cards.find(c=>c.id===ticket.card)};
      }
    };
  }
  root.MarketGiftStore={createStore,cards,KEY};
  if(root.document){
    // Access storage lazily so storage restrictions never prevent the shop from opening.
    const storage={getItem:key=>root.localStorage.getItem(key),setItem:(key,value)=>root.localStorage.setItem(key,value)};
    root.MarketGifts=createStore(storage,Math.random,()=>root.dispatchEvent(new Event('market-gifts')));
  }
})(globalThis);
