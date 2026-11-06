# 3·4단계 구현 보고서

## 3단계 — 2026–27 시즌 일정

- 5대 리그의 시즌 개막·최종 라운드 날짜를 2026–27 공식 발표 일정에 맞춰 조정.
- 리그 경기일은 주말 중심으로 배치하고, A매치 휴식기 및 해당 리그의 겨울 휴식 구간을 피해 배정.
- UEFA 챔피언스리그·유로파리그·컨퍼런스리그 리그 페이즈 및 토너먼트 일정 수정.
- DFB 포칼 슈퍼컵 참가팀의 1라운드 연기 일정 반영.
- 컵대회 날짜는 공식 확정일과 기준 일정(변동 가능)을 구분.
- 컵대회 화면에 통합 일정과 감독 구단의 실제 예정 경기를 함께 표시.
- 시즌이 바뀌면 일정 날짜가 시즌 시작 연도 기준으로 자동 이동.

### 5대 리그 시즌 앵커

| 리그 | 개막 | 최종 라운드 | 경기 수 |
|---|---|---|---:|
| 프리미어리그 | 2026-08-21 | 2027-05-30 | 38 |
| 라리가 | 2026-08-14 | 2027-05-30 | 38 |
| 분데스리가 | 2026-08-28 | 2027-05-22 | 34 |
| 세리에 A | 2026-08-23 | 2027-05-30 | 38 |
| 리그 1 | 2026-08-21 | 2027-05-29 | 34 |

개별 라운드의 게임 내 날짜는 공식 라운드 앵커를 기준으로 생성한 일정이며, 모든 구단의 실제 확정 킥오프 시각을 복제한 것은 아니다. 국내 컵대회의 일부 라운드 날짜는 대진 추첨 및 방송 일정에 따라 달라질 수 있어 변동 가능 상태로 표시한다.

## 4단계 — 경기 엔진

기존 라이브 경기 기능을 보존하면서 선수 특장점이 경기 계산에 직접 연결되도록 보강.

- 공격 특장점: 침투, 마무리, 슈팅, 컷인, 돌파 등의 득점 확률 반영.
- 창조 특장점: 패스, 플레이메이킹, 크로스, 연계, 탈압박 등의 찬스 생성 및 도움 선택 반영.
- 수비 특장점: 대인 수비, 공중볼, 태클, 압박, 커버, 리더십 등의 상대 득점 확률 감소 반영.
- 골키퍼 특장점: 일대일 선방, 넓은 수비 범위, 반사신경 등의 상대 득점 확률 감소 반영.
- 활동량 특장점: 왕복 활동량 및 오버래핑 등이 경기 중 체력 소모 감소에 반영.
- 선수별 평점과 MOM 계산에 특장점의 기여도를 제한적으로 반영.
- 기존 수동 교체 시점, 부상·퇴장, 경기 중 감독 지시, 승부차기 및 골키퍼 코너킥 가담 기능 보존.

## 검증

- `node scripts/phase3-4-regression.mjs`
- `node scripts/player-data-phase1-regression.mjs`
- `node scripts/tactical-board-phase2-regression.mjs`
- `node scripts/smoke-test.mjs`

위 네 가지 검증을 모두 통과했다. Vite 패키지가 프로젝트에 설치되어 있지 않아 `npm run build`는 실행되지 않았다 (`vite: not found`).

## 일정 기준 출처

- Premier League: https://www.premierleague.com/en/news/4468487/dates-for-202627-premier-league-season-confirmed
- LALIGA: https://www.laliga.com/calendar-2026-2027/laliga-easports
- Bundesliga: https://www.bundesliga.com/en/bundesliga/news/calendar-for-2026-27-season-world-cup-34676
- Lega Serie A: https://www.legaseriea.it/serie-a/news/le-date-della-stagione-2026-2027
- Ligue 1: https://ligue1.com/en/articles/l1_article_5292-the-2026-27-ligue-1-mcdonald-s-calendar-is-released
- UEFA Champions League: https://www.uefa.com/uefachampionsleague/news/02a6-20d57cfcd03e-407c22a7f465-1000--2026-27-champions-league-teams-draws-format-final/
- UEFA Europa League: https://www.uefa.com/uefaeuropaleague/news/02a6-20d57d095740-e1e0b3de85df-1000--2026-27-europa-league-teams-dates-draws-format-final/
- UEFA Conference League: https://www.uefa.com/uefaconferenceleague/news/02a6-20d57d15f093-a90cf54c928f-1000--2026-27-conference-league-teams-dates-draws-format-final/
