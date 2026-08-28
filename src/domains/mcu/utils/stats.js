// Watch-progress math shared by the header, saga rollups, and section cards.
// `watched` is a flat map keyed by item id (movies/specials) or
// `${itemId}::e${episodeIndex}` (tv episodes) -> true.

export function unitCount(item) {
  return item.type === "tv" ? item.episodes.length : 1;
}

const EMPTY_STATS = {
  total: 0,
  done: 0,
  movies: 0,
  moviesDone: 0,
  episodes: 0,
  episodesDone: 0,
  specials: 0,
  specialsDone: 0,
};

export function computeStats(items, watched) {
  const stats = { ...EMPTY_STATS };

  for (const item of items) {
    stats.total += unitCount(item);

    if (item.type === "movie") {
      stats.movies++;
      if (watched[item.id]) {
        stats.moviesDone++;
        stats.done++;
      }
    } else if (item.type === "special") {
      stats.specials++;
      if (watched[item.id]) {
        stats.specialsDone++;
        stats.done++;
      }
    } else if (item.type === "tv") {
      stats.episodes += item.episodes.length;
      for (let i = 0; i < item.episodes.length; i++) {
        if (watched[`${item.id}::e${i}`]) {
          stats.episodesDone++;
          stats.done++;
        }
      }
    }
  }

  return stats;
}

export function combineStats(statsList) {
  return statsList.reduce(
    (acc, stats) => {
      const next = { ...acc };
      for (const key of Object.keys(EMPTY_STATS)) next[key] += stats[key];
      return next;
    },
    { ...EMPTY_STATS },
  );
}

export function percentage(done, total) {
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

/** Finds the first unwatched, released item across a list of phases, in order. */
export function findNextUp(phases, watched) {
  for (const phase of phases) {
    for (const item of phase.items) {
      if (item.unreleased) continue;

      if (item.type === "tv") {
        const epIndex = item.episodes.findIndex(
          (_, i) => !watched[`${item.id}::e${i}`],
        );
        if (epIndex !== -1) return { item, phase, epIndex };
      } else if (!watched[item.id]) {
        return { item, phase, epIndex: null };
      }
    }
  }
  return null;
}
