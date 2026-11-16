import { Film, Sparkles, Tv } from "lucide-react";

// Status values - part of the WATCHED/IN_PROGRESS/UNWATCHED cycle
export const STATUS = {
  UNWATCHED: "UNWATCHED",
  IN_PROGRESS: "IN_PROGRESS",
  WATCHED: "WATCHED",
};

// Status labels for display to users
export const STATUS_LABELS = {
  [STATUS.UNWATCHED]: "Unwatched",
  [STATUS.IN_PROGRESS]: "In Progress",
  [STATUS.WATCHED]: "Watched",
};

// Modal header text
export const MODAL_TITLE = {
  movie: "Movie Details",
  tv: "Series Details",
};

// Modal action labels
export const MODAL_LABELS = {
  MARK_UNWATCHED: "Mark unwatched",
  MARK_WATCHED: "Mark watched",
  SEASON: "Season",
  EPS: "eps",
};

// View modes for tracker
export const VIEWS = [
  { key: "phases", label: "MCU Phases" },
  { key: "categories", label: "Expanded Universe" },
];

// Breakdown categories for stats display, shared across Header and HomeCard
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
];
