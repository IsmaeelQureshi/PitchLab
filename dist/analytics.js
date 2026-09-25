/** Coordinates: meters on a 105 × 68 pitch, attacking toward x=105. */
export function expectedGoals({x,y,bodyPart='foot',xg}) {
  if(Number.isFinite(xg)&&xg>=0&&xg<=1)return xg;
  const distance=Math.hypot(105-x,34-y);
  const a=[105-x,30.34-y], b=[105-x,37.66-y];
  const angle=Math.atan2(Math.abs(a[0]*b[1]-a[1]*b[0]),a[0]*b[0]+a[1]*b[1]);
  // Illustrative coefficients, not trained or calibrated on real match data.
  return 1/(1+Math.exp(-(-1.2-0.075*distance+1.8*angle-(bodyPart==='head'?0.65:0))));
}
export function validateShots(data) {
  if(!Array.isArray(data)||data.length>5000) throw Error('Provide a JSON array with at most 5,000 shots.');
  return data.map((s,i)=>{
    if(!s||typeof s!=='object'||!Number.isFinite(s.x)||s.x<0||s.x>105||!Number.isFinite(s.y)||s.y<0||s.y>68||!Number.isFinite(s.minute)||s.minute<0||s.minute>130||!['home','away'].includes(s.team)||!['foot','head','other'].includes(s.bodyPart)||typeof s.goal!=='boolean'||typeof s.player!=='string'||s.player.length>80) throw Error(`Shot ${i+1}: invalid coordinates, minute, team, bodyPart, goal, or player.`);
    if(s.xg!==undefined&&(!Number.isFinite(s.xg)||s.xg<0||s.xg>1))throw Error(`Shot ${i+1}: xg must be between 0 and 1.`);
    return {...(s.xg!==undefined?{xg:s.xg}:{}),id:i+1,x:s.x,y:s.y,minute:s.minute,team:s.team,bodyPart:s.bodyPart,goal:s.goal,player:s.player};
  });
}
/** Exact Poisson-binomial PMF. O(n²) time, O(n) memory. */
export function goalDistribution(probabilities) {
  const p=[1];
  for(const q of probabilities){
    if(!Number.isFinite(q)||q<0||q>1) throw Error('Probabilities must be between 0 and 1.');
    p.push(0);
    for(let k=p.length-1;k>=0;k--) p[k]=p[k]*(1-q)+(k?p[k-1]*q:0);
  }
  return p;
}
export function outcomes(home,away){
  const h=goalDistribution(home),a=goalDistribution(away);
  let homeWin=0,draw=0,awayWin=0;
  h.forEach((p,i)=>a.forEach((q,j)=>{if(i>j)homeWin+=p*q;else if(i===j)draw+=p*q;else awayWin+=p*q;}));
  return {homeWin,draw,awayWin};
}
export function summarize(shots){
  const teams=['home','away'].map(team=>{const list=shots.filter(s=>s.team===team);return {team,shots:list.length,goals:list.filter(s=>s.goal).length,xg:list.reduce((v,s)=>v+expectedGoals(s),0)};});
  return {teams,probabilities:outcomes(...['home','away'].map(t=>shots.filter(s=>s.team===t).map(expectedGoals)))};
}
