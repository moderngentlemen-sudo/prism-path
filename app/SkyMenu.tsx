'use client';
import {useState} from 'react';
import {Constellation,StarAtlas,constellationNames} from './Constellation';
import {constellationCounts} from '@/lib/constellation-progress';
import './sky-menu.css';
export function constellationProgress(stars:Record<string,number>){const counts=constellationCounts(stars);return constellationNames.map((name,g)=>({name,group:g,count:counts[g]}));}
export function SkyMenu({stars,initialGroup,revealGroup=-1}:{stars:Record<string,number>;initialGroup?:number;revealGroup?:number}){
 const progress=constellationProgress(stars),[selected,setSelected]=useState(()=>initialGroup!==undefined&&initialGroup>=0&&initialGroup<9?initialGroup:progress.find(p=>p.count>0&&p.count<10)?.group??progress.find(p=>p.count<10)?.group??0);
 return <div className="sky-menu"><p className="sky-menu-summary">{progress.reduce((sum,p)=>sum+p.count,0)} stars illuminated · {progress.filter(p=>p.count===10).length} constellations complete</p><Constellation id={selected*10+1} stars={stars}/><div className="constellation-picker" aria-label="Choose a constellation">{progress.map(p=><button key={p.group} type="button" aria-pressed={p.group===selected} onClick={()=>setSelected(p.group)}><strong>{p.name}</strong><span>{p.count===10?'Complete':p.count===0?'Not started':`${p.count} of 10 stars`}</span><meter min={0} max={10} value={p.count} aria-label={`${p.name}: ${p.count} of 10 stars`}/></button>)}</div><h3>Your connected star map</h3><StarAtlas stars={stars} revealGroup={revealGroup}/></div>;
}
