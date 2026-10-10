// One-time generator: rasterizes the SVG brand assets into PNG
// (og:image + PWA/apple icons). Run: node scripts/generate-assets.mjs
import sharp from 'sharp';
import { mkdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');
mkdirSync(join(pub, 'icons'), { recursive: true });

const FONT =
  "-apple-system, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif";

const dots = (opacity = 0.05) => {
  let pattern = '';
  for (let y = 30; y < 630; y += 36) {
    for (let x = 30; x < 1200; x += 36) {
      pattern += `<circle cx="${x}" cy="${y}" r="2" fill="#fff" opacity="${opacity}"/>`;
    }
  }
  return pattern;
};

// ---------- og.png (1200×630) ----------
const ogSvg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#111320"/>
      <stop offset="1" stop-color="#191c2d"/>
    </linearGradient>
    <radialGradient id="glow1" cx="0.22" cy="0" r="0.8">
      <stop offset="0" stop-color="#5b5bd6" stop-opacity="0.5"/>
      <stop offset="1" stop-color="#5b5bd6" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow2" cx="0.9" cy="1" r="0.8">
      <stop offset="0" stop-color="#c26bd6" stop-opacity="0.38"/>
      <stop offset="1" stop-color="#c26bd6" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="brand" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#5b5bd6"/>
      <stop offset="1" stop-color="#c26bd6"/>
    </linearGradient>
    <linearGradient id="text" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#9d9df2"/>
      <stop offset="1" stop-color="#daa3e8"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow1)"/>
  <rect width="1200" height="630" fill="url(#glow2)"/>
  ${dots()}

  <!-- logo -->
  <g transform="translate(84,84)">
    <rect width="72" height="72" rx="20" fill="url(#brand)"/>
    <circle cx="25" cy="25" r="7" fill="#fff" opacity="0.95"/>
    <circle cx="47" cy="25" r="7" fill="#fff" opacity="0.62"/>
    <circle cx="25" cy="47" r="7" fill="#fff" opacity="0.62"/>
    <circle cx="47" cy="47" r="7" fill="#fff" opacity="0.95"/>
  </g>
  <text x="180" y="118" x-dominant-baseline="middle" font-family="${FONT}" font-size="26" font-weight="600" fill="#ffffff" opacity="0.85">MBTI · 16 Personalities</text>
  <text x="180" y="152" font-family="${FONT}" font-size="22" font-weight="500" fill="#ffffff" opacity="0.5">Free · 免费在线人格测试</text>

  <!-- headline -->
  <text x="84" y="300" font-family="${FONT}" font-size="92" font-weight="800" fill="url(#text)">16 Personalities</text>
  <text x="84" y="388" font-family="${FONT}" font-size="58" font-weight="800" fill="#ffffff">发现你的十六型人格</text>

  <!-- chips -->
  <g font-family="${FONT}" font-size="24" font-weight="600">
    <rect x="84" y="448" width="240" height="52" rx="26" fill="none" stroke="#ffffff" stroke-opacity="0.25" stroke-width="2"/>
    <text x="204" y="481" text-anchor="middle" fill="#ffffff" opacity="0.85">93 questions · 93题</text>

    <rect x="344" y="448" width="270" height="52" rx="26" fill="none" stroke="#ffffff" stroke-opacity="0.25" stroke-width="2"/>
    <text x="479" y="481" text-anchor="middle" fill="#ffffff" opacity="0.85">3-min quick · 3分钟速测</text>

    <rect x="634" y="448" width="190" height="52" rx="26" fill="none" stroke="#ffffff" stroke-opacity="0.25" stroke-width="2"/>
    <text x="729" y="481" text-anchor="middle" fill="#ffffff" opacity="0.85">中文 / English</text>
  </g>

  <text x="84" y="566" font-family="${FONT}" font-size="24" font-weight="500" fill="#ffffff" opacity="0.45">Free · No sign-up · Results stay on your device · 结果仅存本地</text>
</svg>`;

// ---------- icons ----------
const iconSvg = readFileSync(join(pub, 'favicon.svg'), 'utf-8');

await sharp(Buffer.from(ogSvg)).png().toFile(join(pub, 'og.png'));
for (const size of [512, 192, 180]) {
  const name = size === 180 ? 'apple-touch-icon.png' : `icon-${size}.png`;
  await sharp(Buffer.from(iconSvg), { density: 300 })
    .resize(size, size)
    .png()
    .toFile(join(pub, 'icons', name));
}
console.log('Generated: public/og.png, public/icons/icon-512.png, icon-192.png, apple-touch-icon.png');
