import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {enrich,enrichLegacy,illuminate,type JourneyPuzzle} from '../lib/journey.ts';
import {rotate,turnsTo} from '../lib/game.ts';
import {verifyFinish,type Action} from '../lib/ranked.ts';
import {startRun,serializeRun,restoreRun} from '../lib/session.ts';
const bank=JSON.parse(readFileSync(new URL('../lib/content/puzzles.json',import.meta.url),'utf8'));

// Exhaustive simple-route search is independent of the supplied solution path.
// Opening tiles have two ports, so any solution is a simple entrance-to-exit route.
function minimumTurns(p:JourneyPuzzle){
 let best=Infinity;
 const walk=(at:number,incoming:number,seen:Set<number>,cost:number)=>{
  for(const out of [1,2,4,8]){
   if(out===incoming)continue;
   const mask=incoming|out;let orientation=p.initial[at],turns=0;
   while(turns<4&&orientation!==mask){orientation=rotate(orientation);turns++;}
   if(turns===4||(p.locked.includes(at)&&turns!==0)||cost+turns>=best)continue;
   const nextCost=cost+turns;
   if(at===p.size*p.size-1&&out===2){if(p.locked.every(i=>seen.has(i)))best=nextCost;continue;}
   const row=Math.floor(at/p.size),col=at%p.size;
   if((out===1&&row===0)||(out===2&&col===p.size-1)||(out===4&&row===p.size-1)||(out===8&&col===0))continue;
   const next=at+(out===1?-p.size:out===2?1:out===4?p.size:-1);
   if(seen.has(next))continue;
   walk(next,out===1?4:out===2?8:out===4?1:2,new Set([...seen,next]),nextCost);
  }
 };walk(0,8,new Set([0]),0);return best;
}
function solutionActions(p:JourneyPuzzle){const board=[...p.initial],actions:Action[]=[];for(const at of p.path){for(let n=turnsTo(board[at],p.solution[at]);n>0;n--){board[at]=rotate(board[at]);actions.push({kind:'rotate',index:at});}}return actions;}

test('All fifteen authored openings have attainable minimum move targets and purposeful route variety',()=>{
 const puzzles=bank.campaign.slice(0,15).map(enrich);
 assert.deepEqual(puzzles.map((p:JourneyPuzzle)=>p.par),[1,2,3,3,4,4,5,5,6,6,3,4,5,6,7]);
 assert.equal(new Set(puzzles.map((p:JourneyPuzzle)=>p.name)).size,15);
 for(const p of puzzles){assert.equal(minimumTurns(p),p.par,`Puzzle ${p.id} target must match its minimum`);assert.ok(illuminate(p.solution,p).solved);assert.equal(p.locked.length,p.id>=11?1:0);}
 assert.ok(puzzles.slice(0,10).some((p:JourneyPuzzle)=>p.path.some((at,i)=>i>0&&at===p.path[i-1]-p.size)));
});
test('Existing opening runs and unsynced rewards remain valid after the puzzle revision',()=>{
 for(const base of bank.campaign.slice(0,15)){
  const old=enrichLegacy(base),current=enrich(base),run=startRun(old);
  const actions=solutionActions(old),first=actions[0];run.undo=[run.board.slice()];run.board[first.index!]=rotate(run.board[first.index!]);run.moves=1;run.actions=[first];run.elapsed=4;
  const restored=restoreRun(serializeRun(run),current)!;
  assert.ok(restored,`saved puzzle ${base.id}`);assert.deepEqual(restored.board,run.board);assert.equal(restored.puzzle.par,old.par);
  assert.deepEqual(verifyFinish(current,actions,4,false),verifyFinish(old,actions,4,false),`legacy rewards ${base.id}`);
 }
});
test('Puzzles after the opening and every daily keep their existing definitions',()=>{
 for(const base of [...bank.campaign.slice(15),...bank.daily])assert.deepEqual(enrich(base),enrichLegacy(base));
});
