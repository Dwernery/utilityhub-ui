const normalizeStatus = (status) =>
  status === "WATCHED" || status === "IN_PROGRESS" ? status : "UNWATCHED";

/**
 * Build { [globalId]: status } for every movie, special and TV episode in the
 * tracker response. Mirrors utility-hub-mobile's lib/mcu/utils/watchedMap.ts.
 */
export function buildWatchedMap(data) {
  const watched = {};
  for (const domain of data?.domains ?? []) {
    for (const movie of domain?.movies ?? []) {
      if (movie?.globalId)
        watched[movie.globalId] = normalizeStatus(movie.status);
    }
    for (const show of domain?.shows ?? []) {
      for (const season of show?.seasons ?? []) {
        for (const episode of season?.episodes ?? []) {
          if (episode?.globalId) {
            watched[episode.globalId] = normalizeStatus(episode.status);
          }
        }
      }
    }
  }
  return watched;
}
