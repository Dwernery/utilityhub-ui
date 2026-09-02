// Watch-progress math shared by the header, saga rollups, and section cards.
// `watched` is a flat map keyed by item id (movies/specials) or episode.globalId (tv episodes)
// Values are one of: "UNWATCHED", "IN_PROGRESS", "WATCHED"

export const STATUS_CYCLE = ["UNWATCHED", "IN_PROGRESS", "WATCHED"];

export function getStatus(watched, key) {
  return watched[key] ?? "UNWATCHED";
}

export function nextStatus(current) {
  const index = STATUS_CYCLE.indexOf(current ?? "UNWATCHED");
  return STATUS_CYCLE[(index + 1) % STATUS_CYCLE.length];
}

/**
 * Check if an item is completely watched
 * For TV: all episodes are WATCHED
 * For movies/specials: status is WATCHED
 */
export function isItemComplete(item, watched) {
  if (item.type === "tv") {
    if (!item.episodes?.length) return false;
    return item.episodes.every(
      (episode) => getStatus(watched, episode.globalId) === "WATCHED",
    );
  }
  return getStatus(watched, item.id) === "WATCHED";
}

/**
 * Check if an item is partially watched (in progress)
 * For TV: some episodes are watched or in progress, but not all
 * For movies/specials: status is IN_PROGRESS
 */
export function isItemPartial(item, watched) {
  if (item.type === "tv") {
    if (!item.episodes?.length) return false;
    const watchedCount = item.episodes.filter(
      (episode) => getStatus(watched, episode.globalId) !== "UNWATCHED",
    ).length;
    return watchedCount > 0 && !isItemComplete(item, watched);
  }
  return getStatus(watched, item.id) === "IN_PROGRESS";
}

/**
 * Get the progress fraction for a TV show (0-1)
 * Used for progress ring on poster cards
 */
export function getItemProgressFraction(item, watched) {
  if (item.type !== "tv") return 0.5;
  if (!item.episodes?.length) return 0;
  const watchedCount = item.episodes.filter(
    (episode) => getStatus(watched, episode.globalId) === "WATCHED",
  ).length;
  return watchedCount / item.episodes.length;
}

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
      if (getStatus(watched, item.id) === "WATCHED") {
        stats.moviesDone++;
        stats.done++;
      }
    } else if (item.type === "special") {
      stats.specials++;
      if (getStatus(watched, item.id) === "WATCHED") {
        stats.specialsDone++;
        stats.done++;
      }
    } else if (item.type === "tv") {
      stats.episodes += item.episodes.length;
      for (const episode of item.episodes) {
        if (getStatus(watched, episode.globalId) === "WATCHED") {
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
