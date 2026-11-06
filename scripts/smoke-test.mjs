import fs from 'node:fs';
import assert from 'node:assert/strict';
import {leagueData,europeanLeagues,allEuropeanClubs,starPlayers,roundRobin,createSeason,createSeasonFromClubs,freshTable,createForeignDomesticCupFixtures} from '../src/leagues.js';
import {createManager,acceptOffer,beginLiveMatch,advanceLiveMatch,closeSeason,resolvePlayoff,buyItem,shopItems,signPlayer,transferCandidates,generateYouthProspects,getTeamRatings,money,seasonDate,transferWindowStatus,ageAdjustedRatings,resultMoraleChange,positionAverageAges,managerNationalities,foreignClubProfile,resolveRenewalOffer,europeanKnockoutStart,europeanKnockoutAdvance,europeanRoundReady,recordEuropeanLeagueFixture,recordPlayerMatchStats,assignSquadRoles,makeManualSubstitution,makeTransferNegotiation,resolveTransferNegotiation,makeLoanOffer,setPlayerTransferStatus,resolveExternalOffer,positionWorkloadMultiplier,migrateCalendarState,generateExternalOffers,specialAbilityMatchImpact} from '../src/engine.js';
import {getImportedClubRoster,getAllImportedPlayers,normalizeSquad,playerMatchRating} from '../src/player-data.js';
import {INTERNATIONAL_BREAKS} from '../src/season-calendar.js';

const liverpoolRoster=getImportedClubRoster('리버풀');
assert.ok(liverpoolRoster?.length>=11,'Liverpool uses the imported player roster');
const importedPlayers=getAllImportedPlayers();
const vanDijkImported=importedPlayers.find(p=>/Virgil.*van Dijk/i.test(p.originalName||''));
assert.equal(vanDijkImported?.currentRating,88,'User CA 176 is divided by two for the transfer market');
assert.equal(vanDijkImported?.potentialRating,92.5,'User PA 185 is divided by two for the transfer market');
const randomPAPlayer=normalizeSquad([{id:'test-random-pa',name:'Warren Zaire-Emery',position:'중원',rating:60,potential:60}])[0];
assert.equal(randomPAPlayer.currentRating,77,'Warren CA 154 is divided by two');
assert.equal(randomPAPlayer.PAType,'random','Random PA remains a random potential band');
assert.deepEqual(randomPAPlayer.potentialRatingRange,[85,95],'Random PA range is preserved after scaling');
const wirtz=liverpoolRoster.find(p=>/Florian.*Wirtz/i.test(p.originalName||''));
const szoboszlai=liverpoolRoster.find(p=>/Dominik.*Szoboszlai/i.test(p.originalName||''));
assert.equal(wirtz.currentRating,83,'Wirtz CA is divided by two');
assert.equal(wirtz.potentialRating,92.5,'Wirtz PA is divided by two');
assert.ok(wirtz.attributes.passing>=90&&wirtz.attributes.dribbling>=90,'Wirtz passing and dribbling are signature strengths');
assert.ok(szoboszlai.attributes.endurance>=90&&szoboszlai.attributes.longShots>=90,'Szoboszlai endurance and long shots are signature strengths');
assert.ok(playerMatchRating(wirtz)>wirtz.currentRating&&playerMatchRating(szoboszlai)>szoboszlai.currentRating,'signature skills and attributes affect match ratings');
assert.ok(specialAbilityMatchImpact(wirtz).creation>0,'playmaking signature abilities create match impact');
assert.ok(specialAbilityMatchImpact(szoboszlai).endurance>0,'high-workrate signature abilities reduce fatigue');
assert.ok(specialAbilityMatchImpact({position:'골키퍼',specialAbilities:['일대일 선방','넓은 수비 범위']}).keeper>0,'goalkeeper signature abilities strengthen defensive match impact');
assert.ok(getImportedClubRoster('인터 밀란')?.length>=11,'Serie A CSV builds full imported club squads');
assert.ok(getAllImportedPlayers().length>=740,'all available imported league players are in the shared database');
const overrideProbe=normalizeSquad([{name:'Kylian Mbappe',position:'공격',positionDetail:'스트라이커',rating:50,potential:50}])[0];
assert.equal(overrideProbe.currentRating,96,'CA override is automatically applied to newly imported players');
assert.equal(overrideProbe.potentialRating,98.5,'PA override is automatically applied to newly imported players');

assert.equal(leagueData[0].clubs.length,20,'Premier League has 20 clubs');
for(const l of leagueData.slice(1)) assert.equal(l.clubs.length,24,`${l.name} has 24 clubs`);
assert.equal(roundRobin(leagueData[0].clubs).length,38,'20-team double round robin has 38 rounds');
assert.equal(roundRobin(leagueData[1].clubs).length,46,'24-team double round robin has 46 rounds');
assert.ok(europeanLeagues.length>=8,'eight major overseas leagues are present');
const majorLeagueStartDays={'프리미어리그':51,'라리가':44,'세리에 A':53,'분데스리가':58,'리그 1':51};for(const [leagueName,startDay] of Object.entries(majorLeagueStartDays)){const clubs=leagueName==='프리미어리그'?leagueData[0].clubs:europeanLeagues.find(x=>x.name===leagueName).clubs;const matches=createSeasonFromClubs(clubs,clubs[0],1).filter(f=>f.type==='리그');assert.equal(matches[0].day,startDay,`${leagueName} opens on the supplied 2026-27 date`);assert.ok(matches.every(f=>!INTERNATIONAL_BREAKS.some(({start,end})=>f.day>=start&&f.day<=end)),`${leagueName} avoids all A-match breaks`);}
assert.ok(allEuropeanClubs.length>=100,'European club database is populated');
assert.equal(starPlayers['맨체스터 시티'],'엘링 홀란','Manchester City star player is mapped');
assert.equal(starPlayers['맨체스터 유나이티드'],'브루노 페르난데스','Manchester United star player is mapped');

for(const route of ['legend','youth','license','unknown']){
  const initial=createManager(route,'게겐프레싱');
  assert.ok(initial.offers.length>=3&&initial.offers.length<=5,'3–5 manager offers');
  const gm=acceptOffer(initial,initial.offers[0].id);
  assert.ok(gm.club&&gm.salary>0&&gm.fixtures.length>=38,'offer acceptance initializes career');
  assert.equal(gm.table.length,gm.tier===1?20:24,'league table matches division size');
}

const manager=createManager('unknown','게겐프레싱');
let gm=acceptOffer(manager,manager.offers[0].id);
let matches=0;
while(gm.played<2&&matches<6){
 const started=beginLiveMatch(gm,{rotation:'부분 로테이션',press:'높은 압박',line:'높은 수비라인',tempo:'빠른 템포'});
 assert.ok(started.match,'live match starts');
 let live=started.match,done=null,guard=0;
 while(!done&&guard++<30){
   const step=advanceLiveMatch(gm,live);
   if(step.result){done=step;break;}
   live=step.match;
   if(live.prompt){const decision=advanceLiveMatch(gm,live,live.prompt.options[0]);if(decision.result){done=decision;break;}live=decision.match;}
 }
 assert.ok(done,'match reaches full time');gm=done.gm;matches++;
}
assert.equal(gm.played,2,'two league appearances update even if a cup match falls between them');
assert.ok(gm.lastResult.fanReactions.length>=3,'fan community reactions are generated per match');
const itemResult=buyItem(gm,shopItems[0]);
assert.ok(itemResult.gm||itemResult.error,'shop purchase returns valid state');
console.log('Smoke tests passed: league sizes, fixture rounds, manager offers, career initialization, live match flow and shop, European league database, club stars and fan reactions.');

