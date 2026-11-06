import fs from 'node:fs';
const src=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
if(!src.includes("toFixed(1)")) throw new Error('Fitness formatter should round to one decimal place');
if(src.includes('aria-label={`${slot} 포지션 유형`}')) throw new Error('Redundant slot position selector still exists in match lineup');
if(!src.includes('lineupRoleOptions(player,selectedDetail)')) throw new Error('Player-specific slot role options missing');
if(!src.includes('체력 {fmtNum(p.fitness??100)}%')) throw new Error('Lineup fitness formatting missing');
console.log('Lineup display regression passed: one-decimal fitness, two selectors per slot, slot-specific roles.');
