import { mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const outDir = new URL("../dist/awards/", import.meta.url).pathname;
mkdirSync(outDir, { recursive: true });

const ranks = [
  ["scribbler", "Scribbler"],
  ["drafter", "Drafter"],
  ["wordsmith", "Wordsmith"],
  ["prompt-apprentice", "Prompt Apprentice"],
  ["prompt-crafter", "Prompt Crafter"],
  ["prompt-artisan", "Prompt Artisan"],
  ["prompt-sage", "Prompt Sage"],
  ["prompt-smith", "Prompt Smith"],
  ["prompt-master", "Prompt Master"],
  ["prompt-architect", "Prompt Architect"],
  ["prompt-virtuoso", "Prompt Virtuoso"],
  ["prompt-legend", "Prompt Legend"],
];

const gold = {
  core: "#E0A93B",
  shadow: "#B57E1E",
  highlight: "#FBE39A",
};

const slug = (level, id) => `award-${String(level).padStart(2, "0")}-${id}`;
const polar = (cx, cy, r, deg) => {
  const a = (deg - 90) * Math.PI / 180;
  return [+(cx + r * Math.cos(a)).toFixed(2), +(cy + r * Math.sin(a)).toFixed(2)];
};

function defs(id) {
  return `
  <defs>
    <radialGradient id="${id}-face" cx="35%" cy="25%" r="78%">
      <stop offset="0" stop-color="${gold.highlight}"/>
      <stop offset="0.34" stop-color="${gold.core}"/>
      <stop offset="0.92" stop-color="${gold.shadow}"/>
    </radialGradient>
    <radialGradient id="${id}-inner" cx="38%" cy="26%" r="82%">
      <stop offset="0" stop-color="${gold.highlight}" stop-opacity=".92"/>
      <stop offset=".42" stop-color="${gold.core}" stop-opacity=".9"/>
      <stop offset="1" stop-color="${gold.shadow}" stop-opacity=".96"/>
    </radialGradient>
    <linearGradient id="${id}-rim" x1="48" y1="36" x2="184" y2="202" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="${gold.highlight}"/>
      <stop offset=".5" stop-color="${gold.core}"/>
      <stop offset="1" stop-color="${gold.shadow}"/>
    </linearGradient>
    <linearGradient id="${id}-dark" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${gold.core}"/>
      <stop offset="1" stop-color="${gold.shadow}"/>
    </linearGradient>
    <linearGradient id="${id}-light" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${gold.highlight}"/>
      <stop offset=".55" stop-color="${gold.core}"/>
      <stop offset="1" stop-color="${gold.shadow}"/>
    </linearGradient>
    <radialGradient id="${id}-glow" cx="50%" cy="48%" r="52%">
      <stop offset="0" stop-color="${gold.highlight}" stop-opacity=".46"/>
      <stop offset=".55" stop-color="${gold.core}" stop-opacity=".18"/>
      <stop offset="1" stop-color="${gold.core}" stop-opacity="0"/>
    </radialGradient>
  </defs>`;
}

function sparkPath(cx = 120, cy = 101, r1 = 42, r2 = 13) {
  const top = polar(cx, cy, r1, 0);
  const right = polar(cx, cy, r1, 90);
  const bottom = polar(cx, cy, r1, 180);
  const left = polar(cx, cy, r1, 270);
  const a = polar(cx, cy, r2, 45);
  const b = polar(cx, cy, r2, 135);
  const c = polar(cx, cy, r2, 225);
  const d = polar(cx, cy, r2, 315);
  return `M${top[0]} ${top[1]} C${a[0]} ${a[1]} ${right[0] - 6} ${right[1] - 6} ${right[0]} ${right[1]}
          C${b[0]} ${b[1]} ${bottom[0] + 6} ${bottom[1] - 6} ${bottom[0]} ${bottom[1]}
          C${c[0]} ${c[1]} ${left[0] + 6} ${left[1] + 6} ${left[0]} ${left[1]}
          C${d[0]} ${d[1]} ${top[0] - 6} ${top[1] + 6} ${top[0]} ${top[1]}Z`;
}

function sunburst(id, count, level) {
  if (!count) return "";
  const pieces = [];
  const long = level >= 6 ? 78 : 71;
  const short = 49;
  for (let i = 0; i < count; i++) {
    const mid = i * 360 / count;
    const p1 = polar(120, 101, short, mid - 11);
    const p2 = polar(120, 101, long, mid);
    const p3 = polar(120, 101, short, mid + 11);
    pieces.push(`<path d="M120 101 L${p1[0]} ${p1[1]} L${p2[0]} ${p2[1]} L${p3[0]} ${p3[1]}Z" fill="url(#${id}-light)" opacity="${level >= 6 ? ".56" : ".38"}"/>`);
  }
  return `<g aria-hidden="true">${pieces.join("")}</g>`;
}

function studs(id, count) {
  if (!count) return "";
  const angles = count === 1 ? [0] : count === 2 ? [-38, 38] : [-48, 0, 48];
  return `<g aria-hidden="true">${angles.map((a) => {
    const [x, y] = polar(120, 101, 80, a);
    return `<circle cx="${x}" cy="${y}" r="5.6" fill="url(#${id}-light)" stroke="${gold.shadow}" stroke-width="1.5"/>`;
  }).join("")}</g>`;
}

function laurel(id, level) {
  if (level < 7 || level > 9) return "";
  const leaves = level === 7 ? 4 : level === 8 ? 6 : 7;
  const start = level === 7 ? 144 : 118;
  const end = level === 7 ? 216 : 250;
  const groups = [];
  for (let side of [-1, 1]) {
    for (let i = 0; i < leaves; i++) {
      const t = leaves === 1 ? 0 : i / (leaves - 1);
      const deg = start + (end - start) * t;
      const [x, y] = polar(120, 101, 76, side === -1 ? -deg : deg);
      const rot = side === -1 ? 42 - i * 8 : -42 + i * 8;
      groups.push(`<ellipse cx="${x}" cy="${y}" rx="5.4" ry="11" transform="rotate(${rot} ${x} ${y})" fill="url(#${id}-light)" stroke="${gold.shadow}" stroke-width="1"/>`);
    }
  }
  const ribbon = level >= 9 ? `<path d="M83 181 C98 192 142 192 157 181 L148 202 L120 192 L92 202Z" fill="url(#${id}-dark)" stroke="${gold.shadow}" stroke-width="2"/>` : "";
  return `<g aria-hidden="true">${groups.join("")}${ribbon}</g>`;
}

function gems(id, level) {
  if (level < 10) return "";
  const angles = level === 10 ? [-52, -24, 24, 52] : [-60, -32, 0, 32, 60];
  return `<g aria-hidden="true">${angles.map((a) => {
    const [x, y] = polar(120, 101, 72, a);
    return `<path d="M${x} ${y - 6} L${x + 6} ${y} L${x} ${y + 6} L${x - 6} ${y}Z" fill="${gold.highlight}" stroke="${gold.shadow}" stroke-width="1.2"/>`;
  }).join("")}</g>`;
}

function crown(id, level) {
  if (level < 11) return "";
  return `
  <g aria-hidden="true">
    <path d="M76 24 L92 52 L109 20 L120 56 L131 20 L148 52 L164 24 L158 70 L82 70Z" fill="url(#${id}-light)" stroke="${gold.shadow}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M86 64 H154" stroke="${gold.highlight}" stroke-width="5" stroke-linecap="round" opacity=".82"/>
    <circle cx="109" cy="20" r="5" fill="${gold.highlight}" stroke="${gold.shadow}" stroke-width="1.5"/>
    <circle cx="120" cy="56" r="4" fill="${gold.highlight}" stroke="${gold.shadow}" stroke-width="1.2"/>
    <circle cx="131" cy="20" r="5" fill="${gold.highlight}" stroke="${gold.shadow}" stroke-width="1.5"/>
  </g>`;
}

function wings(id, level) {
  if (level < 12) return "";
  return `
  <g aria-hidden="true" opacity=".95">
    <path d="M52 98 C27 103 18 126 21 153 C38 142 52 135 72 136 C59 126 54 114 52 98Z" fill="url(#${id}-light)" stroke="${gold.shadow}" stroke-width="2"/>
    <path d="M188 98 C213 103 222 126 219 153 C202 142 188 135 168 136 C181 126 186 114 188 98Z" fill="url(#${id}-light)" stroke="${gold.shadow}" stroke-width="2"/>
    <path d="M28 145 C43 137 55 133 72 136" fill="none" stroke="${gold.highlight}" stroke-width="3" stroke-linecap="round" opacity=".72"/>
    <path d="M212 145 C197 137 185 133 168 136" fill="none" stroke="${gold.highlight}" stroke-width="3" stroke-linecap="round" opacity=".72"/>
  </g>`;
}

function levelPlate(id, level) {
  const text = String(level);
  return `
  <g aria-label="Level ${level}">
    <path d="M82 181 C93 174 147 174 158 181 L164 205 C150 215 90 215 76 205Z" fill="url(#${id}-dark)" stroke="${gold.shadow}" stroke-width="2.5"/>
    <path d="M89 184 C103 180 137 180 151 184" fill="none" stroke="${gold.highlight}" stroke-width="3" stroke-linecap="round" opacity=".7"/>
    <text x="120" y="202" text-anchor="middle" font-family="Sora, Avenir Next, Helvetica, Arial, sans-serif" font-size="${level >= 10 ? 18 : 20}" font-weight="800" fill="${gold.highlight}" stroke="${gold.shadow}" stroke-width=".6" paint-order="stroke">${text}</text>
  </g>`;
}

function medallionBase(id, level) {
  const polished = level >= 10;
  const glow = level >= 12 ? `<circle cx="120" cy="104" r="104" fill="url(#${id}-glow)" opacity=".8"/>` : "";
  const shine = polished
    ? `<path d="M64 66 C86 34 136 27 169 52" fill="none" stroke="${gold.highlight}" stroke-width="7" stroke-linecap="round" opacity=".72"/>`
    : `<path d="M69 65 C91 40 133 37 160 56" fill="none" stroke="${gold.highlight}" stroke-width="5" stroke-linecap="round" opacity=".46"/>`;
  return `
  ${glow}
  <circle cx="120" cy="104" r="94" fill="url(#${id}-rim)"/>
  <circle cx="120" cy="104" r="84" fill="url(#${id}-face)" stroke="${gold.shadow}" stroke-width="3"/>
  <circle cx="120" cy="104" r="66" fill="url(#${id}-inner)" opacity=".9"/>
  <circle cx="120" cy="104" r="92" fill="none" stroke="${gold.highlight}" stroke-width="3.2" opacity=".58"/>
  <circle cx="120" cy="104" r="74" fill="none" stroke="${gold.shadow}" stroke-width="2" opacity=".45"/>
  ${shine}`;
}

function centerEmblem(id, level) {
  const orbOpacity = level >= 10 ? ".92" : ".82";
  return `
  <g aria-label="ENA center spark and orb">
    <circle cx="120" cy="101" r="48" fill="url(#${id}-inner)" stroke="${gold.highlight}" stroke-width="2.5" opacity="${orbOpacity}"/>
    <path d="${sparkPath(120, 101, level >= 10 ? 43 : 39, 12)}" fill="${gold.highlight}" stroke="${gold.shadow}" stroke-width="1.4"/>
    <path d="M85 88 C100 72 134 70 151 88" fill="none" stroke="${gold.highlight}" stroke-width="4" stroke-linecap="round" opacity=".6"/>
  </g>`;
}

function svg(level, slugPart, name) {
  const id = `ena-award-${level}`;
  const rayCount = level >= 4 && level <= 6 ? [4, 6, 8][level - 4] : level >= 10 ? 12 : 0;
  const studCount = level <= 3 ? level : 0;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240" role="img" aria-labelledby="${id}-title ${id}-desc">
  <title id="${id}-title">ENA ${name} rank award</title>
  <desc id="${id}-desc">Warm gold ENA medallion for level ${level}, ${name}. Transparent background.</desc>
  ${defs(id)}
  ${wings(id, level)}
  ${medallionBase(id, level)}
  ${sunburst(id, rayCount, level)}
  ${studs(id, studCount)}
  ${laurel(id, level)}
  ${gems(id, level)}
  ${centerEmblem(id, level)}
  ${crown(id, level)}
  ${levelPlate(id, level)}
</svg>
`;
}

for (let i = 0; i < ranks.length; i++) {
  const level = i + 1;
  const [id, name] = ranks[i];
  const filename = `${slug(level, id)}.svg`;
  writeFileSync(join(outDir, filename), svg(level, id, name));
}

for (let i = 0; i < ranks.length; i++) {
  const level = i + 1;
  const [id] = ranks[i];
  const base = slug(level, id);
  const svgPath = join(outDir, `${base}.svg`);
  for (const size of [96, 192, 288]) {
    execFileSync("rsvg-convert", ["-w", String(size), "-h", String(size), "-o", join(outDir, `${base}-${size}.png`), svgPath]);
  }
}

writeFileSync(join(outDir, "awards-manifest.json"), JSON.stringify({
  palette: gold,
  canvas: "240x240",
  exports: [96, 192, 288],
  ranks: ranks.map(([id, name], index) => ({
    level: index + 1,
    name,
    svg: `${slug(index + 1, id)}.svg`,
    png: [96, 192, 288].map((size) => `${slug(index + 1, id)}-${size}.png`),
  })),
}, null, 2));

console.log(`Generated ${ranks.length} SVG awards and ${ranks.length * 3} PNG exports in ${outDir}`);
