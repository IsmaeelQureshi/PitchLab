import {exportMatch} from './export.js';
import {expectedGoals,validateShots,summarize} from './analytics.js';
import {initMatchBrowser} from './match-browser.js';
import {matchData} from './match-data.js';
let activeMatch=matchData;
const demo=matchData.shots;
let sourceMessage='2022 World Cup final · 18 Dec 2022 · StatsBomb xG · extra time included, shootout excluded';
const $=id=>document.getElementById(id);
let shots=demo.map(s=>({...s})),selected=null,imported=false;
let dataVersion=0;
const names=()=>imported?['Home','Away']:activeMatch.teams;
const filtered=()=>shots.filter(s=>($('team').value==='all'||s.team===$('team').value)&&s.minute<=Number($('minute').value));
function escapeHTML(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function inspect(id){selected=id;render();const s=shots.find(s=>s.id===id);if(s)$('detail').textContent=`${s.minute}′ · ${s.player} · ${s.bodyPart} · ${s.goal?'Goal':'No goal'} · ${expectedGoals(s).toFixed(3)} xG · ${Math.hypot(105-s.x,34-s.y).toFixed(1)} m from goal`;}
function render(){
 const list=filtered(),{teams,probabilities}=summarize(list),labels=names();
 $('minute-label').textContent=$('minute').value+'′';$('score').textContent=teams.map(t=>t.goals).join(' : ');$('count').textContent=`${list.length} shots`;
 $('metrics').innerHTML=[['Expected goals',...teams.map(t=>t.xg.toFixed(2))],['Shots',...teams.map(t=>t.shots)],['Goals',...teams.map(t=>t.goals)]].map(([label,a,b])=>`<div class="metric"><div class="metric-top"><strong>${a}</strong><span>${label}</span><strong>${b}</strong></div><div class="bar"><span style="width:${Number(a)+Number(b)?100*Number(a)/(Number(a)+Number(b)):50}%"></span></div></div>`).join('');
 $('probabilities').innerHTML=[[labels[0],probabilities.homeWin],['Draw',probabilities.draw],[labels[1],probabilities.awayWin]].map(([label,p])=>`<div class="prob-row"><span>${escapeHTML(label)}</span><strong>${(p*100).toFixed(1)}%</strong></div>`).join('');
 $('shots').replaceChildren();$('events').replaceChildren();
 list.forEach(s=>{
  const c=document.createElementNS('http://www.w3.org/2000/svg','circle');const color=s.team==='home'?'#c6f36b':'#bda8f6';
  Object.entries({cx:s.x,cy:s.y,r:1+expectedGoals(s)*3.5,fill:s.goal?color:'#213e2c',stroke:color,tabindex:0,role:'button','aria-label':`${s.minute} minutes, ${s.player}, ${s.goal?'goal':'miss'}, ${expectedGoals(s).toFixed(2)} expected goals`,class:`shot ${selected===s.id?'selected':''}`}).forEach(([k,v])=>c.setAttribute(k,v));
  c.addEventListener('click',()=>inspect(s.id));c.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();inspect(s.id);}});$('shots').append(c);
 });
 [...list].sort((a,b)=>a.minute-b.minute).forEach(s=>{const tr=document.createElement('tr');[`${s.minute}′`,s.player,labels[s.team==='home'?0:1],s.bodyPart,expectedGoals(s).toFixed(2),s.goal?'Goal':'No goal'].forEach((v,i)=>{const td=document.createElement('td');if(i===1){const b=document.createElement('button');b.textContent=v;b.onclick=()=>inspect(s.id);td.append(b);}else td.textContent=v;if(i===5&&s.goal)td.className='goal';tr.append(td);});$('events').append(tr);});
 if(!list.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=6;td.textContent='No shots in this selection. Change the team or minute filter.';tr.append(td);$('events').append(tr);}
 if(!list.some(s=>s.id===selected)){$('detail').textContent='Select a shot on the pitch or in the event log to inspect it.';selected=null;}
 document.querySelectorAll('.badge').forEach((el,i)=>el.textContent=labels[i][0]);
 document.querySelectorAll('.team h2').forEach((el,i)=>el.textContent=labels[i]);$('team').options[1].text=labels[0];$('team').options[2].text=labels[1];
 document.querySelector('.legend').innerHTML=`<i></i> ${escapeHTML(labels[0])} <i class="purple"></i> ${escapeHTML(labels[1])}`;
}
$('team').onchange=render;$('minute').oninput=render;
$('reset').onclick=()=>{dataVersion++;cancelLoad();selected=null;$('team').value='all';$('minute').value=130;render();};
$('import').onchange=async e=>{const file=e.target.files[0];if(!file)return;const version=++dataVersion;cancelLoad();try{if(file.size>2_000_000)throw Error('File exceeds the 2 MB limit.');const next=validateShots(JSON.parse(await file.text()));if(version!==dataVersion)return;shots=next;imported=true;selected=null;$('team').value='all';$('minute').value=130;$('message').textContent=`Imported ${shots.length} shots · processed locally · supplied xG where available, heuristic fallback otherwise`;render();}catch(error){if(version!==dataVersion)return;$('message').textContent=`Import failed: ${error.message} Your current match was preserved.`;}finally{e.target.value='';}};
$('export').onclick=()=>exportMatch(shots);
$('minute').value=130;$('message').textContent=sourceMessage;
render();

const cancelLoad=initMatchBrowser(data=>{
 dataVersion++;activeMatch=data;shots=data.shots.map(s=>({...s}));imported=false;selected=null;
 sourceMessage=`${data.teams.join(' vs ')} · ${data.date} · StatsBomb xG · extra time included, shootout excluded`;
 $('team').value='all';$('minute').value=130;$('message').textContent=sourceMessage;render();
});
