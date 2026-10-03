import {test} from 'node:test';import assert from 'node:assert/strict';
import {rotate,trace,makePuzzle,turnsTo,starsFor,dailyIndex} from '../lib/game.ts';
test('Rotation preserves ports and completes full circle',()=>{for(let mask=1;mask<16;mask++){let m=mask;for(let t=0;t<4;t++)m=rotate(m);assert.equal(m,mask);}assert.equal(rotate(9),3);});
test('Light requires reciprocal ports and a right-facing exit',()=>{assert.equal(trace([10,12,0,3],2).solved,true);assert.equal(trace([2,12,0,3],2).solved,false);assert.equal(trace([10,9,0,3],2).solved,false);assert.equal(trace([10,12,0,9],2).solved,false);});
test('Solved path does not require unrelated decoys',()=>{assert.equal(trace([10,12,15,3],2).solved,true);});
test('Generation is deterministic and solvable across seeds',()=>{for(let id=1;id<=1000;id++){const p=makePuzzle(id,4+id%3);assert.deepEqual(p,makePuzzle(id,4+id%3));assert.ok(trace(p.solution,p.size).solved);assert.ok(!trace(p.initial,p.size).solved);assert.equal(p.par,p.path.reduce((v,i)=>v+turnsTo(p.initial[i],p.solution[i]),0));}});
test('Stars reward efficiency without penalizing unlimited play',()=>{assert.equal(starsFor(5,5,0),3);assert.equal(starsFor(6,5,0),2);assert.equal(starsFor(5,5,1),2);assert.equal(starsFor(50,5,4),1);});
test('Daily puzzle is stable across timezone offsets for the same instant',()=>{assert.equal(dailyIndex(new Date('2026-09-06T00:00:00Z')),dailyIndex(new Date('2026-09-05T19:00:00-05:00')));});
