import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

// TODO: replace with API-backed watched state once the MCU API exists.
const McuTrackerContext = createContext(null);

export function McuTrackerProvider({ children }) {
  const [view, setView] = useState("phases");
  const [watched, setWatched] = useState({});

  const toggleItem = useCallback(
    (item) => {
      setWatched((prev) => {
        const next = { ...prev };

        if (item.type === "tv") {
          const allWatched = item.episodes.every(
            (_, i) => prev[`${item.id}::e${i}`],
          );
          for (let i = 0; i < item.episodes.length; i++) {
            const key = `${item.id}::e${i}`;
            if (allWatched) delete next[key];
            else next[key] = true;
          }
          return next;
        }

        if (next[item.id]) delete next[item.id];
        else next[item.id] = true;
        return next;
      });
    },
    [setWatched],
  );

  const toggleEpisode = useCallback(
    (itemId, episodeIndex) => {
      setWatched((prev) => {
        const key = `${itemId}::e${episodeIndex}`;
        const next = { ...prev };
        if (next[key]) delete next[key];
        else next[key] = true;
        return next;
      });
    },
    [setWatched],
  );

  const value = useMemo(
    () => ({
      view,
      setView,
      watched,
      toggleItem,
      toggleEpisode,
    }),
    [view, watched, toggleItem, toggleEpisode],
  );

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
