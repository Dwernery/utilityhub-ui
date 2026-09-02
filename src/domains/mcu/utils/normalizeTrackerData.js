function normalizeItem(source, type) {
  const id = source.globalId;

  if (type === "tv") {
    return (source.seasons ?? []).map((season, seasonIndex) => {
      // Use seasonNumber from API if available, otherwise use index + 1
      const seasonNumber = season.seasonNumber ?? seasonIndex + 1;
      return {
        id: `${id}-season${seasonNumber}`,
        globalId: id,
        type: "tv",
        title: source.title,
        seasonNumber: seasonNumber,
        premiereDate: season.premiereDate || source.premiereDate,
        synopsis: source.synopsis,
        s3Url: source.s3Url,
        episodes: (season.episodes ?? []).map((episode) => ({
          title: episode.title,
          globalId: episode.globalId,
          episodeNumber: episode.episodeNumber,
          runtime: episode.runtime,
        })),
      };
    });
  }

  // Movie or Special
  return {
    id,
    globalId: id,
    type: source.type === "SPECIAL" ? "special" : "movie",
    title: source.title,
    premiereDate: source.premiereDate,
    runtime: source.runtime,
    synopsis: source.synopsis,
    s3Url: source.s3Url,
  };
}

function extractDomainItems(domain) {
  const items = [];

  for (const movie of domain?.movies ?? []) {
    items.push(normalizeItem(movie, "movie"));
  }

  for (const show of domain?.shows ?? []) {
    // normalizeItem returns an array of items for TV (one per season)
    items.push(...normalizeItem(show, "tv"));
  }

  items.sort((a, b) => {
    const dateA = new Date(a.premiereDate);
    const dateB = new Date(b.premiereDate);
    return dateA - dateB;
  });
  return items.map((item) => {
    item.premiereDate = new Date(item.premiereDate).getFullYear();
    return item;
  });
}

export function normalizeTrackerData(apiData) {
  const domains = apiData?.domains ?? [];

  // Group domains by phase number
  const phaseMap = {};
  const expandedDomains = [];

  for (const domain of domains) {
    // Extract phase number from domainName (e.g., "Phase 1" -> 1)
    const phaseMatch = domain.domainName?.match(/Phase\s+(\d+)/i);
    const phaseNumber = phaseMatch ? parseInt(phaseMatch[1], 10) : null;

    if (phaseNumber) {
      if (!phaseMap[phaseNumber]) {
        phaseMap[phaseNumber] = {
          num: phaseNumber,
          color: domain.color || "#4C8DFF",
          items: [],
        };
      }
      phaseMap[phaseNumber].items.push(...extractDomainItems(domain));
    } else {
      expandedDomains.push(domain);
    }
  }

  const phases = Object.values(phaseMap).sort((a, b) => a.num - b.num);

  const expandedCategories = expandedDomains.map((domain) => ({
    id: domain.domainName?.toLowerCase().replace(/\s+/g, "-") || "unknown",
    title: domain.domainName || "Unknown",
    color: domain.color || "#B91C1C",
    blurb: domain.blurb || "",
    items: extractDomainItems(domain),
  }));

  return { phases, expandedCategories };
}
