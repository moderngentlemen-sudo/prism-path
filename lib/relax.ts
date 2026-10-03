import {makePuzzle,rotate} from './game.ts';
import type {JourneyPuzzle} from './journey.ts';
export const relaxPaths=[
 {size:3,label:'Small paths',description:'A close, simple path · 3 × 3'},
 {size:4,label:'Flowing paths',description:'A little more room to wander · 4 × 4'},
 {size:5,label:'Open exploration',description:'A spacious path with just a few turns · 5 × 5'},
] as const;
export type RelaxSize=typeof relaxPaths[number]['size'];
export function relaxPuzzle(index:number,size=3):JourneyPuzzle{
 const p=makePuzzle(10000+index,size);
 // A short repair, without branches, receivers, fixed tiles or escalating difficulty.
 p.initial=[...p.solution];
 const available=p.path.filter(i=>rotate(p.solution[i])!==p.solution[i]);
 const repairs=size===3?3:size===5?4:5;
 for(let n=0;n<Math.min(repairs,available.length);n++){
  const at=available[Math.floor(n*available.length/repairs)];p.initial[at]=rotate(rotate(rotate(p.solution[at])));
 }
 return {...p,stage:1,paceSeconds:0,locked:[],filters:{},receivers:[],lesson:'Let the openings meet. There is no hurry.'};
}
export type RelaxSave={index:number;size:RelaxSize;nextSize?:RelaxSize;board:number[];lit:number[]};
export function restoreRelax(raw:unknown):RelaxSave{
 const blank:RelaxSave={index:0,size:3,board:relaxPuzzle(0).initial,lit:[]};
 if(!raw||typeof raw!=='object')return blank;
 const r=raw as RelaxSave;if(!Number.isSafeInteger(r.index)||r.index<0||r.index>1000000)return blank;
 const size=r.size===5?5:r.size===4?4:3,p=relaxPuzzle(r.index,size);
 const valid=Array.isArray(r.board)&&r.board.length===p.initial.length&&r.board.every((v,i)=>{let m=p.initial[i];for(let n=0;n<4;n++){if(v===m)return true;m=rotate(m);}return false;});
 return {index:r.index,size,...([3,4,5].includes(r.nextSize!)?{nextSize:r.nextSize}:{}),board:valid?r.board:p.initial,lit:Array.isArray(r.lit)?[...new Set(r.lit.filter(n=>Number.isInteger(n)&&n>=0&&n<90))]:[]};
}