// 해외 9개 리그 모두 1·2부를 보유하고, 시즌 종료 시 2개 구단씩 승강한다.
const {createEuropeanWorld,simulateEuropeanWorld}=await import('../src/leagues.js');
const world=createEuropeanWorld();
assert.equal(Object.keys(world).length,9);
for(const [name,league] of Object.entries(world)){
  const beforeTop=league.top.length,beforeSecond=league.second.length;
  const after=simulateEuropeanWorld({[name]:league},2)[name];
  assert.equal(after.lastMovement.filter(x=>x.direction==='승격').length,2,`${name} 승격 수`);
  assert.equal(after.lastMovement.filter(x=>x.direction==='강등').length,2,`${name} 강등 수`);
  assert.equal(after.top.length,beforeTop,`${name} 1부 팀 수 유지`);
  assert.equal(after.second.length,beforeSecond,`${name} 2부 팀 수 유지`);
}
console.log('European promotion/relegation simulation tests passed.');
const seasonReady={...gm,played:gm.tier===1?38:46,fixtures:[],fa:'탈락',carabao:'탈락',table:gm.table.map((r,i)=>({...r,p:gm.tier===1?38:46,pts:i===0?90:35,gf:50,ga:40}))};
const seasonResult=closeSeason(seasonReady);
assert.ok(seasonResult.gm?.europeanWorld,'season close persists overseas league world state');
assert.equal(seasonResult.gm.youthPool.length,5,'season close creates five selectable youth prospects');
assert.equal(seasonResult.gm.europeanMovementHistory.length,1,'season close records overseas promotion/relegation history');
console.log('Season close integration test passed.');

const featureManager=createManager('youth','점유율 축구');
const featureBase=acceptOffer(featureManager,featureManager.offers[0].id);
const target=featureBase.squad.find(p=>p.position==='공격');
const marketList=transferCandidates(featureBase);
const marketForward=marketList.find(p=>p.position==='공격');
assert.equal(marketList.length,12,'each season creates a twelve-player transfer market with three players per position');
assert.equal(marketList.filter(p=>p.position==='골키퍼').length,3,'transfer market includes three real goalkeepers');
assert.ok(featureBase.squad.some(p=>p.position==='골키퍼'),'starting squad includes a goalkeeper');
assert.deepEqual(transferCandidates(featureBase).map(p=>p.id),marketList.map(p=>p.id),'the same season market remains stable across renders');
assert.equal(new Set(marketList.map(p=>p.id)).size,marketList.length,'every market player has a unique ID');
assert.equal(new Set(marketList.map(p=>p.name)).size,marketList.length,'market player names do not repeat within a season');
assert.ok(marketList.every(p=>p.type==='실제 선수'),'first-season market contains registered real players only');
assert.ok(new Set(marketList.map(p=>p.rating)).size>=5,'market players have varied ratings');
assert.ok(new Set(marketList.map(p=>p.fee)).size>=5,'market players have varied transfer fees');
assert.ok(marketList.every(p=>p.attributes&&p.style&&p.specialAbilities?.length),'each real market player has individual attributes, style and signature abilities');
const nextSeasonMarket=transferCandidates({...featureBase,season:featureBase.season+1});
assert.notDeepEqual(nextSeasonMarket.map(p=>p.id),marketList.map(p=>p.id),'new season generates a different transfer market');
assert.notDeepEqual(nextSeasonMarket.map(p=>p.attributes),marketList.map(p=>p.attributes),'new season generates different player attributes');
const signed=signPlayer({...featureBase,transferBudget:1000000000000},marketForward);
assert.equal(signed.gm.squad.length,featureBase.squad.length+1,'signing adds squad depth instead of deleting the existing player');
assert.equal(signed.gm.squad.filter(p=>p.position==='공격').sort((a,b)=>b.rating-a.rating||String(a.name).localeCompare(String(b.name)))[0].squadRole,'주전','highest-rated player in a position is assigned as starter');
assert.ok(signed.gm.squad.find(p=>p.marketId===marketForward.id).squadRole==='주전'||signed.gm.squad.find(p=>p.marketId===marketForward.id).squadRole==='부분 로테이션','new signing receives a rating-based squad role');
assert.ok(signed.gm.transferMarketPurchased.includes(marketForward.id),'purchased market player ID is saved');
assert.ok(!transferCandidates(signed.gm).some(p=>p.id===marketForward.id),'purchased player disappears from the market');
assert.ok(signPlayer(signed.gm,marketForward).error?.includes('이미 영입한 선수'),'duplicate purchase is rejected');
assert.equal(transferWindowStatus({...featureBase,lastDay:61}).open,true,'summer transfer window stays open through 31 August');
assert.equal(transferWindowStatus({...featureBase,lastDay:62}).open,false,'summer transfer window closes after 31 August');
assert.equal(transferWindowStatus({...featureBase,lastDay:184}).open,true,'winter transfer window opens on 1 January');
assert.equal(transferWindowStatus({...featureBase,lastDay:214}).open,true,'winter transfer window stays open through 31 January');
assert.equal(transferWindowStatus({...featureBase,lastDay:215}).open,false,'winter transfer window closes after 31 January');
assert.equal(seasonDate({...featureBase,lastDay:62}).iso,'2026-09-01','season day converts to calendar date');
const closedMarket=signPlayer({...featureBase,lastDay:62,transferBudget:1000000000000},marketForward);
assert.ok(closedMarket.error?.includes('이적시장이 닫혀'),'direct signing is blocked outside transfer windows');
assert.ok(transferWindowStatus({...featureBase,lastDay:183}).nextOpen?.includes('2027년 1월 1일'),'after summer close, next opening is the January window');
const winterSigning=signPlayer({...featureBase,lastDay:184,transferBudget:1000000000000},marketForward);
assert.ok(winterSigning.gm?.transferLog?.includes(marketForward.name),'signing is allowed when the winter window opens');
const youngSquad=featureBase.squad.map(p=>({...p,age:19}));const oldSquad=featureBase.squad.map(p=>({...p,age:34}));
assert.deepEqual(positionAverageAges(youngSquad),{공격:19,중원:19,수비:19,골키퍼:19},'average age is independently reported for attack, midfield and defence');
assert.ok(ageAdjustedRatings(youngSquad).공격>ageAdjustedRatings(oldSquad).공격,'young attacking line gets an age-related rating boost vs veteran line');
assert.ok(ageAdjustedRatings(oldSquad).수비<oldSquad.find(p=>p.position==='수비').rating,'older defensive line receives an age-related decline');
assert.equal(resultMoraleChange(youngSquad,true,false),8,'young squad morale rises sharply after a win');
assert.equal(resultMoraleChange(oldSquad,true,false),2,'veteran squad morale remains steadier after a win');
assert.equal(resultMoraleChange(youngSquad,false,false),-8,'young squad morale drops sharply after a loss');
assert.equal(resultMoraleChange(oldSquad,false,false),-2,'veteran squad morale remains steadier after a loss');
const youthBatch=generateYouthProspects({...featureBase,season:2});
assert.equal(youthBatch.length,5,'five academy prospects are generated each season');
assert.equal(new Set(youthBatch.map(p=>p.name)).size,5,'academy prospect names are unique within a batch');
assert.ok(youthBatch.every(p=>!(featureBase.squad||[]).some(member=>member.name===p.name)),'academy prospects do not duplicate current squad members');
const firstXI=beginLiveMatch(featureBase,{rotation:'주전 기용',formation:'4-3-3',press:'높은 압박',line:'높은 수비라인',tempo:'빠른 템포',width:'넓게'}).match;
const rotatedXI=beginLiveMatch(featureBase,{rotation:'대규모 로테이션',formation:'3-5-2',press:'중간 압박',line:'낮은 수비라인',tempo:'느린 템포',width:'보통'}).match;
assert.ok(rotatedXI.rotationRelief>firstXI.rotationRelief,'squad rotation provides extra stamina relief');
const strongAttack={...featureBase,squad:featureBase.squad.map(p=>p.position==='공격'?{...p,rating:99}:p)};
const strongAttackMatch=beginLiveMatch(strongAttack,{rotation:'부분 로테이션',formation:'4-3-3',press:'중간 압박',line:'중간 수비라인',tempo:'보통 템포',width:'보통'}).match;
assert.ok(strongAttackMatch.attackEdge>beginLiveMatch(featureBase,{rotation:'부분 로테이션',formation:'4-3-3',press:'중간 압박',line:'중간 수비라인',tempo:'보통 템포',width:'보통'}).match.attackEdge,'attacking player ratings influence attacking matchup');

