import { useState } from "react";
import { EXPANDED, PHASES, SAGAS } from "../data";
import { useMcuTracker } from "../context/McuTrackerContext";
import { computeStats } from "../utils/stats";
import { SagaSection } from "../components/tracking/SagaSection";
import { EpisodeSheet } from "../components/tracking/EpisodeSheet";

const DEFAULT_EXPANDED_SECTIONS = Object.fromEntries([
  ...SAGAS.map((s) => [`saga-${s.id}`, true]),
  ...PHASES.map((p) => [`phase-${p.num}`, true]),
  ...EXPANDED.map((c) => [`saga-${c.id}`, true]),
  ...EXPANDED.map((c) => [c.id, true]),
]);

export const Tracker = () => {
  const { view, watched, toggleItem, toggleEpisode } = useMcuTracker();
  const [expandedSections, setExpandedSections] = useState(
    DEFAULT_EXPANDED_SECTIONS,
  );
  const [activeShow, setActiveShow] = useState(null);

  const toggleSection = (key) =>
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const openEpisodes = (item, color) => setActiveShow({ item, color });

  return (
    <div className="max-w-7xl mx-auto pb-4 px-4">
      {view === "phases" ? (
        <>
          {SAGAS.map((saga) => {
            const sagaPhases = saga.phaseNums.map((num) =>
              PHASES.find((p) => p.num === num),
            );
            const cards = sagaPhases.map((phase) => ({
              key: `phase-${phase.num}`,
              label: `PHASE ${phase.num}`,
              color: phase.color,
              items: phase.items,
              stats: computeStats(phase.items, watched),
            }));

            return (
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
                onOpenEpisodes={openEpisodes}
                onToggleItem={toggleItem}
              />
            );
          })}
        </>
      ) : (
        <>
          {EXPANDED.map((category) => {
            const cards = [
              {
                key: category.id,
                label: category.title.toUpperCase(),
                color: category.color,
                items: category.items,
                stats: computeStats(category.items, watched),
              },
            ];

            return (
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
                onOpenEpisodes={openEpisodes}
                onToggleItem={toggleItem}
              />
            );
          })}
        </>
      )}
      {activeShow && (
        <EpisodeSheet
          item={activeShow.item}
          color={activeShow.color}
          watched={watched}
          onToggleEpisode={(i) => toggleEpisode(activeShow.item.id, i)}
          onToggleAll={() => toggleItem(activeShow.item)}
          onClose={() => setActiveShow(null)}
        />
      )}
    </div>
  );
};
