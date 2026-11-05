import assert from 'node:assert/strict';
import fs from 'node:fs';
import db from '../data/players/rosters.js';
import { getAllImportedPlayers, normalizeSquad, roleOptionsForPlayer } from '../src/player-data.js';
import { designateClubStar } from '../src/engine.js';

const main = fs.readFileSync(new URL('../src/main.jsx', import.meta.url), 'utf8');
const engine = fs.readFileSync(new URL('../src/engine.js', import.meta.url), 'utf8');
const start = main.indexOf('const FORMATION_SLOTS={');
assert.ok(start >= 0, 'formation slot registry exists');
const bodyStart = main.indexOf('{', start);
const bodyEnd = main.indexOf('\n};', bodyStart);
assert.ok(bodyEnd > bodyStart, 'formation registry is closed');
const registry = Function(`return (${main.slice(bodyStart, bodyEnd + 2)})`)();
assert.ok(Object.keys(registry).length >= 9, 'at least nine formation presets exist');
for (const [name, slots] of Object.entries(registry)) {
  assert.equal(slots.length, 11, `${name} has eleven positions`);
  assert.equal(new Set(slots.map(x => x[0])).size, 11, `${name} slot IDs are unique`);
  assert.ok(slots.every(x => x[3] >= 0 && x[3] <= 100 && x[4] >= 0 && x[4] <= 100), `${name} positions use pitch coordinates`);
}
assert.match(main, /function TacticalBoard\(/, 'tactical board component exists');
assert.match(main, /onDragStart=.*setData\('player'/, 'players can be dragged to the board');
assert.match(main, /onDrop=.*assignLineupPlayer/, 'drop assigns a player to a slot');
assert.match(main, /tactical-fit-score/, 'position and tactical fit is displayed');
assert.match(main, /touchline-starting-xi/, 'starting XI is persisted');
assert.match(main, /touchline-selected-roles/, 'player roles are persisted');
assert.match(engine, /tacticalFit=clamp/, 'tactical philosophy fit affects match ratings');

const all = getAllImportedPlayers();
assert.equal(all.length, 2750);
for (const [club, data] of Object.entries(db.clubs)) {
  const squad = normalizeSquad(data.players);
  const designated = designateClubStar(club, squad);
  assert.equal(designated.filter(p => p.clubStar).length, 1, `${club} has exactly one club star`);
  const star = designated.find(p => p.clubStar);
  assert.ok(star.specialAbilities?.length === 2, `${club} star has two standout abilities`);
}
for (const [name, expected] of [
  ['Bukayo Saka', '왼발 안쪽 침투'],
  ['Cole Palmer', '창의적인 마지막 패스'],
  ['Kylian Mbappé', '폭발적인 가속'],
  ['Lamine Yamal', '왼발 컷인'],
  ['Erling Braut Haaland', '폭발적인 뒷공간 침투'],
  ['Bruno Miguel Borges Fernandes', '킬러 패스'],
  ['Xavi Quentin Shay Simons', '민첩한 드리블'],
]) {
  const player = all.find(p => p.originalName === name);
  assert.ok(player, `${name} exists`);
  assert.ok(player.specialAbilities.includes(expected), `${name} has individualized signature ability`);
}
assert.ok(roleOptionsForPlayer({ positionDetail: '공격형 미드필더' }).includes('트레콰르티스타'));
console.log(`Phase 2 tactical board regression passed: ${Object.keys(registry).length} formations, 96 club stars, ${all.length} players.`);