assert.ok(getTeamRatings(featureBase).중원>0&&getTeamRatings(featureBase).수비>0&&getTeamRatings(featureBase).골키퍼>0,'team ratings are derived from attack, midfield, defence and goalkeeper units');
const savedRandom=Math.random;Math.random=()=>.5;
const lowAcademy=generateYouthProspects({...featureBase,stats:{...featureBase.stats,유소년육성:20}});
const highAcademy=generateYouthProspects({...featureBase,stats:{...featureBase.stats,유소년육성:90}});
assert.ok(highAcademy.reduce((a,p)=>a+p.potential,0)>lowAcademy.reduce((a,p)=>a+p.potential,0),'youth development skill improves prospect potential');
function simulateForStats(state,opts){let live=beginLiveMatch(state,opts).match,done=null,guard=0;while(!done&&guard++<30){const step=advanceLiveMatch(state,live,live.prompt?.options?.[0]);if(step.result)done=step;else live=step.match;}return done;}
const neutralOpts={rotation:'부분 로테이션',formation:'4-3-3',press:'중간 압박',line:'중간 수비라인',tempo:'보통 템포',width:'보통'};
const wageManager={...featureBase,salary:5200000,cash:0,fixtures:[{...featureBase.fixtures.find(x=>x.type==='리그'),id:'wage-first',day:7,played:false},{...featureBase.fixtures.find(x=>x.type==='리그'),id:'wage-second',day:14,played:false}]};
const wageFirst=simulateForStats(wageManager,neutralOpts);
assert.equal(wageFirst.gm.cash,0,'weekly wages are not paid before seven days have elapsed from the first match');
const wageSecond=simulateForStats(wageFirst.gm,neutralOpts);
assert.equal(wageSecond.gm.cash,100000,'one weekly salary is paid seven days after the first match');
assert.equal(wageSecond.gm.wagePaidWeeks,1,'weekly payroll records paid weeks to prevent duplicate payment');
const baselineStats=simulateForStats(featureBase,neutralOpts).result.stats;
const attackingStats=simulateForStats(strongAttack,neutralOpts).result.stats;
assert.ok(attackingStats.shots>baselineStats.shots&&attackingStats.xg>baselineStats.xg,'attacking unit quality changes shots and expected goals');
const slowStats=simulateForStats(featureBase,{...neutralOpts,tempo:'느린 템포'}).result.stats;
const fastStats=simulateForStats(featureBase,{...neutralOpts,tempo:'빠른 템포'}).result.stats;
assert.ok(slowStats.possession>fastStats.possession&&fastStats.shots>slowStats.shots,'tempo changes possession and shot volume');
Math.random=savedRandom;

// Match engine regression: missing momentum previously made the goal probability NaN,
// silently preventing either side from scoring. Verify normal match scoring and post-match payloads.
const momentumCheck=beginLiveMatch(featureBase,neutralOpts).match;
assert.equal(momentumCheck.momentum,0,'live match initializes momentum at zero');
let totalGoals=0,scoredMatches=0,zeroZeroMatches=0,postMatchPayloads=0;
const scoringSample=100;
for(let i=0;i<scoringSample;i++){
 const outcome=simulateForStats(featureBase,neutralOpts);
 totalGoals+=outcome.result.gf+outcome.result.ga;
 if(outcome.result.gf+outcome.result.ga>0)scoredMatches++;
 if(outcome.result.gf===0&&outcome.result.ga===0)zeroZeroMatches++;
 assert.ok(outcome.result.stats?.possession!==undefined,'full-time result includes match statistics');
 assert.ok(outcome.gm.interview?.questions?.length>=2,'full-time result includes contextual press-conference questions');
 assert.ok(outcome.gm.interview.questions.every(q=>q.options?.length>=5&&q.options.length<=7),'each press-conference question has 5–7 answer choices');
 assert.ok(outcome.gm.lastResult?.stats?.shotsOnTarget!==undefined,'saved match report includes shots on target');
 postMatchPayloads++;
}
const averageGoals=totalGoals/scoringSample;
assert.ok(averageGoals>2.2&&averageGoals<4.5,`average total goals should be lively but plausible (actual ${averageGoals.toFixed(2)})`);
assert.ok(scoredMatches>=85,`most matches should contain goals (actual ${scoredMatches}/${scoringSample})`);
assert.ok(zeroZeroMatches<=8,`0-0 results should be uncommon (actual ${zeroZeroMatches}/${scoringSample})`);
for(const portrait of ['attacker-youth.png','attacker-prime.png','attacker-veteran.png','midfielder-youth.png','midfielder-prime.png','midfielder-veteran.png','defender-youth.png','defender-prime.png','defender-veteran.png','goalkeeper-youth.png','goalkeeper-prime.png','goalkeeper-veteran.png','reporter-1.png','reporter-2.png','reporter-3.png'])assert.ok(fs.existsSync(new URL(`../public/players/${portrait}`,import.meta.url)),'bundled player/reporter portrait exists: '+portrait);
const uiSource=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
assert.ok(uiSource.includes("postMatchStage==='stats'"),'full-time statistics have a dedicated screen before the press conference');
assert.ok(uiSource.includes("setPostMatchStage('interview')")&&uiSource.includes("setTab('기자회견')"),'statistics confirmation opens the press conference');
assert.ok(uiSource.includes("postMatchStage:next.interview?'interview':'complete'"),'press-conference progress is saved with the career');
assert.ok(fs.readFileSync(new URL('../src/engine.js',import.meta.url),'utf8').includes('goalkeeper'),'transfer portraits use position-specific PNG files');
assert.ok(uiSource.includes("tab==='기자회견'"),'press conference is rendered as its own screen');
console.log(`Match-flow regression passed: ${averageGoals.toFixed(2)} average total goals, ${scoredMatches}/${scoringSample} matches with goals, ${zeroZeroMatches}/${scoringSample} 0-0 results, stats and press conference payloads present.`);
console.log('Feature tests passed: rating-ranked squad depth, youth prospects, rotation stamina relief, positional tactics, age-related line ratings, separate position age averages, age-sensitive morale, 7-day weekly payroll, transfer windows and local portraits.');

