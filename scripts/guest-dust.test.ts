import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {guestGrants,pendingDust,mergeReceipts,guestClaimSql,guestCreditSql,type GuestReceipt} from '../lib/guest-dust.ts';
import {constellationGrantSql} from '../lib/currency.ts';
const event={key:'1',day:'2026-09-12',target:true};
const receipt=(id='one'):GuestReceipt=>({...event,id,actions:[],elapsed:0,calm:false,grants:guestGrants(event,[])});
test('Guest first clear earns matching currency; replays and later target awards deduplicate',()=>{
 assert.equal(guestGrants(event,[]).reduce((s,g)=>s+g.amount,0),145);
 assert.deepEqual(guestGrants(event,[event]),[]);
 assert.deepEqual(guestGrants(event,[{...event,target:false}]),[{reason:'target:1',amount:5}]);
 assert.equal(guestGrants({...event,day:'2026-09-13'},[event]).reduce((s,g)=>s+g.amount,0),10);
 const past=Array.from({length:9},(_,i)=>({...event,key:String(i+1)}));
 assert.ok(guestGrants({...event,key:'10'},past).some(g=>g.reason==='constellation:0'&&g.amount===25));
});
test('Browser receipt merges retain transfers and deduplicate local balances across tabs',()=>{
 const a=receipt(),b=receipt('two');assert.equal(pendingDust([a,b]),145);
 const synced={...a,synced:true,owner:'player-a'};assert.equal(pendingDust([synced,b]),0);
 assert.equal(pendingDust([{...a,owner:'player-a'}],'player-b'),0);
 const merged=mergeReceipts([a],[synced,b]);assert.equal(merged.length,2);assert.equal(merged.find(r=>r.id==='one')?.synced,true);assert.equal(merged.find(r=>r.id==='one')?.owner,'player-a');
});
test('Claim retries, account switches, existing rewards and restarts cannot duplicate transferred currency',()=>{
 const db=new DatabaseSync(':memory:');for(const f of readdirSync(new URL('../drizzle/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())db.exec(readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8'));
 const claim=(uid:string)=>{db.prepare(guestClaimSql).run('receipt',uid,'1',event.day,1);for(const g of guestGrants(event,[]))db.prepare(guestCreditSql).run(uid,g.reason,g.amount,'receipt',uid);};
 db.prepare('INSERT INTO wallet_entries VALUES(?,?,?)').run('a','puzzle:1',10);
 claim('a');claim('a');claim('b');assert.equal(db.prepare('SELECT SUM(amount) AS n FROM wallet_entries WHERE uid=?').get('a')?.n,145);assert.equal(db.prepare('SELECT COUNT(*) AS n FROM wallet_entries WHERE uid=?').get('b')?.n,0);
 db.exec('DELETE FROM best;DELETE FROM activity;DELETE FROM rewards;DELETE FROM finishes;');claim('a');assert.equal(db.prepare('SELECT SUM(amount) AS n FROM wallet_entries').get()?.n,145);
 for(let i=2;i<10;i++)db.prepare(guestClaimSql).run('r'+i,'a',String(i),event.day,0);
 db.prepare('INSERT INTO best VALUES(?,?,?,?,?)').run('a','10',1000,1,10);
 db.prepare(constellationGrantSql).run('a','constellation:0','a','a',...Array.from({length:10},(_,i)=>String(i+1)));
 assert.equal(db.prepare("SELECT amount FROM wallet_entries WHERE reason='constellation:0'").get()?.amount,25);db.close();
});
