import assert from 'node:assert/strict';
import {CHARACTERS,LENGTH,MAX_STARS,newJourney,restoreJourney,makeCourse,newRun,move,jump,step,finishStage} from '../academy/pony-run/model.mjs';
assert.equal(CHARACTERS.length,6);
for(let stage=0;stage<3;stage++){
  const course=makeCourse(stage);assert.equal(course.filter(x=>x.kind==='star').length,MAX_STARS);
  const rows=new Map();for(const item of course.filter(x=>x.kind==='obstacle')){rows.set(item.z,[...(rows.get(item.z)||[]),item.lane]);assert.ok(item.z>50);}
  for(const lanes of rows.values())assert.ok(new Set(lanes).size<3,'every obstacle row has a safe lane');
  const r=newRun(stage);let frames=0;
  while(!r.finished&&frames++<10000)step(r,1/60);
  assert.ok(r.finished,'no-input child can finish despite bumps');assert.equal(r.distance,LENGTH);assert.ok(r.stars>0);assert.ok(r.bumps>0);
  const before=JSON.stringify(r);step(r,1);assert.equal(JSON.stringify(r),before);
}
const r=newRun(0);for(let i=0;i<6;i++)move(r,-1);assert.equal(r.lane,0);for(let i=0;i<6;i++)move(r,1);assert.equal(r.lane,2);
assert.equal(jump(r),true);assert.equal(jump(r),false);for(let i=0;i<60;i++)step(r,1/60);assert.equal(r.jumpHeight,0);assert.equal(jump(r),true);
// The same obstacle can be cleared by jumping; neither collision nor star can resolve twice.
const collision=newRun(0);collision.distance=63;collision.lane=1;collision.x=1;collision.items=[{kind:'obstacle',lane:1,z:65,done:false},{kind:'star',lane:1,z:66,done:false}];jump(collision);
let events=[];for(let i=0;i<50;i++)events.push(...step(collision,1/60));assert.equal(collision.bumps,0);assert.ok(events.includes('jumped'));assert.equal(collision.stars,1);
const miss=newRun(0);miss.lane=0;miss.x=0;miss.items=[{kind:'star',lane:2,z:1,done:false}];for(let i=0;i<20;i++)step(miss,1/60);assert.equal(miss.stars,0);
const normal=newRun(0),slow=newRun(0);slow.slow=1;step(normal,.05);step(slow,.05);assert.ok(slow.distance<normal.distance);
const capped=newRun(0);step(capped,100);assert.ok(capped.distance<2);step(capped,NaN);assert.ok(Number.isFinite(capped.distance));
const j=newJourney('test');assert.equal(finishStage(j,newRun(0)),false);
for(let i=0;i<3;i++){const run=newRun(i);while(!run.finished)step(run,.05);assert.equal(finishStage(j,run),true);assert.equal(finishStage(j,run),false);}
assert.equal(j.scores.length,3);j.ticket='pony-run:test:day:1';assert.deepEqual(restoreJourney(j,'new'),j);
assert.equal(restoreJourney({...j,scores:[2],ticket:j.ticket},'new').ticket,null);
assert.equal(restoreJourney({...j,ticket:'wrong'},'new').ticket,null);
assert.deepEqual(restoreJourney({...j,scores:[4,-1,3]},'new').scores,[4]);
assert.equal(restoreJourney({...j,character:'unknown'},'new').character,'lumina');
assert.equal(restoreJourney({version:1,id:'<script>'},'safe').id,'safe');
console.log('Pony Run: course fairness, controls, collisions, completion, and save recovery passed.');
