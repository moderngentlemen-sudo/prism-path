'use client';
import {useState} from 'react';
import {unlocks,dustForStreak,unlockProgress} from '@/lib/currency';
import type {usePlayer} from './usePlayer';
const descriptions:Record<string,string>={aurora:'A violet glow for your light and journey.',sunset:'Warm amber light for a softer evening sky.',music:'Two Journey tracks to explore: Moonrise and Drift.',sfx:'Bright crystal sounds for turns and completed paths.',pack:'60 more puzzles, with color prisms and paired beams. The first three are free to try.'};
export function StardustShop({player,onAccount,onPreview,onSample}:{player:ReturnType<typeof usePlayer>;onAccount?:()=>void;onPreview?:(id:string)=>void;onSample?:()=>void}){
 const d=player.data,[preview,setPreview]=useState<string|null>(null),wallet=d?.signedIn?d.wallet||0:0;
 return <section className="stardust-shop"><span className="eyebrow">EARN A LITTLE EXTRA LIGHT</span><h3>✧ {(wallet+player.localDust).toLocaleString()} Stardust</h3><p>Earn 10 for each first puzzle clear, 5 for its first move-target achievement, and 25 for each completed constellation. Choose something to look forward to.</p>
 {!d?.profile&&<p>{d?.signedIn?'Create your player profile to spend account Stardust.':'Guest Stardust is saved on this device. Connect an account to sync it and unlock content.'}</p>}
 {d?.signedIn&&player.localDust>0&&<p>{wallet.toLocaleString()} ready to spend · {player.localDust.toLocaleString()} waiting to sync. <button className="quiet" onClick={()=>void player.retry()} disabled={player.busy}>Sync now</button></p>}
 <div className="dust-unlocks">{unlocks.map(item=>{
  const owned=d?.owned?.includes(item.id),p=unlockProgress(item.cost,wallet,player.localDust);
  return <article className="dust-unlock" key={item.id}>
   <div className="dust-item-heading"><strong>{item.name}</strong><span>{owned?'✓ Unlocked':`${item.cost} Stardust`}</span></div>
   {!owned&&<><progress max={item.cost} value={p.progress} aria-label={`Progress toward ${item.name}: ${p.progress} of ${item.cost} Stardust`}/><small>{p.remaining?`${p.remaining} more Stardust to reach this unlock`:'Enough earned for this unlock'}{p.needsSync?' · sync to spend':''}</small></>}
   <div className="dust-item-actions"><button className="quiet" aria-expanded={preview===item.id} onClick={()=>{const next=preview===item.id?null:item.id;setPreview(next);onPreview?.(next||'stop');}}>{preview===item.id?'Close preview':item.id==='music'||item.id==='sfx'?'Listen & preview':'Preview'}</button><button className="primary-button" disabled={owned||player.busy||(!d?.profile&&!onAccount)||(!!d?.profile&&!p.affordable&&!p.needsSync)} onClick={()=>{if(!d?.profile)onAccount?.();else if(p.needsSync)void player.retry();else void player.redeem(item.id);}}>{owned?'Unlocked':!d?.profile?d?.signedIn?'Create profile to unlock':'Connect to unlock':p.affordable?'Unlock':p.needsSync?'Sync to unlock':`${p.remaining} to go`}</button></div>
   {preview===item.id&&<div className="dust-preview"><p>{descriptions[item.id]}</p>{(item.id==='aurora'||item.id==='sunset')&&<div className="dust-palette-preview" style={{color:item.id==='aurora'?'#b8a1ff':'#ffbc7d'}} aria-label={`${item.name} light sample`}><svg viewBox="0 0 240 70" role="img" aria-label="Sample connected light path"><path d="M0 35 H75 Q90 35 90 20 V18 Q90 10 100 10 H130 Q140 10 140 20 V50 Q140 60 150 60 H180 Q190 60 190 50 V45 Q190 35 200 35 H240"/></svg><span>{item.id==='aurora'?'Aurora':'Sunset'} light</span></div>}{item.id==='music'&&<p className="dust-preview-note">An eight-second Moonrise sample. Both tracks can be previewed in the shop.</p>}{item.id==='pack'&&onSample&&<button className="quiet" onClick={onSample}>Play the three free samples →</button>}</div>}
  </article>;
 })}</div>
 <details><summary>Stardust reward rules</summary><p>Daily streak: 5 × streak, up to {dustForStreak('daily',7)}. Weekly: 25 × streak, up to {dustForStreak('weekly',4)}. Monthly: 100 × streak, up to {dustForStreak('monthly',3)}. Each period pays once when you complete a puzzle. Puzzle and target rewards pay once per puzzle, even after restarting the game.</p><p>Unlocks are permanent on your account. Stardust has no cash value and cannot remove ads. Ad removal remains a separate $1/month proposed subscription. Cash purchases in this browser preview remain demonstrations.</p></details>
 {player.error&&onAccount&&<p role="alert">{player.error}</p>}
 </section>;
}
