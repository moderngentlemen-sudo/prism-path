'use client';
import {useEffect,useRef,useState} from 'react';
export function usePace(key:string,moves:number,solved:boolean,budget:number,paused:boolean,initialElapsed=0){
 const [elapsed,setElapsed]=useState(0),[calm,setCalm]=useState(false);
 const elapsedRef=useRef(0),last=useRef(0);
 const activeKey=useRef(key);
 const currentElapsed=activeKey.current===key?elapsed:initialElapsed;
 useEffect(()=>{activeKey.current=key;elapsedRef.current=initialElapsed;setElapsed(initialElapsed);},[key]);
 useEffect(()=>{try{setCalm(localStorage.getItem('prism-calm-v2')==='true');}catch{}},[]);
 useEffect(()=>{if(moves===0){elapsedRef.current=0;setElapsed(0);}if(moves===0||solved||!budget||paused||calm)return;last.current=performance.now();
  const tick=()=>{const now=performance.now();if(!document.hidden)elapsedRef.current+=(now-last.current)/1000;last.current=now;setElapsed(elapsedRef.current);};
  const visible=()=>{last.current=performance.now();};const timer=setInterval(tick,100);document.addEventListener('visibilitychange',visible);
  return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',visible);};
 },[key,moves>0,solved,budget,paused,calm]);
 return {elapsed:currentElapsed,remaining:Math.max(0,budget-currentElapsed),calm,setCalm:(v:boolean)=>{setCalm(v);try{localStorage.setItem('prism-calm-v2',String(v));}catch{}},started:moves>0};
}
