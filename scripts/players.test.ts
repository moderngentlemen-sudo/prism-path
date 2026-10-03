import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {enrich,illuminate} from '../lib/journey.ts';
import {rotate} from '../lib/game.ts';
import {verifyFinish,type Action} from '../lib/ranked.ts';
import {streaks,periods} from '../lib/streaks.ts';
import {redemptionSql,constellationGrantSql,unlocks,dustForStreak,unlockProgress} from '../lib/currency.ts';
const schema=readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort().map(f=>readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8')).join('\n');
const bank=JSON.parse(readFileSync(new URL('../lib/content/puzzles.json',import.meta.url),'utf8'));
test('Unlock progress includes local rewards but spending waits for credited balance',()=>{
 const local=unlockProgress(150,0,150);assert.equal(local.progress,150);assert.equal(local.affordable,false);assert.equal(local.needsSync,true);
 const mixed=unlockProgress(150,100,25);assert.equal(mixed.remaining,25);assert.equal(mixed.affordable,false);
 const synced=unlockProgress(150,150,0);assert.equal(synced.affordable,true);assert.equal(synced.needsSync,false);
 assert.equal(unlockProgress(150,200,20).progress,150);
 assert.equal(unlockProgress(150,NaN,-5).earned,0);
});
test('Constellation Stardust waits for all ten account puzzle clears and pays only once',()=>{
 const db=new DatabaseSync(':memory:');db.exec(schema);
 const grant=()=>db.prepare(constellationGrantSql).run('a','constellation:0','a','a',...Array.from({length:10},(_,i)=>String(i+1)));
 for(let i=1;i<10;i++)db.prepare('INSERT INTO best VALUES(?,?,?,?,?)').run('a',String(i),1000,3,4);
 grant();assert.equal(db.prepare('SELECT COUNT(*) AS n FROM wallet_entries').get()?.n,0);
 db.prepare('INSERT INTO best VALUES(?,?,?,?,?)').run('b','10',1000,3,4);grant();assert.equal(db.prepare('SELECT COUNT(*) AS n FROM wallet_entries').get()?.n,0);
 db.prepare('INSERT INTO best VALUES(?,?,?,?,?)').run('a','10',1000,3,4);grant();grant();assert.equal(db.prepare('SELECT SUM(amount) AS balance FROM wallet_entries').get()?.balance,25);db.close();
});
test('Server replay verifies all campaign puzzle routes and scores; rejects incomplete and altered histories',()=>{
 for(const raw of bank.campaign){const p=enrich(raw),board=[...p.initial],actions:Action[]=[];
  for(let i=0;i<board.length&&!illuminate(board,p).solved;i++){if(p.locked.includes(i))continue;while(board[i]!==p.solution[i]&&!illuminate(board,p).solved){board[i]=rotate(board[i]);actions.push({kind:'rotate',index:i});}}
  const result=verifyFinish(p,actions,10,false);assert.equal(result.moves,actions.length);assert.ok(result.points>0);
  assert.throws(()=>verifyFinish(p,actions.slice(0,-1),10,false));assert.throws(()=>verifyFinish(p,[...actions,{kind:'undo'}],10,false));
 }
 const p=enrich(bank.campaign[10]);assert.throws(()=>verifyFinish(p,[{kind:'rotate',index:p.locked[0]}],0,false));assert.throws(()=>verifyFinish(p,[{kind:'undo'}],0,false));assert.throws(()=>verifyFinish(p,[],NaN,false));
});
test('UTC streaks handle Sunday/Monday, month/year boundaries, gaps and duplicate completions',()=>{
 assert.equal(periods('2026-09-13').weekly+1,periods('2026-09-14').weekly);
 const s=streaks(['2025-12-31','2026-01-01','2026-01-01'],'2026-01-01');assert.equal(s[0].count,2);assert.equal(s[1].count,1);assert.equal(s[2].count,2);assert.equal(s[0].bonus,100);
 assert.equal(streaks(['2026-01-01'],'2026-01-02')[0].count,1);assert.equal(streaks(['2026-01-01'],'2026-01-03')[0].count,0);
 assert.deepEqual(streaks([],'2026-09-12').map(s=>s.bonus),[50,250,1000]);assert.equal(dustForStreak('daily',100),35);
});
test('Stardust ledger prevents duplicate grants, overspending, duplicate redemption and cross-player spending',()=>{
 const db=new DatabaseSync(':memory:');db.exec(schema);
 const grant=db.prepare('INSERT OR IGNORE INTO wallet_entries(uid,reason,amount) VALUES(?,?,?)'),redeem=db.prepare(redemptionSql);
 grant.run('a','earned',200);grant.run('a','earned',200);grant.run('b','earned',5);
 const spend=(u:string,id:string,cost:number)=>redeem.run(u,'shop:'+id,-cost,u,cost);
 spend('a','aurora',150);spend('a','aurora',150);spend('a','sfx',100);spend('b','sfx',100);
 assert.equal(db.prepare('SELECT SUM(amount) AS balance FROM wallet_entries WHERE uid=?').get('a')?.balance,50);
 assert.equal(db.prepare('SELECT SUM(amount) AS balance FROM wallet_entries WHERE uid=?').get('b')?.balance,5);
 assert.equal(db.prepare('SELECT COUNT(*) AS n FROM wallet_entries WHERE amount<0').get()?.n,1);
 assert.ok(!unlocks.some(item=>(item.id as string)==='noads'));
 db.exec('DELETE FROM best; DELETE FROM activity; DELETE FROM rewards; DELETE FROM finishes;');grant.run('a','earned',200);
 assert.equal(db.prepare('SELECT SUM(amount) AS balance FROM wallet_entries WHERE uid=?').get('a')?.balance,50);db.close();
});
