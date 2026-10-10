// Dev helper: dumps "id | 中文 || English" lines for hint-writing.
const fs = require('fs');
const root = __dirname + '/..';
const SQ = String.fromCharCode(39); // '
const BS = String.fromCharCode(92); // backslash
const ESC = String.fromCharCode(1);

const strip = (s) => s.split(BS + SQ).join(ESC);
const rx = /id: (\d+), text: '([^']+)', dim: '\w+'/g;
const grab = (s) => {
  const o = {};
  let m;
  while ((m = rx.exec(s)) !== null) o[m[1]] = m[2].split(ESC).join(SQ);
  return o;
};

const qz = grab(strip(fs.readFileSync(root + '/src/data/questions.zh.ts', 'utf8')));
const qe = grab(strip(fs.readFileSync(root + '/src/data/questions.en.ts', 'utf8')));
const ids = Object.keys(qz);
if (ids.length !== 93) {
  console.error('expected 93 questions, got ' + ids.length);
  process.exit(1);
}
const out = ids.map((id) => id + ' | ' + qz[id] + ' || ' + qe[id]).join('\n');
fs.writeFileSync(root + '/questions-list.txt', out);
console.log('count:', ids.length);
