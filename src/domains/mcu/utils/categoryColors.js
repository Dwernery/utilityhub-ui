// Colors for Expanded Universe categories. The API sends none, and a category is just the
// `domain` text on its movies/shows, so the apps assign them. Mirrors utility-hub-mobile's
// lib/mcu/utils/categoryColors.ts.

/** Tailwind 400s; every one is ≥ 5.3:1 on the tracker's slate-800 cards. */
export const CATEGORY_PALETTE = [
  "#F87171", // red
  "#FB923C", // orange
  "#FBBF24", // amber
  "#34D399", // emerald
  "#2DD4BF", // teal
  "#F472B6", // pink
];

/** Today's categories keep these for good, whatever gets added later. Pin new ones here too. */
export const PINNED_CATEGORY_COLORS = {
  "Fox X-Men Universe": "#FBBF24",
  "Sony Spider-Man Universe": "#F87171",
  "The Defenders Saga": "#34D399",
};

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i++)
    hash = (Math.imul(hash, 31) + value.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

/**
 * Color for each category title. Pinned titles keep their color. Any other category takes the
 * least-used palette color (picked by a hash of its name among the ties), so new categories
 * never move an existing one and repeats stay as spread out as possible past six categories.
 * @param {string[]} titles
 * @returns {Record<string, string>}
 */
export function assignCategoryColors(titles) {
  const out = {};
  const uses = new Map(CATEGORY_PALETTE.map((c) => [c, 0]));
  const take = (title, color) => {
    out[title] = color;
    uses.set(color, (uses.get(color) ?? 0) + 1);
  };

  const unique = [...new Set(titles)];
  for (const title of unique)
    if (PINNED_CATEGORY_COLORS[title])
      take(title, PINNED_CATEGORY_COLORS[title]);
  for (const title of unique
    .filter((t) => !PINNED_CATEGORY_COLORS[t])
    .sort((a, b) => a.localeCompare(b))) {
    const fewest = Math.min(...uses.values());
    const candidates = CATEGORY_PALETTE.filter((c) => uses.get(c) === fewest);
    take(title, candidates[hashString(title) % candidates.length]);
  }
  return out;
}
