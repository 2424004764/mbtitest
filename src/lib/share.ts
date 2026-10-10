import type { Dim, TestResult } from '../data/schema';
import { DIM_ORDER, dimMeta } from '../data/dimensions';

/* ---------- shareable result links ---------- */

export function encodeResult(r: TestResult): string {
  const pcts = DIM_ORDER.map((d) => r.dims[d].leftPct);
  const mode = r.mode === 'quick' ? 'q' : 'f';
  return [r.type, r.identity, ...pcts, mode].join('-');
}

export function decodeResult(raw: string | null): TestResult | null {
  if (!raw) return null;
  const m = raw.match(/^([A-Z]{4})-([AT])-(\d{1,3})-(\d{1,3})-(\d{1,3})-(\d{1,3})-(\d{1,3})-([qf])$/);
  if (!m) return null;
  const pcts = [m[3], m[4], m[5], m[6], m[7]].map((s) => {
    const n = Number(s);
    return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : 50;
  });
  const dims = {} as Record<Dim, { leftPct: number }>;
  DIM_ORDER.forEach((d, i) => {
    dims[d] = { leftPct: pcts[i] };
  });
  return {
    type: m[1],
    identity: m[2] as 'A' | 'T',
    dims,
    mode: m[8] === 'q' ? 'quick' : 'full',
    date: 0,
  };
}

export function buildResultUrl(r: TestResult): string {
  const base = `${window.location.origin}/result`;
  return `${base}?d=${encodeURIComponent(encodeResult(r))}`;
}

/* ---------- clipboard ---------- */

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return true;
    } catch {
      return false;
    }
  }
}

export async function nativeShare(title: string, text: string, url: string): Promise<boolean> {
  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text, url });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

/* ---------- canvas result card ---------- */

export type CardStyle = 'classic' | 'minimal' | 'vivid';

export interface CardText {
  lang: 'zh' | 'en';
  typeName: string;
  tagline: string;
  siteLabel: string; // e.g. "MBTI · 16 Personalities"
  cta: string; // e.g. "来测测你的人格类型"
  modeLabel: string; // e.g. "完整版"
}

