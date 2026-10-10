// Post-build prerenderer: writes static HTML for every public route into dist/.
//
// Why: the app is a client-rendered SPA. Google/Bing render JS, but Baidu,
// Sogou, 360 and most AI crawlers (GPTBot & friends) do not — for them the
// shell is an empty <div id="root">. This script injects real, bilingual
// content (sourced from src/i18n/ui.ts + src/data/*.json, no duplication)
// into the built shell. When the SPA boots, createRoot() simply replaces
// the static content, so the takeover is seamless.
//
// Also emits: per-route meta/canonical/JSON-LD, dist/sitemap.xml (lastmod)
// and 16 per-type OG share images via sharp.
//
// Requires Node >= 22.6 (run with --experimental-strip-types to import the
// TS data sources directly).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const SITE = 'https://mbtitest.fologde.com';
const TODAY = new Date().toISOString().slice(0, 10);

// ---------- data sources (single source of truth with the app) ----------
const [{ ui }, { DIMENSIONS, GROUPS, TYPE_COLORS, ALL_TYPES }, { POSTS }] = await Promise.all([
  import(pathToFileURL(join(root, 'src/i18n/ui.ts')).href),
  import(pathToFileURL(join(root, 'src/data/dimensions.ts')).href),
  import(pathToFileURL(join(root, 'src/data/blog.ts')).href),
]);

const readTypes = (lang) => {
  const merged = {};
  for (const part of ['part1', 'part2']) {
    Object.assign(merged, JSON.parse(readFileSync(join(root, 'src/data', `types.${part}.${lang}.json`), 'utf8')));
  }
  return merged;
};
const T = { zh: readTypes('zh'), en: readTypes('en') };

const readQuiz = (id, lang) =>
  JSON.parse(readFileSync(join(root, 'src/data/quizzes', `${id}.${lang}.json`), 'utf8'));
const QZ = { enneagram: {}, bigfive: {}, lovelang: {} };
for (const id of Object.keys(QZ)) QZ[id] = { zh: readQuiz(id, 'zh'), en: readQuiz(id, 'en') };

