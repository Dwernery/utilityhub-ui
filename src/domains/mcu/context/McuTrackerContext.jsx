import {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { getStatus, nextStatus } from "../utils/stats";
import { useMcuTrackerData } from "../hooks/useMcuTrackerData";

const McuTrackerContext = createContext(null);

function normalizeStatus(status) {
  return status === "WATCHED" || status === "IN_PROGRESS"
    ? status
    : "UNWATCHED";
}

function extractStatusFromDomains(domains) {
  const status = {};

  if (!Array.isArray(domains)) {
    console.warn("Invalid domains format: expected array, got", typeof domains);
    return { status };
  }

  for (const domain of domains) {
    if (!domain) continue;

    // Movies and specials use globalId as key
    if (Array.isArray(domain.movies)) {
      for (const movie of domain.movies) {
        if (movie?.globalId) {
          status[movie.globalId] = normalizeStatus(movie.status);
        }
      }
    }

    // TV episodes use their globalId as key (no need for composite keys)
    if (Array.isArray(domain.shows)) {
      for (const show of domain.shows) {
        if (!show || !Array.isArray(show.seasons)) continue;
        for (const season of show.seasons) {
          if (!season || !Array.isArray(season.episodes)) continue;
          for (const episode of season.episodes) {
            if (episode?.globalId) {
              status[episode.globalId] = normalizeStatus(episode.status);
            }
          }
        }
      }
    }
  }

  return { status };
}

export function McuTrackerProvider({ children }) {
  const [view, setView] = useState("phases");
  const [watched, setWatched] = useState({});
  const { data } = useMcuTrackerData();
  const hasHydrated = useRef(false);

  // Builds and seeds status from raw API domains without clobbering local edits
  const hydrateWatched = useCallback((apiData) => {
    const { status: initialStatus } = extractStatusFromDomains(
      apiData?.domains ?? [],
    );
    setWatched((prev) => ({ ...initialStatus, ...prev }));
  }, []);

  // Auto-hydrate when MCU data is fetched (only once)
  useEffect(() => {
    if (data && !hasHydrated.current) {
      hasHydrated.current = true;
      hydrateWatched(data);
    }
  }, [data, hydrateWatched]);

  const toggleItem = useCallback((item) => {
    setWatched((prev) => {
      const next = { ...prev };

      if (item.type === "tv") {
        // For TV shows, toggle all episodes using their globalIds
        const allWatched = item.episodes.every(
          (episode) => getStatus(prev, episode.globalId) === "WATCHED",
        );
        const target = allWatched ? "UNWATCHED" : "WATCHED";
        for (const episode of item.episodes) {
          next[episode.globalId] = target;
        }
        return next;
      }

      // For movies/specials, cycle through statuses
      next[item.id] = nextStatus(prev[item.id]);
      return next;
    });
  }, []);

  const toggleEpisode = useCallback((episodeGlobalId) => {
    setWatched((prev) => {
      return { ...prev, [episodeGlobalId]: nextStatus(prev[episodeGlobalId]) };
    });
  }, []);

  const value = {
    view,
    setView,
    watched,
    setWatched,
    hydrateWatched,
    toggleItem,
    toggleEpisode,
  };

  return (
    <McuTrackerContext.Provider value={value}>
      {children}
    </McuTrackerContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMcuTracker() {
  const ctx = useContext(McuTrackerContext);
  if (!ctx)
    throw new Error("useMcuTracker must be used within a McuTrackerProvider");
  return ctx;
}
