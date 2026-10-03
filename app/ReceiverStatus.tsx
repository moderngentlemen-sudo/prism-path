import type {JourneyPuzzle} from '@/lib/journey';
export function ReceiverStatus({puzzle,colors,exitReached}:{puzzle:JourneyPuzzle;colors:Record<number,string[]>;exitReached:boolean}){
 if(!puzzle.receivers.length)return null;
 const missing=puzzle.receivers.filter(r=>!colors[r.at]?.includes(r.color));
 return <section className={'receiver-status '+(exitReached&&missing.length?'receiver-incomplete':'')} aria-label="Receiver objectives">
  <strong>◇ Receivers need light too</strong>
  <p>Split the beam to light every receiver and the exit together. ◇ needs mint light; A needs amber; V needs violet.</p>
  <div className="receiver-checklist">{puzzle.receivers.map(r=>{const active=colors[r.at]?.includes(r.color),wrong=!!colors[r.at]?.length&&!active;return <span key={`${r.at}-${r.color}`} className={active?'receiver-ready':'receiver-waiting'}><b>{active?'✓':r.color==='mint'?'◇':r.color==='amber'?'A':'V'}</b> Row {Math.floor(r.at/puzzle.size)+1}, column {r.at%puzzle.size+1} · {active?'Activated':wrong?`Needs ${r.color} light`:'Waiting for light'}</span>;})}</div>
  <div role="status">{exitReached&&missing.length>0&&<p className="receiver-warning"><strong>The exit has light — {missing.length===1?'one receiver still needs':'receivers still need'} light.</strong> Follow the highlighted {missing.length===1?'receiver':'receivers'} and connect {missing.length===1?'it':'them'} with the required color to finish.</p>}</div>
 </section>;
}
