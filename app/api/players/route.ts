import {guestGrants,guestClaimSql,guestCreditSql} from '@/lib/guest-dust';
import {getPlayerUser} from '@/app/player-auth';
import {database} from '@/db/client';
import {streaks} from '@/lib/streaks';
import {verifyFinish} from '@/lib/ranked';
import bank from '@/lib/content/puzzles.json';
import {enrich} from '@/lib/journey';
import {dailyIndex} from '@/lib/game';
import {unlocks,dustForStreak,redemptionSql,constellationGrantSql} from '@/lib/currency';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store'}});
async function snapshot(){
 const user=await getPlayerUser(),db=database();
 const leaderboard=await db.prepare(`SELECT p.name,
 COALESCE((SELECT SUM(points) FROM best WHERE uid=p.uid),0)+COALESCE((SELECT SUM(points) FROM rewards WHERE uid=p.uid),0) AS points,
 (SELECT COUNT(*) FROM best WHERE uid=p.uid) AS puzzles,
 COALESCE((SELECT SUM(stars) FROM best WHERE uid=p.uid),0) AS stars
 FROM players p WHERE listed=1 ORDER BY points DESC,puzzles DESC,p.name LIMIT 50`).all();
 if(!user)return {signedIn:false,profile:null,leaderboard:leaderboard.results};
 const uid=user.userId,profile=await db.prepare('SELECT name,listed FROM players WHERE uid=?').bind(uid).first();
 if(!profile){const wallet=await db.prepare('SELECT COALESCE(SUM(amount),0) AS balance FROM wallet_entries WHERE uid=?').bind(uid).first<{balance:number}>();return {signedIn:true,provider:user.provider,accountId:uid,profile:null,wallet:wallet?.balance||0,leaderboard:leaderboard.results};}
 const [scores,days,stats,bonus,wallet,owned]=await Promise.all([
  db.prepare('SELECT puzzle,points,stars,moves FROM best WHERE uid=?').bind(uid).all(),
  db.prepare('SELECT day FROM activity WHERE uid=? ORDER BY day').bind(uid).all<{day:string}>(),
  db.prepare('SELECT COUNT(*) AS completions,COALESCE(SUM(moves),0) AS moves,COALESCE(SUM(hints),0) AS hints,COALESCE(SUM(seconds),0) AS seconds FROM finishes WHERE uid=?').bind(uid).first(),
  db.prepare('SELECT COALESCE(SUM(points),0) AS points FROM rewards WHERE uid=?').bind(uid).first<{points:number}>(),
  db.prepare('SELECT COALESCE(SUM(amount),0) AS balance FROM wallet_entries WHERE uid=?').bind(uid).first<{balance:number}>(),
  db.prepare("SELECT reason FROM wallet_entries WHERE uid=? AND amount<0").bind(uid).all<{reason:string}>()
 ]);
 return {signedIn:true,provider:user.provider,accountId:uid,profile,leaderboard:leaderboard.results,scores:scores.results,stats,bonusPoints:bonus?.points||0,wallet:wallet?.balance||0,owned:owned.results.map(r=>r.reason.slice(5)),streaks:streaks(days.results.map(r=>r.day),new Date().toISOString().slice(0,10))};
}
export async function GET(){try{return json(await snapshot());}catch(e){console.error('Player data unavailable',e);return json({error:'Player data is temporarily unavailable. Please retry.'},503);}}
function sameOrigin(request:Request){return request.headers.get('origin')===new URL(request.url).origin;}
export async function POST(request:Request){
 if(!sameOrigin(request))return json({error:'Invalid request origin'},403);
 const user=await getPlayerUser();if(!user)return json({error:'Please sign in.'},401);
 try{
  const raw=await request.text();if(raw.length>150000)return json({error:'History too large'},413);const body=JSON.parse(raw),db=database(),uid=user.userId;
  if(body.action==='profile'){
   if(typeof body.name!=='string'||!/^[\p{L}\p{N} _-]{2,24}$/u.test(body.name.trim())||typeof body.listed!=='boolean')return json({error:'Use 2–24 letters, numbers, spaces, hyphens or underscores.'},400);
   await db.prepare('INSERT INTO players(uid,name,listed) VALUES(?,?,?) ON CONFLICT(uid) DO UPDATE SET name=excluded.name,listed=excluded.listed').bind(uid,body.name.trim(),body.listed?1:0).run();
  }else if(body.action==='guest'){
   if(body.accountId!==uid)return json({error:'Sign back into the account receiving these local rewards.'},403);
   const r=body.receipt,today=new Date().toISOString().slice(0,10);
   if(!r||typeof r.id!=='string'||!/^[a-f0-9-]{36}$/.test(r.id)||typeof r.key!=='string'||typeof r.day!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(r.day)||r.day<'2026-09-12'||r.day>today||typeof r.calm!=='boolean')return json({error:'This local reward record is invalid.'},400);
   const date=new Date(r.day+'T00:00:00Z');
   if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==r.day)return json({error:'Invalid reward date.'},400);
   const claimed=await db.prepare('SELECT uid FROM guest_claims WHERE id=?').bind(r.id).first<{uid:string}>();
   if(claimed)return claimed.uid===uid?json(await snapshot()):json({error:'These local rewards already belong to another account.'},409);
   const daily=r.key==='daily-'+r.day;
   if(!daily&&!/^(?:[1-9]|[1-8][0-9]|90)$/.test(r.key))return json({error:'Invalid puzzle record.'},400);
   const p=enrich(daily?bank.daily[dailyIndex(date)]:bank.campaign[Number(r.key)-1]);
   let verified;try{verified=verifyFinish(p,r.actions,r.elapsed,r.calm);}catch{return json({error:'Could not verify this local puzzle. Its Stardust stays on this device.'},400);}
   const [past,accountDays,bests]=await Promise.all([
    db.prepare('SELECT puzzle AS key,day,target FROM guest_claims WHERE uid=?').bind(uid).all<{key:string;day:string;target:number}>(),
    db.prepare('SELECT day FROM activity WHERE uid=?').bind(uid).all<{day:string}>(),
    db.prepare('SELECT puzzle AS key,moves FROM best WHERE uid=?').bind(uid).all<{key:string;moves:number}>()
   ]);
   const history=[...past.results.map(h=>({...h,target:!!h.target})),...accountDays.results.map(h=>({key:'',day:h.day,target:false})),...bests.results.map(h=>({key:h.key,day:'',target:false}))];
   const grants=guestGrants({key:r.key,day:r.day,target:verified.target},history);
   // The wallet's unique reasons also deduplicate against signed-in earnings.
   await db.batch([db.prepare(guestClaimSql).bind(r.id,uid,r.key,r.day,verified.target?1:0),...grants.map(g=>db.prepare(guestCreditSql).bind(uid,g.reason,g.amount,r.id,uid))]);
   const owner=await db.prepare('SELECT uid FROM guest_claims WHERE id=?').bind(r.id).first<{uid:string}>();
   if(owner?.uid!==uid)return json({error:'These local rewards already belong to another account.'},409);
  }else if(body.action==='redeem'){
   if(!await db.prepare('SELECT uid FROM players WHERE uid=?').bind(uid).first())return json({error:'Create your player profile first.'},400);
   const item=unlocks.find(u=>u.id===body.product);if(!item)return json({error:'This item cannot be unlocked with Stardust.'},400);
   const reason='shop:'+item.id;
   await db.prepare(redemptionSql).bind(uid,reason,-item.cost,uid,item.cost).run();
   if(!await db.prepare('SELECT reason FROM wallet_entries WHERE uid=? AND reason=?').bind(uid,reason).first())return json({error:'You need more Stardust for this unlock.'},400);
  }else if(body.action==='finish'){
   if(body.accountId!==uid)return json({error:'This result belongs to a different signed-in account. Sign back in to sync it.'},403);
   if(!await db.prepare('SELECT uid FROM players WHERE uid=?').bind(uid).first())return json({error:'Create your player profile first.'},400);
   if(typeof body.id!=='string'||!/^[a-f0-9-]{36}$/.test(body.id)||typeof body.key!=='string'||typeof body.calm!=='boolean')return json({error:'Invalid completion'},400);
   const id=uid+':'+body.id;
   if(await db.prepare('SELECT id FROM finishes WHERE id=?').bind(id).first())return json(await snapshot());
   const today=new Date().toISOString().slice(0,10),daily=/^daily-\d{4}-\d{2}-\d{2}$/.test(body.key),index=Number(body.key)-1;
   const dailyDate=daily?new Date(body.key.slice(6)+'T00:00:00Z'):new Date(),age=(Date.parse(today)-dailyDate.getTime())/86400000;
   if(daily?(!Number.isFinite(age)||age<0||age>7||dailyDate.toISOString().slice(0,10)!==body.key.slice(6)):(!/^(?:[1-9]|[1-8][0-9]|90)$/.test(body.key)||!Number.isInteger(index)))return json({error:'This puzzle result is no longer eligible. Daily results can sync for seven days after play.'},400);
   const puzzle=enrich(daily?bank.daily[dailyIndex(dailyDate)]:bank.campaign[index]);
   let result;try{result=verifyFinish(puzzle,body.actions,body.elapsed,body.calm);}catch{return json({error:'The puzzle history could not be verified. Restart this puzzle to record a new attempt.'},400);}
   const days=await db.prepare('SELECT day FROM activity WHERE uid=?').bind(uid).all<{day:string}>();
   const earned=streaks([...days.results.map(r=>r.day),today],today);
   await db.batch([
    db.prepare('INSERT OR IGNORE INTO finishes(id,uid,puzzle,points,stars,moves,hints,seconds,day) VALUES(?,?,?,?,?,?,?,?,?)').bind(id,uid,body.key,result.points,result.stars,result.moves,result.hints,body.elapsed,today),
    db.prepare('INSERT INTO best(uid,puzzle,points,stars,moves) VALUES(?,?,?,?,?) ON CONFLICT(uid,puzzle) DO UPDATE SET points=MAX(best.points,excluded.points),stars=MAX(best.stars,excluded.stars),moves=MIN(best.moves,excluded.moves)').bind(uid,body.key,result.points,result.stars,result.moves),
    db.prepare('INSERT OR IGNORE INTO activity(uid,day) VALUES(?,?)').bind(uid,today),
    ...earned.map(s=>db.prepare('INSERT OR IGNORE INTO rewards(uid,period,kind,points,streak) VALUES(?,?,?,?,?)').bind(uid,s.period,s.kind,s.bonus,s.count)),
    ...[{reason:'puzzle:'+body.key,amount:10},...(result.target?[{reason:'target:'+body.key,amount:5}]:[]),...earned.map(s=>({reason:`streak:${s.kind}:${s.period}`,amount:dustForStreak(s.kind,s.count)}))].map(g=>db.prepare('INSERT OR IGNORE INTO wallet_entries(uid,reason,amount) VALUES(?,?,?)').bind(uid,g.reason,g.amount)),
    ...(!daily?[db.prepare(constellationGrantSql).bind(uid,'constellation:'+Math.floor(index/10),uid,uid,...Array.from({length:10},(_,i)=>String(Math.floor(index/10)*10+i+1)))]:[])
   ]);
  }else return json({error:'Unknown action'},400);
  return json(await snapshot());
 }catch(e){console.error('Could not save player',e);return json({error:'Could not save. Your local game is safe; please retry.'},503);}
}
export async function DELETE(request:Request){
 if(!sameOrigin(request))return json({error:'Invalid request origin'},403);
 const user=await getPlayerUser();if(!user)return json({error:'Please sign in.'},401);
 try{const db=database();await db.batch(['finishes','best','activity','rewards'].map(table=>db.prepare(`DELETE FROM ${table} WHERE uid=?`).bind(user.userId)));return json(await snapshot());}catch{return json({error:'Could not reset account progress. Please retry.'},503);}
}
