// One-time fix: align all hint answer-instructions with the agree/disagree scale.
const fs = require('fs');
const root = __dirname + '/..';
const f1 = root + '/src/data/hints.part1.json';
const f2 = root + '/src/data/hints.part2.json';
const p1 = JSON.parse(fs.readFileSync(f1, 'utf8'));
const p2 = JSON.parse(fs.readFileSync(f2, 'utf8'));
const all = { ...p1, ...p2 };

let fixes = 0;
const fail = [];

function sub(id, lang, oldStr, newStr) {
  const h = all[id];
  if (!h) { fail.push(`#${id} missing`); return; }
  if (!h[lang].includes(oldStr)) { fail.push(`#${id} ${lang} pattern not found: ${oldStr.slice(0, 40)}`); return; }
  h[lang] = h[lang].replace(oldStr, newStr);
  fixes++;
}

/* ---- A. zh mechanical: 选不符合 → 选不同意 ---- */
for (const id of Object.keys(all)) {
  const before = all[id].zh;
  let s = before.replace(/选不符合/g, '选不同意');
  s = s.replace(/的人选不同意/g, '的人可选不同意');
  if (s !== before) { all[id].zh = s; fixes++; }
}

/* ---- B. en mechanical: answer no. → answer 'disagree'. ---- */
for (const id of Object.keys(all)) {
  const before = all[id].en;
  const s = before.replace(/answer no\./g, "answer 'disagree'.");
  if (s !== before) { all[id].en = s; fixes++; }
}

/* ---- C. zh special rewrites ---- */
sub('4',  'zh', '偶尔调整计划仍算符合，完全随心情走才算不符合。', '偶尔调整计划仍可选同意；完全随心情走，更接近不同意。');
sub('27', 'zh', '喜欢在心里推演各种情景的人就算符合，不必真的付诸行动。', '喜欢在心里推演各种情景的人可选同意，不必真的付诸行动。');
sub('36', 'zh', '慢热但熟了之后很能聊，也算符合。', '慢热但熟了之后很能聊，仍可选同意。');
sub('45', 'zh', '心里紧张但结果不受影响，也算符合。', '心里紧张但结果不受影响，仍可选同意。');
sub('50', 'zh', '偶尔谦虚不算，经常怀疑才算符合。', '偶尔谦虚不算，经常怀疑才更接近同意。');
sub('55', 'zh', '能较快接受既成事实、向前看的人符合本题。', '能较快接受既成事实、向前看的人可选同意。');
sub('56', 'zh', '如果你常因「想好了再说」而显得回应慢半拍，也算符合。', '如果你常因「想好了再说」而显得回应慢半拍，可选同意。');
sub('58', 'zh', '若你常在分析之后仍因「感觉不对」而改变决定，也符合。', '若你常在分析之后仍因「感觉不对」而改变决定，也可选同意。');
sub('59', 'zh', '以「能找到就行」为原则的人符合。', '以「能找到就行」为原则的人可选同意。');
sub('65', 'zh', '若你想到未知更多是好奇或平常心，较少焦虑，则不符合。', '若你想到未知更多是好奇或平常心，较少焦虑，则选不同意。');
sub('67', 'zh', '偶尔被迫规划不算，闲时自发地想才算符合。', '偶尔被迫规划不算，闲时自发地想才更接近同意。');
sub('69', 'zh', '若没有明确计划你会更自在，而不是焦虑，就符合。', '若没有明确计划你会更自在，而不是焦虑，就选同意。');
sub('72', 'zh', '若你能自然安抚或陪对方待着，则不符合。', '若你能自然安抚或陪对方待着，则选不同意。');
sub('74', 'zh', '若你朋友既多又深，或普遍交情较浅，则不完全符合。', '若你朋友既多又深，或普遍交情较浅，则更接近不同意。');
sub('81', 'zh', '只在脑中记事、或列了清单却常弃用，都不算符合。', '只在脑中记事、或列了清单却常弃用，都更接近不同意。');
sub('84', 'zh', '几乎从不为此动容则不符合。', '几乎从不为此动容则选不同意。');
sub('85', 'zh', '若你再喜欢新东西也能先收尾旧的，则不符合。', '若你再喜欢新东西也能先收尾旧的，则选不同意。');
sub('92', 'zh', '只记得却从不用，不算完全符合。', '只记得却从不用，则不算完全同意。');
sub('93', 'zh', '偶尔拖延不算，「常常」如此才是符合。', '偶尔拖延不算，「常常」如此才更接近同意。');

/* ---- C. en special rewrites ---- */
sub('4',  'en', "Tweaking a plan now and then still counts; improvising as you go does not.", "Tweaking a plan now and then still fits 'agree'; improvising as you go leans 'disagree'.");
sub('27', 'en', 'If you enjoy running scenarios in your head, that counts, even if you never act on them.', "If you enjoy running scenarios in your head, you can lean toward 'agree', even if you never act on them.");
sub('36', 'en', "Warming up slowly still counts even if you're chatty later.", "Warming up slowly still fits 'agree', even if you're chatty later.");
sub('41', 'en', 'One or two trusted people still counts.', "One or two trusted people still fits 'agree'.");
sub('50', 'en', "Occasional modesty doesn't count — only a frequent feeling.", "Occasional modesty isn't enough — only a frequent feeling leans 'agree'.");
sub('51', 'en', "Talking a lot but always waiting for others to begin doesn't count.", "Talking a lot but always waiting for others to begin leans 'disagree'.");
sub('56', 'en', "If you often reply a beat late because you're 'still thinking', that counts.", "If you often reply a beat late because you're 'still thinking', that leans 'agree'.");
sub('58', 'en', "It also counts if analysis says one thing but a 'wrong feeling' often flips your final choice.", "It also leans 'agree' if analysis says one thing but a 'wrong feeling' often flips your final choice.");
sub('67', 'en', 'It only counts if you do it for fun, not just when planning forces you to.', "Only lean 'agree' if you do it for fun, not just when planning forces you.");
sub('69', 'en', "If the absence of a firm plan feels freeing rather than stressful, that counts.", "If the absence of a firm plan feels freeing rather than stressful, that's an 'agree'.");
sub('79', 'en', "Forced planning for work doesn't count.", "Forced planning for work doesn't apply here.");
sub('81', 'en', "Only keeping lists in your head, or abandoning them, doesn't count.", "Only keeping lists in your head, or abandoning them, leans 'disagree'.");
sub('82', 'en', 'Nervousness counts even if you end up performing fine; judge the moment before you speak.', "Nervousness still leans 'agree' even if you end up performing fine; judge the moment before you speak.");
sub('83', 'en', "An occasional metaphor doesn't count — it should be your regular way of explaining.", "An occasional metaphor isn't enough — it should be your regular way of explaining.");
sub('91', 'en', 'It counts if you keep pondering a work long after finishing it.', "It leans 'agree' if you keep pondering a work long after finishing it.");
sub('93', 'en', "Occasional procrastination doesn't count — it must be your usual pattern.", "Occasional procrastination isn't enough — it must be your usual pattern.");

if (fail.length) {
  console.error('PATTERNS NOT FOUND:\n' + fail.join('\n'));
  process.exit(1);
}

// split back and save
const out1 = {}, out2 = {};
for (const id of Object.keys(all)) {
  (Number(id) <= 47 ? out1 : out2)[id] = all[id];
}
fs.writeFileSync(f1, JSON.stringify(out1, null, 2) + '\n');
fs.writeFileSync(f2, JSON.stringify(out2, null, 2) + '\n');
console.log('fixes applied:', fixes);
