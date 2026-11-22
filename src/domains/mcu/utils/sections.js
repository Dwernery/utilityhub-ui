// Builds what the tracker shows: saga and category sections, the default expansion,
// the "Not Finished" filter, search and item lookup.
// Mirrors utility-hub-mobile's lib/mcu/utils/sections.ts.
import { SAGAS } from "./constants";
import {
  combineStats,
  computeStats,
  isItemComplete,
  typeSummary,
} from "./stats";

/**
 * @typedef {{ key: string, label: string, color: string, items: object[], stats: object }} PhaseCard
 * @typedef {{ key: string, title: string, subtitle: string, color: string, cards: PhaseCard[],
 *   isCategory: boolean, stats: object }} TrackerSection
 *   `isCategory`: categories render their posters directly (no per-phase card).
 */

/** The color a phase is shown in: its saga's (phases have none of their own). */
export function phaseColor(num) {
  return (SAGAS.find((saga) => saga.phaseNums.includes(num)) ?? SAGAS[0]).color;
}

/** Accent for a phase or category, as shown on its posters. */
const groupColor = (group) =>
  "num" in group ? phaseColor(group.num) : group.color;

/** Saga sections for the "MCU Phases" view. Sagas with no phases yet are left out. */
export function sagaSections(phases, watched) {
  return SAGAS.map((saga) => {
    const cards = saga.phaseNums
      .map((num) => phases.find((p) => p.num === num))
      .filter(Boolean)
      .map((phase) => ({
        key: `phase-${phase.num}`,
        label: `PHASE ${phase.num}`,
        color: saga.color,
        items: phase.items,
        stats: computeStats(phase.items, watched),
      }));
    return {
      key: `saga-${saga.id}`,
      title: saga.title,
      subtitle: [
        saga.years,
        `Phases ${saga.phaseNums[0]}–${saga.phaseNums.at(-1)}`,
      ]
        .filter(Boolean)
        .join(" · "),
      color: saga.color,
      cards,
      isCategory: false,
      stats: combineStats(cards.map((c) => c.stats)),
    };
  }).filter((section) => section.cards.length > 0);
}

/** One section per Expanded Universe category. */
export function categorySections(categories, watched) {
  return categories.map((category) => {
    const stats = computeStats(category.items, watched);
    return {
      key: `saga-${category.id}`,
      title: category.title,
      subtitle: typeSummary(stats),
      color: category.color,
      cards: [
        {
          key: category.id,
          label: category.title.toUpperCase(),
          color: category.color,
          items: category.items,
          stats,
        },
      ],
      isCategory: true,
      stats,
    };
  });
}

/**
 * Keep only unfinished titles (unwatched or partly watched), dropping cards and sections left
 * empty. Stats stay those of the whole section, so percentages don't change with the filter.
 */
export function unfinishedOnly(sections, watched) {
  return sections
    .map((section) => ({
      ...section,
      cards: section.cards
        .map((card) => ({
          ...card,
          items: card.items.filter((item) => !isItemComplete(item, watched)),
        }))
        .filter((card) => card.items.length > 0),
    }))
    .filter((section) => section.cards.length > 0);
}

/**
 * Titles matching `query` (case-insensitive) across both views, in tracker order, each with
 * its poster color. A show matches on its title or any episode title; each matching season
 * is its own result.
 * @returns {{ item: object, color: string }[]}
 */
export function searchItems(phases, categories, query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const seen = new Set();
  const out = [];
  for (const group of [...phases, ...categories]) {
    for (const item of group.items) {
      if (seen.has(item.globalId)) continue;
      const hit =
        item.title.toLowerCase().includes(q) ||
        (item.type === "tv" &&
          item.episodes.some((e) => e.title.toLowerCase().includes(q)));
      if (hit) {
        seen.add(item.globalId);
        out.push({ item, color: groupColor(group) });
      }
    }
  }
  return out;
}

/** Sections (and phase cards) start expanded when they still have something unwatched. */
export function defaultExpanded(sections) {
  const out = {};
  for (const s of sections) {
    out[s.key] = s.stats.done < s.stats.total;
    for (const c of s.cards) out[c.key] = c.stats.done < c.stats.total;
  }
  return out;
}

/** Find an item by its `id` or `globalId`, with the color its posters use (saga or category). */
export function findItem(phases, categories, id) {
  if (!id) return null;
  for (const group of [...phases, ...categories]) {
    const item = group.items.find((i) => i.globalId === id || i.id === id);
    if (item) return { item, color: groupColor(group) };
  }
  return null;
}
