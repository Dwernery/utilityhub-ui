import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import { VIEWS } from "../utils/constants";
import { useMcuTracker } from "../context/McuTrackerContext";
import { useMcuTrackerData } from "../hooks";
import { useChangeStatus } from "../useChangeStatus";
import { toggleWatched } from "../utils/stats";
import {
  categorySections,
  defaultExpanded,
  findItem,
  sagaSections,
  searchItems,
  unfinishedOnly,
} from "../utils/sections";
import { SagaSection } from "../components/tracking/SagaSection";
import { PosterCard } from "../components/tracking/PosterCard";
import { SegmentedToggle } from "../components/SegmentedToggle";
import { McuDetailModal } from "../components/tracking/McuDetailModal";
import { LoadingState } from "../../../components/LoadingState";
import { LoadError } from "../../../components/LoadError";

const VIEW_OPTIONS = VIEWS.map(({ key, label }) => ({ value: key, label }));

const FILTERS = [
  { value: "all", label: "All Titles" },
  { value: "unfinished", label: "Not Finished" },
];

export function Tracker() {
  const { view } = useMcuTracker();
  const { isPending, isLoadingError, error, refetch, isFetching } =
    useMcuTrackerData();
  const [, setSearchParams] = useSearchParams();

  // Keep ?view= in the URL in step with the toggle (the initial view is read
  // from the URL by McuTrackerProvider).
  useEffect(() => {
    setSearchParams({ view }, { replace: true });
  }, [view, setSearchParams]);

  if (isPending) return <LoadingState what="MCU tracker" dark />;
  if (isLoadingError) {
    return (
      <LoadError
        what="MCU tracker"
        error={error}
        onRetry={() => refetch()}
        retrying={isFetching}
        dark
      />
    );
  }

  // Mounts once data exists, so its default expansion is computed exactly once.
  return <TrackerBody view={view} />;
}

function TrackerBody({ view }) {
  const {
    watched,
    phases,
    expandedCategories,
    selectedId,
    setSelectedId,
    setView,
  } = useMcuTracker();
  const { change } = useChangeStatus();

  // Looked up on every render, so edits show up in the open modal, and a
  // deleted item closes it.
  const selected = useMemo(
    () => findItem(phases, expandedCategories, selectedId),
    [phases, expandedCategories, selectedId],
  );

  const sagas = useMemo(() => sagaSections(phases, watched), [phases, watched]);
  const categories = useMemo(
    () => categorySections(expandedCategories, watched),
    [expandedCategories, watched],
  );
  const sections = view === "phases" ? sagas : categories;

  // Unfinished sections start open. Computed once, so marking something watched
  // doesn't re-open sections you collapsed.
  const [expandedSections, setExpandedSections] = useState(() => ({
    ...defaultExpanded(sagas),
    ...defaultExpanded(categories),
  }));
  const toggleSection = (key) =>
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));

  // One click toggles watched; In Progress is set from the detail modal, so a
  // stray click can't reset a finished movie. (TV posters open the modal instead.)
  const handleToggleItem = (item) =>
    change(item.id, toggleWatched(watched[item.id]));

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const unfinished = filter === "unfinished";
  const searching = search.trim() !== "";

  // Search spans both views, so a show isn't "missing" because it's in the other one.
  // Every match, whatever the filter: both toggles are off while searching.
  const results = useMemo(
    () => searchItems(phases, expandedCategories, search),
    [phases, expandedCategories, search],
  );

  // "Not Finished" hides watched titles and empty cards/sections; percentages don't change.
  const shown = useMemo(
    () => (unfinished ? unfinishedOnly(sections, watched) : sections),
    [unfinished, sections, watched],
  );

  const handleSelectItem = (item) => setSelectedId(item.globalId);
  const handleCloseModal = () => setSelectedId(null);

  return (
    <div className="max-w-7xl mx-auto pb-4 px-4">
      {/* What you're looking at, in one row: search, view, filter. Stacked on phones,
          where the toggles fill the width like the iPhone app's segmented controls.
          While searching, both toggles are turned off (results are every match in both views), as on iPhone. */}
      <div className="flex flex-col md:flex-row gap-2 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="search"
            placeholder="Search titles and episodes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && setSearch("")}
            aria-label="Search titles and episodes"
            className="w-full pl-9 pr-9 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500 [&::-webkit-search-cancel-button]:hidden"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <SegmentedToggle
          options={VIEW_OPTIONS}
          value={view}
          onChange={setView}
          label="Tracker view"
          stretch
          className="w-full md:w-fit"
          disabled={searching}
          title={searching ? "Search covers both views" : undefined}
        />
        <SegmentedToggle
          options={FILTERS}
          value={filter}
          onChange={setFilter}
          label="Show"
          stretch
          className="w-full md:w-fit"
          disabled={searching}
          title={searching ? "Search shows every match" : undefined}
        />
      </div>

      {searching ? (
        <>
          <div className="text-xs text-slate-400 mb-2 tabular-nums">
            {results.length} {results.length === 1 ? "result" : "results"}
          </div>
          {results.length > 0 ? (
            <div className="flex flex-wrap gap-2.5 py-1">
              {results.map(({ item, color }) => (
                <PosterCard
                  key={item.globalId}
                  item={item}
                  color={color}
                  watched={watched}
                  onToggleItem={() => handleToggleItem(item)}
                  onSelectItem={handleSelectItem}
                  showTitle
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-12">
              No titles match “{search.trim()}”.
            </p>
          )}
        </>
      ) : (
        shown.map((section) => (
          <SagaSection
            key={section.key}
            section={section}
            expandedSections={expandedSections}
            onToggleSection={toggleSection}
            watched={watched}
            onToggleItem={handleToggleItem}
            onSelectItem={handleSelectItem}
          />
        ))
      )}
      {!searching && shown.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-12">
          {unfinished && sections.length > 0
            ? "All caught up. Everything here is watched."
            : "Nothing here yet."}
        </p>
      )}
      <McuDetailModal
        key={selectedId ?? "none"}
        isOpen={!!selected}
        onClose={handleCloseModal}
        onSelect={setSelectedId}
        selectedItem={selected?.item}
        selectedItemColor={selected?.color}
      />
    </div>
  );
}
