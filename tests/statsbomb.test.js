import test from 'node:test';import assert from 'node:assert/strict';
import {adaptMatch} from '../scripts/statsbomb-adapter.mjs';
import {matchData} from '../dist/match-data.js';
import {expectedGoals,summarize,validateShots} from '../dist/analytics.js';
test('World Cup final has 30 shots and a 3–3 score excluding shootout',()=>{const s=summarize(matchData.shots);assert.deepEqual(s.teams.map(t=>[t.shots,t.goals]),[[20,3],[10,3]]);assert.ok(Math.abs(s.teams[0].xg-2.758305926)<1e-8);assert.ok(Math.abs(s.teams[1].xg-2.272617949)<1e-8);});
test('source xG survives export/import including zero',()=>{const s={...matchData.shots[0],xg:0};assert.equal(expectedGoals(validateShots([s])[0]),0);assert.equal(expectedGoals(validateShots(matchData.shots)[0]),matchData.shots[0].xg);assert.throws(()=>validateShots([{...s,xg:1.01}]));});
test('adapter scales coordinates and excludes penalty shootout',()=>{const e={type:{name:'Shot'},period:1,location:[120,80],minute:20,team:{name:'A'},player:{name:'Player'},shot:{statsbomb_xg:.2,body_part:{name:'Head'},outcome:{name:'Goal'}}};const m={home_team:{home_team_name:'A'},away_team:{away_team_name:'B'}};const r=adaptMatch([e,{...e,period:5}],m);assert.equal(r.shots.length,1);assert.equal(r.shots[0].x,105);assert.equal(r.shots[0].y,68);assert.equal(r.shots[0].xg,.2);assert.equal(r.shots[0].bodyPart,'head');});
