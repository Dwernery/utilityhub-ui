// Turns the tracker API response into posters grouped by phase and Expanded Universe
// category. Mirrors utility-hub-mobile's lib/mcu/utils/normalizeTrackerData.ts.
import { assignCategoryColors } from "./categoryColors";

/**
 * One poster on the tracker: a movie, a special, or one season of a show.
 *
 * @typedef {object} TrackerItem
 * @property {string} id  unique per poster (React key): the globalId, or "<globalId>-season<n>"
 * @property {number} recordId  the API's numeric id of the movie or season, for edit/delete calls
 * @property {string} globalId  "movie:12" or "show:3"
 * @property {"movie" | "special" | "tv"} type
 * @property {string} title
 * @property {number} [seasonNumber]  tv only
 * @property {number} premiereDate  the premiere year
 * @property {number} [runtime]  minutes; movies and specials
 * @property {string} [synopsis]
 * @property {string} [s3Url]  poster image
 * @property {{ id: number, globalId: string, episodeNumber: number, title: string, runtime: number }[]} [episodes]  tv only
 */

/** Each show record is one season. */
function normalizeShow(source) {
  return {
    id: `${source.globalId}-season${source.seasonNumber}`,
    recordId: source.id,
    globalId: source.globalId,
    type: "tv",
    title: source.title,
    seasonNumber: source.seasonNumber,
    premiereDate: source.premiereDate,
    synopsis: source.synopsis,
    s3Url: source.s3Url,
    episodes: (source.episodes ?? []).map((episode) => ({
      id: episode.id,
      title: episode.title,
      globalId: episode.globalId,
      episodeNumber: episode.episodeNumber,
      runtime: episode.runtime,
    })),
  };
}

function normalizeMovie(source) {
  return {
    id: source.globalId,
    recordId: source.id,
    globalId: source.globalId,
    type: source.type === "SPECIAL" ? "special" : "movie",
    title: source.title,
    premiereDate: source.premiereDate,
    runtime: source.runtime,
    synopsis: source.synopsis,
    s3Url: source.s3Url,
  };
}

/** Calendar dates ("YYYY-MM-DD") compare correctly as strings; undated items go last (like the API). */
const byPremiereDate = (a, b) => {
  const x = a.premiereDate || "9999";
  const y = b.premiereDate || "9999";
  return x < y ? -1 : x > y ? 1 : 0;
};

function extractDomainItems(domain) {
  const items = [
    ...(domain?.movies ?? []).map(normalizeMovie),
    ...(domain?.shows ?? []).map(normalizeShow),
  ].sort(byPremiereDate);
  // Read the year from the string: new Date(...) would use the browser's time zone and
  // can shift the year.
  return items.map((item) => ({
    ...item,
    premiereDate: item.premiereDate
      ? Number(item.premiereDate.slice(0, 4))
      : NaN,
  }));
}

export function normalizeTrackerData(apiData) {
  const domains = apiData?.domains ?? [];

  // Group domains by phase number ("Phase 1" → 1); everything else is Expanded Universe.
  // Phases show their saga's color (SAGAS), so they don't carry one.
  const phaseMap = {};
  const expandedDomains = [];

  for (const domain of domains) {
    const phaseMatch = domain.domainName?.match(/Phase\s+(\d+)/i);
    const phaseNumber = phaseMatch ? parseInt(phaseMatch[1], 10) : null;

    if (phaseNumber) {
      phaseMap[phaseNumber] ??= { num: phaseNumber, items: [] };
      phaseMap[phaseNumber].items.push(...extractDomainItems(domain));
    } else {
      expandedDomains.push(domain);
    }
  }

  const phases = Object.values(phaseMap).sort((a, b) => a.num - b.num);

  // The API sends no colors; each category gets its own (see categoryColors.js).
  const titles = expandedDomains.map(
    (domain) => domain.domainName || "Unknown",
  );
  const colors = assignCategoryColors(titles);
  const expandedCategories = expandedDomains.map((domain, i) => ({
    id: domain.domainName?.toLowerCase().replace(/\s+/g, "-") || "unknown",
    title: titles[i],
    color: colors[titles[i]],
    items: extractDomainItems(domain),
  }));

  return { phases, expandedCategories };
}
