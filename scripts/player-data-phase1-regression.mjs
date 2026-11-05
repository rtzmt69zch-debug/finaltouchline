import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getAllImportedPlayers, getImportedClubRoster, normalizeSquad } from '../src/player-data.js';
const db=JSON.parse(fs.readFileSync(new URL('../data/players/rosters.json',import.meta.url),'utf8'));
const players=getAllImportedPlayers();
assert.equal(Object.keys(db.clubs).length,96,'all 96 clubs are registered');
assert.equal(players.length,2750,'all imported players normalize');
assert.equal(new Set(players.map(p=>p.id)).size,players.length,'player IDs are unique');
assert.ok(players.every(p=>p.originalName&&p.name&&p.positionDetail&&p.role),'every player retains English identity, Korean display name, and role');
assert.ok(players.every(p=>Array.isArray(p.specialAbilities)&&p.specialAbilities.length===2),'exactly two standout abilities are exposed');
assert.ok(players.every(p=>p.attributes&&Object.keys(p.attributes).length>=20),'detailed attributes exist internally');
assert.ok(players.every(p=>p.currentRating>=0&&p.currentRating<=99&&p.potentialRating>=p.currentRating&&p.potentialRating<=99),'ratings use the 0-99 scale');
const wirtz=players.find(p=>/Florian.*Wirtz/i.test(p.originalName));
assert.equal(wirtz?.currentRating,83,'Wirtz CA 166 is halved');
assert.equal(wirtz?.potentialRating,92.5,'Wirtz PA 185 is halved');
assert.deepEqual(wirtz?.specialAbilities,['킬러 패스','좁은 공간 드리블']);
const z=normalizeSquad([{name:'Warren Zaire-Emery',originalName:'Warren Zaïre-Emery',position:'중원',rating:60,potential:60}])[0];
assert.equal(z.currentRating,77,'Zaïre-Emery CA 154 is halved');
assert.equal(z.PAType,'random','random PA remains randomized');
assert.deepEqual(z.potentialRatingRange,[85,95]);
for(const [league,count] of Object.entries({'프리미어리그':20,'라리가':20,'분데스리가':18,'세리에 A':20,'리그 1':18})){
 const clubs=Object.values(db.clubs).filter(c=>c.league===league);
 assert.equal(clubs.length,count,`${league} club count`);
 assert.ok(clubs.every(c=>c.players.length>=11),`${league} clubs have playable squads`);
}
assert.ok(getImportedClubRoster('리버풀')?.length>=11);
console.log(`Phase 1 player database regression passed: ${players.length} players, 96 clubs, two standout abilities each.`);
