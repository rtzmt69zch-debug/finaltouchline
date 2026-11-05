import { spawnSync } from 'node:child_process';
import process from 'node:process';

const suites = [
  'scripts/player-data-phase1-regression.mjs',
  'scripts/tactical-board-phase2-regression.mjs',
  'scripts/phase3-4-regression.mjs',
  'scripts/phase5-6-regression.mjs',
  'scripts/phase7-final-regression.mjs',
  'scripts/transfer-market-search-regression.mjs',
  'scripts/smoke-test.mjs',
];
for (const suite of suites) {
  process.stdout.write(`\n===== ${suite} =====\n`);
  const result = spawnSync(process.execPath, [suite], { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    process.stderr.write(`\nFAILED: ${suite}\n`);
    process.exit(result.status || 1);
  }
}
process.stdout.write('\nALL SUPPORTED REGRESSION SUITES PASSED.\n');
