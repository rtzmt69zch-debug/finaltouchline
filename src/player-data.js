// Player model and FotMob-shaped roster normalizer. No remote scraping is performed here.
export const PLAYER_ROLES = {
 '스트라이커':['타겟맨','포쳐','폴스나인','완성형 공격수','침투형 포워드'],
 '윙어':['클래식 윙어','수비형 윙어','인사이드 포워드','인버티드 윙어'],
 '공격형 미드필더':['공격형 미드필더','전진형 플레이메이커','세컨드 스트라이커','트레콰르티스타'],
 '중앙 미드필더':['박스 투 박스','딥라잉 플레이메이커','볼 위닝 미드필더','로밍 플레이메이커'],
 '수비수':['빌드업 센터백','안정형 센터백','윙백','풀백','수비형 풀백','인버티드 풀백'],
 '골키퍼':['골키퍼','스위퍼 키퍼']
};
export const POSITION_ROLE_COMPATIBILITY={
 '스트라이커':PLAYER_ROLES['스트라이커'],'윙어':PLAYER_ROLES['윙어'],
 '공격형 미드필더':PLAYER_ROLES['공격형 미드필더'],'중앙 미드필더':PLAYER_ROLES['중앙 미드필더'],
 '수비수':PLAYER_ROLES['수비수'],'골키퍼':PLAYER_ROLES['골키퍼'],
 '공격': [...PLAYER_ROLES['스트라이커'],...PLAYER_ROLES['윙어']],
 '중원':[...PLAYER_ROLES['공격형 미드필더'],...PLAYER_ROLES['중앙 미드필더']],
 '수비':PLAYER_ROLES['수비수']
};
export function roleOptionsForPlayer(player={}) { const raw=player.positionDetail||player.primaryPosition||player.position||'중앙 미드필더'; const pos=raw==='스트라이커'?'스트라이커':raw==='윙어'?'윙어':raw==='중앙 미드필더'?'중앙 미드필더':raw==='공격형 미드필더'?'공격형 미드필더':raw==='수비수'?'수비수':raw; return POSITION_ROLE_COMPATIBILITY[pos]||POSITION_ROLE_COMPATIBILITY[player.position]||PLAYER_ROLES['중앙 미드필더']; }
export function roleFitMultiplier(player={},assignedRole=player.role) { const options=roleOptionsForPlayer(player); if(!assignedRole)return 1; if(options.includes(assignedRole))return assignedRole===player.role?1.04:1; return .94; }
export const ROLE_POINT_BIAS = {
 '타겟맨':{goal:1.15,assist:.85,shot:1.05,create:.9,duel:1.2},'포쳐':{goal:1.55,assist:.55,shot:1.45,create:.55,duel:.8},'폴스나인':{goal:.72,assist:1.5,shot:.8,create:1.5,duel:.85},'완성형 공격수':{goal:1.2,assist:1.1,shot:1.1,create:1.05,duel:1},'침투형 포워드':{goal:1.4,assist:.8,shot:1.3,create:.8,duel:.9},
 '클래식 윙어':{goal:.8,assist:1.4,shot:.8,create:1.45,duel:.9},'수비형 윙어':{goal:.65,assist:1.05,shot:.65,create:1.05,duel:1.25},'인사이드 포워드':{goal:1.4,assist:.85,shot:1.35,create:.9,duel:.9},'인버티드 윙어':{goal:1.05,assist:1.2,shot:1.05,create:1.25,duel:.9},
 '공격형 미드필더':{goal:.95,assist:1.2,shot:.9,create:1.3,duel:.8},'전진형 플레이메이커':{goal:.8,assist:1.5,shot:.75,create:1.6,duel:.85},'세컨드 스트라이커':{goal:1.3,assist:1.05,shot:1.25,create:1.05,duel:.8},'트레콰르티스타':{goal:1.0,assist:1.55,shot:.95,create:1.65,duel:.65},
 '박스 투 박스':{goal:1,assist:1,shot:1,create:1,duel:1.15},'딥라잉 플레이메이커':{goal:.55,assist:1.35,shot:.55,create:1.5,duel:1},'볼 위닝 미드필더':{goal:.45,assist:.7,shot:.5,create:.7,duel:1.5},'로밍 플레이메이커':{goal:.85,assist:1.3,shot:.8,create:1.45,duel:1},
 '빌드업 센터백':{goal:.25,assist:.8,shot:.2,create:1.25,duel:1.15},'안정형 센터백':{goal:.25,assist:.35,shot:.2,create:.55,duel:1.45},'윙백':{goal:.55,assist:1.3,shot:.55,create:1.35,duel:1.2},'풀백':{goal:.35,assist:.95,shot:.3,create:1,duel:1.25},'수비형 풀백':{goal:.2,assist:.55,shot:.2,create:.75,duel:1.4},'인버티드 풀백':{goal:.3,assist:.85,shot:.35,create:1.25,duel:1.2},'골키퍼':{goal:.01,assist:.08,shot:.01,create:.15,duel:1}
};
import rosterDatabase from '../data/players/rosters.js';
import caPaOverrides from '../data/players/ca-pa-overrides.js';
const stableHash = value => { let h=2166136261; for(const c of String(value)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);} return (h>>>0).toString(36); };
const normalizedPlayerName=name=>String(name||'').toLocaleLowerCase().normalize('NFC').replace(/[áàâäãå]/g,'a').replace(/[éèêë]/g,'e').replace(/[íìîï]/g,'i').replace(/[óòôöõ]/g,'o').replace(/[úùûü]/g,'u').replace(/ñ/g,'n').replace(/ç/g,'c').replace(/ýÿ/g,'y').replace(/[^a-z0-9가-힣]/g,'');
function suppliedRatingOverride(name){
 const key=normalizedPlayerName(name);if(!key)return null;
 if(caPaOverrides[key])return caPaOverrides[key];
 const exact=Object.entries(caPaOverrides).filter(([k,v])=>normalizedPlayerName(v?.name)===key||k===key);
 if(exact.length===1)return exact[0][1];
 const matches=Object.entries(caPaOverrides).filter(([k])=>k&&k.length>=4&&key.endsWith(k));
 if(!matches.length)return null;
 matches.sort((a,b)=>b[0].length-a[0].length);
 const longest=matches[0][0].length;
 const best=matches.filter(([k])=>k.length===longest);
 return best.length===1?best[0][1]:null;
}
function applySuppliedRatingOverride(player){if(player.CA!=null&&player.PA!=null&&player.currentRating!=null&&player.potentialRating!=null)return player;const override=suppliedRatingOverride(player.originalName||player.nameEn||player.name);if(!override)return player;return {...player,CA:override.CA,PA:override.PA,currentRating:override.currentRating,potentialRating:override.potentialRating,PAType:override.PAType,potentialRatingRange:override.potentialRatingRange,rating:override.currentRating,potential:override.potentialRating,ratingBasis:'사용자 제공 CA/PA ÷ 2',verified:true};}
const PLAYER_STYLE_PROFILES={
 wirtz:{positionDetail:'공격형 미드필더',role:'전진형 플레이메이커',secondaryPositions:['중앙 미드필더','윙어'],specialAbilities:['킬러 패스','좁은 공간 드리블'],bias:{passing:13,vision:14,dribbling:12,firstTouch:11,agility:8,longShots:4}},
 szoboszlai:{positionDetail:'중앙 미드필더',role:'박스 투 박스',secondaryPositions:['공격형 미드필더','윙어'],specialAbilities:['왕복 활동량','강력한 중거리 슛'],bias:{endurance:16,longShots:15,passing:8,pace:7,physical:7,vision:5}},
 isak:{positionDetail:'스트라이커',role:'침투형 포워드',secondaryPositions:['윙어'],specialAbilities:['뒷공간 침투','정교한 마무리'],bias:{pace:12,finishing:13,dribbling:10,composure:11,firstTouch:9}},
 kerkez:{positionDetail:'수비수',role:'풀백',secondaryPositions:['윙어'],specialAbilities:['적극적인 오버래핑','강한 대인 압박'],bias:{pace:10,tackling:9,endurance:10,crossing:7,physical:8}},
 frimpong:{positionDetail:'수비수',role:'윙백',secondaryPositions:['윙어'],specialAbilities:['폭발적인 오버래핑','가속 드리블'],bias:{pace:16,dribbling:12,crossing:10,endurance:11,agility:12}},
 macallister:{positionDetail:'중앙 미드필더',role:'딥라잉 플레이메이커',secondaryPositions:['공격형 미드필더'],specialAbilities:['전진 패스','압박 회피'],bias:{passing:12,vision:11,firstTouch:9,tackling:7,longShots:8}},
 vandijk:{positionDetail:'수비수',role:'안정형 센터백',secondaryPositions:[],specialAbilities:['공중볼 장악','수비 리더십'],bias:{defending:15,heading:15,physical:13,passing:9,positioning:14}},
 konate:{positionDetail:'수비수',role:'안정형 센터백',secondaryPositions:[],specialAbilities:['강한 대인 수비','커버 스피드'],bias:{defending:12,physical:13,pace:8,heading:8,tackling:11}},
 alisson:{positionDetail:'골키퍼',role:'스위퍼 키퍼',secondaryPositions:[],specialAbilities:['일대일 선방','넓은 수비 범위'],bias:{reflexes:13,handling:11,oneOnOnes:14,kicking:8,positioning:10}},
 gravenberch:{positionDetail:'중앙 미드필더',role:'로밍 플레이메이커',secondaryPositions:['수비수'],specialAbilities:['볼 운반','압박 탈출'],bias:{dribbling:10,passing:8,vision:7,physical:7,firstTouch:9}},
 ekitike:{positionDetail:'스트라이커',role:'완성형 공격수',secondaryPositions:['윙어'],specialAbilities:['연계 플레이','민첩한 침투'],bias:{finishing:10,dribbling:8,pace:8,firstTouch:9,agility:9}},
 gakpo:{positionDetail:'윙어',role:'인사이드 포워드',secondaryPositions:['스트라이커'],specialAbilities:['안쪽 침투','강한 슈팅'],bias:{finishing:9,dribbling:8,physical:7,pace:6,longShots:6}},
 saka:{positionDetail:'윙어',role:'인사이드 포워드',secondaryPositions:['공격형 미드필더'],specialAbilities:['왼발 안쪽 침투','정교한 감아차기'],bias:{dribbling:12,crossing:10,finishing:10,vision:7,agility:9,pace:8}},
 palmer:{positionDetail:'공격형 미드필더',role:'트레콰르티스타',secondaryPositions:['윙어','중앙 미드필더'],specialAbilities:['창의적인 마지막 패스','침착한 왼발 킥'],bias:{vision:14,passing:12,firstTouch:10,finishing:10,composure:13,longShots:8}},
 mbappe:{positionDetail:'스트라이커',role:'침투형 포워드',secondaryPositions:['윙어'],specialAbilities:['폭발적인 가속','양발 마무리'],bias:{pace:17,finishing:14,dribbling:12,agility:13,composure:10,positioning:11}},
 yamal:{positionDetail:'윙어',role:'인사이드 포워드',secondaryPositions:['공격형 미드필더'],specialAbilities:['왼발 컷인','일대일 드리블'],bias:{dribbling:15,vision:10,crossing:11,agility:13,pace:9,firstTouch:10}},
 alvarez:{positionDetail:'스트라이커',role:'완성형 공격수',secondaryPositions:['공격형 미드필더','윙어'],specialAbilities:['전방 압박','영리한 연계 플레이'],bias:{workRate:0,endurance:11,finishing:10,firstTouch:10,passing:8,positioning:10}},
 nicowilliams:{positionDetail:'윙어',role:'클래식 윙어',secondaryPositions:['스트라이커'],specialAbilities:['폭발적인 스피드','일대일 돌파'],bias:{pace:15,dribbling:13,agility:12,crossing:8,finishing:6}},
 oyarzabal:{positionDetail:'윙어',role:'인사이드 포워드',secondaryPositions:['스트라이커','공격형 미드필더'],specialAbilities:['영리한 문전 침투','왼발 마무리'],bias:{finishing:11,positioning:12,composure:10,firstTouch:8,vision:7}},
 javiermartinez:{positionDetail:'스트라이커',role:'완성형 공격수',secondaryPositions:[],specialAbilities:['강한 전방 압박','민첩한 문전 움직임'],bias:{finishing:13,agility:10,positioning:12,composure:10,physical:7,pace:7}},
 mctominay:{positionDetail:'중앙 미드필더',role:'박스 투 박스',secondaryPositions:['공격형 미드필더'],specialAbilities:['2선 박스 침투','강력한 공중볼 경합'],bias:{physical:12,heading:12,endurance:9,finishing:8,longShots:8,positioning:8}},
 nicopaz:{positionDetail:'공격형 미드필더',role:'전진형 플레이메이커',secondaryPositions:['중앙 미드필더'],specialAbilities:['킬러 패스','왼발 중거리 슛'],bias:{vision:12,passing:11,dribbling:9,longShots:10,firstTouch:9}},
 kane:{positionDetail:'스트라이커',role:'완성형 공격수',secondaryPositions:['공격형 미드필더'],specialAbilities:['연계형 플레이메이킹','정교한 마무리'],bias:{finishing:14,passing:11,vision:10,composure:13,positioning:12,firstTouch:10}},
 dembele:{positionDetail:'윙어',role:'인버티드 윙어',secondaryPositions:['스트라이커'],specialAbilities:['양발 드리블','폭발적인 방향 전환'],bias:{dribbling:15,agility:14,pace:11,firstTouch:9,crossing:7}},
 isco:{positionDetail:'공격형 미드필더',role:'트레콰르티스타',secondaryPositions:['중앙 미드필더'],specialAbilities:['좁은 공간 탈압박','섬세한 전진 패스'],bias:{dribbling:13,firstTouch:14,vision:12,passing:10,agility:9}},
 mitoma:{positionDetail:'윙어',role:'인사이드 포워드',secondaryPositions:[],specialAbilities:['정교한 일대일 돌파','빠른 방향 전환'],bias:{dribbling:14,agility:13,pace:10,firstTouch:8,finishing:7}},
 mcginn:{positionDetail:'중앙 미드필더',role:'박스 투 박스',secondaryPositions:['공격형 미드필더'],specialAbilities:['강한 압박과 볼 경합','과감한 중거리 슛'],bias:{endurance:11,physical:10,tackling:8,longShots:8,aggression:8,passing:5}},
 delimabarbosa:{positionDetail:'스트라이커',role:'침투형 포워드',secondaryPositions:[],specialAbilities:['수비 뒷공간 침투','빠른 문전 마무리'],bias:{finishing:10,positioning:11,pace:8,agility:8,firstTouch:7}},
 nascimentorodrigues:{positionDetail:'스트라이커',role:'타겟맨',secondaryPositions:[],specialAbilities:['강한 피지컬 경합','박스 안 마무리'],bias:{physical:13,strength:12,heading:10,finishing:10,positioning:9}},
 haaland:{positionDetail:'스트라이커',role:'포쳐',secondaryPositions:[],specialAbilities:['폭발적인 뒷공간 침투','강력한 왼발 슈팅'],bias:{pace:15,finishing:17,positioning:16,strength:12,composure:10,heading:9}},
 borgesfernandes:{positionDetail:'공격형 미드필더',role:'전진형 플레이메이커',secondaryPositions:['중앙 미드필더'],specialAbilities:['킬러 패스','과감한 전방 침투'],bias:{vision:14,passing:13,longShots:11,workRate:0,composure:8,finishing:7}},
 wissa:{positionDetail:'스트라이커',role:'침투형 포워드',secondaryPositions:['윙어'],specialAbilities:['공간 침투','빠른 마무리'],bias:{pace:10,finishing:9,positioning:10,agility:8,dribbling:6}},
 gibbswhite:{positionDetail:'공격형 미드필더',role:'전진형 플레이메이커',secondaryPositions:['중앙 미드필더','윙어'],specialAbilities:['공격 전개 패스','좁은 공간 볼 운반'],bias:{vision:11,passing:10,dribbling:9,firstTouch:8,agility:7,longShots:6}},
 quentinshaysimons:{positionDetail:'공격형 미드필더',role:'트레콰르티스타',secondaryPositions:['윙어','중앙 미드필더'],specialAbilities:['민첩한 드리블','전진 패스'],bias:{dribbling:12,agility:12,vision:10,passing:9,pace:8,firstTouch:8}},
 xhaka:{positionDetail:'중앙 미드필더',role:'딥라잉 플레이메이커',secondaryPositions:['수비형 미드필더'],specialAbilities:['정확한 롱패스','경기 템포 조율'],bias:{passing:13,vision:10,positioning:9,longShots:8,physical:5,tackling:5}},
 baena:{positionDetail:'공격형 미드필더',role:'전진형 플레이메이커',secondaryPositions:['윙어','중앙 미드필더'],specialAbilities:['날카로운 스루패스','왼발 크로스'],bias:{vision:12,passing:12,crossing:11,firstTouch:8,dribbling:7}},
 aspas:{positionDetail:'스트라이커',role:'폴스나인',secondaryPositions:['공격형 미드필더','윙어'],specialAbilities:['영리한 연계 플레이','정교한 왼발 슈팅'],bias:{finishing:10,vision:10,firstTouch:10,composure:12,passing:8}},
 budimir:{positionDetail:'스트라이커',role:'타겟맨',secondaryPositions:[],specialAbilities:['공중볼 장악','문전 위치 선정'],bias:{heading:13,positioning:11,physical:9,finishing:9,strength:8}}
};
function applyPlayerStyleProfile(player){const name=normalizedPlayerName(player.originalName||player.nameEn||player.name);const found=Object.entries(PLAYER_STYLE_PROFILES).find(([key])=>name===key||name.endsWith(key));if(!found)return player;const profile=found[1];player.positionDetail=profile.positionDetail;player.primaryPosition=profile.positionDetail;player.role=profile.role;player.secondaryPositions=profile.secondaryPositions;player.specialAbilities=profile.specialAbilities;const base=Number(player.currentRating??player.rating)||60;for(const [key,value] of Object.entries(profile.bias))player.attributes[key]=Math.max(5,Math.min(99,Math.round(base+value)));return player;}
export function playerIdentityId(p={}) {
  if(p.fotmobId!=null && String(p.fotmobId).trim()) return `fotmob:${String(p.fotmobId).trim()}`;
  const base=[p.originalName||p.nameEn||p.name||'',p.nationality||p.cname||'',p.dateOfBirth||p.birthDate||'',p.club||p.teamName||''].join('|').normalize('NFKC').toLocaleLowerCase();
  return `player:${stableHash(base)}`;
}
function broadPosition(detail=''){if(detail==='골키퍼')return '골키퍼';if(['스트라이커','윙어','공격'].includes(detail))return '공격';if(['공격형 미드필더','중앙 미드필더','중원'].includes(detail))return '중원';if(['수비수','수비'].includes(detail))return '수비';return '중원';}
export function normalizePosition(raw='') {
 const s=String(raw).toLowerCase();
 if(/keeper|goalkeeper|골키퍼/.test(s)) return '골키퍼';
 if(/wing|forward|striker|attacker|공격수|윙어/.test(s)) return /wing/.test(s)?'윙어':'스트라이커';
 if(/attacking midfield|공격형 미드필더|trequartista/.test(s)) return '공격형 미드필더';
 if(/midfield|중앙 미드필더|defensive midfield/.test(s)) return '중앙 미드필더';
 if(/defender|back|centre-back|center-back|수비수/.test(s)) return '수비수';
 return '중앙 미드필더';
}
export function normalizeFotMobTeamPayload(payload={}, clubOverride='') {
 const team=payload.details||payload.team||{}; const club=clubOverride||team.name||payload.name||'';
 const groups=payload.squad?.squad||payload.squad||[]; const out=[];
 for(const group of groups){const title=group.title||group.role?.fallback||''; if(/coach|감독/i.test(title)) continue;
  for(const raw of group.members||[]){if(raw.excludeFromRanking||raw.isCoach)continue;
   const role=raw.role?.fallback||raw.role||title; const position=normalizePosition(`${title} ${role}`); const age=Number(raw.age)||null;
   const broadPosition=position==='골키퍼'?'골키퍼':['스트라이커','윙어'].includes(position)?'공격':['공격형 미드필더','중앙 미드필더'].includes(position)?'중원':'수비';
   const p={fotmobId:raw.id==null?null:String(raw.id),name:raw.name||raw.localizedName||'',nationality:raw.cname||raw.country||raw.ccode||'미상',countryCode:raw.ccode||'',dateOfBirth:raw.dateOfBirth||raw.birthDate?.utcTime||null,age,club,teamId:team.id||null,position:broadPosition,positionDetail:position,source:'FotMob',sourceUpdatedAt:new Date().toISOString()};
   p.id=playerIdentityId(p); p.currentRating=estimateBaseRating({...p,position:position}); p.potentialRating=estimatePotentialRating({...p,currentRating:p.currentRating}); p.rating=p.currentRating; p.potential=p.potentialRating; p.role=defaultRole(position,raw); p.fitness=100; p.season={appearances:0,goals:0,assists:0,ratingTotal:0}; out.push(p);
  }
 }
 return {club,teamId:team.id||null,source:'FotMob',updatedAt:new Date().toISOString(),counts:Object.fromEntries(['스트라이커','윙어','공격형 미드필더','중앙 미드필더','수비수','골키퍼'].map(k=>[k,out.filter(p=>p.position===k).length])),players:out};
}
export function estimateBaseRating(p={}) {
 // FotMob squad lists do not guarantee a universal overall rating; this is an explicitly labelled game estimate.
 const age=Number(p.age)||25; const pos=p.position||'중앙 미드필더'; const seed=parseInt(stableHash(`${p.id||p.name}|${pos}`),36)||50;
 const baseline=pos==='골키퍼'?61:pos==='수비수'?60:pos==='스트라이커'?62:61;
 const ageFactor=age<20?-5:age<23?-1:age<=29?3:age<=32?1:-4;
 return Math.max(35,Math.min(91,baseline+ageFactor+(seed%13)-6));
}
export function estimatePotentialRating(p={}) {
 const current=Number(p.currentRating??p.rating)||60, age=Number(p.age);
 const growth=Number.isFinite(age)?(age<19?12:age<22?9:age<25?5:age<28?2:0):2;
 return Math.max(current,Math.min(99,current+growth));
}
export function ratingTier(value) {
 const n=Number(value)||0;
 if(n>=90)return '월드클래스'; if(n>=85)return '최상위권'; if(n>=80)return '상위권';
 if(n>=75)return '준수'; if(n>=70)return '평균 이상'; if(n>=65)return '평균';
 if(n>=55)return '성장형'; return '하위권';
}
export function defaultRole(position, raw={}) {
 const detail=raw.positionDetail||raw.primaryPosition||position; const list=POSITION_ROLE_COMPATIBILITY[detail]||POSITION_ROLE_COMPATIBILITY[position]||PLAYER_ROLES['중앙 미드필더']; const text=String(raw.role?.fallback||raw.role||'').toLowerCase();
 if(position==='골키퍼')return /sweeper/.test(text)?'스위퍼 키퍼':'골키퍼';
 if(position==='윙어')return /left|right wing|winger/.test(text)?'클래식 윙어':'인사이드 포워드';
 if(position==='스트라이커')return /target/.test(text)?'타겟맨':/second/.test(text)?'세컨드 스트라이커':'침투형 포워드';
 if(position==='수비수')return /wing.?back/.test(text)?'윙백':/full.?back/.test(text)?'풀백':/centre|center/.test(text)?'안정형 센터백':'빌드업 센터백';
 if(position==='공격형 미드필더')return '전진형 플레이메이커';
 return list[0];
}
export function rolePointBias(player={}) {return ROLE_POINT_BIAS[player.role]||{goal:1,assist:1,shot:1,create:1,duel:1};}
export const PLAYER_ATTRIBUTE_KEYS=['pace','finishing','passing','defending','physical','endurance','dribbling','vision','firstTouch','heading','tackling','crossing','longShots','positioning','composure','agility','strength','jumping','reflexes','handling','kicking','oneOnOnes'];
const ATTRIBUTE_BIASES={
 '골키퍼':{reflexes:9,handling:7,oneOnOnes:6,positioning:5,kicking:2,finishing:-40,heading:-30},
 '스트라이커':{pace:5,finishing:8,positioning:7,firstTouch:4,dribbling:3,heading:2,defending:-15,tackling:-12},
 '윙어':{pace:8,dribbling:8,agility:7,crossing:4,finishing:4,defending:-12,tackling:-10},
 '공격형 미드필더':{passing:7,vision:8,dribbling:6,firstTouch:6,longShots:3,defending:-5,tackling:-4},
 '중앙 미드필더':{passing:5,vision:4,endurance:6,tackling:4,firstTouch:4,dribbling:2},
 '수비수':{defending:8,tackling:7,heading:5,physical:5,positioning:6,pace:1,finishing:-20}
};
const abilityLabels={pace:'가속력',finishing:'결정력',passing:'패스',defending:'수비',physical:'피지컬',endurance:'지구력',dribbling:'드리블',vision:'시야',firstTouch:'퍼스트 터치',heading:'헤더',tackling:'태클',crossing:'크로스',longShots:'중거리 슛',positioning:'위치 선정',composure:'침착성',agility:'민첩성',strength:'힘',jumping:'점프',reflexes:'반사신경',handling:'볼 처리',kicking:'킥',oneOnOnes:'일대일 방어'};
function inferSpecialAbilities(player={},a={}){
 const detail=player.positionDetail||player.primaryPosition||player.position||'중앙 미드필더';
 const groups=detail==='골키퍼'?[[['reflexes','반사신경 선방'],['oneOnOnes','일대일 방어'],['handling','안정적인 볼 처리'],['kicking','정확한 골킥'],['positioning','골문 위치 선정']]]:detail==='스트라이커'?[[['finishing','정교한 마무리'],['positioning','문전 위치 선정'],['pace','뒷공간 침투'],['heading','공중볼 경합'],['firstTouch','퍼스트 터치 연계'],['composure','침착한 마무리']]]:detail==='윙어'?[[['dribbling','일대일 돌파'],['pace','폭발적인 스피드'],['crossing','정확한 크로스'],['finishing','안쪽 침투 후 슈팅'],['agility','민첩한 방향 전환'],['passing','측면 플레이메이킹']]]:detail==='공격형 미드필더'?[[['vision','킬러 패스'],['passing','전진 패스'],['dribbling','좁은 공간 탈압박'],['firstTouch','섬세한 볼 터치'],['longShots','중거리 슈팅'],['composure','압박 속 침착함']]]:detail==='중앙 미드필더'?[[['passing','전진 패스'],['vision','경기 조율'],['endurance','왕복 활동량'],['tackling','적극적인 볼 탈취'],['dribbling','볼 운반'],['longShots','중거리 슈팅']]]:[[ ['defending','대인 수비'],['tackling','정확한 태클'],['heading','공중볼 장악'],['passing','후방 빌드업'],['pace','넓은 커버 범위'],['physical','강한 피지컬'],['positioning','수비 위치 선정'] ]];
 const ranked=groups[0].map(([key,label])=>({key,label,value:Number(a[key]??0)})).sort((x,y)=>y.value-x.value);
 const chosen=[];for(const item of ranked){if(chosen.length===2)break;if(item.value>=Number(player.currentRating??player.rating??55)-3)chosen.push(item.label);}
 while(chosen.length<2){const item=ranked[chosen.length];chosen.push(item?.label||'포지션 이해도');}
 return chosen;
}

