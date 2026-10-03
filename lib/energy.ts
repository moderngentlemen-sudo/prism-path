// Only join reciprocal, powered ports. Direct motion away from the entrance.
export function energyEdges(board:number[],size:number,signal:{lit:Set<number>;depth:Record<number,number>}){
 const result:{from:number;to:number}[]=[];
 for(let i=0;i<board.length;i++){
  if(!signal.lit.has(i))continue;
  for(const [j,bit,opposite] of [[i%size<size-1?i+1:-1,2,8],[i+size<board.length?i+size:-1,4,1]]){
   if(j<0||!signal.lit.has(j)||!(board[i]&bit)||!(board[j]&opposite))continue;
   const forward=(signal.depth[i]??0)<=(signal.depth[j]??0);result.push({from:forward?i:j,to:forward?j:i});
  }
 }
 return result;
}
export const newlyLit=(before:Set<number>,after:Set<number>)=>[...after].filter(i=>!before.has(i));
