import assert from 'node:assert/strict';
import {CHARACTERS,SCENES,newSession,restoreSession,findAt,hintSpot,sceneComplete,allComplete,nextScene} from '../academy/hide-and-seek/model.mjs';
import {prop,background} from '../academy/hide-and-seek/art.mjs';
const ids=CHARACTERS.map(c=>c.id).sort();
for(let seed=0;seed<50;seed++){
  let n=seed+1;const random=()=>((n=(n*1664525+1013904223)>>>0)/4294967296);
  const round=newSession('round',random);
  for(const layout of round.layouts){assert.equal(layout.length,9);assert.equal(layout.filter(id=>id===null).length,3);assert.deepEqual(layout.filter(Boolean).sort(),ids,'all six friends must be findable exactly once');}
}
assert.notDeepEqual(newSession('a',()=>.2).layouts,newSession('b',()=>.8).layouts,'different rounds can use different hiding places');
const state=newSession('test',()=>.3);
assert.equal(allComplete(state),false);
assert.equal(findAt(state,NaN).kind,'invalid');assert.equal(findAt(state,9).kind,'invalid');
assert.equal(findAt(state,state.layouts[0].indexOf(null)).kind,'empty');assert.equal(state.found[0].length,0,'empty places do not add progress');
const first=hintSpot(state),award=findAt(state,first);
assert.equal(award.kind,'found');assert.equal(findAt(state,first).kind,'already');assert.equal(state.found[0].length,1,'repeated taps do not duplicate progress');assert.notEqual(hintSpot(state),first);
assert.deepEqual(restoreSession(JSON.parse(JSON.stringify(state)),'other'),state,'reload keeps hiding places and discoveries');
state.scene=2;
for(let i=0;i<9;i++)findAt(state,i);
assert.equal(sceneComplete(state),true);assert.equal(hintSpot(state),-1);assert.equal(nextScene(state),0,'finish the third place first and return to unfinished places');assert.equal(allComplete(state),false);
for(const scene of [0,1]){state.scene=scene;for(let i=0;i<9;i++)findAt(state,i);}
assert.equal(allComplete(state),true);assert.equal(nextScene(state),null);assert.equal(state.found.flat().length,18);
state.rewardTicket='hide-and-seek:test:day:1';state.mode='challenge';
assert.deepEqual(restoreSession(state,'other'),state,'completed rounds keep their reward ticket');
const corrupt=restoreSession({...state,scene:9,found:[['lumina','lumina','bad'],null,[]],rewardTicket:'another-game:ticket'},'fallback');
assert.equal(corrupt.scene,0);assert.deepEqual(corrupt.found,[['lumina'],[],[]]);assert.equal(corrupt.rewardTicket,null);
assert.equal(restoreSession({...state,layouts:[[...state.layouts[0],null]]},'fallback').roundId,'fallback','bad layouts are replaced by a complete playable round');
for(const scene of SCENES){assert.match(background(scene.id),/^<svg/);assert.equal(scene.spots.length,9);for(const spot of scene.spots){assert.match(prop(spot),/^<svg/);assert.ok(!prop(spot).includes('undefined'));}}
console.log('PASS: randomized hiding places, discoveries, hints, repeat taps, out-of-order completion, save recovery and all scene artwork');
