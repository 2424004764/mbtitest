// Build-time sanity check for the prerendered output (not part of the build).
import { readFileSync } from 'node:fs';

const get = (html, re) => html.match(re)?.[1];

const problems = [];
const check = (file, expects) => {
  const html = readFileSync(file, 'utf8');
  for (const [name, re, wantIncludes] of expects) {
    const v = get(html, re);
    if (v === undefined) problems.push(`${file}: missing ${name}`);
    else if (!v.includes(wantIncludes)) problems.push(`${file}: ${name}="${v.slice(0, 90)}" (expected ~${wantIncludes})`);
  }
  if (html.includes('undefined')) problems.push(`${file}: contains "undefined"`);
  if (!html.includes('id="root"')) problems.push(`${file}: #root missing`);
  return html;
};

const h = check('dist/type/INTJ/index.html', [
  ['title', /<title>(.*?)<\/title>/, 'INTJ 建筑师'],
  ['canonical', /<link rel="canonical" href="([^"]*)"/, 'https://mbtitest.fologde.com/type/INTJ'],
  ['og:image', /og:image" content="([^"]*)"/, '/og/INTJ.png'],
  ['og:url', /og:url" content="([^"]*)"/, '/type/INTJ'],
  ['description', /name="description" content="([^"]*)"/, '策略'],
]);
console.log('INTJ zh content:', h.includes('建筑师型人格'), '| en content:', h.includes('Architect'), '| JSON-LD:', h.includes('BreadcrumbList'), '| bytes:', h.length);

check('dist/index.html', [
  ['title', /<title>(.*?)<\/title>/, '免费MBTI人格测试'],
  ['canonical', /<link rel="canonical" href="([^"]*)"/, 'https://mbtitest.fologde.com/'],
  ['og:url', /og:url" content="([^"]*)"/, 'fologde.com/'],
]);
const home = readFileSync('dist/index.html', 'utf8');
console.log('home zh+en content:', home.includes('十六型人格') && home.includes('16-personality'), '| FAQ ld:', home.includes('FAQPage'), '| bytes:', home.length);

check('dist/test/index.html', [
  ['title', /<title>(.*?)<\/title>/, 'Free MBTI Test Online'],
]);
console.log('test dims:', readFileSync('dist/test/index.html', 'utf8').includes('外向'));

check('dist/types/index.html', [
  ['title', /<title>(.*?)<\/title>/, '16型人格图鉴'],
]);
console.log('types ItemList:', readFileSync('dist/types/index.html', 'utf8').includes('ItemList'));

const sitemap = readFileSync('dist/sitemap.xml', 'utf8');
const urlCount = (sitemap.match(/<loc>/g) || []).length;
console.log('sitemap urls:', urlCount, '| lastmod:', sitemap.includes('<lastmod>'));
if (urlCount !== 20) problems.push(`sitemap: expected 20 urls, got ${urlCount}`);

const robots = readFileSync('dist/robots.txt', 'utf8');
console.log('robots disallow /result:', robots.includes('Disallow: /result'));

console.log(problems.length ? `\nPROBLEMS:\n${problems.join('\n')}` : '\nAll checks passed.');
