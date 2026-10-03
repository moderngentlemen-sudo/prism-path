import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {constellationCounts} from '../lib/constellation-progress.ts';
test('Relax audio assets contain audible PCM without clipping or a long silent opening',()=>{
 for(const name of ['relax-tide','relax-strings','relax-chimes','relax-touch','relax-next','relax-connect','relax-complete']){
  const b=readFileSync(new URL('../public/audio/'+name+'.wav',import.meta.url));assert.equal(b.toString('ascii',0,4),'RIFF');assert.equal(b.readUInt16LE(20),1);assert.equal(b.readUInt32LE(24),22050);
  let peak=0,power=0;const n=Math.min((b.length-44)/2,22050);for(let i=0;i<n;i++){const sample=b.readInt16LE(44+i*2)/32768;peak=Math.max(peak,Math.abs(sample));power+=sample*sample;}
  assert.ok(peak<.95);assert.ok(Math.sqrt(power/n)>.02,name+' must be audible in its first second');
 }
 const loop=readFileSync(new URL('../public/audio/relax-tide.wav',import.meta.url));assert.ok(Math.abs(loop.readInt16LE(44)-loop.readInt16LE(loop.length-2))/32768<.05);
 for(const name of ['relax-tide','relax-strings','relax-chimes']){
  const track=readFileSync(new URL('../public/audio/'+name+'.wav',import.meta.url));assert.equal(track.readUInt32LE(40)/22050/2,120);
  const phrase=(n:number)=>track.subarray(44+n*40*22050*2,44+(n+1)*40*22050*2);
  assert.notDeepEqual(phrase(0),phrase(1));assert.notDeepEqual(phrase(1),phrase(2));
 }
});
test('Star menu counts partial constellations independently of puzzle star ratings and daily scores',()=>{
 const counts=constellationCounts({'1':3,'2':1,'10':2,'11':3,'90':2,'daily-2026-09-12':3});assert.deepEqual(counts,[3,1,0,0,0,0,0,0,1]);
 assert.deepEqual(constellationCounts(Object.fromEntries(Array.from({length:90},(_,i)=>[String(i+1),1]))),Array(9).fill(10));
});

test('Instrument preferences default to piano and resolve only bundled tracks',async()=>{
 const {restoreInstrument,instrumentUrl,relaxInstruments}=await import('../lib/relax-instruments.ts');
 for(const value of [undefined,null,'unknown',42])assert.equal(restoreInstrument(value),'piano');
 for(const item of relaxInstruments){assert.equal(restoreInstrument(item.id),item.id);const path=instrumentUrl(item.id).split('?')[0];assert.ok(readFileSync(new URL('../public'+path,import.meta.url)).length>44);}
});
