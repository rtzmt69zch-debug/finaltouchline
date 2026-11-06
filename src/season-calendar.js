// Unified 2026-27 calendar. Dates are scheduling anchors, not claims that every
// tie is officially fixed to that exact day. Each later career season shifts by one year.
const dayOffset=(month,day,startYear=2026)=>{
  const year=month>=7?startYear:startYear+1;
  return Math.round((Date.UTC(year,month-1,day)-Date.UTC(startYear,6,1))/86400000);
};
const dateText=(month,day,startYear=2026)=>`${month>=7?startYear:startYear+1}.${String(month).padStart(2,'0')}.${String(day).padStart(2,'0')}`;
const event=(month,day,competition,round,kind='cup',extra={})=>({day:dayOffset(month,day),date:dateText(month,day),competition,round,kind,dateStatus:kind==='league'||kind==='uefa'||kind==='international'||competition==='UEFA 슈퍼컵'||(kind==='final'&&['챔피언스리그','유로파리그','컨퍼런스리그'].includes(competition))?'공식 일정':'기준 일정(변동 가능)',...extra});
const span=(month,first,last)=>Array.from({length:last-first+1},(_,i)=>event(month,first+i,'A매치 휴식기',`${month}월 A매치 · ${first+i}일`,'international'));

export const INTERNATIONAL_BREAKS=[
 {start:dayOffset(9,21),end:dayOffset(10,6),label:'9월 21일~10월 6일 통합 A매치 휴식기'},
 {start:dayOffset(11,9),end:dayOffset(11,17),label:'11월 A매치 휴식기'},
 {start:dayOffset(3,22),end:dayOffset(3,30),label:'3월 A매치 휴식기'}
];
export const LEAGUE_SEASON_DATES={
 프리미어리그:{start:[8,21],end:[5,30],rounds:38},
 라리가:{start:[8,14],end:[5,30],rounds:38},
 분데스리가:{start:[8,28],end:[5,22],rounds:34},
 세리에A:{start:[8,23],end:[5,30],rounds:38},
 리그1:{start:[8,21],end:[5,29],rounds:34}
};
export const LEAGUE_BREAK_ROUNDS={프리미어리그:[5,10,30],라리가:[7,12,29],분데스리가:[4,9,27],세리에A:[4,11,29],리그1:[5,10,27]};

