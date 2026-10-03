import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {rotate} from '../lib/game.ts';
import {enrich,explainHint,illuminate} from '../lib/journey.ts';
import {startRun,serializeRun,restoreRun,resumeIndex} from '../lib/session.ts';
const bank=JSON.parse(readFileSync(new URL('../lib/content/puzzles.json',import.meta.url),'utf8'));
test('Resume preserves board, undo, hints, elapsed and chapter; rejects incompatible saves',()=>{
 const p=enrich(bank.campaign[10]),r=startRun(p);const at=p.path.find(i=>!p.locked.includes(i))!;
 r.undo=[r.board.slice()];r.board[at]=rotate(r.board[at]);r.moves=1;r.hints=1;r.elapsed=12;r.actions=[{kind:'rotate',index:at}];
 assert.deepEqual(restoreRun(serializeRun(r),p),r);
 const invalid=serializeRun(r);invalid.board=[...invalid.board];invalid.board[p.locked[0]]=rotate(invalid.board[p.locked[0]]);
 assert.equal(restoreRun(invalid,p),null);assert.equal(restoreRun({...serializeRun(r),fingerprint:'old'},p),null);
 assert.equal(restoreRun({...serializeRun(r),moves:-1},p),null);
 assert.equal(resumeIndex(65,{'65':1},true),65);assert.equal(resumeIndex(65,{'65':1},false),30);
});
test('Daily progress cannot restore onto a different date or different content',()=>{
 const p=enrich(bank.daily[0]);const r=startRun(p,true,'daily-2026-09-12');
 assert.ok(restoreRun(serializeRun(r),p,true,r.key));assert.equal(restoreRun(serializeRun(r),p,true,'daily-2026-09-13'),null);
});
test('New hints recognize a closed entrance and stop on solved alternatives',()=>{
 const p=enrich(bank.campaign[2]),board=[...p.solution];board[0]=rotate(p.solution[0]);
 assert.match(explainHint(board,p)!.text,/entrance is closed/);
 assert.equal(explainHint(p.solution,p),null);
});
test('Opening repair load is bounded and fixed tiles debut with a short practice puzzle',()=>{
 const p=bank.campaign.slice(3,15).map(enrich);
 for(const level of p){assert.ok(level.par<=7);assert.ok(!illuminate(level.initial,level).solved);}
 assert.equal(p[7].id,11);assert.equal(p[7].par,3);assert.ok(p[7].locked.length);
});
