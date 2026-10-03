export function constellationCounts(stars:Record<string,number>){return Array.from({length:9},(_,g)=>Array.from({length:10},(_,i)=>stars[String(g*10+i+1)]>0).filter(Boolean).length);}
