'use client';
import {useEffect,useId,useRef,useState,type CSSProperties} from 'react';
export const constellationNames=['The Lantern','The Compass','The Bridge','The Comet','The Prism','The Crown','The Twin Stars','The Voyager','The Aurora'];
const shapes=[
 [[90,18],[130,18],[150,48],[140,92],[110,112],[80,92],[70,48],[85,35],[110,48],[110,85]],
 [[110,12],[125,48],[180,65],[125,80],[110,118],[95,80],[40,65],[95,48],[110,35],[110,65]],
 [[22,95],[40,65],[65,40],[90,30],[115,35],[140,50],[165,75],[195,95],[140,95],[65,95]],
 [[25,110],[60,90],[90,70],[125,50],[155,20],[185,40],[175,70],[145,65],[105,45],[55,35]],
 [[110,15],[145,58],[180,100],[110,100],[40,100],[75,58],[110,65],[155,65],[180,45],[200,35]],
 [[25,40],[55,65],[75,20],[110,60],[145,20],[165,65],[195,40],[175,105],[110,105],[45,105]],
 [[55,20],[80,55],[55,95],[30,55],[90,60],[115,65],[155,30],[180,65],[155,105],[130,65]],
 [[25,90],[60,65],[95,75],[130,45],[165,60],[190,25],[150,15],[120,30],[100,20],[75,40]],
 [[20,90],[40,45],[65,65],[85,20],[105,60],[125,30],[145,80],[165,40],[185,65],[200,100]],
];
export function Constellation({id,stars,reveal=false,onOpen}:{id:number;stars:Record<string,number>;reveal?:boolean;onOpen?:()=>void}){
 const group=Math.floor((id-1)/10),first=group*10+1,points=shapes[group],count=points.filter((_,i)=>!!stars[String(first+i)]).length,complete=count===10;
 return <section className={'sky-reward '+(complete?'sky-complete ':'')+(reveal?'sky-reveal':'')}>
  <div className="sky-heading"><span>{complete?'CONSTELLATION COMPLETE':reveal?'A STAR AWAKENS':'YOUR CONSTELLATION'}</span><span>{count} / 10</span></div>
  <h3>{constellationNames[group]}</h3>
  <svg viewBox="0 0 220 130" role="img" aria-label={`${constellationNames[group]}, ${count} of 10 stars illuminated`}>
   {points.map(([x,y],i)=>stars[String(first+i)]&&<g key={`detail-${i}`} className="sky-filigree" aria-hidden="true">{[0,1,2].map(j=>{const dx=Math.cos(i*2+j*2.1)*(9+j*4),dy=Math.sin(i*2+j*2.1)*(7+j*3);return <g key={j}><line x1={x} y1={y} x2={x+dx} y2={y+dy}/><circle cx={x+dx} cy={y+dy} r={.7+j*.25}/></g>;})}</g>)}
   {complete&&reveal&&<g className="sky-finale" aria-hidden="true">{[0,1,2].map(i=><circle key={i} cx={110} cy={65} r={12} style={{animationDelay:`${i*.3}s`}}/>)}</g>}
   <svg x={45} y={0} width={130} height={130} viewBox={`${group%3*100} ${Math.floor(group/3)*100} 100 100`} overflow="hidden" className="sky-art" style={{opacity:complete?.9:count/10*.3}} aria-hidden="true"><image href="/constellation-art.png" width={300} height={300}/></svg>
   {points.slice(1).map(([x,y],i)=>{const a=points[i],lit=!!stars[String(first+i)]&&!!stars[String(first+i+1)],fresh=reveal&&(id===first+i||id===first+i+1);return <line key={i} x1={a[0]} y1={a[1]} x2={x} y2={y} pathLength={1} className={(lit?'sky-link-lit ':'sky-link ')+(lit&&fresh?'sky-link-new':'')}/>;})}
   {reveal&&<path className="star-flight" pathLength={1} d={`M110 -12 Q110 35 ${points[(id-1)%10][0]} ${points[(id-1)%10][1]}`} aria-hidden="true"/>}
   {points.map(([x,y],i)=>{const lit=!!stars[String(first+i)],fresh=reveal&&id===first+i;return <g key={i} className={fresh?'star-arriving':''} transform={`translate(${x} ${y})`}><circle r={lit?4:2} className={lit?'sky-star-lit':'sky-star'}/>{lit&&<path className={'sky-cross '+(fresh?'sky-star-new':'')} d="M-7 0H7M0-7V7"/>}{fresh&&<circle r={6} className="sky-star-ripple"/>}</g>;})}
  </svg>
  <p>{complete?'All ten stars are yours. This constellation stays in your sky.':`${10-count} more ${count===9?'puzzle':'puzzles'} to complete ${constellationNames[group]}.`}</p>
  {onOpen&&<button className="quiet" onClick={onOpen}>Explore your sky <span aria-hidden="true">↗</span></button>}
 </section>;
}
export function StarAtlas({stars,revealGroup=-1,onOpen}:{stars:Record<string,number>;revealGroup?:number;onOpen?:()=>void}){
 const maskId=useId().replace(/:/g,'');
 const surface=useRef<HTMLElement|null>(null),[inView,setInView]=useState(false);
 useEffect(()=>{
  if(revealGroup<0)return;
  if(typeof IntersectionObserver==='undefined'){setInView(true);return;}
  const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){setInView(true);observer.disconnect();}},{threshold:.15});
  if(surface.current)observer.observe(surface.current);return()=>observer.disconnect();
 },[revealGroup]);
 const done=shapes.map((_,g)=>Array.from({length:10},(_,i)=>!!stars[String(g*10+i+1)]).every(Boolean));
 const count=done.filter(Boolean).length;
 const picture=<svg viewBox="0 0 660 495" role="img" aria-label={`Connected star picture, ${count} of nine regions revealed`}>
  <defs><mask id={maskId} maskUnits="userSpaceOnUse" x={0} y={0} width={660} height={495}>
   <rect width={660} height={495} fill="black"/>
   {done.map((lit,g)=>lit&&<rect key={g} x={g%3*220} y={Math.floor(g/3)*165} width={220} height={165} fill="white" className={inView&&g===revealGroup?'atlas-region-reveal':''}/>)}
  </mask></defs>
  <g className={inView&&revealGroup>=0?'atlas-camera':''} style={{'--region-origin':`${(revealGroup%3*220+110)/660*100}% ${(Math.floor(revealGroup/3)*165+82.5)/495*100}%`} as CSSProperties}>
  <rect width={660} height={495} fill="#08151b"/>
  <image href="/star-map-panorama.png" width={660} height={495} opacity={.035}/>
  <image href="/star-map-panorama.png" width={660} height={495} mask={`url(#${maskId})`}/>
  {done.map((lit,g)=>!lit&&<g key={g} opacity={.35}><circle cx={g%3*220+110} cy={Math.floor(g/3)*165+82} r={2} fill="#d6ebcd"/><text x={g%3*220+110} y={Math.floor(g/3)*165+108} textAnchor="middle">{g+1}</text></g>)}
  {inView&&revealGroup>=0&&<rect className="atlas-new-region" x={revealGroup%3*220+3} y={Math.floor(revealGroup/3)*165+3} width={214} height={159} rx={8}/>}
  </g>
 </svg>;
 return <section ref={surface} className="star-atlas"><div className="sky-heading"><span>{count===9?'YOUR SKY IS COMPLETE':'ONE SKY, SLOWLY REVEALED'}</span><span>{count} / 9</span></div>
 <p className={revealGroup>=0?'atlas-change':''}>{revealGroup>=0?`${constellationNames[revealGroup]} revealed · ${count} of 9 regions now connected.`:'Each completed constellation reveals part of one connected celestial world.'}</p>
 {onOpen?<button className="atlas-open" onClick={onOpen} aria-label="Open your star map and inspect the whole picture">{picture}<span>Tap to explore your star map ↗</span></button>:picture}
 <div className="atlas-legend">{constellationNames.map((name,g)=><span key={name} className={(done[g]?'revealed ':'')+(g===revealGroup?'just-revealed':'')}>{done[g]?'✦':'○'} {name}{g===revealGroup?' · New':''}</span>)}</div>
 <p>{count===9?'All nine constellations form one complete picture.':'Your revealed regions stay in your sky. Finish the remaining constellations to uncover the full picture.'}</p></section>;
}
