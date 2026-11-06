import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createManager, acceptOffer, resolveInterview, beginLiveMatch, advanceLiveMatch } from '../src/engine.js';

const manager = createManager('unknown', '게겐프레싱');
let gm = acceptOffer(manager, manager.offers[0].id);
const kickoff = beginLiveMatch(gm, { rotation: '부분 로테이션' });
assert.ok(kickoff.match, 'career can enter a live match before the interview');
let live = kickoff.match;
let result = null;
for (let i = 0; i < 40 && !result; i++) {
  const step = advanceLiveMatch(gm, live, live.prompt?.options?.[0]);
  if (step.result) result = step;
  else live = step.match;
}
assert.ok(result?.gm?.interview?.questions?.length >= 2, 'match completion creates contextual interview questions');
assert.ok(result.gm.interview.reporter?.name, 'reporter identity is included');
let state = result.gm;
const originalSecurity = state.security;
const originalMorale = state.morale;
let responses = 0;
while (state.interview && responses++ < 12) {
  const choice = state.interview.options[0];
  state = resolveInterview(state, choice);
}
assert.equal(state.interview, null, 'all interview questions can be completed');
assert.equal(state.interviewComplete, true, 'interview completion flag is persisted');
assert.equal(state.interviewHistory.length, 1, 'completed interview is added to career history');
const record = state.lastInterviewRecord;
assert.equal(record.answers.length, responses, 'all answers are retained in transcript');
assert.equal(record.securityChange, state.security - originalSecurity, 'trust changes reconcile with transcript');
assert.equal(record.moraleChange, state.morale - originalMorale, 'morale changes reconcile with transcript');
assert.ok(record.opponent && record.competition && record.reporter, 'record keeps match and media context');
assert.equal(resolveInterview(state, 'anything'), state, 'resolving without an active interview is a no-op');
const restored = JSON.parse(JSON.stringify(state));
assert.equal(restored.interviewHistory[0].answers.length, responses, 'transcript survives save serialization');
assert.ok(fs.existsSync('public/players/reporter-1.png') && fs.existsSync('public/players/reporter-2.png') && fs.existsSync('public/players/reporter-3.png'), 'all reporter portraits exist');
const ui = fs.readFileSync('src/main.jsx', 'utf8');
assert.ok(ui.includes("tab==='기자회견'"), 'dedicated press conference screen is connected');
assert.ok(ui.includes('resolveInterview(gm,x)'), 'UI answers are wired to interview engine');
assert.ok(ui.includes("localStorage.setItem('touchline-save'"), 'career state including interview transcript is saved');
console.log(`Phase 7 final regression passed: ${responses} contextual answers, trust/morale reconciliation, persistent transcript and reporter assets.`);
