import {test} from 'node:test';
import assert from 'node:assert/strict';
import {relaxPuzzle,restoreRelax} from '../lib/relax.ts';
import {illuminate,explainHint} from '../lib/journey.ts';
test('Relax paths never escalate or introduce timers/objectives; unlimited assistance solves all three styles',()=>{
 for(const size of [3,4,5])for(let i=0;i<100;i++){
  const p=relaxPuzzle(i,size);assert.equal(p.paceSeconds,0);assert.equal(p.stage,1);assert.deepEqual(p.locked,[]);assert.deepEqual(p.receivers,[]);assert.deepEqual(p.filters,{});
  let b=[...p.initial],steps=0;assert.ok(!illuminate(b,p).solved);
  while(!illuminate(b,p).solved&&steps++<10){const h=explainHint(b,p);assert.ok(h);b=b.map((v,j)=>j===h.at?p.solution[j]:v);}
  assert.ok(illuminate(b,p).solved);assert.ok(steps<=(size===3?3:size===5?4:5));
 }
});
test('Choosing a future Relax style keeps the current unfinished path and survives reload',()=>{
 const current={index:8,size:4 as const,nextSize:5 as const,board:relaxPuzzle(8,4).initial,lit:[0,1]};
 assert.deepEqual(restoreRelax(current),current);
 const spacious={...current,size:5 as const,board:relaxPuzzle(8,5).solution};
 assert.deepEqual(restoreRelax(spacious),spacious);
 assert.equal(restoreRelax({...current,nextSize:99}).nextSize,undefined);
});
test('Relax restoration preserves its independent sky and rejects invalid boards/indexes',()=>{
 const p=relaxPuzzle(7,4),r={index:7,size:4,board:p.solution,lit:[0,2,2,200,-1]};
 assert.deepEqual(restoreRelax(r),{...r,lit:[0,2]});assert.equal(restoreRelax({index:-1}).index,0);
 assert.deepEqual(restoreRelax({...r,board:[999]}).board,p.initial);assert.equal(restoreRelax(null).size,3);
});
