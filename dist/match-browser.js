import {adaptMatch} from './statsbomb.js';

// Read the public catalog directly so new open-data releases become available.
const base='https://raw.githubusercontent.com/hudl/open-data/master/data';
export async function getData(path,signal){
 const response=await fetch(`${base}/${path}`,{signal});
 if(!response.ok)throw Error(`Data download failed (${response.status}).`);
 const data=await response.json();
 if(!Array.isArray(data))throw Error('Unexpected data format.');
 return data;
}
export function initMatchBrowser(onLoad){
 const $=id=>document.getElementById(id);
 const competition=$('competition'),season=$('season'),match=$('match'),load=$('load-match'),retry=$('retry-catalog'),status=$('catalog-status');
 let catalog=[],matches=[],catalogRequest,matchRequest,eventRequest;
 function options(select,items,placeholder){
  select.replaceChildren(new Option(placeholder,''),...items.map(([value,label])=>new Option(label,String(value))));
  select.disabled=!items.length;
 }
 function cancelLoad(){eventRequest?.abort();eventRequest=null;load.disabled=!match.value;}
 function clearMatches(){matchRequest?.abort();cancelLoad();matches=[];options(match,[],'Choose a season');load.disabled=true;}
 function failure(error){if(error.name!=='AbortError'){status.textContent=`${error.message} Your current analysis is unchanged. Try again.`;retry.hidden=false;}}
 async function catalogLoad(){
  catalogRequest?.abort();const request=catalogRequest=new AbortController();retry.hidden=true;
  status.textContent='Loading competitions…';competition.disabled=true;season.disabled=true;clearMatches();
  try{
   catalog=await getData('competitions.json',request.signal);
   if(request!==catalogRequest)return;
   const unique=new Map(catalog.map(c=>[c.competition_id,`${c.country_name} · ${c.competition_name} · ${c.competition_gender}`]));
   options(competition,[...unique].sort((a,b)=>a[1].localeCompare(b[1])),'Choose a competition');
   options(season,[],'Choose a competition');status.textContent='Choose a competition, season, and match to analyze.';
  }catch(error){failure(error);}
 }
 competition.onchange=()=>{
  clearMatches();retry.hidden=true;
  const seasons=catalog.filter(c=>String(c.competition_id)===competition.value).sort((a,b)=>b.season_name.localeCompare(a.season_name,undefined,{numeric:true}));
  options(season,seasons.map(c=>[c.season_id,c.season_name]),'Choose a season');
  status.textContent='Choose a season to see available matches.';
 };
 async function seasonLoad(){
  clearMatches();retry.hidden=true;if(!season.value)return;
  const request=matchRequest=new AbortController();status.textContent='Loading matches…';
  try{
   const result=await getData(`matches/${competition.value}/${season.value}.json`,request.signal);
   if(request!==matchRequest)return;
   matches=result.sort((a,b)=>b.match_date.localeCompare(a.match_date)||b.match_id-a.match_id);
   options(match,matches.map(m=>[m.match_id,`${m.match_date} · ${m.home_team.home_team_name} vs ${m.away_team.away_team_name}`]),'Choose a match');
   status.textContent=matches.length?`${matches.length} matches available. Choose one, then analyze it.`:'No matches available for this season.';
  }catch(error){failure(error);}
 }
 season.onchange=seasonLoad;
 match.onchange=()=>{cancelLoad();retry.hidden=true;status.textContent='Select Analyze match to load its shots.';};
 load.onclick=async()=>{
  cancelLoad();const selected=matches.find(m=>String(m.match_id)===match.value);if(!selected)return;
  const request=eventRequest=new AbortController();load.disabled=true;retry.hidden=true;status.textContent='Loading match events…';
  try{
   const events=await getData(`events/${selected.match_id}.json`,request.signal);
   if(eventRequest!==request)return;
   const data=adaptMatch(events,selected);onLoad(data);
   status.textContent=`Loaded ${data.teams.join(' vs ')} · ${data.shots.length} shots. Shootout excluded.`;
  }catch(error){failure(error);}
  finally{if(eventRequest===request){eventRequest=null;load.disabled=!match.value;}}
 };
 retry.onclick=()=>{if(!catalog.length)catalogLoad();else if(!matches.length&&season.value)seasonLoad();else if(match.value)load.onclick();else catalogLoad();};
 catalogLoad();return ()=>{cancelLoad();status.textContent='Choose a match to load another analysis.';};
}
