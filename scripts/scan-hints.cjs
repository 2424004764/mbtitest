// Scans hints for answer-instruction phrasing inconsistent with the agree/disagree scale.
const fs = require('fs');
const root = __dirname + '/..';
const p1 = JSON.parse(fs.readFileSync(root + '/src/data/hints.part1.json', 'utf8'));
const p2 = JSON.parse(fs.readFileSync(root + '/src/data/hints.part2.json', 'utf8'));
const all = { ...p1, ...p2 };

const zhRules = [
  { re: /选不符合|选符合/g, tag: 'ANSWER-INSTRUCTION' },
  { re: /.{0,14}符合.{0,10}/g, tag: 'contains-符合' },
  { re: /选否|答否|选“是”|选"是"|选是/g, tag: 'yes-no' },
];
const enRules = [
  { re: /answer (no|yes|'|")/gi, tag: 'answer no/yes' },
  { re: /.{0,20}(counts|count yourself|doesn't count|does not count).{0,25}/gi, tag: 'counts-phrasing' },
];

const hits = [];
for (const id of Object.keys(all).sort((a, b) => a - b)) {
  const h = all[id];
  for (const r of zhRules) {
    const m = h.zh.match(r.re);
    if (m) hits.push({ id, tag: r.tag, lang: 'zh', hits: [...new Set(m)].join(' | '), text: h.zh });
  }
  for (const r of enRules) {
    const m = h.en.match(r.re);
    if (m) hits.push({ id, tag: r.tag, lang: 'en', hits: [...new Set(m)].join(' | '), text: h.en });
  }
}
for (const h of hits) console.log(`#${h.id} [${h.lang}] ${h.tag}\n   ${h.text}\n`);
console.log('total hits:', hits.length);
