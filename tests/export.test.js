import test from 'node:test';
import assert from 'node:assert/strict';
import {exportMatch} from '../dist/export.js';
import {matchData} from '../dist/match-data.js';
import {validateShots,summarize} from '../dist/analytics.js';

test('export produces valid JSON, preserves xG and results, and initiates a download',async t=>{
 let attached=false,clicked=false,removed=false,revoked=false,exported;
 const link={click(){assert.equal(attached,true);clicked=true;},remove(){removed=true;}};
 const documentRef={createElement(tag){assert.equal(tag,'a');return link;},body:{append(a){assert.equal(a,link);attached=true;}}};
 const urlAPI={createObjectURL(blob){exported=blob;return 'blob:test';},revokeObjectURL(url){assert.equal(url,'blob:test');revoked=true;}};
 let cleanup;t.mock.method(globalThis,'setTimeout',callback=>{cleanup=callback;});
 const blob=exportMatch(matchData.shots,documentRef,urlAPI);
 assert.equal(blob,exported);assert.equal(blob.type,'application/json');
 assert.equal(link.download,'pitchlab-match.json');assert.equal(link.href,'blob:test');
 assert.ok(clicked&&removed);assert.equal(revoked,false);cleanup();assert.equal(revoked,true);
 const imported=validateShots(JSON.parse(await blob.text()));
 assert.deepEqual(imported,validateShots(matchData.shots));
 assert.deepEqual(summarize(imported),summarize(matchData.shots));
});
