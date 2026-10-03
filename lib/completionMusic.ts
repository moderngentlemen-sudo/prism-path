// A separate musical phrase makes completion audible even on platforms where
// HTMLMediaElement volume changes are controlled by the device.
export function completionMusic(ctx:AudioContext,volume:number,{variant=0,completed=0,stage=1,milestone=false,target=false}={}){
 const bus=ctx.createGain();bus.gain.value=volume;bus.connect(ctx.destination);
 const voices:OscillatorNode[]=[];
 const note=(hz:number,offset:number,length:number,level:number)=>{
  const at=ctx.currentTime+offset,osc=ctx.createOscillator(),gain=ctx.createGain();
  osc.type='sine';osc.frequency.value=hz;osc.connect(gain);gain.connect(bus);
  gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(level,at+.09);
  gain.gain.exponentialRampToValueAtTime(.0001,at+length);
  osc.start(at);osc.stop(at+length+.02);voices.push(osc);
  osc.onended=()=>{osc.disconnect();gain.disconnect();};
 };
 // Four related phrases; progress adds harmony, a bass foundation, then a high response.
 const melodies=[[523.25,659.25,783.99,1046.5,783.99],[659.25,783.99,987.77,1046.5,659.25],[392,523.25,659.25,783.99,1046.5],[783.99,659.25,523.25,659.25,1046.5]];
 const richness=Math.min(3,Math.floor(Math.max(completed,stage-1)/20));
 [261.63,329.63,392,...(richness>0?[523.25]:[])].forEach(hz=>note(hz,.3,4.8,.08));
 const melody=milestone?[392,523.25,659.25,783.99,1046.5,1318.51,1046.5]:melodies[variant%4];
 melody.forEach((hz,i)=>note(hz,.3+i*.4,2.8,i===4?.2:.15));
 if(richness>=2)note(130.81,.3,4.8,.11);
 if(richness>=3)[1046.5,1318.51,1567.98].forEach((hz,i)=>note(hz,2.4+i*.24,2,.055));
 if(milestone)[523.25,783.99,1046.5,1318.51,1567.98,2093].forEach((hz,i)=>note(hz,1.9+i*.28,2.5,.09));
 if(milestone)[130.81,196,261.63].forEach(hz=>note(hz,.35,5.2,.07));
 if(target)[1046.5,1318.51,1567.98].forEach((hz,i)=>note(hz,.12+i*.15,1.7,.1));
 const cleanup=setTimeout(()=>bus.disconnect(),6000);
 return ()=>{clearTimeout(cleanup);bus.disconnect();for(const voice of voices){try{voice.stop();}catch{}}};
}
