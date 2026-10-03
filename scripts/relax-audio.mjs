import {writeFileSync,mkdirSync} from 'node:fs';
const rate=22050,root=new URL('../public/audio/',import.meta.url);mkdirSync(root,{recursive:true});
function wav(name,seconds,sample,peak){const n=Math.round(seconds*rate),data=new Float64Array(n);let max=0;for(let i=0;i<n;i++){data[i]=sample(i/rate);max=Math.max(max,Math.abs(data[i]));}const b=Buffer.alloc(44+n*2);b.write('RIFF');b.writeUInt32LE(36+n*2,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(rate,24);b.writeUInt32LE(rate*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(n*2,40);for(let i=0;i<n;i++)b.writeInt16LE(Math.round(data[i]/max*peak*32767),44+i*2);writeFileSync(new URL(name+'.wav',root),b);}
// One synthesized felt-piano voice shared by music and musical feedback.
// Rounded hammer attack, quickly softened upper partials and a short room tail.
const period=120,notes=[];
const chords=[[261.63,329.63,392],[261.63,349.23,440],[261.63,329.63,440],[293.66,392,493.88]];
function piano(t,hz,length=3.2){
 if(t<0||t>=length)return 0;
 const envelope=(1-Math.exp(-t*100))*Math.min(1,(length-t)/.35);
 let tone=0;
 for(let h=1;h<=6;h++){
  const stretch=Math.sqrt(1+.00008*h*h);
  tone+=[0,1,.36,.16,.065,.022,.008][h]*Math.exp(-t*(1.35+h*.48))*Math.sin(2*Math.PI*hz*h*stretch*t);
 }
 return tone*envelope;
}
function room(t,hz,length=3.2){return piano(t,hz,length)+.08*piano(t-.11,hz,length-.11)+.04*piano(t-.19,hz,length-.19);}
// Three related phrases: the familiar opening, a quieter answering phrase,
// and open voicings returning gently to the start. No random jumps at the seam.
for(let bar=0;bar<24;bar++){
 const phrase=Math.floor(bar/8),chord=chords[Math.floor((bar%8)/2)],base=bar*5;
 const voicing=phrase===2?[chord[0]/2,chord[1],chord[2]]:chord;
 voicing.forEach((hz,i)=>notes.push([base+i*(phrase===1?.065:.035),hz,phrase===1?.21:.24]));
 if(phrase===0)notes.push([base+1.75,chord[2],.17],[base+3.25,chord[1],.13]);
 else if(phrase===1)notes.push([base+2,chord[1],.15],[base+3.5,chord[0],.12]);
 else notes.push([base+1.5,chord[0],.13],[base+2.75,chord[2],.15],[base+3.65,chord[1],.10]);
}
wav('relax-tide',period,t=>notes.reduce((sum,[at,hz,gain])=>sum+gain*room((t-at+period)%period,hz),0),.29);
// Alternative timbres share the piano's harmony and timing.
function strings(t,hz){
 if(t<0||t>=3.2)return 0;
 const env=Math.min(1,t/.32)*Math.min(1,(3.2-t)/.8)*Math.exp(-t*.45);
 const phase=2*Math.PI*hz*t+.08*Math.sin(2*Math.PI*4.7*t);
 return env*(Math.sin(phase)+.3*Math.sin(phase*2)+.13*Math.sin(phase*3)+.04*Math.sin(phase*4));
}
function chimes(t,hz){
 if(t<0||t>=3.2)return 0;
 return (1-Math.exp(-t*45))*Math.min(1,(3.2-t)/.4)*Math.exp(-t*2)*(Math.sin(2*Math.PI*hz*t)+.18*Math.exp(-t*3)*Math.sin(2*Math.PI*hz*2*t));
}
for(const [name,voice,peak] of [['relax-strings',strings,.27],['relax-chimes',chimes,.29]]){
 wav(name,period,t=>notes.reduce((sum,[at,hz,gain])=>sum+gain*voice((t-at+period)%period,hz),0),peak);
}
// Dry, unpitched contact noise: no oscillator or sliding frequency.
function grain(i){let n=Math.imul(i+17,374761393);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/2147483648-1;}
function tick(t){
 if(t<0||t>.05)return 0;
 const i=Math.floor(t*rate),noise=(grain(i)+.75*grain(i-1)+.4*grain(i-2))/2.15;
 const envelope=Math.exp(-t/.008)+.12*Math.exp(-(((t-.012)/.003)**2));
 return noise*Math.min(1,t/.0015)*envelope*Math.min(1,(.05-t)/.004);
}
// Warm felt-key notes: rounded attack, soft overtones and a short natural decay.
function felt(t,hz,duration=.8){
 if(t<0||t>=duration)return 0;
 const attack=1-Math.exp(-t*65),release=Math.min(1,(duration-t)/.18);
 return attack*release*Math.exp(-t*5)*(Math.sin(2*Math.PI*hz*t)+.1*Math.exp(-t*8)*Math.sin(2*Math.PI*hz*2*t));
}
wav('relax-touch',.09,t=>tick(t),.26);
wav('relax-connect',.09,t=>tick(t),.26);
// Completion has a relaxed four-note melody and a gently resolved final third.
function rewardKey(t,hz){return .8*piano(t,hz,1.35)+.09*piano(t-.09,hz,1.26);}
wav('relax-complete',2,t=>.10*tick(t)+.44*rewardKey(t-.025,329.63)+.40*rewardKey(t-.24,392)+.37*rewardKey(t-.48,523.25)+.48*rewardKey(t-.74,392)+.22*rewardKey(t-.74,329.63),.25);
// Moving on is lower, closer and shorter: two softly damped thumb-plucked notes.
function mutedPluck(t,hz){
 if(t<0||t>=.38)return 0;
 const phase=2*Math.PI*hz*t;
 return (1-Math.exp(-t*180))*Math.exp(-t*13)*Math.min(1,(.38-t)/.08)*(Math.sin(phase)+.24*Math.exp(-t*12)*Math.sin(phase*2)+.10*Math.exp(-t*18)*Math.sin(phase*3));
}
wav('relax-next',.58,t=>.09*tick(t)+mutedPluck(t-.015,293.66)+.85*mutedPluck(t-.18,220),.22);
