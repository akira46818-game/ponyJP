import assert from 'node:assert/strict';
import {LEVELS,CHARACTERS,newSession,restoreSession,checkBridge,examplePath,pathPosition,completeLevel,starProgress,nextUnfinishedLevel} from '../academy/rainbow-bridge/model.mjs';

assert.deepEqual(CHARACTERS.map(c=>c.id),['lumina','flare','aqua','cat','terra','storm']);
for(const level of LEVELS){
  const example=examplePath(level),result=checkBridge(example,level);
  assert.equal(result.ok,true,`${level.id}: the child-friendly example must always be crossable`);
  assert.equal(checkBridge([...example].reverse(),level).ok,true,'drawing backwards also works');
  assert.deepEqual(pathPosition(result.path,0),level.start);
  assert.deepEqual(pathPosition(result.path,1),level.end);
  assert.equal(result.stars.length,level.stars.length);
  assert.ok(result.stars.every(at=>at!==null&&at>=0&&at<=1),'every checkpoint is visited during the walk');
}
const first=LEVELS[0];
assert.equal(checkBridge([first.start,first.end],first).reason,'stars','a shortcut missing the stars invites another drawing');
const plain={...first,stars:[]};
const near=[{x:first.start.x+35,y:first.start.y+20},{x:first.end.x-30,y:first.end.y+15}];
assert.deepEqual(checkBridge(near,plain).path,[first.start,first.end],'nearby endpoints snap to the bank');
assert.equal(near[0].x,first.start.x+35,'input points are not mutated');
assert.equal(checkBridge([first.start,{x:500,y:330}],first).reason,'ends');
assert.equal(checkBridge([first.start,{x:400,y:490},first.end],first).reason,'bounds');
assert.equal(checkBridge([first.start,{x:500,y:NaN},first.end],first).ok,false);
assert.equal(checkBridge(null,first).ok,false);
assert.equal(checkBridge([first.start],first).ok,false);
assert.equal(checkBridge([first.start,first.end],{...plain,rocks:[{x:500,y:350,r:45}]}).reason,'rock','check the whole segment, not only sampled points');
assert.deepEqual(starProgress([],first),first.stars.map(()=>null));
assert.equal(starProgress([first.start,first.end],{...plain,stars:[{x:500,y:350}]}).length,1);
assert.ok(Math.abs(starProgress([first.start,first.end],{...plain,stars:[{x:500,y:350}]})[0]-.5)<.001,'fast strokes collect stars between pointer samples');
for(const i of [1,2,4,5]){
  const route=examplePath(LEVELS[i]);
  assert.ok(route.some((p,n)=>n&&p.x<route[n-1].x-1),'S, loop, heart and double-loop routes must travel left as well as right');
}
const crossing=[first.start,{x:350,y:180},{x:650,y:400},{x:350,y:400},{x:650,y:180},first.end];
assert.equal(checkBridge(crossing,plain).ok,true,'self intersections are playable bridges');
assert.deepEqual(pathPosition([{x:0,y:0},{x:0,y:0},{x:100,y:0}],.5),{x:50,y:0},'repeated pointer points do not break movement');
const state=newSession('test-round');
assert.equal(completeLevel(state),false);assert.deepEqual(state.completed,[],'an unfinished bridge cannot clear a stage');
state.path=[first.start,first.end];assert.equal(completeLevel(state),false);assert.deepEqual(state.completed,[],'missing checkpoints cannot clear a stage');
for(let i=0;i<LEVELS.length;i++){
  state.level=i;state.path=examplePath(LEVELS[i]);assert.equal(completeLevel(state),i===5);
  completeLevel(state);assert.equal(state.completed.length,i+1,'replaying never counts a stage twice');
}
assert.deepEqual(restoreSession(JSON.parse(JSON.stringify(state)),'fallback'),state,'reload preserves the completed round and current bridge');
const corrupt=restoreSession({...state,character:'unknown',level:999,completed:['bad','meadow','meadow'],path:[{x:0,y:0}]},'fallback');
assert.equal(corrupt.character,'lumina');assert.equal(corrupt.level,5);assert.deepEqual(corrupt.completed,['meadow']);assert.deepEqual(corrupt.path,[]);
const old=restoreSession({...state,level:0,path:[first.start,first.end],rewardTicket:'existing-ticket'},'fallback');
assert.deepEqual(old.completed,state.completed);assert.equal(old.rewardTicket,'existing-ticket');assert.deepEqual(old.path,[],'old progress and rewards survive the new route requirements');
const choice=newSession('choice');choice.level=5;choice.path=examplePath(LEVELS[5]);
assert.equal(completeLevel(choice),false);assert.equal(nextUnfinishedLevel(choice),0,'starting with the final course still offers unfinished courses');
choice.level=0;choice.completed.push('meadow','flowers');assert.equal(nextUnfinishedLevel(choice),2,'skip completed courses');
assert.equal(nextUnfinishedLevel(state),null,'all six distinct courses are required');
console.log('PASS: six winding routes, checkpoints, reverse and crossing strokes, collisions, movement, course selection and existing save recovery');