// Currency display regression: compact Korean units, numeric unit labels, max two significant digits.
assert.equal(money(100000000000),'1000억','one thousand hundred-million won is shown as 1000억');
assert.equal(money(12345678900),'120억','large amounts are rounded to two significant digits');
assert.equal(money(1234567890000),'1.2조','trillion amounts use 조 and two significant digits');
assert.equal(money(1234567),'120만','mid-sized amounts use 만 and two significant digits');
assert.equal(money(5000),'5,000원','small amounts retain won notation');
console.log('Currency formatting tests passed: numeric Korean units and two significant digits.');

// V27: nationality-aware foreign careers, overseas club profiles, renewal offers and UEFA bracket integrity.
assert.ok(managerNationalities.includes('대한민국')&&managerNationalities.includes('스페인'),'manager nationality choices are available');
const spanishManager=createManager('legend','점유율 축구','스페인');
assert.equal(spanishManager.offers.length,5,'career starts with five job offers');
assert.equal(spanishManager.offers.filter(o=>o.isForeign&&o.country==='스페인').length,2,'matching nationality receives two offers from its domestic league');
const spanishOffer=spanishManager.offers.find(o=>o.isForeign&&o.country==='스페인');
const spanishCareer=acceptOffer(spanishManager,spanishOffer.id);
const foreignMatchCount=(spanishCareer.leagueClubs.length-1)*2;
assert.equal(spanishCareer.fixtures.filter(f=>f.type==='리그').length,foreignMatchCount,'foreign league gets a full double round-robin schedule');
assert.equal(spanishCareer.fixtures.filter(f=>f.type==='챔피언스리그'||f.type==='유로파리그'||f.type==='컨퍼런스리그').length,spanishOffer.europeanCompetition==='없음'?0:8,'foreign European entrants receive eight league-phase fixtures');
assert.equal(spanishCareer.europe,spanishOffer.europeanCompetition,'foreign manager offer competition is retained after appointment');
assert.equal(spanishCareer.table.length,spanishCareer.leagueClubs.length,'foreign league table contains every club');
assert.ok(spanishCareer.isForeign&&spanishCareer.leagueName==='라리가','foreign offer starts a playable foreign career');
const foreignProfile=foreignClubProfile(spanishOffer.club,spanishOffer.league);
assert.ok(foreignProfile.nickname&&foreignProfile.averageAge>=23&&foreignProfile.공격&&foreignProfile.중원&&foreignProfile.수비,'foreign club has nickname, average age and three ratings');
const foreignFinished=closeSeason({...spanishCareer,played:foreignMatchCount,w:22,d:8,l:foreignMatchCount-30,gf:90,ga:25,pts:105,table:spanishCareer.table.map(r=>r.name===spanishCareer.club?{...r,p:foreignMatchCount,w:22,d:8,l:foreignMatchCount-30,gf:90,ga:25,pts:105}:r)});
assert.ok(!foreignFinished.error&&foreignFinished.gm.season===2&&foreignFinished.gm.renewalOffer,'foreign season closes and offers a renewal after a strong finish');
const renewed=resolveRenewalOffer(foreignFinished.gm,'accept');
assert.equal(renewed.contractYears,3,'accepting renewal signs a three-year extension');
assert.equal(renewed.renewalOffer,null,'renewal offer is cleared after decision');
const uclBase=createManager('legend','게겐프레싱');
const uclClub='리버풀';
const uclTable=Array.from({length:36},(_,i)=>({name:i===0?uclClub:`UCL 팀 ${i+1}`,p:8,w:5,d:1,l:2,gf:30-i,ga:8,pts:20-i,pot:Math.floor(i/9)+1,ai:i!==0}));
const uclCareer={...uclBase,club:uclClub,europeanCompetition:{competition:'챔피언스리그',stage:'리그 페이즈',club:uclClub,fixtures:[],table:uclTable,pots:Array.from({length:4},(_,i)=>({pot:i+1,teams:uclTable.slice(i*9,(i+1)*9).map(r=>r.name)}))}};
const uclPO=europeanKnockoutStart(uclCareer);
assert.equal(uclPO.europeanCompetition.playoffPairs.length,8,'UCL playoff has eight seeded ties');
const poEntrants=uclPO.europeanCompetition.playoffPairs.flatMap(p=>[p.home,p.away]);
assert.equal(new Set(poEntrants).size,16,'UCL playoff draw has no duplicate entrants');
const uclR16=europeanKnockoutAdvance(uclPO);
assert.equal(uclR16.europeanCompetition.stage,'16강','playoff advances to the round of 16');
assert.equal(uclR16.europeanCompetition.knockoutPairs.length,8,'round of 16 has eight ties');
const r16Entrants=uclR16.europeanCompetition.knockoutPairs.flatMap(p=>[p.home,p.away]);
assert.equal(new Set(r16Entrants).size,16,'round-of-16 bracket has no duplicate entrants');
const mainSource=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
assert.ok(mainSource.includes('챔피언스리그 매치데이 순위표'),'Full Champions League matchday standings are visible in the standings tab');
assert.ok(mainSource.includes('1~36위 · LEAGUE PHASE'),'Champions League standings show all 36 places');
const duplicateSquad=assignSquadRoles([{id:'old-1',name:'준호 김',position:'공격',rating:68},{id:'old-2',marketId:'market-duplicate',name:'준호 김',position:'공격',rating:68},{id:'other',name:'준호 김',position:'중원',rating:62}]);
assert.equal(duplicateSquad.length,2,'duplicate player names in the same position are migrated to one player');
assert.equal(duplicateSquad.find(p=>p.position==='공격').squadRole,'주전','remaining duplicate player receives a squad role');
console.log('V27 tests passed: nationality-based job offers, playable overseas leagues, foreign club profiles, renewals and unique UCL playoff/R16 brackets.');

for(const league of europeanLeagues){const manager=createManager('legend','역습 축구',league.country);const offers=manager.offers.filter(o=>o.isForeign&&o.country===league.country);assert.ok(offers.length>=2,`${league.country} manager receives local-league offers`);const career=acceptOffer(manager,offers[0].id);assert.equal(career.fixtures.filter(f=>f.type==='리그').length,(league.clubs.length-1)*2,`${league.name} domestic fixture count matches its team count`);
 assert.equal(career.europe,offers[0].europeanCompetition,`${league.name} European qualification is retained on appointment`);}
console.log('Overseas league coverage passed: all nine countries produce nationality-matched offers and complete league schedules.');

