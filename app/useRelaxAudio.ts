'use client';
import {useEffect,useRef,useState} from 'react';
import {instrumentUrl,restoreInstrument,type RelaxInstrument} from '@/lib/relax-instruments';
export function useRelaxAudio(){
 const music=useRef<HTMLAudioElement|null>(null),sounds=useRef<HTMLAudioElement[]>([]),active=useRef(true);
 const context=useRef<AudioContext|null>(null),buffers=useRef<Record<string,AudioBuffer>>({}),voices=useRef<AudioBufferSourceNode[]>([]);
 const unlock=()=>{const ctx=context.current;if(ctx&&ctx.state!=='running')void ctx.resume().catch(()=>{});};
 const [instrument,setInstrumentState]=useState<RelaxInstrument>('piano');
 const [enabled,setEnabledState]=useState(true),[volume,setVolumeState]=useState(.35),[effects,setEffectsState]=useState(true),[ready,setReady]=useState(false),[playing,setPlaying]=useState(false),[error,setError]=useState('');
 const values=useRef({enabled,volume,effects,instrument});values.current={enabled,volume,effects,instrument};
 const start=()=>{const player=music.current;if(!player||!values.current.enabled||document.hidden)return;if(player.error)player.load();player.volume=values.current.volume;const source=player.src;void player.play().then(()=>{if(!active.current||source!==player.src)return;if(!values.current.enabled||document.hidden){player.pause();return;}setPlaying(true);setError('');}).catch((e:unknown)=>{if(!active.current||source!==player.src)return;setPlaying(false);if(e instanceof DOMException&&['NotAllowedError','AbortError'].includes(e.name))return;setError('Audio could not start. Tap to retry.');});};
 useEffect(()=>{
  active.current=true;
  try{const r=JSON.parse(localStorage.getItem('prism-relax-audio')||'null');const preferences={instrument:restoreInstrument(r?.instrument),enabled:typeof r?.enabled==='boolean'?r.enabled:localStorage.getItem('prism-music-enabled')!=='false',effects:typeof r?.effects==='boolean'?r.effects:true,volume:typeof r?.volume==='number'&&r.volume>=0&&r.volume<=1?r.volume:.35};values.current=preferences;setInstrumentState(preferences.instrument);setEnabledState(preferences.enabled);setEffectsState(preferences.effects);setVolumeState(preferences.volume);}catch{}
  const player=new Audio(instrumentUrl(values.current.instrument));player.loop=true;player.preload='auto';player.volume=values.current.volume;music.current=player;
  const names=['relax-touch','relax-complete','relax-next'];
  sounds.current=names.map(name=>{const p=new Audio('/audio/'+name+'.wav?v=11');p.preload='auto';p.volume=.85;p.load();return p;});
  try{const Ctor=window.AudioContext||(window as unknown as {webkitAudioContext:typeof AudioContext}).webkitAudioContext;const ctx=new Ctor();context.current=ctx;for(const name of names)void fetch('/audio/'+name+'.wav?v=11').then(r=>{if(!r.ok)throw Error('Audio unavailable');return r.arrayBuffer();}).then(b=>ctx.decodeAudioData(b)).then(b=>{if(context.current===ctx)buffers.current[name]=b;}).catch(()=>{});}catch{}
  const sync=()=>{if(document.hidden||!values.current.enabled){player.pause();setPlaying(false);}else start();};
  const stopped=()=>{if(active.current)setPlaying(false);};
  player.addEventListener('pause',stopped);player.addEventListener('error',()=>{if(active.current)setError('Audio could not load. Tap to retry.');});
  const gesture=()=>{unlock();if(player.paused)start();};
  document.addEventListener('click',gesture);document.addEventListener('touchend',gesture);document.addEventListener('keydown',gesture);document.addEventListener('visibilitychange',sync);
  setReady(true);start();
  return()=>{active.current=false;document.removeEventListener('click',gesture);document.removeEventListener('touchend',gesture);document.removeEventListener('keydown',gesture);document.removeEventListener('visibilitychange',sync);player.pause();player.removeAttribute('src');player.load();for(const p of sounds.current){p.pause();p.removeAttribute('src');p.load();}sounds.current=[];music.current=null;};
 },[]);
 useEffect(()=>{if(ready)try{localStorage.setItem('prism-relax-audio',JSON.stringify({enabled,volume,effects,instrument}));}catch{}},[enabled,volume,effects,instrument,ready]);
 const setInstrument=(v:RelaxInstrument)=>{v=restoreInstrument(v);if(values.current.instrument===v)return;values.current.instrument=v;setInstrumentState(v);setPlaying(false);setError('');const p=music.current;if(p){p.pause();p.src=instrumentUrl(v);p.load();start();}};
 const setEnabled=(v:boolean)=>{values.current.enabled=v;setEnabledState(v);if(v)start();else{music.current?.pause();setPlaying(false);}};
 const setVolume=(v:number)=>{v=Math.max(0,Math.min(1,v));values.current.volume=v;setVolumeState(v);if(music.current)music.current.volume=v;};
 const setEffects=(v:boolean)=>{values.current.effects=v;setEffectsState(v);if(!v){for(const p of sounds.current)p.pause();for(const source of voices.current)source.stop();voices.current=[];}};
 const playEffect=(name:'relax-touch'|'relax-complete'|'relax-next')=>{
  unlock();if(music.current?.paused)start();if(!values.current.effects)return;
  const ctx=context.current,buffer=buffers.current[name];
  if(ctx?.state==='running'&&buffer){const source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=buffer;gain.gain.value=.85;source.connect(gain);gain.connect(ctx.destination);if(voices.current.length>=6)voices.current.shift()?.stop();voices.current.push(source);source.onended=()=>{voices.current=voices.current.filter(s=>s!==source);source.disconnect();gain.disconnect();};source.start();return;}
  const p=sounds.current[name==='relax-touch'?0:name==='relax-complete'?1:2];if(!p)return;p.currentTime=0;void p.play().catch(()=>{if(active.current)setError('Sound is waiting for playback permission. Tap Start audio to retry.');});
 };
 useEffect(()=>()=>{const ctx=context.current;context.current=null;buffers.current={};voices.current=[];if(ctx&&ctx.state!=='closed')void ctx.close().catch(()=>{});},[]);
 return {instrument,setInstrument,enabled,volume,effects,playing,error,setEnabled,setVolume,setEffects,touch:()=>playEffect('relax-touch'),complete:()=>playEffect('relax-complete'),confirmNext:()=>playEffect('relax-next'),start:()=>{unlock();start();}};
}
