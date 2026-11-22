// Watch-progress math shared by the header, saga rollups, and section cards.
// `watched` is a flat map keyed by item id (movies/specials) or episode.globalId (tv episodes)
// Values are one of: "UNWATCHED", "IN_PROGRESS", "WATCHED"

export function getStatus(watched, key) {
  return watched[key] ?? "UNWATCHED";
}

/** One-click toggle: anything not yet watched becomes WATCHED; WATCHED goes back to UNWATCHED. */
export function toggleWatched(current) {
  return current === "WATCHED" ? "UNWATCHED" : "WATCHED";
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

/** Runtime in minutes; every production title has one, so a missing value just counts as 0. */
function minutesOf(runtime) {
  return runtime ?? 0;
}

/**
 * Get the progress fraction for a TV show (0-1): share of its runtime watched
 * Used for progress ring on poster cards
 */
export function getItemProgressFraction(item, watched) {
  if (item.type !== "tv") return 0.5;
  if (!item.episodes?.length) return 0;
  let total = 0;
  let done = 0;
  for (const episode of item.episodes) {
    const minutes = minutesOf(episode.runtime);
    total += minutes;
    if (getStatus(watched, episode.globalId) === "WATCHED") done += minutes;
  }
  return total > 0 ? done / total : 0;
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
  // Runtime of everything counted, in minutes.
  minutes: 0,
  minutesDone: 0,
};

export function computeStats(items, watched) {
  const stats = { ...EMPTY_STATS };

  for (const item of items) {
    stats.total += unitCount(item);

    // Time watched: only finished titles count; in-progress ones add nothing until watched.
    if (item.type !== "tv") {
      const minutes = minutesOf(item.runtime);
      stats.minutes += minutes;
      if (getStatus(watched, item.id) === "WATCHED")
        stats.minutesDone += minutes;
    }

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
        const minutes = minutesOf(episode.runtime);
        stats.minutes += minutes;
        if (getStatus(watched, episode.globalId) === "WATCHED") {
          stats.episodesDone++;
          stats.done++;
          stats.minutesDone += minutes;
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

/** Whole hours ("143h"); minutes only for the last stretch under an hour ("45 min to go"). */
export function formatMinutes(minutes) {
  return minutes < 60
    ? `${Math.round(minutes)} min`
    : `${Math.round(minutes / 60)}h`;
}

/** Runtime for detail views: "45 min", "2h", "2h 14m". */
export function formatRuntime(minutes) {
  const m = Math.round(minutes);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rest = m % 60;
  return rest ? `${h}h ${rest}m` : `${h}h`;
}

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

/** "3 movies · 1 special", skipping types with none; "No titles yet" when empty. */
export function typeSummary(stats) {
  const parts = [
    stats.movies && plural(stats.movies, "movie"),
    stats.episodes && plural(stats.episodes, "episode"),
    stats.specials && plural(stats.specials, "special"),
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : "No titles yet";
}

export function percentage(done, total) {
  return total > 0 ? Math.round((done / total) * 100) : 0;
}
