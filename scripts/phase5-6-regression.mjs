import assert from 'node:assert/strict';
import { getAllImportedPlayers } from '../src/player-data.js';
import { createManager, acceptOffer, generateYouthProspects, callUpYouth, setPlayerTrainingFocus, simulateAiTransferActivity, closeSeason } from '../src/engine.js';

const youthCareer={season:2,club:'바르셀로나',stats:{유소년육성:85},squad:[],youthPool:[],youthHistory:[]};
const prospects=generateYouthProspects(youthCareer);
assert.equal(prospects.length,5,'academy creates five youth prospects each season');
assert.equal(new Set(prospects.map(p=>p.id)).size,5,'youth IDs are unique');
assert.ok(prospects.every(p=>p.age>=16&&p.age<=20),'youth age range is appropriate');
assert.ok(prospects.every(p=>p.specialAbilities.length===2),'youth prospects receive two signature abilities');
assert.ok(prospects.every(p=>p.potential>=p.rating),'potential never falls below current ability');
const callup=callUpYouth({...youthCareer,youthPool:prospects},prospects[0].id);
assert.ok(!callup.error,'academy prospect can be promoted');
assert.equal(callup.gm.squad.at(-1).id,prospects[0].id,'player identity remains stable after promotion');
const focus=setPlayerTrainingFocus(callup.gm,prospects[0].id,'패스·창의성');
assert.equal(focus.gm.squad.find(p=>p.id===prospects[0].id).trainingFocus,'패스·창의성','individual training focus persists');
assert.ok(setPlayerTrainingFocus(callup.gm,prospects[0].id,'invalid').error,'invalid training focus is rejected');

const allPlayers=getAllImportedPlayers();
assert.ok(allPlayers.length>2000,'AI transfer simulation has a broad five-league player pool');
const finances=Object.fromEntries([...new Set(allPlayers.map(p=>p.club))].map(club=>[club,{budget:9000000000,baseBudget:9000000000,spent:0,rank:3}]));
const managed=allPlayers[0].club;
const ai=simulateAiTransferActivity(finances,managed,2,{aiTransfers:[],aiTransferMarkers:[],aiContractLedger:[]},'summer');
assert.ok(Array.isArray(ai.moves)&&Array.isArray(ai.ledger),'AI transfer market returns movement ledger');
assert.ok(ai.moves.every(m=>m.fromClub!==managed&&m.toClub!==managed),'AI never transfers players into or out of the user-managed club');
assert.ok(ai.moves.every(m=>m.fee>0&&m.playerId),'AI transfer records have identity and fee');
assert.ok(Array.isArray(ai.contractLedger),'AI clubs maintain contract renewal records');
assert.ok(Array.isArray(ai.loanLedger),'AI clubs maintain outgoing youth-loan records');

const manager=createManager('unknown','게겐프레싱');
const career=acceptOffer(manager,manager.offers[0].id);
assert.ok(career.squad.every(p=>p.id),'first-team players have persistent IDs');
const total=career.tier===1?38:46;const table=(career.table||[]).map((r,i)=>({...r,p:total,w:20,d:10,l:8,gf:60,ga:40,pts:i===0?70:50-i}));
const seasonEnd=closeSeason({...career,played:total,pts:70,w:20,d:10,l:8,gf:60,ga:40,table,fixtures:[],fa:'탈락',carabao:'탈락',squad:career.squad.map((p,i)=>({...p,age:i===0?37:p.age,seasonMinutes:2200,trainingFocus:'패스·창의성'}))});
assert.equal(seasonEnd.gm.season,2,'career advances to second season');
assert.equal(seasonEnd.gm.youthPool.length,5,'five academy prospects arrive from season two');
assert.ok(seasonEnd.gm.retiredPlayers.some(p=>p.age>=36),'retiring players are archived without losing their identities');
console.log(`Phase 5–6 regression passed: ${allPlayers.length} AI player pool, independent AI market, contract ledger, five youth prospects, persistent IDs and individual training.`);