const uclStartManager=createManager('legend','게겐프레싱');
const baseUclOffer=uclStartManager.offers.find(o=>o.tier===1&&!o.isForeign);
const uclStartOffer={...baseUclOffer,club:'리버풀',tier:1,league:'프리미어리그',leagueName:'프리미어리그',leagueClubs:leagueData[0].clubs,isForeign:false};
const uclStartCareer=acceptOffer({...uclStartManager,offers:[uclStartOffer]},uclStartOffer.id);
const uclSchedule=uclStartCareer.europeanCompetition.fixtures;
assert.equal(uclSchedule.length,8,'Champions League league phase schedules eight opponents');
assert.equal(new Set(uclSchedule.map(f=>f.opponent)).size,8,'Champions League league phase has no repeated opponents');
assert.equal(uclSchedule.filter(f=>f.home).length,4,'Champions League schedule has four home matches');
assert.equal(uclSchedule.filter(f=>!f.home).length,4,'Champions League schedule has four away matches');
assert.equal(uclStartCareer.europeanCompetition.table.length,36,'Champions League league phase contains 36 clubs');
for(let pot=1;pot<=4;pot++)assert.equal(uclSchedule.filter(f=>f.pot===pot).length,2,`two opponents are drawn from pot ${pot}`);

assert.ok(uclSchedule.every(f=>!leagueData[0].clubs.includes(f.opponent)),'English clubs do not draw same-association opponents in the league phase');
const drawCountry=name=>leagueData[0].clubs.includes(name)?'잉글랜드':allEuropeanClubs.find(c=>c.name===name)?.country||'기타';
assert.ok(Object.values(uclSchedule.reduce((counts,f)=>({...counts,[drawCountry(f.opponent)]:(counts[drawCountry(f.opponent)]||0)+1}),{})).every(n=>n<=2),'league phase draw includes at most two opponents from each association');

function awardSeason({position=1,goals=0,assists=0,rating=7.2,uclWinner='리버풀'}={}){
 const base=createManager('legend','게겐프레싱');const offer={...base.offers.find(o=>o.tier===1&&!o.isForeign),club:'리버풀',tier:1,league:'프리미어리그',leagueName:'프리미어리그',leagueClubs:leagueData[0].clubs,isForeign:false};
 const career=acceptOffer({...base,offers:[offer]},offer.id);const rows=leagueData[0].clubs.map((name,i)=>({name,p:38,w:20,d:5,l:13,gf:55,ga:40,pts:name==='리버풀'?(position===1?90:85):name==='아스널'?(position===1?85:90):30}));
 const squad=[{id:'award-fw',name:'Award Forward',position:'공격',rating:90,age:25,squadRole:'주전',seasonGoals:goals,seasonAssists:assists,seasonAppearances:38,seasonRatingTotal:rating*38,seasonAverageRating:rating},{id:'award-mf',name:'Award Midfielder',position:'중원',rating:85,age:26,squadRole:'주전',seasonGoals:5,seasonAssists:8,seasonAppearances:38,seasonRatingTotal:rating*37,seasonAverageRating:rating-.03},{id:'award-df',name:'Award Defender',position:'수비',rating:82,age:27,squadRole:'주전',seasonGoals:1,seasonAssists:2,seasonAppearances:38,seasonRatingTotal:rating*36,seasonAverageRating:rating-.05},{id:'award-gk',name:'Award Keeper',position:'골키퍼',rating:84,age:29,squadRole:'주전',seasonGoals:0,seasonAssists:0,seasonAppearances:38,seasonRatingTotal:rating*37,seasonAverageRating:rating-.02}];
 return closeSeason({...career,played:38,w:25,d:5,l:8,gf:75,ga:35,pts:position===1?90:85,table:rows,fixtures:[],fa:'탈락',carabao:'탈락',squad,europeanCompetition:{competition:'챔피언스리그',stage:'대회 종료',final:{home:'리버풀',away:'레알 마드리드',winner:uclWinner}}});
}
const noIndividualAwards=awardSeason({goals:24,assists:12,uclWinner:'레알 마드리드'});
assert.equal(noIndividualAwards.gm.pendingAwards,null,"no individual awards are announced below the 25-goal and 13-assist thresholds when Ballon d'Or conditions are unmet");
const doubleWinners=awardSeason({goals:25,assists:13,rating:7.6,uclWinner:'리버풀'});
assert.deepEqual(doubleWinners.gm.pendingAwards.winners.map(x=>x.award).sort(),['득점왕','도움왕','발롱도르'].sort(),'league and Champions League double with best starter rating can earn all awards');
const runnerUpBallon=awardSeason({position:2,goals:10,assists:8,rating:8.3,uclWinner:'리버풀'});
assert.ok(runnerUpBallon.gm.pendingAwards.winners.some(x=>x.award==='발롱도르'),"league runner-up with Champions League title and an 8.0+ starter rating can win Ballon d'Or");




// Goal distribution favors forwards, goalkeeper assists are excluded, and squad identities stay unique.
const oldRandomForScorers=Math.random;Math.random=()=>.1;const keeperStats=recordPlayerMatchStats([{id:'gk',name:'Keeper',position:'골키퍼'},{id:'fw',name:'Forward',position:'공격'},{id:'mf',name:'Midfielder',position:'중원'},{id:'df',name:'Defender',position:'수비'}],500,{win:true,ga:0});Math.random=oldRandomForScorers;
assert.equal(keeperStats.find(p=>p.id==='gk').seasonAssists,0,'goalkeeper assists are excluded');
assert.ok(keeperStats.find(p=>p.id==='fw').seasonGoals>keeperStats.find(p=>p.id==='mf').seasonGoals,'forward goals exceed midfielder goals over a large sample');
assert.ok(keeperStats.every(p=>p.seasonAppearances===1&&p.seasonAverageRating>0),'league match appearances and ratings are recorded');
assert.equal(assignSquadRoles([{id:'a',name:'A',position:'공격',rating:80},{id:'b',name:'B',position:'공격',rating:75},{id:'a-copy',name:'A',position:'공격',rating:80}]).length,2,'duplicate player identity is removed from squad lists even if the duplicate has a different ID');
assert.ok(keeperStats.filter(p=>p.position!=='골키퍼').reduce((sum,p)=>sum+p.seasonAssists,0)<=500,'assists cannot exceed goals');
console.log('Player-stat regression passed: weighted scorers, goalkeeper assist exclusion, ratings and duplicate squad identities.');


