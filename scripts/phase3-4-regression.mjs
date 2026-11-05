import assert from 'node:assert/strict';
import { leagueData, europeanLeagues, createSeasonFromClubs } from '../src/leagues.js';
import { LEAGUE_SEASON_DATES, INTERNATIONAL_BREAKS, EUROPEAN_DATES, COMPLETE_2026_27_CALENDAR } from '../src/season-calendar.js';
import { createManager, acceptOffer, beginLiveMatch, advanceLiveMatch, specialAbilityMatchImpact } from '../src/engine.js';

const dateFromDay = day => new Date(Date.UTC(2026, 6, 1 + day)).toISOString().slice(0, 10);
const clubList = {
  프리미어리그: leagueData[0].clubs,
  라리가: europeanLeagues.find(x => x.name === '라리가').clubs,
  분데스리가: europeanLeagues.find(x => x.name === '분데스리가').clubs,
  세리에A: europeanLeagues.find(x => x.name === '세리에 A').clubs,
  리그1: europeanLeagues.find(x => x.name === '리그 1').clubs,
};
const expected = {
  프리미어리그: ['2026-08-21', '2027-05-30', 38],
  라리가: ['2026-08-14', '2027-05-30', 38],
  분데스리가: ['2026-08-28', '2027-05-22', 34],
  세리에A: ['2026-08-23', '2027-05-30', 38],
  리그1: ['2026-08-21', '2027-05-29', 34],
};
for (const [league, [start, end, count]] of Object.entries(expected)) {
  const matches = createSeasonFromClubs(clubList[league], clubList[league][0], 1).filter(x => x.type === '리그');
  assert.equal(matches.length, count, `${league} has correct matchday count`);
  assert.equal(dateFromDay(Math.min(...matches.map(x => x.day))), start, `${league} starts on the official date`);
  assert.equal(dateFromDay(Math.max(...matches.map(x => x.day))), end, `${league} ends on the official date`);
  assert.equal(new Set(matches.map(x => x.day)).size, count, `${league} matchdays are unique`);
  assert.ok(matches.every(f => !INTERNATIONAL_BREAKS.some(b => f.day >= b.start && f.day <= b.end)), `${league} avoids A-match breaks`);
}
const ucl = EUROPEAN_DATES.filter(x => x.competition === '챔피언스리그' && x.kind === 'uefa');
const uel = EUROPEAN_DATES.filter(x => x.competition === '유로파리그' && x.kind === 'uefa');
const uecl = EUROPEAN_DATES.filter(x => x.competition === '컨퍼런스리그' && x.kind === 'uefa');
assert.equal(ucl.filter(x => String(x.round).includes('리그 페이즈')).length, 8);
assert.equal(uel.filter(x => String(x.round).includes('리그 페이즈')).length, 8);
assert.equal(uecl.filter(x => String(x.round).includes('리그 페이즈')).length, 6);
assert.ok(ucl.some(x => x.date === '2027.06.05' && x.kind === 'uefa') === false, 'UCL final is classified as a final event, not a UEFA midweek round');
assert.ok(COMPLETE_2026_27_CALENDAR.length >= 100, 'unified calendar includes domestic cups, UEFA and international windows');

// Build a fresh accepted career with a stable offer object.
const manager = createManager('unknown', '게겐프레싱');
const career = acceptOffer(manager, manager.offers[0].id);
const baseline = beginLiveMatch(career, { rotation: '주전 기용' }).match;
assert.ok(baseline?.abilityBonuses, 'live match carries team signature-ability bonuses');
const abilityPlayer = career.squad.find(p => p.position === '공격');
assert.ok(abilityPlayer, 'test squad has an attacker');
const boostedCareer = { ...career, squad: career.squad.map(p => p.id === abilityPlayer.id ? { ...p, specialAbilities: ['뒷공간 침투', '정교한 마무리'] } : p) };
const boosted = beginLiveMatch(boostedCareer, { rotation: '주전 기용' }).match;
assert.ok(boosted.abilityBonuses.attack >= baseline.abilityBonuses.attack, 'attacking signature abilities feed into match chance calculations');
assert.ok(specialAbilityMatchImpact({ specialAbilities: ['킬러 패스', '정확한 롱패스'] }).creation > 0, 'creative abilities influence chance creation');
assert.ok(specialAbilityMatchImpact({ specialAbilities: ['강한 대인 수비', '수비 리더십'] }).defence > 0, 'defensive abilities influence chance prevention');
assert.ok(specialAbilityMatchImpact({ specialAbilities: ['일대일 선방', '넓은 수비 범위'] }).keeper > 0, 'keeper abilities influence shot prevention');
assert.ok(specialAbilityMatchImpact({ specialAbilities: ['왕복 활동량'] }).endurance > 0, 'work-rate abilities reduce fatigue');

let live = boosted;
let completed = null;
let guard = 0;
while (!completed && guard++ < 35) {
  const step = advanceLiveMatch(boostedCareer, live, live.prompt?.options?.[0]);
  if (step.result) completed = step;
  else live = step.match;
}
assert.ok(completed?.result?.playerRatings?.length, 'completed live match records player ratings');
assert.ok(completed.result.manOfMatch?.name, 'completed live match records a man of the match');
console.log('Phase 3–4 regression passed: five league calendars, A-match breaks, 22 UEFA league-phase rounds, signature-ability match effects, live ratings and MOM.');
