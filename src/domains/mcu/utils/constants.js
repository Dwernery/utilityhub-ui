import { Film, Sparkles, Tv } from "lucide-react";

// MCU tracker constants. Mirrors utility-hub-mobile's lib/mcu/utils/constants.ts
// (icons are lucide components here, SF Symbol names there).

export const TYPE_META = {
  movie: { icon: Film, label: "Movie" },
  special: { icon: Sparkles, label: "Special" },
  tv: { icon: Tv, label: "Series" },
};

/** Left-to-right progression (status pickers). */
export const WATCH_STATUSES = ["UNWATCHED", "IN_PROGRESS", "WATCHED"];

export const STATUS_LABELS = {
  UNWATCHED: "Unwatched",
  IN_PROGRESS: "In Progress",
  WATCHED: "Watched",
};

/** Detail modal header text. */
export const MODAL_TITLE = {
  movie: "Movie Details",
  tv: "Series Details",
};

export const MODAL_LABELS = {
  MARK_UNWATCHED: "Mark unwatched",
  MARK_WATCHED: "Mark watched",
  SEASON: "Season",
  EPS: "eps",
};

export const VIEWS = [
  { key: "phases", label: "MCU Phases" },
  { key: "categories", label: "Expanded Universe" },
];

/** Breakdown categories for stats display, shared by the tracker header and the Home card. */
export const BREAKDOWN = [
  { key: "movies", doneKey: "moviesDone", label: "Movies", icon: Film },
  {
    key: "specials",
    doneKey: "specialsDone",
    label: "Specials",
    icon: Sparkles,
  },
  { key: "episodes", doneKey: "episodesDone", label: "Episodes", icon: Tv },
];

/**
 * The MCU Phases view, in order. A saga with no phases in the data yet is hidden, so the
 * Mutant Saga appears once Phase 7 content is added. Its phase numbers are a guess; add
 * `years` once they're known.
 */
export const SAGAS = [
  {
    id: "infinity",
    title: "The Infinity Saga",
    years: "2008–2019",
    color: "#4C8DFF",
    phaseNums: [1, 2, 3],
  },
  {
    id: "multiverse",
    title: "The Multiverse Saga",
    years: "2021–2027",
    color: "#8B7CF6",
    phaseNums: [4, 5, 6],
  },
  {
    id: "mutant",
    title: "The Mutant Saga",
    color: "#2DD4BF",
    phaseNums: [7, 8, 9],
  },
];