// V37 calendar and tactical-philosophy progression.
const calendarFixtures=createSeason(1,'리버풀',1).filter(f=>f.type==='리그');
const calendarDays=calendarFixtures.map(f=>f.day);
assert.ok(calendarDays.at(-1)>=280&&calendarDays.at(-1)<=335,'league season finishes in late May');
for(const {start,end} of INTERNATIONAL_BREAKS){assert.ok(!calendarDays.some(day=>day>=start&&day<=end),'no league fixture is scheduled during an international break');}
const philosophyCareer=createManager('unknown','게겐프레싱');
assert.deepEqual(Object.keys(philosophyCareer.tacticUnderstanding).sort(),['게겐프레싱','역습','점유율축구'].sort(),'three separate tactical understanding stats are initialized');
assert.equal(philosophyCareer.tacticUnderstanding.게겐프레싱,70,'selected gegenpressing philosophy starts at 70');
assert.equal(philosophyCareer.tacticUnderstanding.점유율축구,20,'unselected possession philosophy starts at 20');
assert.equal(philosophyCareer.tacticUnderstanding.역습,20,'unselected counterattack philosophy starts at 20');
const possessionCareer=createManager('unknown','점유율 축구');
assert.deepEqual(possessionCareer.tacticUnderstanding,{게겐프레싱:20,점유율축구:70,역습:20},'selected possession philosophy starts at 70');
const counterCareer=createManager('unknown','역습 축구');
assert.deepEqual(counterCareer.tacticUnderstanding,{게겐프레싱:20,점유율축구:20,역습:70},'selected counterattack philosophy starts at 70');
assert.equal(shopItems.filter(item=>item.tactic).length,3,'shop retains exactly three tactical philosophy courses');
assert.equal(shopItems.filter(item=>item.stat).length,5,'shop adds five manager-skill development products');
const purchased=buyItem({...philosophyCareer,cash:1000000000},shopItems[0]);
assert.equal(purchased.gm.tacticUnderstanding.게겐프레싱,74,'buying a philosophy course increases only that philosophy understanding by four');
assert.equal(purchased.gm.tacticUnderstanding.역습,20,'other philosophy understanding remains unchanged');
const skillProducts=['선수관리','경기분석','동기부여','유소년육성','위기관리'];
for(const skill of skillProducts){const item=shopItems.find(product=>product.stat===skill);assert.ok(item,`${skill} development product exists`);const result=buyItem({...philosophyCareer,cash:1000000000},item);assert.equal(result.gm.stats[skill],philosophyCareer.stats[skill]+2,`${skill} product increases the matching manager stat by two`);}
assert.equal(buyItem(purchased.gm,shopItems[1]).error,'성장 상점 상품은 일주일에 한 번만 구매할 수 있습니다.','weekly purchase limit still applies across all product types');
assert.ok(shopItems.filter(item=>item.tactic).every(item=>item.price===450000000),'tactical courses are more expensive');
assert.ok(shopItems.filter(item=>item.stat).every(item=>item.price===400000000),'manager-skill courses are more expensive');
let euroProgress={...uclStartCareer,europeanCompetition:{...uclStartCareer.europeanCompetition,fixtures:uclStartCareer.europeanCompetition.fixtures.map(f=>({...f}))}};
for(const fixture of [...euroProgress.europeanCompetition.fixtures])euroProgress=recordEuropeanLeagueFixture(euroProgress,fixture,2,1);
assert.equal(euroProgress.europeanCompetition.stage,'플레이오프','finishing the eighth league-phase fixture automatically opens the playoff bracket');
assert.equal(euroProgress.europeanCompetition.playoffPairs.length,8,'playoff bracket contains eight ties');
assert.equal(euroProgress.europeanCompetition.playoffPairs[0].firstLegDate,'2027년 2월 17일','playoff first leg schedule begins on 17 February 2027');
assert.equal(euroProgress.europeanCompetition.playoffPairs[1].firstLegDate,'2027년 2월 18일','playoff first-leg fixtures are split across 17 and 18 February');
assert.equal(euroProgress.europeanCompetition.playoffPairs[0].secondLegDate,'2027년 2월 24일','playoff second leg schedule begins on 24 February 2027');
let playoffDone=europeanKnockoutAdvance(euroProgress);
assert.equal(playoffDone.europeanCompetition.stage,'16강','playoff results advance to the round of 16');
assert.equal(playoffDone.europeanCompetition.knockoutPairs[0].firstLegDate,'2027년 3월 10일','round of 16 first legs start on 10 March 2027');
assert.equal(europeanRoundReady({...playoffDone,lastDay:251}),false,'round of 16 cannot be played before its second-leg date');
assert.equal(europeanRoundReady({...playoffDone,lastDay:261}),true,'round of 16 can be progressed after 18 March 2027');

console.log('V37 calendar and tactical philosophy progression tests passed.');

// Regression checks for matchday form and rivalry-loss interview support.
const engineSource = fs.readFileSync(new URL('../src/engine.js', import.meta.url), 'utf8');
assert.ok(engineSource.includes("form:[...(r.form||[]),gf>ga?'승':gf===ga?'무':'패'].slice(-5)"), 'league table stores each club\'s rolling last-five form');
assert.ok(engineSource.includes('라이벌전 패배로 팬들의 실망이 큽니다.'), 'rivalry defeat triggers a dedicated interview question');
assert.ok(engineSource.includes("'라이벌전의 중요성을 충분히 인식하지 못했다':[-18,-3]"), 'dismissive rivalry answer carries a major board-trust penalty');

const playerData=await import('../src/player-data.js');
assert.equal(playerData.playerIdentityId({fotmobId:123,name:'A'}),'fotmob:123','FotMob player id is the stable identity');
assert.equal(playerData.playerIdentityId({name:'Test Player',nationality:'ENG',dateOfBirth:'2000-01-01',club:'Test FC'}),playerData.playerIdentityId({name:'Test Player',nationality:'ENG',dateOfBirth:'2000-01-01',club:'Test FC'}),'fallback player id is deterministic');
assert.equal(playerData.rolePointBias({role:'포쳐'}).goal>playerData.rolePointBias({role:'포쳐'}).assist,true,'poacher favours goals');
assert.equal(playerData.rolePointBias({role:'폴스나인'}).assist>playerData.rolePointBias({role:'폴스나인'}).goal,true,'false nine favours assists');
const normalizedRoster=playerData.normalizeFotMobTeamPayload({details:{id:10,name:'Test FC'},squad:{squad:[{title:'coach',members:[{id:1,name:'Coach',isCoach:true}]},{title:'Attackers',members:[{id:2,name:'Forward',age:24,ccode:'ENG',cname:'England',role:{fallback:'Striker'}}]},{title:'Keepers',members:[{id:3,name:'Keeper',age:28,ccode:'BRA',cname:'Brazil',role:{fallback:'Keeper'}}]}]}});
assert.equal(normalizedRoster.players.length,2,'FotMob squad groups normalize players and exclude coaches');
assert.equal(normalizedRoster.counts['골키퍼'],1,'FotMob keeper group maps to keeper position');
console.log('Player identity, FotMob roster normalization and role-weight tests passed.');


