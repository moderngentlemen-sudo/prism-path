export const relaxInstruments = [
 {id:'piano',label:'Soft piano',file:'relax-tide'},
 {id:'strings',label:'Soft strings',file:'relax-strings'},
 {id:'chimes',label:'Gentle chimes',file:'relax-chimes'},
] as const;
export type RelaxInstrument = typeof relaxInstruments[number]['id'];
export function restoreInstrument(value:unknown):RelaxInstrument {
 return relaxInstruments.find(item=>item.id===value)?.id??'piano';
}
export function instrumentUrl(value:RelaxInstrument){
 return '/audio/'+relaxInstruments.find(item=>item.id===value)!.file+'.wav?v=7';
}
