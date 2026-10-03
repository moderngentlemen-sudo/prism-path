'use client';
import {useEffect,useRef,useState} from 'react';
import {verifyFinish,type Action} from '@/lib/ranked';
import {guestGrants,pendingDust,mergeReceipts,type GuestReceipt} from '@/lib/guest-dust';
import bank from '@/lib/content/puzzles.json';
import {enrich} from '@/lib/journey';
import {dailyIndex} from '@/lib/game';
export type PlayerData={signedIn:boolean;provider?:string;accountId?:string;profile:{name:string;listed:number}|null;leaderboard:{name:string;points:number;puzzles:number;stars:number}[];scores?:{puzzle:string;points:number;stars:number;moves:number}[];stats?:{completions:number;moves:number;hints:number;seconds:number};bonusPoints?:number;wallet?:number;owned?:string[];streaks?:{kind:string;count:number;active:boolean;bonus:number}[]};
export function usePlayer(){
 const [data,setData]=useState<PlayerData|null>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[pending,setPending]=useState(0),[reward,setReward]=useState('');
 const [localDust,setLocalDust]=useState(0),[guestPending,setGuestPending]=useState(0),[dustNotice,setDustNotice]=useState<{id:string;amount:number;label:string}|null>(null);
 const current=useRef<PlayerData|null>(null),queue=useRef<object[]>([]),sending=useRef(false),queueKey=useRef(''),receipts=useRef<GuestReceipt[]>([]);
 const readLocal=()=>{try{const stored=JSON.parse(localStorage.getItem('prism-guest-dust-v1')||'[]');if(Array.isArray(stored))receipts.current=mergeReceipts(receipts.current,stored.filter(r=>r&&typeof r.id==='string'&&Array.isArray(r.grants)&&Array.isArray(r.actions)));}catch{}};
 const updateLocal=()=>{readLocal();const id=current.current?.accountId;setLocalDust(pendingDust(receipts.current,id));setGuestPending(receipts.current.filter(r=>!r.synced&&(!r.owner||r.owner===id)).length);try{localStorage.setItem('prism-guest-dust-v1',JSON.stringify(receipts.current));}catch{setError('Stardust could not be saved to this browser. Keep this page open and connect an account.');}};
 const notifyDust=(amount:number,label='Stardust earned')=>{if(amount>0)setDustNotice({id:crypto.randomUUID(),amount,label});};
 const persist=()=>{setPending(queue.current.length);try{if(queueKey.current)localStorage.setItem(queueKey.current,JSON.stringify(queue.current));}catch{setError('Pending account results cannot be saved on this device. Keep this page open and retry.');}};
 const request=async(method='GET',body?:object)=>{setBusy(true);setError('');try{const response=await fetch('/api/players',{method,headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined});const result:PlayerData&{error?:string}=await response.json();if(!response.ok)throw Error(result.error||'Player service unavailable');current.current=result;setData(result);if(result.accountId&&queueKey.current!=='prism-pending-'+result.accountId){queueKey.current='prism-pending-'+result.accountId;try{const saved=JSON.parse(localStorage.getItem(queueKey.current)||'[]');queue.current=Array.isArray(saved)?saved:[];}catch{queue.current=[];}setPending(queue.current.length);}return result;}catch(e){setError(e instanceof Error?e.message:'Player service unavailable');return null;}finally{setBusy(false);}};
 const flush=async()=>{
  if(sending.current||!current.current?.signedIn||!current.current?.accountId)return false;sending.current=true;
  try{
   const uid=current.current.accountId!;
   for(const receipt of receipts.current.filter(r=>!r.synced&&(!r.owner||r.owner===uid)).sort((a,b)=>a.day.localeCompare(b.day))){
    const localReceipt=receipts.current.find(r=>r.id===receipt.id);if(localReceipt)localReceipt.owner=uid;receipt.owner=uid;updateLocal();const before=current.current?.wallet||0;
    const result=await request('POST',{action:'guest',accountId:uid,receipt});
    if(!result||result.accountId!==uid)return false;
    const local=receipts.current.find(r=>r.id===receipt.id);if(local)local.synced=true;updateLocal();notifyDust((result.wallet||0)-before,'Stardust synced');
    setReward('Local Stardust synced. Rewards already collected by this account are counted once.');
   }
   while(current.current?.profile&&queue.current.length){
    const before=current.current,result=await request('POST',queue.current[0]);if(!result)return false;
    const dust=(result.wallet||0)-(before?.wallet||0),bonus=(result.bonusPoints||0)-(before?.bonusPoints||0);
    notifyDust(dust);setReward(`Account score saved${dust>0?` · +${dust} Stardust`:''}${bonus>0?` · +${bonus.toLocaleString()} streak points`:''}`);
    queue.current.shift();persist();
   }return true;
  }finally{sending.current=false;}
 };
 useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem('prism-guest-dust-v1')||'[]');if(Array.isArray(saved))receipts.current=saved.filter(r=>r&&typeof r.id==='string'&&typeof r.key==='string'&&typeof r.day==='string'&&Array.isArray(r.actions)&&Array.isArray(r.grants));}catch{setError('Local Stardust could not be read.');}updateLocal();void request();},[]);
 useEffect(()=>{updateLocal();if(data?.signedIn)void flush();},[data?.accountId,!!data?.profile]);
 const finish=async(key:string,actions:Action[],elapsed:number,calm:boolean)=>{
  if(current.current?.profile){queue.current.push({action:'finish',accountId:current.current.accountId,id:crypto.randomUUID(),key,actions,elapsed,calm});persist();return flush();}
  readLocal();const before=pendingDust(receipts.current,current.current?.accountId);
  const day=new Date().toISOString().slice(0,10),daily=key==='daily-'+day;
  const p=enrich(daily?bank.daily[dailyIndex(new Date())]:bank.campaign[Number(key)-1]);
  const verified=verifyFinish(p,actions,elapsed,calm),event={key,day,target:verified.target},grants=guestGrants(event,receipts.current);
  if(grants.length){receipts.current.push({...event,id:crypto.randomUUID(),actions,elapsed,calm,grants});updateLocal();notifyDust(Math.max(0,pendingDust(receipts.current,current.current?.accountId)-before));setReward('Stardust saved on this device. Connect a player account to sync and spend it.');}
  if(current.current?.signedIn)void flush();
  return true;
 };
 return {data,error,busy,pending,reward,localDust,guestPending,dustNotice,clearReward:()=>setReward(''),refresh:()=>request(),saveProfile:(name:string,listed:boolean)=>request('POST',{action:'profile',name,listed}),redeem:(product:string)=>request('POST',{action:'redeem',product}),finish,retry:()=>current.current?.signedIn?flush():request(),discardOldest:()=>{if(!sending.current){queue.current.shift();persist();setError('');}},reset:async()=>{if(sending.current)return false;const ok=await request('DELETE');if(ok){queue.current=[];persist();setReward('');}return !!ok;}};
}