/** ui.ts lookup: T('home.subtitle', 'zh') */
const U = (path, lang, params) => {
  let node = ui;
  for (const key of path.split('.')) node = node?.[key];
  let s = node?.[lang];
  if (typeof s !== 'string') return path;
  if (params) for (const [k, v] of Object.entries(params)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
};

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const jsonForScript = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

// ---------- static fallback styles (wiped from view once React mounts) ----------
const CSS = `
.seo-root{font-family:system-ui,-apple-system,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;background:#fff;color:#1c2130;line-height:1.75;padding:0 16px}
.seo-wrap{max-width:780px;margin:0 auto;padding:20px 0 40px}
.seo-nav{display:flex;align-items:center;justify-content:space-between;padding:14px 0;font-size:14px}
.seo-brand{font-weight:800;color:#5b5bd6;text-decoration:none}
.seo-links a{color:#4a5164;text-decoration:none;margin-left:14px}
.seo-h1{font-size:30px;font-weight:800;line-height:1.25;margin:14px 0 8px}
.seo-sub{color:#5a6274;font-size:16px;margin:6px 0 14px}
.seo-cta{display:inline-block;background:#5b5bd6;color:#fff;padding:12px 26px;border-radius:999px;font-weight:700;text-decoration:none;margin:10px 8px 0 0}
.seo-cta.alt{background:#eef0fb;color:#5b5bd6}
.seo-h2{font-size:21px;font-weight:800;margin:30px 0 8px}
.seo-p{margin:8px 0;color:#333a4a}
.seo-list{margin:8px 0;padding-left:20px;color:#333a4a}
.seo-grid{display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(215px,1fr));margin:12px 0}
.seo-card{display:block;border:1px solid #e3e5ef;border-radius:14px;padding:12px 14px;text-decoration:none;color:inherit}
.seo-card b{display:block}
.seo-card span{font-size:12.5px;color:#5a6274}
.seo-chip{display:inline-block;border:1px solid #d9dce9;border-radius:999px;padding:4px 12px;font-size:13px;color:#4a5164;margin:3px 5px 3px 0}
.seo-faq details{border:1px solid #e3e5ef;border-radius:12px;padding:12px 16px;margin:8px 0}
.seo-faq summary{font-weight:700;cursor:pointer}
.seo-crumb{font-size:13.5px;color:#5a6274;margin:10px 0 0}
.seo-crumb a{color:#5b5bd6;text-decoration:none}
.seo-alt{border-top:1px dashed #d9dce9;margin-top:38px}
.seo-alt .seo-h1x{font-size:24px;font-weight:800;margin:16px 0 6px}
.seo-note{font-size:13px;color:#8a90a3;margin-top:30px}
.seo-foot{margin-top:36px;border-top:1px solid #e3e5ef;padding-top:14px;font-size:13px;color:#8a90a3;text-align:center}
.seo-foot a{color:#5b5bd6;text-decoration:none}
html.dark .seo-root{background:#0c0e14;color:#dfe2ee}
html.dark .seo-root .seo-p,html.dark .seo-root .seo-list,html.dark .seo-root .seo-sub,
html.dark .seo-root .seo-card span,html.dark .seo-root .seo-crumb,
html.dark .seo-root .seo-chip,html.dark .seo-root .seo-links a{color:#9aa1b5}
html.dark .seo-root .seo-card,html.dark .seo-root .seo-faq details{border-color:#262b3d}
html.dark .seo-root .seo-alt{border-color:#262b3d}
html.dark .seo-root .seo-foot{border-color:#262b3d}
`;

// ---------- reusable html fragments ----------
const nav = (lang) => `
<nav class="seo-nav">
  <a class="seo-brand" href="/">MBTI · 16 Personalities</a>
  <div class="seo-links">
    <a href="/test">${esc(U('nav.test', lang))}</a>
    <a href="/types">${esc(U('nav.types', lang))}</a>
    <a href="/compatibility">${esc(U('nav.pair', lang))}</a>
    <a href="/blog">${esc(U('nav.blog', lang))}</a>
    <a href="/about">${esc(U('nav.about', lang))}</a>
  </div>
</nav>`;

const typeCard = (code, lang) => {
  const info = T[lang][code];
  return `<a class="seo-card" href="/type/${code}"><b>${code} · ${esc(info.name)}</b><span>${esc(info.tagline)}</span></a>`;
};

const groupGrids = (lang) =>
  GROUPS.map(
    (g) => `
    <h2 class="seo-h2" style="color:${g.color}">${esc(g.name[lang])}</h2>
    <p class="seo-sub">${esc(g.desc[lang])}</p>
    <div class="seo-grid">${ALL_TYPES.filter((c) => T[lang][c].group === g.key)
      .map((c) => typeCard(c, lang))
      .join('')}</div>`,
  ).join('');

const faqBlock = (lang) => `
  <h2 class="seo-h2">${esc(U('home.faqTitle', lang))}</h2>
  <div class="seo-faq">${[1, 2, 3, 4, 5]
    .map(
      (i) =>
        `<details><summary>${esc(U(`home.faq${i}Q`, lang))}</summary><p class="seo-p">${esc(U(`home.faq${i}A`, lang))}</p></details>`,
    )
    .join('')}</div>`;

const footer = `
  <footer class="seo-foot">
    © ${new Date().getFullYear()} MBTI 人格测试 · <a href="https://tool.fologde.com/">由一方工具箱技术支持</a> · <span lang="en">Powered by 一方工具箱</span>
  </footer>`;

const wrap = (articles) =>
  `<div class="seo-root"><div class="seo-wrap">${articles}${footer}</div></div>`;

// ---------- page bodies ----------
const homeBody = wrap(`
  ${nav('zh')}
  <h1 class="seo-h1">${esc(U('home.title1', 'zh'))}${esc(U('home.titleHighlight', 'zh'))} · 免费在线测试</h1>
  <p class="seo-sub">${esc(U('home.subtitle', 'zh'))}</p>
  <a class="seo-cta" href="/test?mode=full">${esc(U('home.ctaFull', 'zh'))}（93 题 · 约 12 分钟）</a>
  <a class="seo-cta alt" href="/test?mode=quick">${esc(U('home.ctaQuick', 'zh'))}（28 题）</a>
  <p>${[U('home.statQuestions', 'zh'), U('home.statTypes', 'zh'), U('home.statMinutes', 'zh'), U('home.statLanguages', 'zh')]
    .map((s) => `<span class="seo-chip">${esc(s)}</span>`)
    .join('')}</p>
  ${groupGrids('zh')}
  ${faqBlock('zh')}
  <article lang="en" class="seo-alt">
    ${nav('en')}
    <h2 class="seo-h1x">${esc(U('home.title1', 'en'))}${esc(U('home.titleHighlight', 'en'))}</h2>
    <p class="seo-sub">${esc(U('home.subtitle', 'en'))}</p>
    <a class="seo-cta" href="/test?mode=full">${esc(U('home.ctaFull', 'en'))} (93 questions)</a>
    <a class="seo-cta alt" href="/test?mode=quick">${esc(U('home.ctaQuick', 'en'))} (28 questions)</a>
    ${groupGrids('en')}
    ${faqBlock('en')}
  </article>
  <p class="seo-note">${esc(U('home.badge', 'zh'))} · ${esc(U('home.badge', 'en'))}</p>`);

const dimensionsBlock = (lang) =>
  DIMENSIONS.map(
    (d) => `
    <h3 class="seo-h2" style="font-size:17px">${esc(d.name[lang])}：${esc(d.leftLabel[lang])}（${d.left}） vs ${esc(d.rightLabel[lang])}（${d.right}）</h3>
    <p class="seo-p">${esc(d.leftDesc[lang])}</p>
    <p class="seo-p">${esc(d.rightDesc[lang])}</p>`,
  ).join('');

const testBody = wrap(`
  ${nav('zh')}
  <h1 class="seo-h1">免费 MBTI 十六型人格测试（在线版）</h1>
  <p class="seo-sub">${esc(U('test.subtitle', 'zh'))}</p>
  <a class="seo-cta" href="/test?mode=full">${esc(U('home.ctaFull', 'zh'))} · ${esc(U('home.fullCardTitle', 'zh'))}</a>
  <a class="seo-cta alt" href="/test?mode=quick">${esc(U('home.ctaQuick', 'zh'))} · ${esc(U('home.quickCardTitle', 'zh'))}</a>
  <h2 class="seo-h2">五个性格维度</h2>
  ${dimensionsBlock('zh')}
  <h2 class="seo-h2">${esc(U('about.methodTitle', 'zh'))}</h2>
  <p class="seo-p">${esc(U('about.methodP1', 'zh'))}</p>
  <p class="seo-p">${esc(U('about.methodP2', 'zh'))}</p>
  <article lang="en" class="seo-alt">
    ${nav('en')}
    <h2 class="seo-h1x">Free MBTI-style 16-Personality Test</h2>
    <p class="seo-sub">${esc(U('test.subtitle', 'en'))}</p>
    <a class="seo-cta" href="/test?mode=full">${esc(U('home.ctaFull', 'en'))} · ${esc(U('home.fullCardTitle', 'en'))}</a>
    <a class="seo-cta alt" href="/test?mode=quick">${esc(U('home.ctaQuick', 'en'))} · ${esc(U('home.quickCardTitle', 'en'))}</a>
    <h2 class="seo-h2">The five dimensions</h2>
    ${dimensionsBlock('en')}
    <h2 class="seo-h2">${esc(U('about.methodTitle', 'en'))}</h2>
    <p class="seo-p">${esc(U('about.methodP1', 'en'))}</p>
    <p class="seo-p">${esc(U('about.methodP2', 'en'))}</p>
  </article>`);

const typesBody = wrap(`
  ${nav('zh')}
  <h1 class="seo-h1">${esc(U('types.title', 'zh'))}</h1>
  <p class="seo-sub">${esc(U('types.subtitle', 'zh'))}</p>
  ${groupGrids('zh')}
  <article lang="en" class="seo-alt">
    ${nav('en')}
    <h2 class="seo-h1x">${esc(U('types.title', 'en'))}</h2>
    <p class="seo-sub">${esc(U('types.subtitle', 'en'))}</p>
    ${groupGrids('en')}
  </article>`);

const aboutBody = wrap(`
  ${nav('zh')}
  <h1 class="seo-h1">${esc(U('about.title', 'zh'))}</h1>
  <h2 class="seo-h2">${esc(U('about.introTitle', 'zh'))}</h2>
  <p class="seo-p">${esc(U('about.introP1', 'zh'))}</p>
  <p class="seo-p">${esc(U('about.introP2', 'zh'))}</p>
  <h2 class="seo-h2">${esc(U('about.methodTitle', 'zh'))}</h2>
  <p class="seo-p">${esc(U('about.methodP1', 'zh'))}</p>
  <p class="seo-p">${esc(U('about.methodP2', 'zh'))}</p>
  <h2 class="seo-h2">${esc(U('about.privacyTitle', 'zh'))}</h2>
  <p class="seo-p">${esc(U('about.privacyP', 'zh'))}</p>
  <h2 class="seo-h2">${esc(U('about.disclaimerTitle', 'zh'))}</h2>
  <p class="seo-p">${esc(U('about.disclaimerP', 'zh'))}</p>
  <h2 class="seo-h2">${esc(U('about.sourceTitle', 'zh'))}</h2>
  <p class="seo-p">${esc(U('about.sourceP', 'zh'))}</p>
  <article lang="en" class="seo-alt">
    ${nav('en')}
    <h2 class="seo-h1x">${esc(U('about.title', 'en'))}</h2>
    <h2 class="seo-h2">${esc(U('about.introTitle', 'en'))}</h2>
    <p class="seo-p">${esc(U('about.introP1', 'en'))}</p>
    <p class="seo-p">${esc(U('about.introP2', 'en'))}</p>
    <h2 class="seo-h2">${esc(U('about.methodTitle', 'en'))}</h2>
    <p class="seo-p">${esc(U('about.methodP1', 'en'))}</p>
    <p class="seo-p">${esc(U('about.methodP2', 'en'))}</p>
    <h2 class="seo-h2">${esc(U('about.privacyTitle', 'en'))}</h2>
    <p class="seo-p">${esc(U('about.privacyP', 'en'))}</p>
    <h2 class="seo-h2">${esc(U('about.disclaimerTitle', 'en'))}</h2>
    <p class="seo-p">${esc(U('about.disclaimerP', 'en'))}</p>
    <h2 class="seo-h2">${esc(U('about.sourceTitle', 'en'))}</h2>
    <p class="seo-p">${esc(U('about.sourceP', 'en'))}</p>
  </article>`);

const typeBody = (code) => {
  const zh = T.zh[code];
  const en = T.en[code];
  const group = GROUPS.find((g) => g.key === zh.group);
  const related = ALL_TYPES.filter((c) => c !== code && T.zh[c].group === zh.group);
  return wrap(`
  ${nav('zh')}
  <p class="seo-crumb"><a href="/">首页</a> › <a href="/types">${esc(U('types.title', 'zh'))}</a> › ${code} ${esc(zh.name)}</p>
  <h1 class="seo-h1">${code} ${esc(zh.name)}型人格</h1>
  <p class="seo-sub">${esc(zh.tagline)}</p>
  <p>
    <span class="seo-chip" style="border-color:${group.color};color:${group.color}">${esc(group.name.zh)}</span>
    <span class="seo-chip">${esc(U('result.rare', 'zh', { p: zh.population }))}</span>
    <span class="seo-chip">-A ${esc(U('typeDetail.assertive', 'zh'))} / -T ${esc(U('typeDetail.turbulent', 'zh'))}</span>
  </p>
  <h2 class="seo-h2">${esc(U('typeDetail.overview', 'zh'))}</h2>
  ${zh.overview.map((p) => `<p class="seo-p">${esc(p)}</p>`).join('')}
  <h2 class="seo-h2">${esc(U('typeDetail.strengths', 'zh'))}</h2>
  <ul class="seo-list">${zh.strengths.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
  <h2 class="seo-h2">${esc(U('typeDetail.weaknesses', 'zh'))}</h2>
  <ul class="seo-list">${zh.weaknesses.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
  <h2 class="seo-h2">${esc(U('typeDetail.careers', 'zh'))}</h2>
  <p>${zh.careers.map((c) => `<span class="seo-chip">${esc(c)}</span>`).join('')}</p>
  <h2 class="seo-h2">${esc(U('typeDetail.relationship', 'zh'))}</h2>
  <p class="seo-p">${esc(zh.relationship)}</p>
  <h2 class="seo-h2">${esc(U('typeDetail.variants', 'zh'))}</h2>
  <p class="seo-p"><b>${code}-A ${esc(U('typeDetail.assertive', 'zh'))}：</b>${esc(zh.variantA)}</p>
  <p class="seo-p"><b>${code}-T ${esc(U('typeDetail.turbulent', 'zh'))}：</b>${esc(zh.variantT)}</p>
  <a class="seo-cta" href="/test?mode=full">${esc(U('typeDetail.takeTestCta', 'zh'))}</a>
  <h2 class="seo-h2">相关人格类型 · ${esc(group.name.zh)}</h2>
  <div class="seo-grid">${related.map((c) => typeCard(c, 'zh')).join('')}</div>
  <article lang="en" class="seo-alt">
    ${nav('en')}
    <p class="seo-crumb"><a href="/">Home</a> › <a href="/types">${esc(U('types.title', 'en'))}</a> › ${code}</p>
    <h2 class="seo-h1x">${code} — ${esc(en.name)}</h2>
    <p class="seo-sub">${esc(en.tagline)}</p>
    <h2 class="seo-h2">${esc(U('typeDetail.overview', 'en'))}</h2>
    ${en.overview.map((p) => `<p class="seo-p">${esc(p)}</p>`).join('')}
    <h2 class="seo-h2">${esc(U('typeDetail.strengths', 'en'))}</h2>
    <ul class="seo-list">${en.strengths.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
    <h2 class="seo-h2">${esc(U('typeDetail.weaknesses', 'en'))}</h2>
    <ul class="seo-list">${en.weaknesses.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
    <h2 class="seo-h2">${esc(U('typeDetail.careers', 'en'))}</h2>
    <p>${en.careers.map((c) => `<span class="seo-chip">${esc(c)}</span>`).join('')}</p>
    <h2 class="seo-h2">${esc(U('typeDetail.relationship', 'en'))}</h2>
    <p class="seo-p">${esc(en.relationship)}</p>
    <h2 class="seo-h2">${esc(U('typeDetail.variants', 'en'))}</h2>
    <p class="seo-p"><b>${code}-A ${esc(U('typeDetail.assertive', 'en'))}:</b> ${esc(en.variantA)}</p>
    <p class="seo-p"><b>${code}-T ${esc(U('typeDetail.turbulent', 'en'))}:</b> ${esc(en.variantT)}</p>
    <a class="seo-cta" href="/test?mode=full">${esc(U('typeDetail.takeTestCta', 'en'))}</a>
  </article>`);
};

// ---------- new-feature page bodies ----------

const compatBody = wrap(`
  ${nav('zh')}
  <h1 class="seo-h1">MBTI 人格配对 · 16型人格兼容性测试</h1>
  <p class="seo-sub">${esc(U('compat.subtitle', 'zh'))}</p>
  <a class="seo-cta" href="/compatibility">开始配对 · ${esc(U('compat.title', 'zh'))}</a>
  <h2 class="seo-h2">怎么算"配"？</h2>
  <p class="seo-p">任选两种类型，本站基于四个维度的异同生成分析：完全互补的"对偶型"组合、沟通方式一致的"中间字母相同"组合、以及需要磨合的其余组合，各有星级与相处建议。</p>
  <h2 class="seo-h2">试试这些组合</h2>
  <p>${['INTJ-ENFP', 'INFP-ENTJ', 'ENFJ-INTP', 'ISTJ-ESFP', 'ISFJ-ENTP', 'ESTJ-INFP']
    .map((p) => {
      const [a, b] = p.split('-');
      return `<a class="seo-chip" href="/compatibility?a=${a}&amp;b=${b}">${a} × ${b}</a>`;
    })
    .join('')}</p>
  <div class="seo-grid">${ALL_TYPES.map((c) => typeCard(c, 'zh')).join('')}</div>
  <article lang="en" class="seo-alt">
    ${nav('en')}
    <h2 class="seo-h1x">MBTI Type Compatibility &amp; Matchup</h2>
    <p class="seo-sub">${esc(U('compat.subtitle', 'en'))}</p>
    <a class="seo-cta" href="/compatibility">Open the Matchup Lab</a>
    <h2 class="seo-h2">How the score works</h2>
    <p class="seo-p">Pick any two types: full-opposite "dual" pairs, same-middle-letter pairs who speak the same cognitive language, and everything in between each get a star rating plus tailored tips.</p>
  </article>`);

const quizBody = (id) => {
  const zh = QZ[id].zh;
  const en = QZ[id].en;
  const zhTitles = { enneagram: '九型人格测试', bigfive: '大五人格测试', lovelang: '爱的语言测试' };
  const enTitles = { enneagram: 'Enneagram Test', bigfive: 'Big Five Personality Test', lovelang: 'Love Languages Test' };
  return wrap(`
  ${nav('zh')}
  <h1 class="seo-h1">免费在线${esc(zhTitles[id])} · ${zh.questions.length} 题</h1>
  <p class="seo-sub">${esc(zh.meta.description)}</p>
  <a class="seo-cta" href="/quiz/${id}">${esc(zh.meta.name)} · ${esc(U('nav.start', 'zh'))}</a>
  <p><span class="seo-chip">${zh.questions.length} 题</span><span class="seo-chip">${esc(U('common.minutes', 'zh', { n: zh.meta.minutes }))}</span><span class="seo-chip">${esc(U('home.badge', 'zh'))}</span></p>
  <h2 class="seo-h2">${esc(zh.meta.name)}是什么？</h2>
  <p class="seo-p">${esc(zh.meta.tagline)}。${esc(zh.meta.description)}</p>
  ${
    id === 'enneagram'
      ? `<h2 class="seo-h2">九种类型</h2><p>${Object.entries(zh.types)
          .map(([k, v]) => `<span class="seo-chip">${k.replace('e', 'Type ')} · ${esc(v.name)}</span>`)
          .join('')}</p>`
      : id === 'bigfive'
        ? `<h2 class="seo-h2">五大维度</h2><p>${Object.values(zh.scales)
            .map((s) => `<span class="seo-chip">${esc(s.name)}</span>`)
            .join('')}</p>`
        : `<h2 class="seo-h2">五种爱的语言</h2><p>${Object.values(zh.langs)
            .map((l) => `<span class="seo-chip">${esc(l.name)}</span>`)
            .join('')}</p>`
  }
  <article lang="en" class="seo-alt">
    ${nav('en')}
    <h2 class="seo-h1x">Free ${esc(enTitles[id])} — ${en.questions.length} questions</h2>
    <p class="seo-sub">${esc(en.meta.description)}</p>
    <a class="seo-cta" href="/quiz/${id}">Start the ${esc(enTitles[id])}</a>
  </article>`);
};

const blogListBody = wrap(`
  ${nav('zh')}
  <h1 class="seo-h1">${esc(U('blog.title', 'zh'))}</h1>
  <p class="seo-sub">${esc(U('blog.subtitle', 'zh'))}</p>
  <div class="seo-grid">${POSTS.map(
    (p) => `<a class="seo-card" href="/blog/${p.slug}"><b>${esc(p.title.zh)}</b><span>${esc(p.description.zh)}</span></a>`,
  ).join('')}</div>
  <article lang="en" class="seo-alt">
    ${nav('en')}
    <h2 class="seo-h1x">${esc(U('blog.title', 'en'))}</h2>
    <p class="seo-sub">${esc(U('blog.subtitle', 'en'))}</p>
    <div class="seo-grid">${POSTS.map(
      (p) => `<a class="seo-card" href="/blog/${p.slug}"><b>${esc(p.title.en)}</b><span>${esc(p.description.en)}</span></a>`,
    ).join('')}</div>
  </article>`);

const blogBody = (post) => wrap(`
  ${nav('zh')}
  <p class="seo-crumb"><a href="/">首页</a> › <a href="/blog">${esc(U('blog.title', 'zh'))}</a> › ${esc(post.title.zh)}</p>
  <h1 class="seo-h1">${esc(post.title.zh)}</h1>
  <p class="seo-sub">${esc(post.description.zh)}</p>
  ${post.sections
    .map(
      (s) => `
    <h2 class="seo-h2">${esc(s.h.zh)}</h2>
    ${s.p.zh.map((p) => `<p class="seo-p">${esc(p)}</p>`).join('')}`,
    )
    .join('')}
  <a class="seo-cta" href="/test?mode=full">${esc(U('blog.takeTestCta', 'zh'))}</a>
  <article lang="en" class="seo-alt">
    ${nav('en')}
    <p class="seo-crumb"><a href="/">Home</a> › <a href="/blog">${esc(U('blog.title', 'en'))}</a></p>
    <h2 class="seo-h1x">${esc(post.title.en)}</h2>
    <p class="seo-sub">${esc(post.description.en)}</p>
    ${post.sections
      .map(
        (s) => `
      <h2 class="seo-h2">${esc(s.h.en)}</h2>
      ${s.p.en.map((p) => `<p class="seo-p">${esc(p)}</p>`).join('')}`,
      )
      .join('')}
    <a class="seo-cta" href="/test?mode=full">${esc(U('blog.takeTestCta', 'en'))}</a>
  </article>`);

// ---------- per-route meta + structured data ----------
const faqGraph = () => ({
  '@type': 'FAQPage',
  inLanguage: 'zh-CN',
  mainEntity: [1, 2, 3, 4, 5].map((i) => ({
    '@type': 'Question',
    name: U(`home.faq${i}Q`, 'zh'),
    acceptedAnswer: { '@type': 'Answer', text: U(`home.faq${i}A`, 'zh') },
  })),
});

const websiteGraph = [
  { '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: 'MBTI Personality Test · MBTI 人格测试', inLanguage: ['zh-CN', 'en'] },
  { '@type': 'WebApplication', '@id': `${SITE}/#app`, url: `${SITE}/`, name: 'MBTI 16 Personalities Test', applicationCategory: 'EducationalApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }, inLanguage: ['zh-CN', 'en'] },
];

const typeMeta = (code) => {
  const zh = T.zh[code];
  const en = T.en[code];
  return {
    title: `${code} ${zh.name}型人格解析：优势、职业与爱情 | ${code} ${en.name} Personality`,
    description: `${code} ${zh.name}型人格：${zh.tagline}。优势、弱点、职业方向与亲密关系解析 | ${en.name} (${code}): ${en.tagline}`.slice(0, 300),
    jsonLd: [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: '首页 Home', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: '十六型人格图鉴 16 Types', item: `${SITE}/types` },
          { '@type': 'ListItem', position: 3, name: `${code} ${zh.name}` },
        ],
      },
      { '@type': 'WebPage', name: `${code} ${zh.name} ${en.name}`, description: zh.tagline, url: `${SITE}/type/${code}`, inLanguage: ['zh-CN', 'en'] },
    ],
    body: typeBody(code),
    path: `/type/${code}`,
    ogImage: `${SITE}/og/${code}.png`,
  };
};

