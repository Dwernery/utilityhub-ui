// Deterministic, per-item generative poster gradients. These stay as plain
// JS helpers (rather than static Tailwind classes) because each poster needs
// a unique gradient derived from its id + phase color at runtime.

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (Math.imul(hash, 31) + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function hexToRgb(hex) {
  const value = hex.replace("#", "");
  return [
    parseInt(value.slice(0, 2), 16),
    parseInt(value.slice(2, 4), 16),
    parseInt(value.slice(4, 6), 16),
  ];
}

/** Lighten (+) or darken (−) a hex color by a percentage of 255, with optional alpha (0–1). */
function shade(hex, percent, alpha = 1) {
  const [r, g, b] = hexToRgb(hex);
  const adjust = (channel) =>
    Math.max(0, Math.min(255, Math.round(channel + (percent / 100) * 255)));
  return alpha < 1
    ? `rgba(${adjust(r)}, ${adjust(g)}, ${adjust(b)}, ${alpha})`
    : `rgb(${adjust(r)}, ${adjust(g)}, ${adjust(b)})`;
}

export function posterBackground(id, color) {
  const seed = hashString(id);
  const x1 = 10 + seededRandom(seed) * 70;
  const y1 = 5 + seededRandom(seed + 1) * 35;
  const x2 = 10 + seededRandom(seed + 2) * 75;
  const y2 = 35 + seededRandom(seed + 3) * 40;
  const x3 = 15 + seededRandom(seed + 4) * 65;
  const y3 = 55 + seededRandom(seed + 5) * 35;

  // Alphas match mobile's posterArt.ts (FA≈0.98, F0≈0.94, E0≈0.88). These used to be
  // hex suffixes on rgb() strings ("rgb(…)FA"), which is invalid CSS, so browsers
  // dropped the whole background and the fallback art never showed.
  return [
    `radial-gradient(circle at ${x1}% ${y1}%, ${shade(color, 38, 0.98)} 0%, transparent 50%)`,
    `radial-gradient(circle at ${x2}% ${y2}%, ${shade(color, 0, 0.94)} 0%, transparent 55%)`,
    `radial-gradient(circle at ${x3}% ${y3}%, ${shade(color, -8, 0.88)} 0%, transparent 62%)`,
    `linear-gradient(150deg, #262b3a 0%, #171a22 100%)`,
  ].join(",");
}
