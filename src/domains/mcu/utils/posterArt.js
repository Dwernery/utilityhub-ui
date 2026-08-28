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

function shade(hex, percent) {
  const [r, g, b] = hexToRgb(hex);
  const adjust = (channel) =>
    Math.max(0, Math.min(255, Math.round(channel + (percent / 100) * 255)));
  return `rgb(${adjust(r)}, ${adjust(g)}, ${adjust(b)})`;
}

export function posterBackground(id, color) {
  const seed = hashString(id);
  const x1 = 10 + seededRandom(seed) * 70;
  const y1 = 5 + seededRandom(seed + 1) * 35;
  const x2 = 10 + seededRandom(seed + 2) * 75;
  const y2 = 35 + seededRandom(seed + 3) * 40;
  const x3 = 15 + seededRandom(seed + 4) * 65;
  const y3 = 55 + seededRandom(seed + 5) * 35;

  return [
    `radial-gradient(circle at ${x1}% ${y1}%, ${shade(color, 38)}FA 0%, transparent 50%)`,
    `radial-gradient(circle at ${x2}% ${y2}%, ${color}F0 0%, transparent 55%)`,
    `radial-gradient(circle at ${x3}% ${y3}%, ${shade(color, -8)}E0 0%, transparent 62%)`,
    `linear-gradient(150deg, #262b3a 0%, #171a22 100%)`,
  ].join(",");
}

export function gradientBar(color) {
  return `linear-gradient(90deg, ${shade(color, -18)}, ${shade(color, 22)})`;
}
