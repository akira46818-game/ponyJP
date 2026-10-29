import assert from 'node:assert/strict';
import {LEVELS,CHARACTERS,newSession,restoreSession,checkBridge,examplePath,pathPosition,completeLevel} from '../academy/rainbow-bridge/model.mjs';

assert.deepEqual(CHARACTERS.map(c=>c.id),['lumina','flare','aqua','cat','terra','storm']);
for(const level of LEVELS){
  const example=examplePath(level),result=checkBridge(example,level);
  assert.equal(result.ok,true,`${level.id}: the child-friendly example must always be crossable`);
  assert.equal(checkBridge([...example].reverse(),level).ok,true,'drawing backwards also works');
  assert.deepEqual(pathPosition(result.path,0),level.start);
  assert.deepEqual(pathPosition(result.path,1),level.end);
}
const first=LEVELS[0];
assert.equal(checkBridge([first.start,first.end],first).ok,true,'a straight bridge can be drawn quickly');
const near=[{x:first.start.x+35,y:first.start.y+20},{x:first.end.x-30,y:first.end.y+15}];
assert.deepEqual(checkBridge(near,first).path,[first.start,first.end],'nearby endpoints snap to the bank');
assert.equal(near[0].x,first.start.x+35,'input points are not mutated');
assert.equal(checkBridge([first.start,{x:500,y:330}],first).reason,'ends');
assert.equal(checkBridge([first.start,{x:400,y:490},first.end],first).reason,'bounds');
assert.equal(checkBridge([first.start,{x:500,y:NaN},first.end],first).ok,false);
assert.equal(checkBridge(null,first).ok,false);
assert.equal(checkBridge([first.start],first).ok,false);
assert.equal(checkBridge([LEVELS[2].start,LEVELS[2].end],LEVELS[2]).reason,'rock','check the whole segment, not only sampled points');
assert.deepEqual(pathPosition([{x:0,y:0},{x:0,y:0},{x:100,y:0}],.5),{x:50,y:0},'repeated pointer points do not break movement');
const state=newSession('test-round');
assert.equal(completeLevel(state),false);assert.deepEqual(state.completed,[],'an unfinished bridge cannot clear a stage');
for(let i=0;i<LEVELS.length;i++){
  state.level=i;state.path=examplePath(LEVELS[i]);assert.equal(completeLevel(state),i===5);
  completeLevel(state);assert.equal(state.completed.length,i+1,'replaying never counts a stage twice');
}
assert.deepEqual(restoreSession(JSON.parse(JSON.stringify(state)),'fallback'),state,'reload preserves the completed round and current bridge');
const corrupt=restoreSession({...state,character:'unknown',level:999,completed:['bad','meadow','meadow'],path:[{x:0,y:0}]},'fallback');
assert.equal(corrupt.character,'lumina');assert.equal(corrupt.level,5);assert.deepEqual(corrupt.completed,['meadow']);assert.deepEqual(corrupt.path,[]);
console.log('PASS: six example routes, forward/reverse drawing, endpoint tolerance, segment collisions, movement, completion and save recovery');