// 2026-27 manager career final-spec regression: youth cohorts, IDs, endurance, role/position fit and substitution windows.
const richYouth=generateYouthProspects({...featureBase,club:'바르셀로나',season:2,stats:{...featureBase.stats,유소년육성:82}});
assert.equal(richYouth.length,5,'each season produces five youth academy players');
assert.equal(new Set(richYouth.map(p=>p.id)).size,5,'academy players have unique persistent IDs');
assert.ok(richYouth.every(p=>p.age>=16&&p.age<=20),'academy ages are between 16 and 20');
assert.ok(richYouth.every(p=>p.CA===p.currentRating&&p.PA===p.potentialRating&&p.PA>=p.CA),'youth CA/PA values use a consistent current/potential scale');
assert.ok(richYouth.every(p=>p.specialAbilities.length>=1&&p.specialAbilities.length<=2),'each youth has one or two standout abilities');
assert.ok(richYouth.every(p=>p.attributes&&p.attributes.endurance>=20),'youth players include individual physical attributes and endurance');
assert.ok(richYouth.every(p=>p.academyCulture==='technical'),'Barcelona youth culture favours technical profiles');
const youthCareer={...featureBase,season:2,youthPool:richYouth};
assert.ok(transferCandidates(youthCareer).some(p=>p.type==='유스'),'first-team academy call-ups become eligible transfer-market players from season two');
assert.ok(!transferCandidates({...featureBase,season:1,youthPool:richYouth}).some(p=>p.type==='유스'),'academy players are not available as transfer targets in season one');
const normalizedIds=assignSquadRoles([{name:'No ID striker',position:'공격',rating:65}]);
assert.ok(normalizedIds[0].id,'squad normalization assigns stable IDs when imported seed IDs are absent');
const lowManager={...featureBase,squad:featureBase.squad.map(p=>({...p,attributes:{...(p.attributes||{}),endurance:20}}))};
const highManager={...featureBase,squad:featureBase.squad.map(p=>({...p,attributes:{...(p.attributes||{}),endurance:95}}))};
const staminaBase=beginLiveMatch(lowManager,{rotation:'주전 기용'}).match;
const staminaHigh=beginLiveMatch(highManager,{rotation:'주전 기용'}).match;
const staminaStepLow=advanceLiveMatch(lowManager,staminaBase).match;
const staminaStepHigh=advanceLiveMatch(highManager,staminaHigh).match;
const lowId=staminaStepLow.starters[0],highId=staminaStepHigh.starters[0];
assert.ok(staminaStepHigh.liveFitness[highId]>staminaStepLow.liveFitness[lowId],'higher endurance reduces in-match fatigue');
const oldRandomForPosition=Math.random;Math.random=()=>.5;const wrongPosition=beginLiveMatch(featureBase,{selectedXI:featureBase.squad.map(p=>p.id),selectedPositions:Object.fromEntries(featureBase.squad.map(p=>[p.id,p.position==='공격'?'수비':'공격']))}).match;const correctPosition=beginLiveMatch(featureBase,{selectedXI:featureBase.squad.map(p=>p.id)}).match;Math.random=oldRandomForPosition;
assert.ok(wrongPosition.strength<correctPosition.strength,'out-of-position selection reduces team performance');
assert.ok(!makeManualSubstitution({minute:30,finished:false,starters:['a'],substitutions:[],events:[]},'a','b',[{id:'a'},{id:'b'}]).error,'manual substitutions are available at minute 30');
assert.equal(makeManualSubstitution({minute:39,finished:false,starters:['a'],substitutions:[],events:[]},'a','b',[{id:'a'},{id:'b'}]).error,'지정된 교체 시점에만 교체할 수 있습니다.','minute 39 is no longer a substitution checkpoint');
for(const minute of [15,30,45,60,75,90])assert.ok(!makeManualSubstitution({minute,finished:false,starters:['a'],substitutions:[],events:[]},'a','b',[{id:'a'},{id:'b'}]).error,`minute ${minute} accepts a manual substitution`);
console.log('Final-spec regression passed: youth academy identities and profiles, second-season youth market eligibility, stable player IDs, endurance-sensitive fatigue, positional penalties and six substitution checkpoints.');
const tacticalXI=Array.from({length:11},(_,i)=>({id:`tactical-xi-${i}`,name:`전술 테스트 ${i+1}`,position:i===0?'골키퍼':i<5?'수비':i<9?'중원':'공격',positionDetail:i===0?'골키퍼':i<5?'센터백':i<9?'중앙 미드필더':'윙어',primaryPosition:i===0?'골키퍼':i<5?'센터백':i<9?'중앙 미드필더':'윙어',rating:65+i,age:21,fitness:100,squadRole:'주전',attributes:{pace:65,finishing:65,passing:65,defending:65,physical:65,endurance:75,dribbling:65,vision:65,firstTouch:65,heading:65,tackling:65,crossing:65,longShots:65,positioning:65,composure:65,agility:65,strength:65,jumping:65,reflexes:65,handling:65,kicking:65,oneOnOnes:65}}));
const tacticalCareer={...featureBase,squad:tacticalXI};
const tacticalMatch=beginLiveMatch(tacticalCareer,{formation:'4-2-3-1',selectedXI:tacticalXI.map(p=>p.id),selectedPositions:Object.fromEntries(tacticalXI.map((p,i)=>[p.id,i===0?'골키퍼':i<5?'수비':i<7?'중원':i<10?'공격':'공격'])),selectedPositionDetails:Object.fromEntries(tacticalXI.map((p,i)=>[p.id,['골키퍼','왼쪽 풀백','왼쪽 센터백','오른쪽 센터백','오른쪽 풀백','왼쪽 수비형 미드필더','오른쪽 수비형 미드필더','왼쪽 윙어','공격형 미드필더','오른쪽 윙어','스트라이커'][i]]))}).match;
assert.equal(tacticalMatch.starters.length,11,'a manually selected eleven is the match starting XI');
assert.equal(tacticalMatch.positionAssignments['tactical-xi-10'],'스트라이커','formation slot details are passed into the live match engine');
console.log('Tactical XI integration passed: 11 manually selected players and formation-specific positional assignments reach the live match engine.');

const spanishCupFixtures=createForeignDomesticCupFixtures('라리가','레알 마드리드',2,europeanLeagues.find(x=>x.name==='라리가').clubs);
assert.equal(spanishCupFixtures.status['코파 델 레이'],'진행 중','Spanish cup uses the configured provisional 2026-27 calendar anchor');
assert.ok(spanishCupFixtures.fixtures.some(f=>f.type==='수페르코파 데 에스파냐'||f.type==='코파 델 레이'),'foreign domestic competition status is available for the season');
const italianSuperCup=createForeignDomesticCupFixtures('세리에 A','인터 밀란',1,europeanLeagues.find(x=>x.name==='세리에 A').clubs);assert.equal(italianSuperCup.fixtures.find(f=>f.type==='수페르코파 이탈리아나')?.round,'준결승','Italian Super Cup is scheduled as a four-team semifinal/final tournament');assert.equal(italianSuperCup.fixtures.find(f=>f.type==='수페르코파 이탈리아나')?.day,168,'Italian Super Cup semifinal follows the 16 December 2026 calendar anchor');
console.log('Domestic cup schedule regression passed: provisional Spanish cup calendar anchor and Italian Super Cup dates are present.');

const negotiationBase={...featureBase,transferBudget:1000000000000,lastDay:0};
const counterNegotiation=makeTransferNegotiation(negotiationBase,marketForward.id,100000000);
assert.ok(counterNegotiation.counter&&counterNegotiation.gm.pendingTransferNegotiation.counterOffer>counterNegotiation.gm.pendingTransferNegotiation.offer,'low transfer offers receive a club counter-offer');
const acceptedNegotiation=resolveTransferNegotiation(counterNegotiation.gm,'accept');
assert.ok(acceptedNegotiation.gm?.squad.some(p=>p.marketId===marketForward.id),'accepting a transfer counter-offer completes the signing');
const loanResult=makeLoanOffer(negotiationBase,marketForward.id,52);
assert.ok(loanResult.gm?.squad.some(p=>p.loan?.marketId===marketForward.id),'loan offers create a temporary loan player in the squad');
const listedResult=setPlayerTransferStatus(negotiationBase,negotiationBase.squad[0].id,'이적 명단');
assert.equal(listedResult.gm.squad[0].marketStatus,'이적 명단','players can be placed on the transfer list');
console.log('Transfer and loan regression passed: counter-offers, accepted negotiations, incoming loans and player listing.');


