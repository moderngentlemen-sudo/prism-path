'use client';
import {useEffect,useState} from 'react';
export function DustToast({notice,delayMs=0}:{notice:{id:string;amount:number;label:string}|null;delayMs?:number}){
 const [visible,setVisible]=useState(false);
 useEffect(()=>{if(!notice)return;setVisible(false);const delay=window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:delayMs;const show=setTimeout(()=>setVisible(true),delay);const hide=setTimeout(()=>setVisible(false),delay+3000);return()=>{clearTimeout(show);clearTimeout(hide);};},[notice?.id]);
 return visible&&notice?<div key={notice.id} className="dust-toast" role="status" aria-live="polite"><span aria-hidden="true">✧</span><div><strong>+{notice.amount.toLocaleString()} Stardust</strong><small>{notice.label}</small></div></div>:null;
}