function generatedAttributes(player={},base=60){
 const detail=player.positionDetail||player.primaryPosition||player.position||'중앙 미드필더';
 const bias=ATTRIBUTE_BIASES[detail]||ATTRIBUTE_BIASES[player.position]||ATTRIBUTE_BIASES['중앙 미드필더'];
 return Object.fromEntries(PLAYER_ATTRIBUTE_KEYS.map((key,i)=>{const seed=parseInt(stableHash(`${player.id||player.name}:${key}`),36)||0;const variation=(seed%11)-5;return [key,Math.max(5,Math.min(99,Math.round(base+(bias[key]||0)+variation)))];}));
}
export function playerMatchRating(player={}){
 const a=player.attributes||{};const pos=player.position||'중원';
 const detail=player.positionDetail||player.primaryPosition||'';const groups=pos==='골키퍼'?['reflexes','handling','oneOnOnes','positioning','kicking']:pos==='공격'?(detail==='윙어'?['pace','dribbling','crossing','agility','passing','firstTouch']:['finishing','pace','positioning','firstTouch','composure','heading']):pos==='수비'?['defending','tackling','heading','physical','positioning','pace','passing']:['passing','vision','dribbling','endurance','firstTouch','tackling','longShots'];
 const values=groups.map(k=>Number(a[k]??player[k]??65));const mean=values.reduce((x,y)=>x+y,0)/values.length;
 const abilities=(player.specialAbilities||[]).map(String);let special=0;for(const ability of abilities){if(/패스|플레이메이킹|킬러/.test(ability)&&['중원','공격'].includes(pos))special+=.55;if(/드리블|볼 운반|압박 탈출/.test(ability)&&['중원','공격'].includes(pos))special+=.45;if(/중거리|슈팅/.test(ability)&&['중원','공격'].includes(pos))special+=.5;if(/지구력|왕복 활동량|오버래핑/.test(ability)&&pos!=='골키퍼')special+=.4;if(/침투|마무리/.test(ability)&&pos==='공격')special+=.5;if(/공중볼|헤더|대인 수비|수비 리더십|태클/.test(ability)&&pos==='수비')special+=.5;if(/선방|반사신경|일대일/.test(ability)&&pos==='골키퍼')special+=.65;}special=Math.min(1.5,special);
 const base=Number(player.rating??player.currentRating)||50;
 return Math.max(20,Math.min(99,base+(mean-70)*.075+special));
}
export function normalizeSquad(players=[]){return players.map(p=>{const x=applySuppliedRatingOverride({...p});x.nameKo=x.nameKo||x.name;x.name=x.originalName||x.nameEn||x.name;x.id=x.id&&x.id!=='seed:'?x.id:playerIdentityId(x);const dob=x.dateOfBirth||x.birthDate||x.date_of_birth||null;if(dob){const raw=typeof dob==='string'?dob:(dob.utcTime||dob.date||'');const normalizedDate=/^\d{2}\.\d{2}\.\d{4}$/.test(raw)?raw.split('.').reverse().join('-'):raw;const parsed=new Date(normalizedDate);if(!Number.isNaN(parsed.getTime())){const now=new Date();x.birthYear=parsed.getUTCFullYear();x.age=now.getUTCFullYear()-parsed.getUTCFullYear()-((now.getUTCMonth()<parsed.getUTCMonth()||(now.getUTCMonth()===parsed.getUTCMonth()&&now.getUTCDate()<parsed.getUTCDate()))?1:0);x.dateOfBirth=normalizedDate;}}else if(x.age===0||x.age===''||x.age===undefined)x.age=null;if(!Number.isInteger(x.birthYear)&&Number.isInteger(x.yearOfBirth))x.birthYear=x.yearOfBirth;x.currentRating=Number(x.currentRating??x.rating)||estimateBaseRating(x);x.potentialRating=Number(x.potentialRating??x.potential)||estimatePotentialRating({...x,currentRating:x.currentRating});x.rating=x.currentRating;x.potential=x.potentialRating;x.fitness=Math.max(0,Math.min(100,Number(x.fitness??100)));const rawDetail=x.positionDetail||x.primaryPosition||(['골키퍼','스트라이커','윙어','공격형 미드필더','중앙 미드필더','수비수'].includes(x.position)?x.position:normalizePosition(x.rawPosition));x.positionDetail=rawDetail;x.primaryPosition=x.primaryPosition||x.positionDetail;x.position=broadPosition(rawDetail);x.role=x.role||defaultRole(x.positionDetail);x.secondaryPositions=Array.isArray(x.secondaryPositions)?x.secondaryPositions:[];x.hiddenConsistency=Number(x.hiddenConsistency??(55+(parseInt(stableHash(x.id),36)%41)));x.attributes={...generatedAttributes(x,x.currentRating),...(x.attributes||{})};x.specialAbilities=Array.isArray(x.specialAbilities)&&x.specialAbilities.length?x.specialAbilities.slice(0,2):inferSpecialAbilities(x,x.attributes);applyPlayerStyleProfile(x);x.specialAbilities=(x.specialAbilities||[]).slice(0,2);x.injuryFrequency=x.injuryFrequency||'보통';x.season={appearances:0,goals:0,assists:0,ratingTotal:0,...(x.season||{})};return x;});}

export function getImportedClubRoster(club) { const file=rosterDatabase.clubs?.[club]; return file?.players?.length>=11?normalizeSquad(file.players):null; }
export function getAllImportedPlayers(){return Object.values(rosterDatabase.clubs||{}).flatMap(file=>normalizeSquad((file.players||[]).map(p=>({...p,league:p.league||file.league,club:p.club||file.club}))));}
export function getImportedClubRosterData(club) { return rosterDatabase.clubs?.[club]||null; }
export function importedRosterSummary(){return Object.values(rosterDatabase.clubs||{}).map(x=>({club:x.club,count:x.players?.length||0,counts:x.counts||{}}));}
