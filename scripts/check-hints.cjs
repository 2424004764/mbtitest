// Validates hint files: 93 entries, ids 1-93 complete, zh/en lengths sane.
const fs = require('fs');
const root = __dirname + '/..';
const p1 = JSON.parse(fs.readFileSync(root + '/src/data/hints.part1.json', 'utf8'));
const p2 = JSON.parse(fs.readFileSync(root + '/src/data/hints.part2.json', 'utf8'));
const all = { ...p1, ...p2 };
const ids = Object.keys(all).map(Number).sort((a, b) => a - b);
let bad = [];
if (ids.length !== 93) bad.push('total ' + ids.length + ' != 93');
for (let i = 1; i <= 93; i++) {
  const h = all[String(i)];
  if (!h) { bad.push('missing ' + i); continue; }
  if (!h.zh || typeof h.zh !== 'string' || h.zh.length < 15 || h.zh.length > 120) bad.push('zh len ' + i + ' ' + (h.zh || '').length);
  if (!h.en || typeof h.en !== 'string' || h.en.length < 15 || h.en.length > 220) bad.push('en len ' + i + ' ' + (h.en || '').length);
}
if (bad.length) {
  console.error('FAIL:\n' + bad.join('\n'));
  process.exit(1);
}
console.log('OK: 93 hints, all validated');
