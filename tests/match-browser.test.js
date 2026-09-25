import test from 'node:test';
import assert from 'node:assert/strict';
import {getData} from '../dist/match-browser.js';

test('catalog loader handles upstream failure and invalid payloads',async t=>{
 const mock=t.mock.method(globalThis,'fetch',async()=>({ok:false,status:503}));
 await assert.rejects(getData('competitions.json'),/503/);
 mock.mock.mockImplementation(async()=>({ok:true,json:async()=>({error:'invalid'})}));
 await assert.rejects(getData('competitions.json'),/Unexpected data format/);
});
test('catalog loader forwards cancellation and returns published records',async t=>{
 const controller=new AbortController();const records=[{competition_id:43}];
 t.mock.method(globalThis,'fetch',async(url,options)=>{
  assert.equal(url,'https://raw.githubusercontent.com/hudl/open-data/master/data/competitions.json');
  assert.equal(options.signal,controller.signal);
  return {ok:true,json:async()=>records};
 });
 assert.deepEqual(await getData('competitions.json',controller.signal),records);
});

test('failed event download preserves analysis and retry loads the match',async t=>{
 const {initMatchBrowser}=await import('../dist/match-browser.js');
 const elements=new Map();
 for(const id of ['competition','season','match','load-match','retry-catalog','catalog-status'])elements.set(id,{value:'',replaceChildren(...items){this.items=items;this.value='';}});
 globalThis.document={getElementById:id=>elements.get(id)};
 t.after(()=>{delete globalThis.document;delete globalThis.Option;});
 globalThis.Option=function(label,value){this.text=label;this.value=value;};
 const match={match_id:1,match_date:'2024-01-01',home_team:{home_team_name:'A'},away_team:{away_team_name:'B'}};
 let fail=true,loaded=0;
 t.mock.method(globalThis,'fetch',async url=>({ok:!url.includes('events/')||!fail,status:503,json:async()=>url.endsWith('competitions.json')?[{competition_id:1,season_id:2,season_name:'2024',competition_name:'Cup',country_name:'Test',competition_gender:'male'}]:url.includes('matches/')?[match]:[]}));
 initMatchBrowser(()=>loaded++);
 await new Promise(resolve=>setImmediate(resolve));
 elements.get('competition').value='1';elements.get('competition').onchange();
 elements.get('season').value='2';await elements.get('season').onchange();
 elements.get('match').value='1';elements.get('match').onchange();
 await elements.get('load-match').onclick();
 assert.equal(loaded,0);
 assert.match(elements.get('catalog-status').textContent,/unchanged/);
 assert.equal(elements.get('retry-catalog').hidden,false);
 fail=false;elements.get('retry-catalog').onclick();
 await new Promise(resolve=>setImmediate(resolve));
 assert.equal(loaded,1);
 assert.match(elements.get('catalog-status').textContent,/Loaded A vs B/);
});
