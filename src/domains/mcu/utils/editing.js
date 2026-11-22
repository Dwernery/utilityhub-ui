// Pure helpers for adding, editing and deleting MCU content.
// Mirrors utility-hub-mobile's lib/mcu/utils/editing.ts.

/** Phases the saga view knows about (see SAGAS). Other domains are Expanded Universe categories. */
export const PHASE_DOMAINS = [
  "Phase 1",
  "Phase 2",
  "Phase 3",
  "Phase 4",
  "Phase 5",
  "Phase 6",
];

export const KIND_LABELS = {
  movie: "Movie",
  special: "Special",
  show: "Show Season",
};

/** "movie:12" → { kind: "movie", id: 12 }; also "show:3", "episode:40". */
export function parseGlobalId(globalId) {
  const match = /^(movie|show|episode):(\d+)$/.exec(globalId ?? "");
  return match ? { kind: match[1], id: Number(match[2]) } : null;
}

/**
 * The raw API record behind a tracker item, which still has the full premiere
 * date, the domain and the episode ids that the normalized items drop.
 * @returns {{ kind: "movie", movie: object, domain: string }
 *   | { kind: "show", show: object, seasonNumber: number, episodes: object[], domain: string }
 *   | null}
 */
export function findRaw(data, globalId) {
  for (const domain of data?.domains ?? []) {
    for (const movie of domain.movies ?? []) {
      if (movie.globalId === globalId) {
        return { kind: "movie", movie, domain: domain.domainName };
      }
    }
    for (const show of domain.shows ?? []) {
      if (show.globalId === globalId) {
        const season = show.seasons?.[0];
        return {
          kind: "show",
          show,
          seasonNumber: season?.seasonNumber ?? 1,
          episodes: season?.episodes ?? [],
          domain: domain.domainName,
        };
      }
    }
  }
  return null;
}

/** Phase 1–6 first, then every other domain already in use, alphabetically. */
export function domainOptions(data) {
  const others = new Set();
  for (const domain of data?.domains ?? []) {
    const name = domain.domainName?.trim();
    if (name && !PHASE_DOMAINS.includes(name)) others.add(name);
  }
  return [...PHASE_DOMAINS, ...[...others].sort((a, b) => a.localeCompare(b))];
}

/** The number to suggest for a new episode: one past the highest so far. */
export function nextEpisodeNumber(episodes) {
  return (
    (episodes ?? []).reduce(
      (max, e) => Math.max(max, e.episodeNumber ?? 0),
      0,
    ) + 1
  );
}

/** Form values for a blank item of the given kind ("movie" | "special" | "show"). */
export function emptyDraft(kind) {
  return {
    kind,
    title: "",
    premiereDate: "",
    runtime: "",
    season: kind === "show" ? "1" : "",
    domain: "",
    synopsis: "",
  };
}

/** Form values for editing an existing item (`raw` from findRaw). */
export function draftFromRaw(raw) {
  if (raw.kind === "movie") {
    const { movie } = raw;
    return {
      kind: movie.type === "SPECIAL" ? "special" : "movie",
      title: movie.title ?? "",
      premiereDate: movie.premiereDate ?? "",
      runtime: movie.runtime != null ? String(movie.runtime) : "",
      season: "",
      domain: raw.domain ?? "",
      synopsis: movie.synopsis ?? "",
    };
  }
  return {
    kind: "show",
    title: raw.show.title ?? "",
    premiereDate: raw.show.premiereDate ?? "",
    runtime: "",
    season: String(raw.seasonNumber),
    domain: raw.domain ?? "",
    synopsis: raw.show.synopsis ?? "",
  };
}

/** A new season of the same show: same title and domain, next season number, everything else blank. */
export function nextSeasonDraft(raw) {
  return {
    ...emptyDraft("show"),
    title: raw.show.title ?? "",
    domain: raw.domain ?? "",
    season: String(raw.seasonNumber + 1),
  };
}

const isPositiveInt = (value) =>
  /^\d+$/.test(String(value).trim()) && Number(value) > 0;

/**
 * Checks a draft and builds the request body.
 * @returns {{ ok: true, body: object } | { ok: false, error: string }}
 */
export function draftToRequest(draft) {
  const title = draft.title.trim();
  const domain = draft.domain.trim();
  const synopsis = draft.synopsis.trim();
  if (!title) return { ok: false, error: "Please enter a title" };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.premiereDate)) {
    return { ok: false, error: "Please choose a premiere date" };
  }
  if (!domain) return { ok: false, error: "Please choose a phase or category" };
  if (!synopsis) return { ok: false, error: "Please enter a synopsis" };

  if (draft.kind === "show") {
    if (!isPositiveInt(draft.season))
      return { ok: false, error: "Season must be a whole number above 0" };
    return {
      ok: true,
      body: {
        title,
        season: Number(draft.season),
        premiereDate: draft.premiereDate,
        synopsis,
        domain,
      },
    };
  }
  if (!isPositiveInt(draft.runtime))
    return { ok: false, error: "Runtime must be a whole number of minutes" };
  return {
    ok: true,
    body: {
      title,
      premiereDate: draft.premiereDate,
      runtime: Number(draft.runtime),
      synopsis,
      domain,
      special: draft.kind === "special",
    },
  };
}

/**
 * Checks an episode form and builds the request body.
 * @returns {{ ok: true, body: object } | { ok: false, error: string }}
 */
export function episodeToRequest({ episodeNumber, title, runtime }) {
  if (!isPositiveInt(episodeNumber))
    return {
      ok: false,
      error: "Episode number must be a whole number above 0",
    };
  if (!title.trim())
    return { ok: false, error: "Please enter an episode title" };
  if (!isPositiveInt(runtime))
    return { ok: false, error: "Runtime must be a whole number of minutes" };
  return {
    ok: true,
    body: {
      episodeNumber: Number(episodeNumber),
      title: title.trim(),
      runtime: Number(runtime),
    },
  };
}