// 2026-27 workload, injury-proneness, external offers, save migration and AI market.
assert.ok(positionWorkloadMultiplier({position:'수비'},'센터백')<positionWorkloadMultiplier({position:'수비'},'풀백'),'centre-backs consume less stamina than full-backs');
const measuredFatigue=recordPlayerMatchStats([{id:'fitness-player',name:'Fitness Player',position:'수비',rating:70,fitness:100,attributes:{endurance:90},positionDetail:'센터백'}],0,{starters:['fitness-player'],day:44,playerFitness:{'fitness-player':100},liveFitness:{'fitness-player':87}});
assert.equal(measuredFatigue[0].fitness,87,'position/endurance-based live fitness is persisted after the match rather than replaced by a random drain');
const minute90Player=recordPlayerMatchStats([{id:'minute90-player',name:'Minute 90',position:'공격',rating:65,fitness:90}],0,{day:45,starters:[],substitutions:['minute90-player'],substitutionRecords:[{outId:'starter',inId:'minute90-player',minute:90}],liveFitness:{'minute90-player':90},playerFitness:{'minute90-player':90}});assert.equal(minute90Player[0].seasonMinutes,1,'a 90th-minute substitute receives a one-minute appearance');
const ironman=assignSquadRoles([{id:'ironman-test',name:'Ironman',position:'수비',seasonMinutes:2500,injuryHistory:[]}])[0];
const recurring=assignSquadRoles([{id:'recurring-test',name:'Recurring',position:'공격',injuryHistory:[{type:'근육 손상'},{type:'발목 부상'},{type:'타박상'}]}])[0];
assert.equal(ironman.injuryFrequency,'철강왕','high exposure without injury history produces the hidden ironman trait');
assert.equal(recurring.injuryFrequency,'잔부상 많음','repeated minor injuries produce the hidden frequent-injury trait');
const oldRandomForOffers=Math.random;Math.random=()=>0;const listedCareer={...featureBase,season:1,seasonStartYear:2026,lastDay:30,pendingExternalOffers:[],squad:featureBase.squad.map(p=>({...p,marketStatus:'이적 명단'}))};const generatedOffers=generateExternalOffers(listedCareer);Math.random=oldRandomForOffers;assert.ok(generatedOffers.pendingExternalOffers.length>0,'transfer-listed players receive external club approaches during a transfer window');
const externalPlayer=negotiationBase.squad[0];
const externalBase={...negotiationBase,pendingExternalOffers:[{id:'external-test',playerId:externalPlayer.id,playerName:externalPlayer.name,club:'상대 구단',kind:'이적',fee:900000000}]};
const externalAccepted=resolveExternalOffer(externalBase,'external-test','accept');
assert.ok(!externalAccepted.gm.squad.some(p=>p.id===externalPlayer.id),'accepting an external transfer offer removes the sold player');
assert.equal(externalAccepted.gm.transferBudget,externalBase.transferBudget+900000000,'external transfer income is added to the club budget');
const externalRejected=resolveExternalOffer(externalBase,'external-test','reject');
assert.ok(externalRejected.gm.squad.find(p=>p.id===externalPlayer.id).morale<=(externalPlayer.morale??70)-2,'rejecting a player transfer request can reduce that player morale');
const savedFixtureCareer={...featureBase,season:1,seasonStartYear:2026,calendarVersion:1,calendarEvents:[],fixtures:featureBase.fixtures.map(f=>({...f}))};
const migratedCalendar=migrateCalendarState(savedFixtureCareer);
assert.ok(migratedCalendar.calendarEvents.length>0,'existing 2026-27 saves receive the updated unified calendar');
assert.ok(migratedCalendar.fixtures.filter(f=>f.type==='리그').every(f=>f.day===createSeason(featureBase.tier,featureBase.club,1).find(x=>x.type==='리그'&&x.round===f.round)?.day),'existing unplayed league fixtures are migrated to the new round dates');
const {COMPLETE_2026_27_CALENDAR}=await import('../src/season-calendar.js');
assert.ok(COMPLETE_2026_27_CALENDAR.some(e=>e.competition==='A매치 휴식기'),'international breaks are included in the season calendar');
assert.ok(COMPLETE_2026_27_CALENDAR.some(e=>e.competition==='UEFA 슈퍼컵'),'UEFA Super Cup is included in the season calendar');
assert.ok(COMPLETE_2026_27_CALENDAR.some(e=>e.competition==='유로파리그'&&e.round.includes('리그 페이즈 MD1')),'Europa League league phase is in the unified calendar');
assert.ok(COMPLETE_2026_27_CALENDAR.some(e=>e.competition==='컨퍼런스리그'&&e.round.includes('리그 페이즈 MD6')),'Conference League league phase is in the unified calendar');
assert.equal(COMPLETE_2026_27_CALENDAR.find(e=>e.competition==='A매치 휴식기'&&e.round.includes('9월')).date,'2026.09.21','September international window uses the supplied 2026-27 calendar date');
assert.equal((await import('../src/season-calendar.js')).calendarForSeason(2).find(e=>e.competition==='A매치 휴식기'&&e.round.includes('9월')).date,'2027.09.21','calendar dates roll forward for subsequent career seasons');
const conferenceBase=createManager('unknown','게겐프레싱');const conferenceOffer={id:'conference-calendar-test',club:'브라이턴',tier:1,league:'프리미어리그',leagueClubs:leagueData[0].clubs,isForeign:false,salary:100,budget:100,years:2,rep:70,expectations:{},signingBonus:0};const conferenceCareer=acceptOffer({...conferenceBase,offers:[conferenceOffer]},conferenceOffer.id);assert.equal(conferenceCareer.europeanCompetition.fixtures.length,6,'Conference League has a six-match league phase');assert.ok(conferenceCareer.europeanCompetition.fixtures.every(f=>f.day>=100&&f.day<=180),'Conference League fixtures use the scheduled autumn dates');
const barcelonaClubs=europeanLeagues.find(l=>l.name==='라리가').clubs;const barcelonaCareer={...featureBase,isForeign:true,club:'바르셀로나',tier:1,leagueName:'라리가',leagueClubs:barcelonaClubs,season:1,seasonStartYear:2026,played:38,w:18,d:12,l:8,gf:0,ga:100,pts:66,table:barcelonaClubs.map(name=>({name,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0})),security:85,morale:75,boardExpectationRank:1};const barcelonaSeason=closeSeason(barcelonaCareer);assert.equal(barcelonaSeason.record.position,9,'the Barcelona board test case finishes ninth');assert.equal(barcelonaSeason.gm.status,'경질','finishing ninth at a title-expectation club triggers dismissal');assert.equal(barcelonaSeason.gm.club,null,'dismissed manager leaves the club');assert.ok(barcelonaClubs.every(name=>barcelonaSeason.gm.aiClubFinance?.[name]),'every club in the managed league receives a performance-based transfer budget');assert.ok(Array.isArray(barcelonaSeason.gm.aiTransferLedger),'AI club transfer activity persists in the career save');
console.log('2026-27 workload, injury, external transfer, save migration and calendar tests passed.');
