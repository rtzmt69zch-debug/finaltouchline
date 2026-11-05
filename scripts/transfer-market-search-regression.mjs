import assert from 'node:assert/strict';
import { transferCandidates } from '../src/engine.js';
import { normalizeSquad } from '../src/player-data.js';

const gm = {
  club: '리버풀', season: 1, day: 0, lastDay: 0,
  cash: 500000000000, transferBudget: 500000000000,
  transferMarketPurchased: [], aiLoanLedger: [], aiTransfers: [], squad: [],
};
const defaultList = transferCandidates(gm);
const searchablePool = transferCandidates(gm, { all: true });
assert.equal(defaultList.length, 12, 'default shortlist should remain compact');
assert.ok(searchablePool.length > 2500, 'search mode should expose the complete imported player pool');
assert.ok(searchablePool.some(p => p.club === '아스널'), 'club search data must include Arsenal players');
assert.ok(searchablePool.every(p => p.club !== gm.club), 'own-club players must not be available for purchase');
assert.ok(searchablePool.every(p => p.age !== 0), 'missing DOB must never become age zero');

const born = normalizeSquad([{ id: 'dob-check', name: 'DOB Check', position: '중원', positionDetail: '중앙 미드필더', dateOfBirth: '2000-01-01', age: null }])[0];
const unknown = normalizeSquad([{ id: 'no-dob-check', name: 'No DOB', position: '중원', positionDetail: '중앙 미드필더', age: null }])[0];
assert.ok(Number.isInteger(born.age) && born.age >= 20, 'Transfermarkt-style DOB should be converted into an age');
assert.equal(born.birthYear, 2000, 'full DOB should expose the birth year without showing full birthday');
assert.equal(unknown.age, null, 'unknown birth date should stay unknown');
assert.equal(normalizeSquad([{id:'english-name',name:'한국어 이름',nameKo:'한국어 이름',originalName:'English Player',position:'공격'}])[0].name, 'English Player');
console.log(`Transfer market search regression passed: ${defaultList.length} shortlist players, ${searchablePool.length} searchable players, DOB parsing, no false zero ages, English names.`);
