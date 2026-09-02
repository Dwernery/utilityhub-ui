import { useEffect, useMemo, useState, useRef } from "react";
import { SAGAS } from "../utils/statConstants";
import { useMcuTracker } from "../context/McuTrackerContext";
import { useMcuTrackerData } from "../hooks/useMcuTrackerData";
import { useUpdateContentStatus } from "../hooks/useUpdateContentStatus";
import { useToast } from "../../../context/ToastContext";
import { normalizeTrackerData } from "../utils/normalizeTrackerData";
import { computeStats, nextStatus } from "../utils/stats";
import { SagaSection } from "../components/tracking/SagaSection";
import { McuDetailModal } from "../components/tracking/McuDetailModal";

const getDefaultExpandedSections = (phases, expandedCategories) => {
  return Object.fromEntries([
    ...SAGAS.map((s) => [`saga-${s.id}`, true]),
    ...phases.map((p) => [`phase-${p.num}`, true]),
    ...expandedCategories.map((c) => [c.id, true]),
  ]);
};

export const Tracker = () => {
  const { view, watched, hydrateWatched, toggleItem, toggleEpisode } =
    useMcuTracker();
  const { data, isPending, isError } = useMcuTrackerData();
  const { mutate: updateContentStatus } = useUpdateContentStatus();
  const addToast = useToast();
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
    return expandedCategories.map((category) => ({
      category,
      cards: [
        {
          key: category.id,
          label: category.title.toUpperCase(),
          color: category.color,
          items: category.items,
          stats: computeStats(category.items, watched),
        },
      ],
    }));
  }, [expandedCategories, watched]);

  // Initialize expandedSections as empty - effect will populate it on first data load
  const [expandedSections, setExpandedSections] = useState({});
  const hasInitializedRef = useRef(false);

  // Populate expanded sections only on first data load
  useEffect(() => {
    if (!hasInitializedRef.current && phases.length > 0) {
      const defaultExpandedSections = getDefaultExpandedSections(
        phases,
        expandedCategories,
      );
      setExpandedSections(defaultExpandedSections);
      hasInitializedRef.current = true;
    }
  }, [phases, expandedCategories]);

  useEffect(() => {
    if (data) hydrateWatched(data);
  }, [data, hydrateWatched]);

  // Wrapper for toggling movie/special status - API call then state update
  // Note: TV episodes are toggled individually from the modal only
  const handleToggleItem = (item) => {
    // Cycle through status: UNWATCHED -> IN_PROGRESS -> WATCHED -> UNWATCHED
    const currentStatus = watched[item.id] || "UNWATCHED";
    const newStatus = nextStatus(currentStatus);
    updateContentStatus(
      {
        globalId: item.id,
        status: newStatus,
      },
      {
        onSuccess: () => {
          toggleItem(item);
          addToast(`Status updated to ${newStatus}`, "success");
        },
        onError: (err) => {
          addToast("Failed to update status. Please try again.", "error");
        },
      },
    );
  };

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

  if (isPending) {
    return (
      <div className="max-w-7xl mx-auto pb-4 px-4 py-14 text-center">
        <p className="text-sm text-slate-400">Loading MCU tracker…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-7xl mx-auto pb-4 px-4 py-14 text-center">
        <p className="text-sm text-red-400">Failed to load MCU tracker data.</p>
      </div>
    );
  }

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
              subtitle={category.blurb}
              color={category.color}
              cards={cards}
              expandedSections={expandedSections}
              onToggleSection={toggleSection}
              watched={watched}
              onToggleItem={handleToggleItem}
              onSelectItem={handleSelectItem}
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
};
