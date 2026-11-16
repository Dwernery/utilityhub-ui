import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SAGAS } from "../utils/statConstants";
import { useMcuTracker } from "../context/McuTrackerContext";
import { useMcuTrackerData } from "../hooks";
import { useChangeStatus } from "../useChangeStatus";
import { normalizeTrackerData } from "../utils/normalizeTrackerData";
import { computeStats, nextStatus, combineStats } from "../utils/stats";
import { SagaSection } from "../components/tracking/SagaSection";
import { McuDetailModal } from "../components/tracking/McuDetailModal";
import { LoadingState } from "../../../components/LoadingState";
import { LoadError } from "../../../components/LoadError";

const getDefaultExpandedSections = (phases, expandedCategories, watched) => {
  return Object.fromEntries([
    // Sagas: open if any phase within it has unwatched content
    ...SAGAS.map((saga) => {
      const sagaPhases = saga.phaseNums
        .map((num) => phases.find((p) => p.num === num))
        .filter(Boolean);
      const sagaStats = combineStats(
        sagaPhases.map((phase) => computeStats(phase.items, watched)),
      );
      const sagaFullyWatched = sagaStats.done === sagaStats.total;
      return [`saga-${saga.id}`, !sagaFullyWatched];
    }),
    // Phases: open if they have unwatched content
    ...phases.map((p) => {
      const stats = computeStats(p.items, watched);
      const fullyWatched = stats.done === stats.total;
      return [`phase-${p.num}`, !fullyWatched];
    }),
    // Categories: open if they have unwatched content
    ...expandedCategories.map((c) => {
      const stats = computeStats(c.items, watched);
      const fullyWatched = stats.done === stats.total;
      return [`saga-${c.id}`, !fullyWatched];
    }),
  ]);
};

export function Tracker() {
  const { view } = useMcuTracker();
  const { data, isPending, isLoadingError, error, refetch, isFetching } =
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
  return <TrackerBody data={data} view={view} />;
}

function TrackerBody({ data, view }) {
  const { watched } = useMcuTracker();
  const { change } = useChangeStatus();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemColor, setSelectedItemColor] = useState("#3b82f6");

  const { phases, expandedCategories } = useMemo(
    () => normalizeTrackerData(data),
    [data],
  );

  // Memoize saga section building to avoid rebuilding cards on every render
  const sagaSections = useMemo(() => {
    return SAGAS.map((saga) => {
      const sagaPhases = saga.phaseNums
        .map((num) => phases.find((p) => p.num === num))
        .filter(Boolean);
      return {
        saga,
        cards: sagaPhases.map((phase) => ({
          key: `phase-${phase.num}`,
          label: `PHASE ${phase.num}`,
          color: phase.color,
          items: phase.items,
          stats: computeStats(phase.items, watched),
        })),
      };
    });
  }, [phases, watched]);

  // Memoize category section building
  const categorySections = useMemo(() => {
    return expandedCategories.map((category) => {
      const categoryStats = computeStats(category.items, watched);
      const metricsSubtitle = `${categoryStats.movies} movies · ${categoryStats.episodes} episodes · ${categoryStats.specials} specials`;
      const fullSubtitle = category.blurb
        ? `${category.blurb} · ${metricsSubtitle}`
        : metricsSubtitle;

      return {
        category: { ...category, enhancedSubtitle: fullSubtitle },
        cards: [
          {
            key: category.id,
            label: category.title.toUpperCase(),
            color: category.color,
            items: category.items,
            stats: categoryStats,
          },
        ],
      };
    });
  }, [expandedCategories, watched]);

  // Unfinished sections start open. Computed once, so marking something watched
  // doesn't re-open sections you collapsed.
  const [expandedSections, setExpandedSections] = useState(() =>
    getDefaultExpandedSections(phases, expandedCategories, watched),
  );

  // Posters cycle UNWATCHED → IN_PROGRESS → WATCHED. (TV posters open the
  // detail modal instead, where episodes are changed one at a time.)
  const handleToggleItem = (item) =>
    change(item.id, nextStatus(watched[item.id]));

  const toggleSection = (key) =>
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSelectItem = (item, color) => {
    setSelectedItem(item);
    setSelectedItemColor(color);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div className="max-w-7xl mx-auto pb-4 px-4">
      {view === "phases" ? (
        <>
          {sagaSections.map(({ saga, cards }) => (
            <SagaSection
              key={saga.id}
              sagaKey={`saga-${saga.id}`}
              title={saga.title}
              subtitle={`${saga.years} · Phases ${saga.phaseNums.join("–")}`}
              color={saga.color}
              cards={cards}
              expandedSections={expandedSections}
              onToggleSection={toggleSection}
              watched={watched}
              onToggleItem={handleToggleItem}
              onSelectItem={handleSelectItem}
            />
          ))}
        </>
      ) : view === "categories" ? (
        <>
          {categorySections.map(({ category, cards }) => (
            <SagaSection
              key={category.id}
              sagaKey={`saga-${category.id}`}
              title={category.title}
              subtitle={category.enhancedSubtitle}
              color={category.color}
              cards={cards}
              expandedSections={expandedSections}
              onToggleSection={toggleSection}
              watched={watched}
              onToggleItem={handleToggleItem}
              onSelectItem={handleSelectItem}
              isCategory={true}
            />
          ))}
        </>
      ) : null}
      <McuDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        selectedItem={selectedItem}
        selectedItemColor={selectedItemColor}
      />
    </div>
  );
}
