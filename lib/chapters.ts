// These describe the existing chapter mechanics without changing puzzle identities.
export const chapterThemes=[
 {focus:'Find the path',practice:'Read corners and follow matching openings.',finale:'Bring the whole route together.'},
 {focus:'Follow the fixed stars',practice:'Plan around tiles that cannot turn.',finale:'Carry light through the fixed route.'},
 {focus:'Let the light branch',practice:'Keep a receiver and the exit lit together.',finale:'Join the branches into one connected path.'},
 {focus:'Explore After hours',practice:'Look beyond the exit for every required connection.',finale:'Bring every required tile into the glow.'},
 {focus:'A change of color',practice:'Follow a prism into its matching receiver.',finale:'Keep color and connections working together.'},
 {focus:'Trace the color',practice:'Notice where the light changes as it travels.',finale:'Connect the full route in the right colors.'},
 {focus:'Two prisms, one path',practice:'Trace amber into violet and check each receiver.',finale:'Bring both prism colors into balance.'},
 {focus:'A connected sky',practice:'Read the whole board before choosing a branch.',finale:'Light every receiver along the way.'},
 {focus:'The final picture',practice:'Bring fixed tiles, branches and prisms together.',finale:'One last connection to complete the sky.'},
] as const;
export function chapterFocus(id:number){
 const theme=chapterThemes[Math.min(8,Math.max(0,Math.floor((id-1)/10)))];
 return id%10===0?`Constellation finale · ${theme.finale}`:theme.focus;
}
