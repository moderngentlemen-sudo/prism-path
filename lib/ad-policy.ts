export type AdMode='banner'|'between'|'both';
export class AdBreakPolicy {
 private seen=new Set<string>();private completed=0;private last:number;
 constructor(now=Date.now()){this.last=now;}
 record(key:string,tutorial:boolean){if(tutorial||this.seen.has(key))return;this.seen.add(key);this.completed++;}
 ready(mode:AdMode,now=Date.now(),adFree=false){return !adFree&&mode!=='banner'&&this.completed>=3&&now-this.last>=120000;}
 shown(now=Date.now()){this.completed=0;this.last=now;}
}
