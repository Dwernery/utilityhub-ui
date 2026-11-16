import { createContext, useContext, useMemo, useState } from "react";
import { buildWatchedMap } from "../utils/watchedMap";
import { useMcuTrackerData } from "../hooks";

const McuTrackerContext = createContext(null);

const isView = (v) => v === "phases" || v === "categories";

// A ?view= deep link picks the initial view; the Tracker keeps the URL in sync after that.
const initialView = () => {
  const fromUrl = new URLSearchParams(window.location.search).get("view");
  return isView(fromUrl) ? fromUrl : "phases";
};

/**
 * `view` is UI state. `watched` ({ [globalId]: status }) is server state,
 * derived from the query cache on every change and never kept as a separate
 * copy, so a refetch, a status change, or coming back to the tab after editing
 * on the phone all show up here. Mirrors utility-hub-mobile's lib/mcu/context.tsx.
 */
export function McuTrackerProvider({ children }) {
  const [view, setView] = useState(initialView);
  const { data } = useMcuTrackerData();
  const watched = useMemo(() => buildWatchedMap(data), [data]);
  const value = useMemo(() => ({ view, setView, watched }), [view, watched]);

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
