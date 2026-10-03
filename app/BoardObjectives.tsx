import {Check,LockKeyhole} from 'lucide-react';
import type {JourneyPuzzle,illuminate} from '@/lib/journey';
import './objectives.css';
export function BoardObjectives({puzzle,signal,exitReached,onLocate}:{puzzle:JourneyPuzzle;signal:ReturnType<typeof illuminate>;exitReached:boolean;onLocate:(at:number)=>void}){
 if(!puzzle.locked.length&&!puzzle.receivers.length)return null;
 const objectives=[...puzzle.locked.map(at=>({at,key:`lock-${at}`,label:'Fixed tile',symbol:'lock',active:signal.lit.has(at),need:'light'})),...puzzle.receivers.map(r=>({at:r.at,key:`${r.at}-${r.color}`,label:`${r.color} receiver`,symbol:r.color==='mint'?'◇':r.color==='amber'?'A':'V',active:!!signal.colors[r.at]?.includes(r.color),need:`${r.color} light`}))];
 const remaining=objectives.filter(o=>!o.active).length;
 return <section className={'board-objectives'+(exitReached&&remaining?' objectives-waiting':'')} aria-label="Required connections">
  <div className="objective-heading"><strong>Required connections</strong><span>{objectives.length-remaining} / {objectives.length} ready</span></div>
  <div className="objective-chips">{objectives.map(o=><button key={o.key} className={'objective-chip'+(o.active?' objective-ready':'')} onClick={()=>onLocate(o.at)} aria-label={`${o.label}, row ${Math.floor(o.at/puzzle.size)+1}, column ${o.at%puzzle.size+1}: ${o.active?'activated':`needs ${o.need}`}. Highlight tile.`}><b aria-hidden="true">{o.symbol==='lock'?<LockKeyhole size={14}/>:o.symbol}</b><span>{o.label}<small>{o.active?'Activated':`Needs ${o.need}`}</small></span>{o.active&&<Check size={14} aria-hidden="true"/>}</button>)}</div>
  <p className="objective-message" role="status">{exitReached&&remaining>0&&`The exit has light. Connect ${remaining===1?'the remaining marked tile':`the ${remaining} remaining marked tiles`} to finish.`}</p>
  <details><summary>About the markers</summary><p>Tap a marker to highlight its tile. Fixed tiles cannot turn; guide light through their neighbors. Diamond receivers need mint light. A means amber; V means violet. A P prism changes the light’s color. The exit and every marked tile must be lit together.</p></details>
 </section>;
}
