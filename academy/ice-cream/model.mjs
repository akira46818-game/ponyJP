export const SAVE_KEY = 'ponyland-ice-cream-v1';
export const FLAVORS = [
  { id:'strawberry', name:'いちご', icon:'🍓', color:'#f99bb8', dark:'#df6e99' },
  { id:'vanilla', name:'バニラ', icon:'🌼', color:'#fff1b9', dark:'#e5c77d' },
  { id:'soda', name:'ソーダ', icon:'💧', color:'#91dafa', dark:'#57aedc' },
  { id:'chocolate', name:'チョコ', icon:'🍫', color:'#c28b70', dark:'#926248' },
  { id:'melon', name:'メロン', icon:'🍈', color:'#b5e1a1', dark:'#82b975' },
  { id:'grape', name:'ぶどう', icon:'🍇', color:'#cbb2ed', dark:'#a083cc' }
];
export const TOPPINGS = [
  { id:'star', name:'おほしさま', icon:'⭐' },
  { id:'berry', name:'いちご', icon:'🍓' },
  { id:'rainbow', name:'にじいろ', icon:'🌈' }
];
export const CUSTOMERS = [
  { id:'lumina', name:'ルミナ', image:'assets/lumina.png', type:'front', color:'#e47cab',
    order:['strawberry','vanilla'], topping:'star', greeting:'きらきらの アイス、たべたいな！', thanks:'おほしさまみたい！ ありがとう！' },
  { id:'flare', name:'フレア', image:'assets/flare.png', type:'front', color:'#e98d64',
    order:['vanilla','strawberry'], topping:'berry', greeting:'あまい アイスを おねがい！', thanks:'わあ、おいしそう！ げんき いっぱい！' },
  { id:'aqua', name:'アクア', image:'assets/aqua.png', type:'front', color:'#5eafd5',
    order:['soda','vanilla'], topping:'rainbow', greeting:'すずしい うみいろの アイスが いいな！', thanks:'ひんやり、しあわせ！ ありがとう！' },
  { id:'cat', name:'ミュウミュウ', image:'../mewmew-happy-v8-front.png', type:'cat', color:'#c48a60',
    order:['chocolate','strawberry'], topping:'berry', greeting:'ねこの ミュウミュウだよ。おねがいにゃ！', thanks:'おいしそうにゃ！ ありがとう！' },
  { id:'terra', name:'テラ', image:'assets/terra.png', type:'side', color:'#77ad78',
    order:['melon','vanilla'], topping:'star', greeting:'もりいろの アイスを つくってね！', thanks:'やさしい もりの いろだね！' },
  { id:'storm', name:'ストーム', image:'assets/storm.png', type:'side', color:'#858ad4',
    order:['grape','soda'], topping:'rainbow', greeting:'そらみたいな アイスを おねがい！', thanks:'にじみたい！ とっても すてき！' }
];
export function createSession(id) {
  return { version:1, roundId:id, mode:'order', customer:'lumina', completed:[],
    scoops:[], topping:null, served:false, rewardTicket:null, sound:false };
}
export function restoreSession(raw, fallbackId) {
  const fresh=createSession(fallbackId);
  if (!raw || raw.version!==1 || typeof raw.roundId!=='string' || !raw.roundId || raw.roundId.length>100) return fresh;
  const completed=[...new Set(Array.isArray(raw.completed)?raw.completed:[])].filter(id=>CUSTOMERS.some(c=>c.id===id));
  const mode=raw.mode==='free'?'free':'order';
  const customer=CUSTOMERS.find(c=>c.id===raw.customer)?.id || 'lumina';
  const scoops=(Array.isArray(raw.scoops)?raw.scoops:[]).filter(id=>FLAVORS.some(f=>f.id===id)).slice(0,mode==='order'?2:4);
  return {...fresh,roundId:raw.roundId,mode,customer,completed,scoops,
    topping:TOPPINGS.some(t=>t.id===raw.topping)?raw.topping:null,
    served:Boolean(raw.served && scoops.length && (mode==='free'||completed.includes(customer))),
    rewardTicket:typeof raw.rewardTicket==='string'?raw.rewardTicket:null,sound:raw.sound===true};
}
export function currentCustomer(state) { return CUSTOMERS.find(c=>c.id===state.customer)||CUSTOMERS[0]; }
export function nextCustomer(state) { return CUSTOMERS.find(c=>!state.completed.includes(c.id)) || CUSTOMERS[0]; }
export function checkOrder(state) {
  if (!state.scoops.length) return {ok:false, reason:'empty'};
  if (state.mode==='free') return {ok:true};
  const order=currentCustomer(state);
  for(let i=0;i<order.order.length;i++) {
    if(state.scoops[i]!==order.order[i]) return {ok:false,reason:'scoop',index:i,flavor:order.order[i]};
  }
  if(state.topping!==order.topping) return {ok:false,reason:'topping',topping:order.topping};
  return {ok:true};
}
export function serve(state) {
  if(state.served) return {ok:false,reason:'already'};
  const result=checkOrder(state);
  if(!result.ok)return result;
  state.served=true;
  if(state.mode==='order'&&!state.completed.includes(state.customer))state.completed.push(state.customer);
  return {ok:true,complete:state.completed.length===CUSTOMERS.length && state.mode==='order'};
}
export function addScoop(state,id) {
  if(state.served || !FLAVORS.some(f=>f.id===id) || state.scoops.length>=(state.mode==='order'?2:4))return false;
  state.scoops.push(id); return true;
}
export function changeCustomer(state,id) {
  if(!CUSTOMERS.some(c=>c.id===id))return;
  state.customer=id;state.scoops=[];state.topping=null;
  state.served=state.mode==='order'&&state.completed.includes(id);
  if(state.served){const customer=currentCustomer(state);state.scoops=[...customer.order];state.topping=customer.topping;}
}
