import {validateShots} from './analytics.js';
export function adaptMatch(events,match){
 const teams=[match.home_team.home_team_name,match.away_team.away_team_name];
 const shots=events.filter(e=>e.type?.name==='Shot'&&e.period>=1&&e.period<=4).map(e=>{
  const index=teams.indexOf(e.team?.name);
  if(index<0||!Array.isArray(e.location)||!Number.isFinite(e.shot?.statsbomb_xg))throw Error('Invalid StatsBomb shot');
  return {x:e.location[0]*105/120,y:e.location[1]*68/80,minute:e.minute,team:index===0?'home':'away',player:e.player.name,bodyPart:e.shot.body_part.name==='Head'?'head':['Left Foot','Right Foot'].includes(e.shot.body_part.name)?'foot':'other',goal:e.shot.outcome.name==='Goal',xg:e.shot.statsbomb_xg};
 });
 return {teams,date:match.match_date,matchId:match.match_id,shots:validateShots(shots)};
}
