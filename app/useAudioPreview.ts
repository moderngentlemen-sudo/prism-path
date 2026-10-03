'use client';
import {useEffect,useRef,useState} from 'react';
export function useAudioPreview(paused:boolean){
 const audio=useRef<HTMLAudioElement|null>(null),timer=useRef<ReturnType<typeof setTimeout>|null>(null),generation=useRef(0);
 const [active,setActive]=useState<string|null>(null),[error,setError]=useState('');
 const stop=()=>{generation.current++;audio.current?.pause();audio.current=null;if(timer.current)clearTimeout(timer.current);timer.current=null;setActive(null);};
 const play=async(track:string)=>{stop();setError('');const id=generation.current;const player=new Audio(`/audio/${track}.wav`);audio.current=player;player.volume=.25;setActive(track);try{await player.play();if(generation.current!==id){player.pause();return;}timer.current=setTimeout(stop,8000);}catch{if(generation.current===id){stop();setError('The preview could not play. Please try again.');}}};
 useEffect(()=>{if(paused)stop();},[paused]);
 useEffect(()=>{const hide=()=>{if(document.hidden)stop();};document.addEventListener('visibilitychange',hide);return()=>{generation.current++;audio.current?.pause();if(timer.current)clearTimeout(timer.current);document.removeEventListener('visibilitychange',hide);};},[]);
 return {active,error,play,stop};
}
