'use client';
import {useEffect,useRef,useState} from 'react';
import {energyEdges} from '@/lib/energy';
import type {JourneyPuzzle} from '@/lib/journey';

export function EnergyStream({board,puzzle,signal,color,gentle=false,still=false}:{gentle?:boolean;still?:boolean;board:number[];puzzle:JourneyPuzzle;signal:{lit:Set<number>;depth:Record<number,number>;colors:Record<number,string[]>;solved:boolean};color:string}){
 const ref=useRef<SVGSVGElement>(null),[layout,setLayout]=useState({width:0,height:0,pad:0,gap:0});
 useEffect(()=>{const parent=ref.current?.parentElement;if(!parent)return;const measure=()=>{const css=getComputedStyle(parent);setLayout({width:parent.clientWidth,height:parent.clientHeight,pad:parseFloat(css.paddingLeft),gap:parseFloat(css.columnGap)||0});};measure();const observer=new ResizeObserver(measure);observer.observe(parent);return()=>observer.disconnect();},[puzzle.size]);
 const {width,height,pad,gap}=layout,n=puzzle.size,cell=(width-2*pad-(n-1)*gap)/n;
 const point=(i:number)=>({x:pad+cell/2+(i%n)*(cell+gap),y:pad+cell/2+Math.floor(i/n)*(cell+gap)});
 const tint=(i:number)=>signal.colors[i]?.includes('violet')?'#c6a5ff':signal.colors[i]?.includes('amber')?'#ffc777':color;
 if(!width)return <svg ref={ref} className="energy-overlay" aria-hidden="true"/>;
 const first=point(0),last=point(board.length-1),exit=signal.lit.has(board.length-1)&&!!(board.at(-1)!&2);
 const stream=(key:string,d:string,paint:string,delay=0)=><g key={key} style={{'--energy-color':paint,'--arrival-delay':`${delay}ms`} as React.CSSProperties}><path className="energy-halo" d={d}/><path className="energy-body" d={d}/><path className="energy-current" d={d}/>{!still&&Array.from({length:gentle?8:12},(_,i)=><circle key={i} className="beam-particle" r={[.55,.8,.45,1.05][i%4]} cy={((i*7)%11-5)*.7}><animateMotion path={d} rotate="auto" dur={`${(gentle?6:2.1)+(i%5)*.19}s`} begin={`${-i*.237}s`} repeatCount="indefinite"/><animate attributeName="opacity" values={`0;${i%4===3?.85:.48};.25;0`} keyTimes="0;.2;.75;1" dur={`${(gentle?6:2.1)+(i%5)*.19}s`} begin={`${-i*.237}s`} repeatCount="indefinite"/></circle>)}</g>;
 return <svg ref={ref} className="energy-overlay" viewBox={`0 0 ${width} ${height}`} aria-hidden="true">
 {energyEdges(board,n,signal).map(({from,to})=>{const a=point(from),b=point(to);return stream(`${from}-${to}`,`M${a.x} ${a.y} L${b.x} ${b.y}`,tint(to),Math.min(signal.depth[to]||0,14)*35);})}
 {stream('entry',`M-14 ${first.y} L${board[0]&8?first.x:pad-3} ${first.y}`,color)}
 {exit&&stream('exit',`M${last.x} ${last.y} L${width+14} ${last.y}`,tint(board.length-1))}
 <g className="energy-port inlet" style={{color}}><circle cx={-14} cy={first.y} r={8}/><path d={`M-17 ${first.y-3} l4 3 -4 3`}/></g>
 <g className={'energy-port outlet '+(exit?'powered':'')} style={{color:exit?tint(board.length-1):'#78909a'}}><circle cx={width+14} cy={last.y} r={8}/><path d={`M${width+11} ${last.y-3} l4 3 -4 3`}/></g>
 {signal.solved&&!gentle&&<g className="energy-celebration" style={{color}}>
  <rect className="completion-wash" x={1} y={1} width={width-2} height={height-2} rx={18}/>
  <g transform={`translate(${width+14} ${last.y})`}>
   {[0,1].map(i=><circle key={i} className="completion-ripple" r={9} style={{animationDelay:`${.15+i*.22}s`}}/>)}
   {Array.from({length:12},(_,i)=>{const angle=i*Math.PI*2/12;return <circle key={i} className="completion-mote" r={i%3===0?2.3:1.5} style={{'--spark-x':`${Math.cos(angle)*30}px`,'--spark-y':`${Math.sin(angle)*30}px`,animationDelay:`${.15+(i%3)*.045}s`} as React.CSSProperties}/>;})}
  </g>
 </g>}
 </svg>;
}