const W = 1080;
const H = 1350;
const FONT = `-apple-system, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif`;

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Darken/lighten a hex color by amt (-255…255). */
function shade(hex: string, amt: number): string {
  const n = hex.replace('#', '');
  const v = parseInt(n.length === 3 ? n.split('').map((c) => c + c).join('') : n.slice(0, 6), 16);
  if (!Number.isFinite(v)) return hex;
  const r = Math.min(255, Math.max(0, ((v >> 16) & 255) + amt));
  const g = Math.min(255, Math.max(0, ((v >> 8) & 255) + amt));
  const b = Math.min(255, Math.max(0, (v & 255) + amt));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/**
 * Draws a portrait (1080×1350) result card in one of three styles.
 * All styles use fixed palettes so cards look consistent regardless of the
 * site theme they were shared from.
 */
export function drawResultCard(
  result: TestResult,
  color: string,
  text: CardText,
  style: CardStyle = 'classic',
): HTMLCanvasElement {
  if (style === 'minimal') return drawMinimalCard(result, color, text);
  if (style === 'vivid') return drawVividCard(result, color, text);
  return drawClassicCard(result, color, text);
}

function drawClassicCard(result: TestResult, color: string, text: CardText): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#121420');
  bg.addColorStop(1, '#181b2b');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // type-colored glow at the top
  const glow = ctx.createRadialGradient(W / 2, 190, 40, W / 2, 190, 620);
  glow.addColorStop(0, color + '5e');
  glow.addColorStop(1, color + '00');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, 900);

  // faint dot grid
  ctx.fillStyle = 'rgba(255,255,255,0.045)';
  for (let gy = 60; gy < H; gy += 60) {
    for (let gx = 60; gx < W; gx += 60) {
      ctx.beginPath();
      ctx.arc(gx, gy, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // header
  ctx.fillStyle = color;
  rr(ctx, 64, 64, 18, 18, 5);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = `600 30px ${FONT}`;
  ctx.textBaseline = 'middle';
  ctx.fillText(text.siteLabel, 98, 74);

  const modeBadge = text.modeLabel;
  ctx.font = `500 26px ${FONT}`;
  const badgeW = ctx.measureText(modeBadge).width + 44;
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 2;
  rr(ctx, W - 64 - badgeW, 50, badgeW, 46, 23);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.fillText(modeBadge, W - 64 - badgeW + 22, 74);

  // type code
  const code = `${result.type}-${result.identity}`;
  ctx.textAlign = 'center';
  ctx.font = `800 132px ${FONT}`;
  ctx.fillStyle = color;
  ctx.fillText(code, W / 2, 250);

  // type name (auto-shrink for long names)
  let nameSize = 72;
  ctx.font = `700 ${nameSize}px ${FONT}`;
  while (ctx.measureText(text.typeName).width > W - 200 && nameSize > 40) {
    nameSize -= 4;
    ctx.font = `700 ${nameSize}px ${FONT}`;
  }
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text.typeName, W / 2, 362);

  // tagline
  ctx.font = `400 34px ${FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.fillText(text.tagline, W / 2, 428);

  // dimension bars
  const barX = 96;
  const barW = W - 96 * 2;
  const rowH = 116;
  const startY = 520;
  DIM_ORDER.forEach((dim, i) => {
    const meta = dimMeta(dim);
    const leftPct = result.dims[dim].leftPct;
    const leftName = meta.leftLabel[text.lang];
    const rightName = meta.rightLabel[text.lang];
    const y = startY + i * rowH;

    ctx.textAlign = 'left';
    ctx.font = `600 30px ${FONT}`;
    ctx.fillStyle = leftPct >= 50 ? '#ffffff' : 'rgba(255,255,255,0.5)';
    ctx.fillText(`${leftName} ${leftPct}%`, barX, y);

    ctx.textAlign = 'right';
    ctx.fillStyle = leftPct >= 50 ? 'rgba(255,255,255,0.5)' : '#ffffff';
    ctx.fillText(`${100 - leftPct}% ${rightName}`, barX + barW, y);

    // track
    ctx.fillStyle = 'rgba(255,255,255,0.13)';
    rr(ctx, barX, y + 18, barW, 20, 10);
    ctx.fill();

    // fill from the left side
    const fillW = (barW * leftPct) / 100;
    const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    grad.addColorStop(0, color);
    grad.addColorStop(1, color + '88');
    ctx.fillStyle = grad;
    if (fillW > 20) {
      rr(ctx, barX, y + 18, fillW, 20, 10);
      ctx.fill();
    }

    // midpoint tick
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fillRect(barX + barW / 2 - 1, y + 10, 2, 36);
  });

  // footer
  const footerY = H - 120;
  ctx.textAlign = 'center';
  ctx.font = `600 40px ${FONT}`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text.cta, W / 2, footerY);

  ctx.font = `500 30px ${FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.fillText(window.location.host, W / 2, footerY + 56);

  // footer line
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(96, footerY - 56);
  ctx.lineTo(W - 96, footerY - 56);
  ctx.stroke();

  return canvas;
}

/** Light paper-like card — airy layout, thin rules, type color as the only accent. */
function drawMinimalCard(result: TestResult, color: string, text: CardText): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.fillStyle = '#faf9f6';
  ctx.fillRect(0, 0, W, H);

  // thin frame
  ctx.strokeStyle = '#e4e1d8';
  ctx.lineWidth = 2;
  rr(ctx, 48, 48, W - 96, H - 96, 8);
  ctx.stroke();

  // header
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  rr(ctx, 96, 108, 14, 14, 4);
  ctx.fill();
  ctx.fillStyle = '#8b8878';
  ctx.font = `600 26px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.fillText(text.siteLabel, 124, 116);

  const modeBadge = text.modeLabel;
  ctx.font = `500 24px ${FONT}`;
  const badgeW = ctx.measureText(modeBadge).width + 40;
  ctx.strokeStyle = '#ddd9cc';
  rr(ctx, W - 96 - badgeW, 94, badgeW, 44, 22);
  ctx.stroke();
  ctx.fillStyle = '#8b8878';
  ctx.fillText(modeBadge, W - 96 - badgeW + 20, 117);

  // type code — oversized, tracking-wide
  const code = `${result.type}-${result.identity}`;
  ctx.textAlign = 'center';
  let size = 150;
  ctx.font = `800 ${size}px ${FONT}`;
  while (ctx.measureText(code).width > W - 240 && size > 60) {
    size -= 6;
    ctx.font = `800 ${size}px ${FONT}`;
  }
  ctx.fillStyle = color;
  ctx.fillText(code.split('').join('\u2009'), W / 2, 330);

  // name + tagline
  let nameSize = 62;
  ctx.font = `700 ${nameSize}px ${FONT}`;
  while (ctx.measureText(text.typeName).width > W - 220 && nameSize > 36) {
    nameSize -= 4;
    ctx.font = `700 ${nameSize}px ${FONT}`;
  }
  ctx.fillStyle = '#1f1d18';
  ctx.fillText(text.typeName, W / 2, 448);

  ctx.font = `400 30px ${FONT}`;
  ctx.fillStyle = '#97937f';
  ctx.fillText(text.tagline, W / 2, 512);

  // divider
  ctx.strokeStyle = '#e4e1d8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(96, 580);
  ctx.lineTo(W - 96, 580);
  ctx.stroke();

  // dimension bars — hairline style
  const barX = 110;
  const barW = W - 220;
  const rowH = 108;
  const startY = 650;
  DIM_ORDER.forEach((dim, i) => {
    const meta = dimMeta(dim);
    const leftPct = result.dims[dim].leftPct;
    const leftName = meta.leftLabel[text.lang];
    const rightName = meta.rightLabel[text.lang];
    const y = startY + i * rowH;

    ctx.textAlign = 'left';
    ctx.font = `600 27px ${FONT}`;
    ctx.fillStyle = leftPct >= 50 ? '#1f1d18' : '#b3af9c';
    ctx.fillText(`${leftName} ${leftPct}%`, barX, y);

    ctx.textAlign = 'right';
    ctx.fillStyle = leftPct >= 50 ? '#b3af9c' : '#1f1d18';
    ctx.fillText(`${100 - leftPct}% ${rightName}`, barX + barW, y);

    ctx.fillStyle = '#ece9de';
    rr(ctx, barX, y + 16, barW, 12, 6);
    ctx.fill();

    const fillW = (barW * leftPct) / 100;
    ctx.fillStyle = color;
    if (fillW > 12) {
      rr(ctx, barX, y + 16, fillW, 12, 6);
      ctx.fill();
    }

    ctx.fillStyle = '#d8d4c4';
    ctx.fillRect(barX + barW / 2 - 1, y + 8, 2, 28);
  });

  // footer
  const footerY = H - 150;
  ctx.textAlign = 'center';
  ctx.font = `600 34px ${FONT}`;
  ctx.fillStyle = '#1f1d18';
  ctx.fillText(text.cta, W / 2, footerY);
  ctx.font = `500 26px ${FONT}`;
  ctx.fillStyle = '#a39f8b';
  ctx.fillText(window.location.host, W / 2, footerY + 52);

  return canvas;
}

/** Bold card — a big color-flooded hero on top, clean white chart below. */
function drawVividCard(result: TestResult, color: string, text: CardText): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const heroH = 700;

  // hero: color gradient flood
  const hero = ctx.createLinearGradient(0, 0, W, heroH);
  hero.addColorStop(0, shade(color, 10));
  hero.addColorStop(1, shade(color, -70));
  ctx.fillStyle = hero;
  ctx.fillRect(0, 0, W, heroH);

  // decorative rings
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 3;
  for (const [cx, cy, r] of [[W - 120, 130, 90], [90, heroH - 90, 130], [W - 200, heroH - 40, 60]] as const) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // header on hero
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  rr(ctx, 72, 76, 18, 18, 5);
  ctx.fill();
  ctx.font = `600 30px ${FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText(text.siteLabel, 106, 86);

  ctx.textAlign = 'right';
  ctx.font = `600 26px ${FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fillText(text.modeLabel, W - 72, 86);

  // type code — giant white
  const code = `${result.type}-${result.identity}`;
  ctx.textAlign = 'center';
  let size = 168;
  ctx.font = `800 ${size}px ${FONT}`;
  while (ctx.measureText(code).width > W - 160 && size > 70) {
    size -= 8;
    ctx.font = `800 ${size}px ${FONT}`;
  }
  ctx.fillStyle = '#ffffff';
  ctx.fillText(code, W / 2, 330);

  let nameSize = 64;
  ctx.font = `700 ${nameSize}px ${FONT}`;
  while (ctx.measureText(text.typeName).width > W - 200 && nameSize > 38) {
    nameSize -= 4;
    ctx.font = `700 ${nameSize}px ${FONT}`;
  }
  ctx.fillText(text.typeName, W / 2, 470);

  ctx.font = `400 31px ${FONT}`;
  ctx.fillStyle = 'rgba(255,255,255,0.82)';
  ctx.fillText(text.tagline, W / 2, 545);

  // body: white
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, heroH, W, H - heroH);

  const barX = 100;
  const barW = W - 200;
  const rowH = 92;
  const startY = heroH + 90;
  DIM_ORDER.forEach((dim, i) => {
    const meta = dimMeta(dim);
    const leftPct = result.dims[dim].leftPct;
    const leftName = meta.leftLabel[text.lang];
    const rightName = meta.rightLabel[text.lang];
    const y = startY + i * rowH;

    ctx.textAlign = 'left';
    ctx.font = `600 26px ${FONT}`;
    ctx.fillStyle = leftPct >= 50 ? '#1c2130' : '#a9afc0';
    ctx.fillText(`${leftName} ${leftPct}%`, barX, y);

    ctx.textAlign = 'right';
    ctx.fillStyle = leftPct >= 50 ? '#a9afc0' : '#1c2130';
    ctx.fillText(`${100 - leftPct}% ${rightName}`, barX + barW, y);

    ctx.fillStyle = '#eef0f6';
    rr(ctx, barX, y + 14, barW, 18, 9);
    ctx.fill();

    const fillW = (barW * leftPct) / 100;
    const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
    grad.addColorStop(0, shade(color, 10));
    grad.addColorStop(1, shade(color, -40));
    ctx.fillStyle = grad;
    if (fillW > 18) {
      rr(ctx, barX, y + 14, fillW, 18, 9);
      ctx.fill();
    }

    ctx.fillStyle = '#c8ccd9';
    ctx.fillRect(barX + barW / 2 - 1, y + 7, 2, 32);
  });

  // footer
  const footerY = H - 92;
  ctx.textAlign = 'center';
  ctx.font = `600 32px ${FONT}`;
  ctx.fillStyle = '#1c2130';
  ctx.fillText(text.cta, W / 2, footerY);
  ctx.font = `500 25px ${FONT}`;
  ctx.fillStyle = '#a9afc0';
  ctx.fillText(window.location.host, W / 2, footerY + 46);

  return canvas;
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string): void {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }, 'image/png');
}
