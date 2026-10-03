'use client';
import {chapterThemes} from '@/lib/chapters';
import {useState} from 'react';
import {canPlay} from '@/lib/journey';

import {constellationNames as constellations,StarAtlas} from './Constellation';
export function JourneyMap({stars,trial,current,onChoose}:{stars:Record<string,number>;trial:boolean;current:number;onChoose:(i:number)=>void}){
 return <div className="journey-map"><StarAtlas stars={stars}/>{constellations.map((name,chapter)=>{
 const first=chapter*10,earned=Array.from({length:10},(_,i)=>stars[String(first+i+1)]).filter(Boolean).length;
 return <section className={'star-cluster '+(earned===10?'cluster-complete':'')} key={name}><div className="cluster-heading"><h3>{name}</h3><span>{earned===10?'✦ Complete':`${earned}/10 illuminated`}</span></div><p><span className="cluster-focus">{chapterThemes[chapter].focus}</span><br/>{chapterThemes[chapter].practice}{chapter===3&&<> · Three free samples</>}</p><div className="cluster-nodes">{Array.from({length:10},(_,j)=>{
 const i=first+j,paid=i>=33&&!trial,unlocked=canPlay(i,stars,trial),done=!!stars[String(i+1)];
 return <button key={i} className={'map-star '+(done?'awakened ':'')+(current===i+1?'current':'')} style={{'--star-offset':`${[12,0,16,4,12][j%5]}px`} as React.CSSProperties} aria-current={current===i+1?'step':undefined} disabled={!paid&&!unlocked} aria-label={`Puzzle ${i+1}, ${done?stars[String(i+1)]+' stars, replay available, ':''}${paid?'preview unlock required':unlocked?'available':'finish previous puzzle'}`} onClick={()=>onChoose(i)}><span aria-hidden="true">{done?'✦':paid?'◇':'○'}</span><strong>{i+1}</strong>{done&&<small>Replay</small>}</button>;
 })}</div></section>;
 })}</div>;
}

export function DailyCalendar({stars,date,onPlay}:{stars:Record<string,number>;date:Date;onPlay:()=>void}){
 const [offset,setOffset]=useState(0);
 const month=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+offset,1));
 const total=new Date(Date.UTC(month.getUTCFullYear(),month.getUTCMonth()+1,0)).getUTCDate();
 const prefix=month.toISOString().slice(0,7),today=date.toISOString().slice(0,10);
 const count=Object.keys(stars).filter(k=>k.startsWith('daily-'+prefix)).length;
 return <section className="daily-calendar"><div className="calendar-heading"><button className="quiet" aria-label="Previous month" onClick={()=>setOffset(o=>o-1)}>‹</button><h3>{month.toLocaleDateString(undefined,{month:'long',year:'numeric',timeZone:'UTC'})}</h3><button className="quiet" aria-label="Next month" disabled={offset>=0} onClick={()=>setOffset(o=>o+1)}>›</button></div><p>{count} daily moments completed · UTC calendar</p><div className="calendar-grid">{['S','M','T','W','T','F','S'].map((s,i)=><span key={'w'+i} aria-hidden="true">{s}</span>)}{Array.from({length:month.getUTCDay()},(_,i)=><span key={'empty'+i}/>)}{Array.from({length:total},(_,i)=>{
 const day=prefix+'-'+String(i+1).padStart(2,'0'),done=!!stars['daily-'+day];return <span key={day} className={(done?'daily-done ':'')+(day===today?'today':'')} aria-label={`${day}${done?', completed':''}${day===today?', today':''}`}>{i+1}{done&&<small aria-hidden="true">✦</small>}</span>;
 })}</div><p>Every completed day stays in your sky. Sign in to earn daily, weekly and monthly streak rewards.</p><button className="primary-button" onClick={onPlay}>Play today’s light</button></section>;
}