const PAGES = [
  {
    path: '/',
    title: 'MBTI 16 Personalities Test · 免费MBTI人格测试（93题/28题速测）',
    description:
      '免费在线MBTI十六型人格测试：93题完整版约12分钟，28题速测3分钟出结果，五维度计分，中英双语，无需注册，结果仅存本地。Free MBTI-style test: 93-question full or 3-minute quick version, bilingual, private.',
    ogImage: `${SITE}/og.png`,
    jsonLd: [...websiteGraph, faqGraph()],
    body: homeBody,
  },
  {
    path: '/test',
    title: '免费MBTI人格测试在线 · 93题完整版/28题速测 | Free MBTI Test Online',
    description:
      '在线免费MBTI人格测试：五维度、七点量表计分，93题完整版约12分钟，28题速测3分钟出结果。Free online MBTI-style personality test with five-dimension scoring.',
    ogImage: `${SITE}/og.png`,
    jsonLd: [{ '@type': 'WebPage', name: '免费MBTI人格测试 · Free MBTI Test', url: `${SITE}/test`, inLanguage: ['zh-CN', 'en'] }],
    body: testBody,
  },
  {
    path: '/types',
    title: '16型人格图鉴 · 十六种人格类型完整解析 | 16 Personality Types',
    description:
      'INTJ建筑师、INFP调停者、ENFP竞选者……十六型人格图鉴：四大组别、优势弱点、职业方向与亲密关系解析。All 16 personality types explained: strengths, careers & relationships.',
    ogImage: `${SITE}/og.png`,
    jsonLd: [
      {
        '@type': 'CollectionPage',
        name: '十六型人格图鉴 · The 16 personality types',
        url: `${SITE}/types`,
        inLanguage: ['zh-CN', 'en'],
        hasPart: {
          '@type': 'ItemList',
          numberOfItems: ALL_TYPES.length,
          itemListElement: ALL_TYPES.map((c, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${SITE}/type/${c}`,
            name: `${c} ${T.zh[c].name} ${T.en[c].name}`,
          })),
        },
      },
    ],
    body: typesBody,
  },
  {
    path: '/about',
    title: '关于本测试 · 方法、计分与隐私说明 | About the Test',
    description:
      '十六型人格框架说明、七点李克特量表计分方法与隐私政策：纯静态网站，答案不上传。How the test works: the 16-type framework, Likert scoring, and privacy.',
    ogImage: `${SITE}/og.png`,
    jsonLd: [{ '@type': 'WebPage', name: '关于本测试 · About this test', url: `${SITE}/about`, inLanguage: ['zh-CN', 'en'] }],
    body: aboutBody,
  },
  {
    path: '/compatibility',
    title: 'MBTI人格配对 · 16型人格兼容性测试 | Type Compatibility',
    description:
      '免费MBTI人格配对测试：任选两种十六型人格，查看默契度、互补点与相处建议，支持邀请朋友双人对比。Free MBTI type compatibility matchup with tips for any pair of the 16 types.',
    ogImage: `${SITE}/og.png`,
    jsonLd: [{ '@type': 'WebPage', name: 'MBTI 人格配对 · Type Matchup', url: `${SITE}/compatibility`, inLanguage: ['zh-CN', 'en'] }],
    body: compatBody,
  },
  ...['enneagram', 'bigfive', 'lovelang'].map((id) => ({
    path: `/quiz/${id}`,
    title:
      id === 'enneagram'
        ? '免费九型人格测试 · 36题在线测你的九型 | Enneagram Test'
        : id === 'bigfive'
          ? '免费大五人格测试 · 30题在线 | Big Five Personality Test'
          : '免费爱的语言测试 · 30题找到你的爱语 | Love Languages Test',
    description: `${QZ[id].zh.meta.description} | ${QZ[id].en.meta.description}`,
    ogImage: `${SITE}/og.png`,
    jsonLd: [
      {
        '@type': 'WebApplication',
        name: `${QZ[id].zh.meta.name} · ${QZ[id].en.meta.name}`,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        inLanguage: ['zh-CN', 'en'],
        url: `${SITE}/quiz/${id}`,
      },
    ],
    body: quizBody(id),
  })),
  {
    path: '/blog',
    title: '人格知识库 · MBTI 与人格心理学短文 | Learn',
    description:
      'MBTI 是什么、科学性争议、人格会变吗——关于十六型人格与人格心理学的双语科普文章。Short, balanced reads on MBTI and personality psychology.',
    ogImage: `${SITE}/og.png`,
    jsonLd: [{ '@type': 'CollectionPage', name: '人格知识库 · Knowledge base', url: `${SITE}/blog`, inLanguage: ['zh-CN', 'en'] }],
    body: blogListBody,
  },
  ...POSTS.map((post) => ({
    path: `/blog/${post.slug}`,
    title: `${post.title.zh} | ${post.title.en}`,
    description: `${post.description.zh} | ${post.description.en}`.slice(0, 300),
    ogImage: `${SITE}/og.png`,
    jsonLd: [
      {
        '@type': 'Article',
        headline: post.title.zh,
        datePublished: post.date,
        inLanguage: 'zh-CN',
        mainEntityOfPage: `${SITE}/blog/${post.slug}`,
        description: post.description.zh,
      },
    ],
    body: blogBody(post),
  })),
  ...ALL_TYPES.map(typeMeta),
];

// ---------- shell transformation ----------
const shellPath = join(dist, 'index.html');
let shell = readFileSync(shellPath, 'utf8');
if (!shell.includes('<div id="root"></div>')) {
  throw new Error('dist/index.html does not contain the expected <div id="root"></div> marker');
}

const setMeta = (html, attr, key, content) =>
  html.replace(
    new RegExp(`(<meta\\s[^>]*${attr}="${key}"[^>]*content=")[^"]*(")`),
    `$1${esc(content)}$2`,
  );

const renderPage = (page) => {
  const url = SITE + page.path;
  let html = shell;
  html = html.replace(/<html lang="[^"]*">/, '<html lang="zh-CN">');
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(page.title)}</title>`);
  html = setMeta(html, 'name', 'description', page.description);
  html = setMeta(html, 'name', 'twitter:title', page.title);
  html = setMeta(html, 'name', 'twitter:description', page.description);
  html = setMeta(html, 'name', 'twitter:image', page.ogImage);
  html = setMeta(html, 'property', 'og:title', page.title);
  html = setMeta(html, 'property', 'og:description', page.description);
  html = setMeta(html, 'property', 'og:image', page.ogImage);
  html = setMeta(html, 'property', 'og:url', url);
  html = html.replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`);
  html = html.replace(
    /<script type="application\/ld\+json" id="seo-jsonld">[\s\S]*?<\/script>/,
    `<script type="application/ld+json" id="seo-jsonld">${jsonForScript({ '@context': 'https://schema.org', '@graph': page.jsonLd })}</script>`,
  );
  html = html.replace('</head>', `<style id="seo-static">${CSS}</style></head>`);
  html = html.replace('<div id="root"></div>', `<div id="root">${page.body}<noscript><p class="seo-note">启用 JavaScript 可获得完整交互体验 / Enable JavaScript for the full interactive experience.</p></noscript></div>`);

  const file = join(dist, page.path === '/' ? 'index.html' : join(page.path.slice(1), 'index.html'));
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
};

for (const page of PAGES) renderPage(page);

// ---------- sitemap (with lastmod) ----------
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${PAGES.map(
  (p) =>
    `  <url><loc>${SITE}${esc(p.path)}</loc><lastmod>${TODAY}</lastmod>${
      ['/', '/test', '/types'].includes(p.path) ? '<changefreq>monthly</changefreq>' : ''
    }${p.path === '/' ? '<priority>1.0</priority>' : ''}</url>`,
).join('\n')}
</urlset>
`;
writeFileSync(join(dist, 'sitemap.xml'), sitemap);

// ---------- per-type OG share images ----------
mkdirSync(join(dist, 'og'), { recursive: true });
const FONT = "-apple-system,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif";
const clip = (s, n) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

async function makeTypeOg(code) {
  const zh = T.zh[code];
  const en = T.en[code];
  const color = TYPE_COLORS[code] ?? '#5b5bd6';
  const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#111320"/><stop offset="1" stop-color="#191c2d"/></linearGradient>
    <radialGradient id="glow" cx="0.15" cy="0" r="0.9"><stop offset="0" stop-color="${color}" stop-opacity="0.45"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>
    <linearGradient id="brand" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#5b5bd6"/><stop offset="1" stop-color="#c26bd6"/></linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <g transform="translate(84,84)">
    <rect width="72" height="72" rx="20" fill="url(#brand)"/>
    <circle cx="25" cy="25" r="7" fill="#fff" opacity="0.95"/><circle cx="47" cy="25" r="7" fill="#fff" opacity="0.62"/>
    <circle cx="25" cy="47" r="7" fill="#fff" opacity="0.62"/><circle cx="47" cy="47" r="7" fill="#fff" opacity="0.95"/>
  </g>
  <text x="180" y="118" x-dominant-baseline="middle" font-family="${FONT}" font-size="26" font-weight="600" fill="#fff" opacity="0.85">MBTI · 16 Personalities</text>
  <text x="84" y="330" font-family="${FONT}" font-size="170" font-weight="800" fill="${color}">${code}</text>
  <text x="84" y="420" font-family="${FONT}" font-size="62" font-weight="800" fill="#fff">${esc(clip(zh.name, 8))} · ${esc(clip(en.name, 20))}</text>
  <text x="84" y="480" font-family="${FONT}" font-size="30" font-weight="500" fill="#fff" opacity="0.66">${esc(clip(zh.tagline, 26))}</text>
  <text x="84" y="566" font-family="${FONT}" font-size="24" font-weight="500" fill="#fff" opacity="0.45">免费测试 · 无需注册 · Free MBTI-style test · mbtitest.fologde.com</text>
</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(join(dist, 'og', `${code}.png`));
}

await Promise.all(ALL_TYPES.map(makeTypeOg));

console.log(
  `Prerendered ${PAGES.length} pages + sitemap.xml + ${ALL_TYPES.length} OG images → dist/`,
);
