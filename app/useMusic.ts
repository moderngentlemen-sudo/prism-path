'use client';
import {useEffect,useRef,useState} from 'react';
import {completionMusic} from '@/lib/completionMusic';
export function useMusic(paused:boolean,track='quiet-orbit',completed=0,stage=1){
 const audio=useRef<HTMLAudioElement|null>(null);
 const swellFrame=useRef<number|null>(null);
 const completionContext=useRef<AudioContext|null>(null),stopPhrase=useRef<(()=>void)|null>(null);
 const musicGain=useRef<GainNode|null>(null),musicSource=useRef<MediaElementAudioSourceNode|null>(null),lastVariation=useRef(-1);
 const connectMusic=()=>{const player=audio.current;if(!player)return;completionContext.current??=new AudioContext();if(!musicSource.current){musicSource.current=completionContext.current.createMediaElementSource(player);musicGain.current=completionContext.current.createGain();musicGain.current.gain.value=volume;musicSource.current.connect(musicGain.current);musicGain.current.connect(completionContext.current.destination);player.volume=1;}void completionContext.current.resume().catch(()=>{});};
 const setBackground=(player:HTMLAudioElement,value:number)=>{if(musicGain.current){musicGain.current.gain.value=value;player.volume=1;}else player.volume=value;};
 useEffect(()=>()=>{stopPhrase.current?.();void completionContext.current?.close();completionContext.current=null;},[]);
 const [enabled,setEnabled]=useState(true),[ready,setReady]=useState(false),[volume,setVolume]=useState(.25),[error,setError]=useState('');
 useEffect(()=>{try{if(localStorage.getItem('prism-music-enabled')==='false')setEnabled(false);const v=Number(localStorage.getItem('prism-volume-v2'));if(localStorage.getItem('prism-volume-v2')!==null&&Number.isFinite(v)&&v>=0&&v<=1)setVolume(v);}catch{}setReady(true);},[]);
 useEffect(()=>{const player=new Audio(`/audio/${track}.wav`);player.loop=true;player.preload='none';audio.current=player;return()=>{player.pause();musicSource.current?.disconnect();musicGain.current?.disconnect();musicSource.current=null;musicGain.current=null;player.removeAttribute('src');player.load();audio.current=null;};},[track]);
 useEffect(()=>{const player=audio.current;if(!player||!ready)return;setBackground(player,volume);let active=true;
  const stopSwell=()=>{if(swellFrame.current!==null)cancelAnimationFrame(swellFrame.current);swellFrame.current=null;setBackground(player,volume);stopPhrase.current?.();stopPhrase.current=null;};
  const sync=()=>{if(!enabled||paused||document.hidden){stopSwell();player.pause();return;}void player.play().then(()=>{if(active)setError('');}).catch((err:unknown)=>{if(!active||document.hidden)return;if(err instanceof DOMException&&['NotAllowedError','AbortError'].includes(err.name))return;setError('Music could not load. Please try again.');});};
  const gesture=(event:Event)=>{if(enabled&&!paused){try{connectMusic();}catch{}}if(event.target instanceof Element&&event.target.closest('[data-music-toggle]'))return;sync();};
  sync();document.addEventListener('visibilitychange',sync);document.addEventListener('pointerdown',gesture);document.addEventListener('keydown',gesture);
  return()=>{active=false;stopSwell();document.removeEventListener('visibilitychange',sync);document.removeEventListener('pointerdown',gesture);document.removeEventListener('keydown',gesture);};
 },[enabled,volume,paused,track,ready]);
 const celebrate=(milestone=false,target=false)=>{
  const player=audio.current;if(!player||!enabled||paused||document.hidden||volume===0)return;
  try{connectMusic();const variant=(lastVariation.current+1+Math.floor(Math.random()*3))%4;lastVariation.current=variant;stopPhrase.current?.();stopPhrase.current=completionMusic(completionContext.current!,volume,{variant,completed,stage,milestone,target});}catch{return;}
  if(swellFrame.current!==null)cancelAnimationFrame(swellFrame.current);
  const start=performance.now(),initial=musicGain.current?.gain.value??player.volume;
  const ease=(t:number)=>t*t*(3-2*t);
  const step=(now:number)=>{
   const elapsed=now-start;
   // Clear space for the phrase, then bring the continuing track back underneath its tail.
   setBackground(player,elapsed<400?initial*(1-ease(elapsed/400)):elapsed<3800?0:volume*ease(Math.min(1,(elapsed-3800)/2200)));
   if(elapsed<6000)swellFrame.current=requestAnimationFrame(step);else swellFrame.current=null;
  };
  swellFrame.current=requestAnimationFrame(step);
 };
 return {enabled,volume,error,celebrate,toggle:()=>{setError('');setEnabled(v=>{try{localStorage.setItem('prism-music-enabled',String(!v));}catch{}return !v;});},setVolume:(v:number)=>{setVolume(v);try{localStorage.setItem('prism-volume-v2',String(v));}catch{}}};
}