const uclLeaguePhase=[
 [9,8,'리그 페이즈 MD1 · 9월 8~10일'],[10,13,'리그 페이즈 MD2 · 10월 13~14일'],
 [10,20,'리그 페이즈 MD3 · 10월 20~21일'],[11,3,'리그 페이즈 MD4 · 11월 3~4일'],
 [11,24,'리그 페이즈 MD5 · 11월 24~25일'],[12,8,'리그 페이즈 MD6 · 12월 8~9일'],
 [1,19,'리그 페이즈 MD7 · 1월 19~20일'],[1,27,'리그 페이즈 MD8 · 1월 27일']
];
const uelLeaguePhase=[
 [9,16,'리그 페이즈 MD1 · 9월 16~17일'],[10,15,'리그 페이즈 MD2 · 10월 15일'],
 [10,22,'리그 페이즈 MD3 · 10월 22일'],[11,5,'리그 페이즈 MD4 · 11월 5일'],
 [11,26,'리그 페이즈 MD5 · 11월 26일'],[12,10,'리그 페이즈 MD6 · 12월 10일'],
 [1,21,'리그 페이즈 MD7 · 1월 21일'],[1,28,'리그 페이즈 MD8 · 1월 28일']
];
const ueclLeaguePhase=[
 [10,15,'리그 페이즈 MD1 · 10월 15일'],[10,22,'리그 페이즈 MD2 · 10월 22일'],
 [11,5,'리그 페이즈 MD3 · 11월 5일'],[11,26,'리그 페이즈 MD4 · 11월 26일'],
 [12,10,'리그 페이즈 MD5 · 12월 10일'],[12,17,'리그 페이즈 MD6 · 12월 17일']
];
const uclKnockouts=[
 [2,16,'플레이오프 1차전 · 2월 16~17일'],[2,23,'플레이오프 2차전 · 2월 23~24일'],
 [3,9,'16강 1차전 · 3월 9~10일'],[3,16,'16강 2차전 · 3월 16~17일'],
 [4,6,'8강 1차전 · 4월 6~7일'],[4,13,'8강 2차전 · 4월 13~14일'],
 [4,27,'4강 1차전 · 4월 27~28일'],[5,4,'4강 2차전 · 5월 4~5일']
];
const uelKnockouts=[
 [2,18,'플레이오프 1차전'],[2,25,'플레이오프 2차전'],
 [3,11,'16강 1차전'],[3,18,'16강 2차전'],
 [4,8,'8강 1차전'],[4,15,'8강 2차전'],
 [4,29,'4강 1차전'],[5,6,'4강 2차전']
];
export const EUROPEAN_DATES=[
 event(8,12,'UEFA 슈퍼컵','결승','supercup'),
 ...uclLeaguePhase.map(([m,d,r])=>event(m,d,'챔피언스리그',r,'uefa')),
 ...uelLeaguePhase.map(([m,d,r])=>event(m,d,'유로파리그',r,'uefa')),
 ...ueclLeaguePhase.map(([m,d,r])=>event(m,d,'컨퍼런스리그',r,'uefa')),
 ...uclKnockouts.map(([m,d,r])=>event(m,d,'챔피언스리그',r,'uefa')),
 ...uelKnockouts.map(([m,d,r])=>event(m,d,'유로파리그',r,'uefa')),
 ...uelKnockouts.map(([m,d,r])=>event(m,d,'컨퍼런스리그',r,'uefa')),
 event(5,26,'유로파리그','결승','final'),event(6,2,'컨퍼런스리그','결승','final'),event(6,5,'챔피언스리그','결승','final')
];
export const DOMESTIC_CUPS={
 잉글랜드:[
  event(8,16,'커뮤니티 실드','결승','supercup'),
  event(8,24,'카라바오컵','2라운드'),
  event(9,7,'카라바오컵','3라운드 · 9월 7~16일'),event(9,16,'카라바오컵','3라운드 추가 일정'),
  event(10,28,'카라바오컵','4라운드'),event(12,16,'카라바오컵','5라운드'),
  event(1,13,'카라바오컵','4강 1차전'),event(2,3,'카라바오컵','4강 2차전'),event(3,21,'카라바오컵','결승','final'),
  event(11,7,'FA컵','1라운드'),event(12,5,'FA컵','2라운드'),event(1,9,'FA컵','3라운드'),
  event(2,13,'FA컵','4라운드'),event(3,6,'FA컵','5라운드'),event(4,3,'FA컵','8강'),
  event(4,24,'FA컵','4강'),event(5,22,'FA컵','결승','final')
 ],
 스페인:[
  {...event(9,1,'코파 델 레이','초기 라운드 · 대진 추첨 후 배정'),date:'미정',dateStatus:'미정'},
  {...event(12,1,'코파 델 레이','라리가 구단 참가 라운드 · 대진 추첨 후 배정'),date:'미정',dateStatus:'미정'},
  event(2,2,'수페르코파 데 에스파냐','준결승 1','supercup'),
  event(2,3,'수페르코파 데 에스파냐','준결승 2','supercup'),
  event(2,6,'수페르코파 데 에스파냐','결승','final'),
  event(4,24,'코파 델 레이','결승','final')
 ],
 독일:[
  event(8,22,'DFL 슈퍼컵','결승','supercup'),
  event(8,21,'DFB 포칼','1라운드 · 8월 21~24일'),event(9,1,'DFB 포칼','슈퍼컵 참가팀 1라운드 일정'),event(9,2,'DFB 포칼','슈퍼컵 참가팀 1라운드 일정'),
  event(10,27,'DFB 포칼','2라운드'),event(10,28,'DFB 포칼','2라운드 추가 일정'),
  event(12,12,'DFB 포칼','16강'),
  event(2,2,'DFB 포칼','8강 1차 일정'),event(2,10,'DFB 포칼','8강 2차 일정'),
  event(4,20,'DFB 포칼','4강'),event(4,21,'DFB 포칼','4강 추가 일정'),event(5,29,'DFB 포칼','결승','final')
 ],
 이탈리아:[
  event(8,9,'코파 이탈리아','예선'),event(8,16,'코파 이탈리아','32강'),
  event(9,2,'코파 이탈리아','16강 진출 라운드'),event(9,15,'코파 이탈리아','16강 진출 라운드 추가 일정'),
  event(12,11,'코파 이탈리아','16강'),
  event(2,3,'코파 이탈리아','8강 1차 일정'),event(2,10,'코파 이탈리아','8강 2차 일정'),
  event(3,3,'코파 이탈리아','4강 1차전'),event(4,21,'코파 이탈리아','4강 2차전'),event(5,19,'코파 이탈리아','결승','final'),
  {...event(8,1,'수페르코파 이탈리아나','일정 미정','supercup'),date:'미정',dateStatus:'미정'}
 ],
 프랑스:[
  event(8,15,'트로페 데 샹피옹','결승','supercup'),
  event(11,14,'쿠프 드 프랑스','7라운드'),event(11,28,'쿠프 드 프랑스','8라운드'),
  event(12,19,'쿠프 드 프랑스','64강 1차 일정'),event(12,20,'쿠프 드 프랑스','64강 2차 일정'),
  event(1,9,'쿠프 드 프랑스','32강 1차 일정'),event(1,10,'쿠프 드 프랑스','32강 2차 일정'),
  event(2,3,'쿠프 드 프랑스','16강'),event(3,3,'쿠프 드 프랑스','8강'),
  event(4,21,'쿠프 드 프랑스','4강'),event(5,15,'쿠프 드 프랑스','결승','final')
 ]
};
export const ALL_CUP_EVENTS=Object.values(DOMESTIC_CUPS).flat().map(e=>({...e,dateStatus:e.dateStatus||'기준 일정(변동 가능)'})).sort((a,b)=>a.day-b.day);
export const LEAGUE_CALENDAR_EVENTS=Object.entries(LEAGUE_SEASON_DATES).flatMap(([key,config])=>{const league=key==='세리에A'?'세리에 A':key==='리그1'?'리그 1':key;return [event(...config.start,league,'개막 라운드','league'),event(...config.end,league,'최종 라운드','league')];});
export const INTERNATIONAL_EVENTS=INTERNATIONAL_BREAKS.flatMap(b=>{const start=new Date(Date.UTC(2026,6,1+b.start));const end=new Date(Date.UTC(2026,6,1+b.end));const fmt=d=>`${d.getUTCFullYear()}.${String(d.getUTCMonth()+1).padStart(2,'0')}.${String(d.getUTCDate()).padStart(2,'0')}`;return [{day:b.start,date:fmt(start),competition:'A매치 휴식기',round:b.label,kind:'international',endDay:b.end,endDate:fmt(end)}];});
export const COMPLETE_2026_27_CALENDAR=[...LEAGUE_CALENDAR_EVENTS,...EUROPEAN_DATES,...ALL_CUP_EVENTS,...INTERNATIONAL_EVENTS].sort((a,b)=>a.day-b.day);
export function calendarForCountry(country='잉글랜드'){return [...(DOMESTIC_CUPS[country]||[]),...LEAGUE_CALENDAR_EVENTS,...EUROPEAN_DATES,...INTERNATIONAL_EVENTS].sort((a,b)=>a.day-b.day);}
export function calendarForSeason(season=1){
 const startYear=2026+Math.max(0,Number(season||1)-1);
 return COMPLETE_2026_27_CALENDAR.map(item=>{
  const match=String(item.date||'').match(/^(\d{4})\.(\d{2})\.(\d{2})$/);
  if(!match&&item.dateStatus==='미정')return {...item,day:item.day+Math.round((Date.UTC(startYear,6,1)-Date.UTC(2026,6,1))/86400000),date:'미정'};
  const month=match?Number(match[2]):7,day=match?Number(match[3]):1;
  const shifted={...item,day:dayOffset(month,day,startYear),date:dateText(month,day,startYear)};
  if(Number.isFinite(item.endDay)){
   const endDate=new Date(Date.UTC(2026,6,1+item.endDay));const em=endDate.getUTCMonth()+1,ed=endDate.getUTCDate();
   shifted.endDay=dayOffset(em,ed,startYear);shifted.endDate=dateText(em,ed,startYear);
  }
  shifted.round=String(item.round||'').replace(/2027년/g,`${startYear+1}년`);
  return shifted;
 });
}
