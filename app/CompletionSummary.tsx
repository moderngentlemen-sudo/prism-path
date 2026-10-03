'use client';
import {useEffect,useState} from 'react';
import {Star} from 'lucide-react';
import {Constellation,StarAtlas} from './Constellation';
import type {puzzleScore} from '@/lib/scoring';
import './completion.css';

export function CompletionSummary({score,rating,moves,hints,puzzleId,daily,stars,fresh,milestone,best,total,onOpen}:{
 score:ReturnType<typeof puzzleScore>;rating:number;moves:number;hints:number;puzzleId:number;daily:boolean;
 stars:Record<string,number>;fresh:boolean;milestone:boolean;best:number;total:number;onOpen:()=>void;
}){
 const [skyReady,setSkyReady]=useState(!fresh);
 useEffect(()=>{
  const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
  if(!fresh||preference.matches){setSkyReady(true);return;}
  const timer=setTimeout(()=>setSkyReady(true),2600);
  const changed=()=>{if(preference.matches)setSkyReady(true);};preference.addEventListener('change',changed);
  return()=>{clearTimeout(timer);preference.removeEventListener('change',changed);};
 },[fresh]);
 return <section className="completion-summary" aria-label="Puzzle results">
  <div className="completion-score" role="status">
   <span className="eyebrow">PATH COMPLETE</span><strong>{score.points.toLocaleString()} points</strong>
   <div className="earned-stars" aria-label={`${rating} stars`}>{[1,2,3].map(n=><Star key={n} size={18} fill={n<=rating?'currentColor':'none'}/>)}</div>
   <p>{moves} rotations{hints?` · ${hints} ${hints===1?'hint':'hints'}`:''}{score.targetBonus>0?' · Move target achieved':''}</p>
  </div>
  <dl className="completion-breakdown">
   <div><dt>Move points</dt><dd>{score.base.toLocaleString()}</dd></div>
   <div><dt>Pulse multiplier</dt><dd>{score.multiplier.toFixed(2)}×</dd></div>
   {score.targetBonus>0&&<div><dt>Move target bonus</dt><dd>+{score.targetBonus}</dd></div>}
  </dl>
  <p className="completion-best">Best {best.toLocaleString()} · Journey total {total.toLocaleString()}</p>
  {!daily&&(skyReady?<div className="completion-sky">
   <Constellation id={puzzleId} stars={stars} reveal={fresh} onOpen={onOpen}/>
   {milestone&&<StarAtlas stars={stars} revealGroup={Math.floor((puzzleId-1)/10)} onOpen={onOpen}/>}
  </div>:<div className="star-on-its-way" role="status"><span aria-hidden="true">✦</span> A new star is on its way to your sky.</div>)}
  {daily&&<p className="completion-best">Today’s light is yours.</p>}
 </section>;
}
